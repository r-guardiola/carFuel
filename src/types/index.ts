export * from './abastecimento';
export * from './configuracao';

// Tipos para SQLite
export interface SQLiteTransaction {
  executeSql: (
    sqlStatement: string,
    args?: any[],
    callback?: (transaction: SQLiteTransaction, resultSet: SQLiteResultSet) => void,
    errorCallback?: (transaction: SQLiteTransaction, error: Error) => boolean | void
  ) => void;
}

export interface SQLiteResultSet {
  insertId?: number;
  rowsAffected: number;
  rows: {
    length: number;
    item: (idx: number) => any;
    _array: any[];
  };
} 