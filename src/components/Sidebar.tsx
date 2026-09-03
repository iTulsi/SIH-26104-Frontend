interface SidebarProps {
  isDemo: boolean;
}

export function Sidebar({ isDemo }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">V</span>
        <div>
          <strong>Voice Integrity</strong>
          <span>SIH 26104</span>
        </div>
      </div>

      <nav aria-label="Primary navigation">
        <a className="nav-item nav-item--active" href="#analysis">
          <span aria-hidden="true">◉</span>
          Analysis
        </a>
      </nav>

      <div className="sidebar-spacer" />

      <div className="system-card">
        <div className="system-status">
          <span className="status-dot" aria-hidden="true" />
          <strong>{isDemo ? 'Prototype ready' : 'Analysis API connected'}</strong>
        </div>
        <p>{isDemo ? 'Mock contract enabled' : 'Live integration enabled'}</p>
      </div>
    </aside>
  );
}
