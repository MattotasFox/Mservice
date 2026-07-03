import { useRef, useState, type ChangeEvent } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { storage, auth } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

export type CheckEntry = {
  estado: "" | "ok" | "observacion";
  observacion: string;
  imagenUrl: string | null;
};

export const emptyCheckEntry: CheckEntry = {
  estado: "",
  observacion: "",
  imagenUrl: null,
};

interface Props {
  id: string;
  label: string;
  value: CheckEntry;
  onChange: (next: CheckEntry) => void;
}

export const CheckFieldWithImage = ({ id, label, value, onChange }: Props) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Ruta única en Storage: inspecciones/{uid}/{timestamp}_{filename}
      const uid = auth.currentUser?.uid ?? "anonimo";
      const timestamp = Date.now();
      const storageRef = ref(
        storage,
        `inspecciones/${uid}/${timestamp}_${file.name}`
      );

      const uploadTask = uploadBytesResumable(storageRef, file);

      await new Promise<void>((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            setUploadProgress(progress);
          },
          (error) => reject(error),
          () => resolve()
        );
      });

      // Obtener URL pública permanente
      const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);

      onChange({
        ...value,
        imagenUrl: downloadUrl,
      });
    } catch (error) {
      console.error("Error al subir imagen:", error);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const removeImage = () => onChange({ ...value, imagenUrl: null });

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </Label>
      <div className="flex gap-2">
        <div className="flex-1 min-w-0">
          <Select
            value={value.estado}
            onValueChange={(v) =>
              onChange({ ...value, estado: v as CheckEntry["estado"] })
            }
          >
            <SelectTrigger id={id}>
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent position="popper" side="bottom">
              <SelectItem value="ok">OK</SelectItem>
              <SelectItem value="observacion">Observación</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 min-w-0">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full gap-2 px-2"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                <span className="truncate">{uploadProgress}%</span>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 shrink-0" />
                <span className="truncate">
                  {value.imagenUrl ? "Cambiar" : "Subir imagen"}
                </span>
              </>
            )}
          </Button>
        </div>
      </div>
      {value.imagenUrl && (
        <div className="relative inline-block">
          <img
            src={value.imagenUrl}
            alt="Imagen de inspección"
            className="h-20 w-20 rounded-md border border-border object-cover"
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
            aria-label="Eliminar imagen"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
      <Textarea
        value={value.observacion}
        onChange={(e) => onChange({ ...value, observacion: e.target.value })}
        placeholder="Observación"
        rows={2}
        className="text-sm"
      />
    </div>
  );
};