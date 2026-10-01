"use client";
import { useState, useRef, useId } from "react";
import { Box, FormControl, InputAdornment, InputLabel, OutlinedInput, Popover } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import type { PhenotypicalVariable } from "@/common/hooks/usePhenotypicalVariables";
import { buildTree, formatVariableName, ancestorsOf, formatSegment } from "./helpers";

export type TreeNode = {
  label: string;
  fullPath: string;
  children: Map<string, TreeNode>;
  isLeaf: boolean;
};

interface TreeSelectProps {
  variables: PhenotypicalVariable[];
  value: string;
  onChange: (value: string) => void;
  label: string;
  disabled?: boolean;
}

export default function TreeSelect({ variables, value, onChange, label, disabled }: TreeSelectProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const [popoverWidth, setPopoverWidth] = useState<number | undefined>(undefined);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const anchorRef = useRef<HTMLDivElement>(null);
  const id = useId();

  const tree = buildTree(variables);
  const open = Boolean(anchorEl);

  const displayValue = value ? formatVariableName(value) : "";

  function handleOpen() {
    if (!disabled && anchorRef.current) {
      setPopoverWidth(anchorRef.current.offsetWidth);
      setExpandedItems(value ? ancestorsOf(value) : []);
      setAnchorEl(anchorRef.current);
    }
  }

  function handleClose() {
    setAnchorEl(null);
  }

  function handleSelect(path: string) {
    onChange(path);
    handleClose();
  }

  function renderNodes(node: TreeNode): React.ReactNode {
    return Array.from(node.children.values()).map((child) => {
      const isSelectableLeaf = child.isLeaf && child.children.size === 0;

      return (
        <TreeItem
          key={child.fullPath}
          itemId={child.fullPath}
          label={formatSegment(child.label)}
          onClick={isSelectableLeaf ? () => handleSelect(child.fullPath) : undefined}
          sx={isSelectableLeaf ? { "& > .MuiTreeItem-content .MuiTreeItem-label": { cursor: "pointer" } } : undefined}
        >
          {renderNodes(child)}
        </TreeItem>
      );
    });
  }

  return (
    <>
      <Box ref={anchorRef} sx={{ width: "100%" }}>
        <FormControl size="small" fullWidth disabled={disabled} focused={open}>
          <InputLabel htmlFor={id} shrink={open || !!value}>
            {label}
          </InputLabel>
          <OutlinedInput
            id={id}
            label={label}
            value={displayValue}
            notched={open || !!value}
            inputProps={{ readOnly: true }}
            onClick={handleOpen}
            endAdornment={
              <InputAdornment position="end">
                <ArrowDropDownIcon
                  sx={{
                    color: "action.active",
                    transform: open ? "rotate(180deg)" : "none",
                    transition: "transform 0.2s",
                    pointerEvents: "none",
                  }}
                />
              </InputAdornment>
            }
            sx={{ cursor: "pointer", "& input": { cursor: "pointer" } }}
          />
        </FormControl>
      </Box>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        disableScrollLock
        slotProps={{
          paper: { sx: { width: popoverWidth, maxHeight: { xs: "55vh", sm: 400 }, overflow: "auto", mt: 0.5 } },
        }}
      >
        <SimpleTreeView
          selectedItems={value || null}
          expandedItems={expandedItems}
          onExpandedItemsChange={(_, items) => setExpandedItems(items)}
          sx={{ pb: 1, px: 1 }}
        >
          {renderNodes(tree)}
        </SimpleTreeView>
      </Popover>
    </>
  );
}
