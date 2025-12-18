import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Heart, MessageCircle, Share2 } from "lucide-react";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import EditPostModal from "@/components/EditPostModal";
import CreatePost from "@/components/CreatePost";
import ReplyThread from "@/components/ReplyThread";
import { cn } from "@/lib/utils";

export default function Timeline() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeOptions, setActiveOptions] = useState(null);
  const [activeCommentOptions, setActiveCommentOptions] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const [replyInputs, setReplyInputs] = useState({});
  const [editingPost, setEditingPost] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [editingReply, setEditingReply] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({ type: "", postId: null, commentId: null, replyId: null });
  const [activeReplyMenu, setActiveReplyMenu] = useState(null);
  const loggedUser = user;

  // Busca usuário logado (normaliza resposta)
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/users/me");
        if (!res.ok) {
          setUser(null);
          return;
        }
        const data = await res.json();
        const userObj = data?.user || data;
        setUser(userObj);
      } catch (err) {
        console.error("fetchUser error:", err);
        setUser(null);
      }
    }
    fetchUser();
  }, []);

  // Carrega os posts da API 
  const loadPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/posts");
      if (!res.ok) {
        console.error("/api/posts responded with", res.status);
        setPosts([]);
        return;
      }
      const data = await res.json();
      let postsArray = [];
      if (Array.isArray(data)) postsArray = data;
      else if (Array.isArray(data.posts)) postsArray = data.posts;
      else if (Array.isArray(data.data)) postsArray = data.data;
      else postsArray = [];
      console.log("loadPosts data:", data);
      setPosts(postsArray);
    } catch (err) {
      console.error("Erro ao carregar posts:", err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  // Criação de post
  const handleNewPost = () => {
    loadPosts();
  };

  // Edição de post
  const handleEditPost = (post) => setEditingPost(post);

  // Salvar post editado
  const saveEditedPost = async (post) => {
    await fetch(`/api/posts/${post.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: post.content }),
    });
    setEditingPost(null);
    loadPosts();
  };

  // Deletar post
  const handleDeletePost = async (id) => {
    await fetch(`/api/posts/${id}`, { method: "DELETE" });
    loadPosts();
  };

  const addComment = async (postId) => {
    const text = commentInputs[postId];
    if (!text?.trim() || !user?.id) return;

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: text,
          authorId: user.id,
          postId,
        }),
      });
      if (!res.ok) {
        console.error("/api/comments POST failed", res.status);
        return;
      }
      const comment = await res.json();
      setPosts((prev) =>
        Array.isArray(prev)
          ? prev.map((post) =>
              post.id === postId
                ? { ...post, comments: [...(post.comments || []), { ...comment, replies: [], commentLikes: [] }] }
                : post
            )
          : prev
      );
      setCommentInputs({ ...commentInputs, [postId]: "" });
    } catch (err) {
      console.error("addComment error:", err);
    }
  };

  // Edição de comentário
  const handleEditComment = (comment) => setEditingComment(comment);

  const saveEditedComment = async (postId, commentId, content) => {
    await fetch(`/api/comments/${commentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    setEditingComment(null);
    loadPosts();
  };

  // Deletar comentário
  const handleDeleteComment = async (postId, commentId) => {
    await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
    setPosts((prev) =>
      Array.isArray(prev)
        ? prev.map((post) =>
            post.id === postId ? { ...post, comments: (post.comments || []).filter((c) => c.id !== commentId) } : post
          )
        : prev
    );
  };

  const toggleReplyInput = (commentOrReplyId) => {
    setReplyInputs((prev) => ({ ...prev, [commentOrReplyId]: prev[commentOrReplyId] ? "" : "" }));
  };

  const handleReply = async (postId, commentId, text, parentReplyId = null) => {
    if (!text?.trim() || !user?.id) return;
    try {
      const res = await fetch("/api/comments/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: text,
          authorId: user.id,
          postId,
          commentId,
          parentReplyId,
        }),
      });
      if (!res.ok) {
        console.error("/api/comments/reply POST failed", res.status);
        return;
      }
      const reply = await res.json();
      setPosts((prev) =>
        Array.isArray(prev)
          ? prev.map((post) =>
              post.id === postId
                ? {
                    ...post,
                    comments: (post.comments || []).map((comment) =>
                      comment.id === commentId ? { ...comment, replies: [...(comment.replies || []), reply] } : comment
                    ),
                  }
                : post
            )
          : prev
      );
      setReplyInputs((prev) => ({ ...prev, [parentReplyId || commentId]: "" }));
    } catch (err) {
      console.error("handleReply error:", err);
    }
  };

  // Edição de resposta
  const handleEditReply = (reply, commentId) => setEditingReply({ ...reply, commentId });

  const saveEditedReply = async (postId, commentId, replyId, content) => {
    await fetch(`/api/comments/reply/${replyId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    setEditingReply(null);
    loadPosts();
  };

  // Deletar resposta
  const handleDeleteReply = async (postId, commentId, replyId) => {
    await fetch(`/api/comments/reply/${replyId}`, { method: "DELETE" });
    setPosts((prev) =>
      Array.isArray(prev)
        ? prev.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  comments: (post.comments || []).map((comment) =>
                    comment.id === commentId ? { ...comment, replies: (comment.replies || []).filter((r) => r.id !== replyId) } : comment
                  ),
                }
              : post
          )
        : prev
    );
  };

  // CURTIR/DESCURTIR POST
  const toggleLikePost = async (postId) => {
    setPosts((prev) =>
      Array.isArray(prev)
        ? prev.map((p) => {
            if (p.id !== postId) return p;
            const likedByUser = (p.postLikes || []).some((like) => like.userId === user?.id);
            if (likedByUser) {
              return { ...p, postLikes: (p.postLikes || []).filter((l) => l.userId !== user?.id) };
            } else {
              return { ...p, postLikes: [...(p.postLikes || []), { userId: user?.id, postId }] };
            }
          })
        : prev
    );
    await fetch(`/api/posts/${postId}/like`, { method: "POST" });
  };

  // CURTIR/DESCURTIR COMENTÁRIO 
  const toggleLikeComment = async (commentId, postId) => {
    setPosts((prev) =>
      Array.isArray(prev)
        ? prev.map((p) => {
            if (p.id !== postId) return p;
            return {
              ...p,
              comments: (p.comments || []).map((c) => {
                if (c.id !== commentId) return c;
                const likedByUser = (c.commentLikes || []).some((like) => like.userId === user?.id);
                if (likedByUser) {
                  return { ...c, commentLikes: (c.commentLikes || []).filter((l) => l.userId !== user?.id) };
                } else {
                  return { ...c, commentLikes: [...(c.commentLikes || []), { userId: user?.id, commentId }] };
                }
              }),
            };
          })
        : prev
    );
    await fetch(`/api/comments/${commentId}/like`, { method: "POST" });
    try {
      const res = await fetch(`/api/comments/${commentId}`);
      if (res.ok) {
        const updatedComment = await res.json();
      }
    } catch (err) {
      console.error("toggleLikeComment fetch updated comment error:", err);
    }
  };

  // Modal de exclusão
  const openDeleteModal = ({ type, postId, commentId = null, replyId = null }) => {
    setDeleteTarget({ type, postId, commentId, replyId });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteTarget.type === "post") {
      await handleDeletePost(deleteTarget.postId);
    } else if (deleteTarget.type === "comment") {
      await handleDeleteComment(deleteTarget.postId, deleteTarget.commentId);
    } else if (deleteTarget.type === "reply") {
      await handleDeleteReply(deleteTarget.postId, deleteTarget.commentId, deleteTarget.replyId);
    }
    setIsDeleteModalOpen(false);
  };

  const canEditOrDeleteComment = (comment) =>
    String(user?.id) === String(comment.authorId) ||
    String(user?.id) === String(comment.author?.id);

  const canEditOrDeletePost = (post) =>
    String(user?.id) === String(post.authorId) ||
    String(user?.id) === String(post.author?.id);

  // Renderização
  return (
    <div className="w-full flex flex-col items-center">
      <CreatePost onPost={handleNewPost} user={user} />
      <div className="w-full max-w-4xl space-y-7">
        {loading ? (
          <p className="text-center text-zinc-400">Carregando posts...</p>
        ) : Array.isArray(posts) && posts.length > 0 ? (
          posts.map((post) => (
            <Card
              key={post.id}
              className="card-glow bg-card rounded-3xl overflow-hidden animate-fade-in"
            >
              <CardContent className="px-6 py-6 md:px-8 md:py-7 space-y-4 relative">
                {/* Header */}
                <div className="flex items-center justify-between pb-2">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/profile/${post.author?.id || ""}`}
                      className="flex items-center gap-4 cursor-pointer group"
                    >
                      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-zinc-900 ring-2 ring-indigo-500/40 shrink-0">
                        <Image
                          src={post.author?.image || "/default-avatar.png"}
                          alt="Avatar"
                          fill
                          sizes="40px"
                          className="object-cover"
                          priority
                        />
                      </div>
                  <div>
                    <p className="text-base md:text-lg font-semibold text-zinc-50 group-hover:text-zinc-100 group-hover:underline">
                          {post.author?.name || "Autor desconhecido"}
                        </p>
                        <p className="text-xs text-zinc-400">
                          {post.createdAt
                            ? format(new Date(post.createdAt), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })
                            : ""}
                        </p>
                      </div>
                    </Link>
                  </div>
                  {canEditOrDeletePost(post) && (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setActiveOptions(post.id === activeOptions ? null : post.id)}
                      >
                        <MoreHorizontal className="text-zinc-500 hover:text-zinc-200 cursor-pointer" />
                      </button>
                      {activeOptions === post.id && (
                        <div className="absolute right-0 mt-2 w-32 bg-zinc-800 border border-zinc-700 rounded shadow-md z-10 cursor-pointer">
                          <button
                            type="button"
                            onClick={() => handleEditPost(post)}
                            className="block w-full text-left px-4 py-2 hover:bg-zinc-700 cursor-pointer"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => openDeleteModal({ type: "post", postId: post.id })}
                            className="block w-full text-left px-4 py-2 hover:bg-zinc-700 cursor-pointer"
                          >
                            Excluir
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <EditPostModal
                  isOpen={!!editingPost && editingPost.id === post.id}
                  onClose={() => setEditingPost(null)}
                  onSave={saveEditedPost}
                  post={editingPost}
                />
                {/* Conteúdo do post */}
                {(!editingPost || editingPost.id !== post.id) && (
                  <p className="whitespace-pre-line text-zinc-50 leading-relaxed px-1 text-[0.98rem] md:text-base">
                    {post.content}
                  </p>
                )}
                {post.image && (
                  <div className="pt-1">
                    <Image
                      src={post.image}
                      alt="Imagem do post"
                      width={800}
                      height={450}
                      className="w-full max-h-96 rounded-xl object-cover"
                    />
                  </div>
                )}

                {/* Ações */}
                <div className="flex gap-6 pt-3 border-t border-zinc-800 mt-2 text-sm text-zinc-400">
                  <button
                    type="button"
                    onClick={() => toggleLikePost(post.id)}
                    className="flex items-center gap-2 text-sm text-zinc-400 hover:text-pink-400 transition-colors group cursor-pointer"
                  >
                    <Heart
                      className={cn(
                        "w-5 h-5 transition-transform group-hover:scale-110",
                        post.postLikes?.some((l) => l.userId === user?.id) && "text-pink-500"
                      )}
                    />
                    <span>{post.postLikes?.length || 0}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCommentInputs({ ...commentInputs, [post.id]: "" })}
                    className="flex items-center gap-2 text-sm text-zinc-400 hover:text-indigo-400 transition-colors group cursor-pointer"
                  >
                    <MessageCircle className="w-5 h-5 transition-transform group-hover:scale-110" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      navigator.share?.({
                        title: "Post",
                        url: window.location.href,
                      })
                    }
                    className="flex items-center gap-2 text-sm text-zinc-400 hover:text-indigo-400 transition-colors group cursor-pointer"
                  >
                    <Share2 className="w-5 h-5 transition-transform group-hover:scale-110" />
                  </button>
                </div>

                <div className="mt-4 space-y-4">
                  {(post.comments || []).map((comment) => (
                    <div
                      key={comment.id}
                      className="rounded-lg bg-muted/50 p-4 space-y-2"
                    >
                      <div className="flex justify-between">
                        <div className="flex gap-3 items-start">
                          <Link
                            href={`/profile/${comment.author?.id || ""}`}
                            className="flex items-center gap-2 cursor-pointer group"
                          >
                            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-muted shrink-0 ring-2 ring-primary/20">
                              <Image
                                src={comment.author?.image || "/default-avatar.png"}
                                alt="Avatar"
                                fill
                                sizes="30px"
                                className="object-cover"
                                priority
                              />
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-semibold text-foreground group-hover:underline">
                                {comment.author?.name || comment.author}
                              </p>
                              {editingComment?.id === comment.id ? (
                                <div className="space-y-2">
                                  <Textarea
                                    className="text-sm"
                                    value={editingComment.content}
                                    onChange={(e) =>
                                      setEditingComment({
                                        ...editingComment,
                                        content: e.target.value,
                                      })
                                    }
                                  />
                                  <Button
                                    type="button"
                                    size="sm"
                                    className="mt-1"
                                    onClick={() => saveEditedComment(post.id, comment.id, editingComment.content)}
                                  >
                                    Salvar
                                  </Button>
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  {comment.content}
                                </p>
                              )}
                            </div>
                          </Link>
                        </div>
                        {canEditOrDeleteComment(comment) && (
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() =>
                                setActiveCommentOptions(activeCommentOptions === comment.id ? null : comment.id)
                              }
                              className="flex items-center gap-1 text-sm hover:opacity-80 cursor-pointer"
                            >
                              <MoreHorizontal size={16} />
                            </button>
                            {activeCommentOptions === comment.id && (
                              <div className="absolute right-0 mt-2 w-32 bg-zinc-700 border border-zinc-600 rounded shadow-md z-10">
                                <button
                                  type="button"
                                  onClick={() => handleEditComment(comment)}
                                  className="block w-full text-left px-4 py-2 hover:bg-zinc-600 cursor-pointer"
                                >
                                  Editar
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    openDeleteModal({
                                      type: "comment",
                                      postId: post.id,
                                      commentId: comment.id,
                                    })
                                  }
                                  className="block w-full text-left px-4 py-2 hover:bg-zinc-600 cursor-pointer"
                                >
                                  Excluir
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <button
                          type="button"
                          onClick={() => toggleLikeComment(comment.id, post.id)}
                          className="flex items-center gap-1 text-sm hover:text-foreground transition-colors cursor-pointer"
                        >
                          <Heart
                            className={cn(
                              "w-3 h-3",
                              comment.commentLikes?.some((l) => l.userId === user?.id) && "text-pink-500",
                            )}
                            size={14}
                          />
                          <span>{comment.commentLikes?.length || 0}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleReplyInput(comment.id)}
                          className="flex items-center gap-1 text-sm hover:text-foreground transition-colors cursor-pointer"
                        >
                          <MessageCircle size={14} />
                          <span>Responder</span>
                        </button>
                      </div>

                      {replyInputs[comment.id] !== undefined && (
                        <div className="mt-2 flex gap-2">
                          <Input
                            className="h-10"
                            value={replyInputs[comment.id]}
                            onChange={(e) =>
                              setReplyInputs((prev) => ({
                                ...prev,
                                [comment.id]: e.target.value,
                              }))
                            }
                            placeholder="Responder..."
                          />
                          <Button type="button" className="h-10 py-0 px-4" onClick={() => handleReply(post.id, comment.id, replyInputs[comment.id])}>
                            Enviar
                          </Button>
                        </div>
                      )}

                      {(comment.replies || []).length > 0 && (
                        <div className="ml-10 mt-2 space-y-2">
                          {comment.replies.map((reply) => (
                            <ReplyThread
                              key={reply.id}
                              reply={reply}
                              postId={post.id}
                              commentId={comment.id}
                              editingReply={editingReply}
                              setEditingReply={setEditingReply}
                              saveEditedReply={saveEditedReply}
                              openDeleteModal={openDeleteModal}
                              activeReplyMenu={activeReplyMenu}
                              setActiveReplyMenu={setActiveReplyMenu}
                              replyInputs={replyInputs}
                              setReplyInputs={setReplyInputs}
                              onReply={handleReply}
                              onEditReply={handleEditReply}
                              loggedUser={loggedUser}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {commentInputs[post.id] !== undefined && (
                    <div className="flex gap-2 mt-2">
                      <Input
                        className="h-10"
                        value={commentInputs[post.id] || ""}
                        onChange={(e) =>
                          setCommentInputs((prev) => ({
                            ...prev,
                            [post.id]: e.target.value,
                          }))
                        }
                        placeholder="Escreva um comentário..."
                      />
                      <Button type="button" className="h-10 py-0 px-4" onClick={() => addComment(post.id)}>
                        Enviar
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-center text-zinc-400">Nenhum post encontrado.</p>
        )}
      </div>
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemType={deleteTarget.type}
      />
    </div>
  );
}