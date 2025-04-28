#!/bin/bash

# Set environment variables
export ANDROID_HOME=/home/guardiola/Android/Sdk
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64

# Navigate to the project's android directory
cd android

# Clean the project
./gradlew clean

# Build the APK
./gradlew app:assembleRelease -x :expo:makeReleaseVariant -x :expo-application:androidSourcesJar -x verifyReleaseResources

# Check if the build succeeded
if [ $? -eq 0 ]; then
  echo "Build successful!"
  echo "APK should be located at: android/app/build/outputs/apk/release/app-release.apk"
else
  echo "Build failed. Please check the error messages above."
fi 