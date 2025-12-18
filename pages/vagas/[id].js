import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Header from "../../components/Header";
import { Button } from "../../components/ui/button";
import { useSession } from "next-auth/react";

export default function VagaDetalhes() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();
  const [vaga, setVaga] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState({ open: false, message: "" });
  const [jaCandidatado, setJaCandidatado] = useState(false);
  const [applying, setApplying] = useState(false); // novo estado para evitar double submit

  useEffect(() => {
    if (!id) return;
    fetch(`/api/vagas/${id}`, {
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => {
        setVaga(data.vaga);
        setLoading(false);
        if (session?.user && data.vaga?.applications?.some(app => Number(app.user_id) === Number(session.user.id))) {
          setJaCandidatado(true);
        }
      });
  }, [id, session]);

  const handleCandidatar = async () => {
    if (!session?.user) {
      setConfirmModal({ open: true, message: "Faça login para se candidatar." });
      return;
    }

    if (!vaga) {
      setConfirmModal({ open: true, message: "Vaga não carregada." });
      return;
    }

    // frontend check: não tentar candidatar se vaga fechada
    if (vaga.status !== "Aberta") {
      setConfirmModal({ open: true, message: "Esta vaga está fechada. Não é possível se candidatar." });
      return;
    }

    if (applying) return; // evita double submit
    setApplying(true);

    try {
      const res = await fetch(`/api/vagas/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setConfirmModal({ open: true, message: "Candidatura enviada com sucesso!" });
        setJaCandidatado(true);
        setVaga(prev =>
          prev
            ? {
                ...prev,
                applications: [
                  ...(prev.applications || []),
                  { user_id: session.user.id, user: session.user }
                ]
              }
            : prev
        );
      } else {
        // mostra mensagem específica retornada pelo servidor, se houver
        setConfirmModal({ open: true, message: data.error || "Erro ao candidatar-se!" });
      }
    } catch (err) {
      console.error("Erro ao candidatar:", err);
      setConfirmModal({ open: true, message: "Erro de rede ao candidatar-se." });
    } finally {
      setApplying(false);
    }
  };

  const handleDescandidatar = async () => {
    if (!session?.user) return;
    const res = await fetch(`/api/vagas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "descandidatar" }),
      credentials: "include",
    });
    if (res.ok) {
      setConfirmModal({ open: true, message: "Candidatura cancelada!" });
      setJaCandidatado(false);
      setVaga(prev =>
        prev
          ? {
              ...prev,
              applications: (prev.applications || []).filter(app => Number(app.user_id) !== Number(session.user.id))
            }
          : prev
      );
    } else {
      setConfirmModal({ open: true, message: "Erro ao cancelar candidatura!" });
    }
  };

  if (loading)
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background text-foreground pl-64 flex items-center justify-center">
          <p className="text-muted-foreground">Carregando vaga...</p>
        </div>
      </>
    );
  if (!vaga)
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background text-foreground pl-64 flex items-center justify-center">
          <p className="text-muted-foreground">Vaga não encontrada.</p>
        </div>
      </>
    );

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background text-foreground pl-64">
        <main className="max-w-3xl mx-auto py-10 px-4 space-y-6">
          <header className="space-y-3">
            <h1 className="section-title">{vaga.titulo || vaga.title}</h1>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-muted ring-2 ring-primary/20 shrink-0">
                <img
                  src={
                    vaga.organization?.logo ||
                    vaga.organization?.image ||
                    "/default-avatar.png"
                  }
                  alt="Logo Organização"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  {vaga.organization?.name}
                </p>
                <Button variant="outline" asChild size="sm" className="mt-1">
                  <a href={`/profile/${vaga.organization?.id}`}>
                    Ver perfil da organização
                  </a>
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="badge-status badge-open">
                {vaga.status}
              </span>
              <span className="text-sm text-muted-foreground">
                Publicada em{" "}
                {vaga.dataPublicacao
                  ? new Date(vaga.dataPublicacao).toLocaleDateString()
                  : vaga.created_at
                  ? new Date(vaga.created_at).toLocaleDateString()
                  : "?"}
              </span>
            </div>
          </header>

          <section className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h2 className="font-semibold text-foreground mb-1">
                Descrição completa
              </h2>
              <p>{vaga.descricaoCompleta || vaga.descricao || vaga.description}</p>
            </div>

            {vaga.requisitos?.length > 0 && (
              <div>
                <h2 className="font-semibold text-foreground mb-1">
                  Requisitos
                </h2>
                <ul className="list-disc pl-6 space-y-1">
                  {vaga.requisitos.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {vaga.beneficios?.length > 0 && (
              <div>
                <h2 className="font-semibold text-foreground mb-1">
                  Benefícios
                </h2>
                <ul className="list-disc pl-6 space-y-1">
                  {vaga.beneficios.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-1">
              <p>
                <span className="font-semibold text-foreground">
                  Posições:
                </span>{" "}
                {vaga.posicoes?.join(", ") ||
                  vaga.positions?.join(", ") ||
                  "—"}
              </p>
              <p>
                <span className="font-semibold text-foreground">
                  Elo mínimo:
                </span>{" "}
                {vaga.elos?.join(", ") || "—"}
              </p>
              <p>
                <span className="font-semibold text-foreground">
                  Localização:
                </span>{" "}
                {vaga.cidade || vaga.city || ""}
                {(vaga.cidade || vaga.city) && (vaga.estado || vaga.state)
                  ? "/"
                  : ""}
                {vaga.estado || vaga.state || ""}
              </p>
              {vaga.tags?.length > 0 && (
                <p>
                  <span className="font-semibold text-foreground">
                    Tags:
                  </span>{" "}
                  {vaga.tags.join(", ")}
                </p>
              )}
              <p>
                <span className="font-semibold text-foreground">
                  Candidatos:
                </span>{" "}
                {vaga.applications?.length || 0}
              </p>
            </div>
          </section>

          <div>
            <Button
              disabled={vaga.status !== "Aberta" || applying}
              onClick={jaCandidatado ? handleDescandidatar : handleCandidatar}
              aria-label={
                jaCandidatado ? "Cancelar candidatura" : "Candidatar-se"
              }
              className="btn-gradient px-6 py-2.5 rounded-lg text-sm font-semibold"
            >
              {jaCandidatado
                ? "Cancelar candidatura"
                : vaga.status !== "Aberta"
                ? "Vaga fechada"
                : applying
                ? "Enviando..."
                : "Candidatar-se"}
            </Button>
          </div>
        </main>

        {/* Modal de confirmação */}
        {confirmModal.open && (
          <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
            <div className="card-glow bg-card p-6 rounded-2xl max-w-sm w-full text-center space-y-4">
              <p className="text-base text-foreground">{confirmModal.message}</p>
              <button
                className="btn-gradient px-6 py-2.5 rounded-lg text-sm font-semibold"
                onClick={() => setConfirmModal({ open: false, message: "" })}
              >
                Ok
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}