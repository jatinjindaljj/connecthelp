import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Contacts from './pages/Contacts';
import Settings from './pages/Settings';
import AddContact from './pages/AddContact';
import Profile from './pages/Profile';
import Login from './pages/Login';
import { Home, Users, Settings as SettingsIcon } from 'lucide-react';
import MobileNav from './components/MobileNav';
import { useState, useEffect } from 'react';
import { registerServiceWorker } from './utils/notificationManager';
import { AuthProvider } from './contexts/AuthContext';
import UserProfileMenu from './components/Auth/UserProfileMenu';

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
          {/* Modern Header */}
          <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 fixed w-full top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white" data-component-name="App">
              <div className="flex items-center justify-between h-16 bg-white">
                <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:opacity-75 transition-opacity">
                  ConnectKeep
                </Link>
                
                <div className="flex items-center space-x-6">
                  <nav className="hidden md:flex space-x-4">
                    <a href="/contacts" className="px-3 py-2 text-gray-600 hover:text-blue-600 transition-colors flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      Contacts
                    </a>
                    <a href="/settings" className="px-3 py-2 text-gray-600 hover:text-blue-600 transition-colors flex items-center">
                      <SettingsIcon className="w-5 h-5 mr-2" />
                      Settings
                    </a>
                  </nav>
                  
                  <UserProfileMenu />
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
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
          
          {/* Mobile Navigation */}
          <MobileNav />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
