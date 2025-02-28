import React from "react";
import {
  PhoneXMarkIcon,
  ArrowPathIcon,
  ArrowsRightLeftIcon,
} from "@heroicons/react/24/solid";
import {
  MicrophoneIcon,
  SpeakerWaveIcon,
} from "@heroicons/react/24/outline";

interface CallControlsProps {
  onMute: () => void;
  onHold: () => void;
  onHangup: () => void;
  onWarmTransfer?: () => void;
  isMuted: boolean;
  isOnHold: boolean;
  isTransferEnabled?: boolean;
  className?: string;
}

const CallControls: React.FC<CallControlsProps> = ({
  onMute,
  onHold,
  onHangup,
  onWarmTransfer,
  isMuted,
  isOnHold,
  isTransferEnabled = false,
  className = "",
}) => {
  return (
    <div className={`grid grid-cols-2 gap-2 mt-2 ${className}`}>
      <button
        className={`${
          isMuted ? "bg-gray-500" : "bg-blue-500"
        } text-primaryText p-2 rounded hover:bg-blue-700 flex items-center justify-center`}
        onClick={onMute}
      >
        <MicrophoneIcon className="h-5 w-5 mr-2" />
        {isMuted ? "Unmute" : "Mute"}
      </button>
      
      <button
        className="bg-red-600 text-primaryText p-2 rounded hover:bg-red-700 flex items-center justify-center"
        onClick={onHangup}
      >
        <PhoneXMarkIcon className="h-5 w-5 mr-2" />
        Hang Up
      </button>
      
      <button
        className={`${
          isOnHold ? "bg-gray-500" : "bg-yellow-600"
        } text-primaryText p-2 rounded hover:bg-yellow-500 flex items-center justify-center`}
        onClick={onHold}
      >
        <ArrowPathIcon className="h-5 w-5 mr-2" />
        {isOnHold ? "Resume" : "Hold"}
      </button>

      {isTransferEnabled && onWarmTransfer && (
        <button
          className="bg-green-600 text-primaryText p-2 rounded hover:bg-green-700 flex items-center justify-center"
          onClick={onWarmTransfer}
        >
          <ArrowsRightLeftIcon className="h-5 w-5 mr-2" />
          Transfer
        </button>
      )}
    </div>
  );
};

export default CallControls;
