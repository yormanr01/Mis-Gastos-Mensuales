import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  icon: LucideIcon;
  children?: React.ReactNode;
  className?: string;
};

export function PageHeader({ title, icon: Icon, children, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-6 px-4 md:px-6", className)}>
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
      </div>
      {children}
    </div>
  );
}
