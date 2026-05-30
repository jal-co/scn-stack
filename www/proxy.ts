import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
    const response = NextResponse.next();

    // RFC 8288 Link headers for agent discovery
    if (request.nextUrl.pathname === "/") {
        response.headers.append(
            "Link",
            '</llms.txt>; rel="describedby"; type="text/plain"'
        );
        response.headers.append(
            "Link",
            '</llms-full.txt>; rel="describedby"; type="text/plain"'
        );
        response.headers.append(
            "Link",
            '</docs>; rel="service-doc"'
        );
        response.headers.append(
            "Link",
            '</.well-known/agent-skills/index.json>; rel="describedby"; type="application/json"'
        );
    }

    return response;
}

export const config = {
    matcher: "/",
};
