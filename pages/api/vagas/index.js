import prisma from "@/lib/prisma";
import { getSession } from "next-auth/react";

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
          { titulo: { contains: termo, mode: "insensitive" } },
          { descricao: { contains: termo, mode: "insensitive" } },
          { tags: { has: termo } }
        ]
      }),
      ...(tiposUsuario && { tiposUsuario: { hasSome: Array.isArray(tiposUsuario) ? tiposUsuario : [tiposUsuario] } }),
      ...(posicoes && { posicoes: { hasSome: Array.isArray(posicoes) ? posicoes : [posicoes] } }),
      ...(elos && { elos: { hasSome: Array.isArray(elos) ? elos : [elos] } }),
      ...(cidade && { cidade }),
      ...(estado && { estado }),
      ...(tags && { tags: { hasSome: Array.isArray(tags) ? tags : [tags] } }),
      status: "Aberta",
    };

    const vagas = await prisma.vaga.findMany({
      where,
      orderBy: ordenar === "recentes" ? { dataPublicacao: "desc" } : { id: "asc" },
      skip: (Number(pagina) - 1) * Number(limite),
      take: Number(limite),
      include: {
        organizacao: true,
        candidatos: true,
        favoritos: true,
      }
    });

    res.status(200).json({ vagas });
  }

  if (req.method === "POST") {
    const session = await getSession({ req });
    if (!session || session.user.tipo !== "organizacao") return res.status(401).json({ error: "Não autenticado como organização." });

    const { titulo, descricao, requisitos, beneficios, tiposUsuario, posicoes, elos, cidade, estado, tags } = req.body;
    const vaga = await prisma.vaga.create({
      data: {
        titulo, descricao, requisitos, beneficios,
        tiposUsuario, posicoes, elos, cidade, estado, tags,
        status: "Aberta",
        organizacaoId: session.user.id,
      }
    });
    res.status(201).json({ vaga });
  }
}