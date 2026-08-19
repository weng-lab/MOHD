"use client";
import type { ReactNode } from "react";
import { OME_TABS } from "@/common/components/OmeDetails/omeTabs";
import { OmesDataType } from "@/common/types/globalTypes";

export const OME_DESCRIPTIONS: Record<OmesDataType, ReactNode> = {
  WGS: (
    <>
      <strong>Whole genome sequencing</strong> determines the complete DNA sequence of an individual.
      These data capture genetic variation across the genome, including single nucleotide variants,
      insertions/deletions, structural variants, and copy number changes, enabling studies of genetic
      ancestry, disease susceptibility, and genotype-phenotype relationships.
    </>
  ),
  WGBS: (
    <>
      <strong>WGBS</strong> quantifies DNA methylation at single-base resolution across the genome.
      DNA methylation is an epigenetic modification that can influence gene regulation and may change
      in response to developmental, environmental, and disease-related factors.
    </>
  ),
  ATAC: (
    <>
      <strong>ATAC-seq</strong> identifies regions of open chromatin that are accessible to regulatory
      proteins. These data provide insight into the activity of promoters, enhancers, and other
      regulatory elements that control gene expression.
    </>
  ),
  RNA: (
    <>
      <strong>RNA-seq</strong> quantifies gene expression by measuring RNA transcripts present in a
      sample. These data provide a genome-wide view of transcriptional activity and can be used to
      identify molecular pathways associated with health, disease, environmental exposures, or
      treatment response.
    </>
  ),
  proteomics: (
    <>
      <strong>Proteomics</strong> quantifies proteins present in a biological sample. Because proteins
      are the primary functional products of genes, these data provide insight into biological
      pathways, cellular processes, and molecular changes associated with disease and environmental
      exposures. Protein abundance is measured using liquid chromatography coupled with tandem mass
      spectrometry (LC-MS/MS).
    </>
  ),
  metabolomics: (
    <>
      <strong>Metabolomics</strong> quantifies small molecules involved in cellular metabolism,
      including amino acids, lipids, sugars, and other metabolites. These measurements provide a
      snapshot of physiological state and can reflect diet, environmental exposures, disease
      processes, and therapeutic interventions. Metabolites are measured using liquid chromatography
      coupled with mass spectrometry (LC-MS).
    </>
  ),
  lipidomics: (
    <>
      <strong>Lipidomics</strong> quantifies a broad range of lipids, including phospholipids,
      sphingolipids, triglycerides, and other lipid species. These molecules play important roles in
      energy storage, cell signaling, inflammation, and membrane structure. Lipid abundance is
      measured using liquid chromatography coupled with mass spectrometry (LC-MS).
    </>
  ),
  exposomics: (
    <>
      <strong>Exposomics</strong> characterizes environmental chemicals and other external exposures
      present in biological samples. These data can be used to study how environmental factors
      interact with genetic and molecular processes to influence health outcomes. Chemical exposures
      are measured using untargeted liquid chromatography and mass spectrometry approaches designed
      to detect thousands of compounds simultaneously.
    </>
  ),
  metallomics: (
    <>
      <strong>Metallomics</strong> quantifies concentrations of metals and trace elements in
      biological samples. These measurements provide information about environmental exposures and
      may help identify relationships between metal exposure, biological responses, and disease risk.
      Metal concentrations are measured using inductively coupled plasma mass spectrometry (ICP-MS).
    </>
  ),
};

export function getOmeLabel(ome: OmesDataType) {
  if (ome === "RNA" || ome === "ATAC") {
    return `${ome}-seq`;
  }

  return ome === "WGS" || ome === "WGBS" ? ome : ome.charAt(0).toUpperCase() + ome.slice(1);
}

export function getOmeIconName(ome: OmesDataType) {
  return ome.toLowerCase().split("-")[0];
}

export function getOmeInfoHref(ome: OmesDataType) {
  return OME_TABS[ome]?.[0]?.href ?? `/omes/${ome}/dimensionalityReduction`;
}

export function getGenomeBrowserHref(ome: OmesDataType) {
  const genomeBrowserTab = OME_TABS[ome]?.find((tab) => tab.value === "genomeBrowser");

  return genomeBrowserTab?.href ?? null;
}
