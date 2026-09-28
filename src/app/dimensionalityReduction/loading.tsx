import ExplorerSkeleton from "./components/ExplorerSkeleton";

/** Shown while navigating in; page.tsx's own Suspense shows the same skeleton while the query runs. */
const Loading = () => <ExplorerSkeleton />;

export default Loading;
