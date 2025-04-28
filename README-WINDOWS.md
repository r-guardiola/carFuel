# Configuração do CarFuel para Windows

Este guia fornece instruções para configurar e executar o aplicativo CarFuel em um ambiente Windows, sem usar o WSL (Windows Subsystem for Linux).

## Pré-requisitos

1. **Node.js e npm**: [Baixe e instale a versão LTS](https://nodejs.org/)
2. **Android Studio**: [Baixe e instale](https://developer.android.com/studio)
   - Durante a instalação, certifique-se de marcar a opção para instalar o Android SDK
   - Instale pelo menos o Android SDK Platform 30 (Android 11)

## Configuração do Ambiente

### 1. Configure o ANDROID_HOME

O ANDROID_HOME é normalmente localizado em:
```
C:\Users\SEU_USUARIO\AppData\Local\Android\Sdk
```

Os scripts fornecidos neste projeto configuram esta variável automaticamente.

### 2. Ferramentas Auxiliares

Este projeto inclui dois arquivos para ajudar na configuração:

- **setup-windows.bat**: Script batch para verificar e configurar o ambiente
- **dev-tools.ps1**: Script PowerShell com ferramentas úteis para desenvolvimento

## Executando o Aplicativo

### Método 1: Usando npm

1. Conecte um dispositivo Android via USB (com Depuração USB ativada) ou inicie um emulador
2. No terminal PowerShell, execute:
   ```
   npm run android
   ```

### Método 2: Usando o Script de Ferramentas (Recomendado)

1. Abra o PowerShell como administrador
2. Navegue até o diretório do projeto
3. Execute o script de ferramentas:
   ```
   .\dev-tools.ps1
   ```
4. Use o menu interativo para:
   - Iniciar o aplicativo (modo desenvolvimento ou produção)
   - Limpar cache
   - Listar dispositivos Android conectados
   - Iniciar um emulador Android
   - Verificar a configuração do ambiente

## Solução de Problemas

### O aplicativo não inicia

Verifique se:
- Você tem um dispositivo Android conectado ou um emulador em execução
- O dispositivo está no modo de depuração USB (se for um dispositivo físico)
- O Android SDK está instalado corretamente

Execute a opção 6 no script de ferramentas para verificar a configuração do ambiente.

### Erros ADB

Se encontrar erros relacionados ao ADB:
1. Feche todas as instâncias do Android Studio
2. Execute no PowerShell:
   ```
   "%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" kill-server
   "%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" start-server
   ```

### Problemas com caminhos do Windows

Se encontrar erros relacionados a caminhos:
- Verifique se não há caracteres especiais no caminho do seu projeto
- Evite espaços no caminho do projeto
- Use um caminho curto (próximo à raiz do disco)

## Manutenção

Para manter seu ambiente em bom funcionamento:

1. Mantenha o Android Studio atualizado
2. Atualize regularmente as dependências npm:
   ```
   npm update
   ```
3. Periodicamente, limpe o cache:
   ```
   npm run clear
   ```

## Recursos Adicionais

- [Documentação do Expo](https://docs.expo.dev/)
- [Documentação do React Native](https://reactnative.dev/docs/environment-setup)
- [Guia de Depuração do Android](https://developer.android.com/studio/debug) 