import React from "react";

interface DeviceSelectorProps {
  devices: MediaDeviceInfo[];
  currentDevice: string | null;
  onDeviceChange: (deviceId: string) => void;
  icon: React.ReactNode;
  label: string;
  className?: string;
}

const DeviceSelector: React.FC<DeviceSelectorProps> = ({
  devices,
  currentDevice,
  onDeviceChange,
  icon,
  label,
  className = "",
}) => {
  return (
    <div className={`h-1/2 p-2 bg-altContentBg text-primaryText rounded flex items-center ${className}`}>
      <div className="h-7 w-7 mr-2">
        {icon}
      </div>
      {devices.length > 0 ? (
        <select
          className="bg-inherit border-none outline-none flex-1"
          value={currentDevice || ""}
          onChange={(e) => onDeviceChange(e.target.value)}
        >
          {devices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `${label} (${device.deviceId})`}
            </option>
          ))}
        </select>
      ) : (
        <p>No {label}s Found</p>
      )}
    </div>
  );
};

export default DeviceSelector;
