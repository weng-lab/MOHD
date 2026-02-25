"use client";
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    Box,
    Stack,
    Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { OmesList } from "@/common/types/globalTypes";
import { OME_COLORS } from "@/common/colors";

const descriptions: Record<string, React.ReactNode> = {
    WGS: (
        <>
            Your <strong>genome</strong> is the entire collection of DNA instructions that helps your body function properly.
            DNA is made up of long strings of chemicals called nucleotides (A, C, G, and T),
            which are like the letters in a very long book.
            This book is divided into chapters called genes, and each gene contains the instructions
            for making a specific part of your body or for controlling how your body works.
            <br /><br />
            We can think of the genome as the blueprints
            that describe the overall design and schematic of a home.
            To survey the genome, MOHD will use <strong>short-read whole genome sequencing (WGS)</strong>.
        </>
    ),
    WGBS: (
        <>
            The <strong>epigenome</strong> is a set of chemical modifications to your DNA that helps regulate which genes are turned
            on or off in different cells. All the cells in our body have the same genome, but what makes 
            a brain cell (neuron) different from a liver cell (hepatocyte) are differences in the levels and 
            combinations of expressed genes. 
            <br /><br />
            We can think of the epigenome as a set of zoning codes that dictate when and where parts of a house are built.
            To survey the epigenome, MOHD will measure chromatin accessibility using ATAC-seq and DNA methylation using <strong>whole genome bisulfite sequencing (WGBS)</strong>.
        </>
    ),
    ATAC: (
        <>
        </>
    ),
    RNA: (
        <>
            The <strong>transcriptome</strong> is the set of RNA messages (or transcripts) produced by your cells. These are instructions 
            copied from the genome (DNA) that tell the cell which proteins to make. The transcriptome can change depending on various 
            conditions and signals, helping scientists understand which genes are active and how cells respond to their environment. 
            <br /><br />
            We can think of the transcriptome as the building materials that are used build the walls and foundation of a house.
            To survey the transcriptome, MOHD will use short read <strong>RNA-seq</strong>. 
        </>
    ),
    proteomics: (
        <>
            The <strong>proteome</strong> is the entire set of proteins produced by our cells. Proteins are the building blocks of the body, 
            doing everything from building tissues to fighting infections. The proteome can change over time and in different conditions, 
            helping scientists understand how our bodies work and respond to various factors. 
            <br /><br />
            We can think of the proteome as the construction workers that carry out all the work of building and maintaining a home.
            To survey the proteome, MOHD will measure protein abundance using untargeted, high-throughput mass-spectrometry.
        </>
    ),
    metabolomics: (
        <>
            The <strong>metabolome</strong> is the comprehensive set of chemical compounds, known as metabolites, that include amino acids, 
            lipids, sugars, nucleotides, organic acids, vitamins, and other small molecules. Metabolites are crucial for energy production, 
            cellular structure, signaling, and regulation. The metabolome is highly dynamic and can change rapidly in response to various factors such as 
            genetic modifications, disease states, and therapeutic interventions. 
            <br /><br />
            We can think of the metabolome as the furnishings that provide a home life and function.
            To survey the metabolome, MOHD will measure metabolite abundance using untargeted, high-throughput mass-spectrometry.
        </>
    ),
    lipidomics: (
        <>
        </>
    ),
    exposomics: (
        <>
            The <strong>exposome</strong> refers to all the factors that a person is exposed to throughout their life. 
            This includes everything from the air we breathe and the food we eat and the chemicals we encounter. 
            Essentially, it&apos;s the sum of all the external influences that can affect our health and wellbeing over time. 
            For example some chemicals, such as Per- and polyfluoroalkyl substances (PFAS) can accumulate over time and have been linked to various health issues, 
            including liver damage, thyroid disease, decreased fertility, and increased risk of certain cancers. 
            <br /><br />
            We can think of the exposome as the weather, which can impact a house&apos;s longevity and appearance.
            To survey the exposome, MOHD will use high-throughput mass-spectrometry.
        </>
    ),
    metallomics: (
        <>
        </>
    )
};


export default function OmeDescriptions() {

    return (
        <Box width="100%" py={4} px={{xs: 2, md: 0}} display="flex" justifyContent="center">
            <Box width="100%" maxWidth={1250}>
                <Stack width="100%" spacing={2}>
                    <Divider
                        sx={{
                            width: "100%",
                            "&::before, &::after": {
                                borderColor: "primary.dark",
                                borderTopWidth: 3,
                            },
                        }}
                    >
                        <Typography variant="h3" color="primary.dark" sx={{ px: 2 }}>
                            <b>Multi-Omics</b>
                        </Typography>
                    </Divider>
                    {OmesList.map((ome) => {
                        const color = OME_COLORS[ome.toLowerCase()] || "gray";

                        return (
                            <Accordion
                                key={ome}
                                elevation={2}
                                sx={{
                                    position: "relative",
                                    overflow: "hidden",
                                    borderRadius: 2,
                                    "&:before": {
                                        display: "none",
                                    },
                                    borderLeft: `12px solid ${color}`,
                                }}
                            >
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography
                                        fontWeight={600}
                                        textTransform="capitalize"
                                        sx={{ color }}
                                    >
                                        {ome}
                                    </Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Typography>
                                        {descriptions[ome] ?? "Description"}
                                    </Typography>
                                </AccordionDetails>
                            </Accordion>
                        );
                    })}
                </Stack>
            </Box>
        </Box>
    );
}
