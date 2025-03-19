import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from '../components/Auth/AuthModal';

export default function Login() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);
  
  return (
    <div className="max-w-md mx-auto p-6">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Welcome to ConnectKeep</h1>
        <p className="text-gray-600 mt-2">
          Sign in to manage your contacts and important dates
        </p>
      </div>
      
      <AuthModal 
        onClose={() => navigate('/')} 
        onSuccess={() => navigate('/')}
      />
    </div>
  );
}
