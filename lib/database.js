exports.getOrCreateCollection = function(client, dbLink, id, callback) {
    //we're using queryCollections here and not readCollection
    //readCollection will throw an exception if resource is not found
    //queryCollections will not, it will return empty resultset.

    //the collection we create here just uses default IndexPolicy, default OfferType.
    //for more on IndexPolicy refer to the IndexManagement samples
    //for more on OfferTye refer to CollectionManagement samples

    var querySpec = {
        query: 'SELECT * FROM root r WHERE r.id=@id',
        parameters: [
            {
                name: '@id',
                value: id
            }
        ]
    };

    client.queryCollections(dbLink, querySpec).toArray(function (err, results) {
        if (err) {
            handleError(err);

        //collection not found, create it
        } else if (results.length === 0) {
            var collDef = { id: id };

            client.createCollection(dbLink, collDef, function (err, created) {
                if (err) {
                    handleError(err);

                } else {
                    callback(created);
                }
            });

        //collection found, return it
        } else {
            callback(results[0]);
        }
    });
}

exports.getOrCreateDatabase = function (client, id, callback) {
    //we're using queryDatabases here and not readDatabase
    //readDatabase will throw an exception if resource is not found
    //queryDatabases will not, it will return empty resultset.

    var querySpec = {
        query: 'SELECT * FROM root r WHERE r.id=@id',
        parameters: [
            {
                name: '@id',
                value: id
            }
        ]
    };

    client.queryDatabases(querySpec).toArray(function (err, results) {
        if (err) {
            handleError(err);

        //database not found, create it
        } else if (results.length === 0) {
            var databaseDef = { id: id };

            client.createDatabase(databaseDef, function (err, created) {
                if (err) {
                    handleError(err);

                } else {
                    callback(created);
                }
            });

        //database found, return it
        } else {
            callback(results[0]);
        }
    });
}

function handleError(error) {
    console.log('\nAn error with code \'' + error.code + '\' has occurred:');
    console.log('\t' + JSON.parse(error.body).message);

    finish();
}
