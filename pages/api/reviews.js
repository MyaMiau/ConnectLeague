import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const reviews = await prisma.reviews.findMany();
      res.status(200).json(reviews);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao buscar avaliações' });
    }
  } else if (req.method === 'POST') {
    try {
      const { reviewerId, reviewedId, rating, comment } = req.body;

      const newReview = await prisma.reviews.create({
        data: {
          reviewerId,
          reviewedId,
          rating,
          comment,
        },
      });

      res.status(201).json(newReview);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao criar avaliação' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Método ${req.method} não permitido`);
  }
}