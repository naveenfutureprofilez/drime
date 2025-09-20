import React from 'react';

export const PlusIcon = ({ className = "" }) => {
  return (
    <div className={`relative ${className}`}  >
     <svg width="93" height="93" viewBox="0 0 93 93" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M46.1691 30.2452V63.009" stroke="#08CF65" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M62.5674 46.6272H29.7698" stroke="#08CF65" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M1.54187 46.6272C1.54187 13.1592 12.7011 2 46.1691 2C79.6371 2 90.7961 13.1592 90.7961 46.6272C90.7961 80.0952 79.6371 91.2542 46.1691 91.2542C12.7011 91.2542 1.54187 80.0952 1.54187 46.6272Z" stroke="#08CF65" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>

    </div>
  );
};

export default PlusIcon;