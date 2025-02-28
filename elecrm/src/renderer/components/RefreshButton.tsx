import React from 'react';
import Popup from './Popup';

interface RefreshButtonProps {
  onClick: () => void;
}

const buttonClassName = "relative inline-flex items-center justify-center p-0.5 mb-1 me-1 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-cyan-400 to-blue-600 group-hover:from-cyan-400 group-hover:to-blue-600 hover:text-white focus:ring-4 focus:outline-none focus:ring-cyan-200";
const spanClassName = "relative px-4 py-2 transition-all ease-in duration-75 bg-white rounded-md group-hover:bg-opacity-0";

const RefreshButton: React.FC<RefreshButtonProps> = ({ onClick }) => {
  const [showPopup, setShowPopup] = React.useState(false);

  const handleClick = () => {
    setShowPopup(true);
    onClick();
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  return (
    <div>
      <button
        className={buttonClassName}
        onClick={handleClick}
      >
        <span className={spanClassName}>
          Refresh
        </span>
      </button>
      {showPopup && <Popup message="Needs To Be Finished" onClose={closePopup} />}
    </div>
  );
};

export default RefreshButton;
