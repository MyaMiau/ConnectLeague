import { useEffect, useState } from "react";

export default function CommentsList({ postId, currentUserId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [replyInputs, setReplyInputs] = useState({}); // { [commentId]: text }

  // Busca comentários do backend
  const fetchComments = async () => {
    setLoading(true);
    const res = await fetch(`/api/comments?postId=${postId}`);
    const data = await res.json();
    setComments(data);
    setLoading(false);
  };

  useEffect(() => {
    if (!postId) return;
    fetchComments();
    // eslint-disable-next-line
  }, [postId]);

  // Adiciona novo comentário inline e recarrega do backend (garante consistência)
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newComment, postId, authorId: currentUserId }),
    });
    setNewComment("");
    fetchComments();
  };

  // Adiciona reply inline e recarrega do backend
  const handleReply = async (commentId) => {
    const text = replyInputs[commentId];
    if (!text?.trim()) return;
    await fetch("/api/comments/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: text,
        postId,
        commentId,
      }),
    });
    setReplyInputs((ri) => ({ ...ri, [commentId]: "" }));
    fetchComments();
  };

  // Like inline: recarrega do backend após ação (garante like persistente)
  const toggleLikeComment = async (commentId) => {
    await fetch(`/api/comments/${commentId}/like`, { method: "POST" });
    fetchComments();
  };

  if (loading) return <p>Carregando comentários...</p>;
  if (!comments.length)
    return (
      <div style={{ paddingLeft: 16 }}>
        <div>
          <input
            type="text"
            placeholder="Escreva um comentário..."
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
          />
          <button onClick={handleAddComment}>Comentar</button>
        </div>
        <p style={{ fontStyle: "italic" }}>Nenhum comentário.</p>
      </div>
    );

  return (
    <div style={{ paddingLeft: 16 }}>
      <div style={{ marginBottom: 8 }}>
        <input
          type="text"
          placeholder="Escreva um comentário..."
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
        />
        <button onClick={handleAddComment}>Comentar</button>
      </div>
      <ul>
        {comments.map(c => (
          <li key={c.id} style={{ marginBottom: 16 }}>
            <strong>{c.author?.name || "Desconhecido"}:</strong> {c.content}
            <button
              type="button"
              style={{
                color: c.commentLikes.some(l => l.userId === currentUserId) ? "red" : "gray",
                background: "none",
                border: "none",
                cursor: "pointer",
                marginLeft: 8,
              }}
              onClick={() => toggleLikeComment(c.id)}
            >
              ♥
            </button>
            {c.commentLikes.length > 0 && (
              <span style={{ marginLeft: 4 }}>{c.commentLikes.length}</span>
            )}

            {/* Responder */}
            <div style={{ marginTop: 4 }}>
              <input
                type="text"
                placeholder="Responder..."
                value={replyInputs[c.id] || ""}
                onChange={e =>
                  setReplyInputs((ri) => ({ ...ri, [c.id]: e.target.value }))
                }
                style={{ width: 180 }}
              />
              <button onClick={() => handleReply(c.id)}>Enviar</button>
            </div>

            {/* Replies */}
            {Array.isArray(c.replies) && c.replies.length > 0 && (
              <ul style={{ marginLeft: 20, marginTop: 8 }}>
                {c.replies.map((r) => (
                  <li key={r.id}>
                    <strong>{r.author?.name || "Desconhecido"}:</strong> {r.content}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}