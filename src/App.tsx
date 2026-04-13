function App() {
  return (
    <div className="min-h-dvh flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-surface-elevated">
        <h1 className="font-display text-2xl font-bold tracking-tight">
          <span className="text-white">Free</span>
          <span className="text-gold-gradient">log</span>
        </h1>
      </header>

      {/* Main content — blank branded shell */}
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-labels text-sm uppercase tracking-widest">
            Your hours. Your proof. Your freedom.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 text-center text-labels text-xs border-t border-surface-elevated">
        Developed by{' '}
        <a
          href="https://dbf-nexus.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gold-solid hover:text-gold-highlight transition-colors"
        >
          DBF Nexus
        </a>
        {' '}— dbf-nexus.com
      </footer>
    </div>
  )
}

export default App
