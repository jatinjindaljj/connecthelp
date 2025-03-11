# ConnectHelp - Stay Connected with Your Loved Ones

ConnectHelp is a React application designed to help you stay connected with your acquaintances by sending them beautifully crafted messages on birthdays, anniversaries, and occasionally on topics related to their profession, personality, and interests.

## Features

- **Contact Management**: Add, edit, and delete contact details including name, birthday, anniversary, personality traits, and career information
- **Dashboard**: View today's birthdays, anniversaries, and a random contact suggestion
- **Message Generation**: Automatically generate personalized messages based on contact details with a refresh option
- **WhatsApp Integration**: Send messages directly via WhatsApp with a single click
- **Import/Export**: Save and load your contacts using JSON files

## Technologies Used

- **React**: Frontend library for building the user interface
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Shadcn UI**: Component library built on top of Tailwind CSS
- **date-fns**: Modern JavaScript date utility library
- **Lucide React**: Beautiful & consistent icon set

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```
4. Open your browser and navigate to the URL shown in the terminal

## Usage

1. **Adding Contacts**: Click on the "Add Contact" tab and fill in the contact details
2. **Viewing Contacts**: Navigate to the "Contacts" tab to see all your saved contacts
3. **Dashboard**: The dashboard shows today's birthdays and anniversaries, making it easy to see who to connect with today
4. **Sending Messages**: Each contact card has a message box with a pre-generated message that you can customize, refresh, or send via WhatsApp

## Data Storage

All contact data is stored in your browser's local storage, ensuring your data remains private and accessible even after closing the browser.

## License

This project is open source and available under the MIT License.
