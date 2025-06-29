import { useEffect, useState } from "react";
import NewPostForm from "../components/NewPostForm";
import CommentsList from "../components/CommentsList";
import CommentForm from "../components/CommentForm";

export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  // Troque para o id do usuário logado!
  const authorId = 1;

  // Carregar posts
  function loadPosts() {
    setLoading(true);
    fetch("/api/posts")
      .then(res => res.json())
      .then(data => {
        setPosts(data);
        setLoading(false);
      });
  }

  useEffect(() => {
    loadPosts();
  }, []);

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 24 }}>
      <h1>Posts</h1>
      <NewPostForm authorId={authorId} onPostCreated={loadPosts} />
      {loading ? (
        <p>Carregando posts...</p>
      ) : posts.length === 0 ? (
        <p>Nenhum post ainda!</p>
      ) : (
        posts.map(post => (
          <div
            key={post.id}
            style={{
              border: "1px solid #ccc",
              borderRadius: 8,
              marginBottom: 24,
              padding: 16,
              background: "#fafafa"
            }}
          >
            <p>
              <strong>{post.author?.name || "Autor desconhecido"}</strong>:
            </p>
            <p style={{ fontSize: 18 }}>{post.content}</p>
            <small>
              {new Date(post.createdAt).toLocaleString()}
            </small>
            <div style={{ marginTop: 8 }}>
              <strong>Comentários:</strong>
              <CommentsList postId={post.id} />
              <CommentForm
                postId={post.id}
                authorId={authorId}
                onCommented={loadPosts}
              />
            </div>
          </div>
        ))
      )}
    </div>
  );
}