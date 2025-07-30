import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import NewPostForm from "../components/NewPostForm";
import CommentsList from "../components/CommentsList";
import CommentForm from "../components/CommentForm";

export default function PostsPage() {
  const { data: session, status } = useSession();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const authorId = session?.user?.id;

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
    if (status === "authenticated") {
      loadPosts();
    }
  }, [status]);

  if (status === "loading") {
    return <p>Carregando sessão...</p>;
  }

  if (status === "unauthenticated") {
    return <p>Você precisa estar logado para ver os posts.</p>;
  }

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
              <CommentsList postId={post.id} currentUserId={authorId} />
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