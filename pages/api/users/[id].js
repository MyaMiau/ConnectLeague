import prisma from "../../../lib/prisma";


export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "ID é obrigatório" });
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    // Busca o usuário
    const user = await prisma.users.findUnique({
      where: { id: Number(id) },
      select: { 
        id: true, 
        name: true, 
        image: true, 
        email: true, 
        bio: true,
        role: true,
        elo: true,
        status: true,
        birthDate: true,
        type: true
      },
    });

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    // Busca os posts do usuário, incluindo todos os dados necessários
      const posts = await prisma.post.findMany({
        where: { authorId: Number(id) },
        orderBy: { createdAt: "desc" },
        include: {
          author: { select: { id: true, name: true, image: true } },
          postLikes: true,
          comments: {
            include: {
              author: { select: { id: true, name: true, image: true } },
              commentLikes: true,
              replies: {
                include: {
                  author: { select: { id: true, name: true, image: true } },
                  subReplies: {
                    include: {
                      author: { select: { id: true, name: true, image: true } },
                    }
                  }
                }
              }
            }
          }
        }
      });
    return res.status(200).json({ user, posts });
  } catch (err) {
    console.error("Erro ao buscar perfil e posts:", err);
    return res.status(500).json({ error: "Erro interno ao buscar perfil e posts" });
  }
}