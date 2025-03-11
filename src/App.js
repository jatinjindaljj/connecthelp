import React from 'react';
import Dashboard from './components/Dashboard';
import AddContentForm from './components/AddContentForm';

function App() {
  return (
    <div className='app-container'>
      <h1>My Supabase Dashboard</h1>
      <AddContentForm />
      <Dashboard />
    </div>
  );
}

export default App;
