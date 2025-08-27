import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  const postId = Number(req.query.id);

  if (req.method === "GET") {
    try {
      const post = await prisma.Post.findUnique({
        where: { id: postId },
        include: {
          author: true,
          postLikes: true,
          comments: {
            include: {
              author: true,
              commentLikes: true,
              replies: {
                include: {
                  author: true,
                  subReplies: {
                    include: { author: true }
                  }
                }
              }
            },
          },
        },
      });
      if (!post) return res.status(404).json({ error: "Post não encontrado" });
      return res.status(200).json({ post });
    } catch (err) {
      console.error("Erro ao buscar post:", err);
      return res.status(500).json({ error: "Erro ao buscar post." });
    }
  }

  if (req.method === "DELETE") {
    try {
      await prisma.Comment.deleteMany({ where: { postId } });
      await prisma.Post.delete({ where: { id: postId } });
      return res.status(204).end();
    } catch (err) {
      console.error("Erro ao deletar post:", err);
      return res.status(500).json({ error: "Erro ao deletar post." });
    }
  }

  if (req.method === "PUT") {
    const { content, image } = req.body;
    try {
      const post = await prisma.Post.update({
        where: { id: postId },
        data: { content, image },
      });
      return res.status(200).json({ post });
    } catch (err) {
      console.error("Erro ao editar post:", err);
      return res.status(500).json({ error: "Erro ao editar post." });
    }
  }

  return res.status(405).json({ error: "Método não permitido" });
}