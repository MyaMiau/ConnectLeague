import prisma from "../../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";

export default async function handler(req, res) {
  const postId = Number(req.query.id);
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: "Not authenticated" });
  const userId = Number(session.user.id);

  if (req.method === "POST") {

    const existing = await prisma.postLike.findUnique({
      where: { userId_postId: { userId, postId } }
    });
    if (existing) {
      await prisma.postLike.delete({
        where: { userId_postId: { userId, postId } }
      });
      return res.status(200).json({ liked: false });
    } else {
      await prisma.postLike.create({
        data: { userId, postId }
      });
      return res.status(200).json({ liked: true });
    }
  }
  res.setHeader("Allow", ["POST"]);
  res.status(405).end();
}