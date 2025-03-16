import { useState } from 'react';
import { format } from 'date-fns';
import { Download, Upload, Save } from 'lucide-react';
import { loadContacts, saveContacts } from '../utils/storage';
import NotificationSettings from '../components/NotificationSettings';

export default function Settings() {
  const [importStatus, setImportStatus] = useState('');
  const [importError, setImportError] = useState('');

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

  const importContacts = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedContacts = JSON.parse(e.target.result);
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
    event.target.value = null;
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
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-6">Settings</h2>
        
        <div className="space-y-6">
          {/* Notification Settings Section */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Notifications</h3>
            <p className="text-gray-500 text-sm">Configure daily reminders for birthdays and special events.</p>
            
            <div className="mt-4">
              <NotificationSettings />
            </div>
          </div>
          
          <div className="border-t border-gray-100 pt-6 space-y-2">
            <h3 className="text-lg font-medium">Data Management</h3>
            <p className="text-gray-500 text-sm">Export your contacts or import from a backup file.</p>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <button 
                onClick={exportContacts}
                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center"
              >
                <Download className="w-5 h-5 mr-2" />
                Export Contacts
              </button>
              
              <button 
                onClick={handleExportJSON}
                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center"
              >
                <Download className="w-5 h-5 mr-2" />
                Export to JSON
              </button>
              
              <button 
                onClick={handleFileExport}
                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center"
              >
                <Download className="w-5 h-5 mr-2" />
                Export to File
              </button>
              
              <div className="relative">
                <input
                  type="file"
                  id="import-file"
                  accept=".json"
                  onChange={importContacts}
                  className="hidden"
                />
                <button 
                  onClick={() => document.getElementById('import-file').click()}
                  className="px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors flex items-center justify-center"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Import Contacts
                </button>
              </div>
              
              <div className="relative">
                <input
                  type="file"
                  id="import-json-file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
                <button 
                  onClick={() => document.getElementById('import-json-file').click()}
                  className="px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors flex items-center justify-center"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Import from JSON
                </button>
              </div>
              
              <div className="relative">
                <input
                  type="file"
                  id="import-file-import"
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden"
                />
                <button 
                  onClick={() => document.getElementById('import-file-import').click()}
                  className="px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors flex items-center justify-center"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Import from File
                </button>
              </div>
            </div>
            
            {importStatus && (
              <div className={`mt-4 p-3 rounded-lg ${importStatus.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                {importStatus}
              </div>
            )}
            
            {importError && (
              <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-600">
                {importError}
              </div>
            )}
          </div>
          
          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-lg font-medium">About ConnectKeep</h3>
            <p className="text-gray-500 text-sm mt-2">
              ConnectKeep is your personal contact management app designed to help you stay connected with 
              the people who matter most. Never miss a birthday or anniversary again!
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Version 1.0.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
