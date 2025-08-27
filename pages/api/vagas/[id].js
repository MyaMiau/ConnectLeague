import prisma from "@/lib/prisma";
import { getSession } from "next-auth/react";

export default async function handler(req, res) {
  const vagaId = Number(req.query.id);
  const session = await getSession({ req });

  if (req.method === "GET") {
    const vaga = await prisma.vaga.findUnique({
      where: { id: vagaId },
      include: {
        organizacao: true,
        candidatos: { include: { usuario: true } },
        favoritos: true,
      }
    });
    if (!vaga) return res.status(404).json({ error: "Vaga não encontrada" });
    return res.status(200).json({ vaga });
  }

  if (req.method === "PUT") {
    if (!session || session.user.tipo !== "organizacao") return res.status(401).json({ error: "Não autenticado." });

    const { status, ...data } = req.body;
    // Fechar ou reabrir vaga
    if (status) {
      const vaga = await prisma.vaga.update({ where: { id: vagaId }, data: { status } });
      return res.status(200).json({ vaga });
    }

    const vaga = await prisma.vaga.update({ where: { id: vagaId }, data });
    return res.status(200).json({ vaga });
  }

  if (req.method === "DELETE") {
    if (!session || session.user.tipo !== "organizacao") return res.status(401).json({ error: "Não autenticado." });
    await prisma.vaga.delete({ where: { id: vagaId } });
    return res.status(204).end();
  }

  // Candidatar-se
  if (req.method === "POST") {
    if (!session || !["jogador", "coach", "manager", "psicologo", "designer"].includes(session.user.tipo)) {
      return res.status(401).json({ error: "Não autenticado." });
    }
    // Checa duplicidade
    const jaCandidatado = await prisma.candidatura.findFirst({ where: { vagaId, usuarioId: session.user.id } });
    if (jaCandidatado) return res.status(400).json({ error: "Você já se candidatou." });

    const candidatura = await prisma.candidatura.create({ data: { vagaId, usuarioId: session.user.id } });
    // TODO: Notificar organização (implementação futura)
    return res.status(201).json({ candidatura });
  }
}