import { Box, Divider, Stack, Typography } from "@mui/material";
import { AnimatedNumber } from "./AnimatedNumber";

interface StatItem {
    value: string;
    label: string;
}

interface AtAGlanceProps {
    stats: StatItem[];
}

export default function AtAGlance({ stats }: AtAGlanceProps) {
    return (
        <Stack alignItems="center" spacing={2}>
            <Box
                sx={{
                    backgroundColor: "primary.light",
                    borderRadius: "999px",
                    px: {xs: 3, md: 6},
                    py: {xs: 1.5, md: 3},
                    maxHeight: 100
                }}
            >
                <Stack
                    direction="row"
                    divider={
                        <Divider
                            orientation="vertical"
                            flexItem
                            sx={{ borderColor: "black" }}
                        />
                    }
                    spacing={{xs: 2, md: 5}}
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
                                sx={{ flex: 1 }}
                            >
                                <Typography
                                    sx={{
                                        color: "#000000",
                                        fontWeight: 700,
                                        fontSize: {xs: 25, md: 36},
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
                                        color: "black",
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
