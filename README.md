# rethinkdb-template

Ensure RethinkDB contains databases, tables, and indexes defined in template.

Something like this:

```
var r = require('rethinkdbdash')();
var applyDbTemplate = require('rethinkdb-template');

var template = [
  {
    db: 'demo',
    tables: [
      {
        table: 'user',
        indexes: [
          {
            index: 'ids',
            value: {
              multi: true,
            },
          },
        ],
      },
      {
        table: 'provider',
        options: {
          primaryKey: '_id',
        },
      },
    ],
  },
];

rethinkQuery = applyDbTemplate({template: template, r: r});
rethinkQuery.run().then(...);

```
