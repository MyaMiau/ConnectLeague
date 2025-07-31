import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const user = await prisma.users.findUnique({
        where: { id: Number(id) },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          bio: true,
          elo: true,
          image: true,
          birthDate: true
        }
      });
      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      // Busque também os posts desse usuário
      const posts = await prisma.post.findMany({
        where: { authorId: Number(id) },
        orderBy: { createdAt: 'desc' },
      });

      res.status(200).json({ user, posts });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao buscar usuário' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Método ${req.method} não permitido`);
  }
}