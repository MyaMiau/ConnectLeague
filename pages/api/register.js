import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { name, email, password, role, birthDate, bio, image, status, elo } = req.body;

  if (!name || !email || !password || !role || !birthDate) {
    return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
  }

  try {
    // Verifica se o e-mail já existe
    const existing = await prisma.users.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'E-mail já cadastrado.' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cria o novo usuário
    const user = await prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        birthDate: new Date(birthDate),
        bio: bio || null,
        image: image || null,
        status: status || null,
        elo: elo || null,
        // outros campos se precisar
      },
    });

    // Retorna apenas dados seguros
    return res.status(201).json({ id: user.id, name: user.name, email: user.email });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao registrar usuário.' });
  }
}