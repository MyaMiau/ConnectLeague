import { IncomingForm } from 'formidable';
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

  const uploadDir = path.join(process.cwd(), '/public/uploads/posts');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = new IncomingForm({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024, // 10MB
  });

  form.parse(req, (err, fields, files) => {
    if (err) {
      // Se exceder limite, retorna erro 413
      if (err.message && err.message.includes('maxFileSize')) {
        return res.status(413).json({ error: 'A imagem é muito grande! O limite é 10MB.' });
      }
      console.error('[UPLOAD] Erro ao fazer upload:', err);
      return res.status(500).json({ error: 'Erro ao fazer upload', details: err.message });
    }

    let file = files.image;
    if (Array.isArray(file)) file = file[0];

    if (!file) {
      console.error('[UPLOAD] Nenhuma imagem enviada!');
      return res.status(400).json({ error: 'Nenhuma imagem enviada' });
    }

    const relativePath = '/uploads/posts/' + path.basename(file.filepath || file.path);

    return res.status(200).json({ imageUrl: relativePath });
  });
}