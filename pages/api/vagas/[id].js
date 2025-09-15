import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]"; 

export default async function handler(req, res) {
  const vagaId = Number(req.query.id);

  if (!vagaId || isNaN(vagaId)) {
    return res.status(400).json({ error: "ID de vaga inválido." });
  }

  const session = await getServerSession(req, res, authOptions);
  console.log("SESSION DEBUG:", session);

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
if (!session || !["organizacao", "organization"].includes(session.user.type))
  return res.status(401).json({ error: "Não autenticado como organização." });
    await prisma.vacancies.delete({ where: { id: vagaId } });
    return res.status(204).end();
  }

  // Candidatar-se
  if (req.method === "POST") {
    if (
      !session ||
      !["player", "jogador", "coach", "manager", "psychologist", "psicologo", "designer"].includes(session.user.type)
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

    // Cria notificação para a organização
    const vaga = await prisma.vacancies.findUnique({ where: { id: vagaId } });
    if (vaga && vaga.organization_id) {
      await prisma.notification.create({
        data: {
          type: "candidatura",
          userId: vaga.organization_id,
          senderId: Number(session.user.id),
          postId: null,
          commentId: null,
          read: false,
          createdAt: new Date(),
        },
      });
    }

    return res.status(201).json({ candidatura });
  }

  // PATCH: Salvar/remover favoritos OU descandidatar
  if (req.method === "PATCH") {
    if (!session || !session.user) return res.status(401).json({ error: "Não autenticado." });
    const { action } = req.body;

    if (action === "descandidatar") {
      await prisma.applications.deleteMany({
        where: { vacancy_id: vagaId, user_id: Number(session.user.id) }
      });
      return res.status(200).json({ success: true });
    }

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
}