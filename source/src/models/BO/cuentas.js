var connection = require("../../services/conexion-mariadb");
const { guardarLog } = require('../../helpers/logs');
const { paginarQuery } = require("../../helpers/paginacion");


async function traerCuentas(request) {
    
    let conn = await connection.poolPromise.getConnection().catch(e => { throw e });
    let res = {};
    try {
        await conn.beginTransaction().catch(e => { throw e });
        let sql = `SELECT bo_cuentas.*, bo_reparticiones.reparticion
        FROM bo_cuentas
        LEFT OUTER JOIN bo_reparticiones ON bo_cuentas.idReparticion=bo_reparticiones.idReparticion
        WHERE 1 = 1`;

        let params = [];

        for (const [key, value] of Object.entries(request)) {
            if (!value) continue;
            switch (key) {
                case 'buscador':
                        sql = `${sql} AND (bo_cuentas.nombre LIKE '%${value}%' OR bo_cuentas.sigla LIKE '%${value}%' OR bo_reparticiones.reparticion LIKE '%${value}%')`;
                        break;

            }
        } 

        res.cuentas = await conn.query(paginarQuery(request, sql + " ORDER BY estado, nombre"))
            .catch((error) => {
                throw error
            })

        await conn.query('SELECT COUNT(idCuenta) AS cant FROM' + sql.split('FROM')[1], params)
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
    return res;
}

function crearCuenta(request) {
    return new Promise((resolve, reject) => {
        let sql = `INSERT INTO bo_cuentas (sigla,nombre, email, email_alternativo, telefono, idReparticion) VALUES (?,?,?,?,?,?)`;
        let params = [request.cuenta,request.nombre, request.email, request.emailAlternativo, request.telefono, request.idReparticion]

        connection.pool.query(sql, params, function (error, results) {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
}

function traerUsuarioPorId(request) {
    return new Promise((resolve, reject) => {
        let sql = `SELECT * FROM bo_usuarios WHERE idUsuario=?`;
        let params = [request.idUsuario]

        connection.pool.query(sql, params, function (error, results) {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
}

function traerCuentaPorId(request) {
    return new Promise((resolve, reject) => {
        let sql = `SELECT bo_cuentas.*, bo_reparticiones.reparticion
        FROM bo_cuentas 
        LEFT OUTER JOIN bo_reparticiones ON bo_cuentas.idReparticion=bo_reparticiones.idReparticion 
        WHERE bo_cuentas.estado = 1
        AND bo_cuentas.idCuenta=?`;
        let params = [request.idCuenta]

        connection.pool.query(sql, params, function (error, results) {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
}

async function traerUsuariosBO(request) {
    let conn = await connection.poolPromise.getConnection().catch(e => { throw e });
    let res = {};
    try {
        await conn.beginTransaction().catch(e => { throw e });
        
        let sql = `SELECT a.*, b.nombre FROM bo_usuarios a LEFT OUTER JOIN bo_cuentas b ON b.idCuenta=a.idCuenta WHERE a.estadoUsuario = 1`;

        let params = [];

        for (const [key, value] of Object.entries(request)) {
            if (!value) continue;
            switch (key) {
                case 'buscador':
                        sql = `${sql} AND (a.usuario LIKE '%${value}%' OR a.apellidoNombre LIKE '%${value}%' OR a.email LIKE '%${value}%')`;
                        break;
                case ('idCuenta'):
                    sql = String(sql) + String(` AND a.${key}=${value}`);
                    break;

            }
        } 
        
        if (request.sinPaginacion) {
            res.usuarios = await conn.query(sql)
                .catch((error) => {
                    throw error
                })
        }
        else {
            res.usuarios = await conn.query(paginarQuery(request, sql))
                .catch((error) => {
                    throw error
                })
        }
        await conn.query('SELECT COUNT(idUsuario) AS cant FROM' + sql.split('FROM')[1], params)
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
    return res;
}

function traerUsuarioPorId(request) {
    return new Promise((resolve, reject) => {
        let sql = `SELECT * FROM bo_usuarios WHERE idUsuario=?`;
        let params = [request.idUsuario]

        connection.pool.query(sql, params, function (error, results) {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
}

function traerPerfilesCuenta(request) {
    return new Promise((resolve, reject) => {
        let sql = `SELECT b.idPerfil, c.descripcion, a.idCuenta
            FROM bo_cuentas a
            LEFT OUTER JOIN perm_cuentas_perfiles b ON a.idCuenta=b.idCuenta
            LEFT OUTER JOIN perm_perfiles c ON b.idPerfil=c.idPerfil
            WHERE a.idCuenta = b.idCuenta
            AND a.idCuenta=?
            AND b.estado=1
            AND c.idPerfil = b.idPerfil`;
        let params = [request.idCuenta]

        connection.pool.query(sql, params, function (error, results) {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
}

function traerUsuariosPorIdCuenta(request) {
    return new Promise((resolve, reject) => {
        let sql = `SELECT * FROM bo_usuarios
            WHERE idCuenta=? AND estadoUsuario=1`;
        let params = [request.idCuenta]

        connection.pool.query(sql, params, function (error, results) {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
}

function traerPermisosCuenta(request) {
    return new Promise((resolve, reject) => {
        let sql = `SELECT bpcc.*, bss.seccion, bss.seccionSigla, bnt.normaTipo, bnt.normaTipoSigla, br.reparticion, br.siglaReparticion, bss.cod_proceso, bss.es_poder
            FROM bo_permisos_carga_cuentas bpcc
            LEFT OUTER JOIN bo_sumario_secciones bss ON bss.idSeccion = bpcc.idSeccion
            LEFT OUTER JOIN bo_normas_tipos bnt ON bnt.idNormaTipo = bpcc.idNormaTipo
            LEFT OUTER JOIN bo_reparticiones br ON br.idReparticion = bpcc.idReparticion
            WHERE bpcc.idCuenta=? AND bpcc.estado=1`;
        let params = [request.idCuenta]

        connection.pool.query(sql, params, function (error, results) {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
}

function crearUsuarioBO(request) {
    return new Promise((resolve, reject) => {
        let sql = `INSERT INTO bo_usuarios (usuario, email, apellidoNombre, numeroCOAlta, existeEnSADE) VALUES (?,?,?,?,?)`;
        let params = [request.usuario, request.email, request.apellidoNombre, request.numeroCOAlta, request.existeEnSADE]

        connection.pool.query(sql, params, function (error, results) {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
}

function deshacerEliminarCuenta(usuario, idCuenta) {
    return new Promise((resolve, reject) => {
        let sql = `UPDATE bo_cuentas SET estado = 1, fechaModificacion = now(), usuarioModificacion = ? WHERE idCuenta=?`;
        let params = [usuario, idCuenta]
        connection.pool.query(sql, params, function (error, results) {
            if (error) {
                reject(error);
            }
            resolve(results);
        })
    })
}

function borrarCuentaBO(usuario, idCuenta) {
    return new Promise((resolve, reject) => {
        let sql = `UPDATE bo_cuentas SET estado = 4, usuarioModificacion=?, fechaModificacion=now() WHERE idCuenta=?`;
        let params = [usuario, idCuenta]
        connection.pool.query(sql, params, function (error, results) {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
}

function borrarUsuarioBO(request) {
    return new Promise((resolve, reject) => {
        let sql = `UPDATE bo_usuarios SET estadoUsuario=4 WHERE idUsuario=?`;
        let params = [request.idUsuario]

        connection.pool.query(sql, params, function (error, results) {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
}

function editarUsuarioBO(datosEditar, idUsuario) {
    return new Promise((resolve, reject) => {
        let sql = `UPDATE bo_usuarios SET ${Object.keys(datosEditar).map(n => n + '=?')} WHERE idUsuario=?`;
        let params = [...Object.values(datosEditar), idUsuario]
console.log({sql, params})
        connection.pool.query(sql, params, function (error, results) {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
}

module.exports = {
    traerCuentas,
    crearCuenta,
    traerPerfilesCuenta,
    traerCuentaPorId,
    traerUsuariosPorIdCuenta,
    traerPermisosCuenta,
    borrarCuentaBO,
    deshacerEliminarCuenta,
    traerUsuariosBO,
    crearUsuarioBO,
    borrarUsuarioBO,
    editarUsuarioBO
};