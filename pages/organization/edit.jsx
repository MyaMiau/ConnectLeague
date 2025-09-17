import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "../../components/ui/button";
import Image from "next/image";

export default function EditOrganization() {
  const router = useRouter();
  const { id } = router.query;
  const [org, setOrg] = useState({ logo: "", name: "", bio: "", email: "" });

  useEffect(() => {
    if (!id) return;
    fetch(`/api/organization/${id}`)
      .then(res => res.json())
      .then(data => setOrg(data.organization || org));
  }, [id]);

  const handleChange = e => setOrg({ ...org, [e.target.name]: e.target.value });

  const handleLogoChange = e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setOrg(prev => ({ ...prev, logo: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    await fetch(`/api/organization/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(org)
    });
    router.push(`/organization/${id}`);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center py-10 px-4">
      <form onSubmit={handleSubmit} className="bg-zinc-900 p-8 rounded-xl w-full max-w-lg flex flex-col gap-4">
        <h1 className="text-2xl font-bold mb-4">Editar perfil da organização</h1>
        <div className="flex flex-col items-center mb-4">
          <Image
            src={org.logo || "/default-org.png"}
            width={120}
            height={120}
            className="rounded-full border-4 border-zinc-700"
            alt="Logo da organização"
          />
          <input type="file" accept="image/*" className="mt-2" onChange={handleLogoChange}/>
        </div>
        <input name="name" value={org.name} onChange={handleChange} placeholder="Nome" className="p-2 rounded bg-zinc-800 text-white"/>
        <input name="bio" value={org.bio} onChange={handleChange} placeholder="Bio/Descrição" className="p-2 rounded bg-zinc-800 text-white"/>
        <input name="email" value={org.email} onChange={handleChange} placeholder="Email" className="p-2 rounded bg-zinc-800 text-white"/>
        <Button type="submit">Salvar Alterações</Button>
      </form>
    </div>
  );
}