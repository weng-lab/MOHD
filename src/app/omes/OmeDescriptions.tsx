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
import { OME_DESCRIPTIONS } from "./omeContent";


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
                                        {OME_DESCRIPTIONS[ome] ?? "Description"}
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
