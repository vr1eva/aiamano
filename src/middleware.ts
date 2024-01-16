import { authMiddleware } from "@clerk/nextjs";
export default authMiddleware({
  ignoredRoutes: ["/api/complete", "/api/transcribe"],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
