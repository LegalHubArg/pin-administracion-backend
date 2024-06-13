var connection = require("../../services/conexion-mariadb");
const { guardarLog } = require('../../helpers/logs')

function traerFeriadosPorAnio(request) {
    return new Promise((resolve, reject) => {
        sql = `SELECT idFeriado, DATE(feriadoFecha), feriado
        FROM bo_feriados
        WHERE
        estado = 1
        /*AND YEAR(feriadoFecha) = ?*/
        ORDER BY feriadoFecha DESC`;

        // params = [request.fechaAnio];
        connection.pool.getConnection(function (err, conn) {
            if (err) throw err; // not connected!

            // Use the connection
            conn.query(sql, /* params,  */function (error, results, fields) {
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

function traerFeriadoPorFecha(request) {
    console.log(request)
    return new Promise((resolve, reject) => {
        sql = `SELECT idFeriado, DATE(feriadoFecha), feriado
        FROM bo_feriados
        WHERE
        estado = 1
        AND feriadoFecha = ?`;

        params = [request.feriadoFecha];
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

async function crearFeriado(request) {
    let sql = `INSERT INTO bo_feriados (
        feriadoFecha, 
        feriado
        ) 
        VALUES (DATE(?),?);
        `;
    params = [
        request.feriadoFecha,
        request.feriado
    ];
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

async function borrarFeriadoPorId(request) {
    sql = `UPDATE bo_feriados SET estado=4, fechaBorrado=CURRENT_TIMESTAMP WHERE idFeriado=? AND estado = 1;`;
    params = [request.idFeriado];
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
    traerFeriadosPorAnio,
    traerFeriadoPorFecha,
    crearFeriado,
    borrarFeriadoPorId
};