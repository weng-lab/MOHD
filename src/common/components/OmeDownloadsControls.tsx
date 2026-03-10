import { Typography, FormControl, FormLabel, ToggleButtonGroup, ToggleButton } from "@mui/material";
import { Box, Stack } from "@mui/system";
import { Site, Status, Sex, Protocol } from "../../common/types/globalTypes";

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
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                padding: 2,
                gap: 2,
            }}
        >
            <Typography variant="body1" component="h2">
                <strong>Filter Downloadable Files</strong>
            </Typography>
            <Stack direction={"row"} spacing={2} flexWrap={"wrap"}>
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
                <FormControl>
                    <FormLabel>Description</FormLabel>
                    <ToggleButtonGroup
                        color="primary"
                        value={props.description}
                        onChange={(_event, value) => {
                            if (value !== null) {
                                props.setDescription(value);
                            }
                        }}
                        aria-label="View By"
                        size="small"
                    >
                        {props.descriptions.map((desc) => (
                            <ToggleButton key={desc} sx={{ textTransform: "none" }} value={desc}>
                                {desc.charAt(0).toUpperCase() + desc.slice(1)}
                            </ToggleButton>
                        ))}
                    </ToggleButtonGroup>
                </FormControl>
            </Stack>
        </Box>
    );
};

export default OmeDownloadsControls;