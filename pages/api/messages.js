import prisma from "../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: "Not authenticated" });
  const userId = Number(session.user.id);

  if (req.method === "POST") {
    const { conversationId, content } = req.body;
    if (!conversationId || !content) return res.status(400).json({ error: "conversationId and content required" });

    try {
      const message = await prisma.message.create({
        data: {
          conversationId: Number(conversationId),
          senderId: userId,
          content,
        },
        include: { sender: { select: { id: true, name: true, image: true } } },
      });

      const others = await prisma.conversationParticipant.findMany({
        where: { conversationId: Number(conversationId), NOT: { userId } },
      });

      for (const p of others) {
        await prisma.conversationParticipant.update({
          where: { id: p.id },
          data: { unreadCount: { increment: 1 } },
        });
      }

      await prisma.conversation.update({
        where: { id: Number(conversationId) },
        data: { updatedAt: new Date() },
      });

      return res.status(201).json(message);
    } catch (err) {
      console.error("Erro em /api/messages POST:", err);
      return res.status(500).json({ error: "Erro ao enviar mensagem" });
    }
  }

  if (req.method === "GET") {

    const { conversationId } = req.query;
    if (!conversationId) return res.status(400).json({ error: "conversationId required" });

    try {

      const part = await prisma.conversationParticipant.findFirst({
        where: { conversationId: Number(conversationId), userId },
      });
      if (part) {
        await prisma.conversationParticipant.update({ where: { id: part.id }, data: { unreadCount: 0 } });
      }

      const otherParticipants = await prisma.conversationParticipant.findMany({
        where: { conversationId: Number(conversationId), NOT: { userId } },
      });

      if (otherParticipants.length > 0) {
        const senderIds = otherParticipants.map(p => p.userId);
        await prisma.notification.deleteMany({
          where: {
            type: "message",
            userId: userId,           
            senderId: { in: senderIds } 
          }
        });
      }

      const messages = await prisma.message.findMany({
        where: { conversationId: Number(conversationId) },
        include: { sender: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: "asc" },
      });

      return res.status(200).json(messages);
    } catch (err) {
      console.error("Erro em /api/messages GET:", err);
      return res.status(500).json({ error: "Erro ao buscar mensagens" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end();
}