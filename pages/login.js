import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { FiMail as Mail, FiLock as Lock, FiEye, FiEyeOff } from "react-icons/fi";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const togglePassword = () => setShowPassword(!showPassword);
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.type) {
      if (session.user.type === "organization") {
        router.push(`/organization/${session.user.id}`);
      } else if (session.user.type === "player") {
        router.push(`/profile/${session.user.id}`);
      }
    }
  }, [status, session, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    // Faz login via next-auth
    const res = await signIn("credentials", {
      redirect: false,
      email: formData.email,
      password: formData.password,
    });

    if (res.error) {
      setError("Erro ao fazer login. Verifique seu email e senha.");
    }
    // Se sucesso, o useEffect faz o redirect
  };

  return (
    <div className="relative h-screen w-screen">
      {/* Imagem de fundo */}
      <Image
        src="/login-bg.jpg"
        alt="Login background"
        fill
        className="object-cover"
        quality={80}
        priority
      />

      {/* Camada escura + conteúdo */}
      <div className="absolute inset-0 bg-black/60 flex items-center justify-center px-4 md:px-16">
        {/* Texto da esquerda */}
        <div className="hidden md:flex flex-col justify-center items-start text-white w-1/2 pr-8">
          <h1 className="text-4xl font-bold mb-4">Bem-vindo(a) de volta!</h1>
          <p className="text-lg text-white/80">
            Conecte-se e encontre sua próxima equipe ou o jogador ideal para o seu time.
          </p>
        </div>

        {/* Formulário */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-lg max-w-md w-full text-white"
        >
          <h2 className="text-3xl font-bold mb-6 text-center">Login</h2>

          {/* Email */}
          <div className="relative mb-4">
            <label htmlFor="email" className="sr-only">Email</label>
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70" size={20} />
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full pl-10 p-3 rounded-md bg-white/20 border border-white/30 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Senha */}
          <div className="relative mb-4">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70" size={20} />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Senha"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-10 p-3 rounded-md bg-white/20 border border-white/30 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button
              type="button"
              onClick={togglePassword}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70"
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
          </div>

          {error && <p className="text-red-400 mb-4 text-sm">{error}</p>}

          <div className="flex justify-end mb-4">
            <a
              href="/forgot-password"
              className="text-sm text-amber-400 hover:text-amber-500 transition-colors"
            >
              Esqueceu sua senha?
            </a>
          </div>

          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 rounded-md cursor-pointer">
            Entrar
          </button>
          <div className="text-center mt-4">
            <p className="text-white">
              Não tem uma conta?{" "}
              <Link
                href="/register"
                className="text-amber-400 hover:text-amber-500 font-semibold transition-colors">
                Cadastre-se
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}