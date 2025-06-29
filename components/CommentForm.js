import { useState } from "react";

export default function CommentForm({ postId, authorId, onCommented }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, authorId, postId })
    });
    setContent("");
    setLoading(false);
    onCommented && onCommented();
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 8, marginBottom: 8 }}>
      <input
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Comente aqui"
        required
        style={{ width: "80%", marginRight: 8 }}
      />
      <button type="submit" disabled={loading || !content}>
        {loading ? "Comentando..." : "Comentar"}
      </button>
    </form>
  );
}