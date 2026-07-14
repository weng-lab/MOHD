import { Box, Divider } from "@mui/material";
import { DragHandle } from "@mui/icons-material";
import type { PointerEventHandler } from "react";

type PaneDividerProps = {
  onPointerDown: PointerEventHandler<HTMLDivElement>;
  onPointerMove: PointerEventHandler<HTMLDivElement>;
  onPointerUp: PointerEventHandler<HTMLDivElement>;
};

/** The draggable column-resize handle shown between the two panes on wide screens. */
export default function PaneDivider(handlers: PaneDividerProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gridRow: 1,
        gridColumn: 2,
        cursor: "col-resize",
      }}
      {...handlers}
    >
      <Divider
        orientation="vertical"
        flexItem
        sx={{
          "& .MuiDivider-wrapperVertical": {
            padding: 0,
            display: "flex",
          },
          mx: "auto",
        }}
      >
        <DragHandle sx={{ transform: "rotate(90deg)", color: "divider" }} />
      </Divider>
    </Box>
  );
}
