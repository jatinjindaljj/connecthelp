import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import ContactCard from './ContactCard';

export default function ContactsList() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContacts();
  }, []);

  async function fetchContacts() {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*');
        
      if (error) throw error;
      setContacts(data);
    } catch (error) {
      alert(error.message);
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
      alert(error.message);
    }
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="contacts-grid">
      {contacts.map((contact) => (
        <ContactCard 
          key={contact.id}
          contact={contact}
          onSave={updateContact}
        />
      ))}
    </div>
  );
}
