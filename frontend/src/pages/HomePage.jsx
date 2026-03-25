import { Link } from 'react-router-dom';
import { useAuth } from '../context/auth/authContext';

const features = [
  {
    icon: '📤',
    title: 'Upload Notes',
    description: 'Upload PDFs, Word docs, or plain text files. NoteDown organizes everything in one place.',
  },
  {
    icon: '🤖',
    title: 'AI Summaries',
    description: 'Get instant, concise summaries of long documents so you can focus on what matters.',
  },
  {
    icon: '💬',
    title: 'Smart Query',
    description: 'Ask questions about your notes in natural language. Get precise answers instantly.',
  },
];

const steps = [
  { num: '1', title: 'Create an account', desc: 'Sign up for free and verify your email.' },
  { num: '2', title: 'Upload your notes', desc: 'Upload any document — PDFs, Word files, or plain text.' },
  { num: '3', title: 'Let AI do the work', desc: 'Summarize, search, and query your notes using AI.' },
];

const HomePage = () => {
  const { isLoggedIn, user } = useAuth();

  if (isLoggedIn) {
    return (
      <div className="bg-bg-subtle min-h-[80vh] flex items-center justify-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-text-primary mb-4 leading-tight">
          Hello {user?.userType === 'admin' ? 'Admin' : 'user'}
        </h1>
      </div>
    );
  }

  return (
    <div className="bg-bg-subtle min-h-screen">

      {/* ─── Hero ─── */}
      <section className="bg-bg border-b border-border py-20 px-6 text-center">
        <span className="text-5xl mb-4 block">📝</span>
        <h1 className="text-4xl sm:text-5xl font-bold text-text-primary mb-4 leading-tight">
          Your AI-powered<br />notes assistant
        </h1>
        <p className="text-text-secondary text-lg max-w-xl mx-auto mb-8">
          Upload, view, summarize and query your notes using the power of AI — all in one place.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/signup"
            className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-semibold shadow-sm"
          >
            Get Started — it's free
          </Link>
          <Link
            to="/login"
            className="px-8 py-3 bg-bg border border-border text-text-primary rounded-lg hover:bg-bg-subtle transition-colors font-semibold"
          >
            Sign in
          </Link>
        </div>
      </section>

      {/* ─── Features ─── */}
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

      {/* ─── How it works ─── */}
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

      {/* ─── CTA ─── */}
      <section className="py-16 px-6 text-center">
        <h2 className="text-2xl font-bold text-text-primary mb-3">Ready to get started?</h2>
        <p className="text-text-secondary mb-6">Join NoteDown and let AI handle your notes.</p>
        <Link
          to="/signup"
          className="inline-block px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-semibold shadow-sm"
        >
          Create a free account
        </Link>
      </section>
    </div>
  );
};

export default HomePage;