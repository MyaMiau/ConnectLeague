import { useState } from "react";
import { Button } from "./ui/button";

export default function CommentForm({ postId, authorId, onCommented }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!content?.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, authorId, postId })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || `HTTP ${res.status}`);
      }

      setContent("");
      onCommented && onCommented();
    } catch (err) {
      console.error("Erro ao enviar comentário:", err);
      setError("Erro ao enviar comentário. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 8, marginBottom: 8 }}>
      <input
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Comente aqui"
        required
        style={{ width: "80%", marginRight: 8 }}
        aria-label="Escreva um comentário"
      />
      <Button
        type="submit"
        disabled={loading || !content.trim()}
        aria-busy={loading}
      >
        {loading ? "Comentando..." : "Comentar"}
      </Button>
      {error && <div style={{ color: "#f87171", marginTop: 6 }}>{error}</div>}
    </form>
  );
}