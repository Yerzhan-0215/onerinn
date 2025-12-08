// src/components/layout/SectionHeader.tsx
type Props = {
  title: string;
  subtitle?: string;
};

export default function SectionHeader({ title, subtitle }: Props) {
  return (
    <header className="mb-6">
      <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
        {title}
      </h1>
      {subtitle && (
        <p className="text-sm md:text-base text-slate-600">
          {subtitle}
        </p>
      )}
    </header>
  );
}
