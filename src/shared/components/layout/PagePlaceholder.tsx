type PagePlaceholderProps = {
  description: string;
  title: string;
};

export function PagePlaceholder({ description, title }: PagePlaceholderProps) {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-normal">{title}</h2>
        <p className="text-muted mt-2 text-sm">{description}</p>
      </div>

      <div className="bg-surface rounded-lg border p-6 shadow-sm">
        <p className="text-muted text-sm font-medium">Coming soon</p>
        <p className="text-foreground mt-2 text-base">
          This page is ready for the {title.toLowerCase()} management UI.
        </p>
      </div>
    </section>
  );
}
