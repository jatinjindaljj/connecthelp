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
      const { data, error } = await supabase
        .from('contacts')
        .insert([{
          ...formData,
          birthday: formData.birthday || null,
          anniversary: formData.anniversary || null
        }])
        .select();

      if(error) throw error;
      navigate('/contacts');
    } catch (error) {
      console.error('Creation error:', error);
      alert('Error creating contact: ' + error.message);
    }
  };

  return (
    <div className="add-contact-page p-6">
      <div className="header mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Add New Contact</h1>
      </div>
      
      <div className="form-container bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="input-field w-full p-2 border rounded"
              placeholder="Full Name"
            />
          </div>
          
          <div className="form-group">
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input-field w-full p-2 border rounded"
              placeholder="Email Address"
            />
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="input-field w-full p-2 border rounded"
              placeholder="Phone Number"
            />
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium mb-1">Birthday</label>
            <div className="flex space-x-2">
              <select
                value={formData.birthday?.split('-')[1] || ''}
                onChange={(e) => updateBirthdayPart('month', e.target.value)}
                className="input-field w-1/3 p-2 border rounded"
              >
                <option value="">Month</option>
                {months.map((month, index) => (
                  <option key={index} value={String(index + 1).padStart(2, '0')}>{month}</option>
                ))}
              </select>
              <select
                value={formData.birthday?.split('-')[2] || ''}
                onChange={(e) => updateBirthdayPart('day', e.target.value)}
                className="input-field w-1/3 p-2 border rounded"
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
                className="input-field w-1/3 p-2 border rounded"
                placeholder="Year"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium mb-1">Anniversary</label>
            <DatePicker
              selected={formData.anniversary ? new Date(formData.anniversary) : null}
              onChange={(date) => setFormData({
                ...formData,
                anniversary: date ? date.toISOString().split('T')[0] : ''
              })}
              dateFormat="yyyy-MM-dd"
              className="w-full p-2 border rounded"
              placeholderText="Select anniversary"
            />
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium mb-1">Personality</label>
            <input
              name="personality"
              value={formData.personality}
              onChange={handleChange}
              placeholder="e.g., friendly, outgoing, reserved"
              className="input-field w-full p-2 border rounded"
            />
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="input-field w-full p-2 border rounded"
              placeholder="Additional notes about this contact"
            ></textarea>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => navigate('/contacts')}
              className="cancel-btn px-4 py-2 bg-gray-200 rounded"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-btn px-4 py-2 bg-blue-500 text-white rounded"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
