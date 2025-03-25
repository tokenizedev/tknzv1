import React from 'react';
import { APP_VERSION } from '../config/version';

interface VersionCheckProps {
  updateAvailable: string;
}

export const VersionCheck: React.FC<VersionCheckProps> = ({ updateAvailable }) => {
  return (
    <div className="w-[400px] h-[600px] flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold">New version available</h1>
        <p>Please update to the latest version</p>
        <p>Current version: {APP_VERSION}</p>
        <p>Latest version: {updateAvailable}</p>
        <a 
          href="https://chromewebstore.google.com/detail/eejballiemiamlndhkblapmlmjdgaaoi" 
          className="text-purple-600 hover:text-purple-700 underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Update now
        </a>
      </div>
    </div>
  );
}; 