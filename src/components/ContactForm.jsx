import { useState } from 'react';

const ContactForm = ({ editContact, onCancel, onSave }) => {
  const [formData, setFormData] = useState(editContact || {
    id: Date.now(),
    name: '',
    phone: '',
    birthday: '',
    anniversary: '',
    career: '',
    personalityTraits: []
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'personalityTraits') {
      setFormData(prev => ({ ...prev, personalityTraits: value.split(/,\s*/) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Submit directly to JSON file (requires backend implementation)
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 rounded-2xl shadow-xl">
      <div>
        <label className="block mb-1 font-medium">Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Phone Number</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 font-medium">Birthday</label>
          <input
            type="date"
            name="birthday"
            value={formData.birthday}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Anniversary</label>
          <input
            type="date"
            name="anniversary"
            value={formData.anniversary}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>

      <div>
        <label className="block mb-1 font-medium">Career Information</label>
        <input
          type="text"
          name="career"
          value={formData.career}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Personality Traits</label>
        <input
          type="text"
          name="personalityTraits"
          value={formData.personalityTraits.join(', ') || ''}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          placeholder="Comma-separated traits (e.g., creative, detail-oriented)"
        />
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {editContact ? 'Update' : 'Add'} Contact
        </button>
      </div>
    </form>
  );
};

export default ContactForm;
