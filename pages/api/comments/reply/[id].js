import prisma from "../../../../lib/prisma";

export default async function handler(req, res) {
  const replyId = Number(req.query.id);

  if (isNaN(replyId)) {
    return res.status(400).json({ error: "ID inválido." });
  }

  if (req.method === "DELETE") {
    try {
      await prisma.reply.delete({
        where: { id: replyId }
      });
      return res.status(204).end();
    } catch (err) {
      console.error("Erro ao deletar reply:", err);
      return res.status(500).json({ error: "Erro ao deletar reply." });
    }
  }

  if (req.method === "PUT") {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: "Conteúdo é obrigatório para editar." });
    }
    try {
      const reply = await prisma.reply.update({
        where: { id: replyId },
        data: { content }
      });
      return res.status(200).json(reply);
    } catch (err) {
      console.error("Erro ao editar reply:", err);
      return res.status(500).json({ error: "Erro ao editar reply." });
    }
  }

  res.setHeader("Allow", ["DELETE", "PUT"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}