import { Typography, FormControl, FormLabel, ToggleButtonGroup, ToggleButton, Autocomplete, TextField, Button, Tooltip } from "@mui/material";
import { alpha, Box, Stack } from "@mui/system";
import { Site, Status, Sex, Protocol } from "../../types/globalTypes";
import ClearIcon from '@mui/icons-material/Clear';
import DownloadIcon from '@mui/icons-material/Download';
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { DownloadFile } from "@/common/hooks/useOmeDownloadFiles";
import BulkDownloadModal from "./BulkDownloadModal";
import { buildBulkFilePath } from "@/common/downloads";
import { OmeEnum } from "@/common/types/generated/graphql";
import { usePathname } from "next/navigation";

type OmeDownloadsControlsProps = {
    site: Site[];
    status: Status[];
    sex: Sex[];
    //lets give either description or descriptions a better name this is confusing
    description: string[];
    descriptions: string[];
    protocol?: Protocol[];
    setSite: Dispatch<SetStateAction<Site[]>>;
    setStatus: Dispatch<SetStateAction<Status[]>>;
    setSex: Dispatch<SetStateAction<Sex[]>>;
    setDescription: Dispatch<SetStateAction<string[]>>;
    setProtocol?: Dispatch<SetStateAction<Protocol[]>>;
    files?: DownloadFile[];
    filteredSampleIds?: Set<string>;
};

const OmeDownloadsControls = (props: OmeDownloadsControlsProps) => {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();
    const ome = pathname.includes("ATAC") ? OmeEnum.AtacSeq : pathname.includes("RNA") ? OmeEnum.RnaSeq : pathname.split("/")[2] as OmeEnum;

    const openAccessFiles = useMemo(() => {
        return props.files?.filter(
            (file) =>
                file.open_access &&
                file.file_type !== "Compressed Tar File" &&
                (!props.filteredSampleIds || props.filteredSampleIds.has(file.sample_id))
        ) ?? [];
    }, [props.files, props.filteredSampleIds]);

    const filePaths = useMemo(() => {
        return openAccessFiles.map((file) => buildBulkFilePath(file.sample_id, file.filename, ome));
    }, [openAccessFiles, ome]);

    const totalSize = useMemo(() => {
        return openAccessFiles.reduce((sum, file) => sum + (Number(file.size) || 0), 0);
    }, [openAccessFiles]);

    // Build a human-readable summary of active (non-default) filters for the modal
    const filterSummary = useMemo(() => {
        const parts: string[] = [];

        const allSites: Site[] = ["CCH", "CKD", "EXP", "MOM", "UIC"];
        const allStatuses: Status[] = ["case", "control", "unknown"];
        const allSexes: Sex[] = ["male", "female"];
        const allProtocols: Protocol[] = ["Buffy Coat", "OPC", "CPT"];

        if (props.site.length > 0 && props.site.length < allSites.length) {
            parts.push(props.site.join(", "));
        }
        if (props.status.length > 0 && props.status.length < allStatuses.length) {
            parts.push(props.status.map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(", "));
        }
        if (props.sex.length > 0 && props.sex.length < allSexes.length) {
            parts.push(props.sex.map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(", "));
        }
        if (props.protocol && props.protocol.length > 0 && props.protocol.length < allProtocols.length) {
            parts.push(props.protocol.join(", "));
        }
        if (props.description.length > 0 && props.description.length < props.descriptions.length) {
            parts.push(props.description.join(", "));
        }

        return parts.length > 0 ? parts.join(" · ") : null;
    }, [props.site, props.status, props.sex, props.protocol, props.description, props.descriptions]);

    const resetFilters = () => {
        props.setSite(["CCH", "CKD", "EXP", "MOM", "UIC"]);
        props.setStatus(["case", "control", "unknown"]);
        props.setSex(["male", "female"]);

        if (props.setProtocol) {
            props.setProtocol(["Buffy Coat", "OPC", "CPT"]);
        }

        props.setDescription(props.descriptions);
    };

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                padding: 2,
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                }}
            >
                <Typography variant="body1" component="h2">
                    <strong>Filter Downloadable Files</strong>
                </Typography>
                <Stack direction={"row"} spacing={2} flexWrap={"wrap"}>
                    <Tooltip
                        title={
                            openAccessFiles.length === 0
                                ? "No open-access files match your current filters"
                                : "Download all open-access files matching your filters"
                        }
                        placement="left"
                        arrow
                    >
                        <span>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<DownloadIcon />}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setOpen(true);
                                }}
                                disabled={openAccessFiles.length === 0}
                            >
                                Bulk Download
                            </Button>
                        </span>
                    </Tooltip>
                    <Button
                        variant="text"
                        color="primary"
                        startIcon={<ClearIcon />}
                        onClick={() => { resetFilters() }}
                        disabled={
                            props.site.length === 5 &&
                            props.status.length === 3 &&
                            props.sex.length === 2 &&
                            props.description.length === props.descriptions.length
                        }
                    >
                        Reset Filters
                    </Button>
                </Stack>
            </Box>
            <Stack direction={"row"} spacing={2} flexWrap={"wrap"} useFlexGap>
                <FormControl>
                    <FormLabel>Site</FormLabel>
                    <ToggleButtonGroup
                        color="primary"
                        value={props.site}
                        onChange={(_event, value) => {
                            if (value !== null) {
                                props.setSite(value as Site[]);
                            }
                        }}
                        aria-label="Filter by site"
                        size="small"
                    >
                        <ToggleButton sx={{ textTransform: "none" }} value="CCH">
                            CCH
                        </ToggleButton>
                        <ToggleButton sx={{ textTransform: "none" }} value="CKD">
                            CKD
                        </ToggleButton>
                        <ToggleButton sx={{ textTransform: "none" }} value="EXP">
                            EXP
                        </ToggleButton>
                        <ToggleButton sx={{ textTransform: "none" }} value="MOM">
                            MOM
                        </ToggleButton>
                        <ToggleButton sx={{ textTransform: "none" }} value="UIC">
                            UIC
                        </ToggleButton>
                    </ToggleButtonGroup>
                </FormControl>
                <FormControl>
                    <FormLabel>Status</FormLabel>
                    <ToggleButtonGroup
                        color="primary"
                        value={props.status}
                        onChange={(_event, value) => {
                            if (value !== null) {
                                props.setStatus(value as Status[]);
                            }
                        }}
                        aria-label="Filter by status"
                        size="small"
                    >
                        <ToggleButton sx={{ textTransform: "none" }} value="case">
                            Case
                        </ToggleButton>
                        <ToggleButton sx={{ textTransform: "none" }} value="control">
                            Control
                        </ToggleButton>
                        <ToggleButton sx={{ textTransform: "none" }} value="unknown">
                            Unknown
                        </ToggleButton>
                    </ToggleButtonGroup>
                </FormControl>
                <FormControl>
                    <FormLabel>Sex</FormLabel>
                    <ToggleButtonGroup
                        color="primary"
                        value={props.sex}
                        onChange={(_event, value) => {
                            if (value !== null) {
                                props.setSex(value as Sex[]);
                            }
                        }}
                        aria-label="Filter by sex"
                        size="small"
                    >
                        <ToggleButton sx={{ textTransform: "none" }} value="male">
                            Male
                        </ToggleButton>
                        <ToggleButton sx={{ textTransform: "none" }} value="female">
                            Female
                        </ToggleButton>
                    </ToggleButtonGroup>
                </FormControl>
                {props.protocol && props.setProtocol && (
                    <FormControl>
                        <FormLabel>Protocol</FormLabel>
                        <ToggleButtonGroup
                            color="primary"
                            value={props.protocol}
                            onChange={(_event, value) => {
                                if (value !== null && props.setProtocol) {
                                    props.setProtocol(value as Protocol[]);
                                }
                            }}
                            aria-label="Filter by protocol"
                            size="small"
                        >
                            <ToggleButton sx={{ textTransform: "none" }} value="Buffy Coat">
                                Buffy Coat
                            </ToggleButton>
                            <ToggleButton sx={{ textTransform: "none" }} value="OPC">
                                OPC
                            </ToggleButton>
                            <ToggleButton sx={{ textTransform: "none" }} value="CPT">
                                CPT
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </FormControl>
                )}
                {props.descriptions.length > 0 && (
                    <FormControl>
                        <FormLabel>Description</FormLabel>
                        <Autocomplete
                            multiple
                            size="small"
                            options={props.descriptions}
                            value={props.description}
                            onChange={(_, value) => props.setDescription(value)}
                            limitTags={2}
                            renderInput={(params) => <TextField {...params} />}
                            sx={{
                                maxWidth: 600,
                                minWidth: 250,
                                "& .MuiChip-root": (theme) => ({
                                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                                    color: theme.palette.primary.main,
                                }),
                                "& .MuiChip-deleteIcon": (theme) => ({
                                    color: alpha(theme.palette.primary.main, 0.5),
                                    "&:hover": {
                                        color: theme.palette.primary.main,
                                    },
                                }),
                            }}
                        />
                    </FormControl>
                )}
            </Stack>
            <BulkDownloadModal
                open={open}
                onClose={() => setOpen(false)}
                filePaths={filePaths}
                totalSize={totalSize}
                filterSummary={filterSummary}
                ome={ome}
            />
        </Box>
    );
};

export default OmeDownloadsControls;
