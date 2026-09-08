import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { brl } from "@/lib/site";
import { supabase, type Carro, type Lead } from "@/lib/supabase";
import { analisarFontePlanilha, type ImportacaoCarro } from "@/lib/spreadsheet";
import { DEFAULT_CROP, prepararImagem, type CropSettings } from "@/lib/image-editor";

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
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [arquivoInputKey, setArquivoInputKey] = useState(0);
  const [editorIndex, setEditorIndex] = useState(0);
  const [crop, setCrop] = useState<CropSettings>({ ...DEFAULT_CROP });
  const [editorPreviewUrl, setEditorPreviewUrl] = useState("");
  const [fotoEditando, setFotoEditando] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [planilha, setPlanilha] = useState<File | null>(null);
  const [urlPlanilha, setUrlPlanilha] = useState("");
  const [importando, setImportando] = useState(false);
  const [resultadoImportacao, setResultadoImportacao] = useState<{ total: number; erros: string[] } | null>(null);

  useEffect(() => {
    if (!arquivos[editorIndex]) {
      setEditorPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(arquivos[editorIndex]);
    setEditorPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [arquivos, editorIndex]);

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
    if (!arquivos.length) return [];
    const urls: string[] = [];
    for (const file of arquivos) {
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name.replace(/[^a-zA-Z0-9._-]+/g, "-")}`;
      const { error } = await supabase.storage.from("carros").upload(path, file);
      if (error) throw error;
      urls.push(supabase.storage.from("carros").getPublicUrl(path).data.publicUrl);
    }
    return urls;
  }

  async function processarFotosSelecionadas() {
    if (!arquivos.length) return;
    setSalvando(true);
    try {
      const processadas = await Promise.all(arquivos.map((file) => prepararImagem(file, crop)));
      setArquivos(processadas);
      toast.success("Fotos preparadas em WebP e prontas para salvar.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível preparar as fotos.");
    } finally {
      setSalvando(false);
    }
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
        const fotos = fotoEditando
          ? (atual?.fotos ?? []).map((foto) => (foto === fotoEditando ? novas[0] ?? foto : foto))
          : [...(atual?.fotos ?? []), ...novas];
        const { error } = await supabase.from("carros").update({ ...payload, fotos }).eq("id", editId);
        if (error) throw error;
        if (fotoEditando && novas[0]) await removerArquivoStorage(fotoEditando);
      } else {
        const { error } = await supabase.from("carros").insert({ ...payload, fotos: novas, status: "disponivel" });
        if (error) throw error;
      }
      toast.success("Carro salvo!");
      setForm({ ...vazio });
      setEditId(null);
      setArquivos([]);
      setArquivoInputKey((key) => key + 1);
      setEditorIndex(0);
      setCrop({ ...DEFAULT_CROP });
      setFotoEditando(null);
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

  async function removerFoto(c: Carro, foto: string) {
    const fotos = (c.fotos ?? []).filter((item) => item !== foto);
    const { error } = await supabase.from("carros").update({ fotos }).eq("id", c.id);
    if (error) {
      toast.error("Não foi possível remover a imagem.");
      return;
    }
    await removerArquivoStorage(foto);
    toast.success("Imagem removida.");
    qc.invalidateQueries({ queryKey: ["admin", "carros"] });
    qc.invalidateQueries({ queryKey: ["carros"] });
  }

  async function removerArquivoStorage(foto: string) {
    const marker = "/storage/v1/object/public/carros/";
    const path = foto.includes(marker) ? decodeURIComponent(foto.split(marker)[1]) : null;
    if (path) await supabase.storage.from("carros").remove([path]);
  }

  async function editarFoto(foto: string) {
    try {
      const resposta = await fetch(foto);
      if (!resposta.ok) throw new Error("Não foi possível abrir esta imagem.");
      const blob = await resposta.blob();
      const nome = foto.split("/").pop()?.split("?")[0] ?? "foto-do-carro.jpg";
      setArquivos([new File([blob], nome, { type: blob.type || "image/jpeg" })]);
      setFotoEditando(foto);
      setEditorIndex(0);
      setCrop({ ...DEFAULT_CROP });
      toast.success("Imagem carregada no editor.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível abrir esta imagem.");
    }
  }

  async function definirCapa(c: Carro, foto: string) {
    const fotos = [foto, ...(c.fotos ?? []).filter((item) => item !== foto)];
    const { error } = await supabase.from("carros").update({ fotos }).eq("id", c.id);
    if (error) {
      toast.error("Não foi possível definir a capa.");
      return;
    }
    toast.success("Foto definida como capa do card.");
    qc.invalidateQueries({ queryKey: ["admin", "carros"] });
    qc.invalidateQueries({ queryKey: ["carros"] });
  }

  async function importarPlanilha() {
    setImportando(true);
    setResultadoImportacao(null);
    try {
      const resultado = await analisarFontePlanilha(planilha ?? undefined, urlPlanilha);
      if (!resultado.carros.length) {
        setResultadoImportacao({ total: 0, erros: resultado.erros.length ? resultado.erros : ["Nenhum carro válido foi encontrado."] });
        return;
      }
      const registros = resultado.carros.map((carro: ImportacaoCarro) => ({
        ...carro,
        versao: carro.versao ?? null,
        ano_modelo: carro.ano_modelo ?? null,
        preco: carro.preco ?? null,
        quilometragem: carro.quilometragem ?? null,
        combustivel: carro.combustivel ?? null,
        cambio: carro.cambio ?? null,
        cor: carro.cor ?? null,
        descricao: carro.descricao ?? null,
        destaque: carro.destaque ?? null,
        fotos: [],
        status: "disponivel",
      }));
      const { error } = await supabase.from("carros").insert(registros);
      if (error) throw error;
      setResultadoImportacao({ total: registros.length, erros: resultado.erros });
      setPlanilha(null);
      setUrlPlanilha("");
      qc.invalidateQueries({ queryKey: ["admin", "carros"] });
      qc.invalidateQueries({ queryKey: ["carros"] });
      toast.success(`${registros.length} carro(s) importado(s). Agora adicione as imagens pela edição.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível importar a planilha.");
    } finally {
      setImportando(false);
    }
  }

  function editar(c: Carro) {
    setEditId(c.id);
    setForm({
      marca: c.marca, modelo: c.modelo, versao: c.versao ?? "", ano: String(c.ano),
      ano_modelo: c.ano_modelo ? String(c.ano_modelo) : "", preco: c.preco ? String(c.preco) : "",
      quilometragem: c.quilometragem ? String(c.quilometragem) : "", combustivel: c.combustivel ?? "Flex",
      cambio: c.cambio ?? "Automático", cor: c.cor ?? "", descricao: c.descricao ?? "", destaque: c.destaque ?? "",
    });
    setArquivos([]);
    setArquivoInputKey((key) => key + 1);
    setEditorIndex(0);
    setCrop({ ...DEFAULT_CROP });
    setFotoEditando(null);
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
          <section className="mt-6 rounded-xl border border-primary/40 bg-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Importar estoque</h2>
                <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                  Envie Excel/CSV ou use um Google Sheets público. O cabeçalho pode começar em qualquer linha e as linhas vazias serão ignoradas.
                </p>
              </div>
              <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">Marca, Modelo e Ano obrigatórios</span>
            </div>
            <form
              className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end"
              onSubmit={(e) => { e.preventDefault(); void importarPlanilha(); }}
            >
              <label className="block text-xs text-muted-foreground">
                Arquivo Excel ou CSV
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
                  onChange={(e) => setPlanilha(e.target.files?.[0] ?? null)}
                  className={inputCls}
                />
              </label>
              <label className="block text-xs text-muted-foreground">
                Link público do Google Sheets
                <input value={urlPlanilha} onChange={(e) => setUrlPlanilha(e.target.value)} placeholder="https://docs.google.com/spreadsheets/d/..." className={inputCls} />
              </label>
              <button disabled={importando || (!planilha && !urlPlanilha.trim())} className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">
                {importando ? "Importando..." : "Importar dados"}
              </button>
            </form>
            {resultadoImportacao && (
              <div className="mt-4 rounded-md border border-border bg-background p-3 text-sm">
                <p className="text-foreground">{resultadoImportacao.total} carro(s) importado(s).</p>
                {resultadoImportacao.erros.length > 0 && (
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-destructive">
                    {resultadoImportacao.erros.slice(0, 8).map((erro) => <li key={erro}>{erro}</li>)}
                  </ul>
                )}
              </div>
            )}
          </section>

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
                Adicionar fotos
                <input key={arquivoInputKey} type="file" multiple accept="image/*" onChange={(e) => { setArquivos(Array.from(e.target.files ?? [])); setFotoEditando(null); }} className={inputCls} />
              </label>
            </div>
            {arquivos.length > 0 && (
              <div className="mt-5 rounded-lg border border-primary/30 bg-background p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">Editor de capa e fotos</p>
                    <p className="text-xs text-muted-foreground">{fotoEditando ? "Ajuste a imagem existente e salve para substituí-la." : "O padrão começa em 4:3, mas você pode escolher qualquer tamanho. O mesmo ajuste será aplicado às fotos escolhidas."}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{arquivos.length} foto(s) selecionada(s)</span>
                </div>
                <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
                  <div className="overflow-hidden rounded-lg bg-black">
                    <div
                      className="mx-auto max-h-[420px] w-full max-w-2xl bg-cover bg-center bg-no-repeat"
                      style={{
                        backgroundImage: `url(${editorPreviewUrl})`,
                        backgroundPosition: `${50 + crop.offsetX / 2}% ${50 + crop.offsetY / 2}%`,
                        backgroundSize: `${crop.zoom * 100}%`,
                        aspectRatio: `${crop.width} / ${crop.height}`,
                      }}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-xs text-muted-foreground">Zoom: {crop.zoom.toFixed(1)}x<input type="range" min="1" max="3" step="0.1" value={crop.zoom} onChange={(e) => setCrop((value) => ({ ...value, zoom: Number(e.target.value) }))} className="w-full accent-primary" /></label>
                    <label className="block text-xs text-muted-foreground">Horizontal: {crop.offsetX}<input type="range" min="-100" max="100" value={crop.offsetX} onChange={(e) => setCrop((value) => ({ ...value, offsetX: Number(e.target.value) }))} className="w-full accent-primary" /></label>
                    <label className="block text-xs text-muted-foreground">Vertical: {crop.offsetY}<input type="range" min="-100" max="100" value={crop.offsetY} onChange={(e) => setCrop((value) => ({ ...value, offsetY: Number(e.target.value) }))} className="w-full accent-primary" /></label>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="text-xs text-muted-foreground">Largura<input type="number" min="400" max="1600" step="100" value={crop.width} onChange={(e) => setCrop((value) => ({ ...value, width: Math.min(1600, Math.max(400, Number(e.target.value) || 1200)), height: Math.round((Math.min(1600, Math.max(400, Number(e.target.value) || 1200)) * 3) / 4) }))} className={inputCls} /></label>
                      <label className="text-xs text-muted-foreground">Altura<input type="number" min="300" max="1600" step="100" value={crop.height} onChange={(e) => setCrop((value) => ({ ...value, height: Math.min(1600, Math.max(300, Number(e.target.value) || 900)) }))} className={inputCls} /></label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {arquivos.map((arquivo, index) => <button type="button" key={`${arquivo.name}-${index}`} onClick={() => setEditorIndex(index)} className={`rounded-md border px-2 py-1 text-xs ${index === editorIndex ? "border-primary text-primary" : "border-border text-muted-foreground"}`}>{index + 1}. {arquivo.name.slice(0, 14)}</button>)}
                    </div>
                    <button type="button" onClick={() => void processarFotosSelecionadas()} disabled={salvando} className="w-full rounded-full border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10 disabled:opacity-60">{salvando ? "Preparando..." : "Aplicar crop e otimizar"}</button>
                  </div>
                </div>
              </div>
            )}
            {editId && (
              <div className="mt-4">
                <p className="text-xs text-muted-foreground">Fotos atuais</p>
                <div className="mt-2 flex flex-wrap gap-3">
                  {(carros.data?.find((carro) => carro.id === editId)?.fotos ?? []).map((foto) => (
                    <div key={foto} className="relative h-24 w-32 overflow-hidden rounded-md border border-border">
                      <img src={foto} alt="" className="h-full w-full object-cover" />
                      <div className="absolute inset-x-1 bottom-1 flex gap-1">
                        <button type="button" onClick={() => void editarFoto(foto)} className="flex-1 rounded bg-background px-1 py-1 text-[10px] font-semibold text-foreground">Editar</button>
                        <button type="button" onClick={() => { const carro = carros.data?.find((item) => item.id === editId); if (carro) void definirCapa(carro, foto); }} className="flex-1 rounded bg-primary px-1 py-1 text-[10px] font-semibold text-primary-foreground">Capa</button>
                        <button type="button" onClick={() => { const carro = carros.data?.find((item) => item.id === editId); if (carro) void removerFoto(carro, foto); }} className="rounded bg-destructive px-1 py-1 text-[10px] text-destructive-foreground">Excluir</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <label className="mt-4 block text-xs text-muted-foreground">
              Descrição
              <textarea rows={3} value={form.descricao} onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))} className={inputCls} />
            </label>
            <div className="mt-4 flex gap-3">
              <button disabled={salvando} className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">
                {salvando ? "Salvando..." : editId ? "Salvar alterações" : "Adicionar carro"}
              </button>
              {editId && (
                <button type="button" onClick={() => { setEditId(null); setForm({ ...vazio }); setArquivos([]); setFotoEditando(null); setArquivoInputKey((key) => key + 1); }} className="rounded-full border border-border px-6 py-2.5 text-sm text-muted-foreground">
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
