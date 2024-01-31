import { authMiddleware, redirectToSignIn } from "@clerk/nextjs";


export default authMiddleware({
  publicRoutes: (req) => !req.url.includes("/assistant"),
  afterAuth(auth, req, evt) {
    if (!auth.userId && !auth.isPublicRoute) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }
  }
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};