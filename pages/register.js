// src/pages/register.js
import { useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from "react-icons/fi";
import { UserCog } from "lucide-react";




export default function Register() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const togglePassword = () => setShowPassword(!showPassword);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "", // novo campo
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Erro ao cadastrar");
      }

      router.push("/login");
    } catch (error) {
      console.error(error);
      setError("Erro ao cadastrar. Tente novamente.");
    }
  };

  return (
    <div className="relative h-screen w-screen">
      <Image
        src="/register-bg1.jpg"
        alt="Register background"
        fill
        className="object-cover"
        quality={80}
        priority
      />
      

    <section className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 bg-cover bg-center relative">
      <div className="absolute inset-0 bg-black/60 z-0" />
      
      <div className="z-10 max-w-4xl w-full flex flex-col items-center text-center">
        {/* Texto acima */}
        <div className="mb-8 text-white">
          <h1 className="text-4xl font-bold">Crie sua conta</h1>
          <p className="text-white/80 text-base sm:text-lg">
            Conecte-se ao cenário competitivo e encontre sua próxima equipe ou jogador.
          </p>
        </div>


        {/* Formulário */}
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-xl w-full max-w-md">
        <form className="space-y-4">
          <h2 className="text-3xl font-bold mb-6 text-center">Cadastro</h2>

          {/* Nome */}
          <div className="relative mb-4">
            <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70" size={20} />
            <input
              type="text"
              name="name"
              placeholder="Nome"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full pl-10 p-3 rounded-md bg-white/20 border border-white/30 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Email */}
          <div className="relative mb-4">
            <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70" size={20} />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full pl-10 p-3 rounded-md bg-white/20 border border-white/30 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Campo de função */}
          <div className="relative mb-4">
          <UserCog className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70" size={20} />
          <select
            name="role"
            id="role"
            value={formData.role}
            onChange={handleChange}
            required
            className="w-full pl-10 p-3 rounded-md bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <option value="" disabled hidden>Selecione sua função</option>
            <option value="jogador" style={{ color: "#000" }}>Jogador</option>
            <option value="organizacao" style={{ color: "#000" }}>Organização</option>
          </select>
        </div>



          {/* Senha */}
          <div className="relative mb-4">
            <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70" size={20} />
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
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white"
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
          </div>

          {/* Confirmar senha */}
          <div className="relative mb-4">
            <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70" size={20} />
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirmar senha"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-10 p-3 rounded-md bg-white/20 border border-white/30 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {error && <p className="text-red-400 mb-4 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 rounded-md cursor-pointer"
          >
            Cadastrar
          </button>

          <div className="text-center mt-4">
            <p className="text-white text-sm">
              Já tem uma conta?{" "}
              <a
                href="/login"
                className="text-amber-400 hover:text-amber-500 font-semibold transition-colors"
              >
                Entrar
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  </section>
 </div> 
  
  );
}
