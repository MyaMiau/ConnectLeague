import prisma from "../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    const { content, postId, commentId, parentReplyId } = req.body;
    if (!content || !postId || !commentId) {
      return res.status(400).json({ error: "Campos obrigatórios faltando." });
    }
    try {
      const reply = await prisma.reply.create({
        data: {
          content,
          authorId: Number(session.user.id),
          postId: Number(postId),
          commentId: Number(commentId),
          parentReplyId: parentReplyId ? Number(parentReplyId) : null,
        },
        include: {
          author: true,
          subReplies: { include: { author: true } }
        }
      });

      // Notificação: ao responder um comentário, notifica o autor do comentário (exceto se for ele mesmo)
      const comment = await prisma.comment.findUnique({ where: { id: Number(commentId) } });
      if (comment && comment.authorId !== Number(session.user.id)) {
        await prisma.notification.create({
          data: {
            type: "reply",
            userId: comment.authorId,
            senderId: Number(session.user.id),
            postId: Number(postId),
            commentId: Number(commentId),
          }
        });
      }

      return res.status(201).json(reply);
    } catch (err) {
      console.error("Erro ao criar reply:", err);
      return res.status(500).json({ error: "Erro interno ao criar reply." });
    }
  }
  res.setHeader("Allow", ["POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}