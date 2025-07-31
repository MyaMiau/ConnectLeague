import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { format } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import Header from "@/components/Header";
import ProfileCard from "@/components/ProfileCard";
import { useSession } from "next-auth/react";

export default function PublicProfilePage() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();
  const loggedUserId = session?.user?.id;

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentInputs, setCommentInputs] = useState({});

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/users/${id}`)
      .then(res => res.json())
      .then(data => {
        setUser(data.user);
        setPosts(data.posts);
        setLoading(false);
      });
  }, [id]);

  // Like/unlike post
  const toggleLikePost = async (postId) => {
    setPosts(posts =>
      posts.map(post => {
        if (post.id !== postId) return post;
        const likedByUser = (post.postLikes || []).some(l => l.userId === loggedUserId);
        if (likedByUser) {
          return { ...post, postLikes: (post.postLikes || []).filter(l => l.userId !== loggedUserId) }
        } else {
          return { ...post, postLikes: [ ...(post.postLikes || []), { userId: loggedUserId, postId }] }
        }
      })
    );
    await fetch(`/api/posts/${postId}/like`, { method: "POST" });
  };

  // Add comment
  const addComment = async (postId) => {
    const text = commentInputs[postId];
    if (!text?.trim() || !loggedUserId) return;
    await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: text,
        authorId: loggedUserId,
        postId,
      }),
    });
    setCommentInputs({ ...commentInputs, [postId]: "" });
    // Reload posts
    fetch(`/api/users/${id}`)
      .then(res => res.json())
      .then(data => setPosts(data.posts));
  };

  // Share post
  const sharePost = (postId) => {
    if (navigator.share) {
      navigator.share({
        title: 'Post',
        url: `${window.location.origin}/post/${postId}`,
      });
    } else {
      window.open(`${window.location.origin}/post/${postId}`, "_blank");
    }
  };

  if (loading) return <p className="text-center text-zinc-400 mt-16">Carregando perfil...</p>;
  if (!user) return <p className="text-center text-zinc-400 mt-16">Usuário não encontrado.</p>;

  return (
    <div className="min-h-screen bg-black text-white pt-24 flex flex-col items-center px-4">
      <Header />
      <h1 className="text-3xl font-bold mb-8">Perfil do Jogador</h1>

      {/* ProfileCard com showEdit false para esconder edição */}
      <ProfileCard user={user} showEdit={false} />

      <div className="w-full max-w-2xl space-y-6 mt-8">
        {posts.length === 0 && (
          <p className="text-center text-zinc-400">Nenhum post encontrado para este usuário.</p>
        )}
        {posts.map((post) => (
          <Card key={post.id} className="bg-zinc-800 rounded-2xl">
            <CardContent className="p-6 space-y-4 relative">
              <div className="flex items-center gap-4 mb-2">
                <Image
                  src={post.author?.image || "/default-avatar.png"}
                  alt="Avatar"
                  width={40}
                  height={40}
                  className="rounded-full object-cover border border-zinc-700"
                />
                <div>
                  <p className="font-semibold">{post.author?.name || "Usuário Exemplo"}</p>
                  <p className="text-xs text-zinc-400">
                    {format(new Date(post.createdAt), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </div>
              <p className="whitespace-pre-line">{post.content}</p>
              {post.image && (
                <Image
                  src={post.image}
                  alt="Imagem do post"
                  width={800}
                  height={400}
                  className="rounded-xl object-cover"
                />
              )}

              {/* Interações */}
              <div className="flex gap-6 pt-2 border-t border-zinc-700 mt-2 text-sm text-zinc-400 ">
                <button
                  onClick={() => toggleLikePost(post.id)}
                  className="flex items-center gap-1 text-sm hover:opacity-80 cursor-pointer">
                  <Heart className={post.postLikes?.some(l => l.userId === loggedUserId) ? "text-pink-500" : ""} size={18} />
                  <span>{post.postLikes?.length || 0}</span>
                </button>
                <button
                  onClick={() => setCommentInputs({ ...commentInputs, [post.id]: "" })}
                  className="flex items-center gap-1 text-sm hover:opacity-80 cursor-pointer">
                  <MessageCircle size={18} />
                </button>
                <button
                  onClick={() => sharePost(post.id)}
                  className="flex items-center gap-1 text-sm hover:opacity-80 cursor-pointer">
                  <Share2 size={18} />
                </button>
              </div>

              {/* Comentários */}
              <div className="mt-4 space-y-4">
                {post.comments?.map((comment) => (
                  <div key={comment.id} className="bg-zinc-900 p-4 rounded-lg">
                    <div className="flex gap-3 items-center">
                      <Image src={comment.author?.image || "/default-avatar.png"} alt="Avatar" width={30} height={30} className="rounded-full" style={{ width: 30, height: 30 }}/>
                      <div>
                        <p className="text-sm font-semibold text-zinc-100">{comment.author?.name || comment.author}</p>
                        <p className="text-sm text-zinc-300">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {/* Só permite comentar se estiver logado */}
                {loggedUserId !== undefined && commentInputs[post.id] !== undefined && (
                  <div className="flex gap-2 mt-2">
                    <Input
                      className="h-10"
                      value={commentInputs[post.id] || ""}
                      onChange={(e) =>
                        setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                      placeholder="Escreva um comentário..."/>
                    <Button
                      className="h-10 py-0 px-4"
                      onClick={() => addComment(post.id)}>
                      Enviar
                    </Button>
                  </div>
                )}
                {/* Botão para abrir campo de comentário */}
                {loggedUserId !== undefined && commentInputs[post.id] === undefined && (
                  <Button
                    className="mt-2"
                    variant="ghost"
                    size="sm"
                    onClick={() => setCommentInputs({ ...commentInputs, [post.id]: "" })}
                  >
                    Comentar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}