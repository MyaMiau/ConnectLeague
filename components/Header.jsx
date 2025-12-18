import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { Home, Briefcase, LogOut, Bell, Bookmark, MessageSquare } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

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

function getProfileUrl(user) {
  if (!user) return "/profile";
  return user.type === "organization"
    ? `/organization/${user.id}`
    : `/profile/${user.id}`;
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
                <Link href={getProfileUrl(n.sender)} className="group">
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
                    <span>
                      <b>
                        <Link href={getProfileUrl(n.sender)} className="hover:underline">
                          {n.sender?.name || "Alguém"}
                        </Link>
                      </b>{" "}
                      curtiu seu post!{" "}
                      <Link
                        href={getNotificationLink(n)}
                        className="hover:underline focus:underline"
                        onClick={e => handleNotificationClick(e, n)}
                      >
                        Ver post
                      </Link>
                    </span>
                  )}
                  {n.type === "comment_like" && (
                    <span>
                      <b>
                        <Link href={getProfileUrl(n.sender)} className="hover:underline">
                          {n.sender?.name || "Alguém"}
                        </Link>
                      </b>{" "}
                      curtiu seu comentário!{" "}
                      <Link
                        href={getNotificationLink(n)}
                        className="hover:underline focus:underline"
                        onClick={e => handleNotificationClick(e, n)}
                      >
                        Ver comentário
                      </Link>
                    </span>
                  )}
                  {n.type === "reply" && (
                    <span>
                      <b>
                        <Link href={getProfileUrl(n.sender)} className="hover:underline">
                          {n.sender?.name || "Alguém"}
                        </Link>
                      </b>{" "}
                      respondeu seu comentário!{" "}
                      <Link
                        href={getNotificationLink(n)}
                        className="hover:underline focus:underline"
                        onClick={e => handleNotificationClick(e, n)}
                      >
                        Ver resposta
                      </Link>
                    </span>
                  )}
                  {n.type === "comment" && (
                    <span>
                      <b>
                        <Link href={getProfileUrl(n.sender)} className="hover:underline">
                          {n.sender?.name || "Alguém"}
                        </Link>
                      </b>{" "}
                      comentou no seu post!{" "}
                      <Link
                        href={getNotificationLink(n)}
                        className="hover:underline focus:underline"
                        onClick={e => handleNotificationClick(e, n)}
                      >
                        Ver comentário
                      </Link>
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
  const { data: session } = useSession();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      if (session?.user?.id) {
        try {
          const res = await fetch(`/api/users/${session.user.id}`);
          const data = await res.json();
          setProfile(data.user || data);
        } catch {
          setProfile(null);
        }
      }
    }

    function handleProfileUpdated() {
      fetchProfile();
    }
    window.addEventListener("profile-updated", handleProfileUpdated);

    fetchProfile();

    return () => {
      window.removeEventListener("profile-updated", handleProfileUpdated);
    };
  }, [session]);

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [unreadMessages, setUnreadMessages] = useState(0);
  const [logoSrc, setLogoSrc] = useState("/connect-league-logo.png");

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

  useEffect(() => {
    async function fetchConversations() {
      if (!session?.user?.id) return;
      try {
        const res = await fetch("/api/conversations");
        if (!res.ok) return;
        const data = await res.json();
        const totalUnread = data.reduce((acc, c) => {
          const part = c.participants.find(p => p.userId === Number(session.user.id));
          return acc + (part?.unreadCount || 0);
        }, 0);
        setUnreadMessages(totalUnread);
      } catch (err) {
        setUnreadMessages(0);
      }
    }
    fetchConversations();
    // opcional: interval para atualizar badge periodicamente
    const t = setInterval(fetchConversations, 20_000);
    return () => clearInterval(t);
  }, [session]);

  const handleReadAll = async () => {
    await fetch("/api/notifications", { method: "PATCH" });
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const navItems = [
    {
      label: "Notificações",
      icon: <Bell size={20} />,
      onClick: () => setShowNotifications((prev) => !prev),
      custom: true,
    },
    {
      label: "Mensagens",
      icon: <MessageSquare size={20} />,
      onClick: () => router.push("/messages"),
      badge: unreadMessages,
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
      label: "Salvos",
      icon: <Bookmark size={20} />,
      onClick: () => router.push("/vagas/salvos"),
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

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-zinc-900 flex flex-col items-center py-8 shadow-lg z-50">
      <Link href="/timeline" className="flex items-center mb-6">
        <Image
          src={logoSrc}
          alt="Logo Connect League"
          width={100}
          height={100}
          className="rounded-full object-cover"
          priority
          onError={() => {
            if (logoSrc === "/connect-league-logo.png") {
              setLogoSrc("/cl-logo-render.png");
            }
          }}
        />
      </Link>

      {profile && (
        <Link
          href={getProfileUrl(profile)}
          className="flex items-center gap-2 mb-8 w-full px-4 group cursor-pointer">
          <div className="relative w-[56px] h-[56px] shrink-0">
            <Image
              src={profile.image || "/default-avatar.png"}
              fill
              sizes="56px"
              className="rounded-full object-cover border-2 border-zinc-600 shadow-sm"
              alt={profile.name || "Avatar"}
              priority/>
          </div>
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
                  text-left cursor-pointer hover:text-purple-400`}
                style={{ boxShadow: "none", borderRadius: 0 }}
                onClick={item.onClick}>
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
                ${item.color || "hover:text-purple-400"}`}
              style={{
                boxShadow: "none",
                borderRadius: 0,
              }}>
              {item.icon}
              {item.label}
              {item.badge > 0 && (
                <span className="ml-1 bg-pink-500 text-white text-xs rounded-full px-2">
                  {item.badge}
                </span>
              )}
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