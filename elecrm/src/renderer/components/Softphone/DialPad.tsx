import React from "react";

// Dial-pad letters used for display under numeric keys
const dialPadLetters: Record<string, string> = {
  "1": "",
  "2": "ABC",
  "3": "DEF",
  "4": "GHI",
  "5": "JKL",
  "6": "MNO",
  "7": "PQRS",
  "8": "TUV",
  "9": "WXYZ",
  "0": "+",
  "*": "",
  "#": "",
};

interface DialPadProps {
  onDigitPress: (digit: string) => void;
  disabled?: boolean;
  showLetters?: boolean;
}

const DialPad: React.FC<DialPadProps> = ({
  onDigitPress,
  disabled = false,
  showLetters = true,
}) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      {["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"].map(
        (digit) => (
          <button
            key={digit}
            className="text-2xl font-extrabold bg-inherit text-primaryText p-2 rounded-md hover:bg-sidebarButtonHoverBg flex flex-col items-center justify-start cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => onDigitPress(digit)}
            disabled={disabled}
          >
            <span>{digit}</span>
            {showLetters && (
              <span className="text-sm text-gray-500">
                {dialPadLetters[digit]}
              </span>
            )}
          </button>
        )
      )}
    </div>
  );
};

export default DialPad;
