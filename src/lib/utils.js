import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export const generateMessage = (contact, type = "birthday") => {
  const messages = {
    birthday: [
      `Happy Birthday, ${contact.name}! 🎂 Wishing you a fantastic day filled with joy and celebration. Your ${contact.personality} personality always brings light to those around you. Hope your day is as wonderful as you are!`,
      `Happy Birthday to the amazing ${contact.name}! 🎉 Your ${contact.personality} spirit is truly inspiring. Wishing you a year ahead filled with success in your ${contact.career} and everything you pursue!`,
      `It's your special day, ${contact.name}! 🎈 Your ${contact.personality} approach to life makes you unique. May your birthday bring you as much happiness as you bring to others. Continued success in your ${contact.career}!`
    ],
    anniversary: [
      `Happy Anniversary, ${contact.name}! 💍 Celebrating another year of your beautiful journey together. Your ${contact.personality} nature makes your relationship special. Wishing you both many more years of happiness!`,
      `Congratulations on your anniversary, ${contact.name}! 💑 Your ${contact.personality} approach to relationships is truly admirable. Here's to many more wonderful years together!`,
      `Happy Anniversary! 🥂 ${contact.name}, your ${contact.personality} spirit makes your partnership thrive. Wishing you both continued love and happiness in this beautiful journey!`
    ],
    random: [
      `Hey ${contact.name}! 👋 Just wanted to check in and see how you're doing. Your ${contact.personality} energy is always refreshing. How's everything going in your ${contact.career}?`,
      `Hi ${contact.name}! 😊 Been thinking about you and wanted to say hello. Your ${contact.personality} perspective is always valued. How are things in the world of ${contact.career}?`,
      `Hello ${contact.name}! 🌟 Just reaching out to connect. Your ${contact.personality} approach to life is inspiring. Any exciting updates in your ${contact.career} journey?`
    ]
  };

  const messageType = type in messages ? type : "random";
  const randomIndex = Math.floor(Math.random() * messages[messageType].length);
  
  return messages[messageType][randomIndex];
};
