import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import Resend from "@auth/core/providers/resend";
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password,Resend({
    from: process.env.AUTH_EMAIL ?? "My App <onboarding@resend.dev>",
  }),],
});
