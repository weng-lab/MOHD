"use client";
import { useMemo, useState } from "react";
import { Site, Status, Sex, Protocol } from "@/common/types/globalTypes";
import OmeDownloadsControls from "@/common/components/OmeDownloadsControls";
import { Stack } from "@mui/system";

type FilterFields = {
  site: Site;
  status: Status;
  sex: Sex;
  protocol?: string;
};

export type OmeDownloadLayoutProps<T> = {
  rows: T[];
  descriptions?: string[];
  includeProtocolFilter?: boolean;
  getFilterFields: (row: T) => FilterFields;
  renderTable: (rows: T[]) => React.ReactNode;
};

const OmeDownloadLayout = <T,>({
  rows,
  descriptions = [],
  includeProtocolFilter = false,
  getFilterFields,
  renderTable,
}: OmeDownloadLayoutProps<T>) => {
  const [site, setSite] = useState<Site[]>(["CCH", "CKD", "EXP", "MOM", "UIC"]);
  const [status, setStatus] = useState<Status[]>(["case", "control", "unknown"]);
  const [sex, setSex] = useState<Sex[]>(["male", "female"]);
  const [protocol, setProtocol] = useState<Protocol[]>(["Buffy Coat", "OPC", "CPT"]);
  const [description, setDescription] = useState<string[]>(descriptions);

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
      />

      {renderTable(filteredRows)}
    </Stack>
  );
};

export default OmeDownloadLayout;