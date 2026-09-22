import { NextRequest } from "next/server";
import { isMassSpecOme } from "@/app/dimensionalityReduction/features";
import { getFeatureSlice } from "@/app/dimensionalityReduction/quantification";

/**
 * One feature's values across a mass-spec ome's samples, for the dimensionality reduction explorer
 * to color by: GET /api/quantification?ome=metabolomics&feature=Metformin
 *
 * A GET rather than a server function: this is a read, and Next runs server functions one at a time
 * per client, so a reader picking features quickly would queue behind each one.
 */
export async function GET(request: NextRequest) {
  const ome = request.nextUrl.searchParams.get("ome");
  const feature = request.nextUrl.searchParams.get("feature");

  // The ome picks one of three fixed queries and the feature is only looked up in the answer, so
  // neither ever reaches the API as anything but a choice between those three.
  if (!isMassSpecOme(ome) || !feature) {
    return Response.json(
      { error: "Expected ?ome= lipidomics, metabolomics or metallomics, and a ?feature=" },
      { status: 400 }
    );
  }

  const slice = await getFeatureSlice(ome, feature);
  return slice ? Response.json(slice) : Response.json({ error: `No ${ome} feature "${feature}"` }, { status: 404 });
}
