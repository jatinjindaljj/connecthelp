import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase  from '../utils/supabaseClient';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from '../components/Auth/AuthModal';
import { LogIn, UserPlus } from 'lucide-react';

export default function AddContact() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birthday: '',
    anniversary: '',
    personality: '',
    notes: ''
  });

  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  // Function to set today's date
  const setToday = (field) => {
    const today = new Date();
    const year = today.getFullYear().toString();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    setFormData({
      ...formData,
      [field]: `${year}-${month}-${day}`
    });
  };

  const updateBirthdayPart = (part, value) => {
    const currentDate = formData.birthday ? formData.birthday.split('-') : ['','',''];
    const [year = '', month = '', day = ''] = currentDate;
    
    const newDate = {
      year: part === 'year' ? value : year,
      month: part === 'month' ? value.padStart(2, '0') : month,
      day: part === 'day' ? value.padStart(2, '0') : day
    };
    
    setFormData({...formData, birthday: `${newDate.year}-${newDate.month}-${newDate.day}`});
  };

  const updateAnniversaryPart = (part, value) => {
    const currentDate = formData.anniversary ? formData.anniversary.split('-') : ['','',''];
    const [year = '', month = '', day = ''] = currentDate;
    
    const newDate = {
      year: part === 'year' ? value : year,
      month: part === 'month' ? value.padStart(2, '0') : month,
      day: part === 'day' ? value.padStart(2, '0') : day
    };
    
    setFormData({...formData, anniversary: `${newDate.year}-${newDate.month}-${newDate.day}`});
  };

  const handleChange = (e) => {
    let value = e.target.value;
    const name = e.target.name;
    
    // Clean phone numbers when the phone field is updated
    if (name === 'phone') {
      // Keep only digits and the plus sign for international numbers
      value = value.replace(/[^0-9+]/g, '');
    }
    
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate both dates
    const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
    
    if(formData.birthday && !dateRegex.test(formData.birthday)) {
      alert('Invalid birthday format');
      return;
    }
    
    if(formData.anniversary && !dateRegex.test(formData.anniversary)) {
      alert('Invalid anniversary format');
      return;
    }

    try {
      setLoading(true);
      
      // We only allow authenticated users to add contacts now
      if (!user) {
        alert('You must be logged in to add contacts');
        setShowAuthModal(true);
        return;
      }
      
      const contactData = {
        ...formData,
        user_id: user.id,
        birthday: formData.birthday || null,
        anniversary: formData.anniversary || null,
        created_at: new Date().toISOString()
      };

      console.log('Creating contact with user_id:', user.id);

      const { data, error } = await supabase
        .from('contacts')
        .insert([contactData])
        .select();

      if(error) {
        console.error('Creation error:', error);
        throw error;
      }
      
      navigate('/contacts');
    } catch (error) {
      console.error('Creation error:', error);
      alert('Error creating contact: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImportContacts = async () => {
    try {
      const contacts = await navigator.contacts.select(['name', 'tel'], { multiple: false });
      if (contacts && contacts.length > 0) {
        const contact = contacts[0];
        
        // Clean phone number by removing spaces, hyphens, parentheses, and other non-numeric characters
        let phoneNumber = '';
        if (contact.tel && contact.tel[0]) {
          // Keep only digits, plus sign (for international numbers)
          phoneNumber = contact.tel[0].replace(/[^0-9+]/g, '');
        }
        
        setFormData({
          ...formData,
          name: contact.name?.[0] || '',
          phone: phoneNumber
        });
        
        alert(`Imported contact: ${contact.name?.[0] || 'Unknown'}`);
      }
    } catch (error) {
      console.error('Error accessing contacts:', error);
      alert('Error accessing contacts. Please ensure you have granted permission.');
    }
  };

  // If user is not logged in, show login prompt
  if (!user) {
    return (
      <div className="max-w-screen-md mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-4">
          <h1 className="text-xl sm:text-2xl font-bold">Add New Contact</h1>
        </div>
        
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="bg-white p-8 rounded-lg shadow-sm max-w-md w-full">
            <UserPlus className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Sign in to add contacts</h2>
            <p className="text-gray-500 mb-6">You need to be logged in to create and manage your contacts</p>
            
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
    <div className="max-w-screen-md mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl sm:text-2xl font-bold" data-component-name="AddContact">Add New Contact</h1>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          onClick={handleImportContacts}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
          </svg>
          Import a Single Contact from Your Device
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Name and Email Inputs */}
          <div className="space-y-4 sm:space-y-6">
            <div className="form-group">
              <label className="block text-sm sm:text-base font-medium mb-1">Name</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-2 sm:p-3 border rounded-lg text-sm sm:text-base"
              />
            </div>
            <div className="form-group">
              <label className="block text-sm sm:text-base font-medium mb-1">
                Email
                <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 sm:p-3 border rounded-lg text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="form-group">
            <label className="block text-sm sm:text-base font-medium mb-1">Phone</label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-2 sm:p-3 border rounded-lg text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Date Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Birthday */}
          <div className="form-group">
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm sm:text-base font-medium">Birthday</label>
              <button
                type="button"
                onClick={() => setToday('birthday')}
                className="text-xs sm:text-sm text-blue-600 hover:text-blue-800"
              >
                Today
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <select
                value={formData.birthday?.split('-')[1] || ''}
                onChange={(e) => updateBirthdayPart('month', e.target.value)}
                className="w-full p-2 sm:p-3 border rounded-lg text-sm sm:text-base"
              >
                <option value="">Month</option>
                {months.map((month, index) => (
                  <option key={index} value={String(index + 1).padStart(2, '0')}>{month}</option>
                ))}
              </select>
              <select
                value={formData.birthday?.split('-')[2] || ''}
                onChange={(e) => updateBirthdayPart('day', e.target.value)}
                className="w-full p-2 sm:p-3 border rounded-lg text-sm sm:text-base"
              >
                <option value="">Day</option>
                {Array.from({length: 31}, (_, i) => i + 1).map((day) => (
                  <option key={day} value={String(day).padStart(2, '0')}>{day}</option>
                ))}
              </select>
              <input
                type="text"
                value={formData.birthday?.split('-')[0] || ''}
                onChange={(e) => updateBirthdayPart('year', e.target.value)}
                onFocus={(e) => e.target.select()}
                className="w-full p-2 sm:p-3 border rounded-lg text-sm sm:text-base"
                placeholder="Year"
              />
            </div>
          </div>

          {/* Anniversary */}
          <div className="form-group">
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm sm:text-base font-medium">Anniversary</label>
              <button
                type="button"
                onClick={() => setToday('anniversary')}
                className="text-xs sm:text-sm text-blue-600 hover:text-blue-800"
              >
                Today
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <select
                value={formData.anniversary?.split('-')[1] || ''}
                onChange={(e) => updateAnniversaryPart('month', e.target.value)}
                className="w-full p-2 sm:p-3 border rounded-lg text-sm sm:text-base"
              >
                <option value="">Month</option>
                {months.map((month, index) => (
                  <option key={index} value={String(index + 1).padStart(2, '0')}>{month}</option>
                ))}
              </select>
              <select
                value={formData.anniversary?.split('-')[2] || ''}
                onChange={(e) => updateAnniversaryPart('day', e.target.value)}
                className="w-full p-2 sm:p-3 border rounded-lg text-sm sm:text-base"
              >
                <option value="">Day</option>
                {Array.from({length: 31}, (_, i) => i + 1).map((day) => (
                  <option key={day} value={String(day).padStart(2, '0')}>{day}</option>
                ))}
              </select>
              <input
                type="text"
                value={formData.anniversary?.split('-')[0] || ''}
                onChange={(e) => updateAnniversaryPart('year', e.target.value)}
                onFocus={(e) => e.target.select()}
                className="w-full p-2 sm:p-3 border rounded-lg text-sm sm:text-base"
                placeholder="Year"
              />
            </div>
          </div>
        </div>

        {/* Personality */}
        <div className="form-group">
          <label className="block text-sm sm:text-base font-medium mb-1">Personality Type</label>
          <input
            name="personality"
            value={formData.personality}
            onChange={handleChange}
            placeholder="Example: INFJ, Type 2, etc."
            className="w-full p-2 sm:p-3 border rounded-lg text-sm sm:text-base"
          />
        </div>

        {/* Notes */}
        <div className="form-group">
          <label className="block text-sm sm:text-base font-medium mb-1">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            className="w-full p-2 sm:p-3 border rounded-lg text-sm sm:text-base"
          ></textarea>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={() => navigate('/contacts')}
            className="px-4 py-2 text-sm sm:text-base text-gray-700 hover:text-gray-900 mr-4"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm sm:text-base disabled:opacity-60"
          >
            {loading ? 'Adding...' : 'Add Contact'}
          </button>
        </div>
      </form>
    </div>
  );
}
