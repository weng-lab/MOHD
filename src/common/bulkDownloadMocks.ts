const ZIP_MOCK_FILES = [
  "testdata/eb01.bigWig",
  "testdata/eb02.bigWig",
  "testdata/eb03.bigWig",
];

const TEXT_MOCK_FILES = [
  "testdata/alpha.txt",
  "testdata/bravo.txt",
  "testdata/charlie.txt",
];

export function getMockBulkDownloadFiles(format: string): string[] {
  return format === "tarball" ? [...ZIP_MOCK_FILES] : [...TEXT_MOCK_FILES];
}
