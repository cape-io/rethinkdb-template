'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

// Step 4.
// Create index if it's missing.
function createIndex(_ref) {
  var r = _ref.r;
  var db = _ref.db;
  var table = _ref.table;
  var dbIndexes = _ref.dbIndexes;
  var index = _ref.index;
  var value = _ref.value;

  return {
    index: index,
    value: (0, _lodash.isObject)(value) ? value : '[function]',
    result: r.branch(dbIndexes.contains(index), true, r.db(db).table(table).indexCreate(index, value))
  };
}

// Step 3.
// Create table if it's missing.
function createTable(_ref2) {
  var r = _ref2.r;
  var dbTables = _ref2.dbTables;
  var db = _ref2.db;
  var table = _ref2.table;
  var indexes = _ref2.indexes;

  function processIndexes(dbIndexes) {
    return (0, _lodash.map)(indexes, function (info) {
      return createIndex(_extends({ r: r, db: db, table: table, dbIndexes: dbIndexes }, info));
    });
  }
  return r({
    table: table,
    result: r.branch(dbTables.contains(table), true, r.db(db).tableCreate(table))
  }).merge({
    indexes: r.db(db).table(table).indexList().do(processIndexes)
  });
}

// Step 2.
// Create table if it's missing.
function createDb(_ref3) {
  var r = _ref3.r;
  var dbs = _ref3.dbs;
  var db = _ref3.db;
  var tables = _ref3.tables;

  function processTables(dbTables) {
    return (0, _lodash.map)(tables, function (info) {
      return createTable(_extends({ r: r, db: db, dbTables: dbTables }, info));
    });
  }
  return r({
    db: db,
    result: r.branch(dbs.contains(db), true, r.dbCreate(db))
  }).merge({
    tables: r.db(db).tableList().do(processTables)
  });
}

// Step 1.
// Get list of databases and send to Step 2.
// template is an array of objects that descibe databases.
function checkTemplate(_ref4) {
  var r = _ref4.r;
  var template = _ref4.template;

  function processDbs(dbs) {
    // Take our input db info and send off for processing.
    return (0, _lodash.map)(template, function (info) {
      return createDb(_extends({ r: r, dbs: dbs }, info));
    });
  }
  // Get list of databases from RethinkDB.
  return r.dbList().do(processDbs);
}

exports.default = checkTemplate;