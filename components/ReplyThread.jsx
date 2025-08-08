import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MoreHorizontal } from "lucide-react";

export default function ReplyThread({
  reply,
  postId,
  commentId,
  editingReply,
  setEditingReply,
  saveEditedReply,
  openDeleteModal,
  activeReplyMenu,
  setActiveReplyMenu,
  replyInputs,
  setReplyInputs,
  onReply,
  onEditReply,
  loggedUser,
  depth = 1, 
}) {
  const [showReplyInput, setShowReplyInput] = useState(false);

  // Só mostra editar/excluir para o autor da reply
  const canEditOrDeleteReply = loggedUser?.id === reply.authorId;

  // Limite máximo de indentação visual (3 níveis)
  const indent = depth > 3 ? 24 : depth * 8;

  return (
    <div
      className={`bg-zinc-800 p-4 rounded-lg mt-2 text-zinc-100 text-sm flex flex-col`}
      style={{ marginLeft: `${indent}px` }}
    >
      <div className="flex justify-between">
        <div className="flex gap-3 items-start">
          <Image
            src={reply.author?.image || "/default-avatar.png"}
            alt="Avatar"
            width={30}
            height={30}
            className="rounded-full object-cover"
          />
          <div className="flex flex-col gap-1">
            <p className="font-semibold text-purple-400">
              {reply.author?.name || reply.author}
            </p>
            {editingReply && editingReply.id === reply.id ? (
              <>
                <Textarea
                  className="text-sm mt-1"
                  value={editingReply.content ?? ""}
                  onChange={e =>
                    setEditingReply({ ...editingReply, content: e.target.value })
                  }
                />
                <div className="mt-1 flex gap-2">
                  <Button
                    size="sm"
                    type="button"
                    onClick={() =>
                      saveEditedReply(postId, commentId, reply.id, editingReply.content)
                    }
                  >
                    Salvar
                  </Button>
                  <Button
                    size="sm"
                    type="button"
                    variant="ghost"
                    onClick={() => setEditingReply(null)}
                  >
                    Cancelar
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-zinc-100">{reply.content}</p>
            )}
            {/* Botão de responder reply */}
            <button
              type="button"
              className="text-xs text-blue-400 hover:underline mt-1 text-left"
              onClick={() => setShowReplyInput(!showReplyInput)}
            >
              Responder
            </button>
            {showReplyInput && (
              <div className="flex gap-2 mt-1">
                <Input
                  className="h-10"
                  value={replyInputs[reply.id] || ""}
                  onChange={e =>
                    setReplyInputs({ ...replyInputs, [reply.id]: e.target.value })
                  }
                  placeholder="Responder..."
                />
                <Button
                  type="button"
                  className="h-10 py-0 px-4"
                  onClick={() => {
                    onReply(postId, commentId, replyInputs[reply.id], reply.id);
                    setShowReplyInput(false);
                  }}
                >
                  Enviar
                </Button>
              </div>
            )}
            {/* Replies aninhadas (recursivo) */}
            {reply.subReplies?.length > 0 && (
              <div className="mt-2 space-y-2">
                {reply.subReplies.map(sub => (
                  <ReplyThread
                    key={sub.id}
                    reply={sub}
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
                    onReply={onReply}
                    onEditReply={onEditReply}
                    loggedUser={loggedUser}
                    depth={depth + 1}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Menu de ações (editar/excluir) só para o autor */}
        {canEditOrDeleteReply && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveReplyMenu(activeReplyMenu === reply.id ? null : reply.id)}
              className="flex items-center gap-1 text-sm hover:opacity-80 cursor-pointer"
            >
              <MoreHorizontal size={14} />
            </button>
            {activeReplyMenu === reply.id && (
              <div className="absolute right-0 mt-2 w-28 bg-zinc-700 border border-zinc-600 rounded shadow-md z-10">
                <button
                  type="button"
                  onClick={() => {
                    onEditReply(reply, commentId);
                    setActiveReplyMenu(null);
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-zinc-600 cursor-pointer"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    openDeleteModal({
                      type: "reply",
                      postId,
                      commentId,
                      replyId: reply.id,
                    });
                    setActiveReplyMenu(null);
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-zinc-600 cursor-pointer"
                >
                  Excluir
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}