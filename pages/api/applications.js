import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const applications = await prisma.applications.findMany({
        include: {
          user: true,
          vacancy: true,
        },
      });
      res.status(200).json(applications);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao buscar candidaturas' });
    }
  } else if (req.method === 'POST') {
    try {
      const { user_id, vacancy_id, status } = req.body;

      const newApplication = await prisma.applications.create({
        data: {
          user_id,
          vacancy_id,
          status,
        },
      });

      res.status(201).json(newApplication);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao criar candidatura' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Método ${req.method} não permitido`);
  }
}