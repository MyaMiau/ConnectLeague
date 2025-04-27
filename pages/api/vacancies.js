import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const vacancies = await prisma.vacancies.findMany({
        include: {
          applications: true,
          organization: true,
        },
      });
      res.status(200).json(vacancies);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erro ao buscar vagas" });
    }
  } else if (req.method === "POST") {
    try {
      const { title, description, organizationId } = req.body;

      const newVacancy = await prisma.vacancies.create({
        data: {
          title,
          description,
          organization_id: organizationId,
        },
      });

      res.status(201).json(newVacancy);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erro ao criar vaga" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Método ${req.method} não permitido`);
  }
}
