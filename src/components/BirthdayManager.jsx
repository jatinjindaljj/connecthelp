import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import supabase from '../utils/supabaseClient';
import { format, parseISO } from 'date-fns';
import { Calendar, Trash2, Edit, Plus, Cake } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

export default function BirthdayManager() {
  const { user } = useAuth();
  const [birthdays, setBirthdays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form state
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState(new Date());
  const [relationship, setRelationship] = useState('');
  const [notes, setNotes] = useState('');
  
  // Fetch birthdays when user changes
  useEffect(() => {
    if (user) {
      fetchBirthdays();
    } else {
      setBirthdays([]);
      setLoading(false);
    }
  }, [user]);
  
  const fetchBirthdays = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('birthdays')
        .select('*')
        .order('birth_date', { ascending: true });
      
      if (error) throw error;
      
      setBirthdays(data || []);
    } catch (error) {
      console.error('Error fetching birthdays:', error);
      setError('Failed to load birthdays. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const resetForm = () => {
    setName('');
    setBirthDate(new Date());
    setRelationship('');
    setNotes('');
    setEditingId(null);
  };
  
  const handleAddBirthday = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to add birthdays');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const birthdayData = {
        user_id: user.id,
        name,
        birth_date: birthDate,
        relationship,
        notes
      };
      
      let result;
      
      if (editingId) {
        // Update existing birthday
        result = await supabase
          .from('birthdays')
          .update(birthdayData)
          .eq('id', editingId);
      } else {
        // Add new birthday
        result = await supabase
          .from('birthdays')
          .insert([birthdayData]);
      }
      
      if (result.error) throw result.error;
      
      // Refresh the list
      await fetchBirthdays();
      
      // Reset form and hide it
      resetForm();
      setShowAddForm(false);
    } catch (error) {
      console.error('Error saving birthday:', error);
      setError('Failed to save birthday. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this birthday?')) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase
        .from('birthdays')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Refresh the list
      await fetchBirthdays();
    } catch (error) {
      console.error('Error deleting birthday:', error);
      setError('Failed to delete birthday. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleEdit = (birthday) => {
    setName(birthday.name);
    setBirthDate(new Date(birthday.birth_date));
    setRelationship(birthday.relationship || '');
    setNotes(birthday.notes || '');
    setEditingId(birthday.id);
    setShowAddForm(true);
  };
  
  // If not logged in, show a message
  if (!user) {
    return (
      <div className="text-center py-10">
        <Cake className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Track Important Birthdays</h2>
        <p className="text-gray-500 mb-4">Please log in to manage birthdays</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Birthday Manager</h2>
        <button
          onClick={() => {
            resetForm();
            setShowAddForm(!showAddForm);
          }}
          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {showAddForm ? 'Cancel' : (
            <>
              <Plus className="w-4 h-4 mr-1" />
              Add Birthday
            </>
          )}
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
      
      {showAddForm && (
        <form onSubmit={handleAddBirthday} className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium mb-4">
            {editingId ? 'Edit Birthday' : 'Add New Birthday'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
                Birth Date
              </label>
              <DatePicker
                selected={birthDate}
                onChange={(date) => setBirthDate(date)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                dateFormat="MMMM d, yyyy"
                showYearDropdown
                yearDropdownItemNumber={100}
                scrollableYearDropdown
              />
            </div>
            
            <div>
              <label htmlFor="relationship" className="block text-sm font-medium text-gray-700 mb-1">
                Relationship
              </label>
              <input
                id="relationship"
                type="text"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Friend, Family, etc."
              />
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Gift ideas, preferences, etc."
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Saving...' : (editingId ? 'Update Birthday' : 'Add Birthday')}
            </button>
          </div>
        </form>
      )}
      
      {loading && !showAddForm ? (
        <div className="text-center py-6">
          <p className="text-gray-500">Loading birthdays...</p>
        </div>
      ) : birthdays.length === 0 ? (
        <div className="text-center py-6 bg-gray-50 rounded-lg">
          <Calendar className="w-10 h-10 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500">No birthdays added yet</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Birth Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Relationship
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {birthdays.map((birthday) => (
                <tr key={birthday.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{birthday.name}</div>
                    {birthday.notes && (
                      <div className="text-sm text-gray-500 truncate max-w-xs">{birthday.notes}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {format(new Date(birthday.birth_date), 'MMMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {birthday.relationship || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(birthday)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(birthday.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
