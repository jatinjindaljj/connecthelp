import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { ArrowLeft } from 'lucide-react';

export default function ContactFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    birthday: '',
    anniversary: '',
    notes: ''
  });

  useEffect(() => {
    // If editing, load the contact data from Supabase
    if (id) {
      fetchContact(id);
    }
  }, [id]);

  async function fetchContact(contactId) {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', contactId)
        .single();

      if (error) throw error;
      
      if (data) {
        // Format dates for form inputs
        const formattedData = {
          ...data,
          birthday: data.birthday ? new Date(data.birthday).toISOString().split('T')[0] : '',
          anniversary: data.anniversary ? new Date(data.anniversary).toISOString().split('T')[0] : ''
        };
        setFormData(formattedData);
      }
    } catch (error) {
      console.error('Error fetching contact:', error.message);
      alert('Error fetching contact details. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare data
      const contactData = { 
        ...formData,
        birthday: formData.birthday || null,
        anniversary: formData.anniversary || null,
        updated_at: new Date().toISOString()
      };

      let error;

      if (id) {
        // Update existing contact
        const { error: updateError } = await supabase
          .from('contacts')
          .update(contactData)
          .eq('id', id);
        error = updateError;
      } else {
        // Create new contact
        const { error: insertError } = await supabase
          .from('contacts')
          .insert([contactData]);
        error = insertError;
      }

      if (error) throw error;

      setIsSubmitting(false);
      alert(`Contact ${id ? 'updated' : 'added'} successfully!`);

      // Navigate to contacts page
      navigate('/contacts');
    } catch (error) {
      console.error(`Error ${id ? 'updating' : 'saving'} contact:`, error.message);
      setIsSubmitting(false);
      alert(`Failed to ${id ? 'update' : 'add'} contact. ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="loading-container text-center py-8">
        <p className="text-gray-500">Loading contact details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <button 
          onClick={() => navigate('/contacts')}
          className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Contacts
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold mb-6">
          {id ? 'Edit Contact' : 'Add New Contact'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="block w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent peer placeholder-transparent"
                placeholder="Name"
              />
              <label 
                htmlFor="name"
                className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-2"
              >
                Name
              </label>
            </div>

            <div className="relative">
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent peer placeholder-transparent"
                placeholder="Phone"
              />
              <label 
                htmlFor="phone"
                className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-2"
              >
                Phone
              </label>
            </div>

            <div className="relative">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent peer placeholder-transparent"
                placeholder="Email"
              />
              <label 
                htmlFor="email"
                className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-2"
              >
                Email
              </label>
            </div>

            <div className="relative">
              <input
                type="date"
                id="birthday"
                name="birthday"
                value={formData.birthday}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <label 
                htmlFor="birthday"
                className="absolute text-sm text-gray-500 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 left-2"
              >
                Birthday
              </label>
            </div>

            <div className="relative">
              <input
                type="date"
                id="anniversary"
                name="anniversary"
                value={formData.anniversary}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <label 
                htmlFor="anniversary"
                className="absolute text-sm text-gray-500 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 left-2"
              >
                Anniversary
              </label>
            </div>

            <div className="relative">
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                className="block w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent peer placeholder-transparent"
                placeholder="Notes"
              ></textarea>
              <label 
                htmlFor="notes"
                className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-2"
              >
                Notes
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/contacts')}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-colors"
            >
              {id ? 'Update Contact' : 'Add Contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
