import { useRef, type ChangeEvent } from "react";
import { Upload, X } from "lucide-react";
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

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // NOTE: In a real production app, you would upload to Firebase Storage here
    // and then use the resulting URL. For now, we'll use a temporary local URL.
    onChange({
      ...value,
      imagenUrl: URL.createObjectURL(file),
    });
    if (fileRef.current) fileRef.current.value = "";
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
            <SelectContent>
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
            className="w-full gap-2 px-2"
          >
            <Upload className="h-4 w-4 shrink-0" />
            <span className="truncate">
              {value.imagenUrl ? "Cambiar" : "Subir imagen"}
            </span>
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
