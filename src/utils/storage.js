// Storage utility functions

// In-memory contacts storage
let contactsCache = [];

// Load contacts from JSON file
export const loadContacts = async () => {
  try {
    // Try to load from localStorage first (for persistence between page refreshes)
    const saved = localStorage.getItem('contacts');
    if (saved) {
      contactsCache = JSON.parse(saved);
      return contactsCache;
    }
    
    // Fall back to contacts.json
    const response = await fetch('/contacts.json');
    if (!response.ok) throw new Error('Failed to load contacts');
    
    const text = await response.text();
    contactsCache = text ? JSON.parse(text) : [];
    
    // Save to localStorage for future use
    localStorage.setItem('contacts', JSON.stringify(contactsCache));
    return contactsCache;
  } catch (error) {
    console.error('Error loading contacts:', error);
    return [];
  }
};

// Save contacts to localStorage
export const saveContacts = (contacts) => {
  try {
    contactsCache = contacts;
    localStorage.setItem('contacts', JSON.stringify(contacts));
    return true;
  } catch (error) {
    console.error('Error saving contacts:', error);
    return false;
  }
};

// Export contacts to a downloadable JSON file
export const exportContactsToFile = () => {
  try {
    const contacts = localStorage.getItem('contacts') || '[]';
    const blob = new Blob([contacts], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'contacts.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('Error exporting contacts:', error);
    return false;
  }
};

// Import contacts from a file
export const importContactsFromFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const contacts = JSON.parse(e.target.result);
        contactsCache = contacts;
        localStorage.setItem('contacts', JSON.stringify(contacts));
        resolve(contacts);
      } catch (error) {
        reject('Invalid JSON file');
      }
    };
    reader.onerror = () => reject('Error reading file');
    reader.readAsText(file);
  });
};
