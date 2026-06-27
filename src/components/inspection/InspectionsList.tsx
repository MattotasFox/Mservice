import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, FileText, Download, LogOut, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [search, setSearch] = useState("");

  const normalize = (value: string) =>
    (value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  const filteredItems = items.filter((it) => {
    const term = normalize(search);
    if (!term) return true;
    const patente = normalize(it.vehiculo?.patente || "");
    const nombre = normalize(it.cliente?.nombre || "");
    return patente.includes(term) || nombre.includes(term);
  });

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
        <div className="flex flex-col sm:flex-row gap-3 justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por patente o nombre de cliente..."
              className="pl-9 pr-9"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Limpiar búsqueda"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button onClick={onNew} size="lg" className="gap-2 shadow-[var(--shadow-elegant)] shrink-0">
            <Plus className="h-4 w-4" />
            Nueva inspección
          </Button>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <p className="text-muted-foreground animate-pulse">Cargando inspecciones...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
            <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              {search
                ? "No se encontraron inspecciones que coincidan con tu búsqueda."
                : "No hay inspecciones guardadas. Crea una nueva para comenzar."}
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredItems.map((it) => (
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