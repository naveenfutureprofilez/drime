import React from 'react';

/**
 * Test component to expose Tailwind CSS issues
 * This component uses a wide variety of Tailwind utilities to identify which ones fail
 */
export function TailwindDebugTest() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <h1 className="text-4xl font-bold text-white text-center mb-12">
          Tailwind CSS Debug Test - HMR Test
        </h1>

        {/* Typography Tests */}
        <section className="bg-white rounded-lg shadow-xl p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Typography Tests</h2>
          <div className="space-y-2">
            <p className="text-xs text-gray-500">Extra small text</p>
            <p className="text-sm text-gray-600">Small text</p>
            <p className="text-base text-gray-700">Base text</p>
            <p className="text-lg text-gray-800">Large text</p>
            <p className="text-xl text-gray-900">Extra large text</p>
            <p className="text-2xl font-light">2XL Light</p>
            <p className="text-3xl font-medium">3XL Medium</p>
            <p className="text-4xl font-bold">4XL Bold</p>
          </div>
        </section>

        {/* Color Tests */}
        <section className="bg-white rounded-lg shadow-xl p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Color Tests</h2>
          <div className="grid grid-cols-6 gap-4">
            <div className="h-20 bg-red-500 rounded flex items-center justify-center text-white">Red</div>
            <div className="h-20 bg-blue-500 rounded flex items-center justify-center text-white">Blue</div>
            <div className="h-20 bg-green-500 rounded flex items-center justify-center text-white">Green</div>
            <div className="h-20 bg-yellow-500 rounded flex items-center justify-center text-black">Yellow</div>
            <div className="h-20 bg-purple-500 rounded flex items-center justify-center text-white">Purple</div>
            <div className="h-20 bg-pink-500 rounded flex items-center justify-center text-white">Pink</div>
          </div>
        </section>

        {/* Custom Colors from Tailwind Config */}
        <section className="bg-white rounded-lg shadow-xl p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Custom Colors from Config</h2>
          <div className="grid grid-cols-4 gap-4">
            <div className="h-20 bg-primary rounded flex items-center justify-center text-on-primary">Primary</div>
            <div className="h-20 bg-danger rounded flex items-center justify-center text-white">Danger</div>
            <div className="h-20 bg-positive rounded flex items-center justify-center text-white">Positive</div>
            <div className="h-20 bg-background rounded flex items-center justify-center text-main border border-divider">Background</div>
          </div>
        </section>

        {/* Spacing Tests */}
        <section className="bg-white rounded-lg shadow-xl p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Spacing Tests</h2>
          <div className="space-y-4">
            <div className="bg-blue-100 p-1">Padding 1 (0.063rem)</div>
            <div className="bg-blue-200 p-2">Padding 2 (0.125rem)</div>
            <div className="bg-blue-300 p-4">Padding 4 (0.25rem)</div>
            <div className="bg-blue-400 p-8">Padding 8 (0.5rem)</div>
            <div className="bg-blue-500 p-16 text-white">Padding 16 (1rem)</div>
            <div className="bg-blue-600 p-32 text-white">Padding 32 (2rem)</div>
          </div>
        </section>

        {/* Layout Tests */}
        <section className="bg-white rounded-lg shadow-xl p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Layout Tests</h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-green-200 p-4 rounded">Grid Item 1</div>
            <div className="bg-green-300 p-4 rounded">Grid Item 2</div>
            <div className="bg-green-400 p-4 rounded text-white">Grid Item 3</div>
          </div>
          <div className="flex justify-between items-center bg-gray-100 p-4 rounded">
            <div className="bg-yellow-300 p-2 rounded">Flex Start</div>
            <div className="bg-yellow-400 p-2 rounded">Flex Center</div>
            <div className="bg-yellow-500 p-2 rounded text-white">Flex End</div>
          </div>
        </section>

        {/* Custom Spacing from Config */}
        <section className="bg-white rounded-lg shadow-xl p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Custom Spacing</h2>
          <div className="space-y-4">
            <div className="bg-purple-100 p-50">Custom P-50 (3.125rem)</div>
            <div className="bg-purple-200 p-96">Custom P-96 (6rem)</div>
            <div className="bg-purple-300 p-128">Custom P-128 (8rem)</div>
          </div>
        </section>

        {/* Border Radius Tests */}
        <section className="bg-white rounded-lg shadow-xl p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Border Radius Tests</h2>
          <div className="grid grid-cols-4 gap-4">
            <div className="h-16 bg-orange-300 rounded-button flex items-center justify-center">Button Radius</div>
            <div className="h-16 bg-orange-400 rounded-input flex items-center justify-center">Input Radius</div>
            <div className="h-16 bg-orange-500 rounded-panel flex items-center justify-center text-white">Panel Radius</div>
            <div className="h-16 bg-orange-600 rounded-full flex items-center justify-center text-white">Full</div>
          </div>
        </section>

        {/* Text Colors from Config */}
        <section className="bg-white rounded-lg shadow-xl p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Text Color Tests</h2>
          <div className="space-y-2">
            <p className="text-main">Main text color</p>
            <p className="text-muted">Muted text color</p>
            <p className="text-disabled">Disabled text color</p>
            <p className="text-primary">Primary text color</p>
            <p className="text-danger">Danger text color</p>
            <p className="text-positive">Positive text color</p>
          </div>
        </section>

        {/* Icon Size Tests */}
        <section className="bg-white rounded-lg shadow-xl p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Icon Size Tests</h2>
          <div className="flex items-center space-x-4">
            <div className="icon-2xs bg-gray-300 rounded flex items-center justify-center">2XS</div>
            <div className="icon-xs bg-gray-400 rounded flex items-center justify-center">XS</div>
            <div className="icon-sm bg-gray-500 rounded flex items-center justify-center text-white">SM</div>
            <div className="icon-md bg-gray-600 rounded flex items-center justify-center text-white">MD</div>
            <div className="icon-lg bg-gray-700 rounded flex items-center justify-center text-white">LG</div>
            <div className="icon-xl bg-gray-800 rounded flex items-center justify-center text-white">XL</div>
          </div>
        </section>

        {/* Responsive Tests */}
        <section className="bg-white rounded-lg shadow-xl p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Responsive Tests</h2>
          <div className="bg-red-300 p-4 md:bg-blue-300 lg:bg-green-300 xl:bg-yellow-300 rounded">
            <p className="text-center">
              Red (mobile), Blue (md+), Green (lg+), Yellow (xl+)
            </p>
          </div>
        </section>

        {/* Dark Mode Test */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Dark Mode Test</h2>
          <p className="text-gray-600 dark:text-gray-300">
            This text should change color in dark mode
          </p>
        </section>

        {/* Shadow Tests */}
        <section className="bg-white rounded-lg shadow-xl p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Shadow Tests</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-4 shadow-sm rounded">Shadow SM</div>
            <div className="bg-white p-4 shadow-md rounded">Shadow MD</div>
            <div className="bg-white p-4 shadow-lg rounded">Shadow LG</div>
          </div>
        </section>

        {/* HMR Test Section */}
        <section className="bg-emerald-50 border-2 border-emerald-300 rounded-xl p-8">
          <h2 className="text-3xl font-bold text-emerald-800 mb-6">HMR & JIT Test Section</h2>
          <p className="text-emerald-700 bg-emerald-100 p-4 rounded-lg shadow-inner">
            This section was added to test Hot Module Replacement with new Tailwind classes.
            If you can see these emerald colors, HMR is working correctly!
            Last updated: 4:30 PM
          </p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-emerald-400 to-teal-500 p-4 rounded-lg text-white font-semibold">
              New gradient classes
            </div>
            <div className="bg-emerald-500 hover:bg-emerald-600 transition-all duration-300 p-4 rounded-lg text-white font-semibold cursor-pointer">
              Hover effect test
            </div>
          </div>
        </section>

        {/* Potential Problem Areas */}
        <section className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-red-800 mb-4">Potential Problem Areas</h2>
          <div className="space-y-4">
            <div className="bg-[#ff0000] p-4 text-white rounded">Arbitrary value (should be red)</div>
            <div className="w-1/2 bg-blue-200 p-4 rounded">Fractional width (should be 50%)</div>
            <div className="aspect-video bg-green-200 rounded flex items-center justify-center">
              Aspect ratio (should be 16:9)
            </div>
            <div className="backdrop-blur-sm bg-black/20 p-4 text-white rounded">
              Backdrop blur and opacity
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
