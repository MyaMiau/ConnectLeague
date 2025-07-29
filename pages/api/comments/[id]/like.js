import prisma from "../../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";

export default async function handler(req, res) {
  const commentId = Number(req.query.id);
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: "Not authenticated" });
  const userId = Number(session.user.id);

  if (req.method === "POST") {
    const existing = await prisma.commentLike.findUnique({
      where: { userId_commentId: { userId, commentId } }
    });

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { authorId: true, postId: true },
    });

    if (!comment) return res.status(404).json({ error: "Comment not found" });

    if (existing) {
      await prisma.commentLike.delete({
        where: { userId_commentId: { userId, commentId } }
      });
      // retorna o novo status
      return res.status(200).json({ liked: false });
    } else {
      await prisma.commentLike.create({
        data: { userId, commentId }
      });

      // Notificação: ao curtir comentário, notifica o autor (exceto se for ele mesmo)
      if (comment.authorId !== userId) {
        await prisma.notification.create({
          data: {
            type: "comment_like",
            userId: comment.authorId,
            senderId: userId,
            commentId: commentId,
            postId: comment.postId,
          },
        });
      }
      // retorna o novo status
      return res.status(200).json({ liked: true });
    }
  }
  res.setHeader("Allow", ["POST"]);
  res.status(405).end();
}