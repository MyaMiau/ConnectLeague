import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const {
      pagina = 1,
      limite = 10,
      termo = "",
      tiposUsuario,
      posicoes,
      elos,
      cidade,
      estado,
      tags,
      ordenar = "recentes"
    } = req.query;

    // Monta filtros dinamicamente
    const where = {
      ...(termo && {
        OR: [
          { title: { contains: termo, mode: "insensitive" } },
          { description: { contains: termo, mode: "insensitive" } },
          { tags: { has: termo } }
        ]
      }),
      ...(tiposUsuario && { userTypes: { hasSome: Array.isArray(tiposUsuario) ? tiposUsuario : [tiposUsuario] } }),
      ...(posicoes && { positions: { hasSome: Array.isArray(posicoes) ? posicoes : [posicoes] } }),
      ...(elos && { elos: { hasSome: Array.isArray(elos) ? elos : [elos] } }),
      ...(cidade && { city: cidade }),
      ...(estado && { state: estado }),
      ...(tags && { tags: { hasSome: Array.isArray(tags) ? tags : [tags] } }),
      status: "Aberta",
    };

    const vagas = await prisma.vacancies.findMany({
      where,
      orderBy: ordenar === "recentes" ? { created_at: "desc" } : { id: "asc" },
      skip: (Number(pagina) - 1) * Number(limite),
      take: Number(limite),
      include: {
        organization: true,
        applications: true,
        favorites: true,
      }
    });

    res.status(200).json({ vagas });
  }

  if (req.method === "POST") {
    const session = await getServerSession(req, res, authOptions);
    console.log("SESSION DEBUG:", session);
    if (!session || session.user.type !== "organizacao")
      return res.status(401).json({ error: "Não autenticado como organização." });

    const { title, description, requirements, benefits, userTypes, positions, elos, city, state, tags } = req.body;
    const vaga = await prisma.vacancies.create({
      data: {
        title,
        description,
        requirements,
        benefits,
        userTypes,
        positions,
        elos,
        city,
        state,
        tags,
        status: "Aberta",
        organization_id: session.user.id,
      }
    });
    res.status(201).json({ vaga });
  }
}