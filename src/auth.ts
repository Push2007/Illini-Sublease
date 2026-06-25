import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/db";
import { isAllowedEmail, normalizeEmail } from "@/lib/auth-domain";

const useSecureCookies = process.env.NODE_ENV === "production";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  cookies: {
    sessionToken: {
      name: `${useSecureCookies ? "__Secure-" : ""}illinisublease.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
  },
  logger: {
    error(error) {
      if (error?.name === "JWTSessionError") return;
      console.error(error);
    },
  },
  providers: [Google],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google") return false;

      const email = normalizeEmail(user.email ?? profile?.email ?? "");
      if (!isAllowedEmail(email)) return false;

      const dbUser = await prisma.user.upsert({
        where: { email },
        update: {
          name: user.name ?? undefined,
          image: user.image ?? undefined,
          emailVerified: new Date(),
        },
        create: {
          email,
          name: user.name ?? undefined,
          image: user.image ?? undefined,
          emailVerified: new Date(),
        },
      });
      user.id = dbUser.id;
      return true;
    },
    async jwt({ token, user }) {
      if (user?.id) token.uid = user.id as string;
      if (!token.uid && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: normalizeEmail(token.email) },
        });
        if (dbUser) token.uid = dbUser.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.uid) {
        session.user.id = token.uid as string;
      }
      return session;
    },
  },
});
