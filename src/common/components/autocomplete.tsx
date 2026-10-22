"use client";
import { GenomeSearch, GenomeSearchProps, Result, StaticListOption } from "@weng-lab/ui-components";
import { useRouter } from "next/navigation";
import { useState } from "react";
import SearchResultDialog from "./SearchResultDialog";
import { getOmeInfoHref } from "@/app/omes/omeContent";
import { OmesDataType } from "@/common/types/globalTypes";
import { genomeBrowserHref, padGeneRegion } from "@/common/components/GenomeBrowser/regionParam";

export type AutoCompleteProps = Partial<GenomeSearchProps> & {
  closeDrawer?: () => void;
};

const defaultHumanResults: Result[] = [
  {
    title: "chr19:44,905,754-44,909,393",
    domain: {
      chromosome: "chr19",
      start: 44905754,
      end: 44909393,
    },
    description: "chr19:44,905,754-44,909,393",
    type: "Coordinate",
  },
  {
    title: "SP1",
    description: "Sp1 Transcription Factor\nENSG00000185591.10\nchr12:53380176-53416446",
    domain: {
      chromosome: "chr12",
      start: 53380176,
      end: 53416446,
    },
    type: "Gene",
  },
  {
    title: "EH38E3314260",
    description: "chr19:50417519-50417853",
    domain: {
      chromosome: "chr19",
      start: 50417519,
      end: 50417853,
    },
    type: "cCRE",
  },
  {
    title: "rs9466027",
    description: "chr6:21298226-21298227",
    domain: {
      chromosome: "chr6",
      start: 21298226,
      end: 21298227,
    },
    type: "SNP",
  },
  {
    title: "Astrocytoma",
    description: "Foss-Skiftesvik J (GCST90296476)\nCancer\nBiosample Enrichment",
    id: "36810956-GCST90296476-astrocytoma",
    type: "Study",
  },
  {
    title: "RNA",
    description: "RNA-seq",
    id: "RNA",
    type: "Ome",
  },
  {
    title: "WGBS",
    description: "Whole Genome Bisulfite Sequencing",
    id: "WGBS",
    type: "Ome",
  },
  {
    title: "Metabolomics",
    id: "metabolomics",
    type: "Ome",
  },
];

function makeResultLink(result: Result) {
  let url = "";
  const base = "https://screen.wenglab.org/GRCh38";
  switch (result.type) {
    case "Gene":
      url = `${base}/gene/${result.title}`;
      break;
    case "cCRE":
      url = `${base}/ccre/${result.title}`;
      break;
    case "Coordinate":
      url = `${base}/region/${result.domain?.chromosome}:${result.domain?.start}-${result.domain?.end}`;
      break;
    case "SNP":
      url = `${base}/variant/${result.title}`;
      break;
    case "Study":
      url = `${base}/gwas/${result.id}`;
      break;
    case "Legacy cCRE":
      url = `https://screen.wenglab.org/search?q=${result.title}&assembly=GRCh38`;
      break;
    case "Ome":
      url = getOmeInfoHref(result.id as OmesDataType);
  }
  return url;
}

/** Where a result opens in MOHD's genome browser, or null when it doesn't. Only genes, for now. */
function makeGenomeBrowserLink(result: Result) {
  return result.type === "Gene" && result.domain ? genomeBrowserHref(padGeneRegion(result.domain)) : null;
}

/**
 * Redirects the user to the a new page based on the search result
 * @param props - The props for the GenomeSearch component
 */
export default function AutoComplete({ closeDrawer, ...props }: AutoCompleteProps) {
  const router = useRouter();
  // Kept after the dialog closes, so its contents don't empty out while it fades away.
  const [pendingResult, setPendingResult] = useState<Result | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const genomeBrowserLink = pendingResult && makeGenomeBrowserLink(pendingResult);

  const handleSearchSubmit = (r: Result) => {
    const link = makeResultLink(r);
    //needed to trigger closing the mobile menu drawer
    if (closeDrawer) {
      closeDrawer();
    }
    if (r.type !== "Ome") {
      setPendingResult(r);
      setDialogOpen(true);
    } else {
      router.push(link, { scroll: false });
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleOpenInScreen = () => {
    if (!pendingResult) {
      return;
    }

    window.open(makeResultLink(pendingResult), "_blank", "noopener,noreferrer");
    handleCloseDialog();
  };

  const handleOpenInGenomeBrowser = () => {
    if (!genomeBrowserLink) {
      return;
    }

    router.push(genomeBrowserLink);
    handleCloseDialog();
  };

  const geneVersion = [29, 40];

  const Omes: StaticListOption[] = [
    {
      label: "WGS",
      value: "WGS",
      keywords: ["whole genome sequencing", "genome sequencing", "genomics"],
      description: "Whole Genome Sequencing",
    },
    {
      label: "WGBS",
      value: "WGBS",
      keywords: ["whole genome bisulfite sequencing", "epigenomics", "methylation"],
      description: "Whole Genome Bisulfite Sequencing",
    },
    {
      label: "ATAC",
      value: "ATAC",
      keywords: ["chromatin accessibility", "atac-seq"],
      description: "ATAC-seq",
    },
    {
      label: "RNA",
      value: "RNA",
      keywords: ["rna-seq", "transcriptomics", "gene expression"],
      description: "RNA-seq",
    },
    {
      label: "Metabolomics",
      value: "metabolomics",
    },
    {
      label: "Lipidomics",
      value: "lipidomics",
    },
    {
      label: "Metallomics",
      value: "metallomics",
    },
    {
      label: "Exposomics",
      value: "exposomics",
    },
  ];

  return (
    <>
      <GenomeSearch
        assembly={"GRCh38"}
        geneVersion={geneVersion}
        graphqlUrl="/api/screen-graphql"
        showiCREFlag={false}
        queries={["Ome", "Gene", "cCRE", "SNP", "Coordinate", "Study", "Legacy cCRE"]}
        staticLists={{ Ome: Omes }}
        onSearchSubmit={handleSearchSubmit}
        //This is needed to prevent the enter key press from triggering the onClick of the Menu IconButton
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
          }
        }}
        slotProps={{
          paper: {
            elevation: 1,
          },
        }}
        defaultResults={defaultHumanResults}
        openOnFocus
        {...props}
      />
      <SearchResultDialog
        open={dialogOpen}
        result={pendingResult}
        onClose={handleCloseDialog}
        onOpenInScreen={handleOpenInScreen}
        onOpenInGenomeBrowser={genomeBrowserLink ? handleOpenInGenomeBrowser : undefined}
      />
    </>
  );
}
