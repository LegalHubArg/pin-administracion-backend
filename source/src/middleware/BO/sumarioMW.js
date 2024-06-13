//Alta SUBTIPO: no debe existir en BD
async function checkAltaSubtipo(req, res, next) {
    let idSumarioItem = req.body.idSumarioItem;
    let idSubtipoNorma = req.body.idSubtipoNorma;
    
    await existeSubtipo(idSumarioItem,idSubtipoNorma)
    .then(results => {
        if (results[0].existeSubtipo === 1) { res.status(409).end("Subtipo existente") }
        else {
            next()
        }
    })
    .catch(err => { throw new Error(err) })
}

//Eliminar SUBTIPO: chequear que exista en BD
async function checkEliminarSubtipo(req, res, next) {
    let idSumarioItem = req.body.idSumarioItem;
    let idSubtipoNorma = req.body.idSubtipoNorma;

    await existeSubtipo(idSumarioItem, idSubtipoNorma)
        .then(results => {
            if (results[0].existeSubtipo === 0) { res.status(409).end("Subtipo no existente") }
            else {
                next()
            }
        })
        .catch(err => { throw new Error(err) })
}

function existeSubtipo(idSumarioItem, idSubtipoNorma) {
    return new Promise((resolve, reject) => {

        sql = "SELECT EXISTS(SELECT * FROM bo_sumario_items_subtipos WHERE idSumarioItem=? AND idSubtipoNorma=?) AS existeSubtipo;";
        params = [idSumarioItem, idSubtipoNorma];

        connection.pool.getConnection(function (err, conn) {
            if (err) throw err; // not connected!

            // Use the connection
            conn.query(sql, params, function (error, results, fields) {
                conn.release();
                if (err) {
                    reject(err);
                }
                resolve(results);

                // Handle error after the release.
                if (error) throw error;
            });
        });
    })
}

//Alta REPA: no debe existir en BD
async function checkAltaReparticion(req, res, next) {
    let idSumarioItem = req.body.idSumarioItem;
    let idReparticion = req.body.idReparticion;
    
    await existeSubtipo(idSumarioItem,idReparticion)
    .then(results => {
        if (results[0].existeReparticion === 1) { res.status(409).end("Reparticion existente") }
        else {
            next()
        }
    })
    .catch(err => { throw new Error(err) })
}

//Eliminar REPA: chequear que exista en BD
async function checkEliminarReparticion(req, res, next) {
    let idSumarioItem = req.body.idSumarioItem;
    let idReparticion = req.body.idReparticion;

    await existeReparticion(idSumarioItem, idReparticion)
        .then(results => {
            if (results[0].existeReparticion === 0) { res.status(409).end("Reparticion no existente") }
            else {
                next()
            }
        })
        .catch(err => { throw new Error(err) })
}

function existeReparticion(idSumarioItem, idReparticion) {
    return new Promise((resolve, reject) => {

        sql = "SELECT EXISTS(SELECT * FROM bo_sumario_items_reparticiones WHERE idSumarioItem=? AND idReparticion=?) AS existeReparticion;";
        params = [idSumarioItem, idReparticion];

        connection.pool.getConnection(function (err, conn) {
            if (err) throw err; // not connected!

            // Use the connection
            conn.query(sql, params, function (error, results, fields) {
                conn.release();
                if (err) {
                    reject(err);
                }
                resolve(results);

                // Handle error after the release.
                if (error) throw error;
            });
        });
    })
}

module.exports = { checkAltaSubtipo, checkEliminarSubtipo, checkEliminarReparticion, checkAltaReparticion };