var connection = require("../../services/conexion-mariadb");
const { guardarLog } = require('../../helpers/logs');
const { paginarQuery } = require("../../helpers/paginacion");

async function borrarPermisoReparticion(request) {
    let conn = await connection.poolPromise.getConnection().catch(e => { throw e });
    try {
        await conn.beginTransaction().catch(e => { throw e });

        sql = `UPDATE bo_permisos_carga_reparticiones SET permisosCargaReparticion=?, fechaActualizacion=CURRENT_TIMESTAMP WHERE idOrgJerarquia=? AND estado = 1;`;

        const permisos = await conn.query('SELECT * FROM bo_permisos_carga_reparticiones WHERE idOrgJerarquia=? AND estado=1', [request.idOrgJerarquia])

        let auxPermisos = JSON.parse(permisos[0].permisosCargaReparticion);
        auxPermisos.splice(JSON.parse(permisos[0].permisosCargaReparticion).indexOf(request.itemBorrar), 1);

        await conn.query(sql, [JSON.stringify(auxPermisos), request.idOrgJerarquia])
            .catch((error) => {
                throw error
            })
        await guardarLog(conn, sql, [JSON.stringify(auxPermisos), request.idorgJerarquia], request)
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

async function borrarPermisoUsuario(request) {
    let conn = await connection.poolPromise.getConnection().catch(e => { throw e });
    try {
        await conn.beginTransaction().catch(e => { throw e });

        sql = `UPDATE bo_permisos_carga_cuentas SET estado=4, fechaActualizacion=CURRENT_TIMESTAMP, usuarioActualizacion=? WHERE idPermisosCarga=?;`;

        //const permisos = await conn.query('SELECT * FROM bo_permisos_carga_cuentas WHERE idCuenta=? AND estado=1', [request.idCuenta])

        /* let auxPermisos = JSON.parse(permisos[0].permisosCargaUsuario);
        let indice = auxPermisos.findIndex(elem => (elem.idSeccion === request.itemBorrar.idSeccion) &&
            (elem.idNormaTipo === request.itemBorrar.idNormaTipo) &&
            (elem.idNormaSubtipo === request.itemBorrar.idNormaSubtipo) &&
            (elem.idReparticion === request.itemBorrar.idReparticion) &&
            (elem.idReparticionOrganismo === request.itemBorrar.idReparticionOrganismo));
        auxPermisos.splice(indice, 1); */

        await conn.query(sql, [request.idUsuarioActualizacion,request.itemBorrar.idPermisosCarga])
            .catch((error) => {
                throw error
            })
        /* await guardarLog(conn, sql, [request.idUsuarioActualizacion,request.itemBorrar.idPermisosCarga], request)
            .catch((error) => {
                throw error
            }) */

        await conn.commit();
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        if (conn) conn.close();
    }
}

async function crearPermisoUsuario(request) {
    sqlInsert = "INSERT INTO bo_permisos_carga_cuentas (idCuenta,idSeccion,idNormaTipo,idReparticion,nombre,sigla,usuarioCreacion) VALUES (?,?,?,?,?,?,?);";
    let conn = await connection.poolPromise.getConnection().catch(e => { throw e });
    try {
        await conn.beginTransaction().catch(e => { throw e });

         await conn.query(sqlInsert, [request.idCuenta,request.permisosCargaUsuario.idSeccion,request.permisosCargaUsuario.idNormaTipo,request.permisosCargaUsuario.idReparticion,request.nombre,request.sigla,parseInt(request.idUsuarioCarga)])
        .catch((error) => {
            throw error
        })

        /* await guardarLog(conn, sqlInsert, [request.idCuenta,request.permisosCargaUsuario.idSeccion,request.permisosCargaUsuario.idNormaTipo,request.permisosCargaUsuario.idReparticion,request.nombre,request.sigla,parseInt(request.idUsuarioCarga)])
        .catch((error) => {
            throw error
        }) */

        await conn.commit();
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        if (conn) conn.close();
    }
}

async function crearPermisoReparticion(request) {
    sqlInsert = "INSERT INTO bo_permisos_carga_reparticiones (idOrgJerarquia, permisosCargaReparticion, usuarioCreacion) VALUES (?,?,?);";
    sqlUpdate = `UPDATE bo_permisos_carga_reparticiones SET permisosCargaReparticion=?, usuarioActualizacion=?, 
        fechaActualizacion=CURRENT_TIMESTAMP WHERE idOrgJerarquia=?;`;
    let conn = await connection.poolPromise.getConnection().catch(e => { throw e });
    try {
        await conn.beginTransaction().catch(e => { throw e });

        const permisos = await conn.query('SELECT * FROM bo_permisos_carga_reparticiones WHERE idOrgJerarquia=? AND estado=1', [request.idOrgJerarquia])

        if (permisos.length > 0) {
            let auxPermisos = JSON.parse(permisos[0].permisosCargaReparticion);
            auxPermisos.push(request.permisosCargaReparticion)
            await conn.query(sqlUpdate, [JSON.stringify(auxPermisos), request.idUsuario, request.idOrgJerarquia])
                .catch((error) => {
                    throw error
                })
            await guardarLog(conn, sqlUpdate, [JSON.stringify(auxPermisos), request.idUsuario, request.idOrgJerarquia], request)
                .catch((error) => {
                    throw error
                })
        }
        else {
            await conn.query(sqlInsert, [request.idOrgJerarquia, JSON.stringify([request.permisosCargaReparticion]), request.idUsuario])
                .catch((error) => {
                    throw error
                })
            await guardarLog(conn, sqlInsert, [request.idOrgJerarquia, JSON.stringify([request.permisosCargaReparticion]), request.idUsuario], request)
                .catch((error) => {
                    throw error
                })
        }

        await conn.commit();
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        if (conn) conn.close();
    }
}
function traerPermisosBOCargaPorId(request) {
    return new Promise((resolve, reject) => {

        //sql = `SELECT * FROM bo_permisos_carga_usuarios WHERE idUsuario = ? AND estado = 1 ORDER BY fechaModificacion DESC LIMIT 1;`;
        sql = `SELECT * 
        FROM bo_permisos_carga_usuarios a
        WHERE
        a.idUsuario = ?
        AND a.estado = 1
        LIMIT 1`;
        params = [request.idUsuario];
        //params = [];


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
function traerPermisosReparticion(request) {
    return new Promise((resolve, reject) => {

        //sql = `SELECT * FROM bo_permisos_carga_usuarios WHERE idUsuario = ? AND estado = 1 ORDER BY fechaModificacion DESC LIMIT 1;`;
        sql = `SELECT * 
        FROM bo_permisos_carga_reparticiones a
        WHERE
        a.idOrgJerarquia = ?
        AND a.estado = 1
        LIMIT 1`;
        params = [request.idOrgJerarquia];
        //params = [];


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

async function traerUsuarios(request) {
    let sql = `SELECT * FROM gral_usuarios WHERE estadoUsuario = 1`;
    let conn = await connection.poolPromise.getConnection().catch(e => { throw e });
    let res = {};
    try {
        await conn.beginTransaction().catch(e => { throw e });
        res.usuarios = await conn.query(paginarQuery(request, sql))
            .catch((error) => {
                throw error
            })

        await conn.query(`SELECT COUNT(idUsuario) AS cant FROM gral_usuarios WHERE estadoUsuario = 1`)
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

async function agregarUsuario(request) {
    sql = "INSERT INTO gral_usuarios (usuario, email, apellidoNombre, existeEnSADE, numeroCOAlta) VALUES (?,?,?,?,?);";
    params = [request.usuario, request.email, request.apellidoNombre, request.existeEnSADE, request.numeroCOAlta];
    let conn = await connection.poolPromise.getConnection().catch(e => { throw e });
    try {
        await conn.beginTransaction().catch(e => { throw e });
        const insertedUser = await conn.query(sql, params)
            .catch((error) => {
                throw error
            })
        await guardarLog(conn, sql, params, request)
            .catch((error) => {
                throw error
            })
        sql = `INSERT INTO bo_permisos_carga_usuarios (idUsuario, permisosCargaUsuario, usuarioCreacion) VALUES (?,?,?)`;
        await conn.query(sql, [insertedUser.insertId, '[]', request.idUsuarioCarga])
            .catch((error) => {
                throw error
            })
        await guardarLog(conn, sql, [insertedUser.insertId, '[]', request.idUsuarioCarga], request)
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

async function editarUsuario(request) {
    sql = `UPDATE gral_usuarios 
        SET email=?, apellidoNombre=?, existeEnSADE=?, numeroCOAlta=?
        WHERE idUsuario=? AND estadoUsuario=1;`;
    params = [request.email, request.apellidoNombre, request.existeEnSADE, request.numeroCOAlta, request.idUsuario];
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
async function eliminarUsuario(request) {
    sql = `UPDATE gral_usuarios SET estadoUsuario=4, numeroCOBaja=?, fechaBorrado=CURRENT_TIMESTAMP WHERE idUsuario=?;`;
    params = [request.numeroCOBaja, request.idUsuario];
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

function getPerfilesUsuario(request) {
    return new Promise((resolve, reject) => {

        sql = `
        
        SELECT a.idUsuario, a.apellidoNombre, b.idUsuariosPerfil, c.* 
        FROM sdin_usuarios a
        LEFT OUTER JOIN sdin_usuarios_perfiles b ON a.idUsuario = b.idUsuario
        LEFT OUTER JOIN perm_perfiles c ON b.idPerfil = c.idPerfil
        WHERE a.idUsuario=? AND b.estado = 1;

        `;

        params = [request.idUsuarioSDIN];


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

function getPerfilVistas(request) {
    return new Promise((resolve, reject) => {

        sql = `
        
        SELECT a.idPerfil, c.* FROM perm_perfiles a
        LEFT OUTER JOIN perm_perfiles_vistas b ON a.idPerfil = b.idPerfil
        LEFT OUTER JOIN gral_vistas c ON b.idVista = c.idVista
        WHERE a.idPerfil=?;

        `;

        params = [request.idPerfil];


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

function getUsuarioPorCuit(request) {
    return new Promise((resolve, reject) => {

        sql = `
        
        SELECT * FROM gral_usuarios
        WHERE usuario=?;
        `;

        params = [request.usuario];


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

function traerPerfiles() {
    return new Promise((resolve, reject) => {

        sql = `
        SELECT * FROM perm_perfiles;
        `;

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

async function crearReparticionesUsuario(request) {
    sqlInsert = "INSERT INTO perm_usuarios_reparticiones (idUsuario, usuarioReparticiones, usuarioCreacion) VALUES (?,?,?);";
    sqlUpdate = `UPDATE perm_usuarios_reparticiones SET usuarioReparticiones=?, usuarioActualizacion=?, 
        fechaActualizacion=CURRENT_TIMESTAMP WHERE idUsuario=?;`;
    let conn = await connection.poolPromise.getConnection().catch(e => { throw e });
    try {
        await conn.beginTransaction().catch(e => { throw e });

        const repas = await conn.query('SELECT * FROM perm_usuarios_reparticiones WHERE idUsuario=? AND estado=1', [request.idUsuarioCarga])
        const jerarquia = await conn.query(`SELECT idOrgJerarquia FROM org_jerarquia WHERE idReparticionHijo=? 
        AND idReparticionHijo = idReparticionPadre AND estado = 1 AND aplicaBO=1`, [request.idReparticion])

        if (repas.length > 0) {
            let auxPermisos = [...JSON.parse(repas[0].usuarioReparticiones), ...jerarquia];

            await conn.query(sqlUpdate, [JSON.stringify(auxPermisos), request.idUsuario, request.idUsuarioCarga])
                .catch((error) => {
                    throw error
                })
            await guardarLog(conn, sqlUpdate, [JSON.stringify(auxPermisos), request.idUsuario, request.idUsuarioCarga], request)
                .catch((error) => {
                    throw error
                })
        }
        else {
            await conn.query(sqlInsert, [request.idUsuarioCarga, JSON.stringify(jerarquia), request.idUsuario])
                .catch((error) => {
                    throw error
                })
            await guardarLog(conn, sqlInsert, [request.idUsuarioCarga, JSON.stringify(jerarquia), request.idUsuario], request)
                .catch((error) => {
                    throw error
                })
        }

        await conn.commit();
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        if (conn) conn.close();
    }
}

async function asignarPerfilUsuario(request) {
    sql = `

    INSERT INTO sdin_usuarios_perfiles (idUsuario, idPerfil) VALUES (?,?);

    `;

    params = [request.idUsuarioCarga, request.idPerfil];
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


async function eliminarPerfilUsuario(request) {
    sql = `UPDATE sdin_usuarios_perfiles SET estado=4, fechaBorrado=CURRENT_TIMESTAMP WHERE idUsuario=? AND idUsuariosPerfil=?;`;
    params = [request.idUsuarioCarga, request.idUsuariosPerfil];
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

function traerReparticionesUsuario(request) {
    return new Promise((resolve, reject) => {

        //sql = `SELECT * FROM bo_permisos_carga_usuarios WHERE idUsuario = ? AND estado = 1 ORDER BY fechaModificacion DESC LIMIT 1;`;
        sql = `SELECT * 
        FROM perm_usuarios_reparticiones a
        WHERE
        a.idUsuario = ?
        AND a.estado = 1
        LIMIT 1`;
        // console.log(request)
        params = [request.idUsuario];
        //params = [];


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

async function borrarReparticionesUsuario(request) {
    let conn = await connection.poolPromise.getConnection().catch(e => { throw e });
    try {
        await conn.beginTransaction().catch(e => { throw e });

        sql = `UPDATE perm_usuarios_reparticiones SET usuarioReparticiones=?, 
            fechaActualizacion=CURRENT_TIMESTAMP, 
            usuarioActualizacion=?
            WHERE idUsuario=? AND estado = 1;`;

        const repas = await conn.query('SELECT * FROM perm_usuarios_reparticiones WHERE idUsuario=? AND estado=1', [request.idUsuarioCarga])

        let auxRepas = JSON.parse(repas[0].usuarioReparticiones);
        auxRepas.splice(JSON.parse(repas[0].usuarioReparticiones).indexOf(request.itemBorrar), 1);

        await conn.query(sql, [JSON.stringify(auxRepas), request.idUsuario, request.idUsuarioCarga])
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

function traerUsuarioPorId(request) {
    return new Promise((resolve, reject) => {
        let sql = `SELECT * FROM gral_usuarios WHERE idUsuario=?`;
        let params = [request.idUsuario]

        connection.pool.query(sql, params, function (error, results) {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
}

async function traerUsuariosSDIN(request) {
    let sql = `SELECT a.*
        FROM sdin_usuarios a
        ORDER BY estadoUsuario, apellidoNombre ASC`;

    if (request.paginaActual && request.limite) {
        sql = paginarQuery(request, sql)
    }
    let conn = await connection.poolPromise.getConnection().catch(e => { throw e });
    let res = {};
    try {
        await conn.beginTransaction().catch(e => { throw e });
        res.usuarios = await conn.query(sql)
            .catch((error) => {
                throw error
            })

        await conn.query(`SELECT COUNT(idUsuario) AS cant FROM sdin_usuarios`)
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

async function editarUsuarioSDIN(request) {
    let sql = `UPDATE sdin_usuarios SET apellidoNombre=?, email=?, usuario=? WHERE idUsuario=?`;

    let conn = await connection.poolPromise.getConnection().catch(e => { throw e });
    let res = {};
    try {
        await conn.beginTransaction().catch(e => { throw e });
        await conn.query(sql, [request.apellidoNombre, request.email, request.usuario, request.idUsuario])
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

async function borrarUsuarioSDIN(request) {
    let sql = `UPDATE sdin_usuarios SET estadoUsuario=4 WHERE idUsuario=?`;

    let conn = await connection.poolPromise.getConnection().catch(e => { throw e });
    let res = {};
    try {
        await conn.beginTransaction().catch(e => { throw e });
        await conn.query(sql, [request.idUsuario])
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

async function reactivarUsuarioSDIN(request) {
    let sql = `UPDATE sdin_usuarios SET estadoUsuario=1, fechaModificacion=now() WHERE idUsuario=?`;

    let conn = await connection.poolPromise.getConnection().catch(e => { throw e });
    let res = {};
    try {
        await conn.beginTransaction().catch(e => { throw e });
        await conn.query(sql, [request.idUsuario])
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

async function crearUsuarioSDIN(request) {
    let sql = `INSERT INTO sdin_usuarios (usuario, email, apellidoNombre) VALUES (?,?,?)`;

    let conn = await connection.poolPromise.getConnection().catch(e => { throw e });
    let res = {};
    try {
        await conn.beginTransaction().catch(e => { throw e });
        await conn.query(sql, [request.usuario, request.email, request.apellidoNombre])
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

async function traerUsuarioSDIN(request) {
    let sql = `SELECT * FROM sdin_usuarios WHERE idUsuario=?`;

    let conn = await connection.poolPromise.getConnection().catch(e => { throw e });
    let usuario = {};
    let perfiles = [];
    try {
        await conn.beginTransaction().catch(e => { throw e });
        [usuario] = await conn.query(sql, [request.idUsuario])
            .catch((error) => {
                throw error
            });
        sql = `SELECT a.*, b.descripcion 
        FROM sdin_usuarios_perfiles a 
        LEFT OUTER JOIN perm_perfiles b ON a.idPerfil=b.idPerfil 
        WHERE a.idUsuario=? AND a.estado=1`;
        perfiles = await conn.query(sql, [request.idUsuario])
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
    return { usuario, perfiles };
}

async function asignarPerfilUsuarioSDIN(request) {
    let sql = `INSERT INTO sdin_usuarios_perfiles (idPerfil, idUsuario) VALUES (?,?)`;

    let conn = await connection.poolPromise.getConnection().catch(e => { throw e });
    try {
        await conn.beginTransaction().catch(e => { throw e });
        await conn.query(sql, [request.idPerfil, request.idUsuario])
            .catch((error) => {
                throw error
            });

        await conn.commit();
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        if (conn) conn.close();
    }
    return;
}

async function borrarPerfilUsuarioSDIN(request) {
    let sql = `UPDATE sdin_usuarios_perfiles SET estado=4 WHERE idUsuariosPerfil=?`;

    let conn = await connection.poolPromise.getConnection().catch(e => { throw e });
    try {
        await conn.beginTransaction().catch(e => { throw e });
        await conn.query(sql, [request.idUsuariosPerfil])
            .catch((error) => {
                throw error
            });

        await conn.commit();
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        if (conn) conn.close();
    }
    return;
}

module.exports = {
    asignarPerfilUsuario,
    traerPerfiles,
    agregarUsuario,
    editarUsuario,
    eliminarUsuario,
    getPerfilesUsuario,
    getPerfilVistas,
    getUsuarioPorCuit,
    traerPermisosBOCargaPorId,
    traerUsuarios,
    eliminarPerfilUsuario,
    crearPermisoUsuario,
    borrarPermisoUsuario,
    traerPermisosReparticion,
    crearPermisoReparticion,
    borrarPermisoReparticion,
    traerReparticionesUsuario,
    borrarReparticionesUsuario,
    crearReparticionesUsuario,
    traerUsuarioPorId,
    traerUsuariosSDIN,
    editarUsuarioSDIN,
    borrarUsuarioSDIN,
    crearUsuarioSDIN,
    traerUsuarioSDIN,
    asignarPerfilUsuarioSDIN,
    borrarPerfilUsuarioSDIN,
    reactivarUsuarioSDIN
};