import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user?.id) {
    return res.status(401).json({ error: "Usuário não autenticado." });
  }

  const userId = Number(session.user.id);
  const { vagaId } = req.body;
  if (!userId || isNaN(userId) || !vagaId || isNaN(Number(vagaId))) {
    return res.status(400).json({ error: "Dados inválidos." });
  }

  await prisma.vacancyFavorite.deleteMany({
    where: {
      userId,
      vacancyId: Number(vagaId),
    },
  });

  return res.status(200).json({ success: true });
}