"use client";
import { useMemo, useState } from "react";
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

export type OmeDownloadLayoutProps<T> = {
  rows: T[];
  descriptions?: string[];
  downloadFiles: DownloadFile[];
  includeProtocolFilter?: boolean;
  getFilterFields: (row: T) => FilterFields;
  renderTable: (rows: T[], files: DownloadFile[]) => React.ReactNode;
};

const OmeDownloadLayout = <T,>({
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

  const filteredDownloadFiles = useMemo(() => {
    return downloadFiles.filter((file) => {
      //dont filter out anvil files or compressed files
      if (!file.open_access || file.file_type === "Compressed Tar File") return true;
      return description.includes(file.file_type);
    });
  }, [downloadFiles, description]);

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
      />
      {renderTable(filteredRows, filteredDownloadFiles)}
    </Stack>
  );
};

export default OmeDownloadLayout;