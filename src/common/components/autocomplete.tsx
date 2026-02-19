"use client";
import { GenomeSearch, GenomeSearchProps, Result } from "@weng-lab/ui-components";
import { useRouter } from "next/navigation";

export type AutoCompleteProps = Partial<GenomeSearchProps> & {
  closeDrawer?: () => void;
};

export const defaultHumanResults: Result[] = [
  {
    title: "WGS",
    description: "Whole Genome Sequencing",
    id: "WGS",
    type: "Ome",
  },
  {
    title: "WGBS",
    description: "Whole Genome Bisulfite Sequencing",
    id: "WGBS",
    type: "Ome",
  },
  {
    title: "ATAC",
    description: "ATAC-seq",
    id: "ATAC",
    type: "Ome",
  },
  {
    title: "RNA",
    description: "RNA-seq",
    id: "RNA",
    type: "Ome",
  },
  {
    title: "Proteomics",
    id: "proteomics",
    type: "Ome",
  },
  {
    title: "Metabolomics",
    id: "metabolomics",
    type: "Ome",
  },
  {
    title: "Lipidomics",
    id: "lipidomics",
    type: "Ome",
  },
  {
    title: "Exposomics",
    id: "exposomics",
    type: "Ome",
  },
  {
    title: "Metallomics",
    id: "metallomics",
    type: "Ome",
  },
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
];

export function makeResultLink(result: Result) {
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
    case "Ome":
      url = `/omes/${result.id}/dimensionalityReduction`
  }
  return url;
}

/**
 * Redirects the user to the a new page based on the search result
 * @param props - The props for the GenomeSearch component
 */
export default function AutoComplete({ closeDrawer, ...props }: AutoCompleteProps) {
  const router = useRouter();

  const handleSearchSubmit = (r: Result) => {
    const link = makeResultLink(r)
    //needed to trigger closing the mobile menu drawer
    if (closeDrawer) {
      closeDrawer();
    }
    if (r.type !== "Ome") {
      window.open(link)
    } else {
      router.push(link, { scroll: false });
    }
  };

  const geneVersion = [29, 40];

  return (
    <GenomeSearch
      assembly={"GRCh38"}
      geneVersion={geneVersion}
      ccreLimit={3}
      showiCREFlag={false}
      queries={["Ome", "Gene", "cCRE", "SNP", "Coordinate", "Study", "Legacy cCRE"]}
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
  );
}
