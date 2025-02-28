import React from 'react';

const SunIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6" // Change these values for different sizes
    style={{ background: 'none' }} // Ensure the background is transparent
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 3v1.5M12 19.5V21M4.219 4.219l1.061 1.061M18.719 18.719l1.061 1.061M3 12h1.5M19.5 12H21M4.219 19.781l1.061-1.061M18.719 5.281l1.061-1.061M12 6.75a5.25 5.25 0 1 0 0 10.5 5.25 5.25 0 0 0 0-10.5z"
    />
  </svg>
);

export default SunIcon;
