var connection = require("../../services/conexion-mariadb");
const { guardarLog } = require('../../helpers/logs')
const { paginarQuery } = require("../../helpers/paginacion");

async function crearNormaSubtipo(request) {
    let sql = "INSERT INTO bo_normas_subtipos (normaSubtipo, normaSubtipoSigla) VALUES (?,?);";
    params = [request.normaSubtipo, request.siglaNormaSubtipo];
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
async function borrarNormaSubtipo(request) {
    sql = `UPDATE bo_normas_subtipos SET estado=4, fechaBorrado=CURRENT_TIMESTAMP WHERE idNormaSubtipo=?;`;
    params = [request.idNormaSubtipo];
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
function traerNormaSubtipoPorId(request) {
    return new Promise((resolve, reject) => {
        sql = "SELECT * FROM bo_normas_subtipos WHERE idNormaSubtipo = ?;";
        params = [request.idNormaSubtipo];
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

function traerNormasSubtipos(request) {
    return new Promise(async (resolve, reject) => {
        sql = `SELECT idNormaSubtipo,
        normaSubtipoSigla, 
        normaSubtipo,
        (SELECT COUNT(ns.idNormaSubtipo) FROM bo_normas_subtipos ns WHERE ns.estado = 1) AS totalSubtipos
        FROM bo_normas_subtipos WHERE estado = 1`

        let res = {}
        let conn = await connection.poolPromise.getConnection()
        .catch(error => { throw error });
        try {
            res.subtipos = await conn.query(paginarQuery(request, sql))
            .catch(error => { throw error });
            res.totalSubtipos = res.subtipos[res.subtipos.length - 1]['totalSubtipos']
        } catch (error) {
            await conn.rollback();
            reject(error)
        } finally {
            conn.release()
        }
        resolve(res);
    });
}
function existeNormaSubtipoEnPINPorSigla(sigla) {
    return new Promise((resolve, reject) => {

        sql = "SELECT * FROM bo_normas_subtipos WHERE normaSubtipoSigla = ? AND estado = 1";
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
function existeNormaSubtipoEnPINPorId(id) {
    return new Promise((resolve, reject) => {

        sql = "SELECT * FROM bo_normas_subtipos WHERE idNormaSubtipo = ? AND estado = 1";
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


async function editarNormaSubtipo(request) {
    let sql = "UPDATE bo_normas_subtipos SET normaSubtipo=?, normaSubtipoSigla=? WHERE idNormaSubtipo=?;";
    params = [request.normaSubtipo, request.normaSubtipoSigla, request.idNormaSubtipo];
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


module.exports = {
    crearNormaSubtipo,
    borrarNormaSubtipo,
    traerNormaSubtipoPorId,
    traerNormasSubtipos,
    existeNormaSubtipoEnPINPorSigla,
    existeNormaSubtipoEnPINPorId,
    editarNormaSubtipo
};