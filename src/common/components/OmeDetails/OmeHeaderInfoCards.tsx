"use client";
import { Divider, Grow, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import { OmesDataType } from "@/common/types/globalTypes";
import { useGrowOnScroll } from "@/common/hooks/useGrowOnScroll";

type OmeHeaderStat = {
    label: string;
    value: string;
};

const HEADER_STATS: Partial<Record<OmesDataType, OmeHeaderStat[]>> = {
    ATAC: [
        // { label: "Samples", value: "128" },
        // { label: "Peaks", value: "45.2K" },
        // { label: "Reads", value: "2.1M" },
        { label: "Experiments", value: "128" },
        { label: "Participants", value: "180" },
        { label: "Timepoints", value: "200" },
    ],
};

export function OmeHeaderInfoCards({ ome }: { ome: OmesDataType }) {
    const stats = HEADER_STATS[ome] ?? [];
    const { visible, refs } = useGrowOnScroll(stats.length);
    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.down("sm"));

    if (stats.length === 0) {
        return null;
    }

    return (
        <Stack direction="row" alignItems="center" spacing={{xs: 0, md: 2}} sx={{ minWidth: 0 }}>
            <Divider
                orientation="vertical"
                flexItem
                sx={{
                    borderColor: "rgba(255, 255, 255, 0.2)",
                    height: 28,
                    alignSelf: "center",
                    display: { xs: "none", md: "block" },
                }}
            />
            <Stack
                direction="row"
                flexWrap="wrap"
                alignItems="center"
                useFlexGap
                sx={{
                    minWidth: 0,
                    columnGap: 1,
                    rowGap: 1,
                }}
            >
                {stats.map((stat, index) => (
                    <Grow in={visible[index]} timeout={500 + index * 140} key={stat.label}>
                        <Stack
                            ref={(el) => {
                                refs.current[index] = el;
                            }}
                            data-index={index}
                            direction="row"
                            alignItems="center"
                            spacing={1}
                            sx={{
                                px: { xs: 0.5, md: 1.25 },
                                py: 0.5,
                                borderRadius: 1.5,
                                bgcolor: "rgba(255, 255, 255, 0.08)",
                                border: "1px solid rgba(255, 255, 255, 0.06)",
                            }}
                        >
                            <Typography
                                variant={isXs ? "caption" : "body2"}
                                sx={{
                                    color: "rgba(255, 255, 255, 0.72)",
                                }}
                            >
                                {stat.label}
                            </Typography>
                            <Typography
                                variant={isXs ? "caption" : "body1"}
                                sx={{
                                    color: "white",
                                    fontWeight: 700,
                                }}
                            >
                                {stat.value}
                            </Typography>
                        </Stack>
                    </Grow>
                ))}
            </Stack>
        </Stack>
    );
}
