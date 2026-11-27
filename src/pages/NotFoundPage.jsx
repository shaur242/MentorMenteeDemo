import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import { Home } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function NotFoundPage() {
  const { isAuthenticated, currentRole } = useApp();
  const returnPath = isAuthenticated && currentRole ? `/${currentRole.toLowerCase()}/overview` : '/';

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 font-sans">
      <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
        <span className="text-4xl font-black text-slate-300">?</span>
      </div>
      <h1 className="text-5xl font-black text-navy-900 mb-2">404</h1>
      <h2 className="text-lg font-semibold text-slate-700 mb-2">Page Not Found</h2>
      <p className="text-sm text-slate-500 max-w-sm mb-8">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link to={returnPath}>
        <Button variant="primary" icon={Home}>
          {isAuthenticated ? 'Back to Dashboard' : 'Back to Sign In'}
        </Button>
      </Link>
    </div>
  );
}
