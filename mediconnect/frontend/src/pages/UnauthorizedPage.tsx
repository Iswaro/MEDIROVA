import { Link, useNavigate } from 'react-router-dom';
import { ShieldOff, ArrowLeft, LogIn } from 'lucide-react';
import Button from '../components/ui/Button';

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="mx-auto w-20 h-20 bg-danger/10 rounded-full flex items-center justify-center mb-4">
            <ShieldOff className="w-10 h-10 text-danger" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800">Access Denied</h2>
          <p className="text-gray-500 mt-2">
            You don&apos;t have permission to access this page. Please log in with the
            appropriate account or contact support.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="ghost" onClick={() => navigate(-1)} className="w-full sm:w-auto">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
          <Link to="/login">
            <Button variant="primary" className="w-full sm:w-auto">
              <LogIn className="w-4 h-4 mr-2" />
              Log In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
