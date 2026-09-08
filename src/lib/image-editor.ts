export type CropSettings = {
  zoom: number;
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
};

export const DEFAULT_CROP: CropSettings = {
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
  width: 1200,
  height: 900,
};

function carregarImagem(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Não foi possível ler esta imagem."));
    };
    image.src = url;
  });
}

export async function prepararImagem(file: File, settings: CropSettings) {
  const image = await carregarImagem(file);
  const proporcao = settings.width / settings.height;
  const areaBase = Math.min(image.naturalWidth, image.naturalHeight * proporcao);
  const sourceWidth = areaBase / settings.zoom;
  const sourceHeight = sourceWidth / proporcao;
  const maxX = Math.max(0, image.naturalWidth - sourceWidth);
  const maxY = Math.max(0, image.naturalHeight - sourceHeight);
  const sourceX = maxX / 2 + (settings.offsetX / 100) * (maxX / 2);
  const sourceY = maxY / 2 + (settings.offsetY / 100) * (maxY / 2);
  const canvas = document.createElement("canvas");
  canvas.width = settings.width;
  canvas.height = settings.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Seu navegador não suporta edição de imagens.");
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, settings.width, settings.height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.86));
  if (!blob) throw new Error("Não foi possível preparar esta imagem.");
  return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.webp`, { type: "image/webp" });
}