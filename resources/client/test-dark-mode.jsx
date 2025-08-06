import React from 'react';

// Test component for dark mode and hover state classes
export function TestDarkModeComponent() {
  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Dark Mode & Hover Test Component</h1>
      
      {/* Main test component with the exact classes requested */}
      <div className="dark:bg-black hover:bg-red-500 bg-gray-200 p-8 rounded-lg transition-colors cursor-pointer border border-gray-300">
        <p className="text-gray-800 dark:text-white">
          This component has the exact classes: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">dark:bg-black hover:bg-red-500</code>
        </p>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          • Normal state: gray background<br/>
          • Hover state: red background<br/>
          • Dark mode: black background
        </p>
      </div>

      {/* Additional test variants */}
      <div className="space-y-4">
        <div className="dark:bg-black hover:bg-red-500 p-4 rounded">
          Another test element with the same classes
        </div>
        
        <div className="bg-blue-200 dark:bg-black hover:bg-red-500 p-4 rounded transition-colors">
          Element with different base color but same dark/hover states
        </div>
      </div>

      {/* Dark mode toggle button */}
      <button 
        onClick={toggleDarkMode}
        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
      >
        Toggle Dark Mode
      </button>

      {/* Verification info */}
      <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-700">
        <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">Test Instructions:</h3>
        <ol className="list-decimal list-inside text-sm text-yellow-700 dark:text-yellow-300 mt-2 space-y-1">
          <li>Hover over the test elements to see red background</li>
          <li>Click "Toggle Dark Mode" to enable dark mode</li>
          <li>Verify elements show black background in dark mode</li>
          <li>Test hover states work in both light and dark modes</li>
        </ol>
      </div>
    </div>
  );
}

export default TestDarkModeComponent;
