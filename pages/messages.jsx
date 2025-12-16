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
    return conv.participants.find(p => Number(p.userId) !== Number(session.user.id))?.user;
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-black text-white pl-56">
        <div className="flex max-w-6xl mx-auto mt-8 gap-6">
          <aside className="w-96 bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
            <div className="p-4 border-b border-zinc-800 font-semibold">Conversas</div>
            <div className="divide-y divide-zinc-800 max-h-[70vh] overflow-y-auto">
              {conversations.length === 0 && <div className="p-4 text-zinc-400">Nenhuma conversa ainda</div>}
              {conversations.map((c) => {
                const other = getOtherParticipant(c);
                const last = c.lastMessage;
                const myPart = c.participants.find(p => Number(p.userId) === Number(session?.user?.id));
                return (
                  <div
                    key={c.id}
                    className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-zinc-800 ${activeConv === c.id ? "bg-zinc-800" : ""}`}
                    onClick={() => router.push(`/messages?conversationId=${c.id}`, undefined, { shallow: true })}>
                    <div className="w-12 h-12 relative rounded-full overflow-hidden bg-zinc-700 shrink-0">
                      <img src={other?.image || "/default-avatar.png"} alt={other?.name} className="object-cover w-full h-full" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold">{other?.name || "Usuário"}</div>
                        {myPart?.unreadCount > 0 && (
                          <div className="bg-pink-500 text-white text-xs px-2 rounded-full">{myPart.unreadCount}</div>
                        )}
                      </div>
                      <div className="text-zinc-400 text-sm truncate">{last?.content || "Nenhuma mensagem ainda"}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>

          <main className="flex-1 bg-zinc-900 rounded-xl border border-zinc-800 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-zinc-800 font-semibold">
              {activeConv ? `Conversa` : "Selecione uma conversa"}
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
              {loadingConv && <div className="text-center text-zinc-400">Carregando...</div>}
              {!activeConv && !loadingConv && <div className="text-zinc-400">Abra uma conversa para começar a trocar mensagens.</div>}
              {messages.map(m => (
                <div key={m.id} className={`mb-4 max-w-[70%] ${m.senderId === Number(session?.user?.id) ? "ml-auto text-right" : ""}`}>
                  <div className="text-sm text-zinc-300">{m.sender?.name}</div>
                  <div className={`mt-1 inline-block px-4 py-2 rounded-xl ${m.senderId === Number(session?.user?.id) ? "bg-purple-600" : "bg-zinc-800"}`}>
                    {m.content}
                  </div>
                  <div className="text-xs text-zinc-500 mt-1">{new Date(m.createdAt).toLocaleString("pt-BR")}</div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-zinc-800">
              <MessageInput onSend={handleSend} disabled={!activeConv} placeholder={activeConv ? "Escreva uma mensagem..." : "Selecione uma conversa para enviar mensagem"} />
            </div>
          </main>
        </div>
      </div>
    </>
  );
}