const fs = require('fs');
const path = require('path');

try {
  // Read the app.json file
  const appJsonPath = path.join(__dirname, '..', 'app.json');
  const appJson = require(appJsonPath);

  // Get the current build number
  const currentBuildNumber = parseInt(appJson.expo.ios.buildNumber, 10);
  
  if (isNaN(currentBuildNumber)) {
    console.error('Error: Current build number is not a valid number');
    process.exit(1);
  }

  // Increment the iOS build number
  const newBuildNumber = (currentBuildNumber + 1).toString();
  appJson.expo.ios.buildNumber = newBuildNumber;

  // Write the updated app.json file
  fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n');

  console.log(`Successfully incremented iOS build number from ${currentBuildNumber} to ${newBuildNumber}`);
} catch (error) {
  console.error('Error incrementing build number:', error.message);
  process.exit(1);
} 