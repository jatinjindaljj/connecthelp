import { useState } from 'react';
import { RefreshCw, Check, ChevronDown, ChevronUp } from 'lucide-react';

export default function NotificationCard({ contact, onComplete }) {
  const [isMaximized, setIsMaximized] = useState(true);
  const [isMessageSent, setIsMessageSent] = useState(false);
  const [message, setMessage] = useState(generateMessage(contact));
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);

  const handleRefresh = () => {
    setMessage(generateMessage(contact, true)); // Pass true to force a random message
  };

  const handleSendMessage = () => {
    const encodedMessage = encodeURIComponent(message);
    // Check if contact has a phone number
    if (contact.phone) {
      // Format phone number by removing any non-digit characters
      const formattedPhone = contact.phone.replace(/\D/g, '');
      // Open WhatsApp with the contact's phone number and the message
      window.open(`https://wa.me/${formattedPhone}?text=${encodedMessage}`, "_blank");
    } else {
      // If no phone number, just open WhatsApp with the message
      window.open(`https://wa.me/?text=${encodedMessage}`, "_blank");
    }
  };

  const handleMarkAsSent = () => {
    setIsMessageSent(true);
    setIsMaximized(false); // Collapse the card when marked as sent
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
              <span className="age-pill px-4 py-1.5 bg-blue-100 text-blue-800 text-sm rounded-full font-medium" data-component-name="NotificationCard">
                {age} Years old
              </span>
            )}
            {isMessageSent && (
              <span className="status-pill px-4 py-1.5 bg-green-100 text-green-800 text-sm rounded-full font-medium">
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
                data-component-name="NotificationCard"
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

          {/* Additional Details Button */}
          {(contact.personality || contact.notes) && (
            <button
              onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
              className="w-full py-4 px-0 flex items-center justify-between hover:bg-gray-50 transition-colors"
              data-component-name="NotificationCard"
            >
              <span className="text-sm font-medium text-gray-700">Additional Details</span>
              <ChevronDown size={18} className={`transform ${isDetailsExpanded ? 'rotate-180' : ''} transition-transform`} />
            </button>
          )}

          {/* Personality and Notes Card */}
          {isDetailsExpanded && (
            <div className="px-4 pb-4 space-y-3">
              {contact.personality && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Personality</h4>
                  <p className="text-sm text-gray-600">{contact.personality}</p>
                </div>
              )}
              {contact.notes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Notes</h4>
                  <p className="text-sm text-gray-600">{contact.notes}</p>
                </div>
              )}
            </div>
          )}

          <div className="actions-container flex items-center justify-between">
            <button
              onClick={handleSendMessage}
              className="send-btn flex-grow py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              data-component-name="NotificationCard"
            >
              Send on whatsapp
            </button>
            <button
              onClick={handleMarkAsSent}
              className="mark-sent-btn ml-2 p-2 bg-gray-100 rounded-full hover:bg-gray-200"
              disabled={isMessageSent}
              data-component-name="NotificationCard"
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
function generateMessage(contact, forceRandom = false) {
  if (!contact) return "Hello there!";
  
  const today = new Date();
  const isBirthday = contact.birthday && new Date(contact.birthday).getDate() === today.getDate() && 
                     new Date(contact.birthday).getMonth() === today.getMonth();
  const isAnniversary = contact.anniversary && new Date(contact.anniversary).getDate() === today.getDate() && 
                        new Date(contact.anniversary).getMonth() === today.getMonth();
  
  // Birthday message templates
  const birthdayMessages = [
    `Happy birthday, ${contact.name}! 🎉 Wishing you a day filled with joy and celebration!`,
    `Happy birthday to you, ${contact.name}! 🎂 May this special day bring you all the happiness you deserve!`,
    `It's your special day, ${contact.name}! 🎈 Wishing you a fantastic birthday filled with wonderful moments!`,
    `Happy birthday, ${contact.name}! 🥳 Sending you warm wishes for an amazing day and a prosperous year ahead!`,
    `Many happy returns of the day, ${contact.name}! 🎁 Hope your birthday is as wonderful as you are!`
  ];
  
  // Anniversary message templates
  const anniversaryMessages = [
    `Happy anniversary, ${contact.name}! 🥂 Congratulations on this special milestone!`,
    `Wishing you a happy anniversary, ${contact.name}! 💍 May your bond grow stronger with each passing year!`,
    `Happy anniversary! 🎊 Celebrating your special day with you, ${contact.name}!`,
    `Congratulations on your anniversary, ${contact.name}! 💐 Wishing you many more years of happiness together!`,
    `Happy anniversary! 🎉 May your journey together continue to be filled with love and joy, ${contact.name}!`
  ];
  
  // Regular check-in message templates
  const regularMessages = [
    `Hi ${contact.name}! 👋 Just checking in to see how you're doing. Hope everything is going well!`,
    `Hello ${contact.name}! 😊 How have you been lately? Would love to catch up sometime!`,
    `Hey ${contact.name}! 🌟 It's been a while since we last spoke. How's life treating you?`,
    `Hi there, ${contact.name}! 🙂 Just wanted to say hello and see how you're doing!`,
    `Hey ${contact.name}! 💭 You crossed my mind today. Hope you're having a great time!`,
    `Hello ${contact.name}! 🌈 Just reaching out to say hi and check how you've been!`,
    `Hi ${contact.name}! 📱 Let's catch up soon! How has your week been going?`,
    `Hey there ${contact.name}! 🌻 Just wanted to send some positive vibes your way today!`,
    `Hello ${contact.name}! 🤗 Missing our conversations! How have you been?`,
    `Hi ${contact.name}! 🌞 Hope this message finds you well! What's new with you?`
  ];
  
  if (isBirthday && !forceRandom) {
    const age = today.getFullYear() - new Date(contact.birthday).getFullYear();
    const randomIndex = Math.floor(Math.random() * birthdayMessages.length);
    return `${birthdayMessages[randomIndex]} Enjoy your ${age}th birthday!`;
  } else if (isAnniversary && !forceRandom) {
    const years = today.getFullYear() - new Date(contact.anniversary).getFullYear();
    const randomIndex = Math.floor(Math.random() * anniversaryMessages.length);
    return `${anniversaryMessages[randomIndex]} Celebrating ${years} wonderful years!`;
  } else {
    // If forceRandom is true or it's not a special occasion, select a random message
    // We'll mix in birthday and anniversary messages too when forcing random
    let allMessages = [...regularMessages];
    if (forceRandom) {
      allMessages = [...regularMessages, ...birthdayMessages, ...anniversaryMessages];
    }
    const randomIndex = Math.floor(Math.random() * allMessages.length);
    return allMessages[randomIndex];
  }
}
