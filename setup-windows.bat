@echo off
echo Configurando ambiente para desenvolvimento React Native no Windows
echo.

:: Verifique se o Android SDK está presente
if not exist "%LOCALAPPDATA%\Android\Sdk" (
  echo [ERRO] Android SDK não encontrado em %LOCALAPPDATA%\Android\Sdk
  echo Por favor, instale o Android Studio e configure o SDK
  exit /b 1
)

:: Configurar variáveis de ambiente
set ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk
echo [INFO] ANDROID_HOME configurado como: %ANDROID_HOME%

:: Verificar ADB
if exist "%ANDROID_HOME%\platform-tools\adb.exe" (
  echo [INFO] ADB encontrado em %ANDROID_HOME%\platform-tools\adb.exe
) else (
  echo [ERRO] ADB não encontrado. Verifique sua instalação do Android SDK
  exit /b 1
)

:: Verificar emuladores disponíveis
echo.
echo Dispositivos Android conectados:
"%ANDROID_HOME%\platform-tools\adb.exe" devices

echo.
echo Emuladores disponíveis:
"%ANDROID_HOME%\emulator\emulator.exe" -list-avds

echo.
echo Configuração concluída!
echo Para iniciar o aplicativo, execute:
echo npm run android

pause 