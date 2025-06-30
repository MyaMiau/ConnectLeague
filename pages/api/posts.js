import prisma from "../../lib/prisma"; // ajuste o caminho se necessário

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Método não permitido" });
    }

    const { userId } = req.query;
    const where = userId ? { authorId: Number(userId) } : undefined;

    const posts = await prisma.post.findMany({
      where,
      include: {
        author: true,
        comments: {
          include: {
            author: true,
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
}