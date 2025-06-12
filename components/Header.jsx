import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { Button } from "./ui/button";

export default function Header() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-zinc-950 border-b border-zinc-800 p-4 flex items-center justify-between z-50">
      <Link href="/timeline" className="flex items-center">
        <Image
          src="/cl-logo-render.png"
          alt="Logo eSports Connect"
          width={60}
          height={60}
          className="rounded-md"
        />
      </Link>

      <nav className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push("/profile")}>
          Perfil
        </Button>
        <Button variant="ghost" onClick={() => router.push("/timeline")}>
          Timeline
        </Button>
        <Button variant="ghost" onClick={() => router.push("/vagas")}>
          Vagas
        </Button>
        <Button variant="destructive" onClick={handleLogout}>
          Deslogar
        </Button>
      </nav>
    </header>
  );
}