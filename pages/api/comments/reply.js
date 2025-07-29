import prisma from "../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  const userIdSession = session?.user?.id;

  if (req.method === "POST") {
    const { content, authorId, postId, commentId, parentReplyId = null } = req.body;
    if (!content || !authorId || !postId || !commentId) {
      return res.status(400).json({ error: "Campos obrigatórios: content, authorId, postId, commentId." });
    }
    if (!userIdSession || Number(authorId) !== Number(userIdSession)) {
      return res.status(401).json({ error: 'Usuário não autenticado.' });
    }
    try {
      const reply = await prisma.reply.create({
        data: {
          content,
          authorId: Number(authorId),
          postId: Number(postId),
          commentId: Number(commentId),
          parentReplyId: parentReplyId ? Number(parentReplyId) : null,
        },
        include: {
          author: true,
          subReplies: {
            include: { author: true }
          }
        }
      });

      // Notificação: ao responder um comentário, notifica o autor do comentário 
      const comment = await prisma.comment.findUnique({ where: { id: Number(commentId) } });
      if (comment && comment.authorId !== Number(authorId)) {
        await prisma.notification.create({
          data: {
            type: "reply",
            userId: comment.authorId,    
            senderId: Number(authorId),  
            commentId: Number(commentId)
          }
        });
      }

      return res.status(201).json(reply);
    } catch (err) {
      console.error("Erro ao criar resposta:", err);
      return res.status(500).json({ error: "Erro ao criar resposta." });
    }
  } else {
    return res.status(405).json({ message: "Método não permitido" });
  }
}