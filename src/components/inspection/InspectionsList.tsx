import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, FileText, Download, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  loadInspections,
  deleteInspection,
} from "@/lib/inspectionsStore";
import { Inspection } from "@/lib/types";
import logoMService from "@/assets/LOGO_SIN_FONDO.png";

interface Props {
  onNew: () => void;
  onOpen: (id: string) => void;
  onDownload: (id: string) => void;
  onLogout: () => void;
}

export const InspectionsList = ({ onNew, onOpen, onDownload, onLogout }: Props) => {
  const [items, setItems] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInspections = async () => {
    setLoading(true);
    const data = await loadInspections();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchInspections();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("¿Eliminar esta inspección?")) return;
    await deleteInspection(id);
    fetchInspections();
  };

  const formatDate = (val: any) => {
    if (!val) return "Sin fecha";
    const date = val.toDate ? val.toDate() : new Date(val);
    return date.toLocaleString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-[image:var(--gradient-hero)] text-primary-foreground">
        <div className="container max-w-5xl py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center rounded-xl bg-primary-foreground/10 backdrop-blur overflow-hidden"
                style={{ width: "72px", height: "72px" }}>
                <img
                  src={logoMService}
                  alt="M Service"
                  style={{ width: "60px", height: "60px", objectFit: "contain" }}
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Inspecciones</h1>
                <p className="text-primary-foreground/80 mt-1">
                  Selecciona una inspección guardada o crea una nueva
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={onLogout}
              className="gap-2 text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
              title="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Salir</span>
            </Button>
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

        {loading ? (
          <div className="py-20 text-center">
            <p className="text-muted-foreground animate-pulse">Cargando inspecciones...</p>
          </div>
        ) : items.length === 0 ? (
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
                onClick={() => onOpen(it.id!)}
                className="group flex items-center justify-between rounded-xl border border-border bg-card p-5 text-left transition-colors hover:border-primary hover:bg-accent/30"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-foreground">
                      {it.vehiculo.patente || "Sin patente"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Cliente: {it.cliente.nombre || "Sin nombre"} | Actualizado: {formatDate(it.creadoEn)}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      onDownload(it.id!);
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                    aria-label="Descargar"
                    title="Descargar PDF"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, it.id!)}
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