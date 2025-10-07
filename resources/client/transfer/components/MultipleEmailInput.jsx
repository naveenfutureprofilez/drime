import React, { useState, useRef, useEffect } from 'react';

export function MultipleEmailInput({ 
  emails = [], 
  onChange, 
  placeholder = "Enter email addresses...",
  className = "",
  maxHeight = "120px"
}) {
  const [inputValue, setInputValue] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Email validation regex
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  // Handle adding email
  const addEmail = (email) => {
    const trimmedEmail = email.trim().toLowerCase();
    
    if (!trimmedEmail) return;
    
    if (!isValidEmail(trimmedEmail)) {
      // Could add error handling here
      return;
    }
    
    if (emails.includes(trimmedEmail)) {
      // Email already exists, don't add duplicate
      return;
    }
    
    const newEmails = [...emails, trimmedEmail];
    onChange(newEmails);
    setInputValue('');
  };

  // Handle removing email
  const removeEmail = (emailToRemove) => {
    const newEmails = emails.filter(email => email !== emailToRemove);
    onChange(newEmails);
  };

  // Handle input key events
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ';') {
      e.preventDefault();
      addEmail(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && emails.length > 0) {
      // Remove last email if backspace is pressed on empty input
      removeEmail(emails[emails.length - 1]);
    }
  };

  // Handle input blur
  const handleBlur = () => {
    setIsInputFocused(false);
    if (inputValue.trim()) {
      addEmail(inputValue);
    }
  };

  // Handle container click to focus input
  const handleContainerClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Auto-scroll to bottom when new emails are added
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [emails]);

  return (
    <div 
      className={`relative w-full max-w-[100%] border border-gray-300 rounded-lg bg-white cursor-text transition-colors duration-200 ${
        isInputFocused ? 'border-[#08CF65] ring-1 ring-[#08CF65]' : 'hover:border-gray-400'
      } ${className}`}
      onClick={handleContainerClick}
    >
      <div 
        ref={containerRef}
        className="flex gap-2  p-2 overflow-auto"
        style={{ minHeight: "48px", maxHeight: maxHeight }}
      >
        {/* Email tags */}
        {emails.map((email, index) => (
          <div
            key={index}
            className="inline-flex items-center bg-[#E9ECEF] text-gray-800 px-[12px] py-[6px] rounded-full text-[14px] font-medium  hover:bg-gray-200 transition-colors duration-150 whitespace-nowrap"
          >
            <span className="mr-2">{email}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeEmail(email);
              }}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
             <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9.165 0C4.09675 0 0 4.09675 0 9.165C0 14.2332 4.09675 18.33 9.165 18.33C14.2332 18.33 18.33 14.2332 18.33 9.165C18.33 4.09675 14.2332 0 9.165 0ZM13.7475 12.4552L12.4552 13.7475L9.165 10.4573L5.87476 13.7475L4.5825 12.4552L7.87274 9.165L4.5825 5.87476L5.87476 4.5825L9.165 7.87274L12.4552 4.5825L13.7475 5.87476L10.4573 9.165L13.7475 12.4552Z" fill="#A3A5A7"/>
</svg>

 
            </button>
          </div>
        ))}
        
        {/* Input field */}
        <input
          ref={inputRef}
          type="email"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsInputFocused(true)}
          onBlur={handleBlur}
          placeholder={emails.length === 0 ? placeholder : ""}
          className="flex-grow min-w-[200px] outline-none bg-transparent text-gray-900 placeholder-gray-500"
          autoComplete="email"
        />
      </div>
      
      {/* Helper text */}
      {isInputFocused && (
        <div className="absolute top-full left-0 right-0 mt-1 text-xs text-gray-500 bg-white border border-gray-200 rounded px-2 py-1 shadow-sm z-10">
          Press Enter, comma, or semicolon to add email
        </div>
      )}
    </div>
  );
}