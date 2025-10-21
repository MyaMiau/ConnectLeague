import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const {
    name,
    email,
    password,
    type,        
    role,        
    birthDate,
    bio,
    image,
    status,
    elo,
    orgName,     // só organizações
    cnpj,        // só organizações
    orgDesc      // só organizações
  } = req.body;

  // Validação dos campos obrigatórios
  if (!name || !email || !password || !type || !birthDate) {
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

    // Monta objeto de dados para criação
    const userData = {
      name,
      email,
      password: hashedPassword,
      type,
      birthDate: new Date(birthDate),
      bio: bio || null,
      image: image || null,
      status: status || null,
      elo: elo || null,
    };

    // Só adiciona role se for player
    if (type === "player" && role) {
      userData.role = role;
    }

    // Só adiciona campos de organização se for organization
    if (type === "organization") {
      userData.orgName = orgName || null;
      userData.cnpj = cnpj || null;
      userData.orgDesc = orgDesc || null;
    }

    // Cria o novo usuário
    const user = await prisma.users.create({ data: userData });

    // Retorna apenas dados seguros
    return res.status(201).json({ id: user.id, name: user.name, email: user.email, type: user.type });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao registrar usuário.' });
  }
}