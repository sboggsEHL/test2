import React, { useState, useEffect } from "react";
import { formatPhoneNumber } from "../../utils";
import DialPad from "./DialPad";
import PhoneNumberInput from "./PhoneNumberInput";
import { useSignalWire } from "../../context/SignalWireContext";
import { WarmTransferStatus } from "../../models/signalwire";

interface WarmTransferDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const WarmTransferDialog: React.FC<WarmTransferDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isValidNumber, setIsValidNumber] = useState(true);
  const [transferStatus, setTransferStatus] = useState<
    "idle" | "transferring" | "consulting" | "completing"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [hasTransferred, setHasTransferred] = useState(false);
  const {
    callState,
    initiateWarmTransfer,
    completeWarmTransfer,
    warmTransferState,
  } = useSignalWire();

  const getTransferStatus = () => {
    if (!warmTransferState.status) return "idle";

    switch (warmTransferState.status) {
      case WarmTransferStatus.Pending:
        return "transferring";
      case WarmTransferStatus.Accepted:
      case WarmTransferStatus.Connected:
        return "consulting";
      case WarmTransferStatus.Disconnected:
      case WarmTransferStatus.Failed:
      case WarmTransferStatus.Declined:
        return "idle";
      default:
        return "idle";
    }
  };

  useEffect(() => {
    if (warmTransferState.status) {
      setTransferStatus(getTransferStatus());
    }
  }, [warmTransferState.status]);

  const validatePhoneNumber = (number: string) => {
    const cleaned = number.replace(/[^0-9]/g, "");
    return cleaned.length === 10;
  };

  const handlePhoneNumberChange = (value: string) => {
    setPhoneNumber(value);
    setIsValidNumber(validatePhoneNumber(value.replace(/\D/g, "")));
  };

  const handleDigitPress = (digit: string) => {
    const newValue = phoneNumber + digit;
    handlePhoneNumberChange(newValue);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape" && !isLoading) {
        if (showConfirmation) {
          setShowConfirmation(false);
          setError(null);
        } else if (transferStatus === "consulting") {
          setShowConfirmation(true);
          setError("Please complete or cancel the transfer before closing.");
        } else {
          onClose();
        }
      } else if (e.key === "Enter") {
        if (
          transferStatus === "consulting" &&
          !showConfirmation &&
          !isLoading
        ) {
          setShowConfirmation(true);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, showConfirmation, transferStatus, onClose]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setPhoneNumber("");
      setIsValidNumber(true);
      setTransferStatus("idle");
      setError(null);
      setShowConfirmation(false);
      setHasTransferred(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-altContentBg p-6 rounded-lg shadow-lg max-w-sm w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-primaryText">
            Warm Transfer
          </h2>
          {transferStatus !== "idle" && (
            <div className="flex items-center">
              <div
                className={`w-2 h-2 rounded-full mr-2 ${
                  transferStatus === "consulting"
                    ? "bg-yellow-400"
                    : transferStatus === "completing"
                    ? "bg-blue-400"
                    : "bg-green-400"
                }`}
              />
              <span className="text-sm text-gray-600">
                {transferStatus === "transferring"
                  ? "Connecting to agent..."
                  : transferStatus === "consulting"
                  ? `Consulting with ${
                      warmTransferState?.targetDisplayName ||
                      formatPhoneNumber(phoneNumber)
                    }`
                  : "Completing transfer..."}
              </span>
            </div>
          )}
        </div>

        <PhoneNumberInput
          disabled={transferStatus !== "idle"}
          value={phoneNumber}
          onChange={handlePhoneNumberChange}
          isValid={isValidNumber}
          placeholder="Enter transfer number"
        />

        <DialPad
          onDigitPress={handleDigitPress}
          disabled={transferStatus !== "idle"}
        />

        {showConfirmation && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded">
            <p className="font-medium">Confirm Transfer</p>
            <p className="text-sm mt-1">
              This will transfer the current caller to{" "}
              {warmTransferState.targetDisplayName ||
                formatPhoneNumber(phoneNumber)}
              . You will return to your original conference.
            </p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-4">
          <button
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            onClick={() => {
              if (isLoading) {
                return;
              }
              if (transferStatus === "consulting") {
                setShowConfirmation(true);
                setError(
                  "Please complete or cancel the transfer before closing."
                );
                return;
              }
              onClose();
            }}
            disabled={isLoading}
          >
            Cancel
          </button>
          {transferStatus === "idle" && (
            <button
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
              disabled={
                !isValidNumber ||
                !phoneNumber ||
                !callState.activeCall ||
                isLoading
              }
              onClick={async () => {
                setError(null);
                setIsLoading(true);
                setTransferStatus("transferring");
                try {
                  await initiateWarmTransfer(phoneNumber);
                  setTransferStatus("consulting");
                } catch (error: any) {
                  console.error("Transfer failed:", error);
                  setError(error.message || "Failed to initiate transfer");
                  setTransferStatus("idle");
                } finally {
                  setIsLoading(false);
                }
              }}
            >
              {isLoading ? "Connecting..." : "Call"}
            </button>
          )}

          {transferStatus === "consulting" && !showConfirmation && (
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
              disabled={isLoading}
              onClick={() => setShowConfirmation(true)}
            >
              Complete Transfer (Enter)
            </button>
          )}

          {showConfirmation && (
            <>
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:bg-gray-400"
                disabled={isLoading}
                onClick={() => {
                  setShowConfirmation(false);
                  setError(null);
                }}
              >
                Cancel Transfer (Esc)
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400"
                disabled={isLoading}
                onClick={async () => {
                  if (hasTransferred) {
                    setError("Transfer has already been completed.");
                    setShowConfirmation(false);
                    return;
                  }

                  if (!callState.activeCall) {
                    setError(
                      "The original call has ended. Transfer cannot be completed."
                    );
                    setShowConfirmation(false);
                    setTransferStatus("idle");
                    return;
                  }

                  setError(null);
                  setIsLoading(true);
                  try {
                    setTransferStatus("completing");
                    await completeWarmTransfer();
                    setHasTransferred(true);
                    onClose();
                  } catch (error: any) {
                    console.error("Complete transfer failed:", error);
                    setError(error.message || "Failed to complete transfer");
                    setTransferStatus("consulting");
                    setShowConfirmation(false);
                    setHasTransferred(false);
                  } finally {
                    setIsLoading(false);
                  }
                }}
              >
                {isLoading ? "Completing..." : "Confirm Transfer"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WarmTransferDialog;
