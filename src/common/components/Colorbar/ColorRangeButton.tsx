"use client";

import TuneIcon from "@mui/icons-material/Tune";
import { Badge, Button, IconButton, Popover, Stack, Tooltip, Typography } from "@mui/material";
import { createContext, use, useEffect, useRef, useState, type ReactNode } from "react";
import { sameRange } from "./colorbarAxis";
import ColorRangeEditor, { type ColorRangeEditorProps } from "./ColorRangeEditor";

export type ColorRangeButtonProps = ColorRangeEditorProps & {
  /** Written beside the icon. The icon alone where omitted. */
  label?: ReactNode;
  /** Fired as the editor opens. */
  onOpen?: () => void;
  /** Fired as the editor closes, so a range kept somewhere costly to write, like the URL, is written once. */
  onClose?: () => void;
};

/** The open panel's props, passed around the Popover rather than through it - see ColorRangeButton. */
const EditorContext = createContext<ColorRangeEditorProps | null>(null);

const EditorPanel = () => {
  const editor = use(EditorContext)!;
  const adjusted = !sameRange(editor.range, editor.defaultRange);
  return (
    <>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
        <Typography variant="subtitle2">Color range</Typography>
        <Button size="small" disabled={!adjusted} onClick={() => editor.onChange(editor.defaultRange)}>
          Reset
        </Button>
      </Stack>
      <ColorRangeEditor {...editor} />
    </>
  );
};

/**
 * Opens the color range editor, kept off the legend where handles would crowd the bar and catch the
 * cursor mid-sweep. A dot on the icon says the range has been moved.
 *
 * The panel reads its props from context so the Popover doesn't re-render during a drag: MUI's
 * Popover repositions and sets state on every render, which shook the panel as the labels beside
 * the button changed width, and on rapid clicks exceeded React's update depth.
 */
const ColorRangeButton = ({ label, onOpen, onClose, ...editor }: ColorRangeButtonProps) => {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const adjusted = !sameRange(editor.range, editor.defaultRange);
  const open = (event: React.MouseEvent<HTMLElement>) => {
    setAnchor(event.currentTarget);
    onOpen?.();
  };
  // A boolean, not the label: a label that is an element is a new one on every render.
  const alignRight = Boolean(label);
  // Through a ref, since the caller's onClose changes on every step of a drag.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });
  const close = () => {
    setAnchor(null);
    onCloseRef.current?.();
  };

  return (
    <EditorContext value={editor}>
      {label ? (
        <Button
          size="small"
          variant="outlined"
          color={adjusted ? "primary" : "inherit"}
          startIcon={<TuneIcon fontSize="small" />}
          onClick={open}
          aria-haspopup="dialog"
          sx={{ flexShrink: 0, whiteSpace: "nowrap", borderColor: adjusted ? undefined : "divider" }}
        >
          {label}
        </Button>
      ) : (
        <Tooltip title="Adjust the color range" disableInteractive>
          <IconButton
            size="small"
            onClick={open}
            aria-label="Adjust the color range"
            aria-haspopup="dialog"
            sx={{ flexShrink: 0 }}
          >
            <Badge variant="dot" color="primary" invisible={!adjusted}>
              <TuneIcon fontSize="small" />
            </Badge>
          </IconButton>
        </Tooltip>
      )}
      <Popover
        open={anchor !== null}
        anchorEl={anchor}
        onClose={close}
        anchorOrigin={{ vertical: "bottom", horizontal: alignRight ? "right" : "left" }}
        transformOrigin={{ vertical: "top", horizontal: alignRight ? "right" : "left" }}
        slotProps={{ paper: { sx: { p: 2, mt: 0.5 } } }}
      >
        <EditorPanel />
      </Popover>
    </EditorContext>
  );
};

export default ColorRangeButton;
