import { getSession } from "next-auth/react";
import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  const session = await getSession({ req });
  if (!session?.user?.id) return res.status(401).json({ error: "Unauthorized" });

  const userId = Number(session.user.id); // <- Corrigido para Int

  if (req.method === "GET") {
    // Busca notificações do usuário, mais recentes primeiro
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return res.status(200).json(notifications);
  }

  if (req.method === "PATCH") {
    // Marca todas como lidas
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}