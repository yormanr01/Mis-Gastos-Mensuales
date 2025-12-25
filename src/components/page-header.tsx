
type PageHeaderProps = {
  title: string;
  children?: React.ReactNode;
};

export function PageHeader({ title, children }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-[64px] items-center gap-4 border-b bg-background/80 backdrop-blur-md px-6">
      <div className="flex-1">
        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          {title}
        </h1>
      </div>
      {children}
    </header>
  );
}
