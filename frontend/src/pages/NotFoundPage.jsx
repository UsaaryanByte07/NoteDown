import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 bg-bg-subtle">
      <div className="bg-bg border border-border shadow-md rounded-2xl p-12 max-w-lg w-full text-center">
        <span className="text-6xl mb-4 block">🔍</span>
        <h1 className="text-7xl font-black text-primary mb-4">404</h1>
        <h2 className="text-2xl font-bold text-text-primary mb-3">Page not found</h2>
        <p className="text-text-secondary mb-8 text-base">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-block px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-all font-semibold"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;