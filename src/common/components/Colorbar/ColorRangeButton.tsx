"use client";

import TuneIcon from "@mui/icons-material/Tune";
import { Badge, Button, IconButton, Popover, Stack, Tooltip, Typography } from "@mui/material";
import { createContext, use, useEffect, useRef, useState, type ReactNode } from "react";
import { sameRange } from "./colorbarAxis";
import ColorRangeEditor, { type ColorRangeEditorProps } from "./ColorRangeEditor";

export type ColorRangeButtonProps = ColorRangeEditorProps & {
  /** Written beside the icon, as a heatmap's header has room for. The icon alone where it is omitted. */
  label?: ReactNode;
  /** Fired as the editor opens. */
  onOpen?: () => void;
  /**
   * Fired as the editor closes, so a page that keeps the range somewhere costly to write - a link -
   * writes it once, with wherever it was left, rather than on every step of a drag.
   */
  onClose?: () => void;
};

/** The open panel's props, handed past the Popover rather than through it - see ColorRangeButton. */
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
 * Opens the color range editor. Kept behind a button rather than on the legend itself: handles on a
 * 160px bar crowd it, and catch the cursor mid-sweep. A dot on the icon says the range has been moved.
 *
 * The panel reads its props from context so that the Popover around it doesn't re-render as a handle
 * moves. MUI's Popover measures its anchor again on every render - an effect with no dependencies -
 * so re-rendered on every step of a drag it followed the button as the labels beside it changed
 * width, and shook under the cursor. And that effect sets state: a burst of clicks along the track
 * queued those updates faster than React drained them, until it gave up with "Maximum update depth
 * exceeded". Its props hold still while the range changes, so the React Compiler keeps the element,
 * and the Popover is left as it was placed.
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
  // The caller's onClose closes over the range, so it is a new function on every step of a drag.
  // Reached through a ref, the Popover's own onClose stays the same one throughout.
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
