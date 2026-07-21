import Config from "@/common/config.json";
import { proxyRequest } from "@/common/apiProxy";

const BASE_URL = Config.API.BULK_DOWNLOAD;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  return proxyRequest({
    url: `${BASE_URL}status/${id}`,
    token: process.env.BULK_DOWNLOAD_TOKEN!,
    method: "GET",
  });
}
