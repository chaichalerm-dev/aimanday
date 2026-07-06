export function Footer({ className }: { className?: string }) {
  return (
    <footer className={`border-t border-gray-200 dark:border-zinc-700 py-4 text-center ${className ?? ''}`.trim()}>
      <p className="text-xs text-gray-400 dark:text-slate-600">
        Powered by Groq Whisper &amp; GPT OSS 120B · Stored in MongoDB
      </p>
    </footer>
  );
}
