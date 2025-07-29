import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { User, Home, Briefcase, LogOut, Bell } from "lucide-react";
import { signOut } from "next-auth/react";

function NotificationsPopover({ open, onClose, notifications = [], unreadCount, onRead }) {
  const ref = useRef();

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        onClose();
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className="absolute left-full top-0 ml-2 w-96 max-h-[500px] bg-zinc-900 rounded-xl shadow-lg border border-zinc-700 z-50 flex flex-col"
    >
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <span className="text-lg font-bold">Notificações</span>
        <button className="text-xs text-zinc-400 hover:text-zinc-200" onClick={onRead}>
          Marcar todas como lidas
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-6 text-zinc-400">Nenhuma notificação</div>
        ) : (
          <ul className="divide-y divide-zinc-800">
            {notifications.map(n => (
              <li key={n.id} className={`flex items-start gap-3 p-4 ${n.read ? "" : "bg-zinc-800"}`}>
                <Image
                  src={n.sender?.image || "/default-avatar.png"}
                  alt="avatar"
                  width={36}
                  height={36}
                  className="rounded-full"
                />
                <div className="flex-1">
                  {n.type === "like" && (
                    <Link
                      href={n.postId ? `/posts/${n.postId}` : "#"}
                      className="hover:underline focus:underline"
                    >
                      <b>{n.sender?.name || "Alguém"}</b> curtiu seu post!
                    </Link>
                  )}
                  {n.type === "comment_like" && (
                    <span>
                      <b>{n.sender?.name || "Alguém"}</b> curtiu seu comentário!
                    </span>
                  )}
                  {n.type === "reply" && (
                    <span>
                      <b>{n.sender?.name || "Alguém"}</b> respondeu seu comentário!
                    </span>
                  )}
                  {n.type === "comment" && (
                    <span>
                      <b>{n.sender?.name || "Alguém"}</b> comentou no seu post!
                    </span>
                  )}
                  <div className="text-xs text-zinc-400 mt-1">
                    {new Date(n.createdAt).toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" })}
                  </div>
                </div>
                {!n.read && <span className="mt-2 w-2 h-2 bg-pink-500 rounded-full" />}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="border-t border-zinc-800 text-center py-2 text-xs text-zinc-400 cursor-pointer hover:text-zinc-200">
        Ver notificações anteriores
      </div>
    </div>
  );
}

export default function Header() {
  const router = useRouter();

  const navItems = [
    {
      label: "Perfil",
      icon: <User size={20} />,
      onClick: () => router.push("/profile"),
    },
    {
      label: "Timeline",
      icon: <Home size={20} />,
      onClick: () => router.push("/timeline"),
    },
    {
      label: "Vagas",
      icon: <Briefcase size={20} />,
      onClick: () => router.push("/vagas"),
    },
    {
      label: "Sair",
      icon: <LogOut size={20} />,
      onClick: () => {
        signOut({ callbackUrl: "/login" });
      },
      color: "text-red-400 hover:border-b-red-400",
    },
  ];

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await fetch("/api/notifications");
        const data = await res.json();
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read).length);
      } catch (err) {
        setNotifications([]);
        setUnreadCount(0);
      }
    }
    fetchNotifications();
  }, [showNotifications]);

  const handleReadAll = async () => {
    await fetch("/api/notifications", { method: "PATCH" });
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-zinc-900 flex flex-col items-center py-8 shadow-lg z-50">
      <Link href="/timeline" className="flex items-center">
        <Image
          src="/cl-logo-render.png"
          alt="Logo eSports Connect"
          width={80}
          height={80}
          style={{ width: "100px", height: "auto" }}
          className="rounded-md"
          priority
        />
      </Link>

      <div className="h-10" />

      <nav className="flex flex-col gap-4 w-full px-4">
        {navItems.map((item, idx) => (
          <button
            key={item.label}
            onClick={item.onClick}
            className={`
              flex items-center gap-2 font-medium text-zinc-100 
              bg-transparent border-none outline-none px-0 py-0 
              hover:underline hover:underline-offset-4 hover:decoration-2 hover:decoration-purple-500
              transition-all duration-150
              text-left cursor-pointer
              ${item.color || "hover:text-purple-400"}
            `}
            style={{
              boxShadow: "none",
              borderRadius: 0,
            }}
          >
            {item.icon}
            {item.label}
          </button>
        ))}

        {/* Notificações */}
        <div className="relative">
          <button
            className={`
              flex items-center gap-2 font-medium text-zinc-100 
              bg-transparent border-none outline-none px-0 py-0 
              hover:underline hover:underline-offset-4 hover:decoration-2 hover:decoration-purple-500
              transition-all duration-150
              text-left cursor-pointer hover:text-purple-400
            `}
            style={{ boxShadow: "none", borderRadius: 0 }}
            onClick={() => setShowNotifications((prev) => !prev)}
          >
            <Bell size={20} />
            Notificações
            {unreadCount > 0 && (
              <span className="ml-1 bg-pink-500 text-white text-xs rounded-full px-2">
                {unreadCount}
              </span>
            )}
          </button>
          <NotificationsPopover
            open={showNotifications}
            onClose={() => setShowNotifications(false)}
            notifications={notifications}
            unreadCount={unreadCount}
            onRead={handleReadAll}
          />
        </div>
      </nav>
      <div className="mt-auto text-zinc-500 text-xs">
        © 2025 Connect League
      </div>
    </aside>
  );
}