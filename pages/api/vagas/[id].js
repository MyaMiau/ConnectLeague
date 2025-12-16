import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  const vagaId = Number(req.query.id);

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

  // Somente organizações podem editar uma vaga 
  if (req.method === "PUT") {
    if (!session || !["organizacao", "organization"].includes(session.user.type))
      return res.status(401).json({ error: "Não autenticado como organização." });

    // Verifica se a vaga pertence à organização logada
    const vaga = await prisma.vacancies.findUnique({ where: { id: vagaId } });
    if (!vaga || vaga.organization_id !== Number(session.user.id))
      return res.status(403).json({ error: "Acesso negado: só a organização dona pode editar esta vaga." });

    // Permite atualizar status OU todos os dados do formulário
    const { status, ...data } = req.body;
    let updated;
    if (typeof status !== "undefined") {
      updated = await prisma.vacancies.update({ where: { id: vagaId }, data: { status } });
    } else {
      updated = await prisma.vacancies.update({ where: { id: vagaId }, data });
    }
    return res.status(200).json({ vaga: updated });
  }

  // Somente organizações podem deletar uma vaga
  if (req.method === "DELETE") {
    if (!session || !["organizacao", "organization"].includes(session.user.type))
      return res.status(401).json({ error: "Não autenticado como organização." });

    const vaga = await prisma.vacancies.findUnique({ where: { id: vagaId } });
    if (!vaga || vaga.organization_id !== Number(session.user.id))
      return res.status(403).json({ error: "Acesso negado: só a organização dona pode deletar esta vaga." });

    await prisma.vacancies.delete({ where: { id: vagaId } });
    return res.status(204).end();
  }

  // Candidatar-se (somente jogadores e afins)
  if (req.method === "POST") {
    if (
      !session ||
      !["player", "jogador", "coach", "manager", "psychologist", "psicologo", "designer"].includes(session.user.type)
    ) {
      return res.status(401).json({ error: "Somente jogadores podem se candidatar." });
    }

    try {
      // Transação para garantir que o status não mude entre a checagem e a criação
      const result = await prisma.$transaction(async (tx) => {
        const vagaAtual = await tx.vacancies.findUnique({ where: { id: vagaId } });

        if (!vagaAtual) {
          return { error: "Vaga não encontrada", status: 404 };
        }

        if (vagaAtual.status !== "Aberta") {
          return { error: "Vaga fechada. Não é possível se candidatar.", status: 403 };
        }

        // evita duplicata (também adicionar @@unique no schema é recomendado)
        const jaCandidatado = await tx.applications.findFirst({
          where: { vacancy_id: vagaId, user_id: Number(session.user.id) },
        });
        if (jaCandidatado) {
          return { error: "Você já se candidatou.", status: 400 };
        }

        const candidatura = await tx.applications.create({
          data: { vacancy_id: vagaId, user_id: Number(session.user.id) },
        });

        // cria notificação para a organização
        if (vagaAtual && vagaAtual.organization_id) {
          await tx.notification.create({
            data: {
              type: "candidatura",
              userId: vagaAtual.organization_id,
              senderId: Number(session.user.id),
              postId: null,
              commentId: null,
              read: false,
              createdAt: new Date(),
              message: `${session.user.name} se candidatou à vaga ${vagaAtual.title}`,
              link: `/vagas/${vagaId}`,
            },
          });
        }

        return { candidatura, status: 201 };
      });

      if (result.error) return res.status(result.status).json({ error: result.error });
      return res.status(201).json({ candidatura: result.candidatura });
    } catch (err) {
      console.error("Erro ao candidatar:", err);
      return res.status(500).json({ error: "Erro interno ao candidatar." });
    }
  }

  if (req.method === "PATCH") {
    if (!session || !session.user) return res.status(401).json({ error: "Não autenticado." });
    const { action } = req.body;

    // Somente jogadores podem descandidatar
    if (action === "descandidatar") {
      if (!["player", "jogador", "coach", "manager", "psychologist", "psicologo", "designer"].includes(session.user.type)) {
        return res.status(403).json({ error: "Somente jogadores podem cancelar candidatura!" });
      }
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