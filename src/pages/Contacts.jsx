import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ContactCard from '../components/ContactCard';
import { Plus, Search, Users, LogIn } from 'lucide-react';
import supabase from '../utils/supabaseClient';
import { formatDate, getMonthFromDate, getMonthName, getAllMonths } from '../utils/dateHelpers';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from '../components/Auth/AuthModal';

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchContacts();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      
      if (!user) {
        setContacts([]);
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id)
        .order('name');
        
      console.log('Supabase response:', { data, error });
        
      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Full error object:', error);
      console.error('Error fetching contacts:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (id, updatedContact) => {
    try {
      console.log('Saving contact data:', updatedContact);
      
      const contactData = {
        ...contacts.find(contact => contact.id === id),
        ...updatedContact
      };

      // Validate date format
      if(contactData.birthday && !/^\d{4}-\d{2}-\d{2}$/.test(contactData.birthday)) {
        alert('Invalid birthday format');
        return;
      }

      const { data, error } = await supabase
        .from('contacts')
        .update(contactData)
        .eq('id', id)
        .select();

      console.log('Supabase response:', { data, error });
      
      if (error) throw error;
      
      const updatedContacts = contacts.map(contact => 
        contact.id === id ? { ...contact, ...data[0] } : contact
      );
      console.log('Updated contacts list:', updatedContacts);
      
      setContacts(updatedContacts);
      alert('Contact updated successfully!');
    } catch (error) {
      console.error('Full error object:', error);
      console.error('Update error:', error.message);
      alert(`Update failed: ${error.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!id) {
      console.error('Delete failed: No contact ID provided');
      alert('Delete failed: Contact ID is missing');
      return;
    }

    console.log('Attempting to delete contact with ID:', id);
    
    if (window.confirm('Are you sure you want to delete this contact? This action cannot be undone.')) {
      try {
        // First, log the contact we're trying to delete
        const { data: contactToDelete, error: fetchError } = await supabase
          .from('contacts')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single();
          
        console.log('Supabase response:', { data: contactToDelete, error: fetchError });
          
        if (fetchError) {
          console.error('Full error object:', fetchError);
          console.error('Error fetching contact to delete:', fetchError.message);
          alert(`Error finding contact: ${fetchError.message}`);
          return;
        }
        
        console.log('Contact to delete:', contactToDelete);
        
        // Now perform the delete operation
        const { data, error } = await supabase
          .from('contacts')
          .delete()
          .match({ id: id, user_id: user.id });

        console.log('Supabase response:', { data, error });
        
        if (error) {
          console.error('Full error object:', error);
          console.error('Supabase deletion error:', error.message);
          alert(`Deletion failed: ${error.message}`);
          return;
        }
        
        console.log('Delete response:', data);
        
        // Update local state
        setContacts(contacts.filter(contact => contact.id !== id));
        alert('Contact deleted successfully!');
      } catch (error) {
        console.error('Full error object:', error);
        console.error('Unexpected error during deletion:', error.message);
        alert(`Unexpected error: ${error.message}`);
      }
    }
  };

  // Filter contacts based on search term and selected month
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = searchTerm === '' || 
      (contact.name && contact.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (contact.email && contact.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (contact.phone && contact.phone.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesMonth = selectedMonth === '' || 
      (contact.birthday && getMonthFromDate(contact.birthday) === selectedMonth);
    
    return matchesSearch && matchesMonth;
  });

  // Group contacts by first letter
  const groupedContacts = filteredContacts.reduce((acc, contact) => {
    if (!contact.name) return acc;
    
    const firstLetter = contact.name.charAt(0).toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(contact);
    return acc;
  }, {});

  // Sort the letters alphabetically
  const sortedLetters = Object.keys(groupedContacts).sort();

  // Get months for dropdown
  const months = getAllMonths();

  // If user is not logged in, show login prompt
  if (!user) {
    return (
      <div className="contacts-page p-6">
        <div className="header mb-6">
          <h1 className="text-2xl font-bold text-gray-800">All Contacts</h1>
        </div>
        
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="bg-white p-8 rounded-lg shadow-sm max-w-md w-full">
            <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Sign in to view contacts</h2>
            <p className="text-gray-500 mb-6">You need to be logged in to view and manage your contacts</p>
            
            <button
              onClick={() => setShowAuthModal(true)}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign In / Create Account
            </button>
          </div>
        </div>
        
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </div>
    );
  }

  return (
    <div className="contacts-page p-6">
      <div className="header flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">All Contacts</h1>
        <button 
          onClick={() => navigate('/add-contact')}
          className="add-btn flex items-center gap-1 px-3 py-2 bg-blue-500 text-white rounded-md"
        >
          <Plus size={16} />
          Add Contact
        </button>
      </div>

      <div className="filters mb-6 flex flex-col md:flex-row gap-4">
        <div className="search-container relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input pl-10 w-full p-2 border rounded-md"
          />
        </div>
        <div className="month-filter">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="month-select w-full md:w-48 p-2 border rounded-md"
          >
            <option value="">All Birthdays</option>
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      ) : sortedLetters.length === 0 ? (
        <div className="no-contacts text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No contacts found. Try adjusting your filters or add a new contact.</p>
        </div>
      ) : (
        <div className="contacts-list">
          {sortedLetters.map(letter => (
            <div key={letter} className="letter-group mb-8">
              <h2 className="text-lg font-semibold mb-3 text-gray-700">{letter}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedContacts[letter].map(contact => (
                  <ContactCard 
                    key={contact.id} 
                    contact={contact} 
                    onSave={handleSave}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Contacts;
