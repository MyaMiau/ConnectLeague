// Exemplo usando Prisma
export default async function handler(req, res) {
  if (req.method === "POST") {
    const { content, authorId, postId, commentId } = req.body;
    const reply = await prisma.Reply.create({
      data: { content, authorId, postId, commentId }
    });
    return res.status(200).json(reply);
  }
  res.setHeader("Allow", ["POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}