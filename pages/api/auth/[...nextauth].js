import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export const authOptions = {
  adapter: PrismaAdapter(prisma, {
    models: {
      User: { model: prisma.users },
      Account: { model: prisma.accounts },
      Session: { model: prisma.sessions },
      VerificationToken: { model: prisma.verification_tokens },
    }
  }),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Busca o usuário pelo email
        const user = await prisma.users.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) {
          return null;
        }
        // Confere a senha
        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          return null;
        }

        // Retorna só os campos necessários para o JWT
        const userObj = {
          id: user.id,
          email: user.email,
          name: user.name,
          type: user.type,
          role: user.role || null
        };
        return userObj;
      }
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.type = user.type;
        token.role = user.role || null;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub;
        session.user.type = token.type;
        session.user.role = token.role;
        session.user.name = token.name;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

export default NextAuth(authOptions);