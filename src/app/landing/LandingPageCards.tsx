"use client";
import { Grow, Box, Typography, Button, Divider, Stack, Container, Grid } from "@mui/material";
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

const LandingPageCards = () => {
    const { visible, refs } = useGrowOnScroll(pages.length);

    return (
        <Container maxWidth="lg">
            <Stack spacing={2} width="100%">
                <Stack direction="row" alignItems="center" spacing={1} width="100%">
                    <Typography variant="h5" color="primary.main" fontWeight={600}>
                        EXPLORE AVAILABLE DATA
                    </Typography>
                    <Divider
                        sx={{
                            flexGrow: 1,
                            borderColor: "rgba(0,0,0,0.10)",
                        }}
                    />
                </Stack>
                <Grid container spacing={5} justifyContent="center" width={"100%"}>
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
                                        gridTemplateRows: "auto 1fr",
                                        borderRadius: 4,
                                        backgroundImage: `url(${page.image})`,
                                        backgroundSize: "cover",
                                        backgroundPosition: "center",
                                        backgroundColor: "#fffdf8",
                                        height: 415,
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
                                            zIndex: 2,
                                            backgroundImage:
                                                "linear-gradient(to bottom, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.82) 45%, rgba(255, 255, 255, 0) 100%)",
                                            p: 2,
                                        }}
                                    >
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
                                            position: "absolute",
                                            left: 16,
                                            bottom: 16,
                                            zIndex: 2,
                                            fontWeight: 700,
                                            fontSize: 12,
                                            backgroundColor: page.title === "Molecular Data" ? "primary.dark" : "secondary.main",
                                            "&:hover": {
                                                backgroundColor: page.title === "Molecular Data" ? "primary.main" : "secondary.light",
                                            },
                                        }}
                                    >
                                        Explore
                                    </Button>
                                </Box>
                            </Grid>
                        </Grow>
                    ))}
                </Grid>
            </Stack>
        </Container>
    );
};

export default LandingPageCards;
