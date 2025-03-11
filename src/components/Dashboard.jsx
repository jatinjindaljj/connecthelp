import { useEffect, useState } from 'react';
import supabase from '../supabaseClient';

const Dashboard = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from('contacts').select('*');
      if (error) console.error('Error:', error);
      else setData(data);
    };

    const subscription = supabase
      .channel('contacts')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'contacts' },
        (payload) => setData(prev => [...prev, payload.new])
      )
      .subscribe();

    fetchData();
    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className='dashboard-container card'>
      <h2 className='dashboard-title'>Dashboard</h2>
      <ul className='data-list'>
        {data.map((item) => (
          <li key={item.id} className='data-item'>
            {JSON.stringify(item)}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
