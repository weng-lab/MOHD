"use client";
import { type ReactNode, useMemo, useState } from "react";
import { Site, Status, Sex, Protocol } from "@/common/types/globalTypes";
import OmeDownloadsControls from "@/common/components/Downloads/OmeDownloadsControls";
import { Stack } from "@mui/system";
import { DownloadFile } from "@/common/hooks/useOmeDownloadFiles";

type FilterFields = {
  site: Site;
  status: Status;
  sex: Sex;
  protocol?: string;
};

export type OmeDownloadLayoutProps<T extends { sample_id: string }> = {
  rows: T[];
  descriptions?: string[];
  downloadFiles: DownloadFile[];
  /**
   * This also feels unnecessary, can't we just check the existance of `.protocol`?
   */
  includeProtocolFilter?: boolean;
  /**
   * This feels unnecessary to have right now, since all of the rows take the same shape, just sometimes protocol doesn't exist. We can just check for existance of `.protocol`. Also name confuses me, it's getting values not fields
   */
  getFilterFields: (row: T) => FilterFields;
  renderTable: (rows: T[], files: DownloadFile[]) => ReactNode;
};

const OmeDownloadLayout = <T extends { sample_id: string }>({
  rows,
  descriptions = [],
  downloadFiles,
  includeProtocolFilter = false,
  getFilterFields,
  renderTable,
}: OmeDownloadLayoutProps<T>) => {
  const [site, setSite] = useState<Site[]>(["CCH", "CKD", "EXP", "MOM", "UIC"]);
  const [status, setStatus] = useState<Status[]>(["case", "control", "unknown"]);
  const [sex, setSex] = useState<Sex[]>(["male", "female"]);
  const [protocol, setProtocol] = useState<Protocol[]>(["Buffy Coat", "OPC", "CPT"]);
  const [description, setDescription] = useState<string[]>(descriptions);

  //filter rows based on toggle button groups in header
  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const f = getFilterFields(row);

      return (
        site.includes(f.site) &&
        status.includes(f.status) &&
        sex.includes(f.sex) &&
        (!includeProtocolFilter ||
          (f.protocol &&
            protocol.includes(f.protocol as Protocol)))
      );
    });
  }, [rows, site, status, sex, protocol, includeProtocolFilter, getFilterFields]);

  // Sample IDs that pass the row-level filters — used to scope bulk downloads
  const filteredSampleIds = useMemo(() => {
    return new Set(filteredRows.map((row) => row.sample_id));
  }, [filteredRows]);

  const filteredDownloadFiles = useMemo(() => {
    return downloadFiles.filter((file) => {
      //dont filter out anvil files or compressed files
      if (!file.open_access || file.file_type === "Compressed Tar File") return true;
      return description.includes(file.file_type);
    });
  }, [downloadFiles, description]);

  /**
   * Why do we have separate rows and downloadFiles?
   * description filter applied against downloadFiles while rest are on rows due to them being separate at this point. Combined would be simpler filter
   * Wait so we're filtering the rows and then creating a set of filtered IDs to check against downloadfiles?
   */

  return (
    <Stack direction="column" spacing={2}>
      <OmeDownloadsControls
        site={site}
        status={status}
        sex={sex}
        protocol={includeProtocolFilter ? protocol : undefined}
        description={description}
        descriptions={descriptions}
        setSite={setSite}
        setStatus={setStatus}
        setSex={setSex}
        setProtocol={setProtocol}
        setDescription={setDescription}
        files={filteredDownloadFiles}
        filteredSampleIds={filteredSampleIds}
      />
      {renderTable(filteredRows, filteredDownloadFiles)}
    </Stack>
  );
};

export default OmeDownloadLayout;