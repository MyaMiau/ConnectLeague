import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export default NextAuth({
  adapter: PrismaAdapter(prisma, {
    // Mapeamento dos modelos caso use nomes diferentes do padrão
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
        if (!user || !user.password) return null;
        // Confere a senha
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;
        return user;
      }
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token, user }) {
      // Adiciona o id do usuário à sessão
      if (token) session.user.id = token.sub;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});