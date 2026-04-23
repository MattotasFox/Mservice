import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface SectionCardProps {
  title: string;
  icon: LucideIcon;
  description?: string;
  children: ReactNode;
}

export const SectionCard = ({ title, icon: Icon, description, children }: SectionCardProps) => {
  return (
    <Card className="border-border/60 shadow-[var(--shadow-card)] overflow-hidden">
      <CardHeader className="bg-secondary/50 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-[var(--shadow-elegant)]">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-foreground">{title}</CardTitle>
            {description && (
              <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">{children}</CardContent>
    </Card>
  );
};
