import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import Link from "next/link";
import Header from "../../components/Header";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { MoreHorizontal, Heart, MessageCircle, Share2 } from "lucide-react";
import { format } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";
import { cn } from "@/lib/utils";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import ReplyThread from "@/components/ReplyThread";
import VagaModalForm from "../../components/VagaModalForm";
import VagaDetalhesModal from "../../components/VagaDetalhesModal";
import VagaCard from "../../components/VagaCard";

export default function OrganizationProfile() {
  const router = useRouter();
  const { id } = router.query;
  const [org, setOrg] = useState(null);
  const [vagas, setVagas] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showPostMenu, setShowPostMenu] = useState(null);
  const [localOrg, setLocalOrg] = useState(null);
  const [loggedUser, setLoggedUser] = useState(null);
  const [activeOptions, setActiveOptions] = useState(null);
  const [activeCommentOptions, setActiveCommentOptions] = useState(null);
  const [activeReplyMenu, setActiveReplyMenu] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const [replyInputs, setReplyInputs] = useState({});
  const [editingComment, setEditingComment] = useState(null);
  const [editingReply, setEditingReply] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({ type: "", postId: null, commentId: null, replyId: null });
  const commentMenuRef = useRef({});
  const postMenuRef = useRef({});

  // Modais de vaga
  const [showVagaModal, setShowVagaModal] = useState(false);
  const [showEditVagaModal, setShowEditVagaModal] = useState(false);
  const [editVaga, setEditVaga] = useState(null);
  const [vagaSelecionada, setVagaSelecionada] = useState(null);
  const [isDeleteVagaModalOpen, setIsDeleteVagaModalOpen] = useState(false);
  const [vagaToDeleteId, setVagaToDeleteId] = useState(null);


  // Modais de post
  const [showPostModal, setShowPostModal] = useState(false);
  const [postData, setPostData] = useState({ content: "", image: null });
  const [postImagePreview, setPostImagePreview] = useState("");
  const [postError, setPostError] = useState("");
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
    fetch(`/api/vagas?organizationId=${id}`)
      .then(res => res.json())
      .then(data => {
        const filtered = (data.vagas || []).filter(vaga =>
          vaga.organizationId == id || vaga.organization?.id == id
        );
        setVagas(filtered);
      });
    fetch(`/api/posts?userId=${id}`)
      .then(res => res.json())
      .then(data => setPosts(data || []));
  }, [id]);

  useEffect(() => {
    async function fetchMe() {
      try {
        const res = await fetch("/api/users/me");
        if (res.ok) {
          const data = await res.json();
          setLoggedUser(data);
        }
      } catch {
        setLoggedUser(null);
      }
    }
    fetchMe();
  }, []);

  const canEditOrDeletePost = (post) =>
    String(loggedUser?.id) === String(post.authorId) ||
    String(loggedUser?.id) === String(post.author?.id);

  const canEditOrDeleteComment = (comment) =>
    String(loggedUser?.id) === String(comment.authorId) ||
    String(loggedUser?.id) === String(comment.author?.id);



  function handleChange(e) {
    const { name, value } = e.target;
    setLocalOrg(prev => ({ ...prev, [name]: value }));
  }

  async function handleLogoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `org-logos/${fileName}`;

      const { data, error } = await supabase.storage
        .from("cl-avatars")
        .upload(filePath, file);

      // #region agent log
      fetch(
        "http://127.0.0.1:7242/ingest/10fdd7ad-6471-44b1-8078-9719ef0a3d08",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: "debug-session",
            runId: "pre-fix",
            hypothesisId: "H3",
            location: "pages/organization/[id].js:handleLogoChange",
            message: "Resultado upload logo organização Supabase",
            data: { filePath, hasError: !!error },
            timestamp: Date.now(),
          }),
        }
      ).catch(() => {});
      // #endregion

      if (error) {
        console.error("Erro upload logo organização Supabase:", error);
        alert("Erro ao enviar imagem da organização.");
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("cl-avatars")
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData?.publicUrl;
      if (!publicUrl) {
        alert("Erro ao obter URL pública da logo.");
        return;
      }

      setLocalOrg((prev) => (prev ? { ...prev, logo: publicUrl } : prev));
    } catch (err) {
      console.error("Erro inesperado ao enviar logo:", err);
      alert("Erro ao enviar imagem da organização.");
    }
  }

  async function handleSave() {
    if (!localOrg) return;

    // Converte o campo "logo" (usado no front) para "image", que é o campo existente no modelo `users`
    const { logo, orgName, ...rest } = localOrg;
    const payload = {
      ...rest,
      name: orgName || rest.name,
      image: logo || rest.image || null,
    };

    const res = await fetch(`/api/organization/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const updated = await res.json();
      // Preservar isCurrentUser que não vem da API PUT
      const updatedOrgWithIsCurrentUser = {
        ...updated.organization,
        isCurrentUser: org?.isCurrentUser ?? (Number(loggedUser?.id) === Number(id))
      };
      setOrg(updatedOrgWithIsCurrentUser);
      setLocalOrg(updatedOrgWithIsCurrentUser);
      setEditMode(false);
      setShowMenu(false);
      alert("Perfil salvo com sucesso!");
      window.dispatchEvent(new Event("profile-updated"));
      fetch(`/api/posts?userId=${id}`)
        .then(res => res.json())
        .then(data => setPosts(data || []));
      fetch(`/api/vagas?organizationId=${id}`)
        .then(res => res.json())
        .then(data => {
          const filtered = (data.vagas || []).filter(vaga =>
            vaga.organizationId == id || vaga.organization?.id == id
          );
          setVagas(filtered);
        });
    } else {
      alert("Erro ao salvar perfil.");
    }
  }

  function handleMenuClick() {
    setShowMenu(!showMenu);
  }

  // Abrir vaga
  function handleOpenVagaModal() {
    setShowVagaModal(true);
  }

  async function handleSubmitVaga(vagaData) {
    const res = await fetch("/api/vagas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(vagaData),
    });
    if (res.ok) {
      setShowVagaModal(false);
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

  function handleOpenEditVagaModal(vaga) {
    setVagaSelecionada(null); 
    setEditVaga(vaga);
    setShowEditVagaModal(true);
  }

  async function handleUpdateVaga(vagaData) {
    const res = await fetch(`/api/vagas/${vagaData.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(vagaData),
    });
    if (res.ok) {
      setShowEditVagaModal(false);
      setEditVaga(null);
      fetch(`/api/vagas?organizationId=${id}`)
        .then(res => res.json())
        .then(data => {
          const filtered = (data.vagas || []).filter(vaga =>
            vaga.organizationId == id || vaga.organization?.id == id
          );
          setVagas(filtered);
        });
      setVagaSelecionada(null);
      alert("Vaga atualizada com sucesso!");
    } else {
      alert("Erro ao atualizar vaga!");
    }
  }

  async function handleFecharVaga(vagaId) {
      const vaga = vagas.find(v => v.id === vagaId);
      if (!vaga) return;
      const novoStatus = vaga.status === "Aberta" ? "Fechada" : "Aberta";
      await fetch(`/api/vagas/${vagaId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: novoStatus }),
      });
      fetch(`/api/vagas?organizationId=${id}`)
        .then(res => res.json())
        .then(data => {
          const filtered = (data.vagas || []).filter(vaga =>
            vaga.organizationId == id || vaga.organization?.id == id
          );
          setVagas(filtered);
        });
      setVagaSelecionada(prev =>
        prev && prev.id === vagaId ? { ...prev, status: novoStatus } : prev
      );
    }

  async function handleDeletarVaga(vagaId) {
    await fetch(`/api/vagas/${vagaId}`, {
      method: "DELETE",
    });
    fetch(`/api/vagas?organizationId=${id}`)
      .then(res => res.json())
      .then(data => {
        const filtered = (data.vagas || []).filter(vaga =>
          vaga.organizationId == id || vaga.organization?.id == id
        );
        setVagas(filtered);
      });
    setVagaSelecionada(null);
  }

  // Fazer post
  function handleOpenPostModal() {
    setPostData({ content: "", image: null });
    setPostImagePreview("");
    setPostError("");
    setShowPostModal(true);
  }
  function handlePostImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPostImagePreview(URL.createObjectURL(file));
    setPostData(pd => ({ ...pd, image: file }));
  }

  async function uploadImageIfNeeded(imageFile) {
    if (!imageFile) return "";
    const formData = new FormData();
    formData.append("image", imageFile);
    try {
      const resp = await fetch("/api/posts/upload", {
        method: "POST",
        body: formData,
      });
      if (resp.ok) {
        const data = await resp.json();
        return data.imageUrl || "";
      } else {
        setPostError("Erro ao enviar imagem. Tente novamente.");
        return "";
      }
    } catch (err) {
      setPostError("Erro ao enviar imagem. Tente novamente.");
      return "";
    }
  }

  async function handleSubmitPost(e) {
    e.preventDefault();
    setPostError("");
    let imageUrl = "";
    if (postData.image) {
      imageUrl = await uploadImageIfNeeded(postData.image);
      if (!imageUrl) {
        return;
      }
    }
    const payload = {
      content: postData.content,
      image: imageUrl,
      authorId: id
    };
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setShowPostModal(false);
      setPostData({ content: "", image: null });
      setPostImagePreview("");
      fetch(`/api/posts?userId=${id}`)
        .then(res => res.json())
        .then(data => setPosts(data || []));
    } else {
      setPostError("Erro ao criar post.");
    }
  }
    // Deletar vaga com confirmação
    function confirmDeleteVaga(vagaId) {
      setVagaToDeleteId(vagaId);
      setIsDeleteVagaModalOpen(true);
    }

async function handleDeletarVagaConfirmed() {
  await fetch(`/api/vagas/${vagaToDeleteId}`, {
    method: "DELETE",
  });
  fetch(`/api/vagas?organizationId=${id}`)
    .then(res => res.json())
    .then(data => {
      const filtered = (data.vagas || []).filter(vaga =>
        vaga.organizationId == id || vaga.organization?.id == id
      );
      setVagas(filtered);
    });
  setVagaSelecionada(null);
  setIsDeleteVagaModalOpen(false);
  setVagaToDeleteId(null);
}

  const toggleLikePost = async (postId) => {
    await fetch(`/api/posts/${postId}/like`, { method: "POST" });
    setPosts(posts =>
      posts.map(post =>
        post.id !== postId
          ? post
          : {
              ...post,
              postLikes: post.postLikes?.some(l => l.userId === loggedUser?.id)
                ? post.postLikes.filter(l => l.userId !== loggedUser?.id)
                : [...(post.postLikes || []), { userId: loggedUser?.id }],
            }
      )
    );
  };

  const toggleLikeComment = async (commentId, postId) => {
    await fetch(`/api/comments/${commentId}/like`, { method: "POST" });
    setPosts(posts =>
      posts.map(post =>
        post.id !== postId
          ? post
          : {
              ...post,
              comments: post.comments.map(comment =>
                comment.id !== commentId
                  ? comment
                  : {
                      ...comment,
                      commentLikes: comment.commentLikes?.some(l => l.userId === loggedUser?.id)
                        ? comment.commentLikes.filter(l => l.userId !== loggedUser?.id)
                        : [...(comment.commentLikes || []), { userId: loggedUser?.id }],
                    }
              ),
            }
      )
    );
  };

  function insertReplyNested(replies, parentReplyId, newReply) {
    if (!replies) return [];
    return replies.map(reply =>
      reply.id === parentReplyId
        ? { ...reply, subReplies: [...(reply.subReplies || []), newReply] }
        : { ...reply, subReplies: insertReplyNested(reply.subReplies, parentReplyId, newReply) }
    );
  }
  function updateReplyContent(replies, replyId, content) {
    return replies
      ? replies.map(reply =>
          reply.id === replyId
            ? { ...reply, content }
            : {
                ...reply,
                subReplies: updateReplyContent(reply.subReplies, replyId, content),
              }
        )
      : [];
  }
  function removeReplyById(replies, replyId) {
    if (!replies) return [];
    return replies
      .filter(reply => reply.id !== replyId)
      .map(reply => ({
        ...reply,
        subReplies: removeReplyById(reply.subReplies, replyId),
      }));
  }

  const addComment = async (postId) => {
    const text = commentInputs[postId];
    if (!text?.trim() || !loggedUser?.id) return;
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: text,
        authorId: loggedUser.id,
        postId,
      }),
    });
    if (res.ok) {
      const newComment = await res.json();
      setPosts(posts =>
        posts.map(post =>
          post.id !== postId
            ? post
            : {
                ...post,
                comments: [...post.comments, newComment],
              }
        )
      );
      setCommentInputs({ ...commentInputs, [postId]: "" });
    }
  };

  const saveEditedPost = async (post) => {
    await fetch(`/api/posts/${post.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: editingPost.content }),
    });
    setEditingPost(null);
    fetch(`/api/posts?userId=${id}`)
      .then(res => res.json())
      .then(data => setPosts(data || []));
  };

  const saveEditedComment = async (postId, commentId, content) => {
    const res = await fetch(`/api/comments/${commentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (res.ok) {
      const updatedComment = await res.json();
      setPosts(posts =>
        posts.map(post =>
          post.id !== postId
            ? post
            : {
                ...post,
                comments: post.comments.map(comment =>
                  comment.id !== commentId ? comment : { ...comment, ...updatedComment }
                ),
              }
        )
      );
      setEditingComment(null);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    const res = await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
    if (res.ok) {
      setPosts(posts =>
        posts.map(post =>
          post.id !== postId
            ? post
            : {
                ...post,
                comments: post.comments.filter(comment => comment.id !== commentId),
              }
        )
      );
    }
  };

  const handleReply = async (postId, commentId, text, parentReplyId = null) => {
    if (!text?.trim() || !loggedUser?.id) return;
    const res = await fetch("/api/comments/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: text,
        authorId: loggedUser.id,
        postId,
        commentId,
        parentReplyId,
      }),
    });
    if (res.ok) {
      const newReply = await res.json();
      setPosts(posts =>
        posts.map(post =>
          post.id !== postId
            ? post
            : {
                ...post,
                comments: post.comments.map(comment =>
                  comment.id !== commentId
                    ? comment
                    : {
                        ...comment,
                        replies: parentReplyId
                          ? insertReplyNested(comment.replies, parentReplyId, newReply)
                          : [...(comment.replies || []), newReply],
                      }
                ),
              }
        )
      );
      setReplyInputs({ ...replyInputs, [parentReplyId || commentId]: "" });
    }
  };

  const saveEditedReply = async (postId, commentId, replyId, content) => {
    const res = await fetch(`/api/comments/reply/${replyId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (res.ok) {
      const updatedReply = await res.json();
      setPosts(posts =>
        posts.map(post =>
          post.id !== postId
            ? post
            : {
                ...post,
                comments: post.comments.map(comment =>
                  comment.id !== commentId
                    ? comment
                    : {
                        ...comment,
                        replies: updateReplyContent(comment.replies, replyId, updatedReply.content),
                      }
                ),
              }
        )
      );
      setEditingReply(null);
    }
  };

  const handleDeleteReply = async (postId, commentId, replyId) => {
    const res = await fetch(`/api/comments/reply/${replyId}`, { method: "DELETE" });
    if (res.ok) {
      setPosts(posts =>
        posts.map(post =>
          post.id !== postId
            ? post
            : {
                ...post,
                comments: post.comments.map(comment =>
                  comment.id !== commentId
                    ? comment
                    : {
                        ...comment,
                        replies: removeReplyById(comment.replies, replyId),
                      }
                ),
              }
        )
      );
    }
  };

  const onEditReply = (reply, commentId) => setEditingReply({ ...reply, commentId });

  const toggleReplyInput = (commentOrReplyId) => {
    setReplyInputs(prev => ({ ...prev, [commentOrReplyId]: prev[commentOrReplyId] ? "" : "" }));
  };

  const openDeleteModal = ({ type, postId, commentId = null, replyId = null }) => {
    setDeleteTarget({ type, postId, commentId, replyId });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteTarget.type === "post") {
      await handleDeletePostOrg(deleteTarget.postId);
    } else if (deleteTarget.type === "comment") {
      await handleDeleteComment(deleteTarget.postId, deleteTarget.commentId);
    } else if (deleteTarget.type === "reply") {
      await handleDeleteReply(deleteTarget.postId, deleteTarget.commentId, deleteTarget.replyId);
    }

    setIsDeleteModalOpen(false);
  };

  const handleShare = (postId) => {
    if (navigator.share) {
      navigator.share({
        title: 'Post',
        url: `${window.location.origin}/post/${postId}`,
      });
    } else {
      window.open(`${window.location.origin}/post/${postId}`, "_blank");
    }
  };

  // Excluir post (perfil da organização)
  const handleDeletePostOrg = async (postId) => {
    try {
      const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) {
        throw new Error(`Falha ao deletar post, status ${res.status}`);
      }

      // Atualiza lista de posts local
      setPosts((prev) => (Array.isArray(prev) ? prev.filter((p) => p.id !== postId) : prev));
    } catch (error) {
      console.error("Erro ao deletar post da organização:", error);
    }
  };

  if (loading)
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background text-foreground pl-64 flex items-center justify-center">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </>
    );
  if (!org)
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background text-foreground pl-64 flex items-center justify-center">
          <p className="text-muted-foreground">Organização não encontrada.</p>
        </div>
      </>
    );

  const displayName = localOrg?.name || localOrg?.orgName;
  const displayBio = localOrg?.bio || "Nenhuma descrição ainda.";
  const displayImage = localOrg?.logo || localOrg?.image || "/default-avatar.png";
  const displayEmail = localOrg?.email || "";

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Header user={org} />
      <main className="flex-1 flex flex-col items-center py-10 px-4 pl-64">
        {/* Card de perfil da organização com o mesmo front do card de jogador */}
        <Card className="w-full max-w-4xl bg-gradient-to-b from-zinc-900/95 via-zinc-900/90 to-zinc-950 shadow-[0_32px_96px_rgba(15,23,42,0.95)] border border-zinc-800/80 rounded-3xl mb-10 relative overflow-hidden">
          {/* Menu de opções */}
          {org.isCurrentUser && (
            <div className="absolute top-4 right-4 z-20">
              {!editMode && (
                <button
                  type="button"
                  aria-label="Mais opções"
                  onClick={handleMenuClick}
                  className="text-zinc-400 hover:text-white focus:outline-none text-2xl leading-none cursor-pointer"
                >
                  &#x22EE;
                </button>
              )}
              {showMenu && !editMode && (
                <div className="absolute right-0 mt-2 bg-zinc-800 border border-zinc-700 rounded shadow-md z-30">
                  <button
                    type="button"
                    className="block w-full text-left px-4 py-2 hover:bg-zinc-700 cursor-pointer text-sm text-zinc-200"
                    onClick={() => {
                      setEditMode(true);
                      setShowMenu(false);
                    }}
                  >
                    Editar Perfil
                  </button>
                </div>
              )}
              {editMode && (
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSave}>
                    Salvar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditMode(false);
                      setShowMenu(false);
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              )}
            </div>
          )}

          <CardContent className="flex flex-col md:flex-row gap-10 px-10 pt-14 pb-10 items-start">
            {/* Logo / avatar */}
            <div className="relative w-[168px] h-[168px] shrink-0">
              <div
                className="absolute -inset-[3px] rounded-full bg-gradient-to-br from-sky-400 via-indigo-400 to-fuchsia-500 opacity-80 blur-md"
                aria-hidden
              />
              <Image
                src={displayImage}
                fill
                sizes="168px"
                className="relative rounded-full border-4 border-zinc-900 object-cover bg-zinc-900"
                alt={`Logo da organização ${displayName}`}
                priority
              />
              {editMode && (
                <label className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-zinc-800 px-2 py-1 rounded text-xs cursor-pointer border border-zinc-600">
                  Trocar
                  <Input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoChange}
                  />
                </label>
              )}
            </div>

            {/* Informações da organização */}
            <div className="flex-1 space-y-5">
              {/* Nome */}
              {editMode ? (
                <Input
                  name="orgName"
                  value={localOrg.orgName || localOrg.name || ""}
                  onChange={handleChange}
                  className="text-3xl font-semibold mb-2"
                  maxLength={40}
                  placeholder="Nome da organização"
                />
              ) : (
                <p className="text-4xl md:text-[2.6rem] font-extrabold tracking-tight leading-tight">
                  {displayName}
                </p>
              )}

              {/* Email */}
              <div className="flex flex-wrap items-center gap-2 text-base">
                <span className="font-medium text-zinc-300">Email:</span>
                {editMode ? (
                  <Input
                    name="email"
                    value={localOrg.email || ""}
                    onChange={handleChange}
                    className="max-w-md bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5"
                    placeholder="email@organizacao.com"
                  />
                ) : (
                  <span className="text-sm text-muted-foreground">
                    {displayEmail || "Não informado"}
                  </span>
                )}
              </div>

              {/* Bio / descrição */}
              <div>
                <span className="font-medium block text-zinc-300">Descrição:</span>
                {editMode ? (
                  <Textarea
                    name="bio"
                    value={localOrg.bio || ""}
                    onChange={handleChange}
                    className="bg-zinc-800 border border-zinc-700 rounded mt-1"
                    maxLength={200}
                    rows={3}
                    placeholder="Fale um pouco sobre a organização..."
                  />
                ) : (
                  <p className="text-zinc-200">
                    {displayBio || (
                      <span className="italic text-zinc-500">
                        Nenhuma descrição ainda.
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {org.isCurrentUser && (
          <div className="w-full max-w-4xl flex gap-4 mb-8">
            <button
              type="button"
              className="flex-1 btn-gradient py-3.5 rounded-full text-base font-semibold shadow-lg"
              onClick={handleOpenVagaModal}
            >
              Abrir uma vaga
            </button>
            <button
              type="button"
              className="flex-1 btn-secondary-custom py-3.5 rounded-full text-base font-semibold"
              onClick={handleOpenPostModal}
            >
              Fazer um post
            </button>
          </div>
        )}

        <VagaModalForm
          open={showVagaModal}
          onClose={() => setShowVagaModal(false)}
          onSubmit={handleSubmitVaga}
        />

        <VagaModalForm
          open={showEditVagaModal}
          onClose={() => {
            setShowEditVagaModal(false);
            setEditVaga(null);
          }}
          onSubmit={handleUpdateVaga}
          initialValues={editVaga}
          editing
        />

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
              {postError && <div className="text-red-500 text-sm">{postError}</div>}
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
        <div className="w-full max-w-4xl mt-4">
          <h2 className="section-title mb-6">Vagas</h2>
          {vagas.length === 0 ? (
            <p className="text-center text-muted-foreground">
              Nenhuma vaga cadastrada.
            </p>
          ) : (
            <div className="space-y-4">
              {vagas.map((vaga) => {
                const titulo = vaga.titulo || vaga.title || "Vaga sem título";
                const descricaoCurta = vaga.descricao || vaga.description || "";
                const orgName = vaga.organization?.name || displayName || "Organização desconhecida";

                return (
                  <Card key={vaga.id} className="card-glow bg-card rounded-xl p-6 animate-fade-in hover-lift">
                    <CardContent className="space-y-4 p-0">
                      {/* Cabeçalho */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-muted border border-border shrink-0">
                            <Image
                              src={
                                vaga.organization?.logo ||
                                vaga.organization?.image ||
                                displayImage ||
                                "/default-avatar.png"
                              }
                              alt={orgName}
                              fill
                              sizes="64px"
                              className="object-cover"
                              priority
                            />
                          </div>
                          <div className="space-y-1">
                            <h3 className="font-semibold text-lg text-foreground">{titulo}</h3>
                            <p className="text-sm text-muted-foreground font-medium">{orgName}</p>
                          </div>
                        </div>
                        <span
                          className={cn(
                            "badge-status shrink-0",
                            vaga.status === "Aberta" ? "badge-open" : "badge-closed",
                          )}
                        >
                          {vaga.status === "Aberta" ? "Aberta" : "Fechada"}
                        </span>
                      </div>

                      {/* Infos rápidas */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-muted-foreground">
                        <p>
                          <span className="font-semibold text-foreground">Posições:</span>{" "}
                          {vaga.posicoes?.join(", ") ||
                            vaga.positions?.join(", ") ||
                            "Não informado"}
                        </p>
                        <p>
                          <span className="font-semibold text-foreground">Elo:</span>{" "}
                          {vaga.elos?.join(", ") || "Não informado"}
                        </p>
                        <p>
                          <span className="font-semibold text-foreground">Tipos:</span>{" "}
                          {vaga.tiposUsuario?.join(", ") ||
                            vaga.userTypes?.join(", ") ||
                            "Não informado"}
                        </p>
                      </div>

                      {/* Descrição curta */}
                      {!!descricaoCurta && (
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {descricaoCurta}
                        </p>
                      )}

                      {/* Rodapé: apenas Ver detalhes + info */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border">
                        <div className="flex items-center gap-3 flex-wrap">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setVagaSelecionada(vaga)}
                            className="px-4 py-2 rounded-lg"
                          >
                            Ver detalhes
                          </Button>
                        </div>

                        <div className="flex flex-col items-end text-xs text-muted-foreground">
                          <span>
                            Publicada em{" "}
                            {vaga.dataPublicacao
                              ? new Date(vaga.dataPublicacao).toLocaleDateString()
                              : vaga.created_at
                              ? new Date(vaga.created_at).toLocaleDateString()
                              : "?"}
                          </span>
                          <span>Candidatos: {vaga.applications?.length || 0}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal de detalhes de vaga */}
        {vagaSelecionada && (
          <VagaDetalhesModal
            vaga={vagaSelecionada}
            usuario={loggedUser}
            onClose={() => setVagaSelecionada(null)}
            onFechar={handleFecharVaga}
            onEditar={vaga => handleOpenEditVagaModal(vaga)}
            onDeletar={vagaId => confirmDeleteVaga(vagaId)} 
          />
        )}

        <div className="w-full max-w-4xl space-y-6 mt-10">
          <h2 className="section-title mb-4">Posts</h2>
          {posts.length === 0 && (
            <p className="text-center text-muted-foreground">
              Nenhum post encontrado para esta organização.
            </p>
          )}
            {posts.map((post) => {
              return (
                <Card key={post.id} className="card-glow bg-card rounded-3xl overflow-hidden animate-fade-in">
                  <CardContent className="px-6 py-6 md:px-8 md:py-7 space-y-4 relative">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <Link href={`/profile/${post.author?.id || ""}`} className="flex items-center gap-4 cursor-pointer group">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-muted shrink-0 ring-2 ring-primary/20">
                        <Image
                          src={post.author?.image || "/default-avatar.png"}
                          alt="Avatar"
                          fill
                          sizes="40px"
                          className="object-cover"
                          priority
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground group-hover:underline">
                          {post.author?.name || "Autor desconhecido"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {post.createdAt
                            ? format(new Date(post.createdAt), "d 'de' MMMM 'às' HH:mm", {
                                locale: ptBR,
                              })
                            : ""}
                        </p>
                      </div>
                    </Link>
                  </div>
                  {canEditOrDeletePost(post) && (
                    <div className="relative" ref={el => postMenuRef.current[post.id] = el}>
                      <button
                        type="button"
                        aria-label="Abrir menu de opções do post"
                        onClick={e => {
                          e.preventDefault();
                          e.stopPropagation();
                          setActiveOptions(activeOptions === post.id ? null : post.id);
                        }}
                        className="flex items-center"
                      >
                        <MoreHorizontal className="text-zinc-400 hover:text-white cursor-pointer" />
                      </button>
                      {activeOptions === post.id && (
                        <div className="absolute right-0 mt-2 w-32 bg-zinc-800 border border-zinc-700 rounded shadow-md z-10">
                          <button
                            type="button"
                            className="block w-full text-left px-4 py-2 hover:bg-zinc-700 cursor-pointer"
                            onClick={() => {
                              setEditingPost({ ...post });
                              setActiveOptions(null);
                            }}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="block w-full text-left px-4 py-2 hover:bg-zinc-700 cursor-pointer"
                            onClick={() => {
                              setDeleteTarget({ type: "post", postId: post.id });
                              setIsDeleteModalOpen(true);
                              setActiveOptions(null);
                            }}
                          >
                            Excluir
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {editingPost?.id === post.id ? (
                  <>
                    <Textarea
                      className="mb-2"
                      value={editingPost.content}
                      onChange={e => setEditingPost({ ...editingPost, content: e.target.value })}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => saveEditedPost(post)}>
                        Salvar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingPost(null)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="whitespace-pre-line text-zinc-50 leading-relaxed px-1 text-[0.98rem] md:text-base">
                    {post.content}
                  </p>
                )}

                {post.image && (
                  <Image
                    src={post.image}
                    alt="Imagem do post"
                    width={800}
                    height={400}
                    className="rounded-xl object-cover"
                  />
                )}
                <div className="flex gap-6 pt-2 border-t border-border mt-2 text-sm text-muted-foreground">
                  <button
                    type="button"
                    onClick={() => toggleLikePost(post.id)}
                    className="flex items-center gap-1 text-sm hover:text-foreground cursor-pointer">
                    <Heart
                      className={post.postLikes?.some(l => l.userId === loggedUser?.id) ? "text-pink-500" : ""}
                      size={18}
                    />
                    <span>{post.postLikes?.length || 0}</span>
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-1 text-sm hover:text-foreground cursor-pointer">
                    <MessageCircle size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleShare(post.id)}
                    className="flex items-center gap-1 text-sm hover:text-foreground cursor-pointer">
                    <Share2 size={18} />
                  </button>
                </div>
                <div className="mt-4 space-y-4">
                  {post.comments?.map((comment) => (
                    <div key={comment.id} className="bg-muted/50 p-4 rounded-lg">
                      <div className="flex justify-between">
                        <div className="flex gap-3 items-start">
                          <Link href={`/profile/${comment.author?.id || ""}`} className="flex items-center gap-2 cursor-pointer group">
                            <div className="relative w-[30px] h-[30px] rounded-full overflow-hidden bg-muted shrink-0 ring-2 ring-primary/20">
                              <Image
                                src={comment.author?.image || "/default-avatar.png"}
                                alt="Avatar"
                                fill
                                sizes="30px"
                                className="object-cover"
                                priority
                              />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground group-hover:underline">
                                {comment.author?.name || "Desconhecido"}
                              </p>
                              {editingComment?.id === comment.id ? (
                                <>
                                  <Textarea
                                    className="text-sm"
                                    value={editingComment.content}
                                    onChange={(e) => setEditingComment({ ...editingComment, content: e.target.value })}
                                  />
                                  <Button
                                    type="button"
                                    size="sm"
                                    className="mt-1"
                                    onClick={() => saveEditedComment(post.id, comment.id, editingComment.content)}>
                                    Salvar
                                  </Button>
                                </>
                              ) : (
                                <p className="text-sm text-muted-foreground">{comment.content}</p>
                              )}
                            </div>
                          </Link>
                        </div>
                        {canEditOrDeleteComment(comment) && (
                          <div className="relative" ref={el => commentMenuRef.current[comment.id] = el}>
                            <button
                              type="button"
                              tabIndex={0}
                              aria-label="Abrir menu de opções do comentário"
                              onClick={e => {
                                e.preventDefault();
                                e.stopPropagation();
                                setActiveCommentOptions(
                                  activeCommentOptions === comment.id ? null : comment.id
                                );
                              }}
                              className="flex items-center gap-1 text-sm hover:opacity-80 cursor-pointer">
                              <MoreHorizontal size={16} />
                            </button>
                            {activeCommentOptions === comment.id && (
                              <div
                                className="absolute right-0 mt-2 w-32 bg-zinc-700 border border-zinc-600 rounded shadow-md z-10"
                                onClick={e => e.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingComment(comment);
                                    setActiveCommentOptions(null);
                                  }}
                                  className="block w-full text-left px-4 py-2 hover:bg-zinc-600 cursor-pointer">
                                  Editar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    openDeleteModal({ type: "comment", postId: post.id, commentId: comment.id });
                                    setActiveCommentOptions(null);
                                  }}
                                  className="block w-full text-left px-4 py-2 hover:bg-zinc-600 cursor-pointer">
                                  Excluir
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                        <button
                          type="button"
                          onClick={() => toggleLikeComment(comment.id, post.id)}
                          className="flex items-center gap-1 text-sm hover:text-foreground cursor-pointer">
                          <Heart
                            className={comment.commentLikes?.some(l => l.userId === loggedUser?.id) ? "text-pink-500" : ""}
                            size={14}
                          />
                          <span>{comment.commentLikes?.length || 0}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleReplyInput(comment.id)}
                          className="flex items-center gap-1 text-sm hover:text-foreground cursor-pointer">
                          <MessageCircle size={14} />
                          <span>Responder</span>
                        </button>
                      </div>
                      {replyInputs[comment.id] !== undefined && (
                        <div className="mt-2 flex gap-2">
                          <Input
                            className="h-10"
                            value={replyInputs[comment.id]}
                            onChange={(e) =>
                              setReplyInputs({ ...replyInputs, [comment.id]: e.target.value })
                            }
                            placeholder="Responder..."
                          />
                          <Button
                            type="button"
                            className="h-10 py-0 px-4"
                            onClick={() => handleReply(post.id, comment.id, replyInputs[comment.id])}>
                            Enviar
                          </Button>
                        </div>
                      )}
                      {comment.replies?.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {comment.replies.map((reply) => (
                            <ReplyThread
                              key={reply.id}
                              reply={reply}
                              postId={post.id}
                              commentId={comment.id}
                              editingReply={editingReply}
                              setEditingReply={setEditingReply}
                              saveEditedReply={saveEditedReply}
                              openDeleteModal={openDeleteModal}
                              activeReplyMenu={activeReplyMenu}
                              setActiveReplyMenu={setActiveReplyMenu}
                              replyInputs={replyInputs}
                              setReplyInputs={setReplyInputs}
                              onReply={handleReply}
                              onEditReply={onEditReply}
                              loggedUser={loggedUser}
                              depth={1}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="flex gap-2 mt-2">
                    <Input
                      className="h-10"
                      value={commentInputs[post.id] || ""}
                      onChange={(e) =>
                        setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                      placeholder="Escreva um comentário..."
                    />
                    <Button
                      type="button"
                      className="h-10 py-0 px-4"
                      onClick={() => addComment(post.id)}>
                      Enviar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
              );
            })}
          <DeleteConfirmationModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleConfirmDelete}
            itemType={deleteTarget.type}
          />
          <DeleteConfirmationModal
            isOpen={isDeleteVagaModalOpen}
            onClose={() => setIsDeleteVagaModalOpen(false)}
            onConfirm={handleDeletarVagaConfirmed}
            itemType="vaga"
          />
        </div>
      </main>
    </div>
  );
}