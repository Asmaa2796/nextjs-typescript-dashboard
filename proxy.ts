
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // جيب الـ session — لازم السطر ده يتعمل عشان الـ cookies تتجدد
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // لو مش logged in وبيحاول يدخل أي حاجة غير /login → روّحه للـ login
  if (!user && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // لو logged in وعلى /login → روّحه للـ dashboard
  if (user && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // حمي كل الصفحات ما عدا الـ static files والـ api
    "/((?!_next/static|_next/image|favicon.ico|assets|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
