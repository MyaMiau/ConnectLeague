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
  depth = 0,
}) {
  const [showReplyInput, setShowReplyInput] = useState(false);

  const canEditOrDeleteReply = !!loggedUser?.id && loggedUser.id === getAuthorId(reply);

  if (!reply) return null;

  // keep a small indent for nested replies (matches previous layout)
  const indentStyle = depth > 0 ? { marginLeft: depth * 12 } : {};

  return (
    <div style={{ marginTop: 10, ...indentStyle }}>
      <div
        className="bg-zinc-900 rounded-xl shadow-lg"
        style={{
          border: "1.5px solid #232326",
          padding: "12px 14px",
        }}
      >
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="relative w-[36px] h-[36px] rounded-full overflow-hidden border border-zinc-700 shrink-0">
            <Link href={`/profile/${getAuthorId(reply)}`} className="block w-full h-full">
              <Image
                src={getAuthorImage(reply)}
                alt={getAuthorName(reply)}
                fill
                sizes="36px"
                className="object-cover"
                priority
              />
            </Link>
          </div>

          {/* Main column: name on top, content below, footer below content */}
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <Link href={`/profile/${getAuthorId(reply)}`} className="group">
                  <span className="text-sm font-semibold text-zinc-100 group-hover:underline">
                    {getAuthorName(reply)}
                  </span>
                </Link>
              </div>

              {/* Menu (3-pontos) */}
              <div className="ml-2">
                {canEditOrDeleteReply && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setActiveReplyMenu(activeReplyMenu === reply.id ? null : reply.id);
                    }}
                    className="flex items-center gap-1 text-sm hover:opacity-80 cursor-pointer"
                    aria-label="Abrir menu"
                  >
                    <MoreHorizontal size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Content below the name (compact spacing to match original) */}
            <div className="mt-1">
              {editingReply && editingReply.id === reply.id ? (
                <>
                  <Textarea
                    className="text-sm"
                    value={editingReply.content ?? ""}
                    onChange={(e) =>
                      setEditingReply({ ...editingReply, content: e.target.value })
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        e.stopPropagation();
                        saveEditedReply(commentId, reply.id, editingReply.content);
                      } else {
                        e.stopPropagation();
                      }
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onFocus={(e) => e.stopPropagation()}
                  />
                  <div className="mt-2 flex gap-2">
                    <Button
                      size="sm"
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        saveEditedReply(commentId, reply.id, editingReply.content);
                      }}
                    >
                      Salvar
                    </Button>
                    <Button
                      size="sm"
                      type="button"
                      variant="ghost"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setEditingReply(null);
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-sm text-zinc-300 break-words leading-tight">
                  {reply?.content ?? ""}
                </p>
              )}
            </div>

            {/* Footer: timestamp + responder (compact) */}
            <div className="flex items-center gap-4 mt-2 text-xs text-zinc-400">
              <span className="min-w-[38px] text-[12px]">{reply?.createdAt ? formatTime(reply.createdAt) : "Agora"}</span>
              <button
                type="button"
                className="font-semibold hover:underline cursor-pointer text-[13px]"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowReplyInput((s) => !s);
                }}
              >
                Responder
              </button>
            </div>
          </div>
        </div>

        {/* Dropdown actions (menu) - absolute so it doesn't affect layout */}
        {activeReplyMenu === reply.id && (
          <div
            className="absolute right-4 top-3 w-36 bg-zinc-800 border border-zinc-700 rounded shadow-md z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEditReply(reply, commentId);
                setActiveReplyMenu(null);
              }}
              className="block w-full text-left px-4 py-2 hover:bg-zinc-700 cursor-pointer"
            >
              Editar
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                openDeleteModal({
                  type: "reply",
                  postId,
                  commentId,
                  replyId: reply.id,
                });
                setActiveReplyMenu(null);
              }}
              className="block w-full text-left px-4 py-2 hover:bg-zinc-700 cursor-pointer"
            >
              Excluir
            </button>
          </div>
        )}

        {/* Reply input (inline, compact spacing) */}
        {showReplyInput && (
          <div className="flex gap-2 mt-2">
            <Input
              className="h-8"
              value={replyInputs?.[reply.id] ?? ""}
              onChange={(e) =>
                setReplyInputs({ ...replyInputs, [reply.id]: e.target.value })
              }
              placeholder={`Responder a ${getAuthorName(reply)}`}
              onKeyDown={(e) => {
                if (handleReplyInputKeyDown) handleReplyInputKeyDown(e, commentId, reply.id);
                e.stopPropagation();
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onFocus={(e) => e.stopPropagation()}
            />
            <Button
              type="button"
              className="h-8 py-0 px-4"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onReply(postId, commentId, String(replyInputs?.[reply.id] ?? ""), reply.id);
                setShowReplyInput(false);
              }}
            >
              Enviar
            </Button>
          </div>
        )}
      </div>
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