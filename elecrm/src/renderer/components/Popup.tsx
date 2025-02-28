import React from 'react';

interface PopupProps {
  message: string;
  onClose: () => void;
}

const Popup: React.FC<PopupProps> = ({ message, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded shadow-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Notification</h2>
        <p>{message}</p>
        <button 
          className="mt-4 bg-title-button-bg text-title-button-color hover:bg-title-button-hover-bg rounded px-4 py-2"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default Popup;