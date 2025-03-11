import { useEffect, useState } from 'react';
import ContactCard from './ContactCard';
import { supabase } from '../supabaseClient';

const ContactList = ({ onEdit, onDelete }) => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContacts();
  }, []);

  async function fetchContacts() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contacts')
        .select('*');

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error.message);
      alert('Error fetching contacts: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateContact(id, updates) {
    try {
      const { error } = await supabase
        .from('contacts')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      fetchContacts(); // Refresh list
    } catch (error) {
      console.error('Error updating contact:', error.message);
      alert('Error updating contact: ' + error.message);
    }
  }

  if (loading) return <div className="text-center py-4">Loading contacts...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {contacts.length > 0 ? (
        contacts.map(contact => (
          <ContactCard
            key={contact.id}
            contact={contact}
            onEdit={onEdit}
            onDelete={onDelete}
            onSave={updateContact}
          />
        ))
      ) : (
        <div className="col-span-3 text-center py-8">
          <p className="text-gray-500">No contacts found. Add your first contact!</p>
        </div>
      )}
    </div>
  );
};

export default ContactList;
