import { useEffect, useState } from "react";
import  CommentsTestList  from "../components/CommentsTestList";
import { Heart, MessageCircle, Share2, MoreVertical } from "lucide-react";

// Utilitário para datas em pt-BR
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }) +
    ", " +
    d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export default function TestCommentsPage() {
  const [posts, setPosts] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Busca usuário logado
  useEffect(() => {
    async function fetchMe() {
      try {
        const res = await fetch("/api/users/me");
        if (res.ok) {
          const data = await res.json();
          setCurrentUserId(data?.id);
        }
      } catch {
        setCurrentUserId(null);
      }
    }
    fetchMe();
  }, []);

  // Busca posts do backend
  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      const res = await fetch("/api/posts");
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      } else {
        setPosts([]);
      }
      setLoading(false);
    }
    fetchPosts();
  }, []);

  return (
    <div className="flex justify-center pt-10 min-h-screen bg-[#18181a]">
      <div className="w-full max-w-2xl space-y-8">
        {loading ? (
          <div className="text-zinc-400">Carregando posts...</div>
        ) : posts.length === 0 ? (
          <div className="text-zinc-400">Nenhum post encontrado.</div>
        ) : (
          posts.map(post => (
            <div
              key={post.id}
              className="bg-[#18181a] rounded-2xl p-0 shadow-lg border border-[#232327] overflow-hidden"
              style={{
                marginBottom: 32,
                boxShadow: "0px 2px 16px 0px #0000000d",
                minHeight: 220
              }}
            >
              {/* Header do post */}
              <div className="flex items-center gap-3 px-6 pt-6">
                <img
                  src={post.author?.image || "/user-icon.png"}
                  alt="Avatar"
                  className="h-10 w-10 rounded-full object-cover border border-[#232327]"
                />
                <div>
                  <div className="text-zinc-100 font-semibold">{post.author?.name || "Autor desconhecido"}</div>
                  <div className="text-xs text-zinc-400">
                    {formatDate(post.createdAt)}
                  </div>
                </div>
                <div className="ml-auto">
                  <MoreVertical className="text-zinc-400 hover:text-zinc-200 cursor-pointer" size={22} />
                </div>
              </div>
              {/* Conteúdo */}
              <div className="px-6 pt-3 text-zinc-100 text-[17px] font-normal">{post.content}</div>
              {/* Imagem do post */}
              {post.image && (
                <div className="px-6 pt-3">
                  <img
                    src={post.image}
                    alt="Imagem do post"
                    className="rounded-xl w-full max-h-64 object-cover border border-[#232327]"
                  />
                </div>
              )}
              {/* Ações */}
              <div className="px-6 pt-2 flex gap-8 text-zinc-400 text-sm items-center">
                <button className="flex items-center gap-1 group">
                  <Heart className={`w-5 h-5 group-hover:text-pink-600 ${post.postLikes?.length > 0 ? "text-pink-500" : ""}`} />
                  <span>{post.postLikes?.length || 0}</span>
                </button>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-5 h-5" />
                  <span>{post.comments?.length || 0}</span>
                </div>
                <button className="flex items-center gap-1 hover:text-blue-500 transition">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
              {/* Comentários */}
              <div className="pb-6 px-4 pt-2">
                <CommentsTestList postId={post.id} currentUserId={currentUserId} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}