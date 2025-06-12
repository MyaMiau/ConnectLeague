import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  console.log("📥 Chegou na rota /api/register");

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "Todos os campos são obrigatórios" });
  }

  try {
    // Verifica se o e-mail já está cadastrado
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ message: "E-mail já cadastrado" });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criação do usuário
    await prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        birthDate: new Date("2000-01-01"), // substitua ou atualize isso conforme necessário
      },
    });

    return res.status(201).json({ message: "Usuário criado com sucesso" });
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
}

