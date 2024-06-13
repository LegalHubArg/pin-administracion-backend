let connection = require("../../services/conexion-mariadb");
const { paginarQuery } = require('../../helpers/paginacion');
const { guardarLog } = require("../../helpers/logs");

async function crearEstadoNorma(request) {
    let sql = `INSERT INTO normas_estados (idNorma, UsuarioCarga) VALUES (?,?)`;
    params = [request.idNorma, request.idUsuarioCarga]
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

async function crearNorma(request) {
    let sqlNormas = `INSERT INTO normas (usuarioCarga, cuentaCarga) VALUES (?,?)`;
    let sqlCrearEstado = `INSERT INTO normas_estados (idNorma, UsuarioCarga) VALUES (?,?)`;
    let sqlCrearMetadatos = `INSERT INTO normas_metadatos ( idNorma,
        idUsuarioCarga, 
        normaAcronimoReferencia, 
        organismoEmisor, 
        idReparticion,
        idSeccion,
        idNormaTipo,
        idNormaSubtipo,
        normaNumero,
        normaAnio,
        normaSumario,
        tags,
        fechaSugerida,
        fechaLimite,
        fechaDesde,
        fechaHasta,
        normaArchivoOriginal,
        normaArchivoOriginalS3Key,
        idTipoProceso,
        numeroReparto,
        procedimiento,
        numeroEdicionSubtipo,
        reparticiones,
        siglasReparticiones,
        idCuentaCarga
        ) 
        
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);`;

    let sqlAnexo = `INSERT INTO normas_anexos (
            idNorma, 
            normaAnexoDescripcion, 
            normaAnexoArchivo,
            normaAnexoArchivoS3Key
            ) 
            
            VALUES (?,?,?,?);
            `;

    let sqlDigitalizacion = `INSERT INTO normas_digitalizaciones ( idNorma,
        usuarioCreacion, 
        normaDocumento
        ) 
        
        VALUES (?,?,?);`;

    let conn = await connection.poolPromise.getConnection();

    try {
        await conn.beginTransaction();

        const normaCreada = await conn.query(sqlNormas, [request.idUsuarioCarga, request.idCuenta])
            .catch(err => { throw err });

        await conn.query(sqlCrearEstado, [normaCreada.insertId, request.idUsuarioCarga])
            .catch(err => { throw err });

        await conn.query(sqlCrearMetadatos, [normaCreada.insertId,
        request.idUsuarioCarga,
        request.normaAcronimoReferencia,
        request.organismoEmisor,
        request.idReparticion,
        request.idSeccion,
        request.idNormaTipo,
        request.idNormaSubtipo,
        request.normaNumero,
        request.normaAnio,
        request.normaSumario,
        request.tags,
        request.fechaSugerida,
        request.fechaLimite,
        request.fechaDesde,
        request.fechaHasta,
        request.normaArchivoOriginal,
        request.normaArchivoOriginalS3Key,
        request.idTipoProceso,
        request.numeroReparto,
        request.procedimiento,
        request.numeroEdicionSubtipo,
        request.reparticiones,
        request.siglasReparticiones,
        request.idCuenta])
            .catch(err => { throw err });

        if (request.anexos) {
            if (request.anexos.length > 0) {
                for (const anexo of request['anexos']) {
                    await conn.query(sqlAnexo, [
                        normaCreada.insertId,
                        anexo.normaAnexoDescripcion,
                        anexo.normaAnexoArchivo,
                        anexo.normaAnexoArchivoS3Key
                    ]).catch((e) => { throw e });
                    await guardarLog(conn, sqlAnexo, [
                        normaCreada.insertId,
                        anexo.normaAnexoDescripcion,
                        anexo.normaAnexoArchivo,
                        anexo.normaAnexoArchivoS3Key
                    ], request).catch((e) => { throw e });
                }

            }
        }
        request.idNorma = normaCreada.insertId;

        await conn.query(sqlDigitalizacion, [request.idNorma,
        request.idUsuarioCarga,
        request.normaDocumento
        ])

        await guardarLog(conn, sqlNormas, [request.idUsuarioCarga], request)
            .catch((error) => {
                throw error
            })
        await guardarLog(conn, sqlCrearEstado, [normaCreada.insertId, request.idUsuarioCarga], request)
            .catch((error) => {
                throw error
            })
        await guardarLog(conn, sqlCrearMetadatos, [normaCreada.insertId,
        request.idUsuarioCarga,
        request.normaAcronimoReferencia,
        request.idReparticionOrganismo,
        request.idReparticion,
        request.idSeccion,
        request.idNormaTipo,
        request.idNormaSubtipo,
        request.normaNumero,
        request.normaAnio,
        request.normaSumario,
        request.tags,
        request.fechaSugerida,
        request.fechaLimite,
        request.fechaDesde,
        request.fechaHasta,
        request.normaArchivoOriginal,
        request.normaArchivoOriginalS3Key,
        request.idTipoProceso,
        request.numeroReparto,
        request.procedimiento,
        request.numeroEdicionSubtipo,
        request.organismosConjuntos], request)
            .catch((error) => {
                throw error
            })
        await guardarLog(conn, sqlDigitalizacion, [request.idNorma,
        request.idUsuarioCarga,
        request.normaDocumento
        ], request)
            .catch((error) => {
                throw error
            })

        await conn.commit();
    }
    catch (error) {
        await conn.rollback();
        throw error;
    }
    finally {
        // Close Connection
        if (conn) conn.close();
    }

}

async function crearMetadatosNorma(request) {
    let conn = await connection.poolPromise.getConnection().catch(e => { throw e });
    let sql = `INSERT INTO normas_metadatos ( idNorma,
        idUsuarioCarga, 
        normaAcronimoReferencia, 
        idReparticionOrganismo, 
        idReparticion,
        idSeccion,
        idNormaTipo,
        idNormaSubtipo,
        normaNumero,
        normaAnio,
        normaSumario,
        tags,
        fechaSugerida,
        fechaLimite,
        fechaDesde,
        fechaHasta,
        normaArchivoOriginal,
        normaArchivoOriginalS3Key,
        idTipoProceso,
        numeroReparto,
        procedimiento,
        numeroEdicionSubtipo
        ) 
        
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);`;
    params = [request.idNorma,
    request.idUsuarioCarga,
    request.normaAcronimoReferencia,
    request.idReparticionOrganismo,
    request.idReparticion,
    request.idSeccion,
    request.idNormaTipo,
    request.idNormaSubtipo,
    request.normaNumero,
    request.normaAnio,
    request.normaSumario,
    request.tags,
    request.fechaSugerida,
    request.fechaLimite,
    request.fechaDesde,
    request.fechaHasta,
    request.normaArchivoOriginal,
    request.normaArchivoOriginalS3Key,
    request.idTipoProceso,
    request.numeroReparto,
    request.procedimiento,
    request.numeroEdicionSubtipo
    ];
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

function traerNormaPorId(request) {
    return new Promise((resolve, reject) => {
        let sql = `SELECT d.idNormasEstadoTipo, a.usuarioCarga, a.idNorma, b.idNormasMetadato, 
        b.valorCotizacion, b.numeroBUI, b.normaTexto, b.normaAcronimoReferencia, b.idPrioridadTipo, 
        b.normaSumario, d.normasEstadoTipo, e.nombre, f.reparticion, b.normaAnio, b.normaNumero, b.fechaSugerida, a.fechaCarga, b.fechaLimite, 
        org.idOrgEmisor, b.organismoEmisor, b.tags, i.seccion, j.normaTipo, k.normaSubtipo, b.normaArchivoOriginal, b.normaArchivoOriginalS3Key, b.idSeccion, i.es_poder as seccionEsPoder, 
        b.idNormaTipo, b.idNormaSubtipo, b.idReparticion, b.fechaDesde, b.fechaHasta, b.idTipoProceso,
        b.numeroReparto, b.procedimiento, p.siglaTipoProceso, b.reparticiones, b.siglasReparticiones, b.normaRevisada, b.fechaPublicacion,
        sdin_normas_metadatos.idNormaSDIN, b.mig_filenet_publicado, b.mig_clase_documental, g.apellidoNombre
        FROM normas a 
        LEFT OUTER JOIN sdin_normas_metadatos ON a.idNorma = sdin_normas_metadatos.idNorma
        LEFT OUTER JOIN normas_metadatos b ON b.idNorma = a.idNorma
        LEFT OUTER JOIN bo_organismos_emisores org ON b.organismoEmisor = org.sigla
        LEFT OUTER JOIN normas_proceso_tipos p ON b.idTipoProceso = p.idTipoProceso
        LEFT OUTER JOIN bo_normas_subtipos k ON k.idNormaSubtipo=b.idNormaSubtipo
        LEFT OUTER JOIN normas_estados c ON c.idNorma = a.idNorma
        LEFT OUTER JOIN normas_estados_tipos d ON c.idNormasEstadoTipo = d.idNormasEstadoTipo
        LEFT OUTER JOIN bo_cuentas e ON e.idCuenta = a.cuentaCarga
        LEFT OUTER JOIN bo_reparticiones f ON f.idReparticion = b.idReparticion
        LEFT OUTER JOIN bo_usuarios g ON g.idUsuario = a.usuarioCarga
        LEFT OUTER JOIN bo_sumario_secciones i ON b.idSeccion = i.idSeccion
        LEFT OUTER JOIN bo_normas_tipos j ON b.idNormaTipo = j.idNormaTipo
        WHERE b.estado = 1 
        AND c.estado = 1 
        AND (sdin_normas_metadatos.estado = 1 OR sdin_normas_metadatos.estado IS NULL)
        AND a.idNorma =?`;
        let params = [request.idNorma];
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

function traerNormasDelUsuario(request) {
    return new Promise(async (resolve, reject) => {
        let sql = `SELECT a.idNorma, b.normaAcronimoReferencia, b.normaSumario, d.normasEstadoTipo, 
        e.apellidoNombre, f.reparticion, g.prioridad, f.siglaReparticion
        FROM
        normas a, 
        normas_metadatos b, 
        normas_estados c,
        normas_estados_tipos d,
        bo_usuarios e,
        bo_reparticiones f,
        normas_prioridades_tipos g
        WHERE
		a.idNorma = b.idNorma
		AND a.idNorma = c.idNorma
		AND c.idNormasEstadoTipo = d.idNormasEstadoTipo
		AND a.usuarioCarga = ?
		AND b.estado = 1
		AND c.estado = 1
		AND e.idUsuario = a.usuarioCarga
		AND f.idReparticion = b.idReparticion
        AND g.idPrioridadTipo = b.idPrioridadTipo`;
        let params = [request.usuario.idUsuarioBO];
        let conn = await connection.poolPromise.getConnection()
            .catch(error => { throw error });

        for (const p of Object.keys(request)) {
            if (request[`${p}`] !== null &&
                request[`${p}`] !== undefined &&
                (request[`${p}`]).length !== 0) {
                switch (p) {
                    case ('idNormasEstadoTipo'):
                        sql = String(sql) + String(` AND c.${p}=?`);
                        params.push(request[`${p}`])
                        break;
                    case ('idReparticion'):
                    case ('idSeccion'):
                    case ('normaAnio'):
                    case ('normaNumero'):
                        sql = String(sql) + String(` AND b.${p}=?`);
                        params.push(request[`${p}`])
                        break;

                }
            }
        }

        sql = sql + ' ORDER BY a.fechaCarga DESC';

        let res = {};
        try {

            //Saca el total de normas contemplando los filtros de búsqueda
            res.totalNormas = await conn.query('SELECT COUNT(a.idNorma) FROM' + sql.split('FROM')[1], params)
                .catch(error => { throw error });

            res.normas = await conn.query(paginarQuery(request, sql), params)
                .catch(error => { throw error });

        }
        catch (error) {
            reject(error)
        }
        finally {
            await conn.release();
            resolve(res);
        }
    })
}

function traerNormasDeReparticionesDelUsuario(request) {
    return new Promise((resolve, reject) => {
        let sql = `SELECT a.*, 
        b.normaTipo, 
        c.normaSubtipo, 
        d.reparticion, 
        e.reparticion AS "reparticionOrganismo", 
        f.seccion,
        ne.normasEstado,
        gu.apellidoNombre
        FROM normas a
        LEFT OUTER JOIN bo_normas_tipos b ON a.idNormaTipo = b.idNormaTipo
        LEFT OUTER JOIN bo_normas_subtipos c ON a.idNormaSubtipo = c.idNormaSubtipo
        LEFT OUTER JOIN bo_reparticiones d ON a.idReparticion = d.idReparticion
        LEFT OUTER JOIN bo_reparticiones e ON a.idReparticionOrganismo = e.idReparticion
        LEFT OUTER JOIN bo_sumario_secciones f ON a.idSeccion = f.idSeccion
        LEFT OUTER JOIN normas_estados ne ON a.idNormasEstado = ne.idNormasEstado
        LEFT OUTER JOIN gral_usuarios gu ON a.idUsuarioCarga = gu.idUsuario
        WHERE 
        a.idNormasEstado != 0
        AND a.idUsuarioCarga != ?
        AND a.idReparticion  IN(
	        SELECT pur.idReparticion 
	        FROM perm_usuarios_reparticiones pur
	        WHERE
	        	pur.estado = 1
	        	AND pur.idUsuario = ?
        );`;
        let params = [request.usuario.idUsuario, request.usuario.idUsuario];
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

function borrarNorma(request) {
    return new Promise(async (resolve, reject) => {

        connection.pool.getConnection(async function (err, conn) {
            if (err) throw err; // not connected!
            try {
                await conn.beginTransaction();

                let sql = `UPDATE normas_estados SET estado=4, fechaBorrado=CURRENT_TIMESTAMP, usuarioBorrado=? WHERE idNorma=? AND estado=1;`;
                let params = [request.usuario, request.idNorma];
                await conn.query(sql, params);

                sql = `INSERT INTO normas_estados (idNorma, idNormasEstadoTipo, usuarioCarga) VALUES (?,?,?)`;
                params = [request.idNorma, request.idNormasEstadoTipo, request.usuario]
                await conn.query(sql, params);

                await conn.commit();
                resolve();
            }
            catch (e) {
                reject(e);
            }
            finally {
                conn.release();
            }
        });
    });
}

async function crearAnexoNorma(request) {
    let sql = `INSERT INTO normas_anexos (
        idNorma, 
        normaAnexoDescripcion, 
        normaAnexoArchivo,
        normaAnexoArchivoS3Key
        ) 
        
        VALUES (?,?,?,?);
        `;
    let params = [
        request.idNorma,
        request.anexo.normaAnexoDescripcion,
        request.anexo.normaAnexoArchivo,
        request.anexo.normaAnexoArchivoS3Key
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

function traerAnexosPorIdNorma(request) {
    return new Promise((resolve, reject) => {
        let sql = `SELECT a.*
        FROM normas_anexos a
        WHERE a.estado = 1
        AND a.idNorma=?;`;

        let params = [request.idNorma];
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

function traerNormasDeCuenta(request) {
    return new Promise(async (resolve, reject) => {
        let sql = `SELECT a.idNorma, b.normaAcronimoReferencia, b.normaSumario, d.normasEstadoTipo, f.reparticion, h.prioridad, u.apellidoNombre
        FROM
        normas a LEFT OUTER JOIN bo_usuarios u ON a.usuarioCarga=u.idUsuario, 
        normas_metadatos b, 
        normas_estados c,
        normas_estados_tipos d,
        bo_reparticiones f,
        normas_prioridades_tipos h
        WHERE
		a.idNorma = b.idNorma
		AND a.idNorma = c.idNorma
		AND c.idNormasEstadoTipo = d.idNormasEstadoTipo
		AND a.cuentaCarga = ?
		AND b.estado = 1
		AND c.estado = 1
		AND f.idReparticion = b.idReparticion
        AND h.idPrioridadTipo = b.idPrioridadTipo
        ORDER BY a.fechaCarga DESC`;

        let params = [request.idCuenta];

        let conn = await connection.poolPromise.getConnection()
            .catch(error => { throw error });

        let res = {};
        try {

            //Saca el total de normas contemplando los filtros de búsqueda
            res.totalNormas = await conn.query('SELECT COUNT(a.idNorma) FROM' + sql.split('FROM')[1], params)
                .catch(error => { throw error });

            res.normas = await conn.query(paginarQuery(request, sql), params)
                .catch(error => { throw error });

        }
        catch (error) {
            console.log(error)
            reject(error)
        }
        finally {
            await conn.release();
            resolve(res);
        }
    });
}

function traerNormasDeReparticiones(request) {
    return new Promise((resolve, reject) => {

        let sql = `SELECT a.idNorma, b.normaAcronimoReferencia, b.normaSumario, d.normasEstadoTipo, e.apellidoNombre, f.reparticion, g.prioridad
        FROM
        normas a, 
        normas_metadatos b, 
        normas_estados c,
        normas_estados_tipos d,
        gral_usuarios e,
        bo_reparticiones f,
        normas_prioridades_tipos g
        WHERE
		a.idNorma = b.idNorma
		AND a.idNorma = c.idNorma
		AND c.idNormasEstadoTipo = d.idNormasEstadoTipo
		AND a.usuarioCarga != ?
		AND b.estado = 1
		AND c.estado = 1
		AND e.idUsuario = a.usuarioCarga
		AND f.idReparticion = b.idReparticion
        AND g.idPrioridadTipo = b.idPrioridadTipo
`;

        let params = [request.idUsuario];
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

function traerObservacionesMotivos() {
    return new Promise((resolve, reject) => {

        let sql = `SELECT * FROM normas_observaciones_motivos WHERE estado = 1`;

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

function crearObservacion(request) {
    return new Promise(async (resolve, reject) => {

        let sql = `INSERT INTO normas_observaciones (
            idNorma, 
            observacion, 
            idObservacionMotivo,
            usuarioCreacion
            ) 
            
            VALUES (?,?,?,?);
            `;
        let params = [
            request.idNorma,
            request.observacion,
            request.idObservacionMotivo,
            request.usuario
        ];

        let conn = await connection.poolPromise.getConnection().catch(e => { throw e });
        let res;
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

            sql = `UPDATE normas_estados SET estado=4, fechaBorrado=CURRENT_TIMESTAMP, usuarioBorrado=? WHERE idNorma=? AND estado=1;`;
            params = [request.usuario, request.idNorma];
            await conn.query(sql, params)
                .catch((error) => {
                    throw error
                })

            await guardarLog(conn, sql, params, request)
                .catch((error) => {
                    throw error
                })

            sql = `INSERT INTO normas_estados (idNorma, idNormasEstadoTipo, usuarioCarga) VALUES (?,?,?)`;
            params = [request.idNorma, request.idNormasEstadoTipo, request.usuario]
            await conn.query(sql, params)
                .catch((error) => {
                    throw error
                })
            await guardarLog(conn, sql, params, request)
                .catch((error) => {
                    throw error
                })
            res = await conn.query(`SELECT a.email FROM bo_usuarios a
            LEFT OUTER JOIN normas b ON a.idUsuario = b.usuarioCarga
            WHERE a.estadoUsuario=1 AND b.idNorma = ?`, [request.idNorma]).catch(e => { throw e });

            await conn.commit();
            resolve(res);
        }
        catch (e) {
            reject(e);
        }
        finally {
            conn.release();
        }


    });
}


async function borrarEstadoNorma(request, conn) {
    return new Promise(async (resolve, reject) => {

        let sql = `UPDATE normas_estados SET estado=4, fechaBorrado=CURRENT_TIMESTAMP, usuarioBorrado=? WHERE idNorma=? AND estado=1;`;
        let params = [request.usuario, request.idNorma];

        conn.query(sql, params, function (error, results, fields) {

            if (error) {
                reject(error);
            }
            resolve(results);

            // Handle error after the release.
            /* if (error) throw error; */
        });

    });
}

async function traerEmail(request, conn) {
    return new Promise(async (resolve, reject) => {

        let sql = `SELECT a.email FROM gral_usuarios a
        LEFT OUTER JOIN normas b ON a.idUsuario = b.usuarioCarga
        WHERE a.estadoUsuario=1 AND b.idNorma = ?`;
        let params = [request.idNorma];

        conn.query(sql, params, function (error, results, fields) {

            if (error) {
                reject(error);
            }
            resolve(results);

            // Handle error after the release.
            /* if (error) throw error; */
        });

    });
}

async function crearEstadoNormaPorTipo(request, conn) {
    return new Promise(async (resolve, reject) => {

        let sql = `INSERT INTO normas_estados (idNorma, idNormasEstadoTipo, usuarioCarga) VALUES (?,?,?)`;
        let params = [request.idNorma, request.idNormasEstadoTipo, request.usuario]

        conn.query(sql, params, function (error, results, fields) {
            if (error) {
                reject(error);
            }
            resolve(results);
            /* if (error) throw error; */
        });
    });
}

function revision(request) {
    return new Promise((resolve, reject) => {
        let sql = `UPDATE normas_metadatos SET checkPreRevisado=? WHERE idNorma=?`
        let params = [request.checkPreRevisado, request.idNorma]

        connection.pool.getConnection(function (err, conn) {
            if (err) throw err; // not connected!

            conn.query(sql, params, (error, result) => {
                conn.release()
                if (error) {
                    reject(error)
                }
                resolve(result)
            })
        })
    })
}

function traerPrioridades() {
    return new Promise((resolve, reject) => {

        let sql = "SELECT * FROM normas_prioridades_tipos WHERE estado = 1";

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

async function asignarPrioridad(request) {
    sql = `UPDATE normas_metadatos SET idPrioridadTipo=? WHERE idNorma=? AND estado=1;`;
    params = [request.idPrioridadTipo, request.idNorma]
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

function cotizarNorma(request) {
    return new Promise(async (resolve, reject) => {

        let sql = `UPDATE normas_metadatos SET valorCotizacion=? WHERE idNorma=? AND estado=1;`;
        let params = [request.valorCotizacion, request.idNorma]

        let conn = await connection.poolPromise.getConnection();
        try {
            await conn.beginTransaction();

            await conn.query(sql, params, function (error, results) {
                if (error) throw error;
            });

            await guardarLog(conn, sql, params, request)
                .catch((error) => {
                    throw error
                })

            await conn.commit();
            resolve();
        }
        catch (e) {
            reject(e);
        }
        finally {
            conn.release();
        }
    });
}

function aprobarNormaParaCotizacion(request) {
    return new Promise(async (resolve, reject) => {

        connection.pool.getConnection(async function (err, conn) {
            if (err) throw err; // not connected!
            try {
                await conn.beginTransaction();

                await borrarEstadoNorma(request, conn);

                await crearEstadoNormaPorTipo(request, conn);

                await conn.commit();
                resolve();
            }
            catch (e) {
                reject(e);
            }
            finally {
                conn.release();
            }
        });
    });
}

function actualizarNorma(request) {
    return new Promise(async (resolve, reject) => {
        res = {};
        let sql = "";
        let params = []
        const conn = await connection.poolPromise.getConnection();
        try {
            await conn.beginTransaction();

            /* sql = "UPDATE normas_metadatos SET estado=4, fechaBorrado = CURRENT_TIMESTAMP, usuarioBorrado = ? WHERE idNormasMetadato=? AND estado=1;";
            params = [request.idUsuarioCarga, request.idNormasMetadato] */
            sql = "UPDATE normas_metadatos SET estado=4, fechaBorrado = CURRENT_TIMESTAMP, usuarioBorrado = ? WHERE idNorma=? AND estado=1;";
            params = [request.idUsuarioCarga, request.idNorma]
            res.borrarMeta = await conn.query(sql, params);

            await guardarLog(conn, sql, params, request)
                .catch((error) => {
                    throw error
                })

            sql = `INSERT INTO normas_metadatos ( idNorma,
                    idUsuarioCarga, 
                    normaAcronimoReferencia, 
                    organismoEmisor, 
                    idReparticion,
                    idSeccion,
                    idNormaTipo,
                    idNormaSubtipo,
                    normaNumero,
                    normaAnio,
                    normaSumario,
                    tags,
                    fechaSugerida,
                    fechaLimite,
                    normaArchivoOriginal,
                    normaArchivoOriginalS3Key,
                    idPrioridadTipo,
                    valorCotizacion,
                    numeroBUI,
                    normaTexto,
                    fechaDesde,
                    fechaHasta,
                    reparticiones,
                    siglasReparticiones
                    ) 
                    
                    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);`;
            params = [request.idNorma,
            request.idUsuarioCarga,
            request.normaAcronimoReferencia,
            request.organismoEmisor,
            request.idReparticion,
            request.idSeccion,
            request.idNormaTipo,
            request.idNormaSubtipo,
            request.normaNumero,
            request.normaAnio,
            request.normaSumario,
            request.tags,
            request.fechaSugerida,
            request.fechaLimite,
            request.normaArchivoOriginal,
            request.normaArchivoOriginalS3Key,
            request.idPrioridadTipo,
            request.valorCotizacion,
            request.numeroBUI,
            request.normaTexto,
            request.fechaDesde,
            request.fechaHasta,
            request.reparticiones,
            request.siglasReparticiones
            ];
            res.nuevoMeta = await conn.query(sql, params);

            await guardarLog(conn, sql, params, request)
                .catch((error) => {
                    throw error
                })

            //Cuando la norma está observada y realizo una edición, pasa a OBSERVADA_CON_RESPUESTA
            const estadoActual = await conn.query(`SELECT idNormasEstadoTipo FROM normas_estados WHERE idNorma=? AND estado=1`, [request.idNorma])
            if (estadoActual[0].idNormasEstadoTipo === 3) {
                await conn.query(`UPDATE normas_estados SET estado=4 WHERE idNorma=? AND estado=1`, [request.idNorma])
                await guardarLog(conn, `UPDATE normas_estados SET estado=4 WHERE idNorma=? AND estado=1`, [request.idNorma], request)
                    .catch((error) => {
                        throw error
                    })
                await conn.query(`INSERT INTO normas_estados (idNormasEstadoTipo, idNorma) VALUES (4,?)`, [request.idNorma])
                await guardarLog(conn, `INSERT INTO normas_estados (idNormasEstadoTipo, idNorma) VALUES (4,?)`, [request.idNorma], request)
                    .catch((error) => {
                        throw error
                    })
            }

            await conn.commit();
            resolve(res);
        }
        catch (e) {
            reject(e);
        }
        finally {
            conn.release();
        }

    });


}

/* async function borrarAnexosNorma(request) {
    let sql = `UPDATE normas_anexos SET estado=4, fechaBorrado = CURRENT_TIMESTAMP, usuarioBorrado=? WHERE idNorma=? AND estado=1;`;
    let params = [request.idUsuarioCarga, request.idNorma]
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
} */
async function borrarAnexosNorma(request) {
    let ids = [...request.idsBorrar]
    let sql = `UPDATE normas_anexos SET estado=4, fechaBorrado = CURRENT_TIMESTAMP, usuarioBorrado=? WHERE idNormasAnexo IN (${ids.join(', ')})
    AND estado=1;`;
    let params = [request.idUsuarioCarga]
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

async function aprobarNorma(request) {
    let sql = `UPDATE normas_metadatos SET fechaPublicacion=? WHERE idNorma=? AND estado=1;`;
    let sqlBorrarEstadoNorma = `UPDATE normas_estados SET estado=4, fechaBorrado=CURRENT_TIMESTAMP, usuarioBorrado=? WHERE idNorma=? AND estado=1;`;
    let sqlCrearEstado = `INSERT INTO normas_estados (idNorma, idNormasEstadoTipo, usuarioCarga) VALUES (?,?,?)`;
    let params = [request.fechaPublicacion, request.idNorma]
    let conn = await connection.poolPromise.getConnection().catch(err => { throw err });

    try {
        await conn.beginTransaction();

        await conn.query(sql, params)
            .catch(err => { throw err });

        await conn.query(sqlBorrarEstadoNorma, [
            request.usuario,
            request.idNorma
        ])
            .catch(err => { throw err });

        await conn.query(sqlCrearEstado, [
            request.idNorma,
            request.idNormasEstadoTipo,
            request.usuario
        ])
            .catch(err => { throw err });

        //Asigno la norma a un boletin, si corresponde
        if (request.idNormasEstadoTipo === 8) {

            let metadatosNorma = await conn.query('SELECT * FROM normas_metadatos WHERE idNorma=? AND estado=1', [request.idNorma]);
            //Controlo si es una norma desde-hasta
            if (metadatosNorma[0]?.fechaDesde !== null && metadatosNorma[0]?.fechaHasta !== null) {
                //Agrego la norma a los boletines cuya fecha de publicacion esté comprendida entre las fechas desde-hasta
                await conn.query(`INSERT INTO bo_boletines_normas (idBoletin, idNorma) SELECT a.idBoletin, ? 
                    FROM bo_boletines a LEFT OUTER JOIN bo_boletines_estados b ON a.idBoletin=b.idBoletin 
                    WHERE (a.fechaPublicacion BETWEEN ? AND ?) AND a.estado=1 AND b.estado=1 AND b.idBoletinEstadoTipo=1`,
                    [request.idNorma, metadatosNorma[0].fechaDesde, metadatosNorma[0].fechaHasta])
                await guardarLog(conn, `INSERT INTO bo_boletines_normas (idBoletin, idNorma) SELECT a.idBoletin, ? 
                    FROM bo_boletines a LEFT OUTER JOIN bo_boletines_estados b ON a.idBoletin=b.idBoletin 
                    WHERE (a.fechaPublicacion BETWEEN ? AND ?) AND a.estado=1 AND b.estado=1 AND b.idBoletinEstadoTipo=1`,
                    [request.idNorma, metadatosNorma[0].fechaDesde, metadatosNorma[0].fechaHasta], request)
                    .catch((error) => {
                        throw error
                    })

                //Agrego la norma a los boletines cuya fecha de publicacion coincida con las fechas de republicacion de la norma
                await conn.query(`INSERT INTO bo_boletines_normas (idBoletin, idNorma) SELECT a.idBoletin, ? 
                FROM bo_boletines a 
                LEFT OUTER JOIN bo_boletines_estados b ON a.idBoletin=b.idBoletin 
                LEFT OUTER JOIN normas_republicaciones c ON a.fechaPublicacion=c.fechaPublicacion
                WHERE c.idNorma=? AND a.estado=1 AND b.estado=1 AND b.idBoletinEstadoTipo=1`,
                    [request.idNorma, request.idNorma])
                await guardarLog(conn, `INSERT INTO bo_boletines_normas (idBoletin, idNorma) SELECT a.idBoletin, ? 
                FROM bo_boletines a 
                LEFT OUTER JOIN bo_boletines_estados b ON a.idBoletin=b.idBoletin 
                LEFT OUTER JOIN normas_republicaciones c ON a.fechaPublicacion=c.fechaPublicacion
                WHERE c.idNorma=? AND a.estado=1 AND b.estado=1 AND b.idBoletinEstadoTipo=1`,
                    [request.idNorma, request.idNorma], request)
                    .catch((error) => {
                        throw error
                    })

            }
            else {
                await conn.query(`INSERT INTO bo_boletines_normas (idBoletin, idNorma) VALUES (?, ?)`, [
                    request.idBoletin, request.idNorma
                ])
                    .catch(err => { throw err });
                await guardarLog(conn, `INSERT INTO bo_boletines_normas (idBoletin, idNorma) VALUES (?, ?)`, [
                    request.idBoletin, request.idNorma], request)
                    .catch((error) => {
                        throw error
                    })
            }
        }
        await guardarLog(conn, sql, params, request)
            .catch((error) => {
                throw error
            })
        await guardarLog(conn, sqlBorrarEstadoNorma, [
            request.usuario,
            request.idNorma
        ], request)
            .catch((error) => {
                throw error
            })
        await guardarLog(conn, sqlCrearEstado, [
            request.idNorma,
            request.idNormasEstadoTipo,
            request.usuario
        ], request)
            .catch((error) => {
                throw error
            })

        await conn.commit();
    }
    catch (e) {
        console.log(e)
        await conn.rollback();
        throw e;
    }
    finally {
        if (conn) conn.release();
    }
}

async function desaprobarNorma(request) {
    let sql = `UPDATE normas_metadatos SET fechaPublicacion=NULL, normaRevisada=0 WHERE idNorma=? AND estado=1;`;
    let sqlBorrarEstadoNorma = `UPDATE normas_estados SET estado=4, fechaBorrado=CURRENT_TIMESTAMP, usuarioBorrado=? WHERE idNorma=? AND estado=1;`;
    let sqlCrearEstado = `INSERT INTO normas_estados (idNorma, idNormasEstadoTipo, usuarioCarga) VALUES (?,?,?)`;
    let desasignarDeBoletines = `DELETE FROM bo_boletines_normas WHERE idNorma=? AND idBoletin IN (
        SELECT a.idBoletin FROM bo_boletines a LEFT OUTER JOIN bo_boletines_estados b ON a.idBoletin=b.idBoletin WHERE b.estado=1 AND b.idBoletinEstadoTipo=1
        )`;
    let params = [request.idNorma]
    let conn = await connection.poolPromise.getConnection().catch(err => { throw err });

    try {
        await conn.beginTransaction();

        await conn.query(sql, params)
            .catch(err => { throw err });

        await conn.query(sqlBorrarEstadoNorma, [
            request.usuario,
            request.idNorma
        ])
            .catch(err => { throw err });

        await conn.query(sqlCrearEstado, [
            request.idNorma,
            request.idNormasEstadoTipo,
            request.usuario
        ])
            .catch(err => { throw err });

        await conn.query(desasignarDeBoletines, params)
            .catch(err => { throw err });

        await guardarLog(conn, sql, params, request)
            .catch((error) => {
                throw error
            })
        await guardarLog(conn, sqlBorrarEstadoNorma, [request.usuario, request.idNorma], request)
            .catch((error) => {
                throw error
            })
        await guardarLog(conn, sqlCrearEstado, [
            request.idNorma,
            request.idNormasEstadoTipo,
            request.usuario
        ], request)
            .catch((error) => {
                throw error
            })

        await conn.commit();
    }
    catch (e) {
        await conn.rollback();
        throw e;
    }
    finally {
        if (conn) conn.release();
    }
}

function traerObservacionesPorIdUsuario(request) {
    return new Promise((resolve, reject) => {
        let sql = `
        SELECT a.fechaCreacion, a.observacion, c.normaAcronimoReferencia, d.motivo, a.idNorma
        FROM normas_observaciones a
        LEFT OUTER JOIN normas b ON a.idNorma = b.idNorma
        LEFT OUTER JOIN normas_metadatos c ON b.idNorma = c.idNorma
        LEFT OUTER JOIN normas_observaciones_motivos d ON a.idObservacionMotivo = d.idObservacionMotivo
        WHERE b.usuarioCarga = ?
        `;
        let params = [request.idUsuario];

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

function traerObservacionPorIdNorma(request) {
    return new Promise((resolve, reject) => {
        let sql = `
        SELECT a.fechaCreacion, a.observacion, b.normaAcronimoReferencia, c.motivo, a.idNorma
        FROM normas_observaciones a
        LEFT OUTER JOIN normas_metadatos b ON a.idNorma = b.idNorma
        LEFT OUTER JOIN normas_observaciones_motivos c ON a.idObservacionMotivo = c.idObservacionMotivo
        WHERE a.idNorma = ? AND a.estado=1 AND b.estado =1
        `;
        let params = [request.idNorma];
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

function traerDigitalizacionPorIdNorma(request) {
    return new Promise((resolve, reject) => {
        let sql = `
        SELECT idNormaDigitalizacion, normaDocumento
        FROM normas_digitalizaciones
        WHERE idNorma = ? AND estado=1
        `;
        let params = [request.idNorma];
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

async function crearDigitalizacionNorma(request) {
    let sql = `INSERT INTO normas_digitalizaciones ( idNorma,
        usuarioCreacion, 
        normaDocumento
        ) 
        
        VALUES (?,?,?);`;
    let params = [request.idNorma,
    request.idUsuarioCarga,
    String(request.normaDocumento).replace(/[\u200B-\u200D\uFEFF]/g)
    ];
    let conn = await connection.poolPromise.getConnection().catch(e => { throw e });
    try {
        await conn.beginTransaction().catch(e => { throw e });
        await conn.query(sql, params)
            .catch((error) => {
                throw error
            })
        /* await guardarLog(conn, sql, params, request)
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

function actualizarDigitalizacionPorIdNorma(request) {
    return new Promise(async (resolve, reject) => {
        res = {};
        let sql = "";
        let params = []
        const conn = await connection.poolPromise.getConnection();
        try {
            await conn.beginTransaction();

            sql = "UPDATE normas_digitalizaciones SET estado=4, fechaBorrado = CURRENT_TIMESTAMP, usuarioBorrado = ? WHERE idNormaDigitalizacion=? AND estado=1;";
            params = [request.idUsuarioCarga, request.idNormaDigitalizacion]
            res.borrarMeta = await conn.query(sql, params);

            /* await guardarLog(conn, sql, params, request)
                .catch((error) => {
                    throw error
                }) */

            sql = `INSERT INTO normas_digitalizaciones ( idNorma,
                    usuarioCreacion, 
                    normaDocumento
                    ) 
                    
                    VALUES (?,?,?);`;
            params = [request.idNorma,
            request.idUsuarioCarga,
            String(request.normaDocumento).replace(/[\u200B-\u200D\uFEFF]/g)
            ];

            res.nuevoDigi = await conn.query(sql, params).catch(e => { throw e })

            /* await guardarLog(conn, sql, params, request)
                .catch((error) => {
                    throw error
                }) */

            await conn.commit();
            resolve(res);
        }
        catch (e) {
            reject(e);
        }
        finally {
            conn.release();
        }

    });
}

function traerTrazabilidadPorIdNorma(request) {
    return new Promise((resolve, reject) => {
        let sql = `
        SELECT a.idNorma, b.fechaCarga, c.normasEstadoTipo, d.apellidoNombre, d.usuario
        FROM normas a, normas_estados b, normas_estados_tipos c, gral_usuarios d
        WHERE
        a.idNorma = b.idNorma
        AND c.idNormasEstadoTipo = b.idNormasEstadoTipo
        AND a.idNorma = ?
        AND d.idUsuario = b.usuarioCarga
        ORDER BY b.fechaCarga ASC
        `;
        let params = [request.idNorma];
        // connection.pool.getConnection(function (err, conn) {
        // if (err) throw err; // not connected!

        // Use the connection
        connection.pool.query(sql, params, function (error, results, fields) {
            // conn.release();
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }

            // Handle error after the release.
            // if (error) throw error;
        });
        // });
    });
}

function traerEstadosNormas() {
    return new Promise((resolve, reject) => {
        let sql = `SELECT * FROM normas_estados_tipos`;

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

function traerNormasConFiltro(request) {
    return new Promise(async (resolve, reject) => {

        let conn = await connection.poolPromise.getConnection()
            .catch(error => { throw error });

        let sql = `SELECT a.idNorma, a.fechaCarga, bo_cuentas.idCuenta,
        c.fechaSugerida, c.fechaLimite, c.normaNumero, c.normaAnio, c.siglasReparticiones, c.organismoEmisor, 
        e.seccionSigla, f.normasEstadoTipo, g.normaTipoSigla, i.idNormaAviso, i.motivoAsociacion, 
        c.fechaDesde, q.idBoletin, q.boletinNumero,
        c.fechaHasta, g.normaTipo, j.normaSubtipo, j.normaSubtipoSigla,c.valorCotizacion, bo_cuentas.sigla, 
        bo_cuentas.nombre AS nombreCuenta,
        bo_usuarios.apellidoNombre
        FROM normas a 
        INNER JOIN normas_estados b ON a.idNorma = b.idNorma
        INNER JOIN normas_metadatos c ON a.idNorma = c.idNorma
        LEFT OUTER JOIN bo_sumario_secciones e ON c.idSeccion = e.idSeccion
        LEFT OUTER JOIN normas_estados_tipos f ON b.idNormasEstadoTipo = f.idNormasEstadoTipo
        LEFT OUTER JOIN bo_normas_tipos g ON c.idNormaTipo = g.idNormaTipo
        LEFT OUTER JOIN bo_reparticiones h ON c.idReparticion = h.idReparticion
        LEFT OUTER JOIN normas_rel_avisos i ON a.idNorma = i.idNorma
        LEFT OUTER JOIN bo_normas_subtipos j ON c.idNormaSubtipo = j.idNormaSubtipo
        LEFT OUTER JOIN bo_cuentas ON a.cuentaCarga = bo_cuentas.idCuenta
        LEFT OUTER JOIN bo_usuarios ON a.usuarioCarga = bo_usuarios.idUsuario
        LEFT OUTER JOIN bo_boletines_normas p ON a.idNorma=p.idNorma
        LEFT OUTER JOIN bo_boletines_metadatos q ON p.idBoletin=q.idBoletin
        WHERE b.estado = 1
        AND c.estado = 1
        AND (q.estado=1 OR q.estado IS NULL)
        AND (i.estado = 1 OR i.estado IS NULL)
        `;

        //Limito las normas que puede ver si es externo
        if (request.esUsuarioExterno) {
            sql += ` AND a.cuentaCarga=${request.idCuenta}`
        }

        let params = []

        for (const [key, value] of Object.entries(request)) {
            if (!value && value !== 0) continue;
            switch (key) {
                case ('idNorma'):
                    sql = String(sql) + String(` AND a.${key}=${value}`);
                    break;
                case ('idBoletin'):
                    sql = String(sql) + String(` AND q.${key}=${value}`);
                    break;
                case ('boletinNumero'):
                    sql = `${sql} AND q.${key}='${value}'`;
                    break;
                case ('normaNumero'):
                    sql = `${sql} AND c.${key}='${value}'`;
                    break;
                case ('idSeccion'):
                    sql = String(sql) + String(` AND c.${key}=${value}`);
                    break;
                case ('idReparticion'):
                    sql = String(sql) + String(` AND c.${key}=${value}`);
                    break;
                case ('cuenta'):
                    sql = String(sql) + String(` AND bo_cuentas.idCuenta=${value}`);
                    break;
                case ('userCarga'):
                    sql = String(sql) + String(` AND a.usuarioCarga=${value}`);
                    break;
                case ('idNormasEstadoTipo'):
                    console.log("Valor de idNormasEstadoTipo:", value);
                    sql = String(sql) + String(` AND b.${key}=${value}`);
                    break;
                case ('normaAnio'):
                    sql = `${sql} AND c.${key}='${value}'`;
                    break;
                case ('fechaAprobacion'):
                    sql = `${sql} AND c.fechaPublicacion = '${request.fechaAprobacion}'`;
                    break;
                case ('fechaSugerida'):
                    sql = `${sql} AND c.fechaSugerida = '${request.fechaSugerida}'`;
                    break;
                case ('fechaCarga'):
                    sql = `${sql} AND DATE(a.fechaCarga) = '${request.fechaCarga}'`;
                    break;
                case ('fechaLimite'):
                    sql = `${sql} AND c.fechaLimite = '${request.fechaLimite}'`;
                    break;
                case ('organismoEmisor'):
                    sql = `${sql} AND c.organismoEmisor = '${request.organismoEmisor.trim()}'`;
                    break;
                case ('idNormaTipo'):
                    sql = String(sql) + String(` AND g.${key}=${value}`)
                    break;
                case ('idNormaSubtipo'):
                    sql = String(sql) + String(` AND j.${key}=${value}`)
                    break;
            }
            //sql = `${sql} LIMIT 10`;
        }


        let res = []

        try {
            //Saca el total de normas contemplando los filtros de búsqueda
            res.totalNormas = await conn.query('SELECT COUNT(*) AS total FROM' + sql.split(/FROM(.*)/s)[1], params)
                .catch(error => { throw error });

            sql += " GROUP BY a.idNorma ";

            //ORDEN
            switch (request.campo) {
                case 'idNorma':
                case 'fechaCarga':
                    sql = sql + ' ORDER BY a.' + request.campo + ' ' + request.orden;
                    break;
                case 'idNormasEstadoTipo':
                    sql = sql + ' ORDER BY b.' + request.campo + ' ' + request.orden;
                    break;
                case 'cuenta':
                    sql = sql + ' ORDER BY bo_cuentas.idCuenta' + ' ' + request.orden;
                    break;
                case 'userCarga':
                    sql = sql + ' ORDER BY a.usuarioCarga' + ' ' + request.orden;
                    break;
                case 'idReparticionOrganismo':
                    sql = sql + ' ORDER BY c.idReparticion' + ' ' + request.orden;
                    break;
                case 'tipoNorma':
                    sql = sql + ' ORDER BY c.idNormaTipo' + ' ' + request.orden;
                    break;
                case 'subtipoNorma':
                    sql = sql + ' ORDER BY c.idNormaSubtipo' + ' ' + request.orden;
                    break;
                default:
                    sql = sql + ' ORDER BY c.' + request.campo + ' ' + request.orden;
                    break;
            }

            res.normas = await conn.query(paginarQuery(request, sql), params) //Agrega LIMIT - OFFSET a la query
                .catch(error => { throw error });
        }
        catch (error) {
            reject(error)
        }
        finally {
            conn.release();
            resolve(res);
        }
    });
}

async function republicarNorma(request) {

    let sqlBorrarEstadoNorma = `UPDATE normas_estados SET estado=4, fechaBorrado=CURRENT_TIMESTAMP, usuarioBorrado=? WHERE idNorma=? AND estado=1;`;
    let sqlCrearEstado = `INSERT INTO normas_estados (idNorma, idNormasEstadoTipo, usuarioCarga) VALUES (?,?,?)`;

    let conn = await connection.poolPromise.getConnection();

    try {

        await conn.beginTransaction();

        await conn.query(sqlBorrarEstadoNorma, [request.usuario, request.documento.idNorma])
            .catch(err => { throw err });

        await conn.query(sqlCrearEstado, [request.documento.idNorma, 13, request.usuario])

        await conn.query(`UPDATE normas_metadatos SET archivoPublicado=? WHERE idNorma=? AND estado=1`,
            [request.archivoNorma, request.documento.idNorma])
            .catch(err => { throw err });

        await guardarLog(conn, sqlBorrarEstadoNorma, [request.usuario, request.documento.idNorma], request)
            .catch((error) => {
                throw error
            })
        await guardarLog(conn, sqlCrearEstado, [request.documento.idNorma, 13, request.usuario], request)
            .catch((error) => {
                throw error
            })

        await conn.commit();

    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        // Close Connection
        if (conn) conn.close();
    }
}

function traerNormaPorAcronimo(request) {
    return new Promise((resolve, reject) => {
        let sql = `SELECT a.*, b.idNormasEstadoTipo 
        FROM normas_metadatos a
        LEFT OUTER JOIN normas_estados b ON a.idNorma = b.idNorma
        WHERE a.estado = 1 
        AND b.estado = 1
        AND b.idNormasEstadoTipo != 0
        AND a.normaAcronimoReferencia = ?`;
        let params = [request.normaAcronimoReferencia];
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
async function traerSiglasParaAcronimo(request) {
    let sql = `SELECT bo_reparticiones.siglaReparticion, 
        bo_sumario_secciones.seccionSigla, 
        bo_sumario_secciones.cod_proceso, 
        bo_normas_tipos.normaTipoSigla,
        bo_normas_subtipos.normaSubtipoSigla
        FROM bo_reparticiones, bo_sumario_secciones, bo_normas_tipos
        LEFT OUTER JOIN bo_normas_subtipos ON bo_normas_subtipos.idNormaSubtipo = ?
        WHERE bo_reparticiones.idReparticion = ?
        AND bo_reparticiones.estado = 1
        AND bo_sumario_secciones.idSeccion = ?
        AND bo_sumario_secciones.estado = 1
        AND bo_normas_tipos.idNormaTipo = ?
        AND bo_normas_tipos.estado = 1`;
    let params = [request.idNormaSubtipo, request.idReparticion, request.idSeccion, request.idNormaTipo];

    let conn = await connection.poolPromise.getConnection();

    let res = {};

    try {

        await conn.beginTransaction();

        res.siglas = await conn.query(sql, params)
            .catch((error) => {
                throw error
            })

        await conn.commit();

    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        // Close Connection
        if (conn) conn.close();
        return res;
    }

};


function traerOrganismosConjuntos(request) {
    return new Promise((resolve, reject) => {
        let sql = `SELECT siglaReparticion FROM bo_reparticiones 
        WHERE estado = 1 AND idReparticion IN (${JSON.parse(request.organismosConjuntos).organismos.join(',')})`;
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

function traerOrganismoPorSigla(request) {
    return new Promise((resolve, reject) => {
        let sql = `SELECT *
        FROM bo_organismos_emisores
        WHERE sigla=?`;
        let params = [request.sigla]
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

async function editarFechaLimite(request) {
    let conn = await connection.poolPromise.getConnection();
    try {

        await conn.beginTransaction();

        const metadatosDB = await conn.query(`SELECT * FROM normas_metadatos WHERE estado=1 AND idNorma IN ${request.normas}`)
            .catch((error) => {
                throw error
            })

        await conn.query(`UPDATE normas_metadatos SET estado=4, fechaBorrado = CURRENT_TIMESTAMP, usuarioBorrado = ? WHERE idNorma IN ${request.normas} AND estado=1;`, [request.idUsuario, request.idNorma])
            .catch((error) => {
                throw error
            })

        for (const meta of metadatosDB) {
            let { fechaCarga, usuarioBorrado, idNormasMetadato, estado, ...metadatos } = meta;

            let sqlCrearMetadatos = `INSERT INTO normas_metadatos ( ${Object.keys(metadatos).join(',')} ) 
            VALUES (${Object.keys(metadatos).map(() => '?')});`;

            metadatos.idUsuarioCarga = request.idUsuario;
            metadatos.fechaLimite = request.fechaLimite;
            let params = Object.values(metadatos)

            await conn.query(sqlCrearMetadatos, params)
                .catch((error) => {
                    throw error
                })

            await guardarLog(conn, sqlCrearMetadatos, params, request)
                .catch((error) => {
                    throw error
                })
        }

        await guardarLog(conn,
            `UPDATE normas_metadatos SET estado=4, fechaBorrado = CURRENT_TIMESTAMP, usuarioBorrado = ? WHERE idNorma IN ${request.normas} AND estado=1;`,
            [request.idUsuario, request.idNorma], request)
            .catch((error) => {
                throw error
            })

        await conn.commit();

    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        // Close Connection
        if (conn) conn.close();
    }
}

async function asociarAviso(request) {
    let sql = `INSERT INTO normas_rel_avisos (idNorma, idnormaAviso, motivoAsociacion, usuarioCreacion) VALUES (?,?,?,?)`;
    let params = [request.idNorma, request.idNormaAviso, request.motivoAsociacion, request.idUsuario]

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
        // Close Connection
        if (conn) conn.close();
    }
}

function traerAvisoAsociado(request) {
    return new Promise((resolve, reject) => {
        let sql = `SELECT idNorma, idNormaAviso, motivoAsociacion FROM normas_rel_avisos WHERE idNorma=?`;
        let params = [request.idNorma]

        connection.pool.query(sql, params, function (error, results) {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
}

async function revisarNorma(request) {
    let sql = `UPDATE normas_metadatos SET normaRevisada=true WHERE idNorma=? AND estado=1`;
    let params = [request.idNorma]
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

function traerNormaTipoSubtipoGEDO(request) {
    return new Promise((resolve, reject) => {
        let sql = `SELECT a.tipoDocumentoGEDO, b.normaTipo, b.idNormaTipo, c.normaSubtipo, c.idNormaSubtipo FROM normas_gedo_tiposubtipo a
        LEFT OUTER JOIN bo_normas_tipos b ON a.idNormaTipo = b.idNormaTipo
        LEFT OUTER JOIN bo_normas_subtipos c ON a.idNormaSubtipo = c.idNormaSubtipo
        WHERE b.estado=1
        AND a.estado=1
        AND c.estado=1
        AND a.tipoDocumentoGEDO=?`;
        let params = [request.tipoDocumento]

        connection.pool.query(sql, params, function (error, results) {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
}

function traerUsuariosActivosPorIdNorma(request) {
    return new Promise((resolve, reject) => {
        let sql = `SELECT idNorma, edicionNormaBO FROM normas_usuarios_activos WHERE idNorma=?`;
        let params = [request.idNorma]

        connection.pool.query(sql, params, function (error, results) {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
}

async function registrarIngresoEdicion(request) {
    let sql = `INSERT INTO normas_usuarios_activos (idNorma, edicionNormaBO) VALUES (?, '${JSON.stringify(request.edicionNormaBO)}') 
        ON DUPLICATE KEY UPDATE edicionNormaBO='${JSON.stringify(request.edicionNormaBO)}';`;
    let params = [request.idNorma, request.idNorma]
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

function buscarPermisosPorJerarquia(request) {
    return new Promise((resolve, reject) => {
        let sql = `SELECT * FROM bo_permisos_carga_usuarios WHERE idUsuario=? AND estado=1;`;
        let params = [request.idUsuario]

        connection.pool.query(sql, params, function (error, results) {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
}

function traerPublicacionesNormaDesdeHasta(request) {
    return new Promise((resolve, reject) => {
        let sql = `
        (
            SELECT a.idNorma, a.fechaPublicacion, b.idBoletin, d.boletinNumero, f.boletinEstadoTipo
            FROM normas_republicaciones a 
            LEFT OUTER JOIN bo_boletines b ON a.fechaPublicacion = b.fechaPublicacion
            LEFT OUTER JOIN bo_boletines_normas c ON (b.idBoletin = c.idBoletin AND a.idNorma=c.idNorma)
            LEFT OUTER JOIN bo_boletines_metadatos d ON b.idBoletin = d.idBoletin
            LEFT OUTER JOIN bo_boletines_estados e ON b.idBoletin = e.idBoletin
            LEFT OUTER JOIN bo_boletines_estados_tipos f ON e.idBoletinEstadoTipo = f.idBoletinEstadoTipo
            WHERE a.idNorma=? AND (d.estado=1 OR d.estado IS NULL) AND (e.estado=1 OR e.estado IS NULL)
        )
        UNION ALL
        (
            SELECT a.idNorma, b.fechaPublicacion, b.idBoletin, d.boletinNumero, f.boletinEstadoTipo
            FROM normas_metadatos a 
            LEFT OUTER JOIN bo_boletines b ON (b.fechaPublicacion BETWEEN a.fechaDesde AND a.fechaHasta)
            LEFT OUTER JOIN bo_boletines_normas c ON b.idBoletin = c.idBoletin
            LEFT OUTER JOIN bo_boletines_metadatos d ON b.idBoletin = d.idBoletin
            LEFT OUTER JOIN bo_boletines_estados e ON b.idBoletin = e.idBoletin
            LEFT OUTER JOIN bo_boletines_estados_tipos f ON e.idBoletinEstadoTipo = f.idBoletinEstadoTipo
            WHERE a.idNorma=? AND a.estado=1
            AND c.idNorma=?
            AND (d.estado=1 OR d.estado IS NULL)
            AND (e.estado=1 OR e.estado IS NULL)
        )
        ORDER BY fechaPublicacion ASC
        `;

        let params = [request.idNorma, request.idNorma, request.idNorma]

        connection.pool.query(sql, params, function (error, results) {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
}

async function guardarRepublicaciones(request) {
    let conn = await connection.poolPromise.getConnection().catch(e => { throw e });
    try {
        await conn.beginTransaction().catch(e => { throw e });

        //Recibo en idNorma y el array de fechas. Ej: request.fechas=['2023-07-12', '2023-07-13']
        //Son todas las fechas que se encuentran marcadas en el calendario de publicaciones, sin importar si son nuevas o si ya estaban marcadas.
        //Por lo tanto, hay que eliminar de la base de datos las republicaciones cuya fecha no esté en el array que recibo.
        if (request.fechas.length > 0) {
            let sql = `DELETE FROM normas_republicaciones WHERE idNorma=? AND fechaPublicacion NOT IN (?)`
            let params = [request.idNorma, request.fechas]

            await conn.query(sql, params)
                .catch((error) => {
                    throw error
                })
            await guardarLog(conn, sql, params, request)
                .catch((error) => {
                    throw error
                })

            const fechasExistentes = await conn.query(
                'SELECT DATE_FORMAT(fechaPublicacion, "%Y-%m-%d") AS fecha FROM normas_republicaciones WHERE idNorma=?',
                [request.idNorma])

            const fechasParaAgregar = request.fechas.filter(fecha => !fechasExistentes.map(n => n.fecha).includes(fecha))

            if (fechasParaAgregar.length > 0) {
                sql = `INSERT INTO normas_republicaciones (idNorma, fechaPublicacion) VALUES ${fechasParaAgregar.map(n => (`(${request.idNorma},'${n}')`))}`;

                await conn.query(sql)
                    .catch((error) => {
                        throw error
                    })
                await guardarLog(conn, sql, [], request)
                    .catch((error) => {
                        throw error
                    })

                //Chequeo si hay algun boletin para las nuevas fechas
                const boles = await conn.query(`SELECT * FROM bo_boletines WHERE fechaPublicacion IN (?)`, [fechasParaAgregar])

                //Si hay, asigno la norma al boletin, pero sólo si está aprobada
                const [estaAprobada] = await conn.query('SELECT 1 FROM normas_estados WHERE idNormasEstadoTipo >= 7 AND idNorma=?', [request.idNorma])

                if (estaAprobada && boles.length > 0) {
                    sql = `INSERT INTO bo_boletines_normas (idBoletin, idNorma) VALUES ${boles.map(n => (`(${n.idBoletin},${request.idNorma})`))}`;

                    await conn.query(sql)
                        .catch((error) => {
                            throw error
                        })
                    await guardarLog(conn, sql, [], request)
                        .catch((error) => {
                            throw error
                        })
                }
            }

            //Si la norma está asignada a algún boletín para las fechas a eliminar, desasigno
            await conn.query(`DELETE FROM bo_boletines_normas 
                WHERE idNorma=? 
                AND idBoletin IN (
                    SELECT idBoletin FROM bo_boletines WHERE fechaPublicacion NOT IN (?)
                    AND fechaPublicacion NOT BETWEEN (SELECT fechaDesde FROM normas_metadatos WHERE idNorma=? AND estado=1) 
                    AND (SELECT fechaHasta FROM normas_metadatos WHERE idNorma=? AND estado=1)
                )`, [request.idNorma, request.fechas, request.idNorma, request.idNorma])

        }
        //Si no recibo ninguna fecha en el array, lo unico que hay que hacer es eliminar todas las republicaciones para esa norma, si es que hay alguna
        //Y sacarla de todos los boletines cuya fecha de publicacion no esté dentro del período desde-hasta de la norma
        else {
            let sql = `DELETE FROM normas_republicaciones WHERE idNorma=?`
            let params = [request.idNorma]

            await conn.query(sql, params)
                .catch((error) => {
                    throw error
                })
            await guardarLog(conn, sql, params, request)
                .catch((error) => {
                    throw error
                })

            //Si la norma está asignada a algún boletín para las fechas a eliminar, desasigno
            await conn.query(`DELETE FROM bo_boletines_normas 
                WHERE idNorma=? 
                AND idBoletin IN (
                    SELECT idBoletin FROM bo_boletines 
                    WHERE fechaPublicacion NOT BETWEEN (SELECT fechaDesde FROM normas_metadatos WHERE idNorma=? AND estado=1) 
                    AND (SELECT fechaHasta FROM normas_metadatos WHERE idNorma=? AND estado=1)
                )`, [request.idNorma, request.idNorma, request.idNorma])

        }

        await conn.commit();
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        if (conn) conn.close();
    }
}

function traerUsuarios(request) {
    return new Promise((resolve, reject) => {
        let sql = `SELECT DISTINCT a.apellidoNombre, b.nombre
                    FROM bo_usuarios a
                    LEFT OUTER JOIN bo_cuentas b ON a.idCuenta = b.idCuenta
                    LEFT OUTER JOIN perm_cuentas_perfiles c ON b.idCuenta = c.idCuenta
                    LEFT OUTER JOIN perm_perfiles d ON c.idPerfil = d.idPerfil
                    WHERE d.idPerfil = 2
                    AND a.estadoUsuario = 1
                    AND b.estado = 1
                    AND a.idCuenta IN (
                        SELECT b.idCuenta
                        FROM bo_usuarios a
                        LEFT OUTER JOIN bo_cuentas b ON a.idCuenta = b.idCuenta
                        WHERE a.idUsuario = ?
                    )
                    AND a.idUsuario != ?`;

        let params = [request.idUsuario, request.idUsuario];
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

function traerPerfil(request) {
    return new Promise((resolve, reject) => {
        let sql = `SELECT c.idPerfil
                    FROM bo_usuarios a
                    LEFT OUTER JOIN bo_cuentas b ON a.idCuenta = b.idCuenta
                    LEFT OUTER JOIN perm_cuentas_perfiles c ON b.idCuenta = c.idCuenta
                    LEFT OUTER JOIN perm_perfiles d ON c.idPerfil = d.idPerfil
                    WHERE (d.idPerfil = 2 OR d.idPerfil = 5)
                    AND a.estadoUsuario = 1
                    AND b.estado = 1
                    AND a.idUsuario = ?;`;

        let params = [request.idUsuario];
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

function traerCuenta(request) {
    return new Promise((resolve, reject) => {
        let sql = `SELECT DISTINCT b.nombre
                    FROM bo_usuarios a
                    LEFT OUTER JOIN bo_cuentas b ON a.idCuenta = b.idCuenta
                    LEFT OUTER JOIN perm_cuentas_perfiles c ON b.idCuenta = c.idCuenta
                    LEFT OUTER JOIN perm_perfiles d ON c.idPerfil = d.idPerfil
                    WHERE (d.idPerfil = 2 OR d.idPerfil = 5)
                    AND a.estadoUsuario = 1
                    AND b.estado = 1
                    AND a.idCuenta IN (
                        SELECT b.idCuenta
                        FROM bo_usuarios a
                        LEFT OUTER JOIN bo_cuentas b ON a.idCuenta = b.idCuenta
                        WHERE a.idUsuario = ?
                    )`;

        let params = [request.idUsuario];
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

module.exports = {
    crearMetadatosNorma,
    traerAnexosPorIdNorma,
    crearAnexoNorma,
    traerNormaPorId,
    traerNormasDelUsuario,
    traerNormasDeReparticionesDelUsuario,
    borrarNorma,
    crearNorma,
    traerNormasDeCuenta,
    traerNormasDeReparticiones,
    crearEstadoNorma,
    traerObservacionesMotivos,
    crearObservacion,
    revision,
    traerPrioridades,
    crearEstadoNormaPorTipo,
    borrarEstadoNorma,
    asignarPrioridad,
    cotizarNorma,
    aprobarNormaParaCotizacion,
    actualizarNorma,
    aprobarNorma,
    desaprobarNorma,
    borrarAnexosNorma,
    traerObservacionesPorIdUsuario,
    traerObservacionPorIdNorma,
    crearDigitalizacionNorma,
    traerDigitalizacionPorIdNorma,
    actualizarDigitalizacionPorIdNorma,
    traerTrazabilidadPorIdNorma,
    traerEstadosNormas,
    traerNormasConFiltro,
    republicarNorma,
    traerNormaPorAcronimo,
    traerSiglasParaAcronimo,
    traerOrganismosConjuntos,
    traerOrganismoPorSigla,
    editarFechaLimite,
    asociarAviso,
    traerAvisoAsociado,
    revisarNorma,
    traerNormaTipoSubtipoGEDO,
    traerUsuariosActivosPorIdNorma,
    registrarIngresoEdicion,
    buscarPermisosPorJerarquia,
    traerPublicacionesNormaDesdeHasta,
    guardarRepublicaciones,
    traerUsuarios, traerPerfil, traerCuenta
}