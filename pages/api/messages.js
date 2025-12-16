import prisma from "../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: "Not authenticated" });
  const userId = Number(session.user.id);

  if (req.method === "POST") {
    // enviar mensagem: body { conversationId, content }
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

      // incrementa unreadCount dos outros participantes e cria notificação
      const others = await prisma.conversationParticipant.findMany({
        where: { conversationId: Number(conversationId), NOT: { userId } },
      });

      for (const p of others) {
        await prisma.conversationParticipant.update({
          where: { id: p.id },
          data: { unreadCount: { increment: 1 } },
        });

        // cria notificação (adaptar campos se seu schema for diferente)
        await prisma.notification.create({
          data: {
            type: "message",
            userId: p.userId, // quem recebe a notificação
            senderId: userId,
            // se quiser adicionar referência, crie campos correspondentes no notifications
            // e descomente abaixo (caso existam):
            // conversationId: Number(conversationId),
            // messageId: message.id,
          },
        });
      }

      // atualiza updatedAt da conversa
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
    // pegar mensagens de uma conversa: ?conversationId=ID
    const { conversationId } = req.query;
    if (!conversationId) return res.status(400).json({ error: "conversationId required" });

    try {
      // zera unreadCount para este usuário na conversa
      const part = await prisma.conversationParticipant.findFirst({
        where: { conversationId: Number(conversationId), userId },
      });
      if (part) {
        await prisma.conversationParticipant.update({ where: { id: part.id }, data: { unreadCount: 0 } });
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