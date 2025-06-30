import { prisma } from "@/lib/prisma";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const { userId } = req.query;
      const where = userId ? { authorId: Number(userId) } : undefined;

      const posts = await prisma.Post.findMany({
        where,
        include: {
          author: true,
          comments: {
            include: {
              author: true,
              replies: {
                include: {
                  author: true 
                }
              }
            }
          }
        },
        orderBy: { createdAt: "desc" }
      });
      return res.status(200).json(posts);
    } catch (err) {
      console.error("Erro ao buscar posts:", err);
      return res.status(500).json({ error: "Erro ao buscar posts." });
    }
  }

  if (req.method === "POST") {
    try {
      const { content, authorId, image } = req.body;
      if (!content || !authorId) {
        return res.status(400).json({ error: "Conteúdo e authorId são obrigatórios." });
      }
      const post = await prisma.Post.create({
        data: {
          content,
          authorId: Number(authorId),
          image,
        }
      });
      return res.status(201).json(post);
    } catch (err) {
      console.error("Erro ao criar post:", err);
      return res.status(500).json({ error: "Erro ao criar post." });
    }
  }

  return res.status(405).json({ error: "Método não permitido" });
}