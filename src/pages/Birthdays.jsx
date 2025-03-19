import BirthdayManager from '../components/BirthdayManager';
import { Cake } from 'lucide-react';

export default function Birthdays() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Cake className="w-6 h-6 mr-2 text-blue-600" />
          Birthday Manager
        </h1>
        <p className="text-gray-600 mt-1">
          Keep track of important birthdays and never forget to celebrate
        </p>
      </div>
      
      <BirthdayManager />
    </div>
  );
}
