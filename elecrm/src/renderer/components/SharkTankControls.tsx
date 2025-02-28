import React from 'react';
import RefreshButton from './RefreshButton';
import DialSelectedButton from './DialSelectedButton';
import DialListButton from './DialListButton';

interface SharkTankControlsProps {
  onRefresh: () => void;
  onDialSelected: () => void;
  onDialList: () => void;
}

const SharkTankControls: React.FC<SharkTankControlsProps> = ({ onRefresh, onDialSelected, onDialList }) => {
  return (
    <div className="flex space-x-.1 mb-1">
      <RefreshButton onClick={onRefresh} />
      <DialSelectedButton onClick={onDialSelected} />
      <DialListButton onClick={onDialList} />
    </div>
  );
};

export default SharkTankControls;
