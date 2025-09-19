import prisma from "../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]"; 

export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: "ID é obrigatório" });
  const session = await getServerSession(req, res, authOptions);
  const loggedUserId = session?.user?.id;

  if (req.method === "GET") {
    try {
      const org = await prisma.users.findUnique({
        where: { id: Number(id) },
        select: {
          id: true,
          logo: true,
          name: true,
          bio: true,
          type: true,
          email: true,
          type: true,
          orgName: true,
          orgDesc: true,
          image: true
        }
      });
      if (!org || org.type !== "organization") {
        return res.status(404).json({ error: "Organização não encontrada" });
      }
      res.status(200).json({ organization: { ...org, isCurrentUser: Number(loggedUserId) === Number(id) } });
    } catch (err) {
      res.status(500).json({ error: "Erro ao buscar organização" });
    }
    return;
  }

  if (req.method === "PUT") {
    if (!loggedUserId || Number(loggedUserId) !== Number(id)) {
      return res.status(403).json({ error: "Você não tem permissão para editar este perfil." });
    }
    const { logo, name, bio, email, orgName, orgDesc, image } = req.body;
    try {
      const org = await prisma.users.update({
        where: { id: Number(id) },
        data: { logo, name, bio, email, orgName, orgDesc, image }
      });
      res.status(200).json({ organization: org });
    } catch (err) {
      res.status(500).json({ error: "Erro ao atualizar organização" });
    }
    return;
  }

  res.status(405).json({ error: "Método não permitido" });
}