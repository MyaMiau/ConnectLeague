import prisma from "../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: "Não autenticado" });
  }
  const userId = session.user.id;

  if (req.method === "GET") {
    try {
      // Busca notificações do usuário autenticado
      const notifications = await prisma.notification.findMany({
        where: { userId: Number(userId) },
        include: {
          sender: { select: { id: true, name: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      res.status(200).json(notifications);
    } catch (err) {
      console.error("Erro ao buscar notificações:", err);
      res.status(500).json({ error: "Erro ao buscar notificações", details: err.message });
    }
    return;
  }

  if (req.method === "PATCH") {
    // Marcar todas como lidas
    try {
      await prisma.notification.updateMany({
        where: { userId: Number(userId), read: false },
        data: { read: true },
      });
      res.status(200).json({ ok: true });
    } catch (err) {
      console.error("Erro ao marcar notificações como lidas:", err);
      res.status(500).json({ error: "Erro ao marcar notificações como lidas", details: err.message });
    }
    return;
  }

  res.status(405).json({ error: "Método não permitido" });
}