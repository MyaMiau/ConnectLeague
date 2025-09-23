import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Header from "../../components/Header";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { FiMoreHorizontal } from "react-icons/fi";

export default function OrganizationProfile() {
  const router = useRouter();
  const { id } = router.query;
  const [org, setOrg] = useState(null);
  const [vagas, setVagas] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [localOrg, setLocalOrg] = useState(null);

  // States for modal/forms
  const [showVagaModal, setShowVagaModal] = useState(false);
  const [vagaData, setVagaData] = useState({ titulo: "", descricao: "" });
  const [showPostModal, setShowPostModal] = useState(false);
  const [postData, setPostData] = useState({ content: "", image: "" });
  const [postImagePreview, setPostImagePreview] = useState("");
  const postImageInputRef = useRef(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/organization/${id}`)
      .then(res => res.json())
      .then(data => {
        setOrg(data.organization);
        setLocalOrg(data.organization);
        setLoading(false);
      });
    // Apenas vagas da organização
    fetch(`/api/vagas?organizationId=${id}`)
      .then(res => res.json())
      .then(data => {
        const filtered = (data.vagas || []).filter(vaga =>
          vaga.organizationId == id || vaga.organization?.id == id
        );
        setVagas(filtered);
      });
    fetch(`/api/posts?organizationId=${id}`)
      .then(res => res.json())
      .then(data => setPosts(data.posts || []));
  }, [id]);

  function handleChange(e) {
    const { name, value } = e.target;
    setLocalOrg(prev => ({ ...prev, [name]: value }));
  }

  async function handleSave() {
    const res = await fetch(`/api/organization/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(localOrg),
    });
    if (res.ok) {
      const updated = await res.json();
      setOrg(updated.organization);
      setLocalOrg(updated.organization);
      setEditMode(false);
      setShowMenu(false);
      alert("Perfil salvo com sucesso!");
    } else {
      alert("Erro ao salvar perfil.");
    }
  }

  function handleMenuClick() {
    setShowMenu(!showMenu);
  }

  // Abrir vaga
  function handleOpenVagaModal() {
    setVagaData({ titulo: "", descricao: "" });
    setShowVagaModal(true);
  }
  async function handleSubmitVaga(e) {
    e.preventDefault();
    const res = await fetch("/api/vagas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...vagaData,
        organizationId: id,
      }),
    });
    if (res.ok) {
      setShowVagaModal(false);
      // Atualiza lista
      fetch(`/api/vagas?organizationId=${id}`)
        .then(res => res.json())
        .then(data => {
          const filtered = (data.vagas || []).filter(vaga =>
            vaga.organizationId == id || vaga.organization?.id == id
          );
          setVagas(filtered);
        });
    } else {
      alert("Erro ao criar vaga.");
    }
  }

  // Fazer post
  function handleOpenPostModal() {
    setPostData({ content: "", image: "" });
    setPostImagePreview("");
    setShowPostModal(true);
  }
  function handlePostImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPostImagePreview(URL.createObjectURL(file));
    setPostData(pd => ({ ...pd, image: file }));
  }
  async function handleSubmitPost(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append("content", postData.content);
    formData.append("organizationId", id);
    if (postData.image) {
      formData.append("image", postData.image);
    }
    const res = await fetch("/api/posts", {
      method: "POST",
      body: formData,
    });
    if (res.ok) {
      setShowPostModal(false);
      fetch(`/api/posts?organizationId=${id}`)
        .then(res => res.json())
        .then(data => setPosts(data.posts || []));
    } else {
      alert("Erro ao criar post.");
    }
  }

  if (loading)
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Carregando...
      </div>
    );
  if (!org)
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Organização não encontrada.
      </div>
    );

  const displayName = localOrg?.orgName || localOrg?.name;
  const displayBio = localOrg?.orgDesc || localOrg?.bio || "Nenhuma descrição ainda.";
  const displayImage = localOrg?.logo || localOrg?.image || "/default-avatar.png";
  const displayEmail = localOrg?.email || "";

  return (
    <div className="min-h-screen bg-black text-white flex">
      <Header user={org} />
      <main className="flex-1 flex flex-col items-center py-10 px-4">
        {/* Card de perfil da organização */}
        <div className="w-full max-w-2xl bg-zinc-900 rounded-2xl shadow-xl mb-8 border border-zinc-800 relative">
          <div className="flex gap-6 items-center px-8 py-8">
            <div className="shrink-0">
              <Image
                src={displayImage}
                width={120}
                height={120}
                className="rounded-full border-4 border-purple-500 object-cover bg-zinc-800"
                alt={`Logo da organização ${displayName}`}
              />
            </div>
            <div className="flex-1 flex flex-col items-start">
              <h2 className="text-2xl font-semibold mb-2">{displayName}</h2>
              {displayEmail && <p className="text-zinc-400 mb-2">{displayEmail}</p>}
              <p className="text-zinc-300 mb-2">{displayBio}</p>
            </div>
            {/* Botão de 3 pontinhos */}
            {org.isCurrentUser && !editMode && (
              <div className="absolute top-6 right-6 z-10">
                <button
                  className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 transition"
                  onClick={handleMenuClick}
                  aria-label="Opções"
                >
                  <FiMoreHorizontal size={28} color="#A78BFA" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 mt-2 bg-zinc-900 shadow rounded py-1 px-2">
                    <button
                      className="text-zinc-200 hover:text-purple-400 px-3 py-1 w-full text-left"
                      onClick={() => {
                        setEditMode(true);
                        setShowMenu(false);
                      }}
                    >
                      Editar Perfil
                    </button>
                  </div>
                )}
              </div>
            )}
            {/* Botões edição */}
            {org.isCurrentUser && editMode && (
              <div className="absolute top-6 right-6 z-10 flex gap-2">
                <Button size="sm" onClick={handleSave}>Salvar</Button>
                <Button size="sm" variant="outline" onClick={() => { setEditMode(false); setShowMenu(false); }}>
                  Cancelar
                </Button>
              </div>
            )}
          </div>
          {/* Formulário de edição */}
          {org.isCurrentUser && editMode && (
            <div className="px-8 pb-8">
              <Input
                name="orgName"
                value={localOrg.orgName || ""}
                onChange={handleChange}
                className="text-lg font-bold mt-2 mb-2"
                placeholder="Nome da Organização"
              />
              <Input
                name="email"
                value={localOrg.email || ""}
                onChange={handleChange}
                className="mb-2"
                placeholder="Email"
              />
              <Textarea
                name="orgDesc"
                value={localOrg.orgDesc || ""}
                onChange={handleChange}
                className="mb-2"
                placeholder="Descrição/Bio"
              />
            </div>
          )}
        </div>

        {/* Ações para dono do perfil */}
        {org.isCurrentUser && (
          <div className="w-full max-w-2xl flex gap-4 mb-8">
            <Button className="flex-1" onClick={handleOpenVagaModal}>
              Abrir uma vaga
            </Button>
            <Button className="flex-1" variant="outline" onClick={handleOpenPostModal}>
              Fazer um post
            </Button>
          </div>
        )}

        {/* Modal vaga */}
        {showVagaModal && (
          <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60">
            <form
              className="bg-zinc-900 p-8 rounded-2xl shadow-lg max-w-md w-full flex flex-col gap-3"
              onSubmit={handleSubmitVaga}
            >
              <h2 className="text-xl font-bold mb-2">Abrir vaga</h2>
              <Input
                name="titulo"
                placeholder="Título da vaga"
                value={vagaData.titulo}
                onChange={e => setVagaData(v => ({ ...v, titulo: e.target.value }))}
                required
              />
              <Textarea
                name="descricao"
                placeholder="Descrição da vaga"
                value={vagaData.descricao}
                onChange={e => setVagaData(v => ({ ...v, descricao: e.target.value }))}
                required
              />
              <div className="flex gap-2 mt-2">
                <Button type="submit">Criar</Button>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setShowVagaModal(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Modal post - agora com upload de imagem */}
        {showPostModal && (
          <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60">
            <form
              className="bg-zinc-900 p-8 rounded-2xl shadow-lg max-w-md w-full flex flex-col gap-3"
              onSubmit={handleSubmitPost}
            >
              <h2 className="text-xl font-bold mb-2">Novo post</h2>
              <Textarea
                name="content"
                placeholder="Digite seu post"
                value={postData.content}
                onChange={e => setPostData(p => ({ ...p, content: e.target.value }))}
                required
              />
              <label className="font-semibold text-zinc-300 mt-2 mb-1">Imagem (opcional)</label>
              <input
                type="file"
                accept="image/*"
                ref={postImageInputRef}
                onChange={handlePostImageChange}
                className="bg-zinc-800 text-zinc-200 rounded p-2"
              />
              {postImagePreview && (
                <div className="mt-2">
                  <Image
                    src={postImagePreview}
                    width={400}
                    height={200}
                    className="rounded-lg"
                    alt="Prévia da imagem"
                  />
                </div>
              )}
              <div className="flex gap-2 mt-2">
                <Button type="submit">Publicar</Button>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setShowPostModal(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Vagas abertas */}
        <div className="w-full max-w-2xl">
          <h2 className="text-xl font-bold mb-4">Vagas abertas</h2>
          {vagas.length === 0 ? (
            <p className="text-zinc-500 text-center">Nenhuma vaga aberta.</p>
          ) : (
            <div className="space-y-4">
              {vagas.map(vaga => (
                <div key={vaga.id} className="bg-zinc-900 rounded-xl p-5 shadow">
                  <h3 className="text-lg font-bold">{vaga.titulo || vaga.title}</h3>
                  <p className="text-zinc-300 mb-2">{vaga.descricao || vaga.description}</p>
                  <span className="text-xs text-zinc-400">
                    Publicada em {vaga.created_at ? new Date(vaga.created_at).toLocaleDateString() : "?"}
                  </span>
                  <div className="mt-2">
                    <Button size="sm" onClick={() => router.push(`/vagas/${vaga.id}`)}>
                      Ver vaga
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Posts da organização */}
        <div className="w-full max-w-2xl mt-8">
          <h2 className="text-xl font-bold mb-4">Posts</h2>
          {posts.length === 0 ? (
            <p className="text-zinc-500 text-center">Nenhum post ainda.</p>
          ) : (
            <div className="space-y-6">
              {posts.map(post => (
                <div key={post.id} className="bg-zinc-900 rounded-xl p-6 shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <Image
                      src={displayImage}
                      width={40}
                      height={40}
                      className="rounded-full border border-zinc-700"
                      alt="Logo da organização"
                    />
                    <span className="font-semibold">{displayName}</span>
                    <span className="text-xs text-zinc-400">
                      {post.created_at ? new Date(post.created_at).toLocaleString() : ""}
                    </span>
                  </div>
                  <p className="mb-2">{post.content}</p>
                  {post.image && (
                    <Image
                      src={post.image}
                      width={400}
                      height={200}
                      className="rounded-lg"
                      alt="Imagem do post"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}