import { Link } from 'react-router-dom';
import { useAuth } from '../context/auth/authContext';

const Footer = () => {
  const { isLoggedIn, user } = useAuth();
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        backgroundColor: 'var(--bg)',
        borderTop: '1px solid var(--border)',
        color: 'var(--text-secondary)',
        padding: '3rem 1.5rem 1.5rem',
        marginTop: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '2.5rem',
        }}
      >
        {/* Brand column */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem' }}>📝</span>
            <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>NoteDown</span>
          </div>
          <p style={{ fontSize: '0.85rem', lineHeight: '1.6', marginBottom: '1rem' }}>
            Your AI-powered notes assistant. Upload, summarise, and query your notes in one place.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {/* GitHub icon */}
            <a
              href="https://github.com/UsaaryanByte07/NoteDown"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="NoteDown GitHub repository"
              style={iconLinkStyle}
              onMouseOver={e => e.currentTarget.style.color = 'var(--primary)'}
              onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Quick Links column */}
        <div>
          <h3 style={headingStyle}>Quick Links</h3>
          <ul style={ulStyle}>
            <li><FooterLink to="/">Home</FooterLink></li>
            {!isLoggedIn && (
              <>
                <li><FooterLink to="/login">Login</FooterLink></li>
                <li><FooterLink to="/signup">Sign Up</FooterLink></li>
              </>
            )}
            {isLoggedIn && user?.userType === 'user' && (
              <>
                <li><FooterLink to="/upload">Upload Note</FooterLink></li>
                <li><FooterLink to="/notes">Browse Notes</FooterLink></li>
                <li><FooterLink to="/my-notes">My Notes</FooterLink></li>
                <li><FooterLink to="/chat">AI Chat</FooterLink></li>
                <li><FooterLink to="/profile">Profile</FooterLink></li>
              </>
            )}
            {isLoggedIn && user?.userType === 'admin' && (
              <>
                <li><FooterLink to="/admin/notes">Notes Management</FooterLink></li>
                <li><FooterLink to="/profile">Profile</FooterLink></li>
              </>
            )}
          </ul>
        </div>

        {/* Project column */}
        <div>
          <h3 style={headingStyle}>Project</h3>
          <ul style={ulStyle}>
            <li>
              <FooterExternalLink href="https://github.com/UsaaryanByte07/NoteDown">
                📦 Repository
              </FooterExternalLink>
            </li>
            <li>
              <FooterExternalLink href="https://github.com/UsaaryanByte07/NoteDown/issues">
                🐛 Report a Bug
              </FooterExternalLink>
            </li>
            <li>
              <FooterExternalLink href="https://github.com/UsaaryanByte07/NoteDown/blob/main/README.md">
                📖 Documentation
              </FooterExternalLink>
            </li>
          </ul>
        </div>

        {/* Developer column */}
        <div>
          <h3 style={headingStyle}>Developer</h3>
          <ul style={ulStyle}>
            <li>
              <FooterExternalLink href="https://github.com/UsaaryanByte07">
                👤 UsaaryanByte07
              </FooterExternalLink>
            </li>
            <li>
              <FooterExternalLink href="https://github.com/UsaaryanByte07?tab=repositories">
                🗂️ All Projects
              </FooterExternalLink>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          maxWidth: '1100px',
          margin: '2rem auto 0',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          fontSize: '0.8rem',
        }}
      >
        <span>© {year} NoteDown. All rights reserved.</span>
        <span>
          Built with ❤️ by{' '}
          <a
            href="https://github.com/UsaaryanByte07"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}
          >
            UsaaryanByte07
          </a>
        </span>
      </div>
    </footer>
  );
};

/* ── Helpers ── */
const headingStyle = {
  fontWeight: 700,
  fontSize: '0.875rem',
  color: 'var(--text-primary)',
  marginBottom: '0.75rem',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const ulStyle = {
  listStyle: 'none',
  padding: 0,
  margin: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const iconLinkStyle = {
  color: 'var(--text-secondary)',
  transition: 'color 0.2s',
  display: 'flex',
};

const FooterLink = ({ to, children }) => (
  <Link
    to={to}
    style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem', transition: 'color 0.2s' }}
    onMouseOver={e => e.currentTarget.style.color = 'var(--primary)'}
    onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}
  >
    {children}
  </Link>
);

const FooterExternalLink = ({ href, children }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem', transition: 'color 0.2s' }}
    onMouseOver={e => e.currentTarget.style.color = 'var(--primary)'}
    onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}
  >
    {children}
  </a>
);

export default Footer;
