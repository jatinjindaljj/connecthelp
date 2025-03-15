import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import supabase  from '../supabaseClient'; // Import supabase instance

export default function ContactCard({ contact, onSave, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(contact);

  const handleEdit = () => setIsEditing(true);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    try {
      // Validate date format before saving
      if(formData.birthday && !/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/.test(formData.birthday)) {
        alert('Please enter a valid birthday in YYYY-MM-DD format');
        return;
      }

      // Get current user ID
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      
      // Create a copy of the form data to update
      const updatedData = { ...formData };
      
      // Only set user_id if we have a valid UUID and it's not already set
      if (userId && !updatedData.user_id) {
        updatedData.user_id = userId;
      }

      const { error } = await supabase
        .from('contacts')
        .update(updatedData)
        .eq('id', contact.id);

      if(error) {
        console.error('Update error:', error);
        throw error;
      }
      
      onSave(updatedData);
      setIsEditing(false);
    } catch (error) {
      console.error('Save error:', error);
      alert(`Error saving contact: ${error.message}`);
    }
  };

  // Format date for display (YYYY-MM-DD to DD/MM/YYYY)
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Format date for input field (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

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

  const parseDateSafe = (dateString) => {
    if (!dateString) return null;
    const [year, month, day] = dateString.split('-');
    return new Date(year, month - 1, day);
  };

  return (
    <div className="contact-card bg-white p-4 rounded-lg shadow-md">
      {isEditing ? (
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="edit-form space-y-3">
          <div className="form-group">
            <label className="block text-sm font-medium">Name:</label>
            <input
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              className="edit-input w-full p-2 border rounded"
            />
          </div>
          
          <div className="form-group">
            <label className="block text-sm font-medium">Email:</label>
            <input
              name="email"
              value={formData.email || ''}
              onChange={handleChange}
              className="edit-input w-full p-2 border rounded"
            />
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium">Phone:</label>
            <input
              name="phone"
              value={formData.phone || ''}
              onChange={handleChange}
              className="edit-input w-full p-2 border rounded"
            />
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium">Birthday:</label>
            <DatePicker
              selected={parseDateSafe(formData.birthday)}
              onChange={(date) => {
                const isoDate = date ? 
                  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
                  : '';
                setFormData({...formData, birthday: isoDate});
              }}
              dateFormat="yyyy-MM-dd"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              placeholderText="Select birthday"
              showYearDropdown
              dropdownMode="select"
              maxDate={new Date()}
              popperPlacement="auto"
            />
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium">Anniversary:</label>
            <DatePicker
              selected={parseDateSafe(formData.anniversary)}
              onChange={(date) => {
                const isoDate = date ? 
                  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
                  : '';
                setFormData({...formData, anniversary: isoDate});
              }}
              dateFormat="yyyy-MM-dd"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              placeholderText="Select anniversary"
              showYearDropdown
              dropdownMode="select"
              popperPlacement="auto"
            />
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium">Personality:</label>
            <input
              name="personality"
              value={formData.personality || ''}
              onChange={handleChange}
              placeholder="e.g., friendly, outgoing, reserved"
              className="edit-input w-full p-2 border rounded"
            />
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium">Notes:</label>
            <textarea
              name="notes"
              value={formData.notes || ''}
              onChange={handleChange}
              rows="3"
              className="edit-input w-full p-2 border rounded"
            ></textarea>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="cancel-btn px-3 py-1 bg-gray-200 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="save-btn px-3 py-1 bg-blue-500 text-white rounded"
            >
              Save
            </button>
          </div>
        </form>
      ) : (
        <div className="contact-info">
          <h3 className="text-lg font-semibold">{contact.name}</h3>
          <div className="contact-details space-y-1 mt-2">
            <p className="contact-email flex items-center">
              <span className="w-24 text-gray-500">Email:</span> 
              <span>{contact.email || 'Not provided'}</span>
            </p>
            <p className="contact-phone flex items-center">
              <span className="w-24 text-gray-500">Phone:</span> 
              <span>{contact.phone || 'Not provided'}</span>
            </p>
            <p className="contact-birthday flex items-center">
              <span className="w-24 text-gray-500">Birthday:</span> 
              <span>{contact.birthday ? formatDate(contact.birthday) : 'Not provided'}</span>
            </p>
            <p className="contact-anniversary flex items-center">
              <span className="w-24 text-gray-500">Anniversary:</span> 
              <span>{contact.anniversary ? formatDate(contact.anniversary) : 'Not provided'}</span>
            </p>
            <p className="contact-personality flex items-center">
              <span className="w-24 text-gray-500">Personality:</span> 
              <span>{contact.personality || 'Not provided'}</span>
            </p>
            <p className="contact-notes mt-2">
              <span className="block text-gray-500">Notes:</span> 
              <span className="block pl-2 border-l-2 border-gray-200 mt-1">
                {contact.notes || 'No notes available'}
              </span>
            </p>
          </div>
          
          <div className="flex space-x-2 mt-4">
            <button 
              onClick={handleEdit}
              className="edit-btn px-2 py-1 bg-blue-100 text-blue-600 rounded"
            >
              Edit
            </button>
            {onDelete && (
              <button
                onClick={() => onDelete(contact.id)}
                className="delete-btn px-2 py-1 bg-red-100 text-red-600 rounded"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
