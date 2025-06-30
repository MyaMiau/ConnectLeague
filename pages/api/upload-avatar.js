import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "2mb", // Ajuste conforme necessário
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { base64, filename } = req.body;

  if (!base64 || !filename) {
    return res.status(400).json({ error: "Dados inválidos" });
  }

  // Remove prefixo do base64
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, "");
  const dataBuffer = Buffer.from(base64Data, "base64");

  // Caminho para salvar localmente (exemplo: /public/uploads/)
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  const filePath = path.join(uploadsDir, filename);
  fs.writeFileSync(filePath, dataBuffer);

  // Retorne a URL pública
  const url = `/uploads/${filename}`;
  return res.status(200).json({ url });
}