import React, { useState, useEffect } from "react";
import { useSignalWire } from "../context/SignalWireContext";
import { PhoneIcon, ArrowLeftIcon } from "@heroicons/react/24/solid";
import {
  MicrophoneIcon,
  SpeakerWaveIcon,
  BellAlertIcon,
} from "@heroicons/react/24/outline";
import { formatPhoneNumber } from "../utils";
import DialPad from "./Softphone/DialPad";
import PhoneNumberInput from "./Softphone/PhoneNumberInput";
import CallControls from "./Softphone/CallControls";
import DeviceSelector from "./Softphone/DeviceSelector";
import WarmTransferDialog from "./Softphone/WarmTransferDialog";

export const Dialer: React.FC = () => {
  const {
    dialNumber,
    connectToConferenceRoom,
    endCall,
    callState,
    isLoading,
    mute,
    unmute,
    currentMicrophone,
    currentOutputDevice,
    currentRingDevice,
    availableMicrophones,
    availableSpeakers,
    applyMicrophone,
    applySpeaker,
    applyRingDevice,
    disconnectFromConference,
    holdCall,
    resumeCall,
    sendDTMF,
  } = useSignalWire();

  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [message, setMessage] = useState<{ type: string; text: string } | null>(
    null
  );
  const [isValidNumber, setIsValidNumber] = useState<boolean>(true);
  const [showKeypad, setShowKeypad] = useState(false);
  const [showWarmTransfer, setShowWarmTransfer] = useState(false);

  // Debug logging for conference connection state
  useEffect(() => {
    console.log("Conference Connection Debug:", {
      isLoading,
      conferenceSessionStatus: callState.conferenceSession?.status,
      conferenceSessionActive: callState.conferenceSession?.isActive,
    });
  }, [isLoading, callState.conferenceSession]);

  const activeStatusArray = ["ringing", "connected", "in-progress"];
  const isCallActive =
    !!callState.activeCall &&
    callState.activeCall.status &&
    activeStatusArray.includes(callState.activeCall.status);

  // On active call connect, or when call ends, update the displayed phoneNumber
  useEffect(() => {
    if (callState.activeCall?.status === "connected") {
      const displayNumber = callState.activeCall.connectedNumber;
      if (displayNumber) {
        setPhoneNumber(formatPhoneNumber(displayNumber.replace(/^\+1/, "")));
      }
    } else if (!callState.activeCall) {
      setPhoneNumber("");
    }
  }, [callState.activeCall]);

  const validatePhoneNumber = (number: string) => {
    const cleaned = number.replace(/[^0-9]/g, "");
    return cleaned.length === 10;
  };

  const handlePhoneNumberChange = (value: string) => {
    setPhoneNumber(value);
    setIsValidNumber(validatePhoneNumber(value.replace(/\D/g, "")));
    setMessage(null);
  };

  const handleDigitPress = (digit: string) => {
    if (callState?.activeCall?.status === "connected") {
      sendDTMF(digit);
    } else {
      const newValue = phoneNumber + digit;
      handlePhoneNumberChange(formatPhoneNumber(newValue));
    }
  };

  const handleClear = () => {
    setPhoneNumber("");
    setMessage(null);
    setIsValidNumber(true);
  };

  const handleDial = async () => {
    const rawNumber = phoneNumber.replace(/\D/g, "");
    if (rawNumber.length === 10 && isValidNumber) {
      setMessage(null);
      try {
        await dialNumber(rawNumber);
      } catch (error) {
        setMessage({
          type: "error",
          text: "Failed to place call. Please try again.",
        });
      }
    } else {
      setMessage({
        type: "error",
        text: "Please enter a valid phone number in (XXX) XXX-XXXX format.",
      });
    }
  };

  const handleHoldToggle = async () => {
    if (callState.activeCall?.isOnHold) {
      await resumeCall();
    } else {
      await holdCall();
    }
  };

  const handleMuteToggle = async () => {
    if (callState.activeCall?.isMuted) {
      await unmute();
    } else {
      await mute();
    }
  };

  const handleConnectToConference = async () => {
    await connectToConferenceRoom();
  };

  const handleDisconnectFromConference = async () => {
    await disconnectFromConference();
  };

  // Keyboard shortcuts for dialer
  const handleKeyPress = (event: KeyboardEvent) => {
    const dialerInput = document.querySelector('input[name="phone"]');
    if (document.activeElement === dialerInput) {
      const validKeys = [
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "*",
        "#",
      ];

      if (validKeys.includes(event.key)) {
        event.preventDefault();
        handleDigitPress(event.key);
      } else if (event.key === "Enter") {
        event.preventDefault();
        handleDial();
      } else if (event.key === "Backspace") {
        event.preventDefault();
        setPhoneNumber((prev) => {
          const newVal = prev.slice(0, -1);
          setIsValidNumber(validatePhoneNumber(newVal.replace(/\D/g, "")));
          return newVal;
        });
      } else if (event.key === "Escape") {
        handleClear();
      }
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress as any);
    return () => {
      window.removeEventListener("keydown", handleKeyPress as any);
    };
  }, [phoneNumber]);

  return (
    <div className="max-w-sm mx-auto">
      {/* Feedback Messages */}
      {message && (
        <div
          className={`p-2 mb-4 rounded ${
            message.type === "success"
              ? "bg-green-200 text-green-800"
              : "bg-red-200 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Phone Number Input */}
      <PhoneNumberInput
        value={phoneNumber}
        onChange={handlePhoneNumberChange}
        isValid={isValidNumber}
        disabled={isLoading || callState.activeCall?.status === "connected"}
      />

      {/* Dial Pad & Action Buttons */}
      {!isCallActive && (
        <>
          <DialPad
            onDigitPress={handleDigitPress}
            disabled={callState.activeCall?.status === "connected"}
          />

          {/* Dial / Clear */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="flex-1 m-1"></div>
            <button
              className="flex-1 bg-green-500 text-primaryText p-2 m-1 rounded-l hover:bg-green-600 flex items-center justify-center cursor-pointer disabled:bg-slate-400 disabled:cursor-not-allowed focus:outline-none"
              onClick={handleDial}
              disabled={
                (isLoading && callState.activeCall?.status !== "connecting") ||
                !isValidNumber ||
                !callState.conferenceSession?.isActive
              }
            >
              <div className="flex items-center justify-center">
                {isLoading && callState.activeCall?.status !== "connecting" ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Dialing...
                  </>
                ) : (
                  <PhoneIcon className="h-8 w-8" />
                )}
              </div>
            </button>
            <button
              className="flex-1 text-primaryText p-2 m-1 rounded-r hover:bg-accent3 flex items-center justify-center focus:outline-none"
              onClick={handleClear}
            >
              <ArrowLeftIcon className="h-6 w-6 stroke-white" />
            </button>
          </div>
        </>
      )}

      <hr className="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />

      {/* Conference Room Actions */}
      {!callState.conferenceSession?.isActive ? (
        <div className="flex mt-4 flex-col">
          <button
            className="flex-1 bg-sky-800 text-primaryText p-2 m-1 rounded hover:bg-sky-700 disabled:bg-slate-400 disabled:cursor-not-allowed"
            onClick={() => handleConnectToConference()}
            disabled={isLoading || callState.conferenceSession?.isActive}
          >
            {isLoading &&
            callState.conferenceSession?.isActive &&
            callState.conferenceSession?.status === "connecting"
              ? "Connecting..."
              : "Connect to Conference"}
          </button>
        </div>
      ) : (
        <div className="flex mt-4 flex-col">
          <button
            className="flex-1 bg-red-600 text-primaryText p-2 m-1 rounded hover:bg-red-700 disabled:bg-slate-400 disabled:cursor-not-allowed"
            onClick={() => handleDisconnectFromConference()}
            disabled={isLoading}
          >
            {isLoading &&
            callState.conferenceSession?.status === "disconnecting"
              ? "Disconnecting..."
              : "Disconnect from Conference"}
          </button>
        </div>
      )}

      {/* Call Status & Controls */}
      {isCallActive && (
        <div className="mt-4 p-2 bg-altContentBg text-primaryText rounded">
          {callState.activeCall?.status === "ringing" && (
            <p>Dialing... {callState.activeCall.connectedNumber}</p>
          )}
          {callState.activeCall?.status === "connected" && (
            <>
              <p>Connected to: {callState.activeCall.connectedNumber}</p>
              <p>Call Duration: {callState.activeCall.callDuration}</p>
            </>
          )}

          <CallControls
            onMute={handleMuteToggle}
            onHold={handleHoldToggle}
            onHangup={endCall}
            onWarmTransfer={() => setShowWarmTransfer(true)}
            isMuted={!!callState.activeCall?.isMuted}
            isOnHold={!!callState.activeCall?.isOnHold}
            isTransferEnabled={true}
          />

          {/* Toggle Keypad for DTMF */}
          <button
            className="mt-4 bg-gray-500 text-primaryText p-2 rounded hover:bg-gray-700"
            onClick={() => setShowKeypad(!showKeypad)}
          >
            Toggle Keypad
          </button>
          {showKeypad && (
            <div className="mt-4">
              <DialPad onDigitPress={handleDigitPress} />
            </div>
          )}
        </div>
      )}

      {/* Device Selection */}
      <DeviceSelector
        devices={availableMicrophones}
        currentDevice={currentMicrophone}
        onDeviceChange={applyMicrophone}
        icon={<MicrophoneIcon className="h-7 w-7" />}
        label="Mic"
        className="mt-4"
      />

      <DeviceSelector
        devices={availableSpeakers}
        currentDevice={currentOutputDevice}
        onDeviceChange={applySpeaker}
        icon={<SpeakerWaveIcon className="h-7 w-7" />}
        label="Speaker"
        className="mt-4"
      />

      <DeviceSelector
        devices={availableSpeakers}
        currentDevice={currentRingDevice}
        onDeviceChange={applyRingDevice}
        icon={<BellAlertIcon className="h-7 w-7" />}
        label="RingOut"
        className="mt-4"
      />

      {/* Warm Transfer Dialog */}
      {showWarmTransfer && (
        <WarmTransferDialog
          isOpen={showWarmTransfer}
          onClose={() => setShowWarmTransfer(false)}
        />
      )}
    </div>
  );
};
