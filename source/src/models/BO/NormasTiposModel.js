    var connection = require("../../services/conexion-mariadb");
const { guardarLog } = require('../../helpers/logs');
const { paginarQuery } = require("../../helpers/paginacion");

async function crearNormaTipo(request) {
    let sql = "INSERT INTO bo_normas_tipos (normaTipo, normaTipoSigla) VALUES (?,?);";
    params = [request.normaTipo, request.siglaNormaTipo];
    let conn = await connection.poolPromise.getConnection().catch(e => { throw e });
    try {
        await conn.beginTransaction().catch(e => { throw e });
        await conn.query(sql, params)
            .catch((error) => {
                throw error
            })
        await guardarLog(conn, sql, params, request)
            .catch((error) => {
                throw error
            })

        await conn.commit();
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        if (conn) conn.close();
    }
}
async function editarNormaTipo(request) {
    let sql = "UPDATE bo_normas_tipos SET normaTipo=?, normaTipoSigla=?, BO=?, SDIN=?, DJ=? WHERE idNormaTipo=?;";

    params = [request.normaTipo, request.siglaNormaTipo, request.bo, request.sdin, request.dj, request.idNormaTipo];
    let conn = await connection.poolPromise.getConnection().catch(e => { throw e });
    try {
        await conn.beginTransaction().catch(e => { throw e });
        await conn.query(sql, params)
            .catch((error) => {
                throw error
            })
        await guardarLog(conn, sql, params, request)
            .catch((error) => {
                throw error
            })

        await conn.commit();
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        if (conn) conn.close();
    }
}

async function borrarNormaTipo(request) {
    sql = `UPDATE bo_normas_tipos SET estado=4, fechaBorrado=CURRENT_TIMESTAMP WHERE idNormaTipo=?;`;
    params = [request.idNormaTipo];
    let conn = await connection.poolPromise.getConnection().catch(e => { throw e });
    try {
        await conn.beginTransaction().catch(e => { throw e });
        await conn.query(sql, params)
            .catch((error) => {
                throw error
            })
        await guardarLog(conn, sql, params, request)
            .catch((error) => {
                throw error
            })

        await conn.commit();
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        if (conn) conn.close();
    }
}
function traerNormaTipoPorId(request) {
    return new Promise((resolve, reject) => {
        sql = "SELECT * FROM bo_normas_tipos WHERE idNormaTipo = ?;";
        params = [request.idNormaTipo];
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
    });
}

function traerNormasTipos() {
    return new Promise((resolve, reject) => {
        sql = "SELECT idNormaTipo, normaTipoSigla, normaTipo FROM bo_normas_tipos WHERE estado = 1;";

        connection.pool.getConnection(function (err, conn) {
            if (err) throw err; // not connected!

            // Use the connection
            conn.query(sql, function (error, results, fields) {
                conn.release();
                if (err) {
                    reject(err);
                }
                resolve(results);

                // Handle error after the release.
                if (error) throw error;
            });
        });
    });
}
function existeNormaTipoEnPINPorSigla(sigla) {
    return new Promise((resolve, reject) => {

        sql = "SELECT * FROM bo_normas_tipos WHERE normaTipoSigla = ? AND estado = 1";
        params = [sigla];

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
function existeNormaTipoEnPINPorId(id) {
    return new Promise((resolve, reject) => {

        sql = "SELECT * FROM bo_normas_tipos WHERE idNormaTipo = ? AND estado = 1";
        params = [id];

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


function traerTodosNormaTipos(request) {
    return new Promise(async (resolve, reject) => {
        let sql = `SELECT nt.*,
        (SELECT COUNT(ntt.idNormaTipo) FROM bo_normas_tipos ntt WHERE ntt.estado = 1) AS totalTipos
        FROM bo_normas_tipos nt WHERE nt.estado=1
        ORDER BY nt.normaTipo`;

        let res = {}
        let conn = await connection.poolPromise.getConnection()
        .catch(error => { throw error });
        try {
            res.tipos = await conn.query(paginarQuery(request, sql))
            .catch(error => { throw error });
            res.totalTipos = res.tipos[res.tipos.length - 1]['totalTipos']
        } catch (error) {
            await conn.rollback();
            reject(error)
        } finally {
            conn.release()
        }
        resolve(res);
        });
}

module.exports = {
    crearNormaTipo,
    borrarNormaTipo,
    traerNormaTipoPorId,
    traerNormasTipos,
    existeNormaTipoEnPINPorSigla,
    existeNormaTipoEnPINPorId,
    editarNormaTipo,
    traerTodosNormaTipos
};