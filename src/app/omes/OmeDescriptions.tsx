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

const descriptions: Record<string, string> = {
    WGS: "Your genome is the entire collection of DNA instructions that helps your body function properly. DNA is made up of long strings of chemicals called nucleotides (A,C,G and T), which are like the letters in a very long book. This book is divided into chapters called genes, and each gene contains the instructions for making a specific part of your body or for controlling how your body works. In our house building analogy, we can think of the genome as the blueprints that describe the overall design and schematic of the home. To survey the genome, MOHD will use short-read whole genome sequencing (WGS).",
    transcriptomics: "Transcriptomics analyzes RNA transcripts to understand gene expression.",
    proteomics: "Proteomics studies large-scale protein structure and function.",
    metabolomics: "Metabolomics examines small molecule metabolites within cells and tissues.",
};

export default function OmeDescriptions() {

    return (
        <Box width="100%" py={4} display="flex" justifyContent="center">
            <Box width="100%" maxWidth={1250}>
                <Stack spacing={2}>
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
