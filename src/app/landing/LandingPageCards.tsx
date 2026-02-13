"use client";
import { Grid, Grow, Box, Stack, Typography, Button } from "@mui/material";
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
                            scroll={true}
                            sx={{
                                position: "relative",
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                borderRadius: 3,
                                backgroundColor: "grey",
                                color: "white",
                                height: 350,
                                p: 1.5,
                                boxShadow: 3,
                                textDecoration: "none",
                                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                                transformOrigin: "center",
                                "&:hover": {
                                    transform: "scale(1.02)",
                                    boxShadow: 6,
                                    zIndex: 2,
                                },
                            }}
                        >
                            <Stack height={"100%"} justifyContent={"space-between"}>
                                <Stack>
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
                                </Stack>
                                <Button variant="contained" size="small" sx={{ backgroundColor: "primary.main", color: "white", width: "fit-content" }}>
                                    Explore
                                </Button>
                            </Stack>
                        </Box>
                    </Grid>
                </Grow>
            ))}
        </Grid>
    );
};

export default LandingPageCards;
