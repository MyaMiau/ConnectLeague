import { useState, useEffect } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Heart, MessageCircle } from "lucide-react";
import ReplyThread from "@/components/ReplyThread";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";

// Função para achatar replies aninhadas em lista flat
function flattenReplies(replies) {
  let flat = [];
  for (const reply of replies) {
    flat.push(reply);
    if (reply.subReplies && reply.subReplies.length) {
      flat = flat.concat(flattenReplies(reply.subReplies));
    }
  }
  return flat;
}

export default function CommentsTestList({ postId, currentUserId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [replyInputs, setReplyInputs] = useState({});
  const [editingComment, setEditingComment] = useState(null);
  const [editingReply, setEditingReply] = useState(null);
  const [activeCommentOptions, setActiveCommentOptions] = useState(null);
  const [activeReplyMenu, setActiveReplyMenu] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({ type: "", commentId: null, replyId: null });

  // Busca comentários do backend (inclui dados completos do autor)
  const fetchComments = async () => {
    setLoading(true);
    const res = await fetch(`/api/comments?postId=${postId}`);
    if (res.ok) {
      const data = await res.json();
      setComments(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!postId) return;
    fetchComments();
  }, [postId]);

  // Adiciona novo comentário e atualiza estado local
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newComment, postId, authorId: currentUserId }),
    });
    if (res.ok) {
      const newCmt = await res.json();
      setComments((prev) => [...prev, newCmt]);
      setNewComment("");
    }
  };

  // Enter para novo comentário
  const handleNewCommentKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  // Edição de comentário (atualiza local)
  const handleEditComment = (comment) => setEditingComment(comment);
  const saveEditedComment = async (commentId, content) => {
    const res = await fetch(`/api/comments/${commentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (res.ok) {
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, content } : c))
      );
      setEditingComment(null);
    }
  };

  // Enter para editar comentário
  const handleEditCommentKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      saveEditedComment(editingComment.id, editingComment.content);
    }
  };

  // Deletar comentário (atualiza local)
  const handleDeleteComment = async (commentId) => {
    const res = await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
    if (res.ok) {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    }
  };

  // Handler para responder comentário ou reply (atualiza local)
  const handleReply = async (postId, commentId, text, parentReplyId = null) => {
    if (!text?.trim()) return;
    const res = await fetch("/api/comments/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: text,
        postId,
        commentId,
        parentReplyId,
      }),
    });
    if (res.ok) {
      const newReply = await res.json();
      setComments((prev) =>
        prev.map((c) => {
          if (c.id === commentId) {
            let replies = c.replies ? [...c.replies] : [];
            if (parentReplyId) {
              // Adiciona nas subReplies do parentReply
              replies = replies.map((r) =>
                r.id === parentReplyId
                  ? {
                      ...r,
                      subReplies: r.subReplies ? [...r.subReplies, newReply] : [newReply],
                    }
                  : r
              );
            } else {
              replies = [...replies, newReply];
            }
            return { ...c, replies };
          }
          return c;
        })
      );
      setReplyInputs((ri) => ({ ...ri, [parentReplyId || commentId]: "" }));
    }
  };

  // Enter para campo de resposta de comentário ou reply
  const handleReplyInputKeyDown = (e, commentId, parentReplyId = null) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const text = replyInputs[parentReplyId || commentId];
      handleReply(postId, commentId, text, parentReplyId);
    }
  };

  // Edição de resposta (atualiza local)
  const handleEditReply = (reply, commentId) => setEditingReply({ ...reply, commentId });
  const saveEditedReply = async (commentId, replyId, content) => {
    const res = await fetch(`/api/comments/reply/${replyId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (res.ok) {
      setComments((prev) =>
        prev.map((c) => {
          if (c.id === commentId) {
            const updateReplies = (arr) =>
              arr.map((r) =>
                r.id === replyId
                  ? { ...r, content }
                  : r.subReplies
                  ? { ...r, subReplies: updateReplies(r.subReplies) }
                  : r
              );
            return { ...c, replies: updateReplies(c.replies || []) };
          }
          return c;
        })
      );
      setEditingReply(null);
    }
  };

  // Deletar resposta (atualiza local)
  const handleDeleteReply = async (commentId, replyId) => {
    const res = await fetch(`/api/comments/reply/${replyId}`, { method: "DELETE" });
    if (res.ok) {
      setComments((prev) =>
        prev.map((c) => {
          if (c.id === commentId) {
            const removeReply = (arr) =>
              arr
                .filter((r) => r.id !== replyId)
                .map((r) =>
                  r.subReplies
                    ? { ...r, subReplies: removeReply(r.subReplies) }
                    : r
                );
            return { ...c, replies: removeReply(c.replies || []) };
          }
          return c;
        })
      );
    }
  };

  // Like inline: atualiza local
  const toggleLikeComment = async (commentId) => {
    const res = await fetch(`/api/comments/${commentId}/like`, { method: "POST" });
    if (res.ok) {
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? {
                ...c,
                commentLikes: c.commentLikes?.some((l) => l.userId === currentUserId)
                  ? c.commentLikes.filter((l) => l.userId !== currentUserId)
                  : [...(c.commentLikes || []), { userId: currentUserId }],
              }
            : c
        )
      );
    }
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

  if (loading) return <div className="text-zinc-400">Carregando comentários...</div>;

  // Renderiza todas as replies e subReplies como lista vertical, fora da caixa do comentário
  const renderReplies = (replies, commentId) => (
    <div className="mt-2 space-y-2">
      {flattenReplies(replies).map((reply) => (
        <ReplyThread
          key={reply.id}
          reply={reply}
          postId={postId}
          commentId={commentId}
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
          handleReplyInputKeyDown={handleReplyInputKeyDown}
          loggedUser={{ id: currentUserId }}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Lista de Comentários */}
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="w-full"
          style={{
            background: "#232326", // Troca: cor antes das replies, agora nos comentários
            borderRadius: "18px",
            border: "1.5px solid #2a2a2e", // Troca: cor antes das replies, agora nos comentários
            boxShadow: "0 2px 8px 0 rgba(0,0,0,0.15)",
            padding: "20px",
          }}
        >
          <div className="flex justify-between">
            <div className="flex gap-3 items-center">
              <Image src={comment.author?.image || "/default-avatar.png"} alt="Avatar" width={30} height={30} className="rounded-full" />
              <div>
                <span className="text-base font-semibold text-zinc-100">{comment.author?.name || "Usuário"}</span>
                {editingComment?.id === comment.id ? (
                  <>
                    <Textarea
                      className="text-sm"
                      value={editingComment.content}
                      onChange={(e) => setEditingComment({ ...editingComment, content: e.target.value })}
                      onKeyDown={handleEditCommentKeyDown}
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
                  <p className="text-sm text-zinc-300 mt-1">{comment.content}</p>
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
          {/* Campo de resposta para comentário */}
          {replyInputs[comment.id] !== undefined && (
            <div className="mt-2 flex gap-2">
              <Input
                className="h-10"
                value={replyInputs[comment.id] || ""}
                onChange={e =>
                  setReplyInputs({ ...replyInputs, [comment.id]: e.target.value })
                }
                placeholder="Responder..."
                onKeyDown={(e) => handleReplyInputKeyDown(e, comment.id)}
              />
              <Button
                type="button"
                className="h-10 py-0 px-4"
                onClick={() => handleReply(postId, comment.id, replyInputs[comment.id])}>
                Enviar
              </Button>
            </div>
          )}
          {/* Todas replies e subReplies alinhadas verticalmente, fora da caixa principal */}
          {comment.replies?.length > 0 && renderReplies(comment.replies, comment.id)}
        </div>
      ))}
      {/* Campo para novo comentário */}
      <div className="flex gap-2 mt-2">
        <Input
          className="h-10"
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          placeholder="Escreva um comentário..."
          onKeyDown={handleNewCommentKeyDown}
        />
        <Button
          type="button"
          className="h-10 py-0 px-4"
          onClick={handleAddComment}>
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