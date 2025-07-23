import prisma from "../../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";

export default async function handler(req, res) {
  const commentId = Number(req.query.id); // <- esta linha garante que commentId existe!
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: "Not authenticated" });
  const userId = Number(session.user.id);

  if (req.method === "POST") {
    const existing = await prisma.commentLike.findUnique({
      where: { userId_commentId: { userId, commentId } }
    });
    if (existing) {
      await prisma.commentLike.delete({
        where: { userId_commentId: { userId, commentId } }
      });
      return res.status(200).json({ liked: false });
    } else {
      await prisma.commentLike.create({
        data: { userId, commentId }
      });
      return res.status(200).json({ liked: true });
    }
  }
  res.setHeader("Allow", ["POST"]);
  res.status(405).end();
}