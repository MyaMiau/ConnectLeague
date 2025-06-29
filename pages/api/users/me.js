import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]"; // ajuste o caminho se necessário
import { prisma } from "@/lib/prisma";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user?.email) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  // Busca o usuário pelo e-mail da sessão
  const user = await prisma.users.findUnique({
    where: { email: session.user.email },
  });
  if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
  res.status(200).json(user);
}