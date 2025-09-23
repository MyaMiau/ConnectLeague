import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const { userId } = req.query;
      const where = userId ? { authorId: Number(userId) } : undefined;

      const posts = await prisma.post.findMany({
        where,
        include: {
          author: true,
          postLikes: {
            include: {
              user: true, 
            },
          },
          comments: {
            include: {
              author: true,
              commentLikes: true, 
              replies: {
                include: {
                  author: true,
                },
              },
            },
          },
          replies: {
            include: {
              author: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      res.status(200).json(posts);
    } catch (err) {
      console.error("Erro ao buscar posts:", err);
      res.status(500).json({ error: "Erro ao buscar posts" });
    }
    return;
  }

  if (req.method === "POST") {
    try {
      const { content, image, authorId } = req.body;

      if (!content || !authorId) {
        return res.status(400).json({ error: "Conteúdo e autor são obrigatórios." });
      }

      const post = await prisma.post.create({
        data: {
          content,
          image,
          authorId: Number(authorId), 
        },
      });
      res.status(201).json(post);
    } catch (err) {
      console.error("Erro ao criar post:", err);
      res.status(500).json({ error: "Erro ao criar post" });
    }
    return;
  }

  // Se não for GET nem POST
  res.status(405).json({ error: "Método não permitido" });
}