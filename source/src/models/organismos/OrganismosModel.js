const connection = require("../../services/conexion-mariadb");
const { guardarLog } = require('../../helpers/logs');
const { paginarQuery } = require("../../helpers/paginacion");

async function traerJerarquia(request) {
    let conn = await connection.poolPromise.getConnection().catch(e => { throw e });
    let res = {};
    try {
        await conn.beginTransaction().catch(e => { throw e });
        sql = `SELECT a.idOrgJerarquia, b.idReparticion AS 'idReparticionOrganismo', b.reparticion AS 'organismo', 
        b.siglaReparticion AS 'siglaOrganismo',  c.idReparticion, c.reparticion AS 'reparticion', c.siglaReparticion AS 'siglaReparticion',
        a.aplicaBO, a.aplicaSDIN, a.aplicaDJ
        FROM org_jerarquia a
        LEFT OUTER JOIN bo_reparticiones b ON a.idReparticionPadre = b.idReparticion
        LEFT OUTER JOIN bo_reparticiones c ON a.idReparticionHijo = c.idReparticion
        WHERE a.estado = 1
        AND (b.estado = 1 OR b.estado IS NULL)
        AND c.estado = 1
        ORDER BY organismo ASC`;
        res.data = await conn.query(request ? paginarQuery(request, sql) : sql)
            .catch((error) => {
                throw error
            })

        await conn.query(`SELECT COUNT(idOrgJerarquia) AS cant, b.reparticion AS 'organismo' FROM ` + sql.split(/FROM(.*)/s)[1])
            .then(r => {
                res.total = r[0]['cant']
            })
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
    return res
}

function traerJerarquiaPorId(request) {
    return new Promise((resolve, reject) => {
        sql = `SELECT a.idOrgJerarquia, b.reparticion AS 'organismo', b.siglaReparticion AS 'siglaOrganismo',  c.reparticion AS 'reparticion', c.siglaReparticion AS 'siglaReparticion'  
        FROM org_jerarquia a
        LEFT OUTER JOIN bo_reparticiones b ON ( a.idReparticionPadre = b.idReparticion OR ( a.idReparticionPadre IS NULL AND b.idReparticion = a.idReparticionHijo ) )
        LEFT OUTER JOIN bo_reparticiones c ON a.idReparticionHijo = c.idReparticion
        WHERE a.estado = 1
        AND b.estado = 1
        AND c.estado = 1
        AND a.idOrgJerarquia = ?
        ORDER BY organismo ASC`;
        params = [request.idOrgJerarquia];
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
function traerReparticionesBO(request) {
    return new Promise(async (resolve, reject) => {
        sql = `SELECT idReparticion, 
        reparticion, 
        siglaReparticion,
        (SELECT COUNT(br.idReparticion) FROM bo_reparticiones br WHERE br.estado = 1) AS totalReparticiones
        FROM bo_reparticiones
        WHERE estado = 1
        ORDER BY reparticion ASC`;

        let res = {}
        let conn = await connection.poolPromise.getConnection()
        .catch(error => { throw error });
        try {
            res.reparticiones = await conn.query(paginarQuery(request, sql))
            .catch(error => { throw error });
            res.totalReparticiones = res.reparticiones[res.reparticiones.length - 1]['totalReparticiones']
        } catch (error) {
            await conn.rollback();
            reject(error)
        } finally {
            conn.release()
        }
        resolve(res);
    });
}
function traerReparticionPorId(request) {
    return new Promise((resolve, reject) => {
        sql = `SELECT idReparticion, reparticion, siglaReparticion 
        FROM
        bo_reparticiones
        WHERE estado = 1
        AND idReparticion = ?`;
        params = [request.idReparticion];
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

async function crearJerarquia(request) {
    return new Promise((resolve, reject) => {
        let sql = `INSERT INTO org_jerarquia (
            idReparticionHijo,
            idReparticionPadre,
            aplicaBO,
            aplicaSDIN,
            aplicaDJ
            ) 
            VALUES (?,?,?,?,?);
            `;
        params = [request.idReparticionHijo, request.idReparticionPadre, request.aplicaBO, request.aplicaSDIN, request.aplicaDJ];

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
async function crearReparticion(request) {
    let sql = `INSERT INTO bo_reparticiones (
        reparticion,
        siglaReparticion
        ) 
        VALUES (?,?);
        `;
    params = [
        request.reparticion,
        request.siglaReparticion
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
async function borrarJerarquiaPorId(request) {
    let sql = `UPDATE org_jerarquia SET estado=4, fechaBorrado = CURRENT_TIMESTAMP WHERE idOrgJerarquia=?;`;
    params = [
        request.idOrgJerarquia
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

async function borrarReparticionPorId(request) {
    let sql = `UPDATE bo_reparticiones SET estado=4, fechaBorrado = CURRENT_TIMESTAMP WHERE idReparticion=?;`;
    params = [
        request.idReparticion
    ]; let conn = await connection.poolPromise.getConnection().catch(e => { throw e });
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

function traerOrganismosEmisores(request) {
    return new Promise(async (resolve, reject) => {
        let sql = `SELECT idOrgEmisor, nombre, sigla FROM bo_organismos_emisores
                    WHERE 1=1`;
        
        let conn = await connection.poolPromise.getConnection()
            .catch(error => { throw error });

        for (const [key, value] of Object.entries(request)) {
            if (!value) continue;
            switch (key) {
                case ('busqueda'):
                    sql = `${sql} AND (nombre LIKE '%${value}%' OR sigla LIKE '%${value}%')`;
                    break;
            }
        }

        //sql = sql + ' ORDER BY a.fechaCarga DESC';

        let res = {};
        try {

            res.totalOrg = await conn.query('SELECT COUNT(idOrgEmisor) FROM ' + sql.split('FROM')[1])
                .catch(error => { throw error });

            res.data = await conn.query(paginarQuery(request, sql))
                .catch(error => { throw error });

        }
        catch (error) {
            reject(error)
        }
        finally {
            await conn.release();
            resolve(res);
        }

        /* connection.pool.getConnection(function (err, conn) {
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
        }); */
    });
}
function traerOrganismosEmisoresExterno(request) {
    return new Promise(async (resolve, reject) => {
        let sql =  `SELECT idPermisosCarga, nombre, sigla
                    FROM bo_permisos_carga_cuentas
                    WHERE estado = 1 AND idCuenta = ? AND 1=1`;
        
        let conn = await connection.poolPromise.getConnection()
            .catch(error => { throw error });

        for (const [key, value] of Object.entries(request)) {
            if (!value) continue;
            switch (key) {
                case ('busqueda'):
                    sql = `${sql} AND (nombre LIKE '%${value}%' OR sigla LIKE '%${value}%')`;
                    break;
            }
        }

        sql = sql + ' GROUP BY nombre';

        let res = {};
        try {

            res.data = await conn.query(sql,[request.idCuenta])
                .catch(error => { throw error });
        }
        catch (error) {
            reject(error)
        }
        finally {
            await conn.release();
            resolve(res);
        }

    });
}
function crearOrganismosEmisores(request) {
    return new Promise((resolve, reject) => {
        let sql = `INSERT INTO bo_organismos_emisores (
            nombre,
            sigla
            ) 
            VALUES (?,?)`
        let params = [request.nombre, request.sigla]

        connection.pool.getConnection((err, conn) => {
            if (err) {
                reject(err);
            }
            conn.query(sql, params, (e, result) => {
                conn.release()
                if (e) {
                    reject(e)
                }
                resolve(result)
            })
        })
    })
    
}

function editarOrganismosEmisores(request) {
    return new Promise((resolve, reject) => {
        let sql = `UPDATE bo_organismos_emisores 
                    SET nombre=?, sigla=?
                    WHERE idOrgEmisor=?`
        let params = [request.nombre, request.sigla, request.idOrgEmisor]
        
        connection.pool.getConnection((err, conn) => {
            if (err) {
                reject(err);
            }
            conn.query(sql, params, (e, result) => {
                conn.release()
                if (e) {
                    reject(e)
                }
                resolve(result)
            })
        })
    })
}

function eliminarOrganismosEmisores(request) {
    return new Promise((resolve, reject) => {
        let sql = `DELETE FROM bo_organismos_emisores
                    WHERE idOrgEmisor=?`
        let params = [request.idOrgEmisor]
        
        connection.pool.getConnection((err, conn) => {
            if (err) {
                reject(err);
            }
            conn.query(sql, params, (e, result) => {
                conn.release()
                if (e) {
                    reject(e)
                }
                resolve(result)
            })
        })
    })
}

module.exports = {
    traerJerarquia,
    traerJerarquiaPorId,
    crearJerarquia,
    borrarJerarquiaPorId,
    traerReparticionesBO,
    traerReparticionPorId,
    crearReparticion,
    borrarReparticionPorId,
    traerOrganismosEmisores,
    crearOrganismosEmisores,
    editarOrganismosEmisores,
    eliminarOrganismosEmisores,
    traerOrganismosEmisoresExterno
};