import prisma from '@/lib/prisma';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const jobs = await prisma.job.findMany({
        include: {
          applications: true,
        },
      });
      res.status(200).json(jobs);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao buscar vagas' });
    }
  } else if (req.method === 'POST') {
    try {
      const { title, description, organizationId } = req.body;

      const newJob = await prisma.job.create({
        data: {
          title,
          description,
          organizationId,
        },
      });

      res.status(201).json(newJob);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao criar vaga' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Método ${req.method} não permitido`);
  }
}