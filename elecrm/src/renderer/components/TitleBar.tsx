import React from 'react';
import ThemeSwitcher from './ThemeSwitcher';
import '../styles/TitleBar.css';

const TitleBar = () => {
  return (
    <div className="title-bar flex justify-between items-center px-8 bg-title-bar-bg text-title-text-color">
      <div className="title"></div>
      <div className="title-bar-buttons">
        <ThemeSwitcher />
      </div>
    </div>
  );
};

export default TitleBar;
