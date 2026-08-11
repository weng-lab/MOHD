import Config from "@/common/config.json";
import { proxyRequest } from "@/common/apiProxy";

const BASE_URL = Config.API.BULK_DOWNLOAD;

// Cancels an in-progress job upstream.
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  return proxyRequest({
    url: `${BASE_URL}jobs/${encodeURIComponent(id)}`,
    token: process.env.BULK_DOWNLOAD_TOKEN!,
    method: "DELETE",
  });
}
