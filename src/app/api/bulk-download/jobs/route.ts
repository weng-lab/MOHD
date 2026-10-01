import { NextRequest } from "next/server";
import Config from "@/common/config.json";
import { proxyRequest } from "@/common/apiProxy";

const BASE_URL = Config.API.BULK_DOWNLOAD;

export async function POST(request: NextRequest) {
  return proxyRequest({
    url: `${BASE_URL}jobs`,
    token: process.env.BULK_DOWNLOAD_TOKEN!,
    method: "POST",
    request,
  });
}
