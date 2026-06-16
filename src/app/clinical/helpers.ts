import { PhenotypicalVariable } from "@/common/hooks/usePhenotypicalVariables";
import { TreeNode } from "./TreeSelect";

export function buildTree(variables: PhenotypicalVariable[]): TreeNode {
  const root: TreeNode = { label: "", fullPath: "", children: new Map(), isLeaf: false };
  for (const v of variables) {
    const segments = v.variable_name.split(".");
    let current = root;
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      const path = segments.slice(0, i + 1).join(".");
      if (!current.children.has(seg)) {
        current.children.set(seg, { label: seg, fullPath: path, children: new Map(), isLeaf: false });
      }
      current = current.children.get(seg)!;
    }
    current.isLeaf = true;
  }
  return root;
}

export function formatSegment(seg: string): string {
  return seg.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatVariableName(name: string): string {
  return name
    .split(".")
    .map((seg) =>
      seg.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    )
    .join(" › ");
}

export function ancestorsOf(value: string): string[] {
  const segs = value.split(".");
  return segs.slice(0, -1).map((_, i) => segs.slice(0, i + 1).join("."));
}