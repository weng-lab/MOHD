import PCASkeleton, { PCAFrame } from "./PCASkeleton";

/**
 * Route-level fallback, shown during navigation into this segment. The inner
 * <Suspense> in page.tsx is what covers the query; both render the same
 * skeleton, so the two stages read as one.
 */
const Loading = () => (
  <PCAFrame>
    <PCASkeleton />
  </PCAFrame>
);

export default Loading;
