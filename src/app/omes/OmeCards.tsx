"use client";
import { Box, Grow, Typography, Grid } from "@mui/material";
import Link from "next/link";
import { useGrowOnScroll } from "@/common/hooks/useGrowOnScroll";
import { OmesList } from "@/common/types/globalTypes";
import { OME_COLORS } from "@/common/colors";

const OmeCardsCircle = () => {
    const { visible: omesVisible, refs: omeRefs } = useGrowOnScroll(OmesList.length);

    return (
        <Grid container spacing={5} justifyContent="flex-start" marginTop={6} width={"100%"}>
            {OmesList.map((ome, index) => {
                return (
                    <Grow
                        in={omesVisible[index]}
                        timeout={800 + index * 300}
                        style={{ transformOrigin: "center" }}
                        key={`${ome}-${index}`}
                    >
                        <Grid
                            component={Link}
                            href={`/omes/${ome}/dimensionalityReduction`}
                            scroll
                            ref={(el) => {
                                omeRefs.current[index] = el;
                            }}
                            data-index={index}
                            size={{ xs: 12, sm: 6, md: 3 }}
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                cursor: "pointer",
                                textDecoration: "none",
                                color: "inherit",
                                "&:hover .ome-title": {
                                    color: OME_COLORS[ome.toLowerCase()] ?? "white",
                                },
                                "&:hover .ome-circle": {
                                    transform: "scale(1.1)",
                                    boxShadow: 6,
                                },
                            }}
                        >
                            <Typography
                                className="ome-title"
                                variant="subtitle1"
                                sx={{
                                    fontWeight: "bold",
                                    textTransform: "capitalize",
                                    color: "white",
                                    mb: 1,
                                    textAlign: "center",
                                    transition: "color 0.3s ease",
                                    textShadow: "0 0 6px rgba(0,0,0,0.8)",
                                }}
                            >
                                {ome}
                            </Typography>

                            <Box
                                className="ome-circle"
                                sx={{
                                    width: 100,
                                    height: 100,
                                    borderRadius: "50%",
                                    boxShadow: 3,
                                    overflow: "hidden",
                                    backgroundColor: "white",
                                    backgroundImage: `url(/OmeIcons/NoBgrnd/${ome.toLowerCase()}.png)`,
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                                }}
                            />
                        </Grid>
                    </Grow>
                );
            })}
        </Grid>
    );
};

export default OmeCardsCircle;
