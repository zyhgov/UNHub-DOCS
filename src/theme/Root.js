// src/theme/Root.js
import React from 'react';
import AnnouncementModal from '../components/AnnouncementModal';

export default function Root({ children }) {
  return (
    <>
      {children}
      <AnnouncementModal />
    </>
  );
}