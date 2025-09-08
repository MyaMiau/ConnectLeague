import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user?.id) {
    return res.status(401).json({ error: "Usuário não autenticado." });
  }

  const userId = Number(session.user.id);
  if (!userId || isNaN(userId)) {
    return res.status(400).json({ error: "ID de usuário inválido." });
  }

  // Busca as vagas salvas (favoritadas) pelo usuário
  const favoritos = await prisma.vacancyFavorite.findMany({
    where: { userId },
    include: {
      vacancy: {
        include: {
          organization: true,
          applications: true,
          favorites: true,
        },
      },
    },
  });

  // Extrai só as vagas
  const vagas = favoritos.map(fav => fav.vacancy);

  return res.status(200).json({ vagas });
}