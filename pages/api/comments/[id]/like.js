import prisma from "../../../../lib/prisma";

export default async function handler(req, res) {
  const commentId = Number(req.query.id);

  if (isNaN(commentId)) {
    return res.status(400).json({ error: "ID inválido." });
  }

  if (req.method === "POST") {
    try {
      // Considerando que há um campo 'likes' em Comment (tipo Int)
      const updated = await prisma.comment.update({
        where: { id: commentId },
        data: { likes: { increment: 1 } }
      });
      return res.status(200).json(updated);
    } catch (err) {
      console.error("Erro ao dar like:", err);
      return res.status(500).json({ error: "Erro ao dar like." });
    }
  }

  res.setHeader("Allow", ["POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}