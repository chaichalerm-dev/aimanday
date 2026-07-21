export function Footer({ className }: { className?: string }) {
  return (
    <footer className={`border-t border-[var(--line)] ${className ?? ''}`.trim()}>
      <div className="mx-auto max-w-6xl px-4 py-5 text-xs text-[var(--muted)] sm:px-6">
        <p>Manday Estimator</p>
      </div>
    </footer>
  );
}
