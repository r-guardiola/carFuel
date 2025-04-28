// Declaração de módulo para o expo-sqlite
declare module 'expo-sqlite/legacy' {
  export interface SQLResultSet {
    insertId?: number;
    rowsAffected: number;
    rows: {
      length: number;
      item: (idx: number) => any;
      _array: any[];
    };
  }

  export interface SQLError {
    code: number;
    message: string;
  }

  export interface SQLTransaction {
    executeSql: (
      sqlStatement: string,
      args?: any[],
      callback?: (transaction: SQLTransaction, resultSet: SQLResultSet) => void,
      errorCallback?: (transaction: SQLTransaction, error: SQLError) => boolean | void
    ) => void;
  }

  export interface WebSQLDatabase {
    transaction: (
      callback: (transaction: SQLTransaction) => void,
      errorCallback?: (error: SQLError) => void,
      successCallback?: () => void
    ) => void;
    readTransaction: (
      callback: (transaction: SQLTransaction) => void,
      errorCallback?: (error: SQLError) => void,
      successCallback?: () => void
    ) => void;
    closeAsync: () => Promise<void>;
  }

  export function openDatabase(
    name: string,
    version?: string,
    description?: string,
    size?: number,
    callback?: (db: WebSQLDatabase) => void
  ): WebSQLDatabase;
} 