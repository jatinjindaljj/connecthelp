import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase  from '../supabaseClient';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function AddContact() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
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
      // Get current user ID
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      
      // Prepare contact data without user_id if not authenticated
      const contactData = {
        ...formData,
        birthday: formData.birthday || null,
        anniversary: formData.anniversary || null
      };
      
      // Only add user_id if we have a valid UUID
      if (userId) {
        contactData.user_id = userId;
      }

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
    }
  };

  return (
    <div className="max-w-screen-md mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Add New Contact</h1>
      
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
                Set Today
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
              <label className="text-sm sm:text-base font-medium">
                Anniversary 
                <span className="text-gray-400">(optional)</span>
              </label>
              <button
                type="button"
                onClick={() => setToday('anniversary')}
                className="text-xs sm:text-sm text-blue-600 hover:text-blue-800"
              >
                Set Today
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
          <label className="block text-sm sm:text-base font-medium mb-1">
            Personality 
            <span className="text-gray-400">(optional)</span>
          </label>
          <input
            name="personality"
            value={formData.personality}
            onChange={handleChange}
            placeholder="e.g., friendly, outgoing, reserved"
            className="w-full p-2 sm:p-3 border rounded-lg text-sm sm:text-base"
          />
        </div>

        {/* Notes */}
        <div className="form-group">
          <label className="block text-sm sm:text-base font-medium mb-1">
            Notes 
            <span className="text-gray-400">(optional)</span>
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            className="w-full p-2 sm:p-3 border rounded-lg text-sm sm:text-base"
            placeholder="Additional notes about this contact"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={() => navigate('/contacts')}
            className="cancel-btn px-4 py-2 bg-gray-200 rounded-lg text-sm sm:text-base"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="submit-btn px-6 py-2 bg-blue-600 text-white rounded-lg
              hover:bg-blue-700 transition-colors text-sm sm:text-base"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Contact'}
          </button>
        </div>
      </form>
    </div>
  );
}
