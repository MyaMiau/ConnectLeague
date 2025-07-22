import prisma from "../../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";

export default async function handler(req, res) {
  const postId = Number(req.query.id);
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: "Not authenticated" });

  const userId = Number(session.user.id);

  if (req.method === "POST") {
    try {
      await prisma.postLike.create({
        data: { userId, postId }
      });
      return res.status(200).json({ success: true });
    } catch (e) {
      if (e.code === "P2002") return res.status(409).json({ error: "Already liked" });
      return res.status(500).json({ error: e.message || "Server error" });
    }
  }
  if (req.method === "DELETE") {
    try {
      await prisma.postLike.deleteMany({
        where: { userId, postId }
      });
      return res.status(200).json({ success: true });
    } catch (e) {
      return res.status(500).json({ error: e.message || "Server error" });
    }
  }
  res.setHeader("Allow", ["POST", "DELETE"]);
  res.status(405).end();
}