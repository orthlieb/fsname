var _ = require('underscore');

function processError(res, err) {
    console.log(err.message);
    res.status(500);
    res.json({ message: err.message });
}

var attributes = [ "name", "meaning", "scripture" ];

var names = {

    getAll: function(req, res) {
        var db = app.get("db");
        try {
            var query = "SELECT * FROM names ";
            if (req.query._filters) {
                // Create a WHERE clause if there are any filters
                try {
                    var filters = JSON.parse(req.query._filters);
                    var attributes = [ "name", "meaning", "scripture" ];
                    var where = "";
                    filters = _.pick(filters, attributes);
                    for (key in filters)
                        where += key + " ILIKE '%" + filters[key] + "%' AND ";
                    if (where)
                        query += "WHERE " + where.slice(0, where.indexOf("AND "));   // Lop off the last AND
                } catch (err) {
                    processError(res, err);
                    return;
                }
            }
            if (req.query._sortField && req.query._sortDir) {
                // Create ORDER BY clause if the sortField or sortDirection is specified
                query += req.query._sortField ? "ORDER BY " + req.query._sortField + " " : "";
                query += req.query._sortDir ? req.query._sortDir + " " : "";
            }
            if (req.query._perPage && req.query._page) {
                // Create OFFSET and LIMIT clauses if the perPage and page is specified
                query += "OFFSET " + ((req.query._page - 1) * req.query._perPage) + " LIMIT " + req.query._perPage;
            }
            query += ";";
            db.run(query, function(err, names) {
                if (err) return processError(res, err);
                res.status(200);
                res.json(_.isArray(names) ? names : [ names ]);
            });
        } catch (e) {
            processError(res, e);
        }
    },

    getOne: function(req, res) {
        var db = app.get("db");
        try {
            db.names.findOne({ id: req.params.id }, function(err, name) {
                if (err) return processError(res, err);
                res.status(200);
                res.json(name);
            });
        } catch (e) {
            processError(res, e);
        }
    },

    create: function(req, res) {
        var db = app.get("db");
        try {
            var attributes = [ "name", "meaning", "scripture" ];
            var name = _.pick(req.body, attributes);
            if (_.keys(name).length != attributes.length) { // Need all
                res.status(400);
                res.json({ "message": "Missing one or more required attributes for name record: " + attributes });
                return;
            }

            db.names.save(name, function(err, names) {
                if (err) return processError(res, err);
                res.status(201); // Created
                res.json(_.isArray(names) ? names : [ names ]);
            });
        } catch (e) {
            processError(res, e);
        }
    },

    update: function(req, res) {
        var db = app.get("db");
        try {
            var attributes = [ "id", "name", "meaning", "scripture" ];
            var name = _.pick(req.body, attributes);
            name.id = name.id ? name.id : req.params.id;
            name.modificationdate = new Date();
            db.names.update(name, function(err, names) {
                if (err) return processError(res, err);
                res.status(200); // Created
                res.json(_.isArray(names) ? names : [ names ]);
            });
        } catch (e) {
            processError(res, e);
        }
    },

    delete: function(req, res) {
        var db = app.get("db");
        try {
            db.names.destroy({ id: req.params.id }, function(err, name) {
                if (err) return processError(res, err);
                res.status(200); // Deleted
                res.json(name);
            });
        } catch (e) {
            processError(res, e);
        }
    }
};

module.exports = names;
