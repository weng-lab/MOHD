import { Typography, FormControl, FormLabel, ToggleButtonGroup, ToggleButton, Autocomplete, TextField, Button } from "@mui/material";
import { alpha, Box, Stack } from "@mui/system";
import { Site, Status, Sex, Protocol } from "../../types/globalTypes";
import ClearIcon from '@mui/icons-material/Clear';

type OmeDownloadsControlsProps = {
    site: Site[];
    status: Status[];
    sex: Sex[];
    description: string[];
    descriptions: string[];
    protocol?: Protocol[];
    setSite: React.Dispatch<React.SetStateAction<Site[]>>;
    setStatus: React.Dispatch<React.SetStateAction<Status[]>>;
    setSex: React.Dispatch<React.SetStateAction<Sex[]>>;
    setDescription: React.Dispatch<React.SetStateAction<string[]>>;
    setProtocol?: React.Dispatch<React.SetStateAction<Protocol[]>>;
};

const OmeDownloadsControls = (props: OmeDownloadsControlsProps) => {

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

                <Button
                    variant="outlined"
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
                        aria-label="View By"
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
                        aria-label="View By"
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
                        aria-label="View By"
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
                            aria-label="View By"
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
                                height: "38.75px",
                                "& .MuiAutocomplete-inputRoot": {
                                    flexWrap: "nowrap",
                                    overflow: "hidden",
                                },
                                "& .MuiChip-root": (theme) => ({
                                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                                    color: theme.palette.primary.main,
                                }),
                                "& .MuiChip-deleteIcon": () => ({
                                    color: "white",
                                    "&:hover": {
                                        color: "white",
                                    },
                                }),
                            }}
                        />
                    </FormControl>
                )}
            </Stack>
        </Box>
    );
};

export default OmeDownloadsControls;