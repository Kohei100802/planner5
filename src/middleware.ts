import auth from "next-auth/middleware";
export default auth;

export const config = {
  matcher: ["/((?!api/auth|auth/signin|auth/signup|_next/static|_next/image|favicon.ico).*)"],
};


