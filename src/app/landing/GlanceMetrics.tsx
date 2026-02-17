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
                    width: 445,
                    backgroundColor: "primary.light",
                    borderRadius: "999px",
                    px: 6,
                    py: 3,
                    maxHeight: 115
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
                    spacing={5}
                    alignItems="center"
                >
                    {stats.map((stat) => {
                        const numericValue = parseInt(stat.value.replace(/[^\d]/g, ""), 10);
                        const suffix = stat.value.replace(/[\d,]/g, "");

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
                                        fontSize: 36,
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
