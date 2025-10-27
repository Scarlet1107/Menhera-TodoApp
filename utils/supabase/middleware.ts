import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
  try {
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );
    const { data } = await supabase.auth.getClaims();

    if (request.nextUrl.pathname.startsWith("/protected") && data?.claims == null) {
      console.log("middleware: 未認証のためサインインページへリダイレクト");
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    else if (request.nextUrl.pathname === "/" && data?.claims) {
      console.log("middleware: すでに認証済みのためホームへリダイレクト");
      return NextResponse.redirect(new URL("/protected/home", request.url));
    }

    // // Set the pathname in the response headers for bottom navigation
    // response.headers.set("x-pathname", request.nextUrl.pathname);

    return response;
  } catch (e) {
    const fallbackResponse = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
    fallbackResponse.headers.set("x-pathname", request.nextUrl.pathname);
    return fallbackResponse;
  }
};
