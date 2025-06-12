import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex space-x-4 p-4 bg-gray-800 text-white">
      <Link href="/login" className="hover:underline">Login</Link>
      <Link href="/cadastro" className="hover:underline">Cadastro</Link>
      <Link href="/dashboard" className="hover:underline">Dashboard</Link>
      <Link href="/vagas" className="hover:underline">Vagas</Link>
    </nav>
  );
}
