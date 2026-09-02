"use client";
import { useState, useRef, useId } from "react";
import {
  Box, Divider, FormControl, InputAdornment, InputLabel,
  ListSubheader, MenuItem, OutlinedInput, Popover,
} from "@mui/material";
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
  disabledValue?: string;
  disabled?: boolean;
  allowNone?: boolean;
}

export default function TreeSelect({
  variables,
  value,
  onChange,
  label,
  disabledValue,
  disabled,
  allowNone,
}: TreeSelectProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const [popoverWidth, setPopoverWidth] = useState<number | undefined>(undefined);
  const [expandedItems, setExpandedItems] = useState<Record<string, string[]>>({});
  const anchorRef = useRef<HTMLDivElement>(null);
  const id = useId();

  const categoryTrees = (["Categorical", "Quantitative"] as const).flatMap((cat) => {
    const group = variables.filter((v) => v.variable_category === cat);
    if (group.length === 0) return [];
    return [{ category: cat, tree: buildTree(group) }];
  });
  const open = Boolean(anchorEl);

  const displayValue =
    value === "none" ? "-none-"
    : value ? formatVariableName(value)
    : "";

  function handleOpen() {
    if (!disabled && anchorRef.current) {
      setPopoverWidth(anchorRef.current.offsetWidth);
      const ancestors = value && value !== "none" ? ancestorsOf(value) : [];
      setExpandedItems(Object.fromEntries(categoryTrees.map(({ category }) => [category, ancestors])));
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
      const isDisabled = child.fullPath === disabledValue;
      const isSelectableLeaf = child.isLeaf && child.children.size === 0;

      return (
        <TreeItem
          key={child.fullPath}
          itemId={child.fullPath}
          label={formatSegment(child.label)}
          disabled={isDisabled}
          onClick={isSelectableLeaf && !isDisabled ? () => handleSelect(child.fullPath) : undefined}
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
        slotProps={{ paper: { sx: { width: popoverWidth, maxHeight: { xs: "55vh", sm: 400 }, overflow: "auto", mt: 0.5 } } }}
      >
        {allowNone && (
          <>
            <MenuItem onClick={() => handleSelect("none")} selected={value === "none"}>
              -none-
            </MenuItem>
            <Divider />
          </>
        )}
        {categoryTrees.map(({ category, tree }) => (
          <Box key={category}>
            <ListSubheader sx={{ fontSize: 14, color: "black", fontWeight: 600, lineHeight: "36px" }}>
              {category}
            </ListSubheader>
            <SimpleTreeView
              selectedItems={value && value !== "none" ? value : null}
              expandedItems={expandedItems[category] ?? []}
              onExpandedItemsChange={(_, items) => setExpandedItems((prev) => ({ ...prev, [category]: items }))}
              sx={{ pb: 1, px: 1 }}
            >
              {renderNodes(tree)}
            </SimpleTreeView>
          </Box>
        ))}
      </Popover>
    </>
  );
}
