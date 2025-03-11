import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationCard from '../components/NotificationCard';
import { Calendar, Plus, Users, Phone } from 'lucide-react';
import { loadContacts } from '../utils/storage';
import { isSameDate } from '../utils/dateHelpers';
import supabase from '../supabaseClient';

export default function Dashboard() {
  const [contacts, setContacts] = useState([]);
  const [completedReminders, setCompletedReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('contacts')
          .select('*');
          
        if (error) throw error;
        setContacts(data || []);
      } catch (error) {
        console.error('Error fetching contacts:', error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchContacts();
  }, []);

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
      <h1 className="dashboard-title text-2xl font-bold mb-6 text-gray-800">Dashboard</h1>
      
      {loading ? (
        <div className="loading-container flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {birthdays.length === 0 && anniversaries.length === 0 ? (
            <div className="empty-state p-6 bg-gray-50 rounded-lg text-center">
              <p className="text-gray-600">No reminders for today</p>
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
