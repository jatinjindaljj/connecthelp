import { useState } from 'react';
import supabase from '../utils/supabaseClient';

const AddContentForm = () => {
  const [formData, setFormData] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from('contacts')
      .insert([{
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      }]);

    if (error) {
      alert(`Error saving contact: ${error.message}`);
    } else {
      alert('Contact added successfully!');
      setFormData({});
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form onSubmit={handleSubmit} className='form-container bg-white p-6 rounded-lg shadow-md mb-6'>
      <div className='grid grid-cols-2 gap-4'>
        <input
          className='input-field'
          type='text'
          name='name'
          placeholder='Full Name'
          onChange={handleChange}
          required
        />
        <input
          className='input-field'
          type='email'
          name='email'
          placeholder='Email Address'
          onChange={handleChange}
          required
        />
        <input
          className='input-field'
          type='tel'
          name='phone'
          placeholder='Phone Number'
          onChange={handleChange}
        />
      </div>
      <button
        type='submit'
        className='submit-btn mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
      >
        Add Contact
      </button>
    </form>
  );
};

export default AddContentForm;
