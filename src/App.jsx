import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Contacts from './pages/Contacts';
import Settings from './pages/Settings';
import AddContact from './pages/AddContact';
import Profile from './pages/Profile';
import Login from './pages/Login';
import { Home, Users, Settings as SettingsIcon, LogIn, LogOut, User } from 'lucide-react';
import MobileNav from './components/MobileNav';
import { useState, useEffect } from 'react';
import { registerServiceWorker } from './utils/notificationManager';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Header component with sign-in button
function Header() {
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 fixed w-full top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8 bg-white" data-component-name="App">
        <div className="flex items-center justify-between h-16 bg-white">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:opacity-75 transition-opacity">
              ConnectKeep
            </Link>
            
            {!user && (
              <Link 
                to="/login" 
                className="md:hidden flex items-center ml-3 px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
              >
                <LogIn className="w-3 h-3 mr-1" />
                Login
              </Link>
            )}
          </div>
          
          <div className="flex items-center space-x-6">
            <nav className="hidden md:flex space-x-4">
              <Link 
                to="/contacts" 
                className="px-3 py-2 text-gray-600 hover:text-blue-600 transition-colors flex items-center"
              >
                <Users className="w-5 h-5 mr-2" />
                Contacts
              </Link>
              <Link 
                to="/settings" 
                className="px-3 py-2 text-gray-600 hover:text-blue-600 transition-colors flex items-center"
              >
                <SettingsIcon className="w-5 h-5 mr-2" />
                Settings
              </Link>
            </nav>
            
            {user ? (
              <div className="hidden md:block relative">
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
                >
                  <User className="w-5 h-5" />
                  <span className="hidden md:inline">{user.email.split('@')[0]}</span>
                </button>
                
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                    <Link 
                      to="/profile" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <button 
                      onClick={() => {
                        signOut();
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link 
                to="/login" 
                className="hidden md:flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Register service worker for notifications
    const initApp = async () => {
      try {
        await registerServiceWorker();
        console.log('Service worker registered successfully');
      } catch (error) {
        console.error('Failed to register service worker:', error);
      }
    };

    initApp();
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
          <Header />
          
          <main className="pt-20 pb-24 md:pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/contacts" element={<Contacts />} />
                <Route path="/add-contact" element={<AddContact />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/login" element={<Login />} />
              </Routes>
            </div>
          </main>
          
          <MobileNav />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
