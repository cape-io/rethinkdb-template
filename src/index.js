import { isObject, map } from 'lodash';

// Step 4.
// Create index if it's missing.
function createIndex({r, db, table, dbIndexes, index, value}) {
  return {
    index,
    value: isObject(value) ? value : '[function]',
    result: r.branch(
      dbIndexes.contains(index),
      true,
      r.db(db).table(table).indexCreate(index, value)
    ),
  };
}

// Step 3.
// Create table if it's missing.
function createTable({r, dbTables, db, table, indexes, options}) {
  const tableCreateOptions = {
    primaryKey: 'id',
    ...options,
  };

  function processIndexes(dbIndexes) {
    return map(indexes, info => createIndex({r, db, table, dbIndexes, ...info}));
  }
  return r({
    table,
    result: r.branch(
      dbTables.contains(table), true, r.db(db).tableCreate(table, tableCreateOptions)
    ),
  }).merge({
    indexes: indexes ? r.db(db).table(table).indexList().do(processIndexes) : null,
    options: tableCreateOptions,
  });
}

// Step 2.
// Create table if it's missing.
function createDb({r, dbs, db, tables}) {
  function processTables(dbTables) {
    return map(tables, info => createTable({r, db, dbTables, ...info}));
  }
  return r({
    db,
    result: r.branch(dbs.contains(db), true, r.dbCreate(db)),
  }).merge({
    tables: r.db(db).tableList().do(processTables),
  });
}

// Step 1.
// Get list of databases and send to Step 2.
// template is an array of objects that descibe databases.
function checkTemplate({r, template}) {
  function processDbs(dbs) {
    // Take our input db info and send off for processing.
    return map(template, info => createDb({r, dbs, ...info}));
  }
  // Get list of databases from RethinkDB.
  return r.dbList().do(processDbs);
}

export default checkTemplate;
