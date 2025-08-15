import { useState, useEffect } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Heart, MessageCircle } from "lucide-react";
import ReplyThread from "@/components/ReplyThread";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";

/**
 * Componente de comentários isolado, pronto para ser importado em qualquer página.
 * Garante que apenas o autor pode editar/excluir e corrige exibição de nome/foto ao recarregar.
 */
export default function CommentsTestList({ postId, currentUserId }) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estados para controle da UI
  const [commentInput, setCommentInput] = useState("");
  const [replyInputs, setReplyInputs] = useState({});
  const [editingComment, setEditingComment] = useState(null);
  const [editingReply, setEditingReply] = useState(null);
  const [activeCommentOptions, setActiveCommentOptions] = useState(null);
  const [activeReplyMenu, setActiveReplyMenu] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({ type: "", commentId: null, replyId: null });

  // Busca post + comentários, sempre com author completo
  useEffect(() => {
    async function fetchPost() {
      setLoading(true);
      const res = await fetch(`/api/posts/${postId}?withComments=1`);
      if (res.ok) {
        const data = await res.json();
        // Corrige comentários/replies para sempre ter author como objeto
        const fixAuthor = (item) => {
          if (!item.author || typeof item.author !== "object") {
            item.author = {
              id: item.authorId || "",
              name: item.authorName || "Usuário",
              image: item.authorImage || "/default-avatar.png"
            };
          }
          // Recursivo para replies
          if (item.replies && Array.isArray(item.replies)) {
            item.replies = item.replies.map(fixAuthor);
          }
          // Para replies recursivas tipo subReplies
          if (item.subReplies && Array.isArray(item.subReplies)) {
            item.subReplies = item.subReplies.map(fixAuthor);
          }
          return item;
        };
        if (data.comments && Array.isArray(data.comments)) {
          data.comments = data.comments.map(fixAuthor);
        }
        setPost(data);
      }
      setLoading(false);
    }
    if (postId) fetchPost();
  }, [postId]);

  // Adiciona novo comentário
  const addComment = async () => {
    if (!commentInput?.trim() || !currentUserId) return;
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: commentInput,
        authorId: currentUserId,
        postId,
      }),
    });
    const comment = await res.json();
    // Corrige para garantir que author está presente
    comment.author = comment.author || {
      id: currentUserId,
      name: comment.authorName || "Você",
      image: comment.authorImage || "/default-avatar.png",
    };
    setPost(post => ({
      ...post,
      comments: [...(post.comments || []), { ...comment, replies: [], commentLikes: [] }]
    }));
    setCommentInput("");
  };

  // Edição de comentário
  const handleEditComment = (comment) => setEditingComment(comment);

  const saveEditedComment = async (commentId, content) => {
    await fetch(`/api/comments/${commentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    setEditingComment(null);
    reload();
  };

  // Deletar comentário
  const handleDeleteComment = async (commentId) => {
    await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
    setPost(post => ({
      ...post,
      comments: post.comments.filter(c => c.id !== commentId)
    }));
  };

  // Replies aninhadas (corrigido para garantir dados de author)
  const handleReply = async (postId, commentId, text, parentReplyId = null) => {
    text = typeof text === "string" ? text : "";
    if (!text.trim() || !currentUserId) return;
    const res = await fetch("/api/comments/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: text,
        authorId: currentUserId,
        postId,
        commentId,
        parentReplyId,
      }),
    });
    const reply = await res.json();
    reply.author = reply.author || {
      id: currentUserId,
      name: reply.authorName || "Você",
      image: reply.authorImage || "/default-avatar.png",
    };
    setPost(post => ({
      ...post,
      comments: post.comments.map(comment =>
        comment.id === commentId
          ? { ...comment, replies: [...(comment.replies || []), reply] }
          : comment
      )
    }));
    setReplyInputs({ ...replyInputs, [parentReplyId || commentId]: "" });
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
    reload();
  };

  // Deletar resposta
  const handleDeleteReply = async (commentId, replyId) => {
    await fetch(`/api/comments/reply/${replyId}`, { method: "DELETE" });
    setPost(post => ({
      ...post,
      comments: post.comments.map(comment =>
        comment.id === commentId
          ? { ...comment, replies: comment.replies.filter(r => r.id !== replyId) }
          : comment
      )
    }));
  };

  // Curtir/descurtir comentário
  const toggleLikeComment = async (commentId) => {
    if (!currentUserId) return;
    setPost(post => ({
      ...post,
      comments: post.comments.map(c => {
        if (c.id !== commentId) return c;
        const likedByUser = (c.commentLikes || []).some(like => like.userId === currentUserId);
        if (likedByUser) {
          return { ...c, commentLikes: (c.commentLikes || []).filter(l => l.userId !== currentUserId) }
        } else {
          return { ...c, commentLikes: [ ...(c.commentLikes || []), { userId: currentUserId, commentId }] }
        }
      })
    }));
    await fetch(`/api/comments/${commentId}/like`, { method: "POST" });
  };

  // Modal de exclusão
  const openDeleteModal = ({ type, commentId = null, replyId = null }) => {
    setDeleteTarget({ type, commentId, replyId });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteTarget.type === "comment") {
      await handleDeleteComment(deleteTarget.commentId);
    } else if (deleteTarget.type === "reply") {
      await handleDeleteReply(deleteTarget.commentId, deleteTarget.replyId);
    }
    setIsDeleteModalOpen(false);
  };

  // Reload do post
  const reload = async () => {
    const res = await fetch(`/api/posts/${postId}?withComments=1`);
    if (res.ok) {
      const data = await res.json();
      // Corrige comentários/replies para sempre ter author como objeto
      const fixAuthor = (item) => {
        if (!item.author || typeof item.author !== "object") {
          item.author = {
            id: item.authorId || "",
            name: item.authorName || "Usuário",
            image: item.authorImage || "/default-avatar.png"
          };
        }
        if (item.replies && Array.isArray(item.replies)) {
          item.replies = item.replies.map(fixAuthor);
        }
        if (item.subReplies && Array.isArray(item.subReplies)) {
          item.subReplies = item.subReplies.map(fixAuthor);
        }
        return item;
      };
      if (data.comments && Array.isArray(data.comments)) {
        data.comments = data.comments.map(fixAuthor);
      }
      setPost(data);
    }
  };

  if (loading) return <div className="text-zinc-400">Carregando comentários...</div>;
  if (!post) return <div className="text-zinc-400">Post não encontrado.</div>;

  return (
    <div className="space-y-4">
      {/* Lista de Comentários */}
      {post.comments?.map((comment) => (
        <div key={comment.id} className="bg-zinc-800 p-4 rounded-lg">
          <div className="flex justify-between">
            <div className="flex gap-3 items-center">
              <Image src={comment.author?.image || "/default-avatar.png"} alt="Avatar" width={30} height={30} className="rounded-full" />
              <div>
                <p className="text-sm font-semibold text-zinc-100">{comment.author?.name || "Usuário"}</p>
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
                      onClick={() => saveEditedComment(comment.id, editingComment.content)}>
                      Salvar
                    </Button>
                  </>
                ) : (
                  <p className="text-sm text-zinc-300">{comment.content}</p>
                )}
              </div>
            </div>
            <div className="relative">
              {/* Só mostra editar/excluir se for o autor */}
              {currentUserId === comment.author?.id && (
                <>
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
                        onClick={() => openDeleteModal({ type: "comment", commentId: comment.id })}
                        className="block w-full text-left px-4 py-2 hover:bg-zinc-600 cursor-pointer">
                        Excluir
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="flex gap-4 mt-2 text-xs text-zinc-400">
            <button
              type="button"
              onClick={() => toggleLikeComment(comment.id)}
              className="flex items-center gap-1 text-sm hover:opacity-80 cursor-pointer">
              <Heart className={comment.commentLikes?.some(l => l.userId === currentUserId) ? "text-pink-500" : ""} size={14} />
              <span>{comment.commentLikes?.length || 0}</span>
            </button>
            <button
              type="button"
              onClick={() => setReplyInputs({ ...replyInputs, [comment.id]: "" })}
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
                value={replyInputs[comment.id] || ""}
                onChange={(e) =>
                  setReplyInputs({ ...replyInputs, [comment.id]: e.target.value })
                }
                placeholder="Responder..."
              />
              <Button
                type="button"
                className="h-10 py-0 px-4"
                onClick={() => handleReply(postId, comment.id, String(replyInputs[comment.id] ?? ""), null)}>
                Enviar
              </Button>
            </div>
          )}
          {/* REPLIES ANINHADAS */}
          {comment.replies?.length > 0 && (
            <div className="ml-10 mt-2 space-y-2">
              {comment.replies.map((reply) => (
                <ReplyThread
                  key={reply.id}
                  reply={reply}
                  postId={postId}
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
                  loggedUser={{ id: currentUserId }}
                  depth={1}
                />
              ))}
            </div>
          )}
        </div>
      ))}
      {/* Campo para novo comentário */}
      <div className="flex gap-2 mt-2">
        <Input
          className="h-10"
          value={commentInput}
          onChange={e => setCommentInput(e.target.value)}
          placeholder="Escreva um comentário..."
        />
        <Button
          type="button"
          className="h-10 py-0 px-4"
          onClick={addComment}>
          Enviar
        </Button>
      </div>
      {/* Modal de confirmação de deleção */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemType={deleteTarget.type}
      />
    </div>
  );
}