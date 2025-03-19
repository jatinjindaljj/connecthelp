import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, LogOut, ChevronDown } from 'lucide-react';

export default function UserProfile() {
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  
  return (
    <div className="relative">
      <button
        onClick={toggleMenu}
        className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <User className="w-4 h-4 text-blue-600" />
        </div>
        <span className="hidden md:inline text-sm font-medium">
          {user?.email?.split('@')[0] || 'User'}
        </span>
        <ChevronDown className="w-4 h-4" />
      </button>
      
      {menuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-100">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
          </div>
          
          <button
            onClick={handleSignOut}
            className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
