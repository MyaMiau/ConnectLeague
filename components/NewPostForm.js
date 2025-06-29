import { useState } from "react";

export default function NewPostForm({ onPostCreated, authorId }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, authorId })
    });
    if (res.ok) {
      setContent("");
      onPostCreated && onPostCreated();
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Escreva seu post..."
        required
        rows={3}
        style={{width: "100%"}}
      />
      <button type="submit" disabled={loading || !content}>
        {loading ? "Postando..." : "Postar"}
      </button>
    </form>
  );
}