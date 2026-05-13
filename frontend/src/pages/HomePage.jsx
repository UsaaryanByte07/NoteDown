import { Link } from 'react-router-dom';
import { useAuth } from '../context/auth/authContext';

/* ─────────────────────────────────────
   GUEST landing page data
───────────────────────────────────── */
const features = [
  { icon: '📤', title: 'Upload Notes', description: 'Upload PDFs, Word docs, or plain text files. NoteDown organises everything in one place.' },
  { icon: '🤖', title: 'AI Summaries', description: 'Get instant, concise summaries of long documents so you can focus on what matters.' },
  { icon: '💬', title: 'Smart Query', description: 'Ask questions about your notes in natural language and get precise answers instantly.' },
];

const steps = [
  { num: '1', title: 'Create an account', desc: 'Sign up for free and verify your email.' },
  { num: '2', title: 'Upload your notes', desc: 'Upload any document — PDFs, Word files, or plain text.' },
  { num: '3', title: 'Let AI do the work', desc: 'Summarise, search, and query your notes using AI.' },
];

/* ─────────────────────────────────────
   SHARED STYLES
───────────────────────────────────── */
const card = {
  background: 'var(--bg)',
  border: '1px solid var(--border)',
  borderRadius: '1rem',
  padding: '1.5rem',
  transition: 'box-shadow 0.2s, transform 0.2s',
};

const badge = (color) => ({
  display: 'inline-block',
  padding: '0.2rem 0.65rem',
  borderRadius: '999px',
  fontSize: '0.72rem',
  fontWeight: 600,
  background: `var(--${color}-light)`,
  color: `var(--${color}-text)`,
});

/* ─────────────────────────────────────
   ADMIN DASHBOARD
───────────────────────────────────── */
const adminQuickLinks = [
  { to: '/admin/notes', icon: '📋', label: 'Notes Management', desc: 'Review, approve, or remove user-uploaded notes.' },
  { to: '/profile',    icon: '👤', label: 'My Profile',        desc: 'View and update your account information.'         },
];

const adminStats = [
  { icon: '📋', label: 'Notes Management', value: 'Manage All Notes', color: 'info'    },
  { icon: '🛡️', label: 'Role',             value: 'Administrator',    color: 'warning' },
  { icon: '⚙️', label: 'Access Level',     value: 'Elevated',         color: 'danger'  },
];

const AdminHome = ({ user }) => (
  <div style={{ background: 'var(--bg-subtle)', minHeight: '80vh', padding: '2.5rem 1.5rem' }}>
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>

      {/* Welcome banner */}
      <div style={{
        ...card,
        background: 'linear-gradient(135deg, var(--primary) 0%, #0f52ba 100%)',
        border: 'none',
        color: '#fff',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1.25rem',
        flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: '3rem' }}>🛡️</span>
        <div>
          <p style={{ fontSize: '0.85rem', opacity: 0.85, margin: 0 }}>Welcome back</p>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.1rem 0 0.25rem' }}>
            {user?.firstName} {user?.lastName}
          </h1>
          <span style={{ ...badge('warning'), background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
            Administrator
          </span>
        </div>
      </div>

      {/* Stat pills */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {adminStats.map(s => (
          <div key={s.label} style={{ ...card, display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '1.75rem' }}>{s.icon}</span>
            <div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{s.label}</p>
              <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <h2 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1.1rem' }}>
        Quick Links
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {adminQuickLinks.map(l => (
          <Link
            key={l.to}
            to={l.to}
            style={{ ...card, textDecoration: 'none', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}
            onMouseOver={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseOut={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
          >
            <span style={{ fontSize: '1.75rem', flexShrink: 0 }}>{l.icon}</span>
            <div>
              <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{l.label}</p>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{l.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Responsibilities */}
      <h2 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1.1rem' }}>
        Your Responsibilities
      </h2>
      <div style={{ ...card }}>
        {[
          { icon: '✅', text: 'Review and approve notes submitted by users.' },
          { icon: '🗑️', text: 'Remove inappropriate or duplicate content.' },
          { icon: '🔍', text: 'Monitor note quality and metadata accuracy.' },
          { icon: '🔒', text: 'Ensure platform data integrity and security.' },
        ].map(r => (
          <div key={r.text} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.6rem 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{r.icon}</span>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{r.text}</p>
          </div>
        ))}
      </div>

    </div>
  </div>
);

/* ─────────────────────────────────────
   USER DASHBOARD
───────────────────────────────────── */
const userQuickLinks = [
  { to: '/upload',   icon: '📤', label: 'Upload a Note',  desc: 'Share a PDF, Word doc, or text file with the community.' },
  { to: '/notes',    icon: '📚', label: 'Browse Notes',   desc: 'Explore all publicly available notes.'                   },
  { to: '/my-notes', icon: '📁', label: 'My Notes',       desc: 'View, manage, and delete notes you have uploaded.'        },
  { to: '/chat',     icon: '💬', label: 'AI Chat',        desc: 'Ask questions about your notes with AI assistance.'       },
  { to: '/profile',  icon: '👤', label: 'Profile',        desc: 'Update your name, email, or password.'                   },
];

const UserHome = ({ user }) => (
  <div style={{ background: 'var(--bg-subtle)', minHeight: '80vh', padding: '2.5rem 1.5rem' }}>
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>

      {/* Welcome banner */}
      <div style={{
        ...card,
        background: 'linear-gradient(135deg, #1a73e8 0%, #6c47ff 100%)',
        border: 'none',
        color: '#fff',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1.25rem',
        flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: '3rem' }}>👋</span>
        <div>
          <p style={{ fontSize: '0.85rem', opacity: 0.85, margin: 0 }}>Welcome back</p>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.1rem 0 0.25rem' }}>
            {user?.firstName} {user?.lastName}
          </h1>
          <span style={{ ...badge('info'), background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
            Student
          </span>
        </div>
      </div>

      {/* Quick Links */}
      <h2 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1.1rem' }}>
        Quick Links
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {userQuickLinks.map(l => (
          <Link
            key={l.to}
            to={l.to}
            style={{ ...card, textDecoration: 'none', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}
            onMouseOver={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseOut={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
          >
            <span style={{ fontSize: '1.75rem', flexShrink: 0 }}>{l.icon}</span>
            <div>
              <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{l.label}</p>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{l.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* What you can do */}
      <h2 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1.1rem' }}>
        What You Can Do
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '1rem' }}>
        {[
          { icon: '📤', title: 'Share Knowledge', desc: 'Upload your notes and help fellow students learn.' },
          { icon: '🤖', title: 'AI Summaries',    desc: 'Get AI-generated summaries of any document in seconds.' },
          { icon: '💬', title: 'Ask AI Anything', desc: 'Use the AI chat to answer questions from your notes.' },
          { icon: '🔍', title: 'Search Notes',    desc: 'Browse the community library and find what you need.' },
        ].map(f => (
          <div key={f.title} style={{ ...card }}>
            <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.5rem' }}>{f.icon}</span>
            <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{f.title}</p>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{f.desc}</p>
          </div>
        ))}
      </div>

    </div>
  </div>
);

/* ─────────────────────────────────────
   GUEST landing page
───────────────────────────────────── */
const GuestHome = () => (
  <div className="bg-bg-subtle min-h-screen">
    <section className="bg-bg border-b border-border py-20 px-6 text-center">
      <span className="text-5xl mb-4 block">📝</span>
      <h1 className="text-4xl sm:text-5xl font-bold text-text-primary mb-4 leading-tight">
        Your AI-powered<br />notes assistant
      </h1>
      <p className="text-text-secondary text-lg max-w-xl mx-auto mb-8">
        Upload, view, summarise and query your notes using the power of AI — all in one place.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/signup" className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-semibold shadow-sm">
          Get Started — it's free
        </Link>
        <Link to="/login" className="px-8 py-3 bg-bg border border-border text-text-primary rounded-lg hover:bg-bg-subtle transition-colors font-semibold">
          Sign in
        </Link>
      </div>
    </section>

    <section className="py-16 px-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-text-primary text-center mb-2">Everything you need</h2>
      <p className="text-text-secondary text-center mb-10">Powerful features to supercharge your study and work.</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {features.map((f) => (
          <div key={f.title} className="bg-bg border border-border rounded-2xl p-6 hover:shadow-md transition-shadow">
            <span className="text-3xl mb-3 block">{f.icon}</span>
            <h3 className="text-base font-semibold text-text-primary mb-2">{f.title}</h3>
            <p className="text-text-secondary text-sm leading-relaxed">{f.description}</p>
          </div>
        ))}
      </div>
    </section>

    <section className="bg-bg border-y border-border py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-text-primary text-center mb-2">How it works</h2>
        <p className="text-text-secondary text-center mb-10">Three simple steps to get started.</p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          {steps.map((s) => (
            <div key={s.num} className="flex-1 text-center">
              <div className="w-10 h-10 rounded-full bg-primary-light text-primary font-bold text-lg flex items-center justify-center mx-auto mb-3">
                {s.num}
              </div>
              <h3 className="font-semibold text-text-primary mb-1">{s.title}</h3>
              <p className="text-text-secondary text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="py-16 px-6 text-center">
      <h2 className="text-2xl font-bold text-text-primary mb-3">Ready to get started?</h2>
      <p className="text-text-secondary mb-6">Join NoteDown and let AI handle your notes.</p>
      <Link to="/signup" className="inline-block px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-semibold shadow-sm">
        Create a free account
      </Link>
    </section>
  </div>
);

/* ─────────────────────────────────────
   ROOT EXPORT
───────────────────────────────────── */
const HomePage = () => {
  const { isLoggedIn, user } = useAuth();

  if (isLoggedIn) {
    return user?.userType === 'admin'
      ? <AdminHome user={user} />
      : <UserHome user={user} />;
  }

  return <GuestHome />;
};

export default HomePage;