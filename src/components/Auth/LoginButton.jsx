import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User } from 'lucide-react';
import AuthModal from './AuthModal';

export default function LoginButton() {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const handleOpenModal = () => {
    setShowAuthModal(true);
  };
  
  const handleCloseModal = () => {
    setShowAuthModal(false);
  };
  
  // If user is already logged in, don't show the login button
  if (user) return null;
  
  return (
    <>
      <button
        onClick={handleOpenModal}
        className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
          <User className="w-4 h-4 text-gray-600" />
        </div>
        <span className="hidden md:inline text-sm font-medium">Login</span>
      </button>
      
      <AuthModal isOpen={showAuthModal} onClose={handleCloseModal} />
    </>
  );
}
