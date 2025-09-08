import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]"; 

export default async function handler(req, res) {
  const vagaId = Number(req.query.id);

  // Proteção para id inválido ou ausente
  if (!vagaId || isNaN(vagaId)) {
    return res.status(400).json({ error: "ID de vaga inválido." });
  }

  const session = await getServerSession(req, res, authOptions);

  if (req.method === "GET") {
    const vaga = await prisma.vacancies.findUnique({
      where: { id: vagaId },
      include: {
        organization: true,
        applications: { include: { user: true } },
        favorites: true,
      }
    });
    if (!vaga) return res.status(404).json({ error: "Vaga não encontrada" });
    return res.status(200).json({ vaga });
  }

  if (req.method === "PUT") {
    if (!session || session.user.type !== "organizacao") return res.status(401).json({ error: "Não autenticado." });

    const { status, ...data } = req.body;
    if (status) {
      const vaga = await prisma.vacancies.update({ where: { id: vagaId }, data: { status } });
      return res.status(200).json({ vaga });
    }
    const vaga = await prisma.vacancies.update({ where: { id: vagaId }, data });
    return res.status(200).json({ vaga });
  }

  if (req.method === "DELETE") {
    if (!session || session.user.type !== "organizacao") return res.status(401).json({ error: "Não autenticado." });
    await prisma.vacancies.delete({ where: { id: vagaId } });
    return res.status(204).end();
  }

  // Candidatar-se
  if (req.method === "POST") {
    if (
      !session ||
      !["jogador", "coach", "manager", "psicologo", "designer"].includes(session.user.type)
    ) {
      return res.status(401).json({ error: "Não autenticado." });
    }
    const jaCandidatado = await prisma.applications.findFirst({
      where: { vacancy_id: vagaId, user_id: Number(session.user.id) }
    });
    if (jaCandidatado) return res.status(400).json({ error: "Você já se candidatou." });

    const candidatura = await prisma.applications.create({
      data: { vacancy_id: vagaId, user_id: Number(session.user.id) }
    });
    return res.status(201).json({ candidatura });
  }

  // Salvar ou remover dos salvos
  if (req.method === "PATCH") {
    if (!session || !session.user) return res.status(401).json({ error: "Não autenticado." });
    const { action } = req.body;

    if (action === "salvar") {
      const jaFavoritou = await prisma.vacancyFavorite.findFirst({
        where: { vacancyId: vagaId, userId: Number(session.user.id) }
      });
      if (jaFavoritou) return res.status(200).json({ success: true, already: true });

      await prisma.vacancyFavorite.create({
        data: { vacancyId: vagaId, userId: Number(session.user.id) }
      });
      return res.status(200).json({ success: true });
    }

    if (action === "remover_salvo") {
      await prisma.vacancyFavorite.deleteMany({
        where: { vacancyId: vagaId, userId: Number(session.user.id) }
      });
      return res.status(200).json({ success: true });
    }

    return res.status(400).json({ error: "Ação inválida." });
  }

  return res.status(405).json({ error: "Método não permitido." });
}