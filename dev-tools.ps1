# Script de ferramentas de desenvolvimento para CarFuel
# Execute este script no PowerShell para acessar várias ferramentas de desenvolvimento

function Show-Menu {
    Clear-Host
    Write-Host "=== CarFuel - Ferramentas de Desenvolvimento ===" -ForegroundColor Cyan
    Write-Host
    Write-Host "1: Iniciar aplicativo (modo desenvolvimento)" -ForegroundColor Green
    Write-Host "2: Iniciar aplicativo (modo produção)" -ForegroundColor Green
    Write-Host "3: Limpar cache e iniciar aplicativo" -ForegroundColor Yellow
    Write-Host "4: Listar dispositivos Android conectados" -ForegroundColor Blue
    Write-Host "5: Iniciar emulador Android" -ForegroundColor Blue
    Write-Host "6: Verificar configuração do ambiente" -ForegroundColor Magenta
    Write-Host "7: Sair" -ForegroundColor Red
    Write-Host
}

function Initialize-Environment {
    $env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
    if (-not (Test-Path $env:ANDROID_HOME)) {
        Write-Host "[ERRO] Android SDK não encontrado em $env:ANDROID_HOME" -ForegroundColor Red
        Write-Host "Por favor, instale o Android Studio e configure o SDK" -ForegroundColor Red
        return $false
    }
    return $true
}

function Start-DevApp {
    if (-not (Initialize-Environment)) { return }
    Write-Host "Iniciando aplicativo em modo desenvolvimento..." -ForegroundColor Green
    npm run android-dev
}

function Start-ProdApp {
    if (-not (Initialize-Environment)) { return }
    Write-Host "Iniciando aplicativo em modo produção..." -ForegroundColor Green
    npm run android-prod
}

function Clear-CacheAndStart {
    if (-not (Initialize-Environment)) { return }
    Write-Host "Limpando cache e iniciando aplicativo..." -ForegroundColor Yellow
    npm run clear
    npm run android-dev
}

function Show-AndroidDevices {
    if (-not (Initialize-Environment)) { return }
    Write-Host "Dispositivos Android conectados:" -ForegroundColor Blue
    & "$env:ANDROID_HOME\platform-tools\adb.exe" devices
}

function Start-AndroidEmulator {
    if (-not (Initialize-Environment)) { return }
    
    Write-Host "Emuladores disponíveis:" -ForegroundColor Blue
    $emulators = & "$env:ANDROID_HOME\emulator\emulator.exe" -list-avds
    
    if (-not $emulators) {
        Write-Host "Nenhum emulador encontrado. Por favor, crie um emulador no Android Studio." -ForegroundColor Red
        return
    }
    
    for ($i = 0; $i -lt $emulators.Count; $i++) {
        Write-Host "$($i+1): $($emulators[$i])" -ForegroundColor Cyan
    }
    
    $selection = Read-Host "Selecione o número do emulador para iniciar (ou Enter para cancelar)"
    if (-not $selection) { return }
    
    try {
        $index = [int]$selection - 1
        if ($index -ge 0 -and $index -lt $emulators.Count) {
            $selectedEmulator = $emulators[$index]
            Write-Host "Iniciando emulador: $selectedEmulator" -ForegroundColor Green
            Start-Process -FilePath "$env:ANDROID_HOME\emulator\emulator.exe" -ArgumentList "-avd", $selectedEmulator -NoNewWindow
        }
        else {
            Write-Host "Seleção inválida." -ForegroundColor Red
        }
    }
    catch {
        Write-Host "Entrada inválida. Por favor, insira um número." -ForegroundColor Red
    }
}

function Check-Environment {
    if (-not (Initialize-Environment)) { return }
    
    Write-Host "=== Verificação de Ambiente ===" -ForegroundColor Magenta
    Write-Host "ANDROID_HOME: $env:ANDROID_HOME" -ForegroundColor White
    
    $adbPath = "$env:ANDROID_HOME\platform-tools\adb.exe"
    if (Test-Path $adbPath) {
        Write-Host "ADB: Encontrado" -ForegroundColor Green
    }
    else {
        Write-Host "ADB: Não encontrado" -ForegroundColor Red
    }
    
    $emulatorPath = "$env:ANDROID_HOME\emulator\emulator.exe"
    if (Test-Path $emulatorPath) {
        Write-Host "Emulator: Encontrado" -ForegroundColor Green
    }
    else {
        Write-Host "Emulator: Não encontrado" -ForegroundColor Red
    }
    
    Write-Host "Node.js: $(node -v)" -ForegroundColor White
    Write-Host "npm: $(npm -v)" -ForegroundColor White
    
    Write-Host
    Write-Host "Pressione qualquer tecla para continuar..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

# Loop principal do menu
do {
    Show-Menu
    $selection = Read-Host "Selecione uma opção"
    
    switch ($selection) {
        "1" { Start-DevApp; break }
        "2" { Start-ProdApp; break }
        "3" { Clear-CacheAndStart; break }
        "4" { Show-AndroidDevices; break }
        "5" { Start-AndroidEmulator; break }
        "6" { Check-Environment; break }
        "7" { return }
        default { 
            Write-Host "Opção inválida. Pressione qualquer tecla para continuar..." -ForegroundColor Red
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        }
    }
    
    if ($selection -ne "7" -and $selection -ne "1" -and $selection -ne "2" -and $selection -ne "3") {
        Write-Host
        Write-Host "Pressione qualquer tecla para voltar ao menu..." -ForegroundColor Gray
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    }
} while ($selection -ne "7") 