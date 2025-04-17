# CarFuel - Controle de Combustível para Veículos

Aplicativo para controle de consumo de combustível de veículo, projetado especificamente para execução em central multimídia veicular com Android 11 (1280x720).

## Recursos Principais

- Configuração inicial com tipo de combustível fixo
- Registro de abastecimentos com data pré-preenchida
- Cálculo automático de consumo médio
- Histórico de abastecimentos
- Estatísticas de consumo e gastos
- Armazenamento local em SQLite
- Interface otimizada para centrais veiculares

## Tecnologias Utilizadas

- React Native / Expo
- TypeScript
- SQLite para armazenamento local
- React Navigation para navegação
- React Native Paper para componentes de UI
- Zustand para gerenciamento de estado
- Date-fns para manipulação de datas

## Recursos da Interface

- Checkboxes para:
  - Tanque cheio
  - Checagem de calibragem
  - Checagem de óleo
  - Uso de aditivo
- Cálculo automático entre litros e valor total
- Registro de quilometragem atual
- Cálculo de distância percorrida

## Estrutura do Projeto

```
carFuel/
├── src/
│   ├── components/
│   │   ├── common/         # Componentes reutilizáveis
│   │   ├── abastecimento/  # Componentes para formulário de abastecimento
│   │   └── estatisticas/   # Componentes para visualização de estatísticas
│   ├── screens/            # Telas do aplicativo
│   ├── hooks/              # Hooks personalizados
│   ├── services/           # Serviços para acesso ao banco de dados
│   ├── navigation/         # Configuração de navegação
│   ├── database/           # Configuração do SQLite
│   ├── utils/              # Utilitários
│   ├── theme/              # Configurações de tema
│   └── types/              # Definições de tipos TypeScript
├── assets/                 # Arquivos estáticos
├── App.tsx                 # Ponto de entrada do aplicativo
└── package.json
```

## Instalação

```bash
# Instalar dependências
npm install

# Iniciar em modo de desenvolvimento
npm start

# Executar em um dispositivo Android
npm run android
```

## Telas

1. **Configuração Inicial**: Configuração do veículo e tipo de combustível
2. **Home**: Dashboard com resumo de dados e acesso às principais funcionalidades
3. **Novo Abastecimento**: Formulário para registrar abastecimentos
4. **Histórico**: Lista de todos os abastecimentos
5. **Estatísticas**: Gráficos e estatísticas de consumo

## Uso

1. Na primeira execução, configure os dados do veículo e o tipo de combustível
2. Use a tela principal para visualizar dados importantes e acessar funcionalidades
3. Registre abastecimentos preenchendo os dados solicitados
4. Acompanhe estatísticas e histórico para monitorar consumo e gastos

## Especificações Técnicas

- **Resolução alvo**: 1280x720
- **Sistema operacional**: Android 11
- **Banco de dados**: SQLite local
- **Tipo de combustível**: Fixado na configuração inicial 