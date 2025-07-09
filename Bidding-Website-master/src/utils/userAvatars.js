// User avatar constants for the application
// These are placeholder avatar images used throughout the app

export const User1 = "https://cdn-icons-png.flaticon.com/128/6997/6997662.png";
export const User2 = "https://cdn-icons-png.flaticon.com/128/236/236832.png";

// Additional user avatars for future use
export const User3 = "https://cdn-icons-png.flaticon.com/128/3135/3135715.png";
export const User4 = "https://cdn-icons-png.flaticon.com/128/3135/3135768.png";
export const User5 = "https://cdn-icons-png.flaticon.com/128/3135/3135789.png";

// Default avatar for when no user image is available
export const DefaultAvatar = "https://cdn-icons-png.flaticon.com/128/3135/3135715.png";

// Function to get a random avatar
export const getRandomAvatar = () => {
  const avatars = [User1, User2, User3, User4, User5];
  return avatars[Math.floor(Math.random() * avatars.length)];
};

// Function to get avatar by user ID (deterministic)
export const getAvatarByUserId = (userId) => {
  const avatars = [User1, User2, User3, User4, User5];
  const index = userId ? parseInt(userId.toString().slice(-1)) % avatars.length : 0;
  return avatars[index];
};
