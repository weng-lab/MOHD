import { Box, Divider, Stack, Typography } from "@mui/material";
import { AnimatedNumber } from "./AnimatedNumber";
import Link from "next/link";

const stats =
    [
        { value: "13", label: "Sites", link: "https://www.mohdconsortium.org/projects-sites" },
        { value: "1.8K", label: "Participants", link: "https://www.mohdconsortium.org/data" },
        { value: "8", label: "Omes", link: "/omes" },
    ]


export default function AtAGlance() {
    return (
        <Stack alignItems="center" spacing={2}>
            <Box
                sx={{
                    backgroundColor: "primary.main",
                    borderRadius: "999px",
                    px: { xs: 3, md: 6 },
                    py: { xs: 1.5, md: 2 },
                    maxHeight: 100
                }}
            >
                <Stack
                    direction="row"
                    divider={
                        <Divider
                            orientation="vertical"
                            flexItem
                            sx={{ borderColor: "white" }}
                        />
                    }
                    spacing={{ xs: 2, md: 5 }}
                    alignItems="center"
                >
                    {stats.map((stat) => {
                        const numericValue = parseFloat(stat.value.replace(/[^\d.]/g, ""));
                        const suffix = stat.value.replace(/[\d.,]/g, "");

                        const digitCount = numericValue.toString().length;
                        return (
                            <Stack
                                key={stat.label}
                                alignItems="center"
                                spacing={0.5}
                                sx={{
                                    flex: 1,
                                    textDecoration: "none",
                                    color: "inherit",
                                    transition: "all 0.2s ease",
                                    cursor: stat.link ? "pointer" : "default",
                                    "&:hover": {
                                        transform: "translateY(-2px)",
                                    },
                                    px: 2
                                }}
                                component={Link}
                                href={stat.link ?? ""}
                                target={stat.link && stat.link.startsWith("http") ? "_blank" : undefined}
                                rel={stat.link && stat.link.startsWith("http") ? "noopener noreferrer" : undefined}
                            >
                                <Typography
                                    sx={{
                                        color: "white",
                                        fontWeight: 500,
                                        fontSize: { xs: 25, md: 30 },
                                        lineHeight: 1,
                                        fontVariantNumeric: "tabular-nums",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Box
                                        component="span"
                                        sx={{
                                            minWidth: `${digitCount}ch`,
                                            textAlign: "center",
                                            display: "inline-block",
                                        }}
                                    >
                                        <AnimatedNumber value={numericValue} />
                                    </Box>
                                    {suffix}
                                </Typography>
                                <Typography
                                    sx={{
                                        color: "white",
                                        fontSize: 14,
                                    }}
                                >
                                    {stat.label}
                                </Typography>
                            </Stack>
                        );
                    })}
                </Stack>
            </Box>
        </Stack>
    );
}
