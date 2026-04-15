import { OmeEnum } from "./types/generated/graphql";

export const buildBulkFilePath = (sampleId: string, filename: string, ome: OmeEnum): string => {
  const index = ome === OmeEnum.AtacSeq ? 2 : ome === OmeEnum.RnaSeq ? 3 : 1;
  const folder = `${index}_${ome.replace("_SEQ", "")}`;
  return `${folder}/${sampleId}/${filename}`;
};

export const formatBytes = (bytes?: number): string => {
  if (!bytes) return "";

  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = bytes;
  let i = 0;

  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }

  return `${value.toFixed(1)} ${units[i]}`;
};
