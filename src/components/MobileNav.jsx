import { Home, Users, Settings, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  return (
    <div className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-100 z-50">
      <div className="grid grid-cols-4 gap-2 p-2">
        <button 
          onClick={() => navigate('/')}
          className={`p-2 flex flex-col items-center ${isActive('/') ? 'text-blue-600' : 'text-gray-600'}`}
        >
          <Home className="w-5 h-5 mb-1" />
          <span className="text-xs">Home</span>
        </button>
        <button 
          onClick={() => navigate('/contacts')}
          className={`p-2 flex flex-col items-center ${isActive('/contacts') ? 'text-blue-600' : 'text-gray-600'}`}
        >
          <Users className="w-5 h-5 mb-1" />
          <span className="text-xs">Contacts</span>
        </button>
        <button 
          onClick={() => navigate('/settings')}
          className={`p-2 flex flex-col items-center ${isActive('/settings') ? 'text-blue-600' : 'text-gray-600'}`}
        >
          <Settings className="w-5 h-5 mb-1" />
          <span className="text-xs">Settings</span>
        </button>
        <button 
          onClick={() => navigate('/profile')}
          className={`p-2 flex flex-col items-center ${isActive('/profile') ? 'text-blue-600' : 'text-gray-600'}`}
        >
          <User className="w-5 h-5 mb-1" />
          <span className="text-xs">Profile</span>
        </button>
      </div>
    </div>
  );
}
