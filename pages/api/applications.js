// src/pages/api/applications.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const applications = await prisma.application.findMany({
        include: {
          user: true,
          job: true,
        },
      });
      res.status(200).json(applications);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao buscar candidaturas' });
    }
  } else if (req.method === 'POST') {
    try {
      const { userId, jobId, status } = req.body;

      const newApplication = await prisma.application.create({
        data: {
          userId,
          jobId,
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
