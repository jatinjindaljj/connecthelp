import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ContactCard from '../components/ContactCard';
import { Plus } from 'lucide-react';
import supabase from '../supabaseClient';

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
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
          .match({ id: id });

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

      {loading ? (
        <div className="loading-container flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      ) : contacts.length === 0 ? (
        <div className="empty-state p-6 bg-gray-50 rounded-lg text-center">
          <p className="text-gray-600">No contacts found. Add your first contact!</p>
        </div>
      ) : (
        <div className="contacts-grid grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {contacts.map(contact => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onSave={handleSave}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Contacts;
