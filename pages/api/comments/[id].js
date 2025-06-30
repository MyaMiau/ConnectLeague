import { prisma } from "@/lib/prisma";

export default async function handler(req, res) {
  const commentId = Number(req.query.id);

  if (isNaN(commentId)) {
    return res.status(400).json({ error: "ID inválido." });
  }

  if (req.method === "GET") {
    try {
      const comment = await prisma.Comment.findUnique({
        where: { id: commentId },
        include: { author: true, replies: { include: { author: true } } }
      });
      if (!comment) {
        return res.status(404).json({ error: "Comentário não encontrado." });
      }
      return res.status(200).json(comment);
    } catch (err) {
      console.error("Erro ao buscar comentário:", err);
      return res.status(500).json({ error: "Erro ao buscar comentário." });
    }
  }

  if (req.method === "PUT") {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: "Conteúdo é obrigatório para editar." });
    }
    try {
      const comment = await prisma.Comment.update({
        where: { id: commentId },
        data: { content }
      });
      return res.status(200).json(comment);
    } catch (err) {
      console.error("Erro ao editar comentário:", err);
      return res.status(500).json({ error: "Erro ao editar comentário." });
    }
  }

  if (req.method === "DELETE") {
    try {
      await prisma.Comment.delete({
        where: { id: commentId }
      });
      return res.status(204).end();
    } catch (err) {
      console.error("Erro ao deletar comentário:", err);
      return res.status(500).json({ error: "Erro ao deletar comentário." });
    }
  }

  res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}