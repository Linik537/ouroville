import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { brl } from "@/lib/site";
import { supabase, type Carro, type Lead } from "@/lib/supabase";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Painel administrativo : Ouroville Motors" },
      { name: "description", content: "Área restrita de gestão de estoque e leads da Ouroville Motors." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Painel administrativo : Ouroville Motors" },
      { property: "og:description", content: "Área restrita." },
    ],
  }),
  component: Admin,
});

const inputCls =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary";

function Admin() {
  const [userId, setUserId] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
      setCarregando(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (carregando) return <div className="p-16 text-center text-sm text-muted-foreground">Carregando...</div>;
  if (!userId) return <Login />;
  return <Painel />;
}

function Login() {
  const [loading, setLoading] = useState(false);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(fd.get("email")),
      password: String(fd.get("senha")),
    });
    setLoading(false);
    if (error) toast.error("E-mail ou senha inválidos.");
  }
  return (
    <div className="mx-auto max-w-sm px-4 py-24">
      <h1 className="text-2xl font-bold text-foreground">Painel administrativo</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-xl border border-border/70 bg-card p-6">
        <label className="block text-xs text-muted-foreground">E-mail<input name="email" type="email" required className={inputCls} /></label>
        <label className="block text-xs text-muted-foreground">Senha<input name="senha" type="password" required className={inputCls} /></label>
        <button disabled={loading} className="w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60">
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}

const vazio = {
  marca: "", modelo: "", versao: "", ano: "", ano_modelo: "", preco: "", quilometragem: "",
  combustivel: "Flex", cambio: "Automático", cor: "", descricao: "", destaque: "",
};

function Painel() {
  const qc = useQueryClient();
  const [aba, setAba] = useState<"estoque" | "leads">("estoque");
  const [form, setForm] = useState({ ...vazio });
  const [editId, setEditId] = useState<number | null>(null);
  const [arquivos, setArquivos] = useState<FileList | null>(null);
  const [salvando, setSalvando] = useState(false);

  const carros = useQuery({
    queryKey: ["admin", "carros"],
    queryFn: async () => {
      const { data, error } = await supabase.from("carros").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Carro[];
    },
  });

  const leads = useQuery({
    queryKey: ["admin", "leads"],
    queryFn: async () => {
      const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Lead[];
    },
  });

  async function uploadFotos(): Promise<string[]> {
    if (!arquivos?.length) return [];
    const urls: string[] = [];
    for (const file of Array.from(arquivos)) {
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name.replace(/\s+/g, "-")}`;
      const { error } = await supabase.storage.from("carros").upload(path, file);
      if (error) throw error;
      urls.push(supabase.storage.from("carros").getPublicUrl(path).data.publicUrl);
    }
    return urls;
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    try {
      const novas = await uploadFotos();
      const payload = {
        marca: form.marca,
        modelo: form.modelo,
        versao: form.versao || null,
        ano: Number(form.ano),
        ano_modelo: form.ano_modelo ? Number(form.ano_modelo) : null,
        preco: form.preco ? Number(form.preco) : null,
        quilometragem: form.quilometragem ? Number(form.quilometragem) : null,
        combustivel: form.combustivel,
        cambio: form.cambio,
        cor: form.cor || null,
        descricao: form.descricao || null,
        destaque: form.destaque || null,
      };
      if (editId) {
        const atual = carros.data?.find((c) => c.id === editId);
        const fotos = [...(atual?.fotos ?? []), ...novas];
        const { error } = await supabase.from("carros").update({ ...payload, fotos }).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("carros").insert({ ...payload, fotos: novas, status: "disponivel" });
        if (error) throw error;
      }
      toast.success("Carro salvo!");
      setForm({ ...vazio });
      setEditId(null);
      setArquivos(null);
      qc.invalidateQueries({ queryKey: ["admin", "carros"] });
      qc.invalidateQueries({ queryKey: ["carros"] });
    } catch {
      toast.error("Erro ao salvar. Verifique se seu usuário é administrador.");
    } finally {
      setSalvando(false);
    }
  }

  async function alternarStatus(c: Carro) {
    const status = c.status === "vendido" ? "disponivel" : "vendido";
    const { error } = await supabase.from("carros").update({ status }).eq("id", c.id);
    if (error) {
      toast.error("Não foi possível atualizar.");
      return;
    }
    qc.invalidateQueries({ queryKey: ["admin", "carros"] });
    qc.invalidateQueries({ queryKey: ["carros"] });
  }

  async function remover(c: Carro) {
    if (!confirm(`Remover ${c.marca} ${c.modelo}?`)) return;
    const { error } = await supabase.from("carros").delete().eq("id", c.id);
    if (error) {
      toast.error("Não foi possível remover.");
      return;
    }
    qc.invalidateQueries({ queryKey: ["admin", "carros"] });
    qc.invalidateQueries({ queryKey: ["carros"] });
  }

  function editar(c: Carro) {
    setEditId(c.id);
    setForm({
      marca: c.marca, modelo: c.modelo, versao: c.versao ?? "", ano: String(c.ano),
      ano_modelo: c.ano_modelo ? String(c.ano_modelo) : "", preco: c.preco ? String(c.preco) : "",
      quilometragem: c.quilometragem ? String(c.quilometragem) : "", combustivel: c.combustivel ?? "Flex",
      cambio: c.cambio ?? "Automático", cor: c.cor ?? "", descricao: c.descricao ?? "", destaque: c.destaque ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const campo = (name: keyof typeof vazio, label: string, type = "text") => (
    <label className="block text-xs text-muted-foreground">
      {label}
      <input
        type={type}
        value={form[name]}
        onChange={(e) => setForm((f) => ({ ...f, [name]: e.target.value }))}
        className={inputCls}
      />
    </label>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Painel administrativo</h1>
        <button onClick={() => supabase.auth.signOut()} className="rounded-md border border-border px-3 py-2 text-xs text-muted-foreground hover:text-primary">
          Sair
        </button>
      </div>

      <div className="mt-6 flex gap-2">
        {(["estoque", "leads"] as const).map((a) => (
          <button key={a} onClick={() => setAba(a)}
            className={`rounded-full px-4 py-2 text-sm font-medium ${aba === a ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground"}`}>
            {a === "estoque" ? "Estoque" : "Leads"}
          </button>
        ))}
      </div>

      {aba === "estoque" ? (
        <>
          <form onSubmit={salvar} className="mt-6 rounded-xl border border-border/70 bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">{editId ? "Editar carro" : "Novo carro"}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {campo("marca", "Marca")}
              {campo("modelo", "Modelo")}
              {campo("versao", "Versão")}
              {campo("ano", "Ano", "number")}
              {campo("ano_modelo", "Ano modelo", "number")}
              {campo("preco", "Preço (R$)", "number")}
              {campo("quilometragem", "Quilometragem", "number")}
              {campo("cor", "Cor")}
              {campo("destaque", "Selo (ex: Único dono)")}
              <label className="block text-xs text-muted-foreground">
                Combustível
                <select value={form.combustivel} onChange={(e) => setForm((f) => ({ ...f, combustivel: e.target.value }))} className={inputCls}>
                  {["Flex", "Gasolina", "Diesel", "Elétrico", "Híbrido"].map((o) => <option key={o}>{o}</option>)}
                </select>
              </label>
              <label className="block text-xs text-muted-foreground">
                Câmbio
                <select value={form.cambio} onChange={(e) => setForm((f) => ({ ...f, cambio: e.target.value }))} className={inputCls}>
                  {["Automático", "Manual"].map((o) => <option key={o}>{o}</option>)}
                </select>
              </label>
              <label className="block text-xs text-muted-foreground">
                Fotos
                <input type="file" multiple accept="image/*" onChange={(e) => setArquivos(e.target.files)} className={inputCls} />
              </label>
            </div>
            <label className="mt-4 block text-xs text-muted-foreground">
              Descrição
              <textarea rows={3} value={form.descricao} onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))} className={inputCls} />
            </label>
            <div className="mt-4 flex gap-3">
              <button disabled={salvando} className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">
                {salvando ? "Salvando..." : editId ? "Salvar alterações" : "Adicionar carro"}
              </button>
              {editId && (
                <button type="button" onClick={() => { setEditId(null); setForm({ ...vazio }); }} className="rounded-full border border-border px-6 py-2.5 text-sm text-muted-foreground">
                  Cancelar
                </button>
              )}
            </div>
          </form>

          <div className="mt-8 space-y-3">
            {(carros.data ?? []).map((c) => (
              <div key={c.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-border/70 bg-card p-4">
                <span className="font-medium text-foreground">{c.marca} {c.modelo} {c.ano}</span>
                <span className="text-sm text-muted-foreground">{brl(c.preco)}</span>
                <span className={`rounded-full px-3 py-1 text-xs ${c.status === "vendido" ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground"}`}>
                  {c.status === "vendido" ? "Vendido" : "Disponível"}
                </span>
                <div className="ml-auto flex gap-2 text-xs">
                  <button onClick={() => editar(c)} className="rounded-md border border-border px-3 py-1.5 text-muted-foreground hover:text-primary">Editar</button>
                  <button onClick={() => alternarStatus(c)} className="rounded-md border border-border px-3 py-1.5 text-muted-foreground hover:text-primary">
                    {c.status === "vendido" ? "Reativar" : "Marcar vendido"}
                  </button>
                  <button onClick={() => remover(c)} className="rounded-md border border-destructive/60 px-3 py-1.5 text-destructive">Remover</button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="mt-6 space-y-3">
          {(leads.data ?? []).map((l) => (
            <div key={l.id} className="rounded-lg border border-border/70 bg-card p-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-medium text-foreground">{l.nome}</span>
                <span className="text-sm text-muted-foreground">{l.telefone}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {new Date(l.created_at).toLocaleString("pt-BR")}
                </span>
              </div>
              {l.mensagem && <p className="mt-2 text-sm text-muted-foreground">{l.mensagem}</p>}
            </div>
          ))}
          {(leads.data ?? []).length === 0 && <p className="text-sm text-muted-foreground">Nenhum lead ainda.</p>}
        </div>
      )}
    </div>
  );
}
