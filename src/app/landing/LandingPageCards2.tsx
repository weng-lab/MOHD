"use client";
import { Grid, Grow, Box, Typography, Button } from "@mui/material";
import Link from "next/link";
import { useGrowOnScroll } from "@/common/hooks/useGrowOnScroll";

const pages = [
    {
        title: "Molecular Data",
        description: "Access comprehensive omics datasets including genomic sequences, transcriptomics, proteomics, and metabolomics across 8 different molecular layers.",
        link: "/omes",
        image: "/molecularTest.png"
    },
    {
        title: "Clinical & Phenotypic Data",
        description: "Access comprehensive omics datasets including genomic sequences, transcriptomics, proteomics, and metabolomics across 8 different molecular layers.",
        link: "/clinical",
        image: "/clinicalTest.png"
    }
]

const LandingPageCards2 = () => {
    const { visible, refs } = useGrowOnScroll(pages.length);

    return (
        <Grid container spacing={3} justifyContent="center" marginTop={6} width={"100%"}>
            {pages.map((page, index) => (
                <Grow
                    in={visible[index]}
                    timeout={800 + index * 300}
                    key={`${page}-${index}`}
                >
                    <Grid
                        ref={(el) => {
                            refs.current[index] = el;
                        }}
                        data-index={index}
                        size={{ xs: 12, lg: 6 }}
                        sx={{ maxWidth: 600 }}
                    >
                        <Box
                            component={Link}
                            href={page.link}
                            scroll
                            sx={{
                                position: "relative",
                                display: "grid",
                                gridTemplateColumns: "1fr",
                                gridTemplateRows: { xs: "auto auto", sm: "auto 1fr" },
                                borderRadius: 4,
                                backgroundImage: `url(${page.image})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                backgroundColor: "#fffdf8",
                                minHeight: 500,
                                maxHeight: 500,
                                boxShadow: "0 10px 28px rgba(16, 24, 40, 0.08)",
                                border: "1px solid #ece4d9",
                                textDecoration: "none",
                                transition: "transform 0.25s ease, box-shadow 0.25s ease",
                                transformOrigin: "center",
                                overflow: "hidden",
                                "&:hover": {
                                    transform: "scale(1.02)",
                                    boxShadow: "0 16px 40px rgba(16, 24, 40, 0.12)",
                                    zIndex: 2,
                                },
                            }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between",
                                    zIndex: 2,
                                    backgroundColor: "rgba(255, 255, 255, 0.75)",
                                    backdropFilter: "blur(4px)",
                                    WebkitBackdropFilter: "blur(8px)",
                                    p: { xs: 2, sm: 2.5 },
                                }}
                            >
                                <Box>
                                    <Typography
                                        variant="h5"
                                        sx={{
                                            fontWeight: 700,
                                            overflow: "hidden",
                                            display: "-webkit-box",
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: "vertical",
                                            letterSpacing: 0.2,
                                            color: "#0b3b2f",
                                        }}
                                    >
                                        {page.title}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            mt: 1,
                                            overflow: "hidden",
                                            display: "-webkit-box",
                                            WebkitBoxOrient: "vertical",
                                            color: "#3c4a46",
                                            lineHeight: 1.6,
                                        }}
                                    >
                                        {page.description}
                                    </Typography>
                                </Box>
                                <Button
                                    variant="contained"
                                    size="medium"
                                    sx={{
                                        alignSelf: "flex-start",
                                        fontWeight: 700,
                                        fontSize: 12,
                                        backgroundColor: "primary.dark",
                                        "&:hover": {
                                            backgroundColor: "primary.main",
                                        },
                                    }}
                                >
                                    Explore
                                </Button>
                            </Box>
                            <Box sx={{ display: { xs: "none", sm: "block" }, minHeight: 160 }} />
                        </Box>
                    </Grid>
                </Grow>
            ))}
        </Grid>
    );
};

export default LandingPageCards2;
