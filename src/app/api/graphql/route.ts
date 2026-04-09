import { NextRequest, NextResponse } from "next/server";
import Config from "@/common/config.json";

export async function POST(request: NextRequest) {
  const body = await request.text();

  const response = await fetch(Config.API.MOHDAPI, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "MOHD-API-Key": process.env.MOHD_API_KEY!,
    },
    body,
  });

  const data = await response.text();
  return new NextResponse(data, {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  });
}
