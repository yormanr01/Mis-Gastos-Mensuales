
type PageHeaderProps = {
  title: string;
  children?: React.ReactNode;
};

export function PageHeader({ title, children }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-[57px] items-center gap-4 border-b bg-background px-4">
      <div className="flex-1">
        <h1 className="text-xl font-semibold">{title}</h1>
      </div>
      {children}
    </header>
  );
}
