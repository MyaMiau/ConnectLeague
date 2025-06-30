import { prisma } from "@/lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { userId, imageUrl } = req.body;
  // Adapte para o seu schema!
  await prisma.user.update({
    where: { id: userId },
    data: { image: imageUrl },
  });

  res.status(200).json({ ok: true });
}