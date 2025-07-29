import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false, 
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }
  const form = new formidable.IncomingForm();
  form.uploadDir = path.join(process.cwd(), '/public/uploads/posts');
  form.keepExtensions = true;
  form.maxFileSize = 5 * 1024 * 1024; // 5MB

  form.parse(req, (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Erro ao fazer upload', details: err.message });

    const file = files.image;
    if (!file) return res.status(400).json({ error: 'Nenhuma imagem enviada' });

    const relativePath = '/uploads/posts/' + path.basename(file.filepath);
    return res.status(200).json({ imageUrl: relativePath });
  });
}