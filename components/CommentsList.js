// Adaptado para likes em comentários (caso use CommentsList isolado)
import { useEffect, useState } from "react";

export default function CommentsList({ postId, currentUserId }) {
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

  const toggleLikeComment = async (commentId) => {
    setComments(comments =>
      comments.map(c => {
        if (c.id !== commentId) return c;
        const liked = c.commentLikes.some(l => l.userId === currentUserId);
        if (liked) {
          return { ...c, commentLikes: c.commentLikes.filter(l => l.userId !== currentUserId) }
        } else {
          return { ...c, commentLikes: [...c.commentLikes, { userId: currentUserId, commentId }] }
        }
      })
    );
    await fetch(`/api/comments/${commentId}/like`, { method: "POST" });
  };

  if (loading) return <p>Carregando comentários...</p>;
  if (!comments.length) return <p style={{ fontStyle: "italic" }}>Nenhum comentário.</p>;

  return (
    <ul style={{ paddingLeft: 16 }}>
      {comments.map(c => (
        <li key={c.id} style={{ marginBottom: 6 }}>
          <strong>{c.author?.name || "Desconhecido"}:</strong> {c.content}
          <button
            type="button"
            style={{
              color: c.commentLikes.some(l => l.userId === currentUserId) ? "red" : "gray",
              background: "none",
              border: "none",
              cursor: "pointer",
              marginLeft: 8
            }}
            onClick={() => toggleLikeComment(c.id)}
          >
            ♥
          </button>
          {c.commentLikes.length > 0 && (
            <span style={{ marginLeft: 4 }}>{c.commentLikes.length}</span>
          )}
        </li>
      ))}
    </ul>
  );
}