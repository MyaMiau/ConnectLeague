"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useState } from "react";
import imageCompression from "browser-image-compression";
import { supabase } from "@/lib/supabaseClient";

export default function CreatePost({ onPost, user }) {
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function getAuthorId(user) {
    console.log("user recebido em CreatePost:", user);
    return (
      user?.id ||
      user?.orgId ||
      user?.organization_id ||
      user?.organizationId ||
      user?.user_id ||
      null
    );
  }

  async function uploadPostImageToSupabase(file) {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `posts/${fileName}`;

    const { data, error } = await supabase.storage
      .from("cl-posts")
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
          hypothesisId: "H1",
          location: "components/CreatePost.jsx:uploadPostImageToSupabase",
          message: "Resultado upload imagem post Supabase",
          data: { filePath, hasError: !!error },
          timestamp: Date.now(),
        }),
      }
    ).catch(() => {});
    // #endregion

    if (error) {
      console.error("Erro upload Supabase:", error);
      return "";
    }

    const { data: publicUrlData } = supabase.storage
      .from("cl-posts")
      .getPublicUrl(filePath);

    return publicUrlData?.publicUrl || "";
  }

  const handleImageUpload = async (e) => {
    setError("");
    const file = e.target.files[0];
    if (!file) return;

    let imageToUpload = file;
    if (file.size > 2 * 1024 * 1024) {
      try {
        imageToUpload = await imageCompression(file, {
          maxSizeMB: 2,
          maxWidthOrHeight: 1920,
          initialQuality: 0.8,
          useWebWorker: true,
        });
      } catch (err) {
        setError("Erro ao comprimir a imagem. Tente usar uma imagem menor.");
        setImageFile(null);
        setImageUrl("");
        return;
      }
    }

    if (imageToUpload.size > 10 * 1024 * 1024) {
      setError(
        "A imagem é muito grande, mesmo após compressão! O limite é 10MB."
      );
      setImageFile(null);
      setImageUrl("");
      return;
    }

    setImageFile(imageToUpload);

    try {
      const supabaseUrl = await uploadPostImageToSupabase(imageToUpload);
      if (!supabaseUrl) {
        setError("Erro ao enviar imagem. Tente novamente.");
        setImageUrl("");
        return;
      }
      setImageUrl(supabaseUrl);
    } catch (err) {
      console.error("Erro ao enviar imagem para Supabase:", err);
      setError("Erro ao enviar imagem. Tente novamente.");
      setImageUrl("");
    }
  };

  const handlePost = async () => {
    // Log do usuário para depuração
    console.log("User para criar post:", user);

    const authorId = getAuthorId(user);
    // Log do ID extraído
    console.log("AuthorId extraído:", authorId);

    if (!text.trim() || !authorId) {
      setError("Preencha o texto e esteja logado corretamente.");
      return;
    }

    setLoading(true);

    const payload = {
      content: text,
      image: imageUrl,
      authorId,
    };

    // Log do payload para depuração
    console.log("Payload enviado para /api/posts:", payload);

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setText("");
      setImageFile(null);
      setImageUrl("");
      setError("");
      onPost && onPost();
    } else {
      const data = await res.json();
      setError(data.error || "Erro ao criar post.");
    }
    setLoading(false);
  };

  return (
    <Card className="w-full max-w-4xl card-glow bg-card rounded-3xl mb-8 animate-fade-in">
      <CardContent className="px-6 py-6 md:px-8 md:py-7 space-y-4">
        {/* Caixa de texto principal */}
        <Textarea
          placeholder="Compartilhe algo profissional..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full bg-transparent border-none resize-none text-foreground text-base md:text-[1.05rem] placeholder:text-muted-foreground focus:outline-none focus-visible:ring-0 focus-visible:border-none min-h-[80px]"
        />

        {/* Linha inferior: upload + publicar */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border gap-3 flex-wrap">
          <label className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors cursor-pointer text-sm">
            <Upload className="w-4 h-4" />
            <span>Escolher arquivo</span>
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>

          <Button
            onClick={handlePost}
            disabled={loading || !text.trim()}
            className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500 hover:from-sky-400 hover:via-indigo-400 hover:to-fuchsia-400 text-sm font-semibold shadow-[0_12px_35px_rgba(79,70,229,0.6)] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Publicando..." : "Publicar"}
          </Button>
        </div>
        {error && (
          <div className="text-red-500 text-sm mt-2">{error}</div>
        )}
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Prévia da imagem"
            className="max-w-xs max-h-48 rounded-xl mt-3 border border-border object-cover"
          />
        )}
      </CardContent>
    </Card>
  );
}