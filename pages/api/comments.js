import prisma from "../../lib/prisma";

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { content, authorId, postId } = req.body;
    // Validação dos campos obrigatórios
    if (!content || !authorId || !postId) {
      return res.status(400).json({ error: 'Campos obrigatórios: content, authorId, postId.' });
    }
    try {
      const comment = await prisma.comment.create({
        data: {
          content,
          authorId: Number(authorId),
          postId: Number(postId),
        },
        include: {
          author: true,
          replies: {
            where: { parentReplyId: null }, // só top-level replies
            include: {
              author: true,
              subReplies: {
                include: {
                  author: true,
                  subReplies: { // segundo nível (opcional, pode remover se quiser só um nível)
                    include: { author: true }
                  }
                }
              }
            }
          }
        }
      });
      return res.status(201).json(comment);
    } catch (err) {
      console.error("Erro ao criar comentário:", err);
      return res.status(500).json({ error: 'Erro ao criar comentário.' });
    }
  } else if (req.method === 'GET') {
    const { postId } = req.query;
    try {
      if (!postId) {
        return res.status(400).json({ error: 'postId é obrigatório' });
      }
      const comments = await prisma.comment.findMany({
        where: { postId: Number(postId) },
        include: {
          author: true,
          replies: {
            where: { parentReplyId: null }, // só replies raiz
            include: {
              author: true,
              subReplies: {
                include: {
                  author: true,
                  subReplies: { // segundo nível (opcional)
                    include: { author: true }
                  }
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'asc' }
      });
      return res.status(200).json(comments);
    } catch (err) {
      console.error("Erro ao buscar comentários:", err);
      return res.status(500).json({ error: 'Erro ao buscar comentários.' });
    }
  } else {
    return res.status(405).json({ message: 'Método não permitido' });
  }
}