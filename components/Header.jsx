import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { Home, Briefcase, LogOut, Bell } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

// Função utilitária para criar link seguro para notificações
function getNotificationLink(n) {
  if (n.type === "like" && n.postId) {
    return `/post/${n.postId}`;
  }
  if (n.type === "comment_like" && n.postId && n.commentId) {
    return `/post/${n.postId}#comment-${n.commentId}`;
  }
  if (n.type === "comment" && n.postId && n.commentId) {
    return `/post/${n.postId}#comment-${n.commentId}`;
  }
  if (n.type === "reply" && n.postId && n.replyId) {
    return `/post/${n.postId}#reply-${n.replyId}`;
  }
  return "#";
}

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

  function handleNotificationClick(e, n) {
    const link = getNotificationLink(n);
    if (link === "#") {
      e.preventDefault();
      alert("Este post ou comentário não existe ou foi excluído.");
    }
  }

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
                <Link href={`/profile/${n.sender?.id || ""}`} className="group">
                  <Image
                    src={n.sender?.image || "/default-avatar.png"}
                    alt="avatar"
                    width={36}
                    height={36}
                    className="rounded-full group-hover:opacity-80 transition"
                  />
                </Link>
                <div className="flex-1">
                  {n.type === "like" && (
                    <Link
                      href={getNotificationLink(n)}
                      className="hover:underline focus:underline"
                      onClick={e => handleNotificationClick(e, n)}
                    >
                      <b>
                        <Link href={`/profile/${n.sender?.id || ""}`} className="hover:underline">
                          {n.sender?.name || "Alguém"}
                        </Link>
                      </b>{" "}
                      curtiu seu post!
                    </Link>
                  )}
                  {n.type === "comment_like" && (
                    <Link
                      href={getNotificationLink(n)}
                      className="hover:underline focus:underline"
                      onClick={e => handleNotificationClick(e, n)}
                    >
                      <b>
                        <Link href={`/profile/${n.sender?.id || ""}`} className="hover:underline">
                          {n.sender?.name || "Alguém"}
                        </Link>
                      </b>{" "}
                      curtiu seu comentário!
                    </Link>
                  )}
                  {n.type === "reply" && (
                    <Link
                      href={getNotificationLink(n)}
                      className="hover:underline focus:underline"
                      onClick={e => handleNotificationClick(e, n)}
                    >
                      <b>
                        <Link href={`/profile/${n.sender?.id || ""}`} className="hover:underline">
                          {n.sender?.name || "Alguém"}
                        </Link>
                      </b>{" "}
                      respondeu seu comentário!
                    </Link>
                  )}
                  {n.type === "comment" && (
                    <Link
                      href={getNotificationLink(n)}
                      className="hover:underline focus:underline"
                      onClick={e => handleNotificationClick(e, n)}
                    >
                      <b>
                        <Link href={`/profile/${n.sender?.id || ""}`} className="hover:underline">
                          {n.sender?.name || "Alguém"}
                        </Link>
                      </b>{" "}
                      comentou no seu post!
                    </Link>
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
  const { data: session } = useSession();

  // Busca o perfil real do usuário logado
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      if (session?.user?.id) {
        try {
          const res = await fetch(`/api/users/${session.user.id}`);
          const data = await res.json();
          setProfile(data);
        } catch {
          setProfile(null);
        }
      }
    }
    fetchProfile();
  }, [session]);

  // Ordem de navegação: Notificações, Timeline, Vagas, Sair
  const navItems = [
    {
      label: "Notificações",
      icon: <Bell size={20} />,
      onClick: () => setShowNotifications((prev) => !prev),
      custom: true, // para renderizar o popover
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
      {/* Logo sempre em cima */}
      <Link href="/timeline" className="flex items-center mb-6">
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

      {/* Mini perfil do usuário logado (foto real e nome, hover roxo) */}
      {profile && (
        <Link
          href={`/profile/${profile.id}`}
          className="flex items-center gap-2 mb-8 w-full px-4 group cursor-pointer"
        >
          <Image
            src={profile.image || "/default-avatar.png"}
            alt={profile.name || "Avatar"}
            width={40}
            height={40}
            quality={100} // qualidade máxima da foto
            className="rounded-full object-cover border border-zinc-700"
            priority
          />
          <span className="text-zinc-100 font-semibold group-hover:text-purple-400 transition-colors truncate">
            {profile.name}
          </span>
        </Link>
      )}

      <nav className="flex flex-col gap-4 w-full px-4">
        {navItems.map((item, idx) =>
          item.custom ? (
            <div className="relative" key={item.label}>
              <button
                className={`
                  flex items-center gap-2 font-medium text-zinc-100
                  bg-transparent border-none outline-none px-0 py-0
                  hover:underline hover:underline-offset-4 hover:decoration-2 hover:decoration-purple-500
                  transition-all duration-150
                  text-left cursor-pointer hover:text-purple-400
                `}
                style={{ boxShadow: "none", borderRadius: 0 }}
                onClick={item.onClick}
              >
                {item.icon}
                {item.label}
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
          ) : (
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
          )
        )}
      </nav>
      <div className="mt-auto text-zinc-500 text-xs">
        © 2025 Connect League
      </div>
    </aside>
  );
}