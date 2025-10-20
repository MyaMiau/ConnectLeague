"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import imageCompression from "browser-image-compression";

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
      setError("A imagem é muito grande, mesmo após compressão! O limite é 10MB.");
      setImageFile(null);
      setImageUrl("");
      return;
    }

    setImageFile(imageToUpload);

    const formData = new FormData();
    formData.append("image", imageToUpload);

    try {
      const resp = await fetch("/api/posts/upload", {
        method: "POST",
        body: formData,
      });
      if (resp.ok) {
        const data = await resp.json();
        setImageUrl(data.imageUrl); 
      } else {
        if (resp.status === 413) {
          const data = await resp.json();
          setError(data.error || "A imagem é muito grande! O limite é 10MB.");
        } else {
          setError("Erro ao enviar imagem. Tente novamente.");
        }
        setImageUrl("");
      }
    } catch (err) {
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
    <Card className="w-full max-w-2xl bg-zinc-900 mb-8 rounded-2xl">
      <CardContent className="p-6 space-y-4">
        <Textarea
          placeholder="Compartilhe algo profissional..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <Input type="file" accept="image/*" onChange={handleImageUpload} />
        {error && (
          <div className="text-red-500 text-sm mt-2">{error}</div>
        )}
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Prévia da imagem"
            className="max-w-xs max-h-48 rounded-lg mt-2"
          />
        )}
        <Button onClick={handlePost} disabled={loading || !text.trim()}>
          {loading ? "Publicando..." : "Publicar"}
        </Button>
      </CardContent>
    </Card>
  );
}