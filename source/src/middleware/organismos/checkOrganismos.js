const connection = require("../../services/conexion-mariadb");

async function checkJerarquiaPIN(req, res, next) {

    let repa = parseInt(req.body.idOrgJerarquia);
    await checkJerarquia(repa)
        .then(results => {
            // console.log(results)
            if (results.length === 0) { 
                res.status(409)
                res.send(JSON.stringify({ status : 'bloqueado', mensaje: 'PIN: La repartición no existe en PIN.', error: 'Petición no permitida.' }))
                res.end();
            }
            else {
                req.reparticion = results[0];
                next()
            }
        })
        .catch(err => { throw new Error(err) })

}

async function checkPermisoJerarquiaPIN(req, res, next) {

    let repa = parseInt(req.body.idOrgJerarquia);
    await checkJerarquia(repa)
        .then(results => {
            // console.log(results)
            if (results.length === 0) { 
                res.status(409)
                res.send(JSON.stringify({ status : 'bloqueado', mensaje: 'PIN: La repartición no existe en PIN.', error: 'Petición no permitida.' }))
                res.end();
            }
            else {
                next()
            }
        })
        .catch(err => { throw new Error(err) })

}
async function checkPermisoJerarquiaPINAlta(req, res, next) {

    let repa = parseInt(req.body.idOrgJerarquia);
    await checkPermisoJerarquia(repa)
        .then(results => {
            // console.log(results)
            if (results.length === 0) { 
                next()
            }
            else {
                res.status(409)
                res.send(JSON.stringify({ status : 'bloqueado', mensaje: 'PIN: La reparticion (' + req.reparticion.reparticion + ') ya tiene permisos asignados.', error: 'Petición no permitida.' }))
                res.end();
            }
        })
        .catch(err => { throw new Error(err) })

}

async function existeRepa(req, res, next) {

    await traerRepa(req.body.reparticion, req.body.siglaReparticion)
        .then(results => {
            // console.log(results)
            if (results.length === 0) { 
                next()
            }
            else {
                res.status(409)
                res.send(JSON.stringify({ status : 'bloqueado', mensaje: 'PIN: Ya existe una repartición con el mismo nombre y/o sigla ingresado.', error: 'Petición no permitida.' }))
                res.end();
            }
        })
        .catch(err => { throw new Error(err) })

}

function checkJerarquia(repa) {
    return new Promise((resolve, reject) => {

        sql = `SELECT a.idOrgJerarquia, b.idReparticion, b.reparticion, c.idReparticion as idReparticionOrganismo, c.reparticion as organismo 
        FROM org_jerarquia a
        LEFT OUTER JOIN bo_reparticiones b ON a.idReparticionHijo = b.idReparticion
        LEFT OUTER JOIN bo_reparticiones c ON a.idReparticionPadre = c.idReparticion
        WHERE
        a.idOrgJerarquia = ?
        AND a.estado = 1
        LIMIT 1`;
        params = [repa];

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

function checkPermisoJerarquia(repa) {
    return new Promise((resolve, reject) => {

        sql = `SELECT * 
        FROM bo_permisos_carga_reparticiones
        WHERE 
        idOrgJerarquia = ?
        AND estado = 1
        LIMIT 1`;
        params = [repa];

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

function traerRepa(repa, sigla) {
    return new Promise((resolve, reject) => {

        sql = `SELECT * FROM bo_reparticiones WHERE (reparticion=? OR siglaReparticion=?) AND estado=1`;
        params = [repa, sigla];

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

module.exports = { checkJerarquiaPIN, checkPermisoJerarquiaPIN, checkPermisoJerarquiaPINAlta, existeRepa};