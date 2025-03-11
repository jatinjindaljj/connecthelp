const ReminderCard = ({ contact, type }) => {
  const getTitle = () => {
    switch (type) {
      case 'birthday':
        return "🎂 Today's Birthday";
      case 'anniversary':
        return "💍 Today's Anniversary";
      default:
        return "👋 Random Contact";
    }
  };

  return (
    <div className="reminder-card bg-white rounded-lg shadow p-4">
      <h3 className="reminder-title text-lg font-medium mb-2">
        {getTitle()}
      </h3>
      <div className="contact-info">
        <p className="contact-name text-base font-semibold">
          {contact.name}
        </p>
        {type === 'birthday' && (
          <p className="birthday-info text-sm text-gray-600">
            Age: {calculateAge(contact.birthday)}
          </p>
        )}
        {type === 'anniversary' && (
          <p className="anniversary-info text-sm text-gray-600">
            Years: {calculateYears(contact.anniversary)}
          </p>
        )}
      </div>
      <div className="actions mt-4 flex justify-end space-x-2">
        <button
          className="send-button px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => sendMessage(contact.phone)}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ReminderCard;
