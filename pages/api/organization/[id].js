import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: "ID é obrigatório" });

  if (req.method === "GET") {
    const org = await prisma.organization.findUnique({
      where: { id: Number(id) },
      select: { id: true, logo: true, name: true, bio: true, email: true }
    });
    if (!org) return res.status(404).json({ error: "Organização não encontrada" });
    res.status(200).json({ organization: org });
  }

  if (req.method === "PUT") {
    const { logo, name, bio, email } = req.body;
    const org = await prisma.organization.update({
      where: { id: Number(id) },
      data: { logo, name, bio, email }
    });
    res.status(200).json({ organization: org });
  }
}