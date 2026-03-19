import { Box, IconButton, InputAdornment, TextField, Tooltip, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import CancelIcon from "@mui/icons-material/Cancel";
import SearchIcon from "@mui/icons-material/Search";
import {
    QuickFilter,
    QuickFilterClear,
    QuickFilterControl,
    QuickFilterTrigger,
} from "@weng-lab/ui-components";
import { ReactElement, ReactNode, createContext, useContext } from "react";

type DownloadToolbarContextValue = {
    label?: string | ReactElement;
};

const DownloadToolbarContext = createContext<DownloadToolbarContextValue>({
    label: undefined,
});

type ToolbarOwnerState = {
    expanded: boolean;
};

const StyledQuickFilter = styled(QuickFilter)({
    display: "grid",
    alignItems: "center",
    justifyItems: "end",
    "--trigger-width": "36px",
});

const StyledToolbarButton = styled(IconButton)<{ ownerState: ToolbarOwnerState }>(
    ({ theme, ownerState }) => ({
        gridArea: "1 / 1",
        width: "min-content",
        height: "min-content",
        zIndex: 1,
        opacity: ownerState.expanded ? 0 : 1,
        pointerEvents: ownerState.expanded ? "none" : "auto",
        transition: theme.transitions.create(["opacity"]),
    })
);

const StyledTextField = styled(TextField)<{ ownerState: ToolbarOwnerState }>(
    ({ theme, ownerState }) => ({
        gridArea: "1 / 1",
        overflowX: "clip",
        width: ownerState.expanded ? 260 : "var(--trigger-width)",
        opacity: ownerState.expanded ? 1 : 0,
        transition: theme.transitions.create(["width", "opacity"]),
    })
);

export const DownloadToolbar = () => {
    const { label } = useContext(DownloadToolbarContext);
    const iconColor = "inherit";

    return (
        <Box
            role="toolbar"
            sx={{
                alignItems: "center",
                display: "flex",
                justifyContent: "space-between",
                gap: 2,
                width: "100%",
                p: "6px",
                borderBottom: "1px solid",
                borderColor: "divider",
            }}
        >
            {typeof label === "string" ? (
                <Typography variant="body1" component="div">
                    {label}
                </Typography>
            ) : (
                label ?? null
            )}
            <Box sx={{ alignItems: "center", display: "flex", gap: 1 }}>
                <StyledQuickFilter>
                    <QuickFilterTrigger
                        render={(triggerProps, state) => (
                            <Tooltip title="Search" enterDelay={0}>
                                <StyledToolbarButton
                                    {...triggerProps}
                                    ownerState={{ expanded: state.expanded }}
                                    color="default"
                                    aria-disabled={state.expanded}
                                >
                                    <SearchIcon fontSize="small" htmlColor={iconColor} />
                                </StyledToolbarButton>
                            </Tooltip>
                        )}
                    />
                    <QuickFilterControl
                        render={({ ref, ...controlProps }, state) => (
                            <StyledTextField
                                {...controlProps}
                                ownerState={{ expanded: state.expanded }}
                                inputRef={ref}
                                aria-label="Search"
                                placeholder="Search..."
                                size="small"
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon fontSize="small" />
                                            </InputAdornment>
                                        ),
                                        endAdornment: state.value ? (
                                            <InputAdornment position="end">
                                                <QuickFilterClear
                                                    edge="end"
                                                    size="small"
                                                    aria-label="Clear search"
                                                    material={{ sx: { marginRight: -0.75 } }}
                                                >
                                                    <CancelIcon fontSize="small" />
                                                </QuickFilterClear>
                                            </InputAdornment>
                                        ) : null,
                                        ...controlProps.slotProps?.input,
                                    },
                                    ...controlProps.slotProps,
                                }}
                            />
                        )}
                    />
                </StyledQuickFilter>
            </Box>
        </Box>
    );
};

export const DownloadToolbarProvider = ({
    label,
    children,
}: DownloadToolbarContextValue & { children: ReactNode }) => {
    return (
        <DownloadToolbarContext.Provider value={{ label }}>
            {children}
        </DownloadToolbarContext.Provider>
    );
};
