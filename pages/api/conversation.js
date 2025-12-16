import prisma from "../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: "Not authenticated" });
  const userId = Number(session.user.id);

  if (req.method === "POST") {
    // cria ou retorna conversa entre userId e otherUserId (body: { otherUserId })
    const { otherUserId } = req.body;
    if (!otherUserId) return res.status(400).json({ error: "otherUserId required" });

    try {
      // verifica conversa existente que contenha ambos participantes
      const existing = await prisma.conversation.findFirst({
        where: {
          AND: [
            { participants: { some: { userId } } },
            { participants: { some: { userId: Number(otherUserId) } } },
          ],
        },
        include: {
          participants: { include: { user: { select: { id: true, name: true, image: true } } } },
          messages: { orderBy: { createdAt: "asc" }, take: 50, include: { sender: { select: { id: true, name: true, image: true } } } },
        },
      });

      if (existing) return res.status(200).json(existing);

      // cria nova conversa
      const conv = await prisma.conversation.create({
        data: {
          participants: {
            create: [{ userId }, { userId: Number(otherUserId) }],
          },
        },
        include: { participants: { include: { user: { select: { id: true, name: true, image: true } } } } },
      });

      return res.status(201).json(conv);
    } catch (err) {
      console.error("Erro em /api/conversations POST:", err);
      return res.status(500).json({ error: "Erro ao criar/recuperar conversa" });
    }
  }

  if (req.method === "GET") {
    // lista conversas do usuário com último message e unread
    try {
      const convs = await prisma.conversation.findMany({
        where: { participants: { some: { userId } } },
        include: {
          participants: { include: { user: { select: { id: true, name: true, image: true } } } },
          messages: { take: 1, orderBy: { createdAt: "desc" } },
        },
        orderBy: { updatedAt: "desc" },
      });

      // estrutura simples para o frontend
      const data = convs.map((c) => ({
        id: c.id,
        updatedAt: c.updatedAt,
        participants: c.participants.map(p => ({
          id: p.id,
          userId: p.userId,
          unreadCount: p.unreadCount,
          user: p.user,
        })),
        lastMessage: c.messages?.[0] || null,
      }));

      return res.status(200).json(data);
    } catch (err) {
      console.error("Erro em /api/conversations GET:", err);
      return res.status(500).json({ error: "Erro ao listar conversas" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end();
}