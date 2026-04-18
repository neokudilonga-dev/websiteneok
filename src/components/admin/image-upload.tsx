"use client";

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { normalizeImageUrl } from '@/lib/utils';
import { storage, auth } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import imageCompression from 'browser-image-compression';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  label?: string;
  value?: string | string[];
  onChange: (val: string | string[]) => void;
  multiple?: boolean;
  max?: number;
  folder?: string; // optional R2 folder prefix
}

export function ImageUpload({ label = 'Imagem', value, onChange, multiple = false, max, folder }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const images: string[] = Array.isArray(value) ? value : (value ? [value] : []);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const isIOS = /iPad|iPhone|iPod/.test(ua);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    if (max && multiple && images.length + files.length > max) {
      toast({
        title: 'Limite excedido',
        description: `Só pode carregar até ${max} imagens.`,
        variant: 'destructive',
      });
      return;
    }

    // Check if user is authenticated with Firebase client-side
    if (!auth.currentUser) {
      console.warn("Upload attempted while Firebase auth is not ready. Waiting...");
      // Optional: you could wait or show a toast
      toast({
        title: 'Autenticação em curso',
        description: 'Aguarde um momento enquanto validamos a sua sessão...',
      });
      // Try to wait a bit for Firebase to restore session
      let attempts = 0;
      while (!auth.currentUser && attempts < 10) {
        await new Promise(r => setTimeout(r, 500));
        attempts++;
      }
      if (!auth.currentUser) {
        toast({
          title: 'Erro de Autenticação',
          description: 'Não foi possível verificar a sua sessão. Por favor, faça login novamente.',
          variant: 'destructive',
        });
        return;
      }
    }

    setIsUploading(true);
    setProgress(0);
    try {
      const uploadedRaw: (string | null)[] = [];
      const filesArray = Array.from(files);
      
      for (const file of filesArray) {
        try {
          const compressed = await compressFile(file);
          const url = await uploadToFirebase(compressed, folder, (p) => {
            // If multiple files, show an average progress or just the current file progress
            setProgress(p);
          });
          if (url) uploadedRaw.push(url);
        } catch (err) {
          console.error(`Error uploading file ${file.name}:`, err);
          toast({
            title: 'Erro no ficheiro: ' + file.name,
            description: (err as any)?.message || 'Falha ao carregar este ficheiro.',
            variant: 'destructive',
          });
        }
      }

      const uploaded: string[] = uploadedRaw.filter((u): u is string => !!u && typeof u === 'string' && u.length > 0);
      if (multiple) {
        const nextArr = [...images, ...uploaded];
        onChange(nextArr);
      } else if (uploaded.length > 0) {
        onChange(uploaded[0]);
      }
      
      if (uploaded.length === 0 && filesArray.length > 0) {
        toast({
          title: 'Falha no upload',
          description: 'Não foi possível carregar nenhuma imagem. Tente novamente.',
          variant: 'destructive',
        });
      }
    } catch (e) {
      console.error(e);
      toast({
        title: 'Erro de upload',
        description: (e as any)?.message || 'Ocorreu um erro ao carregar a imagem.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  const onPaste = async (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const items = e.clipboardData?.items;
    if (!items || items.length === 0) {
      console.log('Paste event triggered but no items in clipboardData');
      return;
    }

    const files: File[] = [];
    for (const it of items as any) {
      if (it.kind === 'file') {
        const f = it.getAsFile();
        if (f) files.push(f);
      }
    }

    if (files.length > 0) {
      console.log(`Pasted ${files.length} file(s)`);
      const dt = new DataTransfer();
      for (const f of files) {
        dt.items.add(f);
      }
      await handleFiles(dt.files);
    } else {
      toast({
        title: 'Nenhuma imagem encontrada',
        description: 'Certifique-se de que está a copiar uma imagem e não um link ou texto.',
        variant: 'destructive',
      });
    }
  };
  const readClipboard = async () => {
    try {
      // First try the modern Clipboard API
      const navClip: any = (navigator as any).clipboard;
      if (navClip && typeof navClip.read === 'function') {
        const items = await navClip.read();
        const files: File[] = [];
        for (const item of items) {
          for (const type of item.types) {
            if (type.startsWith('image/')) {
              const blob = await item.getType(type);
              const file = new File([blob], `clipboard_${Date.now()}.png`, { type });
              files.push(file);
            }
          }
        }
        if (files.length > 0) {
          const dt = new DataTransfer();
          for (const f of files) dt.items.add(f);
          await handleFiles(dt.files);
          return;
        }
      }

      // If modern API fails or returns no files, show instructions
      toast({
        title: 'Como colar uma imagem',
        description: 'Clique na área de upload para a focar, depois pressione Ctrl+V (ou Cmd+V no Mac) para colar a imagem.',
      });
    } catch (err) {
      console.error('Clipboard read error:', err);
      toast({
        title: 'Não foi possível aceder à área de transferência',
        description: 'Tente usar Ctrl+V directamente na área de upload após clicar nela.',
        variant: 'destructive',
      });
    }
  };
  const onDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dt = e.dataTransfer;
    if (dt && dt.files && dt.files.length > 0) {
      await handleFiles(dt.files);
    }
  };
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const removeImage = (idx: number) => {
    if (multiple) {
      const next = images.filter((_, i) => i !== idx);
      onChange(next);
    } else {
      onChange('');
    }
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={(e) => {
          handleFiles(e.target.files);
          // Reset value to allow selecting the same file again
          e.target.value = '';
        }}
        className="hidden"
      />
      <div
        className="rounded-md border bg-muted/30 p-4 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50"
        onPaste={onPaste}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onClick={(e) => {
          // Only trigger if clicking the div itself or non-button children
          if (e.target === e.currentTarget || !(e.target as HTMLElement).closest('button')) {
            fileInputRef.current?.click();
          }
        }}
        tabIndex={0}
        role="button"
        aria-label="Área de upload de imagem. Clique para focar e depois use Ctrl+V para colar."
      >
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex-1">
            <div className="text-muted-foreground">
              Arraste e solte a imagem aqui, ou clique para selecionar
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              type="button" 
              variant="outline" 
              disabled={isUploading}
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              {isUploading ? (progress > 0 ? `A carregar... ${progress}%` : 'A carregar...') : 'Selecionar'}
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              onClick={(e) => {
                e.stopPropagation();
                readClipboard();
              }}
            >
              Colar
            </Button>
          </div>
        </div>
        {isUploading && (
          <div className="mt-3 h-1 w-full rounded bg-muted overflow-hidden">
            <div className="h-1 bg-primary transition-[width] duration-300" style={{ width: `${progress}%` }} />
          </div>
        )}
        {isIOS && (
          <div
            contentEditable
            suppressContentEditableWarning
            className="mt-3 min-h-[36px] rounded-md border bg-background px-2 py-2 text-xs text-muted-foreground"
            onPaste={onPaste}
          >
            Toque aqui e cole a imagem (iOS)
          </div>
        )}
      </div>
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((img, idx) => {
            const src = normalizeImageUrl(img);
            return (
              <div key={idx} className="relative h-28 w-full overflow-hidden rounded-md border">
                <Image src={src} alt={`Imagem ${idx + 1}`} fill className="object-cover" />
                <div className="absolute right-2 top-2 flex gap-2">
                  <Button type="button" size="sm" variant="destructive" onClick={() => removeImage(idx)}>
                    Remover
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

async function uploadToFirebase(file: File, folder?: string, onProgress?: (p: number) => void): Promise<string | null> {
  const base = folder ? folder.replace(/\/+$/,'') : 'uploads';
  const key = `${base}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const imageRef = ref(storage, key);
  return await new Promise<string | null>((resolve, reject) => {
    const task = uploadBytesResumable(imageRef, file, { contentType: file.type || 'application/octet-stream' });
    task.on('state_changed', (snap) => {
      const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
      console.log(`Upload progress: ${pct}%`, snap.state);
      if (onProgress) onProgress(pct);
    }, (err: any) => {
      console.error("Firebase Upload Error Details:", {
        code: err.code,
        message: err.message,
        name: err.name,
        serverResponse: err.serverResponse
      });
      
      let friendlyMessage = "Erro ao carregar imagem.";
      if (err.code === 'storage/unauthorized') {
        friendlyMessage = "Sem permissão para carregar imagens. Verifique se está ligado.";
      } else if (err.code === 'storage/canceled') {
        friendlyMessage = "Upload cancelado.";
      } else if (err.message?.includes('net::ERR_FAILED')) {
        friendlyMessage = "Erro de rede ou CORS. Verifique a configuração do bucket.";
      }
      
      reject(new Error(friendlyMessage));
    }, async () => {
      console.log("Upload complete, getting download URL...");
      let attempts = 0;
      let url: string | null = null;
      while (attempts < 5 && !url) {
        try {
          url = await getDownloadURL(task.snapshot.ref);
          console.log("Download URL obtained:", url);
        } catch (e) {
          console.warn(`Attempt ${attempts + 1} to get URL failed:`, e);
          await new Promise(r => setTimeout(r, 1000 * (attempts + 1)));
          attempts += 1;
        }
      }
      if (!url) {
        console.error("Failed to get download URL after 5 attempts");
        reject(new Error("Não foi possível obter o link da imagem após o carregamento."));
      } else {
        resolve(url);
      }
    });
  });
}

async function compressFile(file: File): Promise<File> {
  try {
    if (!file.type.startsWith('image/')) return file;
    const isSmall = file.size < 300 * 1024;
    if (isSmall) return file;
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua);
    const options = {
      maxSizeMB: 0.6,
      maxWidthOrHeight: 1600,
      useWebWorker: !(isIOS && isSafari),
      initialQuality: 0.8,
    };
    const compressedBlob = await imageCompression(file, options);
    const compressedFile = new File([compressedBlob], file.name, { type: compressedBlob.type || file.type });
    return compressedFile;
  } catch {
    return file;
  }
}
