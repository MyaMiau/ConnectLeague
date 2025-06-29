import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Nunca retorne o password!
      const users = await prisma.users.findMany({
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
      res.status(200).json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
  } else if (req.method === 'POST') {
    try {
      const { name, email, password, role, birthDate } = req.body;

      const newUser = await prisma.users.create({
        data: {
          name,
          email,
          password,
          role,
          birthDate: new Date(birthDate),
        },
      });

      // Não envie o password de volta!
      const { password: _, ...userWithoutPassword } = newUser;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao criar usuário' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { id, name, role, status, bio, elo, image } = req.body;

      const updatedUser = await prisma.users.update({
        where: { id },
        data: { name, role, status, bio, elo, image },
      });

      res.status(200).json(updatedUser);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT']);
    res.status(405).end(`Método ${req.method} não permitido`);
  }
}