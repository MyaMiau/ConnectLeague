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
      // Apaga likes do post
      await prisma.PostLike.deleteMany({ where: { postId } });

      // Apaga notificações ligadas ao post
      await prisma.Notification.deleteMany({ where: { postId } });

      // Apaga replies diretamente ligados ao post (por segurança, apesar do onDelete cascade)
      await prisma.Reply.deleteMany({ where: { postId } });

      // Apaga comentários (e, por cascade, CommentLikes e Replies ligados ao comentário)
      await prisma.Comment.deleteMany({ where: { postId } });

      // Finalmente apaga o post
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
      // Atualiza o post
      await prisma.Post.update({
        where: { id: postId },
        data: { content, image },
      });

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

      return res.status(200).json({ post });
    } catch (err) {
      console.error("Erro ao editar post:", err);
      return res.status(500).json({ error: "Erro ao editar post." });
    }
  }

  return res.status(405).json({ error: "Método não permitido" });
}