"use client";
import { Grid, Grow, Box, Typography, Button } from "@mui/material";
import Link from "next/link";
import { useGrowOnScroll } from "@/common/hooks/useGrowOnScroll";

const pages = [
    {
        title: "Molecular Data",
        description: "all the omes and stuff to explore the omes and everything about omes",
        link: "/omes"
    },
    {
        title: "Clinical & Phenotypic Data",
        description: "Quick metrics of the data available in each category",
        link: "/clinical"
    }
]

const LandingPageCards = () => {
    const { visible, refs } = useGrowOnScroll(pages.length);

    return (
        <Grid container spacing={5} justifyContent="flex-start" marginTop={6} width={"100%"}>
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
                    >
                        <Box
                            component={Link}
                            href={page.link}
                            scroll
                            sx={{
                                position: "relative",
                                display: "grid",
                                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                                borderRadius: 3,
                                background: (theme) =>
                                `linear-gradient(
                                    to bottom,
                                    ${theme.palette.primary.dark} 0%,
                                    ${theme.palette.primary.dark}CC 60%,
                                    ${theme.palette.primary.main}CC 100%
                                )`,
                                color: "white",
                                height: 350,
                                p: 1.5,
                                boxShadow: 3,
                                textDecoration: "none",
                                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                                transformOrigin: "center",
                                overflow: "hidden",
                                "&:hover": {
                                    transform: "scale(1.02)",
                                    boxShadow: 6,
                                    zIndex: 2,
                                },
                            }}
                        >
                            <Box
                                sx={{
                                    display: { xs: "block", sm: "none" },
                                    position: "absolute",
                                    inset: 0,
                                    backgroundImage: "url('/placeholder.png')",
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                    zIndex: 0,
                                }}
                            />
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between",
                                    pr: 2,
                                    zIndex: 2
                                }}
                            >
                                <Box>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontWeight: "bold",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            display: "-webkit-box",
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: "vertical",
                                            textTransform: "capitalize",
                                        }}
                                    >
                                        {page.title}
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            display: "-webkit-box",
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: "vertical",
                                        }}
                                    >
                                        {page.description}
                                    </Typography>
                                </Box>
                                <Button
                                    variant="contained"
                                    size="small"
                                    sx={{
                                        alignSelf: "flex-start",
                                        width: "fit-content",
                                    }}
                                >
                                    Explore
                                </Button>
                            </Box>
                            <Box
                                component="img"
                                src="/placeholder.png"
                                alt="placeholder"
                                sx={{
                                    display: { xs: "none", sm: "block" },
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    borderRadius: 2,
                                }}
                            />
                        </Box>
                    </Grid>
                </Grow>
            ))}
        </Grid>
    );
};

export default LandingPageCards;
