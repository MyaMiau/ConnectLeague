import { useEffect, useState } from "react";

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Simulação de usuário logado. Em produção, você buscaria os dados da API ou session.
    const loggedUser = {
      name: "Mya",
      role: "player",
    };
    setUser(loggedUser);
  }, []);

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen text-white">
        Carregando...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-4">Welcome, {user.name}!</h1>
      <p className="text-lg">Role: {user.role === "player" ? "Jogador" : "Organização"}</p>

      {/* Aqui você pode adicionar cards com candidaturas, avaliações, vagas, etc */}
      <div className="mt-6 p-4 bg-gray-800 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">Overview</h2>
        <p>Em breve você poderá acompanhar suas candidaturas, avaliações e muito mais por aqui!</p>
      </div>
    </div>
  );
}
