import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  const commentId = Number(req.query.id);

  if (isNaN(commentId)) {
    return res.status(400).json({ error: "ID inválido." });
  }

  if (req.method === "GET") {
    try {
      const comment = await prisma.comment.findUnique({
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
  } else if (req.method === "PUT") {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: "Conteúdo é obrigatório para editar." });
    }
    try {
      const comment = await prisma.comment.update({
        where: { id: commentId },
        data: { content }
      });
      return res.status(200).json(comment);
    } catch (err) {
      console.error("Erro ao editar comentário:", err);
      if (
        err.code === "P2025" || // Prisma: record not found
        err.message?.includes("Record to update not found")
      ) {
        return res.status(404).json({ error: "Comentário não encontrado." });
      }
      return res.status(500).json({ error: "Erro ao editar comentário." });
    }
  } else if (req.method === "DELETE") {
    try {
      await prisma.comment.delete({
        where: { id: commentId }
      });
      return res.status(204).end();
    } catch (err) {
      console.error("Erro ao deletar comentário:", err);
      if (
        err.code === "P2025" || // Prisma: record not found
        err.message?.includes("Record to delete does not exist")
      ) {
        return res.status(404).json({ error: "Comentário não encontrado para deletar." });
      }
      return res.status(500).json({ error: "Erro ao deletar comentário." });
    }
  } else {
    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}