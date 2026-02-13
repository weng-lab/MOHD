import { Box, Divider, Stack, Typography } from "@mui/material";

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
                    width: "100%",
                    maxWidth: 900,
                    backgroundColor: "primary.light",
                    borderRadius: "999px",
                    px: 6,
                    py: 3,
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
                    {stats.map((stat) => (
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
                                }}
                            >
                                {stat.value}
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
                    ))}
                </Stack>
            </Box>
        </Stack>
    );
}
