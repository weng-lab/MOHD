import { Box, Popover, Typography } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { OmesList, OmesDataType } from "@/common/types/globalTypes";
import { getOmeLabel } from "@/app/omes/omeContent";

type OmeAppletsPopoverProps = {
    anchorEl: HTMLElement | null;
    currentOme: OmesDataType;
    onClose: () => void;
};

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
                        p: 2,
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
                    sx={{ fontWeight: 700, color: "text.secondary" }}
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
                        const isCurrent = omeOption === currentOme;
                        const omeLabel = getOmeLabel(omeOption);
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
                                    backgroundColor: isCurrent ? "#e8fffd" : "transparent",
                                    transition: "background-color 0.2s ease, transform 0.2s ease, border-color 0.2s ease",
                                    "&:hover": {
                                        backgroundColor: "grey.200",
                                        transform: "translateY(-1px)",
                                    },
                                }}
                            >
                                    <Image
                                        src={omeImage}
                                        alt={`${omeLabel} icon`}
                                        width={42}
                                        height={42}
                                    />
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
            </Box>
        </Popover>
    );
}
