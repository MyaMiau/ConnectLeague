import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";

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
      <>
        <Header />
        <div className="min-h-screen bg-background text-foreground pl-64 flex items-center justify-center">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </>
    );
  }

  if (!vaga) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background text-foreground pl-64 flex items-center justify-center">
          <p className="text-muted-foreground">Vaga não encontrada.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background text-foreground pl-64">
        <main className="max-w-3xl mx-auto pt-10 pb-12 px-4 space-y-8">
          <header className="space-y-2">
            <h1 className="section-title">Candidatos da vaga</h1>
            <p className="text-muted-foreground">
              {vaga.titulo || vaga.title}
            </p>
            <p className="text-sm text-muted-foreground">
              Organização:{" "}
              <Link
                href={`/profile/${vaga.organization?.id || ""}`}
                className="text-primary font-medium hover:underline"
              >
                {vaga.organization?.name || "Organização desconhecida"}
              </Link>
            </p>
          </header>

          {vaga.applications?.length === 0 ? (
            <p className="text-center text-muted-foreground mt-6">
              Nenhum candidato ainda.
            </p>
          ) : (
            <div className="space-y-4">
              {vaga.applications?.map((app) => {
                const user = app.user;
                if (!user) return null;
                return (
                  <div
                    key={user.id}
                    className="card-glow bg-card rounded-xl p-5 animate-fade-in hover-lift"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-primary/20 bg-muted shrink-0">
                        <Image
                          src={user.image || "/default-avatar.png"}
                          alt={user.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                          priority
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h2 className="font-semibold text-lg text-foreground truncate">
                          {user.name}
                        </h2>
                        {user.elo && (
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">
                              Elo:
                            </span>{" "}
                            {Array.isArray(user.elo)
                              ? user.elo.join(", ")
                              : user.elo}
                          </p>
                        )}
                        {user.roles && (
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">
                              Funções:
                            </span>{" "}
                            {Array.isArray(user.roles)
                              ? user.roles.join(", ")
                              : user.roles}
                          </p>
                        )}
                        {user.bio && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {user.bio}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0">
                        <Link href={`/profile/${user.id}`}>
                          <button className="btn-gradient px-5 py-2.5 rounded-lg text-sm font-semibold shadow-lg">
                            Ver perfil
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </>
  );
}