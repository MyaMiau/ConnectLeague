//CreatePost.jsx

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function CreatePost({ onPost, user }) {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handlePost = () => {
    if (!text.trim()) return;

    const post = {
      id: Date.now(),
      content: text,
      image,
      date: new Date(),
      likes: 0,
      liked: false,
      comments: [],
      user: {
        name: user?.name || "Usuário Exemplo",
        image: user?.image || "/default-avatar.png",
      },
    };

    onPost(post);
    setText("");
    setImage(null);
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
        <Button onClick={handlePost}>Publicar</Button>
      </CardContent>
  </Card>
);
}