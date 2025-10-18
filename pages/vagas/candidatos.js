import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header"; // ajuste o path se necessário
import ProfileCard from "@/components/ProfileCard"; // ajuste o path se quiser usar o card completo
import Image from "next/image";

export default function VagaCandidatos() {
  const router = useRouter();
  const { id } = router.query;

  const [vaga, setVaga] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/vagas/${id}`)
      .then(res => res.json())
      .then(data => {
        setVaga(data.vaga);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center">
        <Header />
        <div className="flex-1 flex items-center justify-center">Carregando...</div>
      </div>
    );
  }

  if (!vaga) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center">
        <Header />
        <div className="flex-1 flex items-center justify-center">Vaga não encontrada.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center px-4">
      <Header />
      <div className="w-full max-w-2xl mt-10">
        <h1 className="text-3xl font-bold mb-2">Candidatos da vaga</h1>
        <h2 className="text-xl font-semibold mb-4">
          {vaga.titulo || vaga.title}
        </h2>
        <div className="mb-8 text-zinc-400">
          <span>
            Organização:{" "}
            <Link href={`/profile/${vaga.organization?.id || ""}`} className="hover:underline font-bold">
              {vaga.organization?.name || "Organização desconhecida"}
            </Link>
          </span>
        </div>

        {vaga.applications?.length === 0 && (
          <p className="text-zinc-400 text-center">Nenhum candidato ainda.</p>
        )}

        <div className="space-y-6">
          {vaga.applications?.map(app => {
            const user = app.user;
            if (!user) return null;
            return (
              <div
                key={user.id}
                className="bg-zinc-900 rounded-xl p-6 flex flex-col md:flex-row items-center gap-6 border border-zinc-800 shadow"
              >
                <Link href={`/profile/${user.id}`} className="flex items-center gap-4 group">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden border border-zinc-700 bg-zinc-800 shrink-0">
                    <Image
                      src={user.image || "/default-avatar.png"}
                      alt={user.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                      priority
                    />
                  </div>
                  <div>
                    <p className="font-bold text-lg group-hover:underline">{user.name}</p>
                    {user.elo && (
                      <p className="text-zinc-400 text-sm">
                        <strong>Elo:</strong> {Array.isArray(user.elo) ? user.elo.join(", ") : user.elo}
                      </p>
                    )}
                    {user.roles && (
                      <p className="text-zinc-400 text-sm">
                        <strong>Funções:</strong> {Array.isArray(user.roles) ? user.roles.join(", ") : user.roles}
                      </p>
                    )}
                    {user.bio && (
                      <p className="text-zinc-300 text-sm mt-2">{user.bio}</p>
                    )}
                  </div>
                </Link>
                <div className="mt-3 md:mt-0 md:ml-auto flex flex-col items-end">
                  <Link href={`/profile/${user.id}`}>
                    <button className="bg-purple-600 text-white py-2 px-4 rounded shadow hover:bg-purple-700 transition">
                      Ver perfil
                    </button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}