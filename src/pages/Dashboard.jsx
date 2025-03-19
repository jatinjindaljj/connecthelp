import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationCard from '../components/NotificationCard';
import { Calendar, Plus, Users, Phone, User } from 'lucide-react';
import { loadContacts } from '../utils/storage';
import { isSameDate } from '../utils/dateHelpers';
import supabase from '../utils/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from '../components/Auth/AuthModal';

export default function Dashboard() {
  const [contacts, setContacts] = useState([]);
  const [completedReminders, setCompletedReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchContacts();
    } else {
      setLoading(false);
      setContacts([]);
    }
  }, [user]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id);
        
      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date();
  
  const birthdays = contacts.filter(contact => 
    contact.birthday && isSameDate(new Date(contact.birthday), today)
  );
  
  const anniversaries = contacts.filter(contact => 
    contact.anniversary && isSameDate(new Date(contact.anniversary), today)
  );

  const handleComplete = (id) => {
    // Just track completed reminders but don't remove cards
    setCompletedReminders([...completedReminders, id]);
  };

  return (
    <div className="dashboard-container p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="dashboard-title text-2xl font-bold text-gray-800">Dashboard</h1>
        {!user ? (
          <button
            onClick={() => setShowAuthModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        ) : (
          <button 
            onClick={() => navigate('/profile')}
            className="flex items-center gap-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            <User size={16} />
            My Profile
          </button>
        )}
      </div>
      
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      
      {loading ? (
        <div className="loading-container flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {!user ? (
            <div className="empty-state p-6 bg-white rounded-lg shadow-sm text-center">
              <div className="flex flex-col items-center py-10">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <User className="w-10 h-10 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Welcome to ConnectKeep</h2>
                <p className="text-gray-600 max-w-md mb-6">
                  Sign in to manage your contacts and never miss important dates
                </p>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Get Started
                </button>
              </div>
            </div>
          ) : birthdays.length === 0 && anniversaries.length === 0 ? (
            <div className="empty-state p-6 bg-gray-50 rounded-lg flex flex-col items-center space-y-6">
              <p className="text-gray-600">No reminders for today</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                <div 
                  onClick={() => navigate('/contacts')}
                  className="cursor-pointer bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center mb-3">
                    <div className="bg-blue-100 rounded-full p-2 mr-3">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Manage Contacts</h3>
                  </div>
                  <p className="text-gray-600 text-sm">Add and update contact information for your network</p>
                </div>
                
                <div 
                  onClick={() => navigate('/profile')}
                  className="cursor-pointer bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center mb-3">
                    <div className="bg-purple-100 rounded-full p-2 mr-3">
                      <User className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Your Profile</h3>
                  </div>
                  <p className="text-gray-600 text-sm">Update your account information and preferences</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="reminders-container space-y-6">
              {birthdays.length > 0 && (
                <div className="birthdays-section">
                  <h2 className="section-title text-xl font-semibold mb-3 flex items-center text-gray-700">
                    <Calendar className="mr-2 text-blue-500" size={20} />
                    Birthday Reminders
                  </h2>
                  <div className="notifications-grid grid gap-4">
                    {birthdays
                      // Don't filter out completed reminders, just show them with the chip
                      .map(contact => (
                        <NotificationCard
                          key={contact.id}
                          contact={contact}
                          onComplete={handleComplete}
                        />
                      ))}
                  </div>
                </div>
              )}
              
              {anniversaries.length > 0 && (
                <div className="anniversaries-section">
                  <h2 className="section-title text-xl font-semibold mb-3 flex items-center text-gray-700">
                    <Calendar className="mr-2 text-purple-500" size={20} />
                    Anniversary Reminders
                  </h2>
                  <div className="notifications-grid grid gap-4">
                    {anniversaries
                      // Don't filter out completed reminders, just show them with the chip
                      .map(contact => (
                        <NotificationCard
                          key={contact.id}
                          contact={contact}
                          onComplete={handleComplete}
                        />
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
