import { useEffect, useState } from "react";
import { Plus, Gauge, Pencil, Trash2, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  loadInspections,
  deleteInspection,
  type StoredInspection,
} from "@/lib/inspectionsStore";

interface Props {
  onNew: () => void;
  onOpen: (id: string) => void;
  onDownload: (id: string) => void;
}

export const InspectionsList = ({ onNew, onOpen, onDownload }: Props) => {
  const [items, setItems] = useState<StoredInspection[]>([]);

  useEffect(() => {
    setItems(loadInspections());
  }, []);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("¿Eliminar esta inspección?")) return;
    deleteInspection(id);
    setItems(loadInspections());
  };

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-[image:var(--gradient-hero)] text-primary-foreground">
        <div className="container max-w-5xl py-10">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-foreground/10 backdrop-blur">
              <Gauge className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Inspecciones</h1>
              <p className="text-primary-foreground/80 mt-1">
                Selecciona una inspección guardada o crea una nueva
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-5xl py-10">
        <div className="flex justify-end mb-6">
          <Button onClick={onNew} size="lg" className="gap-2 shadow-[var(--shadow-elegant)]">
            <Plus className="h-4 w-4" />
            Nueva inspección
          </Button>
        </div>

        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
            <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              No hay inspecciones guardadas. Crea una nueva para comenzar.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {items.map((it) => (
              <button
                key={it.id}
                onClick={() => onOpen(it.id)}
                className="group flex items-center justify-between rounded-xl border border-border bg-card p-5 text-left transition-colors hover:border-primary hover:bg-accent/30"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-foreground">
                      {it.patente || "Sin patente"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Actualizado: {formatDate(it.updatedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline-flex items-center gap-1 text-sm text-muted-foreground group-hover:text-primary">
                    <Pencil className="h-4 w-4" />
                    Editar
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, it.id)}
                    className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    aria-label="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
