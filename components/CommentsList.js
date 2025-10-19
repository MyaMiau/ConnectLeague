import { useEffect, useState } from "react";
import Link from "next/link";
import ReplyThread from "./ReplyThread";
import Image from "next/image";

export default function CommentsList({ postId, currentUserId, loggedUser }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [replyInputs, setReplyInputs] = useState({});

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
  }, [postId]);

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

  const handleReply = async (commentId, parentReplyId = null) => {
    const text = replyInputs[parentReplyId || commentId];
    if (!text?.trim()) return;
    await fetch("/api/comments/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: text,
        postId,
        commentId,
        parentReplyId,
      }),
    });
    setReplyInputs((ri) => ({ ...ri, [parentReplyId || commentId]: "" }));
    fetchComments();
  };

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
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleAddComment();
              }
            }}
          />
          <button type="button" onClick={handleAddComment}>Comentar</button>
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
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleAddComment();
            }
          }}
        />
        <button type="button" onClick={handleAddComment}>Comentar</button>
      </div>
      <ul>
        {comments.map(c => (
          <li key={c.id} style={{ marginBottom: 16 }}>
            <div className="flex items-center gap-2 mb-1">
              <Link href={`/profile/${c.author?.id || ""}`} className="flex items-center gap-2 cursor-pointer">
                <div
                  className="relative shrink-0"
                  style={{
                    width: "36px",
                    height: "36px",
                    minWidth: "36px",
                    minHeight: "36px",
                    borderRadius: "9999px",
                    overflow: "hidden",
                    border: "1px solid #3f3f46",
                    boxShadow: "0 1px 4px 0 rgba(0,0,0,0.09)",
                    background: "#222"
                  }}
                >
                  <div className="relative w-[40px] h-[40px] rounded-full overflow-hidden shrink-0 border border-zinc-700 bg-zinc-800">
                    <Image
                      src={c.author?.image || "/default-avatar.png"}
                      alt={c.author?.name || "Desconhecido"}
                      fill
                      sizes="40px"
                      className="object-cover"
                      priority
                    />
                  </div>
                </div>
                <strong>{c.author?.name || "Desconhecido"}</strong>
              </Link>

              <div style={{ marginLeft: 8, flex: 1 }}>
                <span style={{ color: "#e5e7eb" }}>{c.content}</span>
              </div>

              <button
                type="button"
                aria-label="Responder"
                style={{ marginLeft: 8, color: "#3498db" }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setReplyInputs((ri) => ({ ...ri, [c.id]: ri[c.id] ? "" : "" }));
                }}
              >
                Responder
              </button>
            </div>

            {replyInputs[c.id] !== undefined && (
              <div style={{ marginTop: 4 }}>
                <input
                  type="text"
                  placeholder="Responder..."
                  value={replyInputs[c.id] || ""}
                  onChange={e =>
                    setReplyInputs(ri => ({ ...ri, [c.id]: e.target.value }))
                  }
                  onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleReply(c.id);
                    }
                  }}
                />
                <button
                  type="button"
                  aria-label="Enviar resposta"
                  style={{ marginLeft: 8, color: "#27ae60" }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleReply(c.id);
                  }}
                >
                  Enviar
                </button>
              </div>
            )}

            {c.replies && c.replies.map(reply => (
              <ReplyThread
                key={reply.id}
                reply={reply}
                postId={postId}
                commentId={c.id}
                loggedUser={loggedUser || { id: currentUserId }}
              />
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}