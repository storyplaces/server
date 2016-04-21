/**
 * Created by kep1u13 on 21/04/2016.
 */

"use strict";

module.exports = logErrors;

function logErrors(err, req, res, next) {
    console.error(err.stack);

    if (req.xhr) {
        res.status(500).send({error: 'Something failed!'});
    } else {
        res.status(500).render('error', {error: err});
    }
}