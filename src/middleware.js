import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

const secret = new TextEncoder().encode(JWT_SECRET);

export async function middleware(request) {

  const token = request.cookies.get("session_token")?.value;

  if(token && (request.nextUrl.pathname === "/" || request.nextUrl.pathname === "/login")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!token || request.nextUrl.pathname == "/") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  console.log("URL: ", request.nextUrl.pathname)
  if(request.nextUrl.pathname == "/") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch (err) {
    console.error("[MIDDLEWARE] Invalid token:", err.message);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/"],
};
