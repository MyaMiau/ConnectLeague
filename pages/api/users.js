// pages/api/users.js

// src/pages/api/users.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const users = await prisma.user.findMany();
      res.status(200).json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
  } else if (req.method === 'POST') {
    try {
      const { name, email, password, role, birthDate } = req.body;

      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          password,
          role,
          birthDate: new Date(birthDate),
        },
      });

      res.status(201).json(newUser);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao criar usuário' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Método ${req.method} não permitido`);
  }
}
