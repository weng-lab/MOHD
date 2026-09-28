import { NextRequest } from "next/server";
import { isMassSpecOme } from "@/app/dimensionalityReduction/model/features";
import { getFeatureSlice } from "@/app/dimensionalityReduction/data/quantification";

/**
 * One feature's values across a mass-spec ome's samples, for the explorer to color by:
 * GET /api/quantification?ome=metabolomics&feature=Metformin. A route rather than a server
 * function, which Next runs one at a time per client.
 */
export async function GET(request: NextRequest) {
  const ome = request.nextUrl.searchParams.get("ome");
  const feature = request.nextUrl.searchParams.get("feature");

  // Neither parameter reaches the API: the ome picks one of three fixed queries, and the feature is looked up in the answer.
  if (!isMassSpecOme(ome) || !feature) {
    return Response.json(
      { error: "Expected ?ome= lipidomics, metabolomics or metallomics, and a ?feature=" },
      { status: 400 }
    );
  }

  const slice = await getFeatureSlice(ome, feature);
  return slice ? Response.json(slice) : Response.json({ error: `No ${ome} feature "${feature}"` }, { status: 404 });
}
