var config = require('./config');
var db_init = require('./lib/database');
var DocumentClient = require('documentdb').DocumentClient;
var fs = require('fs');

var airports = JSON.parse(fs.readFileSync('airports.geojson', 'utf8'));
var database = config.db_name;
var collection = config.collection_name;
var host = config.host;
var masterKey = config.primary_key;
var client = new DocumentClient(host, {masterKey: masterKey});

/**
 * Create airports collection if it doesn't already exist
 * Then begin saving airports to docdb
 */
function init() {
  // Get or create db
  db_init.getOrCreateDatabase(client, database, function(db) {
    // Get or create collection
    db_init.getOrCreateCollection(client, db._self, collection, function(col) {
      // Loop through airports and save one by one.
      main(col, airports.features).then(function() {
        return process.exit();
      });
    });
  });
}

// Start here!
init();

/**
 * Save airports one after another to documentdb
 * @param{string} collection - documentdb collection object
 * @param{string} list - list of airport json objects
 * @return{Promise} Fulfilled when documents are saved.
 */
function main(collection, list) {
  return new Promise(function(resolve, reject) {
    require('bluebird').map(list, function(airport, i) {
      return save_airport(collection, airport, i);
    }, {concurrency: 2}).then(function() {
      resolve();
    });
  });
}

/**
 * Save airport documentdb
 * @param{string} collection - documentdb collection object
 * @param{string} airport - airport json object
 * @param{string} count - simple counter
 * @return{Promise} Fulfilled when documents are saved.
 */
function save_airport(collection, airport, count) {
  return new Promise(function(resolve, reject) {
    client.createDocument(collection._self, airport, function(err, document) {
      if (err) return console.log(err);
      console.log(document.properties.country_code, document.properties.iata_code);
      console.log(count, 'Created:', document.geometry.coordinates, document.properties.iata_code, document.properties.name);
      setTimeout(function() {
        resolve();
      }, config.wait_time);
    });
  });
}
