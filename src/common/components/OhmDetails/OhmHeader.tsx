import { OHM_COLORS } from "@/common/colors";
import { Stack, Paper, Box, Typography } from "@mui/material";
import Image from "next/image";
import { usePathname } from "next/navigation";

export const OhmHeader = ({ children }: { children?: React.ReactNode }) => {
    const pathname = usePathname();
    const ohm = pathname.split("/")[2];

    const color = OHM_COLORS[ohm.toLowerCase()] || "gray";
    const image = `/OhmIcons/${ohm.toLowerCase()}.png`;

    return (
        <Box
            display={"grid"}
            height={"100%"}
            gridTemplateRows={"auto minmax(0, 1fr)"}
            gridTemplateColumns={"minmax(0, 1fr)"}
        >
            {/* z index of scrollbar in DataGrid is 60 */}
            <Paper
                elevation={1}
                square
                sx={{ position: "sticky", top: "var(--header-height, 64px)", zIndex: 61 }}
                id="ohm-header"
            >
                <Stack direction="row" alignItems="stretch">
                    <Box
                        sx={{
                            width: 12,
                            backgroundColor: color,
                        }}
                    />
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={2}
                        sx={{ px: 3, py: 2, flex: 1 }}
                    >
                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: 700,
                                textTransform: "capitalize",
                                color: color,
                                lineHeight: 1.1,
                            }}
                        >
                            {ohm}
                        </Typography>
                        <Image
                            src={image}
                            alt={`${ohm} icon`}
                            width={40}
                            height={40}
                        />
                    </Stack>
                </Stack>
            </Paper>
            {children}
        </Box>
    );
};
