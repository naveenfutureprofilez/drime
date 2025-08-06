<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tailwind CSS Test</title>
    @vite('resources/client/main.jsx')
</head>
<body>
    <div class="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-8">
        <div class="mx-auto max-w-4xl space-y-8">
            <h1 class="text-4xl font-bold text-white text-center">
                Tailwind CSS Missing Classes Test
            </h1>
            
            <!-- These classes likely won't be styled -->
            <div class="grid grid-cols-6 gap-4">
                <div class="bg-red-500 p-4 text-white">Red</div>
                <div class="bg-blue-500 p-4 text-white">Blue</div>
                <div class="bg-green-500 p-4 text-white">Green</div>
                <div class="bg-yellow-500 p-4 text-black">Yellow</div>
                <div class="bg-purple-500 p-4 text-white">Purple</div>
                <div class="bg-pink-500 p-4 text-white">Pink</div>
            </div>
            
            <!-- Test aspect ratio -->
            <div class="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                Aspect Video (16:9) - May not work
            </div>
            
            <!-- These custom classes should work -->
            <div class="bg-primary text-on-primary p-16 rounded-button">
                Custom Primary Color (should work)
            </div>
            
            <div class="bg-danger text-white p-16 rounded-input">
                Custom Danger Color (should work)
            </div>
        </div>
    </div>
</body>
</html>
