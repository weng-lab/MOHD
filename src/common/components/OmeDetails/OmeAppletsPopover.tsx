import { Box, Divider, Popover, Typography } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { OmesList, OmesDataType } from "@/common/types/globalTypes";

type OmeAppletsPopoverProps = {
    anchorEl: HTMLElement | null;
    currentOme: OmesDataType;
    onClose: () => void;
};

const navigationItems = [
    { label: "Clinical Data", href: "/clinical" },
    { label: "Downloads", href: "/downloads" },
    { label: "Molecular Data", href: "/omes" },
];

export default function OmeAppletsPopover({ anchorEl, currentOme, onClose }: OmeAppletsPopoverProps) {
    return (
        <Popover
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            onClose={onClose}
            anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
            }}
            transformOrigin={{
                vertical: "top",
                horizontal: "right",
            }}
            slotProps={{
                paper: {
                    sx: {
                        mt: 1,
                        p: 1,
                        borderRadius: 3,
                        width: 320,
                        boxShadow: "0 18px 48px rgba(0, 0, 0, 0.18)",
                    },
                },
            }}
        >
            <Box sx={{ display: "grid", gap: 1 }}>
                <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, px: 1.5, color: "text.secondary" }}
                >
                    Omes
                </Typography>

                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                        gap: 1,
                    }}
                >
                    {OmesList.map((omeOption) => {
                        const isSeq = omeOption === "RNA" || omeOption === "ATAC";
                        const isCurrent = omeOption === currentOme;
                        const omeLabel = isSeq ? `${omeOption}-seq` : omeOption;
                        const omeImage = `/OmeIcons/NoBgrnd/${omeOption.toLowerCase().split("-")[0]}.png`;

                        return (
                            <Box
                                key={omeOption}
                                component={Link}
                                href={`/omes/${omeOption}/dimensionalityReduction`}
                                onClick={onClose}
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 1,
                                    minHeight: 92,
                                    p: 1.25,
                                    borderRadius: 3,
                                    textDecoration: "none",
                                    color: "text.primary",
                                    border: "1px solid",
                                    borderColor: isCurrent ? "primary.main" : "grey.300",
                                    transition: "background-color 0.2s ease, transform 0.2s ease, border-color 0.2s ease",
                                    "&:hover": {
                                        backgroundColor: "grey.200",
                                        transform: "translateY(-1px)",
                                    },
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 42,
                                        height: 42,
                                        borderRadius: "50%",
                                        backgroundColor: "white",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.10)",
                                        overflow: "hidden",
                                    }}
                                >
                                    <Image
                                        src={omeImage}
                                        alt={`${omeLabel} icon`}
                                        width={42}
                                        height={42}
                                    />
                                </Box>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        fontWeight: isCurrent ? 700 : 500,
                                        textAlign: "center",
                                        lineHeight: 1.2,
                                        color: "inherit",
                                    }}
                                >
                                    {omeLabel}
                                </Typography>
                            </Box>
                        );
                    })}
                </Box>

                <Divider sx={{ my: 0.5 }} />

                <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, px: 1.5, color: "text.secondary" }}
                >
                    Navigate
                </Typography>

                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                        gap: 1,
                    }}
                >
                    {navigationItems.map((item) => (
                        <Box
                            key={item.label}
                            component={Link}
                            href={item.href}
                            onClick={onClose}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                minHeight: 72,
                                p: 1,
                                borderRadius: 3,
                                textDecoration: "none",
                                color: "text.primary",
                                border: "1px solid",
                                borderColor: "grey.300",
                                backgroundColor: "grey.100",
                                transition: "background-color 0.2s ease, transform 0.2s ease",
                                "&:hover": {
                                    backgroundColor: "grey.200",
                                    transform: "translateY(-1px)",
                                },
                            }}
                        >
                            <Typography variant="caption" sx={{ fontWeight: 600, textAlign: "center" }}>
                                {item.label}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Box>
        </Popover>
    );
}
