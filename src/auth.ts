import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { isAllowedEmail, normalizeEmail } from "@/lib/auth-domain";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Google,
    Credentials({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = normalizeEmail(String(credentials?.email ?? ""));
        const password = String(credentials?.password ?? "");
        if (!email || !password || !isAllowedEmail(email)) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash || !user.emailVerified) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          image: user.image ?? undefined,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Google: enforce @illinois.edu and provision a local user record.
      if (account?.provider === "google") {
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
      }
      // Credentials are validated in authorize().
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
