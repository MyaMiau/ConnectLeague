import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import {
  Home,
  Briefcase,
  LogOut,
  Bell,
  Bookmark,
  MessageSquare,
} from "lucide-react";
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

  // Navegação no estilo Sidebar moderno
  const navItems = [
    {
      id: "notifications",
      label: "Notificações",
      icon: Bell,
      hasCounter: true,
      custom: true,
    },
    {
      id: "timeline",
      label: "Timeline",
      icon: Home,
      path: "/timeline",
    },
    {
      id: "messages",
      label: "Mensagens",
      icon: MessageSquare,
      path: "/messages",
    },
    {
      id: "jobs",
      label: "Vagas",
      icon: Briefcase,
      path: "/vagas",
    },
    {
      id: "saved",
      label: "Salvos",
      icon: Bookmark,
      path: "/vagas/salvos",
    },
    {
      id: "logout",
      label: "Sair",
      icon: LogOut,
      path: "/login",
      isDestructive: true,
    },
  ];

  const isOrgUser = session?.user?.type === "organization";
  const filteredNavItems = isOrgUser
    ? navItems.filter((item) => item.id !== "saved")
    : navItems;

  const getActiveItem = () => {
    const path = router.pathname;
    const asPath = router.asPath || "";

    // Perfil próprio (player ou organização) -> não destacar nada no menu
    const isOwnProfileRoute =
      (path.startsWith("/profile/[id]") || path.startsWith("/organization/[id]")) &&
      (() => {
        const segments = asPath.split("/");
        const idFromPath = segments[2];
        if (!idFromPath || !session?.user?.id) return false;
        return Number(idFromPath) === Number(session.user.id);
      })();

    if (isOwnProfileRoute) return null;

    if (path.startsWith("/timeline")) return "timeline";
    if (path.startsWith("/messages")) return "messages";
    if (path.startsWith("/vagas/salvos")) return "saved";
    if (path.startsWith("/vagas")) return "jobs";

    return "timeline";
  };

  const activeItem = getActiveItem();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-zinc-950 border-r border-zinc-800/60 flex flex-col z-50">
      {/* Logo / topo */}
      <div className="px-6 pt-6 pb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push("/timeline")}
          className="flex items-center gap-3 cursor-pointer"
        >
          <div className="relative w-14 h-14 rounded-full overflow-hidden bg-zinc-900 border border-zinc-700/80">
            <Image
              src={logoSrc}
              alt="Connect League"
              fill
              sizes="56px"
              className="object-cover"
              priority
              onError={() => {
                if (logoSrc === "/connect-league-logo.png") {
                  setLogoSrc("/cl-logo-render.png");
                }
              }}
            />
          </div>
          <span className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-indigo-400 to-fuchsia-400">
            CL
          </span>
        </button>
      </div>

      {/* Perfil usuário */}
      <div className="px-4 mb-6">
      {profile && (
        <Link
          href={getProfileUrl(profile)}
          className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/80 border border-zinc-800/80 transition-all duration-150 hover:bg-zinc-900 cursor-pointer group"
        >
          <div className="relative w-11 h-11 shrink-0 rounded-full overflow-hidden ring-2 ring-purple-500/40 group-hover:ring-purple-400/70 transition-all">
            <Image
              src={profile.image || "/default-avatar.png"}
              fill
              sizes="56px"
              className="object-cover"
              alt={profile.name || "Avatar"}
              priority/>
          </div>
          <span className="text-sm font-semibold text-zinc-100 group-hover:text-purple-300 transition-colors truncate">
            {profile.name}
          </span>
        </Link>
      )}
      </div>

      {/* Navegação */}
      <nav className="flex-1 px-3 mt-2">
        <ul className="space-y-1.5">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;

            if (item.custom) {
              // Notificações com popover
              return (
                <li key={item.id} className="relative">
                  <button
                    type="button"
                    onClick={() => setShowNotifications((prev) => !prev)}
                    className={`relative w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-base font-medium transition-colors cursor-pointer
                      ${
                        isActive
                          ? "bg-zinc-800/80 text-zinc-50 shadow-[0_0_0_1px_rgba(129,140,248,0.4)]"
                          : "text-zinc-300 hover:bg-zinc-900/80"
                      }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-9 w-1.5 rounded-full bg-gradient-to-b from-sky-400 via-indigo-400 to-fuchsia-400" />
                    )}
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {unreadCount > 0 && (
                      <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-bold rounded-full bg-pink-500 text-white">
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
                </li>
              );
            }

            if (item.id === "logout") {
              return (
                <li key={item.id} className="relative">
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="relative w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-base font-medium text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors cursor-pointer"
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="flex-1 text-left">Sair</span>
                  </button>
                </li>
              );
            }

            return (
              <li key={item.id} className="relative">
                <Link
                  href={item.path}
                  className={`relative w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-base font-medium transition-colors cursor-pointer
                    ${
                      isActive
                        ? "bg-zinc-800/80 text-zinc-50 shadow-[0_0_0_1px_rgba(129,140,248,0.4)]"
                        : "text-zinc-300 hover:bg-zinc-900/80"
                    }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-9 w-1.5 rounded-full bg-gradient-to-b from-sky-400 via-indigo-400 to-fuchsia-400" />
                  )}
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.id === "messages" && unreadMessages > 0 && (
                    <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-bold rounded-full bg-sky-500 text-white">
                      {unreadMessages}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Rodapé */}
      <div className="p-4 border-t border-zinc-800 text-xs text-zinc-500">
        © 2025 Connect League
      </div>
    </aside>
  );
}