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

export function calcularAreaCrop(
  imageWidth: number,
  imageHeight: number,
  settings: CropSettings,
  targetRatio = settings.width / settings.height,
) {
  const outputRatio = settings.width / settings.height;
  const baseWidth = Math.min(imageWidth, imageHeight * outputRatio);
  const cropWidth = baseWidth / settings.zoom;
  const cropHeight = cropWidth / outputRatio;
  const maxX = Math.max(0, imageWidth - cropWidth);
  const maxY = Math.max(0, imageHeight - cropHeight);
  const x = maxX * ((settings.offsetX + 100) / 200);
  const y = maxY * ((settings.offsetY + 100) / 200);

  if (targetRatio <= outputRatio) {
    const targetWidth = cropHeight * targetRatio;
    return { x: x + (cropWidth - targetWidth) / 2, y, width: targetWidth, height: cropHeight };
  }

  const targetHeight = cropWidth / targetRatio;
  return { x, y: y + (cropHeight - targetHeight) / 2, width: cropWidth, height: targetHeight };
}

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
  const area = calcularAreaCrop(image.naturalWidth, image.naturalHeight, settings);
  const canvas = document.createElement("canvas");
  canvas.width = settings.width;
  canvas.height = settings.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Seu navegador não suporta edição de imagens.");
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(
    image,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    settings.width,
    settings.height,
  );
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", 0.86),
  );
  if (!blob) throw new Error("Não foi possível preparar esta imagem.");
  return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.webp`, { type: "image/webp" });
}
