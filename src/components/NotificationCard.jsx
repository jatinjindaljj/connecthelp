import { useState } from 'react';
import { RefreshCw, Check, ChevronDown, ChevronUp } from 'lucide-react';

export default function NotificationCard({ contact, onComplete }) {
  const [isMaximized, setIsMaximized] = useState(true);
  const [isMessageSent, setIsMessageSent] = useState(false);
  const [message, setMessage] = useState(generateMessage(contact));

  const handleRefresh = () => {
    setMessage(generateMessage(contact));
  };

  const handleSendMessage = () => {
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, "_blank");
  };

  const handleMarkAsSent = () => {
    setIsMessageSent(true);
    // Only notify parent component but don't remove the card
    if (onComplete) {
      onComplete(contact.id);
    }
  };

  const toggleMaximized = () => {
    setIsMaximized(!isMaximized);
  };

  // Calculate age if birthday exists
  const getAge = () => {
    if (!contact.birthday) return null;
    const birthDate = new Date(contact.birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = getAge();

  return (
    <div className="notification-card bg-white rounded-xl shadow-md overflow-hidden">
      {/* Header with name and status pills */}
      <div className="notification-header p-4 flex items-center justify-between bg-gray-50">
        <div className="flex items-center flex-wrap gap-2">
          <h3 className="notification-name text-lg font-semibold">{contact.name}</h3>
          <div className="flex gap-2">
            {age && (
              <span className="age-pill px-4 py-1.5 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
                {age} Years old
              </span>
            )}
            {isMessageSent && (
              <span className="status-pill px-4 py-1.5 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
                Message sent
              </span>
            )}
          </div>
        </div>
        <button 
          onClick={toggleMaximized}
          className="toggle-btn p-1 rounded-full hover:bg-gray-200"
        >
          {isMaximized ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {/* Expanded content */}
      {isMaximized && (
        <div className="notification-content p-4">
          <div className="message-container mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Message</span>
              <button 
                onClick={handleRefresh}
                className="refresh-btn p-1 rounded-full hover:bg-gray-100"
                title="Refresh message"
              >
                <RefreshCw size={16} className="text-gray-500" />
              </button>
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="message-textarea w-full p-3 border border-gray-200 rounded-lg text-sm"
              rows={4}
            />
          </div>

          <div className="actions-container flex items-center justify-between">
            <button
              onClick={handleSendMessage}
              className="send-btn flex-grow py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Send on whatsapp
            </button>
            <button
              onClick={handleMarkAsSent}
              className="mark-sent-btn ml-2 p-2 bg-gray-100 rounded-full hover:bg-gray-200"
              disabled={isMessageSent}
            >
              <Check size={20} className={isMessageSent ? "text-green-500" : "text-gray-500"} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to generate message based on contact info
function generateMessage(contact) {
  if (!contact) return "Hello there!";
  
  const today = new Date();
  const isBirthday = contact.birthday && new Date(contact.birthday).getDate() === today.getDate() && 
                     new Date(contact.birthday).getMonth() === today.getMonth();
  const isAnniversary = contact.anniversary && new Date(contact.anniversary).getDate() === today.getDate() && 
                        new Date(contact.anniversary).getMonth() === today.getMonth();
  
  if (isBirthday) {
    const age = today.getFullYear() - new Date(contact.birthday).getFullYear();
    return `Happy ${age}th birthday, ${contact.name}! 🎉 Wishing you a fantastic day filled with joy and celebration!`;
  } else if (isAnniversary) {
    const years = today.getFullYear() - new Date(contact.anniversary).getFullYear();
    return `Happy ${years} year anniversary, ${contact.name}! 🥂 Congratulations on this special milestone!`;
  } else {
    return `Hi ${contact.name}! 👋 Just checking in to see how you're doing. Hope everything is going well!`;
  }
}
