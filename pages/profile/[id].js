import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { format } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Heart, MessageCircle, Share2 } from "lucide-react";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import EditPostModal from "@/components/EditPostModal";
import ProfileCard from "@/components/ProfileCard";
import Header from "@/components/Header";
import ReplyThread from "@/components/ReplyThread"; 

export default function PublicProfilePage() {
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados de UI
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

  // Usuário logado
  const [loggedUser, setLoggedUser] = useState(null);
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/users/me");
        if (!res.ok) return;
        const data = await res.json();
        setLoggedUser(data);
      } catch (err) {
        setLoggedUser(null);
      }
    }
    fetchUser();
  }, []);

  // Carrega perfil e posts do usuário
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

  // Like post
  const toggleLikePost = async (postId) => {
    const post = posts.find(p => p.id === postId);
    const likedByUser = (post.postLikes || []).some(like => like.userId === loggedUser?.id);
    setPosts(posts =>
      posts.map(p => {
        if (p.id !== postId) return p;
        if (likedByUser) {
          return { ...p, postLikes: (p.postLikes || []).filter(l => l.userId !== loggedUser?.id) }
        } else {
          return { ...p, postLikes: [ ...(p.postLikes || []), { userId: loggedUser?.id, postId }] }
        }
      })
    );
    await fetch(`/api/posts/${postId}/like`, { method: "POST" });
  };

  // Comentar
  const addComment = async (postId) => {
    const text = commentInputs[postId];
    if (!text?.trim() || !loggedUser?.id) return;
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: text,
        authorId: loggedUser.id,
        postId,
      }),
    });
    const comment = await res.json();
    setPosts(posts =>
      posts.map(post =>
        post.id === postId
          ? { ...post, comments: [...(post.comments || []), { ...comment, replies: [], commentLikes: [] }] }
          : post
      )
    );
    setCommentInputs({ ...commentInputs, [postId]: "" });
  };

  // Editar comentário
  const handleEditComment = (comment) => setEditingComment(comment);
  const saveEditedComment = async (postId, commentId, content) => {
    await fetch(`/api/comments/${commentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    setEditingComment(null);
    // Recarregar posts após edição (ou só atualizar o comentário inline)
    fetch(`/api/users/${id}`)
      .then(res => res.json())
      .then(data => setPosts(data.posts));
  };

  // Excluir comentário
  const handleDeleteComment = async (postId, commentId) => {
    await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
    setPosts(posts =>
      posts.map(post =>
        post.id === postId
          ? { ...post, comments: post.comments.filter(c => c.id !== commentId) }
          : post
      )
    );
  };

  // Like comentário
  const toggleLikeComment = async (commentId, postId) => {
    setPosts(posts =>
      posts.map(p => {
        if (p.id !== postId) return p;
        return {
          ...p,
          comments: p.comments.map(c => {
            if (c.id !== commentId) return c;
            const likedByUser = (c.commentLikes || []).some(like => like.userId === loggedUser?.id);
            if (likedByUser) {
              return { ...c, commentLikes: (c.commentLikes || []).filter(l => l.userId !== loggedUser?.id) }
            } else {
              return { ...c, commentLikes: [ ...(c.commentLikes || []), { userId: loggedUser?.id, commentId }] }
            }
          })
        }
      })
    );
    await fetch(`/api/comments/${commentId}/like`, { method: "POST" });
  };

  // Campo de resposta (reply)
  const toggleReplyInput = (commentOrReplyId) => {
    setReplyInputs((prev) => ({ ...prev, [commentOrReplyId]: prev[commentOrReplyId] ? "" : "" }));
  };

  // Adicionar reply
  const handleReply = async (postId, commentId, text, parentReplyId = null) => {
    if (!text.trim() || !loggedUser?.id) return;
    const res = await fetch("/api/comments/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: text,
        authorId: loggedUser.id,
        postId,
        commentId,
        parentReplyId,
      }),
    });
    const reply = await res.json();
    setPosts(posts =>
      posts.map(post =>
        post.id === postId
          ? {
              ...post,
              comments: post.comments.map(comment =>
                comment.id === commentId
                  ? {
                      ...comment,
                      replies: [ ...(comment.replies || []), reply ]
                    }
                  : comment
              )
            }
          : post
      )
    );
    setReplyInputs({ ...replyInputs, [parentReplyId || commentId]: "" });
  };

  // Editar reply
  const handleEditReply = (reply, commentId) => setEditingReply({ ...reply, commentId });
  const saveEditedReply = async (postId, commentId, replyId, content) => {
    await fetch(`/api/comments/reply/${replyId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    setEditingReply(null);
    fetch(`/api/users/${id}`)
      .then(res => res.json())
      .then(data => setPosts(data.posts));
  };

  // Excluir reply
  const handleDeleteReply = async (postId, commentId, replyId) => {
    await fetch(`/api/comments/reply/${replyId}`, { method: "DELETE" });
    setPosts(posts =>
      posts.map(post =>
        post.id === postId
          ? {
              ...post,
              comments: post.comments.map(comment =>
                comment.id === commentId
                  ? {
                      ...comment,
                      replies: comment.replies.filter(r => r.id !== replyId)
                    }
                  : comment
              )
            }
          : post
      )
    );
  };

  // Modal de exclusão
  const openDeleteModal = ({ type, postId, commentId = null, replyId = null }) => {
    setDeleteTarget({ type, postId, commentId, replyId });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteTarget.type === "post") {
      // Aqui você implementa a exclusão do post, se quiser no perfil público
    } else if (deleteTarget.type === "comment") {
      await handleDeleteComment(deleteTarget.postId, deleteTarget.commentId);
    } else if (deleteTarget.type === "reply") {
      await handleDeleteReply(deleteTarget.postId, deleteTarget.commentId, deleteTarget.replyId);
    }
    setIsDeleteModalOpen(false);
  };

  // Compartilhamento
  const handleShare = (postId) => {
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
      <ProfileCard user={user} showEdit={false} />
      <div className="w-full max-w-2xl space-y-6 mt-8">
        {posts.length === 0 && (
          <p className="text-center text-zinc-400">Nenhum post encontrado para este usuário.</p>
        )}
        {posts.map((post) => (
          <Card key={post.id} className="bg-zinc-900 rounded-2xl">
            <CardContent className="p-6 space-y-4 relative">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <Link href={`/profile/${post.author?.id || ""}`} className="flex items-center gap-4 cursor-pointer group">
                    <Image
                      src={post.author?.image || "/default-avatar.png"}
                      alt="Avatar"
                      width={40}
                      height={40}
                      className="rounded-full object-cover border border-zinc-700 group-hover:opacity-80 transition"
                    />
                    <div>
                      <p className="font-semibold group-hover:underline">
                        {post.author?.name || "Autor desconhecido"}
                      </p>
                      <p className="text-xs text-zinc-400">
                        {format(new Date(post.createdAt), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </Link>
                </div>
                <div className="relative">
                  <button type="button" onClick={() => setActiveOptions(post.id === activeOptions ? null : post.id)}>
                    <MoreHorizontal className="text-zinc-400 hover:text-white cursor-pointer" />
                  </button>
                  {/* Menu de opções do post (edição/exclusão se quiser) */}
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

              <div className="flex gap-6 pt-2 border-t border-zinc-800 mt-2 text-sm text-zinc-400 ">
                <button
                  type="button"
                  onClick={() => toggleLikePost(post.id)}
                  className="flex items-center gap-1 text-sm hover:opacity-80 cursor-pointer">
                  <Heart className={post.postLikes?.some(l => l.userId === loggedUser?.id) ? "text-pink-500" : ""} size={18} />
                  <span>{post.postLikes?.length || 0}</span>
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1 text-sm hover:opacity-80 cursor-pointer">
                  <MessageCircle size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => handleShare(post.id)}
                  className="flex items-center gap-1 text-sm hover:opacity-80 cursor-pointer">
                  <Share2 size={18} />
                </button>
              </div>

              {/* Comentários */}
              <div className="mt-4 space-y-4">
                {post.comments?.map((comment) => (
                  <div key={comment.id} className="bg-zinc-800 p-4 rounded-lg">
                    <div className="flex justify-between">
                      <div className="flex gap-3 items-center">
                        <Image src={comment.author?.image || "/default-avatar.png"} alt="Avatar" width={30} height={30} className="rounded-full" />
                        <div>
                          <p className="text-sm font-semibold text-zinc-100">{comment.author?.name || comment.author}</p>
                          {editingComment?.id === comment.id ? (
                            <>
                              <Textarea
                                className="text-sm"
                                value={editingComment.content}
                                onChange={(e) => setEditingComment({ ...editingComment, content: e.target.value })}
                              />
                              <Button
                                type="button"
                                size="sm"
                                className="mt-1"
                                onClick={() => saveEditedComment(post.id, comment.id, editingComment.content)}>
                                Salvar
                              </Button>
                            </>
                          ) : (
                            <p className="text-sm text-zinc-300">{comment.content}</p>
                          )}
                        </div>
                      </div>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            setActiveCommentOptions(
                              activeCommentOptions === comment.id ? null : comment.id)}
                          className="flex items-center gap-1 text-sm hover:opacity-80 cursor-pointer">
                          <MoreHorizontal size={16} />
                        </button>
                        {activeCommentOptions === comment.id && (
                          <div className="absolute right-0 mt-2 w-32 bg-zinc-700 border border-zinc-600 rounded shadow-md z-10">
                            <button
                              type="button"
                              onClick={() => handleEditComment(comment)}
                              className="block w-full text-left px-4 py-2 hover:bg-zinc-600 cursor-pointer">
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => openDeleteModal({ type: "comment", postId: post.id, commentId: comment.id })}
                              className="block w-full text-left px-4 py-2 hover:bg-zinc-600 cursor-pointer">
                              Excluir
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-4 mt-2 text-xs text-zinc-400">
                      <button
                        type="button"
                        onClick={() => toggleLikeComment(comment.id, post.id)}
                        className="flex items-center gap-1 text-sm hover:opacity-80 cursor-pointer">
                        <Heart className={comment.commentLikes?.some(l => l.userId === loggedUser?.id) ? "text-pink-500" : ""} size={14} />
                        <span>{comment.commentLikes?.length || 0}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleReplyInput(comment.id)}
                        className="flex items-center gap-1 text-sm hover:underline cursor-pointer">
                        <MessageCircle size={14} />
                        <span>Responder</span>
                      </button>
                    </div>
                    {/* Campo de resposta */}
                    {replyInputs[comment.id] !== undefined && (
                      <div className="mt-2 flex gap-2">
                        <Input
                          className="h-10"
                          value={replyInputs[comment.id]}
                          onChange={(e) =>
                            setReplyInputs({ ...replyInputs, [comment.id]: e.target.value })
                          }
                          placeholder="Responder..."
                        />
                        <Button
                          type="button"
                          className="h-10 py-0 px-4"
                          onClick={() => handleReply(post.id, comment.id, replyInputs[comment.id])}>
                          Enviar
                        </Button>
                      </div>
                    )}
                    {/* Replies aninhadas */}
                    {comment.replies?.length > 0 && (
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
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <div className="flex gap-2 mt-2">
                  <Input
                    className="h-10"
                    value={commentInputs[post.id] || ""}
                    onChange={(e) =>
                      setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                    placeholder="Escreva um comentário..."
                  />
                  <Button
                    type="button"
                    className="h-10 py-0 px-4"
                    onClick={() => addComment(post.id)}>
                    Enviar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
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