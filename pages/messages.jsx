import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import MessageInput from "@/components/MessageInput";

export default function MessagesPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [loadingConv, setLoadingConv] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, [session]);

  useEffect(() => {
    const { conversationId } = router.query;
    if (conversationId) {
      openConversation(Number(conversationId));
    }
  }, [router.query]);

  async function fetchConversations() {
    if (!session?.user?.id) return;
    try {
      const res = await fetch("/api/conversations");
      if (!res.ok) return;
      const data = await res.json();
      setConversations(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function openConversation(convId) {
    setLoadingConv(true);
    setActiveConv(convId);
    try {
      const res = await fetch(`/api/messages?conversationId=${convId}`);
      if (!res.ok) return;
      const data = await res.json();
      setMessages(data);
      // refetch conversations to update unread counts / lastMessage
      await fetchConversations();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingConv(false);
    }
  }

  async function handleSend(text) {
    if (!activeConv || !text?.trim()) return;
    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: activeConv, content: text }),
      });
      // atualizar mensagens e conversas
      const res = await fetch(`/api/messages?conversationId=${activeConv}`);
      const newMessages = await res.json();
      setMessages(newMessages);
      await fetchConversations();
    } catch (err) {
      console.error(err);
    }
  }

  function getOtherParticipant(conv) {
    if (!session?.user?.id) return null;
    return conv.participants.find((p) => Number(p.userId) !== Number(session.user.id))?.user;
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background text-foreground pl-64">
        <div className="max-w-6xl mx-auto pt-10 pb-12 px-4">
          <div className="grid grid-cols-[320px_minmax(0,1fr)] gap-6 h-[calc(100vh-6rem)]">
            {/* Lista de conversas */}
            <aside className="card-glow bg-card rounded-xl overflow-hidden flex flex-col">
              <div className="p-4 border-b border-border font-display font-semibold text-foreground">
                Conversas
              </div>
              <div className="flex-1 divide-y divide-border/60 overflow-y-auto">
                {conversations.length === 0 && (
                  <div className="p-4 text-muted-foreground">Nenhuma conversa ainda</div>
                )}
                {conversations.map((c) => {
                  const other = getOtherParticipant(c);
                  const last = c.lastMessage;
                  const myPart = c.participants.find(
                    (p) => Number(p.userId) === Number(session?.user?.id),
                  );
                  const isActive = activeConv === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      className={`w-full flex items-center gap-3 p-4 text-left transition-all duration-200 hover:bg-muted/50 ${
                        isActive ? "bg-muted/70" : ""
                      }`}
                      onClick={() =>
                        router.push(`/messages?conversationId=${c.id}`, undefined, {
                          shallow: true,
                        })
                      }
                    >
                      <div className="w-12 h-12 relative rounded-full overflow-hidden bg-muted shrink-0 ring-2 ring-primary/20">
                        <img
                          src={other?.image || "/default-avatar.png"}
                          alt={other?.name}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-foreground truncate">
                            {other?.name || "Usuário"}
                          </span>
                          {myPart?.unreadCount > 0 && (
                            <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-bold rounded-full bg-pink-500 text-white">
                              {myPart.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {last?.content || "Nenhuma mensagem ainda"}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* Janela de chat */}
            <main className="card-glow bg-card rounded-xl flex flex-col overflow-hidden">
              <div className="p-4 border-b border-border font-display font-semibold text-foreground">
                {activeConv ? "Conversa" : "Selecione uma conversa"}
              </div>

              <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {loadingConv && (
                  <div className="text-center text-muted-foreground">Carregando...</div>
                )}
                {!activeConv && !loadingConv && (
                  <div className="text-muted-foreground">
                    Abra uma conversa para começar a trocar mensagens.
                  </div>
                )}
                {messages.map((m) => {
                  const isOwn = m.senderId === Number(session?.user?.id);
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col max-w-[70%] ${
                        isOwn ? "ml-auto items-end" : "items-start"
                      }`}
                    >
                      <span className="text-xs text-muted-foreground mb-1">
                        {m.sender?.name}
                      </span>
                      <div
                        className={`px-4 py-2.5 rounded-xl text-sm ${
                          isOwn ? "btn-gradient text-primary-foreground" : "bg-muted text-foreground"
                        }`}
                      >
                        {m.content}
                      </div>
                      <span className="text-[11px] text-muted-foreground mt-1.5">
                        {new Date(m.createdAt).toLocaleString("pt-BR")}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 border-t border-border bg-background/60">
                <MessageInput
                  onSend={handleSend}
                  disabled={!activeConv}
                  placeholder={
                    activeConv
                      ? "Escreva uma mensagem..."
                      : "Selecione uma conversa para enviar mensagem"
                  }
                />
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}