
/**
 * Procesa una imagen (File) redimensionándola y comprimiéndola.
 * Usa estrategias modernas (createImageBitmap) con fallback a FileReader.
 * @param file El archivo de imagen original.
 * @param maxWidth Ancho máximo permitido (ej: 1200).
 * @param quality Calidad de compresión (0 a 1).
 * @param format Formato de salida ('image/jpeg' o 'image/png').
 */
export const processImage = async (
    file: File, 
    maxWidth: number = 1200, 
    quality: number = 0.8, 
    format: 'image/jpeg' | 'image/png' = 'image/jpeg'
  ): Promise<string> => {
    
    // 1. Validar tipo MIME básico
    if (!file.type.startsWith('image/')) {
        throw new Error("El archivo seleccionado no es una imagen válida.");
    }

    // Detección de HEIC/HEIF para dar un error útil (navegadores web suelen no soportarlo nativamente en Canvas)
    if (file.type === 'image/heic' || file.type === 'image/heif' || file.name.toLowerCase().endsWith('.heic')) {
        throw new Error("El formato HEIC (iPhone) no es soportado directamente por el navegador. Por favor, sube una foto en JPG o PNG.");
    }

    try {
        // ESTRATEGIA 1: Modern Bitmap API (Más rápido, maneja mejor EXIF y memoria)
        if ('createImageBitmap' in window) {
             const bitmap = await createImageBitmap(file);
             return drawToCanvas(bitmap, maxWidth, quality, format);
        }
        throw new Error("createImageBitmap no disponible");
    } catch (err) {
        console.warn("Estrategia Bitmap falló o no soportada, intentando FileReader...", err);
        // ESTRATEGIA 2: Fallback clásico FileReader
        return processImageLegacy(file, maxWidth, quality, format);
    }
};

const drawToCanvas = (
    source: ImageBitmap | HTMLImageElement, 
    maxWidth: number, 
    quality: number, 
    format: string
): string => {
    const canvas = document.createElement('canvas');
    let width = source.width;
    let height = source.height;

    // Calcular nuevas dimensiones manteniendo aspecto
    if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
    }

    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("No se pudo generar el contexto gráfico.");

    // Fondo blanco para JPEGs (evitar fondo negro en transparencias)
    if (format === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
    }

    ctx.drawImage(source, 0, 0, width, height);
    
    // Cleanup si es bitmap
    if (source instanceof ImageBitmap) {
        source.close();
    }

    return canvas.toDataURL(format, quality);
};

const processImageLegacy = (
    file: File, 
    maxWidth: number, 
    quality: number, 
    format: string
): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                try {
                    const result = drawToCanvas(img, maxWidth, quality, format);
                    resolve(result);
                } catch (drawErr) {
                    reject(drawErr);
                }
            };
            img.onerror = () => reject(new Error("La imagen parece estar corrupta o es un formato no soportado por este navegador. Intenta con JPG o PNG."));
            if (e.target?.result) {
                img.src = e.target.result as string;
            } else {
                reject(new Error("Error de lectura de datos."));
            }
        };
        reader.onerror = () => reject(new Error("No se pudo leer el archivo del dispositivo."));
        reader.readAsDataURL(file);
    });
};
