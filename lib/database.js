'use strict';

// ** Libraries
const extend = require('extend');
const cassandra = require('cassandra-driver');
const logger = require('./logger');
const errors = require('./errors');

class Client {
    constructor(config) {
        // ** Create a new database client to use for this collection
        this.client = new cassandra.Client({
            contactPoints: [config.host],
            keyspace: config.keyspace
        });
    }

    /**
     * Fetch a vine from the database
     * @param id
     * @param callback
     */
    get(collection, id, callback) {
        const query = 'SELECT data FROM ' + collection + ' WHERE ID=?';

        logger.debug('GET:', {collection: collection, id: id});

        this.client.execute(query, [id], {prepare: true}, (err, result) => {
            if (err) return callback(errors('CASSANDRA_ERROR', err));

            // TODO: Transform results rows into JSON object
            if (result.rows.length === 0)
                return callback(); // RETURN: Undefined for NOT_FOUND

            // ** PARSE JSON data and return
            logger.debug('CASSANDRA_RESPONSE:', result);
            const data = JSON.parse(result.rows[0].data);
            callback(null, data);
        });
    }

    /**
     * Store data for a vine in the database
     * @param id
     * @param data
     * @param callback
     */
    set(collection, id, data, callback) {
        // ** Data to store
        const value = JSON.stringify(data);

        logger.debug('SET:', {collection: collection, id: id, data: value});

        this.client.execute(
            'INSERT INTO ' + collection + ' (id, data) VALUES (?, ?)',
            [id, value],
            {prepare: true},
            callback
        );
    }

    /**
     * Checks if an entry exists in a named collection
     * @param collection
     * @param id
     * @param callback
     */
    exists(collection, id, callback) {
        logger.debug('EXISTS:', {collection: collection, id: id});

        this.client.execute(
            'SELECT count(id) as count FROM ' + collection + ' WHERE id = ?',
            [id],
            {prepare: true},
            (err, result) => {
                if (err) return callback(errors('HAS_ERROR', err));

                const exists = result.rows[0].count > 0;
                logger.debug('EXISTS:', exists, {id: id});
                callback(null, exists);
            }
        );
    }
}

function createClient(config) {
    logger.debug('DATABASE_CONFIG:', config);
    return new Client(config);
}

module.exports = createClient;
module.exports.createClient = createClient;
module.exports.Client = Client;