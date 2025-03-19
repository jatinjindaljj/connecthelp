import { useState } from 'react';
import { format } from 'date-fns';
import { Download, Upload, Save, Bell } from 'lucide-react';
import { loadContacts, saveContacts } from '../utils/storage';
import NotificationSettings from '../components/NotificationSettings';
import { useAuth } from '../contexts/AuthContext';

export default function Settings() {
  const { user } = useAuth();
  const [importStatus, setImportStatus] = useState('');
  const [importError, setImportError] = useState('');
  const [activeTab, setActiveTab] = useState('notifications');

  const validateContact = (contact) => {
    return contact.name && contact.phone;
  };

  const handleImport = (contacts) => {
    if (contacts.every(validateContact)) {
      saveContacts(contacts);
      setImportStatus('Imported successfully!');
    } else {
      setImportError('Invalid contact structure');
    }
  };

  const exportContacts = () => {
    const contacts = loadContacts();
    const dataStr = JSON.stringify(contacts, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `contacts-${format(new Date(), 'yyyy-MM-dd')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    setImportStatus('Contacts exported successfully!');
    setTimeout(() => setImportStatus(''), 3000);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importedContacts = JSON.parse(event.target.result);
          if (Array.isArray(importedContacts)) {
            const currentContacts = loadContacts();
            
            // Merge contacts, avoiding duplicates by ID
            const mergedContacts = [...currentContacts];
            const existingIds = new Set(currentContacts.map(c => c.id));
            
            importedContacts.forEach(contact => {
              if (!existingIds.has(contact.id)) {
                mergedContacts.push(contact);
              }
            });
            
            handleImport(mergedContacts);
          } else {
            setImportStatus('Error: Invalid format. Expected an array of contacts.');
            setTimeout(() => setImportStatus(''), 3000);
          }
        } catch (error) {
          setImportStatus('Error importing contacts: Invalid JSON format');
          setTimeout(() => setImportStatus(''), 3000);
        }
      };
      reader.readAsText(file);
    }
    // Reset the input
    e.target.value = null;
  };

  const handleExportJSON = () => {
    const data = JSON.stringify(loadContacts(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'contacts.json';
    link.click();
  };

  const handleImportJSON = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          handleImport(JSON.parse(event.target.result));
        } catch {
          setImportStatus('Invalid JSON file');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleFileExport = () => {
    const data = JSON.stringify(loadContacts(), null, 2);
    const file = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'connectkeep-contacts.json';
    link.click();
  };

  const handleFileImport = async (e) => {
    const file = e.target.files[0];
    if (file?.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          handleImport(JSON.parse(event.target.result));
        } catch (error) {
          setImportStatus('Invalid file format');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="settings-page p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>
      
      <div className="settings-tabs mb-6">
        <div className="flex border-b border-gray-200">
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'notifications' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('notifications')}
          >
            <div className="flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Notifications
            </div>
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'data' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('data')}
          >
            <div className="flex items-center">
              <Save className="w-5 h-5 mr-2" />
              Data Management
            </div>
          </button>
        </div>
      </div>
      
      {activeTab === 'notifications' && (
        <div className="notification-tab">
          <NotificationSettings />
        </div>
      )}
      
      {activeTab === 'data' && (
        <div className="data-management-tab">
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Data Import & Export</h2>
            
            {importStatus && (
              <div className="bg-green-50 text-green-800 p-3 rounded-md mb-4">
                {importStatus}
              </div>
            )}
            
            {importError && (
              <div className="bg-red-50 text-red-800 p-3 rounded-md mb-4">
                {importError}
              </div>
            )}
            
            <div className="flex flex-col space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Export Contacts</h3>
                <p className="text-gray-600 mb-3">
                  Download all your contacts as a JSON file for backup or transfer.
                </p>
                <button 
                  onClick={exportContacts}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Contacts
                </button>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-lg font-medium mb-2">Import Contacts</h3>
                <p className="text-gray-600 mb-3">
                  Import contacts from a JSON file. This will merge with your existing contacts.
                </p>
                <label className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  Import Contacts
                  <input 
                    type="file" 
                    accept=".json" 
                    onChange={handleFileUpload} 
                    className="hidden" 
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
