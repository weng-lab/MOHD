/**
 * UMAP is off site-wide until its embeddings are good enough to show, leaving PCA alone on the
 * explorer and on the RNA, ATAC and WGBS pages. Everything that draws it is kept and still type-checked,
 * so setting this back to true restores it. Typed boolean so the off branch isn't narrowed away.
 *
 * Restart `next dev` after flipping it: the explorer's data is cached (getExplorerData) with the UMAP
 * coordinates left out while this is off, and a running server keeps serving that until it restarts.
 */
export const SHOW_UMAP: boolean = false;
