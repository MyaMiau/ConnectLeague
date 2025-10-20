import { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";

const USER_TYPES = [
  "player",
  "coach",
  "manager",
  "designer",
  "psychologist",
  "analyst",
];
const POSITIONS = [
  "Top", "Jungle", "Mid", "ADC", "Support"
];
const ELOS = [
  "Bronze+", "Prata+", "Ouro+", "Platina+", "Esmeralda+", "Diamante+", "Mestre+", "Grão-Mestre", "Desafiante"
];
const TAGS = [
  "Remoto", "Presencial", "Competitivo", "Amador", "Nenhum"
];

export default function VagaModalForm({
  open,
  onClose,
  onSubmit,
  loading,
  initialValues = null,
  editing = false
}) {
  const [form, setForm] = useState({
    titulo: "",
    descricao: "",
    requisitos: "",
    beneficios: "",
    userTypes: [],
    positions: [],
    elos: [],
    city: "",
    state: "",
    tags: [],
    id: undefined,
  });

  useEffect(() => {
    if (editing && initialValues) {
      setForm({
        titulo: initialValues.titulo || initialValues.title || "",
        descricao: initialValues.descricao || initialValues.description || "",
        requisitos: initialValues.requisitos || initialValues.requirements || "",
        beneficios: initialValues.beneficios || initialValues.benefits || "",
        userTypes: initialValues.userTypes || [],
        positions: initialValues.positions || [],
        elos: initialValues.elos || [],
        city: initialValues.city || "",
        state: initialValues.state || "",
        tags: initialValues.tags || [],
        id: initialValues.id
      });
    } else if (!editing) {
      setForm({
        titulo: "",
        descricao: "",
        requisitos: "",
        beneficios: "",
        userTypes: [],
        positions: [],
        elos: [],
        city: "",
        state: "",
        tags: [],
        id: undefined,
      });
    }
  }, [editing, initialValues, open]);

  if (!open) return null;

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  function handleArrayChange(name, value) {
    setForm(f => ({
      ...f,
      [name]: f[name].includes(value)
        ? f[name].filter(v => v !== value)
        : [...f[name], value]
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const data = {
      id: form.id,
      title: form.titulo,
      description: form.descricao,
      requirements: form.requisitos,
      benefits: form.beneficios,
      userTypes: form.userTypes,
      positions: form.positions,
      elos: form.elos,
      city: form.city,
      state: form.state,
      tags: form.tags,
    };
    onSubmit(data);
  }

  const selectableBtn = (selected) =>
    selected
      ? "bg-purple-800 text-white border-2 border-purple-400 rounded px-3 py-1 font-medium transition-colors"
      : "bg-indigo-600 text-white border border-transparent rounded px-3 py-1 font-medium transition-colors";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <form
        className="
          bg-zinc-900 p-4 sm:p-8 rounded-2xl shadow-lg
          w-full max-w-[440px] flex flex-col gap-3
          overflow-y-auto
          max-h-[80vh]
        "
        onSubmit={handleSubmit}
      >
        <h2 className="text-xl font-bold mb-2">{editing ? "Editar vaga" : "Abrir vaga"}</h2>
        <Input
          name="titulo"
          placeholder="Título da vaga"
          value={form.titulo}
          onChange={handleChange}
          required
          className="w-full"
        />
        <Textarea
          name="descricao"
          placeholder="Descrição da vaga"
          value={form.descricao}
          onChange={handleChange}
          required
          className="w-full min-h-[48px] resize-y"
        />
        <Textarea
          name="requisitos"
          placeholder="Requisitos"
          value={form.requisitos}
          onChange={handleChange}
          className="w-full min-h-[48px] resize-y"
        />
        <Textarea
          name="beneficios"
          placeholder="Benefícios"
          value={form.beneficios}
          onChange={handleChange}
          className="w-full min-h-[48px] resize-y"
        />
        <Input
          name="city"
          placeholder="Cidade"
          value={form.city}
          onChange={handleChange}
          className="w-full"
        />
        <Input
          name="state"
          placeholder="Estado"
          value={form.state}
          onChange={handleChange}
          className="w-full"
        />
        <div>
          <label className="font-semibold text-zinc-300 block mb-1">Tipos de usuário (você pode escolher mais de um)</label>
          <div className="flex flex-wrap gap-2 justify-start">
            {USER_TYPES.map(type => (
              <Button
                key={type}
                type="button"
                onClick={() => handleArrayChange("userTypes", type)}
                className={selectableBtn(form.userTypes.includes(type))}
              >
                {type}
              </Button>
            ))}
          </div>
        </div>
        <div>
          <label className="font-semibold text-zinc-300 block mb-1">Posições</label>
          <div className="flex flex-wrap gap-2 justify-start">
            {POSITIONS.map(pos => (
              <Button
                key={pos}
                type="button"
                onClick={() => handleArrayChange("positions", pos)}
                className={selectableBtn(form.positions.includes(pos))}
              >
                {pos}
              </Button>
            ))}
          </div>
        </div>
        <div>
          <label className="font-semibold text-zinc-300 block mb-1">Elos</label>
          <div className="flex flex-wrap gap-2 justify-start">
            {ELOS.map(elo => (
              <Button
                key={elo}
                type="button"
                onClick={() => handleArrayChange("elos", elo)}
                className={selectableBtn(form.elos.includes(elo))}
              >
                {elo}
              </Button>
            ))}
          </div>
        </div>
        <div>
          <label className="font-semibold text-zinc-300 block mb-1">Tags</label>
          <div className="flex flex-wrap gap-2 justify-start">
            {TAGS.map(tag => (
              <Button
                key={tag}
                type="button"
                onClick={() => handleArrayChange("tags", tag)}
                className={selectableBtn(form.tags.includes(tag))}
              >
                {tag}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex gap-2 mt-2">
          <Button type="submit" disabled={loading} color="green">Criar</Button>
          <Button type="button" color="red" onClick={onClose}>Cancelar</Button>
        </div>
      </form>
    </div>
  );
}