import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { Button } from "./ui/button";
import { User, Home, Briefcase, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function Header() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

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

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-zinc-900 flex flex-col items-center py-8 shadow-lg z-50">
      <Link href="/timeline" className="flex items-center">
        <Image
          src="/cl-logo-render.png"
          alt="Logo eSports Connect"
          width={80}
          height={80}
          className="rounded-md"
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
      </nav>
       <div className="mt-auto text-zinc-500 text-xs">
        © 2025 Connect League
      </div>
    </aside>
  );
}