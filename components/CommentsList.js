import { useEffect, useState } from "react";

export default function CommentsList({ postId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!postId) return;
    setLoading(true);
    fetch(`/api/comments?postId=${postId}`)
      .then(res => res.json())
      .then(data => {
        setComments(data);
        setLoading(false);
      });
  }, [postId]);

  if (loading) return <p>Carregando comentários...</p>;
  if (!comments.length) return <p style={{ fontStyle: "italic" }}>Nenhum comentário.</p>;

  return (
    <ul style={{ paddingLeft: 16 }}>
      {comments.map(c => (
        <li key={c.id} style={{ marginBottom: 6 }}>
          <strong>{c.author?.name || "Desconhecido"}:</strong> {c.content}
        </li>
      ))}
    </ul>
  );
}