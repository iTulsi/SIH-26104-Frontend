import { motion } from 'motion/react';

interface SiteHeaderProps {
  isDemo: boolean;
}

const navItems = [
  ['Why it matters', '#problem'],
  ['How it works', '#approach'],
  ['Demo', '#demo'],
  ['Evidence', '#evidence'],
] as const;

export function SiteHeader({ isDemo }: SiteHeaderProps) {
  return (
    <motion.header
      className="site-header"
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.a className="site-brand" href="#top" aria-label="Voice Integrity home" whileHover={{ y: -2 }}>
        <span className="site-brand-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false"><path d="M4 12h2m2-5v10m4-13v16m4-12v8m4-5v2" /></svg>
        </span>
        <span className="site-brand-copy"><strong>Voice Integrity</strong><small>SIH 26104</small></span>
      </motion.a>

      <nav className="desktop-nav" aria-label="Primary navigation">
        {navItems.map(([label, href], index) => (
          <motion.a
            key={href}
            href={href}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 + index * 0.06 }}
            whileHover={{ y: -2 }}
          >
            {label}
          </motion.a>
        ))}
      </nav>

      <div className="header-actions">
        <span className={`header-status${isDemo ? ' header-status--demo' : ''}`}>
          <i aria-hidden="true" />
          {isDemo ? 'Prototype' : 'Inference online'}
        </span>
        <motion.a className="header-cta" href="#demo" whileHover={{ y: -3, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          Run a scan <span aria-hidden="true">↗</span>
        </motion.a>
      </div>

      <details className="mobile-nav">
        <summary aria-label="Open navigation"><span /><span /></summary>
        <div className="mobile-nav-panel">
          {navItems.map(([label, href]) => <a key={href} href={href}>{label}</a>)}
          <a className="mobile-nav-cta" href="#demo">Run a scan</a>
        </div>
      </details>
    </motion.header>
  );
}
