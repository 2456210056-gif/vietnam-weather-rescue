import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import FacebookProvider from "next-auth/providers/facebook";
import GoogleProvider from "next-auth/providers/google";
import { verifyPassword } from "@/lib/auth/password";
import { connectMongo } from "@/lib/db/mongoose";
import { User } from "@/models/User";
import { normalizeUserRole, type UserRole } from "@/types/roles";

type AuthUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: UserRole;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function getOptionalEnv(name: string) {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

function getAuthSecret() {
  const secret = getOptionalEnv("NEXTAUTH_SECRET") ?? getOptionalEnv("AUTH_SECRET");

  if (!secret) {
    console.error("Missing NEXTAUTH_SECRET or AUTH_SECRET. Add a long random value to .env.local.");
  }

  return secret ?? undefined;
}

function getDisplayName(user: {
  fullName?: string | null;
  name?: string | null;
  email?: string | null;
}) {
  return user.fullName ?? user.name ?? user.email ?? null;
}

function getDisplayImage(user: { avatar?: string | null; image?: string | null }) {
  return user.avatar ?? user.image ?? null;
}

async function findAuthUserByEmail(email: string): Promise<AuthUser | null> {
  await connectMongo();
  const dbUser = await User.findOne({ email: normalizeEmail(email) })
    .select("_id fullName name email avatar image role")
    .lean()
    .exec();

  if (!dbUser) {
    return null;
  }

  return {
    id: dbUser._id.toString(),
    name: getDisplayName(dbUser),
    email: dbUser.email,
    image: getDisplayImage(dbUser),
    role: normalizeUserRole(dbUser.role) ?? "user"
  };
}

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "Email / Password",
    credentials: {
      email: {
        label: "Email",
        type: "email",
        placeholder: "email@example.com"
      },
      password: {
        label: "Password",
        type: "password"
      }
    },
    async authorize(credentials) {
      const email = credentials?.email?.trim();
      const password = credentials?.password;

      if (!email || !password) {
        return null;
      }

      await connectMongo();
      const dbUser = await User.findOne({ email: normalizeEmail(email) })
        .select("+passwordHash +password fullName name email avatar image role")
        .exec();

      const storedHash = dbUser?.passwordHash ?? dbUser?.password;

      if (!dbUser || !storedHash) {
        return null;
      }

      const isValid = await verifyPassword(password, storedHash);

      if (!isValid) {
        return null;
      }

      return {
        id: dbUser._id.toString(),
        name: getDisplayName(dbUser),
        email: dbUser.email,
        image: getDisplayImage(dbUser),
        role: normalizeUserRole(dbUser.role) ?? "user"
      };
    }
  })
];

const googleClientId = getOptionalEnv("GOOGLE_CLIENT_ID");
const googleClientSecret = getOptionalEnv("GOOGLE_CLIENT_SECRET");
const facebookClientId = getOptionalEnv("FACEBOOK_CLIENT_ID");
const facebookClientSecret = getOptionalEnv("FACEBOOK_CLIENT_SECRET");

if (googleClientId && googleClientSecret) {
  providers.push(
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      allowDangerousEmailAccountLinking: true
    })
  );
}

if (facebookClientId && facebookClientSecret) {
  providers.push(
    FacebookProvider({
      clientId: facebookClientId,
      clientSecret: facebookClientSecret,
      allowDangerousEmailAccountLinking: true
    })
  );
}

export const authOptions: NextAuthOptions = {
  secret: getAuthSecret(),
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7
  },
  pages: {
    signIn: "/login",
    error: "/login",
    newUser: "/dashboard"
  },
  providers,
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "credentials" || !user.email) {
        return true;
      }

      await connectMongo();
      const dbUser = await User.findOneAndUpdate(
        { email: normalizeEmail(user.email) },
        {
          $set: {
            fullName: user.name ?? user.email,
            name: user.name ?? user.email,
            avatar: user.image ?? undefined,
            image: user.image ?? undefined
          },
          $setOnInsert: {
            email: normalizeEmail(user.email),
            role: "user"
          }
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true
        }
      ).exec();

      user.id = dbUser._id.toString();
      user.role = normalizeUserRole(dbUser.role) ?? "user";
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = normalizeUserRole(user.role) ?? "user";
      }

      if (token.email) {
        const dbUser = await findAuthUserByEmail(token.email).catch(() => null);

        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.name = dbUser.name;
          token.picture = dbUser.image;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id ?? "";
        session.user.role = normalizeUserRole(token.role) ?? "user";
        session.user.name = token.name;
        session.user.image = token.picture;
      }

      return session;
    }
  }
};
