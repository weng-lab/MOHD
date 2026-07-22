import { BulkDownloadFormat } from "@/common/hooks/useBulkDownloadJob";

export type CommandPlatform = "unix" | "windows";

/**
 * One copyable line. A plan carries several only where they must not be pasted
 * as a block — the inspect-first script flow would otherwise run the script in
 * the same paste that downloads it, which is the thing it exists to avoid.
 */
export type CommandStep = {
  command: string;
  /** Shown above the command; explains what this step is for. */
  caption?: string;
};

export type CommandPlan = {
  steps: CommandStep[];
  /**
   * A second, equivalent route on the same platform — Git Bash beside WSL.
   * Kept apart from `steps` because these are a choice, not a sequence: running
   * both would download everything twice.
   */
  alternative?: { label: string; steps: CommandStep[] };
  /** Set when the platform cannot run this job's format natively. */
  note?: string;
};

/**
 * The Windows label names the shell, not just the OS: these commands use
 * `mkdir -Force`, `Out-Null` and `if ($?)`, none of which cmd.exe understands.
 */
export const PLATFORM_LABELS: Record<CommandPlatform, string> = {
  unix: "Linux & macOS",
  windows: "Windows PowerShell",
};

export const FORMAT_DESCRIPTIONS: Record<BulkDownloadFormat, string> = {
  zip: "ZIP archive",
  tarball: "tar.gz archive",
  script: "shell script",
};

const EXTENSIONS: Record<BulkDownloadFormat, string> = {
  zip: ".zip",
  tarball: ".tar.gz",
  script: ".sh",
};

/** Matches on "Windows" rather than "win" — "Darwin" contains the latter. */
export function detectPlatform(): CommandPlatform {
  if (typeof navigator === "undefined") return "unix";
  return /windows/i.test(navigator.userAgent) ? "windows" : "unix";
}

/**
 * The artifact's filename. The service sends it on every finished job, and its
 * shape (<ome>-<token><ext>, base62 and dashes) is safe to drop into a shell
 * unescaped. The fallback covers jobs already in localStorage from before the
 * field was populated: download_url is always <archive base>/<filename>, so the
 * last path segment is the same string rather than a guess at it.
 */
export function artifactName(
  format: BulkDownloadFormat,
  url: string,
  filename?: string,
): string {
  if (filename) return filename;
  const lastSegment = url.split("?")[0].split("/").pop();
  return lastSegment || `download${EXTENSIONS[format]}`;
}

/** The archive name minus its extension — used as the extraction directory. */
function extractionDir(filename: string, format: BulkDownloadFormat): string {
  const ext = EXTENSIONS[format];
  return filename.endsWith(ext) ? filename.slice(0, -ext.length) : filename;
}

const quote = (value: string) => `"${value}"`;

export function buildCommandPlan(args: {
  format: BulkDownloadFormat;
  url: string;
  filename: string;
  platform: CommandPlatform;
  /** Script jobs only: split the one-liner so the script can be read before it runs. */
  inspectFirst?: boolean;
}): CommandPlan {
  const { format, url, filename, platform, inspectFirst = false } = args;
  const dir = extractionDir(filename, format);

  if (format === "script") {
    // The script reads DOWNLOAD_ROOT from its environment, so pointing it at the
    // artifact's own name lands files in ./<name>/ exactly as the archive
    // commands do. Left at the script's "mohd_data" default, two script
    // downloads would silently merge into one directory.
    const root = `DOWNLOAD_ROOT=${quote(dir)}`;

    // Git Bash is a real bash and ships its own curl, so it runs these unchanged
    // — which is why the Windows tab offers them verbatim as its alternative
    // rather than building a third variant.
    const bashSteps: CommandStep[] = inspectFirst
      ? [
          {
            command: `curl -fsSL ${quote(url)} -o ${quote(filename)}`,
            caption: "Download the script",
          },
          {
            command: `${root} bash ${quote(filename)}`,
            caption: `Run the script with bash; files land in ./${dir}`,
          },
        ]
      : [
          {
            command: `curl -fsSL ${quote(url)} | ${root} bash`,
            caption: `Download and run the script; files land in ./${dir}`,
          },
        ];

    if (platform === "windows") {
      // The `wsl` prefix is not about locating a bash — a machine with WSL
      // usually has one on PATH already. It is that the command is POSIX and
      // PowerShell cannot parse it: an assignment ahead of a command reads as a
      // command named `DOWNLOAD_ROOT=…`, and piping between two native programs
      // under Windows PowerShell 5.1 rejoins the script's lines with CRLF, which
      // bash answers with `$'\r': command not found`. Running the whole thing
      // inside `wsl bash -c '…'` keeps PowerShell away from both. So this is not
      // interchangeable with a bare `bash …`, which would need PowerShell's own
      // `$env:DOWNLOAD_ROOT=…;` form instead.
      //
      // The assignment must sit inside the -c string for the same reason `wsl
      // VAR=x cmd` fails: a leading assignment is shell syntax, not something
      // exec understands, so WSL would hunt for a binary named "VAR=x".
      //
      // Only the run step needs WSL. The download step uses native curl.exe, so
      // the script can still be fetched and read on a machine where WSL is not
      // set up yet — exactly when someone wants to look before installing.
      const wslSteps: CommandStep[] = inspectFirst
        ? [
            {
              command: `curl.exe -fsSL ${quote(url)} -o ${quote(filename)}`,
              caption: "Download the script",
            },
            {
              command: `wsl bash -c '${root} bash ${quote(filename)}'`,
              caption: `Run the script under WSL; files land in ./${dir}`,
            },
          ]
        : [
            {
              command: `wsl bash -c 'curl -fsSL ${quote(url)} | ${root} bash'`,
              caption: `Download and run the script under WSL; files land in ./${dir}`,
            },
          ];

      return {
        steps: wslSteps,
        alternative: { label: "Or from a Git Bash prompt", steps: bashSteps },
        note: "Running a shell script in PowerShell requires WSL or Git Bash",
      };
    }

    return { steps: bashSteps };
  }

  // The archive is deleted once extracted, so a multi-gigabyte selection does
  // not sit on disk twice. Both forms delete only on a successful extraction:
  // `&&` gives that for free, but PowerShell's `;` is unconditional — hence the
  // `if ($?)` guard, without which a failed extraction would bin the archive and
  // force a re-download of up to the full 20 GB limit. A failed *download*
  // short-circuits either form, leaving the partial file for `curl -C -`.
  const caption = `Downloads and extracts into ./${dir}, then removes the archive`;

  if (platform === "windows") {
    // Windows ships bsdtar, which reads zip as well as tar.gz — so one tool
    // covers both formats and Expand-Archive stays out of it, being markedly
    // slower on large archives under Windows PowerShell 5.1.
    //
    // -z names the gzip filter, so it is passed for tar.gz and withheld for
    // zip. bsdtar sniffs the format and tolerates -z on a zip regardless, but
    // the flag would then describe compression the file does not have — and
    // that leniency is bsdtar's own, not something GNU tar shares should the
    // command get carried to a Linux shell.
    const extract = format === "tarball" ? "-xzf" : "-xf";
    return {
      steps: [
        {
          command: `curl.exe -fL ${quote(url)} -o ${quote(filename)}; mkdir -Force ${quote(dir)} | Out-Null; tar ${extract} ${quote(filename)} -C ${quote(dir)}; if ($?) { Remove-Item ${quote(filename)} }`,
          caption,
        },
      ],
    };
  }

  // unzip creates the destination itself; tar requires it to exist already.
  return {
    steps: [
      {
        command:
          format === "zip"
            ? `curl -fL ${quote(url)} -o ${quote(filename)} && unzip ${quote(filename)} -d ${quote(dir)} && rm ${quote(filename)}`
            : `curl -fL ${quote(url)} -o ${quote(filename)} && mkdir -p ${quote(dir)} && tar -xzf ${quote(filename)} -C ${quote(dir)} && rm ${quote(filename)}`,
        caption,
      },
    ],
  };
}
