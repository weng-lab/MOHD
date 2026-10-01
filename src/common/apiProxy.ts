import { NextRequest, NextResponse } from "next/server";

type ProxyOptions = {
  url: string;
  token: string;
  method: "GET" | "POST" | "DELETE";
  // Required when method is "POST" — its body is forwarded upstream verbatim.
  request?: NextRequest;
};

// Forwards a request to an upstream API with a Bearer token attached, then
// relays the upstream status and body back untouched.
export async function proxyRequest({ url, token, method, request }: ProxyOptions) {
  const headers: HeadersInit = {
    Authorization: "Bearer " + token,
  };

  let body: string | undefined;
  if (method === "POST" && request) {
    body = await request.text();
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, { method, headers, body });

  const data = await response.text();

  // 204/205/304 must not carry a body — Response throws if one is supplied.
  if (response.status === 204 || response.status === 205 || response.status === 304) {
    return new NextResponse(null, { status: response.status });
  }

  return new NextResponse(data, {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  });
}
