import { NextRequest } from "next/server";
import Config from "@/common/config.json";
import { proxyRequest } from "@/common/apiProxy";

export async function POST(request: NextRequest) {
  return proxyRequest({
    url: Config.API.MOHDAPI,
    token: process.env.MOHD_API_KEY!,
    method: "POST",
    request,
  });
}
