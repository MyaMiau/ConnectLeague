import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MoreHorizontal } from "lucide-react";

function getAuthorId(reply) {
  return reply?.author?.id ?? reply?.authorId ?? null;
}
function getAuthorName(reply) {
  return reply?.author?.name ?? reply?.author ?? "Usuário";
}
function getAuthorImage(reply) {
  return reply?.author?.image ?? "/default-avatar.png";
}

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
  handleReplyInputKeyDown,
  loggedUser,
}) {
  const [showReplyInput, setShowReplyInput] = useState(false);

  const canEditOrDeleteReply = !!loggedUser?.id && loggedUser.id === getAuthorId(reply);

  if (!reply) return null;

  return (
    <div
      className="w-full mb-2"
      style={{
        background: "#18181c", 
        borderRadius: "16px",
        border: "1.5px solid #232326", 
        boxShadow: "0 2px 8px 0 rgba(0,0,0,0.13)",
        padding: "16px",
      }}
    >
      <div className="flex justify-between">
        <div className="flex gap-3 items-center">
          <Link href={`/profile/${getAuthorId(reply)}`} className="flex items-center gap-2 cursor-pointer group">
            <Image src={getAuthorImage(reply)} 
            alt="Avatar" 
            width={30} 
            height={30} 
            className="rounded-full group-hover:opacity-80 transition" />
            <div>
              <span className="text-sm font-semibold text-zinc-100 group-hover:underline">{getAuthorName(reply)}</span>
              {editingReply && editingReply.id === reply.id ? (
                <>
                  <Textarea
                    className="text-sm mt-1"
                    value={editingReply.content ?? ""}
                    onChange={e =>
                      setEditingReply({ ...editingReply, content: e.target.value })
                    }
                    onKeyDown={e => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        saveEditedReply(commentId, reply.id, editingReply.content);
                      }
                    }}
                  />
                  <div className="mt-1 flex gap-2">
                    <Button size="sm" type="button"
                      onClick={() => saveEditedReply(commentId, reply.id, editingReply.content)}>
                      Salvar
                    </Button>
                    <Button size="sm" type="button" variant="ghost"
                      onClick={() => setEditingReply(null)}>
                      Cancelar
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-sm text-zinc-300 mt-1">{reply?.content ?? ""}</p>
              )}
            </div>
          </Link>
        </div>
        <div className="relative">
          {canEditOrDeleteReply && (
            <>
              <button
                type="button"
                onClick={() => setActiveReplyMenu(activeReplyMenu === reply.id ? null : reply.id)}
                className="flex items-center gap-1 text-sm hover:opacity-80 cursor-pointer"
              >
                <MoreHorizontal size={16} />
              </button>
              {activeReplyMenu === reply.id && (
                <div className="absolute right-0 mt-2 w-32 bg-zinc-700 border border-zinc-600 rounded shadow-md z-10">
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
            </>
          )}
        </div>
      </div>
      <div className="flex gap-4 mt-2 text-xs text-zinc-400">
        <span>{reply?.createdAt ? formatTime(reply.createdAt) : "Agora"}</span>
        <button
          type="button"
          className="font-semibold hover:underline cursor-pointer"
          onClick={() => setShowReplyInput(!showReplyInput)}
        >
          Responder
        </button>
      </div>
      {showReplyInput && (
        <div className="flex gap-2 mt-2">
          <Input
            className="h-8"
            value={replyInputs?.[reply.id] ?? ""}
            onChange={e =>
              setReplyInputs({ ...replyInputs, [reply.id]: e.target.value })
            }
            placeholder={`Responder a ${getAuthorName(reply)}`}
            onKeyDown={e => handleReplyInputKeyDown(e, commentId, reply.id)}
          />
          <Button
            type="button"
            className="h-8 py-0 px-4"
            onClick={() => {
              onReply(postId, commentId, String(replyInputs?.[reply.id] ?? ""), reply.id);
              setShowReplyInput(false);
            }}
          >
            Enviar
          </Button>
        </div>
      )}
    </div>
  );
}

function formatTime(date) {
  const now = new Date();
  const d = new Date(date);
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return "Agora";
  if (diff < 3600) return `${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h`;
  return `${Math.floor(diff / 86400)} d`;
}