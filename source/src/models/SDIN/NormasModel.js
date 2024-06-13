var connection = require("../../services/conexion-mariadb");
const { paginarQuery } = require('../../helpers/paginacion');
const { guardarLog } = require('../../helpers/logs')

const xml2js = require('xml2js');
const { DOMParser } = require('xmldom');
const moment = require('moment')

function traerNormasNoPublicadasBO(request) {
    return new Promise(async (resolve, reject) => {
        let sql = `SELECT a.idNorma,b.normaNumero,c.seccionSigla, b.fechaPublicacion, a.fechaCarga, sdd.normaDocumento,
        b.organismoEmisor AS siglaOrganismo, b.fechaLimite, b.normaAnio, b.normaSumario, org.nombre AS organismo,
        d.siglaReparticion, d.reparticion, e.normaTipo, f.normaSubtipo, h.normasEstadoTipo, c.seccion, b.normaAcronimoReferencia,
        snm.idNormaSDIN, snm.importadaBO, sdin_usuarios.apellidoNombre, snet.normasEstadoTipo AS normasEstadoTipoSDIN, b.normaArchivoOriginalS3Key, 
        snet.idNormasEstadoTipo AS idNormasEstadoTipoSDIN
        FROM normas a
        LEFT OUTER JOIN normas_metadatos b ON a.idNorma = b.idNorma
        LEFT OUTER JOIN bo_sumario_secciones c ON b.idSeccion = c.idSeccion
        LEFT OUTER JOIN bo_reparticiones d ON b.idReparticion = d.idReparticion 
        LEFT OUTER JOIN normas_digitalizaciones sdd ON b.idNorma = sdd.idNorma 
        LEFT OUTER JOIN (
            SELECT
                sigla,
                nombre 
            FROM
                bo_organismos_emisores
            GROUP BY sigla
        ) org ON b.organismoEmisor = org.sigla
        LEFT OUTER JOIN bo_normas_tipos e ON b.idNormaTipo = e.idNormaTipo
        LEFT OUTER JOIN bo_normas_subtipos f ON b.idNormaSubtipo=f.idNormaSubtipo
        LEFT OUTER JOIN normas_estados g ON a.idNorma = g.idNorma
        LEFT OUTER JOIN normas_estados_tipos h ON g.idNormasEstadoTipo = h.idNormasEstadoTipo
        LEFT OUTER JOIN (SELECT MAX(idNormaSDIN) AS idNormaSDIN, idNorma, importadaBO FROM sdin_normas_metadatos GROUP BY idNorma) snm ON snm.idNorma = a.idNorma
        LEFT OUTER JOIN sdin_normas_estados sne ON sne.idNormaSDIN = snm.idNormaSDIN AND sne.idNormasEstadoTipo != 0
        LEFT OUTER JOIN sdin_normas_estados_tipos snet ON snet.idNormasEstadoTipo = sne.idNormasEstadoTipo
        LEFT OUTER JOIN sdin_usuarios ON sne.idUsuarioAsignado = sdin_usuarios.idUsuario
        LEFT OUTER JOIN sdin_sumario_secciones_importables sssi ON sssi.idSeccion=b.idSeccion
        WHERE b.estado= 1 AND g.estado=1
        AND /* g.idNormasEstadoTipo = 1 OR  */g.idNormasEstadoTipo= 8
        AND b.normaRevisada = 1 AND (sne.estado=1 OR sne.estado IS NULL) AND (sdd.estado=1 OR sdd.estado IS NULL)
        AND sssi.idSeccion IS NOT NULL 
        `;

        let params = []

        for (const [key, value] of Object.entries(request)) {
            if (!value) continue;
            switch (key) {
                case ('idNormasEstadoTipo'):
                    sql += ` AND sne.idNormasEstadoTipo=?`;
                    params.push(value)
                    break;
                case ('fechaLimite'):
                    sql += ` AND b.fechaLimite=?`;
                    params.push(value)
                    break;
                case ('idNormaSubtipo'):
                    sql += ` AND b.idNormaSubtipo=?`;
                    params.push(value)
                    break;
                case ('idNormaTipo'):
                    sql += ` AND b.idNormaTipo=?`;
                    params.push(value)
                    break;
                case ('normaNumero'):
                    sql += ` AND b.normaNumero=?`;
                    params.push(value)
                    break;
                case ('idSeccion'):
                    sql += ` AND b.idSeccion=?`;
                    params.push(value)
                    break;
                case ('boletinNumero'):
                    sql += ` AND bbm.boletinNumero=?`;
                    params.push(value)
                    break;
                case ('analista'):
                    sql += ` AND sne.idUsuarioAsignado=?`;
                    params.push(value)
                    break;
                default: break;
            }
        }

        //ORDEN
        switch (request.campo) {
            case 'idNorma':
            case 'fechaCarga':
                sql = sql + ' ORDER BY a.' + request.campo + ' ' + request.orden;
                break;
            case 'idNormasEstadoTipo':
                sql = sql + ' ORDER BY b.' + request.campo + ' ' + request.orden;
                break;
            default:
                sql = sql + ' ORDER BY c.' + request.campo + ' ' + request.orden;
                break;
        }

        let res = []

        let conn = await connection.poolPromise.getConnection()
            .catch(error => { throw error });
        try {
            //Saca el total de normas contemplando los filtros de búsqueda
            res.totalNormas = await conn.query('SELECT COUNT(a.idNorma) FROM' + sql.split(/FROM(.*)/s)[1], params)
                .catch(error => { throw error });
            res.normas = await conn.query(paginarQuery(request, sql), params) //Agrega LIMIT - OFFSET a la query
                .catch(error => { throw error });
            res.anexos = []
            if (res.normas.length > 0) {
                const sql_anexos = `SELECT idNorma, normaAnexoArchivo, normaAnexoArchivoS3Key 
                FROM normas_anexos WHERE idNorma IN (${res.normas.map(n => n.idNorma).join()})`;
                res.anexos = await conn.query(sql_anexos)
                    .catch(error => { throw error });
            }
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

function traerNormasPublicadasBO(request) {
    return new Promise(async (resolve, reject) => {
        let sql = `SELECT a.idNorma,b.normaNumero,c.seccionSigla, b.fechaPublicacion, ssd.normaDocumento,
        b.organismoEmisor AS siglaOrganismo,b.fechaLimite,b.fechaSugerida,b.normaAnio,b.normaSumario,
        d.siglaReparticion, e.normaTipo, f.normaSubtipo, h.normasEstadoTipo, org.nombre AS organismo,
        bbm.boletinNumero, snm.importadaBO, sdin_usuarios.apellidoNombre, d.reparticion,
        snet.normasEstadoTipo AS normasEstadoTipoSDIN, c.seccion, b.normaAcronimoReferencia, snm.idNormaSDIN, b.normaArchivoOriginalS3Key,
        snet.idNormasEstadoTipo AS idNormasEstadoTipoSDIN
        FROM normas a
        LEFT OUTER JOIN normas_metadatos b ON a.idNorma = b.idNorma
        LEFT OUTER JOIN normas_digitalizaciones ssd ON b.idNorma = ssd.idNorma 
        LEFT OUTER JOIN bo_sumario_secciones c ON b.idSeccion = c.idSeccion
        LEFT OUTER JOIN bo_reparticiones d ON b.idReparticion = d.idReparticion 
        LEFT OUTER JOIN (SELECT sigla, nombre FROM bo_organismos_emisores GROUP BY sigla) org ON b.organismoEmisor = org.sigla
        LEFT OUTER JOIN bo_normas_tipos e ON b.idNormaTipo = e.idNormaTipo
        LEFT OUTER JOIN bo_normas_subtipos f ON b.idNormaSubtipo=f.idNormaSubtipo
        LEFT OUTER JOIN normas_estados g ON a.idNorma = g.idNorma
        LEFT OUTER JOIN normas_estados_tipos h ON g.idNormasEstadoTipo = h.idNormasEstadoTipo
        LEFT OUTER JOIN bo_boletines_normas bbn ON bbn.idNorma=a.idNorma
        LEFT OUTER JOIN bo_boletines_metadatos bbm ON bbn.idBoletin=bbm.idBoletin
        LEFT OUTER JOIN (SELECT MAX(idNormaSDIN) AS idNormaSDIN, idNorma, importadaBO FROM sdin_normas_metadatos GROUP BY idNorma) snm ON snm.idNorma=a.idNorma
        LEFT OUTER JOIN sdin_normas_estados sne ON sne.idNormaSDIN = snm.idNormaSDIN
        LEFT OUTER JOIN sdin_normas_estados_tipos snet ON snet.idNormasEstadoTipo = sne.idNormasEstadoTipo
        LEFT OUTER JOIN sdin_usuarios ON sne.idUsuarioAsignado = sdin_usuarios.idUsuario
        LEFT OUTER JOIN sdin_sumario_secciones_importables sssi ON sssi.idSeccion=b.idSeccion
        WHERE b.estado= 1 AND g.estado=1 AND (ssd.estado=1 OR ssd.estado IS NULL)
        AND g.idNormasEstadoTipo = 11
        AND b.normaRevisada = 1
        AND bbn.idNorma IS NOT NULL
        AND (sne.estado=1 OR sne.estado IS NULL)
        AND sssi.idSeccion IS NOT NULL
        AND bbm.estado=1
        `;

        let params = []

        for (const [key, value] of Object.entries(request)) {
            if (!value) continue;
            switch (key) {
                case ('idNormasEstadoTipo'):
                    sql += ` AND sne.idNormasEstadoTipo=?`;
                    params.push(value)
                    break;
                /* case ('fechaCarga'):
                    sql = String(sql) + String(` AND DATE_FORMAT(a.fechaCarga, '%Y-%m-%d')=?`);
                    params.push(value)
                    break; */
                case ('fechaPublicacion'):
                    sql += ` AND b.fechaPublicacion=?`;
                    params.push(value)
                    break;
                case ('idNormaSubtipo'):
                    sql += ` AND b.idNormaSubtipo=?`;
                    params.push(value)
                    break;
                case ('idNormaTipo'):
                    sql += ` AND b.idNormaTipo=?`;
                    params.push(value)
                    break;
                case ('normaNumero'):
                    sql += ` AND b.normaNumero=?`;
                    params.push(value)
                    break;
                case ('idSeccion'):
                    sql += ` AND b.idSeccion=?`;
                    params.push(value)
                    break;
                case ('boletinNumero'):
                    sql += ` AND bbm.boletinNumero=?`;
                    params.push(value)
                    break;
                case ('analista'):
                    sql += ` AND sne.idUsuarioAsignado=?`;
                    params.push(value)
                    break;
                default: break;
            }
        }


        let res = []

        let conn = await connection.poolPromise.getConnection()
            .catch(error => { throw error });
        try {
            //Saca el total de normas contemplando los filtros de búsqueda
            res.totalNormas = await conn.query('SELECT COUNT(*) FROM' + sql.split(/FROM(.*)/s)[1], params)
                .catch(error => { throw error });
            //ORDEN
            switch (request.campo) {
                case 'idNorma':
                case 'fechaCarga':
                    sql = sql + ' ORDER BY a.' + request.campo + ' ' + request.orden;
                    break;
                case 'idNormasEstadoTipo':
                    sql = sql + ' ORDER BY b.' + request.campo + ' ' + request.orden;
                    break;
                default:
                    sql = sql + ' ORDER BY c.' + request.campo + ' ' + request.orden;
                    break;
            }
            res.normas = await conn.query(paginarQuery(request, sql), params) //Agrega LIMIT - OFFSET a la query
                .catch(error => { throw error });
            res.anexos = []
            if (res.normas.length > 0) {
                const sql_anexos = `SELECT idNorma, normaAnexoArchivo, normaAnexoArchivoS3Key 
                    FROM normas_anexos WHERE idNorma IN (${res.normas.map(n => n.idNorma).join()})`;
                res.anexos = await conn.query(sql_anexos)
                    .catch(error => { throw error });
            }
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

async function importarNormasNoPublicadasBO(request) {
    let conn = await connection.poolPromise.getConnection();
    try {
        await conn.beginTransaction();

        const metadatosBO = await conn.query(`SELECT a.*, e.idNormaTipo AS idNormaTipoSDIN, f.organismo_equivalente
        FROM normas_metadatos a
        LEFT OUTER JOIN bo_normas_tipos d ON a.idNormaTipo=d.idNormaTipo
        LEFT OUTER JOIN sdin_normas_tipos e ON d.nombreSDIN=e.normaTipo
        LEFT OUTER JOIN sdin_sumario_secciones_importables f ON f.idSeccion = a.idSeccion
        WHERE a.estado=1 AND a.idNorma IN (${request.normas})`)
            .catch((error) => {
                throw error
            })
        if (metadatosBO?.length === 0) {
            throw `No se encontraron los metadatos de las normas. (${request.normas})`
        }
        const digitalizacionesBO = await conn.query(`SELECT * FROM normas_digitalizaciones 
        WHERE idNorma IN (${String(request.normas.map(n => String(n)))}) AND estado=1`)


        //Traigo las reparticiones que están como dependencia en sdin
        const repasImportables = await conn.query(
            `select a.idDependencia, a.sigla
            from sdin_dependencias a, bo_reparticiones b 
            WHERE a.sigla = b.siglaReparticion
            AND a.estado = 1 AND b.estado = 1`);

        for (const meta of metadatosBO) {
            const idReparticion = await conn.query(`
                select a.idDependencia as id
                from sdin_dependencias a, bo_reparticiones b 
                WHERE a.sigla = b.siglaReparticion
                AND a.estado = 1 AND b.estado = 1 AND b.idReparticion=?`, [meta.idReparticion])

            let sqlCrearNorma = `INSERT INTO sdin_normas ( usuarioCarga ) VALUES (?);`;
            let sqlCrearEstado = `INSERT INTO sdin_normas_estados ( idNormaSDIN, idNormasEstadoTipo, usuarioCarga ) 
            VALUES (?, ?, ?);`;
            let sqlCrearMetadatos = `INSERT INTO sdin_normas_metadatos ( 
                idNormaSDIN, 
                importadaBO, 
                idNorma, 
                normaAcronimoReferencia, 
                idNormaTipo, 
                idNormaSubtipo,
                idSeccion,
                idReparticion,
                normaAnio,
                normaNumero, 
                normaSumario, 
                archivo,
                archivoS3,
                usuarioCarga,
                fechaSancion,
                firmantes,
                idReparticionOrganismo,
                alcance,
                idTipoPublicacion,
                idGestion) 
            VALUES (?,1,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'P',1,?);`;

            const norma = await conn.query(sqlCrearNorma, [request.idUsuario])
                .catch((error) => {
                    throw error
                })

            await conn.query(sqlCrearEstado, [norma.insertId, 1, request.idUsuario])
                .catch((error) => {
                    throw error
                })

            const digitalizacion = digitalizacionesBO.find((elem) => elem.idNorma === meta.idNorma);
            let textoNorma = '';
            if (digitalizacion !== undefined) {
                textoNorma = String(digitalizacion.normaDocumento)
            }

            let fechaSancion = null;
            let firmantes = null;
            let idGestion = null;
            if (textoNorma.length > 0) {
                fechaSancion = textoNorma?.match(/Buenos Aires, \d+ de [a-zA-Z]+ de 20\d{2}/) ? textoNorma?.match(/Buenos Aires, \d+ de [a-zA-Z]+ de 20\d{2}/)[0] : null;
                if (fechaSancion) {
                    moment.locale('es');
                    fechaSancion = fechaSancion.replace('Buenos Aires,', '').trim();
                    fechaSancion = moment(fechaSancion, 'LL').format('YYYY-MM-DD');
                } else {
                    fechaSancion = null;
                }
            }
            if (textoNorma.length > 0) {
                firmantes = textoNorma?.split('.')[textoNorma?.split('.')?.length - 1]
                if (firmantes.length > 0) {
                    firmantes = firmantes.match(/<b>[^<]+<\/b>/)
                    if (firmantes) {
                        firmantes = firmantes[0]?.replace('<b>', '')?.replace('</b>', '')
                    } else {
                        firmantes = null
                    }
                } else {
                    firmantes = null
                }
                //firmantes = textoNorma?.split('.')[textoNorma?.split('.')?.length - 1]?.match(/<b>[^<]+<\/b>/)[0]?.replace('<b>', '')?.replace('</b>', '') ?? '';
            }

            if (fechaSancion && fechaSancion.length > 0) {
                const gestion = await conn.query('SELECT idGestion FROM sdin_gestiones WHERE (? BETWEEN fechaDesde AND fechaHasta) OR (fechaDesde < ? AND fechaHasta IS NULL)', [fechaSancion, fechaSancion])
                console.log(gestion)
                if (gestion.length > 0) {
                    idGestion = gestion[0].idGestion;
                }
            }

            await conn.query(sqlCrearMetadatos, [
                norma.insertId,
                meta.idNorma,
                meta.normaAcronimoReferencia,
                meta.idNormaTipoSDIN,
                meta.idNormaSubtipo,
                meta.idSeccion,
                idReparticion?.length == 1 ? idReparticion[0].id : null,
                meta.normaAnio,
                meta.normaNumero,
                meta.normaSumario,
                meta.normaArchivoOriginal,
                meta.normaArchivoOriginalS3Key,
                request.idUsuario,
                fechaSancion,
                firmantes,
                meta.organismo_equivalente,
                idGestion
            ])
                .catch((error) => {
                    throw error
                })

            //Guardo texto original
            await conn.query(`INSERT sdin_normas_textos_originales (idNormaSDIN, textoOriginal) VALUES (?,?)`, [norma.insertId, textoNorma])
                .catch((error) => {
                    throw error
                })

            //Importo las repas como dependencias
            const repas = meta.siglasReparticiones.trim().split('-');

            for (const r of repas) {
                let dependencia = repasImportables.find(n => n.sigla === r);
                if (dependencia) {
                    await conn.query(`INSERT INTO sdin_normas_dependencias (idNorma, idDependencia) VALUES (?,?)`,
                        [norma.insertId, dependencia.idDependencia])
                }
            }

            const anexosBO = await conn.query(`SELECT normaAnexoArchivo, normaAnexoArchivoS3Key 
            FROM normas_anexos 
            WHERE idNorma=?`, [meta.idNorma])
                .catch((error) => {
                    throw error
                })

            if (anexosBO.length > 0) {
                for (const anexo of anexosBO) {
                    let sqlInsertarAnexo = `INSERT sdin_normas_anexos (archivo, archivoS3)
                            VALUE (?, ?);`;

                    await conn.query(sqlInsertarAnexo, [anexo.normaAnexoArchivo, anexo.normaAnexoArchivoS3Key])
                        .catch((error) => {
                            throw error
                        })
                }
            }

            //Logs
            await guardarLog(conn, sqlCrearNorma, [request.idUsuario], request).catch((error) => { throw error })
            await guardarLog(conn, sqlCrearEstado, [norma.insertId, 1, request.idUsuario], request).catch((error) => { throw error })
            await guardarLog(conn, sqlCrearMetadatos, [
                norma.insertId,
                meta.idNorma,
                meta.normaAcronimoReferencia,
                meta.idNormaTipoSDIN,
                meta.idNormaSubtipo,
                meta.idSeccion,
                idReparticion?.length == 1 ? idReparticion[0].id : null,
                meta.normaAnio,
                meta.normaNumero,
                meta.normaSumario,
                meta.normaArchivoOriginal,
                meta.normaArchivoOriginalS3Key,
                request.idUsuario,
                fechaSancion,
                firmantes,
                meta.organismo_equivalente,
                idGestion
            ], request).catch((error) => { throw error })
        }

        //Registro el evento 'importar normas no publicadas'
        let sqlUser = `SELECT mig_nombre FROM sdin_usuarios WHERE idUsuario =?`
        let usuario = await conn.query(sqlUser, [request?.idUsuario]).catch((error) => { throw error })
        let normasAImportar = [...request.normas]
        for (const n of normasAImportar) {
            try {
                let sqlEvento = `INSERT INTO trazabilidad (idNorma,negocio,operacion,usuario,tipoOperacion) VALUES (?,'SDIN',?,?,10)`;
                let operacionEvento = `El usuario:${usuario[0].mig_nombre} importa la norma (${n}) a SDIN`;
                let paramsEvento = [n, operacionEvento, request.idUsuario];

                await conn.query(sqlEvento, paramsEvento);
            } catch (error) {
                console.error("Error al registrar evento:", error);
                throw error
                // Puedes decidir si quieres lanzar una excepción aquí o manejar el error de alguna otra manera
            }
        }


        await conn.commit();

    } catch (error) {
        console.log(error)
        await conn.rollback();
        throw error;
    } finally {
        // Close Connection
        if (conn) conn.close();
    }
}

async function importarNormasPublicadasBO(request) {
    /* En el request tengo .normas y .idUsuario */
    let conn = await connection.poolPromise.getConnection();
    try {
        await conn.beginTransaction();

        const metadatosBO = await conn.query(`SELECT a.*, c.boletinNumero, e.idNormaTipo AS idNormaTipoSDIN, f.organismo_equivalente
            FROM normas_metadatos a 
            LEFT OUTER JOIN bo_boletines_normas b ON a.idNorma=b.idNorma 
            LEFT OUTER JOIN bo_boletines_metadatos c ON c.idBoletin=b.idBoletin
            LEFT OUTER JOIN bo_normas_tipos d ON a.idNormaTipo=d.idNormaTipo
            LEFT OUTER JOIN sdin_normas_tipos e ON d.nombreSDIN=e.normaTipo
            LEFT OUTER JOIN sdin_sumario_secciones_importables f ON f.idSeccion = a.idSeccion
            WHERE a.estado=1 AND c.estado=1 AND a.idNorma IN (${request.normas})
            ORDER BY c.boletinNumero`)
            .catch((error) => {
                throw error
            })
        if (metadatosBO?.length === 0) {
            throw `No se encontraron los metadatos de las normas. (${request.normas})`
        }
        const digitalizacionesBO = await conn.query(`SELECT * FROM normas_digitalizaciones 
            WHERE idNorma IN (${String(request.normas.map(n => String(n)))}) AND estado=1`)

        //Traigo las reparticiones que están como dependencia en sdin
        const repasImportables = await conn.query(
            `select a.idDependencia, a.sigla
            from sdin_dependencias a, bo_reparticiones b 
            WHERE a.sigla = b.siglaReparticion
            AND a.estado = 1 AND b.estado = 1`);

        for (const meta of metadatosBO) {
            const idReparticion = await conn.query(`
                select a.idDependencia as id
                from sdin_dependencias a, bo_reparticiones b 
                WHERE a.sigla = b.siglaReparticion
                AND a.estado = 1 AND b.estado = 1 AND b.idReparticion=?`, [meta.idReparticion])

            let sqlCrearNorma = `INSERT INTO sdin_normas ( usuarioCarga ) VALUES (?);`;
            let sqlCrearEstado = `INSERT INTO sdin_normas_estados ( idNormaSDIN, idNormasEstadoTipo, usuarioCarga ) 
            VALUES (?, ?, ?);`;
            let sqlCrearMetadatos = `INSERT INTO sdin_normas_metadatos ( 
                idNormaSDIN, 
                importadaBO, 
                idNorma, 
                normaAcronimoReferencia, 
                idNormaTipo, 
                idNormaSubtipo,
                idSeccion,
                idReparticion,
                normaAnio,
                normaNumero, 
                normaSumario,
                archivo,
                archivoS3,
                usuarioCarga,
                estado,
                fechaPublicacion,
                numeroBO,
                idTipoPublicacion,
                fechaSancion,
                firmantes,
                idReparticionOrganismo,
                alcance,
                idGestion)
            VALUES (?,1,?,?,?,?,?,?,?,?,?,?,?,?,1,?,?,1,?,?,?,'P',?);`;

            const norma = await conn.query(sqlCrearNorma, [request.idUsuario])
                .catch((error) => {
                    throw error
                })

            await conn.query(sqlCrearEstado, [norma.insertId, 1, request.idUsuario])
                .catch((error) => {
                    throw error
                })

            const digitalizacion = digitalizacionesBO.find((elem) => elem.idNorma === meta.idNorma);
            let textoNorma = '';
            if (digitalizacion !== undefined) {
                textoNorma = String(digitalizacion.normaDocumento)
            }

            let fechaSancion = null;
            let firmantes = null;
            let idGestion = null;
            if (textoNorma.length > 0) {
                fechaSancion = textoNorma?.match(/Buenos Aires, \d+ de [a-zA-Z]+ de 20\d{2}/) ? textoNorma?.match(/Buenos Aires, \d+ de [a-zA-Z]+ de 20\d{2}/)[0] : null;
                if (fechaSancion) {
                    moment.locale('es');
                    fechaSancion = fechaSancion.replace('Buenos Aires,', '').trim();
                    fechaSancion = moment(fechaSancion, 'LL').format('YYYY-MM-DD');
                } else {
                    fechaSancion = null;
                }
            }
            if (textoNorma.length > 0) {
                firmantes = textoNorma?.split('.')[textoNorma?.split('.')?.length - 1]
                if (firmantes.length > 0) {
                    firmantes = firmantes.match(/<b>[^<]+<\/b>/)
                    if (firmantes) {
                        firmantes = firmantes[0]?.replace('<b>', '')?.replace('</b>', '')
                    } else {
                        firmantes = null
                    }
                } else {
                    firmantes = null
                }
                //firmantes = textoNorma?.split('.')[textoNorma?.split('.')?.length - 1]?.match(/<b>[^<]+<\/b>/)[0]?.replace('<b>', '')?.replace('</b>', '') ?? '';
            }


            if (fechaSancion && fechaSancion.length > 0) {
                const gestion = await conn.query('SELECT idGestion FROM sdin_gestiones WHERE (? BETWEEN fechaDesde AND fechaHasta) OR (fechaDesde < ? AND fechaHasta IS NULL)', [fechaSancion, fechaSancion])
                if (gestion.length > 0) {
                    idGestion = gestion[0].idGestion;
                }
            }

            await conn.query(sqlCrearMetadatos, [
                norma.insertId,
                meta.idNorma,
                meta.normaAcronimoReferencia,
                meta.idNormaTipoSDIN,
                meta.idNormaSubtipo,
                meta.idSeccion,
                idReparticion?.length == 1 ? idReparticion[0].id : null,
                meta.normaAnio,
                meta.normaNumero,
                meta.normaSumario,
                meta.normaArchivoOriginal,
                meta.normaArchivoOriginalS3Key,
                request.idUsuario,
                meta.fechaPublicacion,
                meta.boletinNumero,
                fechaSancion,
                firmantes,
                meta.organismo_equivalente,
                idGestion
            ])
                .catch((error) => {
                    throw error
                })

            //Guardo texto original
            await conn.query(`INSERT sdin_normas_textos_originales (idNormaSDIN, textoOriginal) VALUES (?,?)`, [norma.insertId, textoNorma])
                .catch((error) => {
                    throw error
                })

            //Importo las repas como dependencias
            const repas = meta.siglasReparticiones.trim().split('-');

            for (const r of repas) {
                let dependencia = repasImportables.find(n => n.sigla === r);
                if (dependencia) {
                    await conn.query(`INSERT INTO sdin_normas_dependencias (idNorma, idDependencia) VALUES (?,?)`,
                        [norma.insertId, dependencia.idDependencia])
                }
            }

            const anexosBO = await conn.query(`SELECT normaAnexoArchivo, normaAnexoArchivoS3Key 
                FROM normas_anexos 
                WHERE idNorma=?`, [meta.idNorma])
                .catch((error) => {
                    throw error
                })

            if (anexosBO.length > 0) {
                for (const anexo of anexosBO) {
                    let sqlInsertarAnexo = `INSERT sdin_normas_anexos (archivo, archivoS3)
                                VALUE (?, ?);`;

                    await conn.query(sqlInsertarAnexo, [anexo.normaAnexoArchivo, anexo.normaAnexoArchivoS3Key])
                        .catch((error) => {
                            throw error
                        })
                }
            }

            //Logs
            await guardarLog(conn, sqlCrearNorma, [request.idUsuario], request).catch((error) => { throw error })
            await guardarLog(conn, sqlCrearEstado, [norma.insertId, 1, request.idUsuario], request).catch((error) => { throw error })
            await guardarLog(conn, sqlCrearMetadatos, [
                norma.insertId,
                meta.idNorma,
                meta.normaAcronimoReferencia,
                meta.idNormaTipoSDIN,
                meta.idNormaSubtipo,
                meta.idSeccion,
                idReparticion?.length == 1 ? idReparticion[0].id : null,
                meta.normaAnio,
                meta.normaNumero,
                meta.normaSumario,
                meta.normaArchivoOriginal,
                meta.normaArchivoOriginalS3Key,
                request.idUsuario,
                meta.fechaPublicacion,
                meta.boletinNumero,
                fechaSancion,
                firmantes,
                meta.organismo_equivalente,
                idGestion
            ], request).catch((error) => { throw error })
        }

        let sqlUser = `SELECT mig_nombre FROM sdin_usuarios WHERE idUsuario =?`
        let usuario = await conn.query(sqlUser, [request?.idUsuario]).catch((error) => { throw error })
        let normasAImportar = [...request.normas]
        for (const n of normasAImportar) {
            try {
                let sqlEvento = `INSERT INTO trazabilidad (idNorma,negocio,operacion,usuario,tipoOperacion) VALUES (?,'SDIN',?,?,10)`;
                let operacionEvento = `El usuario:${usuario[0].mig_nombre} importa la norma (${n}) a SDIN`;
                let paramsEvento = [n, operacionEvento, request.idUsuario];

                await conn.query(sqlEvento, paramsEvento);
            } catch (error) {
                console.error("Error al registrar evento:", error);
                throw error
                // Puedes decidir si quieres lanzar una excepción aquí o manejar el error de alguna otra manera
            }
        }

        await conn.commit();

    } catch (error) {
        console.log(error)
        await conn.rollback();
        throw error;
    } finally {
        // Close Connection
        if (conn) conn.close();
    }
}

function traerNormas(request) {
    return new Promise(async (resolve, reject) => {
        let sql = `SELECT e.normasEstadoTipo, a.idNormaSDIN, c.normaSumario, c.normaNumero, c.fechaSancion, b.idUsuarioAsignado, dep.sigla AS siglaDependencia,
        c.idReparticionOrganismo, org.organismo, org.sigla AS siglaOrganismo, f.normaTipo, usr.apellidoNombre AS analista
        -- Comento el resto de los campos ya que no se visualizan en el listado
        /* , dep.dependencia, c.idDependencia, 
        c.alcance, c.firmantes, a.fechaCarga, c.temasGenerales, c.normaAnio, d.seccionSigla, c.importadaBO,  
        sdin_ramas.rama, c.fechaRatificacion, c.fechaPublicacion, c.fechaPromulgacion,  
        c.numeroAD, c.numeroCD, c.plazoDeterminado, c.vigenciaEspecial, 
        g.idGestion, g.nombre AS nombreGestion, cl.clase */
        FROM sdin_normas a 
        INNER JOIN sdin_normas_estados b ON a.idNormaSDIN = b.idNormaSDIN
        INNER JOIN sdin_normas_metadatos c ON a.idNormaSDIN = c.idNormaSDIN
        LEFT OUTER JOIN bo_sumario_secciones d ON c.idSeccion = d.idSeccion
        LEFT OUTER JOIN sdin_normas_estados_tipos e ON b.idNormasEstadoTipo = e.idNormasEstadoTipo
        LEFT OUTER JOIN sdin_normas_tipos f ON c.idNormaTipo = f.idNormaTipo
        LEFT OUTER JOIN sdin_dependencias dep ON c.idReparticion = dep.idDependencia
        LEFT OUTER JOIN sdin_organismos org ON c.idReparticionOrganismo = org.idOrganismo
        LEFT OUTER JOIN sdin_usuarios usr ON b.idUsuarioAsignado = usr.idUsuario
        LEFT OUTER JOIN sdin_ramas ON sdin_ramas.idRama = c.idRama
        LEFT OUTER JOIN sdin_gestiones g ON g.idGestion = c.idGestion
        LEFT OUTER JOIN sdin_clases cl ON c.idClase = cl.idClase
        LEFT OUTER JOIN sdin_normas_relaciones rel ON rel.idNormaOrigen = a.idNormaSDIN
        LEFT OUTER JOIN sdin_relaciones_tipos rel_tipo ON rel.idRelacion = rel_tipo.idRelacion
        LEFT OUTER JOIN dj_analisis_epistemologico epi ON epi.idNormaSDIN = a.idNormaSDIN
        /* LEFT OUTER JOIN dj_valores_formularios vf1 ON epi.valoresFormulario3 = vf1.idValoresFormulario
        LEFT OUTER JOIN dj_valores_formularios vf2 ON epi.valoresFormulario4 = vf2.idValoresFormulario */
        LEFT OUTER JOIN dj_valores_formularios vf5 ON epi.valoresFormulario5 = vf5.idValoresFormulario
        WHERE 1=1 
        AND b.estado = 1
        AND c.estado = 1
        `;

        let params = []

        for (const p of Object.keys(request)) {
            if (request[`${p}`] !== null &&
                request[`${p}`] !== undefined &&
                request[`${p}`] !== '' &&
                (request[`${p}`]).length !== 0) {
                switch (p) {
                    case ('alcance'):
                        sql = String(sql) + String(` AND c.${p}=?`);
                        params.push(request[`${p}`])
                        break;
                    case ('idNormasEstadoTipo'):
                        sql = String(sql) + String(` AND b.${p}=?`);
                        params.push(request[`${p}`])
                        break;
                    case ('usuarioAsignado'):
                        sql = String(sql) + String(` AND b.idUsuarioAsignado=?`);
                        params.push(request[`${p}`])
                        break;
                    case ('user'):
                        sql = String(sql) + String(` AND b.idUsuarioAsignado=?`);
                        params.push(request[`${p}`])
                        break;
                    case ('idOrganismo'):
                        sql = String(sql) + String(` AND c.idReparticionOrganismo=?`);
                        params.push(request[`${p}`])
                        break;
                    case ('idGestion'):
                        sql = String(sql) + String(` AND c.idGestion = ?`)
                        params.push(request[`${p}`])
                        break;
                    case ('idDependencia'):
                        sql = String(sql) + String(` AND c.idReparticion=?`);
                        params.push(request[`${p}`])
                        break;
                    case ('normaNumero_desde'):
                        sql = String(sql) + String(` AND c.normaNumero >= ?`);
                        params.push(request[`${p}`])
                        break;
                    case ('normaNumero_hasta'):
                        sql = String(sql) + String(` AND c.normaNumero <= ?`);
                        params.push(request[`${p}`])
                        break;
                    case ('fechaCarga'):
                        sql = String(sql) + String(` AND DATE_FORMAT(a.fechaCarga, '%Y-%m-%d')=?`);
                        params.push(request[`${p}`])
                        break;
                    case ('fechaAprobacion'):
                        sql = String(sql) + String(` AND c.fechaPublicacion = ?`);
                        params.push(request[`${p}`])
                        break;
                    case ('idBoletin'):
                        sql = String(sql) + String(` AND c.idNorma IN (SELECT idNorma FROM bo_boletines_normas WHERE idBoletin=?)`);
                        params.push(request[`${p}`])
                        break;
                    case ('temas'):
                        sql += ` AND a.idNormaSDIN IN (SELECT idNormaHijo FROM sdin_temas_jerarquia WHERE idNormaHijo IS NOT NULL AND idTema IN (${request.temas}) AND estado = 1 GROUP BY idNormaHijo HAVING COUNT(DISTINCT idTema) = ${request.temas.length})`
                        /* if (request.temas.length > 1) {
                            let condiciones = ''
                            for(let i = 1; i < request.temas.length; i++) {
                                condiciones += String(` AND (idTema IN (${request.temas[i]}) AND estado=1)`)
                            }
                            sql += `AND a.idNormaSDIN IN (SELECT idNormaHijo FROM sdin_temas_jerarquia WHERE (idTema IN (${request.temas[0]}) AND estado=1)${condiciones})`
                        } else if (request.temas?.length === 1) {
                            sql += `AND a.idNormaSDIN IN (SELECT idNormaHijo FROM sdin_temas_jerarquia WHERE idTema IN (${request.temas[0]}) AND estado=1)`
                        } */
                        break;
                    case ('descriptores'):
                        if (request.descriptores.descriptores?.length > 0) {
                            /* sql += ` AND (${request.descriptores.descriptores.map(n => `JSON_CONTAINS (descriptores, '${n}', '$.descriptores')`).join(' OR ')})`; */
                            sql += ` AND a.idNormaSDIN IN (SELECT idNorma FROM sdin_normas_descriptores WHERE idDescriptor IN (${request.descriptores.descriptores}))`
                        }
                        break;
                    case ('dependencias'):
                        if (request.dependencias.dependencias?.length > 0) {
                            sql += ` AND (${request.dependencias.dependencias.map(n => `JSON_CONTAINS (dependencias, '${n}', '$.dependencias')`).join(' OR ')})`;
                        }
                        break;
                    case ('observaciones'):
                        sql += ` AND c.observaciones LIKE '%${request.observaciones}%'`;
                        break;
                    case ('tiposPalabras'):
                        if (!request.palabras || !request.tiposPalabras || request.palabras == '' || request.tiposPalabras == null) {
                            break;
                        }
                        if (request.tiposPalabras == 1) { // frase exacta
                            sql += ` AND UPPER(c.normaSumario) = UPPER('${request.palabras}')`
                            break;
                        }
                        if (request.tiposPalabras == 2) { //con las palabras
                            sql += ` AND UPPER(c.normaSumario) LIKE UPPER('% ${request.palabras} %')`
                            break;
                        }
                        if (request.tiposPalabras == 3) { //sin las palabras
                            sql += ` AND UPPER(c.normaSumario) NOT LIKE UPPER('% ${request.palabras} %')`
                            break;
                        }
                        if (request.tiposPalabras == 4) { //con alguna de las palabras
                            let condiciones = ''
                            for (let i = 1; i < request.palabras.length; i++) {
                                condiciones += String(` OR (UPPER(c.normaSumario) LIKE UPPER('% ${request.palabras[i]} %'))`)
                            }
                            if (request.palabras.length === 1) {
                                sql += ` AND (UPPER(c.normaSumario) LIKE UPPER('% ${request.palabras[0]} %'))`
                            } else {
                                sql += ` AND ((UPPER(c.normaSumario) LIKE UPPER('% ${request.palabras[0]} %'))${condiciones})`
                            }
                            break;
                        }
                        break;
                    case ('idClase'):
                        sql += ` AND cl.idClase = ?`
                        params.push(request[`${p}`])
                        break;
                    case 'fechaDesde':
                        if (request.tipoFecha) {
                            switch (request.tipoFecha) {
                                case 'Publicación':
                                    sql += ` AND c.fechaPublicacion >= '${request.fechaDesde}'`;
                                    break;
                                case 'Sanción':
                                    sql += ` AND c.fechaSancion >= '${request.fechaDesde}'`;
                                    break;
                                case 'Promulgación':
                                    sql += ` AND c.fechaPromulgacion >= '${request.fechaDesde}'`;
                                    break;
                                case 'Ratificación':
                                    sql += ` AND c.fechaRatificacion >= '${request.fechaDesde}'`;
                                    break;
                            }
                        }
                        break;
                    case 'fechaHasta':
                        if (request.tipoFecha) {
                            switch (request.tipoFecha) {
                                case 'Publicación':
                                    sql += ` AND c.fechaPublicacion <= '${request.fechaHasta}'`;
                                    break;
                                case 'Sanción':
                                    sql += ` AND c.fechaSancion <= '${request.fechaHasta}'`;
                                    break;
                                case 'Promulgación':
                                    sql += ` AND c.fechaPromulgacion <= '${request.fechaHasta}'`;
                                    break;
                                case 'Ratificación':
                                    sql += ` AND c.fechaRatificacion <= '${request.fechaHasta}'`;
                                    break;
                            }
                        }
                        break;
                    case ('boletinNumero'):
                        sql = String(sql) + String(` AND c.idNorma IN (
                                SELECT a.idNorma FROM bo_boletines_normas a 
                                LEFT JOIN bo_boletines_metadatos b ON a.idBoletin=b.idBoletin 
                                WHERE b.boletinNumero=?)`);
                        params.push(request[`${p}`])
                        break;
                    case ('checkDigesto'):
                        /* if (!request.checkDigesto) {
                            sql += ` AND c.checkDigesto = 0`;
                        } else {
                            sql += ` AND c.checkDigesto = 1`;
                        }
                        break; */
                        if (request.checkDigesto){
                            sql += ` AND c.checkDigesto = 1`;
                        }
                        break;
                    case ('checkPlazoDeterminado'):
                        if (request.checkPlazoDeterminado) {
                            sql += ` AND c.plazoDeterminado = 1`;
                        }
                        break;
                    case ('checkVigenciaEspecial'):
                        if (request.checkVigenciaEspecial) {
                            sql += ` AND c.vigenciaEspecial = 1`;
                        }
                        break;
                    case ('vigente'):
                        sql = String(sql) + String(` AND c.${p}=?`);
                        params.push(request[`${p}`])
                        break;
                    case ('idRelacion'):
                        sql = String(sql) + String(` AND rel_tipo.${p}=? AND rel.estado = 1`);
                        params.push(request[`${p}`])
                        break;
                    case ('idCausal'):
                        sql += ` AND (vf5.${p} = ?)`;
                        params.push(request[`${p}`])
                        break;
                    case ('checkConsolidado'):
                        if (request.checkConsolidado) {
                            sql += ` AND epi.formulario6 = 1`;
                        }
                        break;
                    case ('tieneFormulario'):
                        let form = `formulario${request[`${p}`]}`
                        sql+= ` AND epi.${form} = 1`
                        break;
                    default:
                        if (p !== 'calcularTotal' && p !== 'limite' && p !== 'paginaActual' && p !== 'campo' && p !== 'orden' && p !== 'tipoFecha' && p !== 'offset' && p !== 'palabras') {
                            sql = String(sql) + String(` AND c.${p}=?`);
                            params.push(request[`${p}`])
                        }
                        break;
                }
            }
        }

        let res = {}
        let conn = await connection.poolPromise.getConnection()
            .catch(error => { throw error });

        try {
            if (request.calcularTotal) {
                console.log('Calculando total')
                //Saca el total de normas contemplando los filtros de búsqueda
                res.totalNormas = await conn.query('SELECT COUNT(*) FROM' + sql.split(/FROM(.*)/s)[1], params)
                    .catch(error => { throw error });
            } else { res.totalNormas = 0 }
            //Pongo el ORDER BY después del COUNT por si llega a relentizar la query
            //ORDEN
            if (request.campo && request.orden) {
                switch (request.campo) {
                    case 'idNorma':
                    case 'fechaCarga':
                        sql = sql + ' ORDER BY a.' + request.campo + ' ' + request.orden;
                        break;
                    case 'idNormasEstadoTipo':
                        sql = sql + ' ORDER BY b.' + request.campo + ' ' + request.orden;
                        break;
                    default:
                        sql = sql + ' ORDER BY c.' + request.campo + ' ' + request.orden;
                        break;
                }
            }

            res.normas = await conn.query(paginarQuery(request, sql), params) //Agrega LIMIT - OFFSET a la query
                .catch(error => { throw error });
            console.log(sql, params)
        }
        catch (error) {
            console.log(error, paginarQuery(request, sql), params)
            reject(error)
        }
        finally {
            conn.release();
            resolve(res);
        }
    });
}

async function traerNorma(request) {
    let results;
    let conn = await connection.poolPromise.getConnection();
    try {
        await conn.beginTransaction();
        /* let sql = `SELECT e.*, f.idNormasEstadoTipo, a.normasEstadoTipo, c.normaTipo, x.normaSubtipo, z.tipoPublicacion, 
        y.apellidoNombre, sdin_ramas.rama, u.apellidoNombre AS nombreUsuarioCarga, dep.dependencia, dep.idDependencia, dep.sigla AS siglaDependencia, org.idOrganismo,  org.organismo, org.sigla AS siglaOrganismo
        FROM sdin_normas_metadatos e
        LEFT OUTER JOIN sdin_normas_estados f ON f.idNormaSDIN=e.idNormaSDIN
        LEFT OUTER JOIN normas_estados_tipos a ON a.idNormasEstadoTipo=f.idNormasEstadoTipo
        LEFT OUTER JOIN sdin_normas b ON b.idNormaSDIN=e.idNormaSDIN
        LEFT OUTER JOIN bo_normas_tipos c ON c.idNormaTipo=e.idNormaTipo
        LEFT OUTER JOIN bo_normas_subtipos x ON x.idNormaSubtipo=e.idNormaSubtipo
        LEFT OUTER JOIN sdin_tipos_publicaciones z ON e.idTipoPublicacion = z.idTipoPublicacion
        LEFT OUTER JOIN gral_usuarios y ON e.usuarioAsignado = y.idUsuario
        LEFT OUTER JOIN sdin_dependencias dep ON e.idReparticion = dep.idDependencia
        LEFT OUTER JOIN sdin_organismos org ON e.idReparticionOrganismo = org.idOrganismo
        LEFT OUTER JOIN sdin_ramas ON e.idRama = sdin_ramas.idRamatraerForm
        LEFT OUTER JOIN gral_usuarios u ON e.usuarioCarga = u.idUsuario
        WHERE e.idNormaSDIN=?`; */

        let sql = `SELECT su.apellidoNombre AS analista, w.mostrarTC, w.mostrarTA, w.mostrarRamaTema, e.*, f.idNormasEstadoTipo, a.normasEstadoTipo, nt.normaTipo, xx.normaSubtipo, z.tipoPublicacion,
        yy.apellidoNombre, sdin_ramas.rama, u.apellidoNombre AS nombreUsuarioCarga, dep.dependencia, dep.idDependencia, 
        dep.sigla AS siglaDependencia, org.idOrganismo,  org.organismo, org.sigla AS siglaOrganismo, tor.textoOriginal, tac.textoActualizado, tac.archivo AS archivoTextoActualizado, tac.archivoS3 AS archivoTextoActualizadoS3
        FROM sdin_normas_metadatos e
        LEFT OUTER JOIN sdin_normas_estados f ON f.idNormaSDIN=e.idNormaSDIN
        LEFT OUTER JOIN sdin_normas_estados_tipos a ON a.idNormasEstadoTipo=f.idNormasEstadoTipo
        LEFT OUTER JOIN sdin_normas b ON b.idNormaSDIN=e.idNormaSDIN
        LEFT OUTER JOIN sdin_tipos_publicaciones z ON e.idTipoPublicacion = z.idTipoPublicacion
        LEFT OUTER JOIN sdin_usuarios yy ON e.usuarioAsignado = yy.idUsuario
        LEFT OUTER JOIN sdin_usuarios su ON f.idUsuarioAsignado = su.idUsuario
        LEFT OUTER JOIN sdin_dependencias dep ON e.idReparticion = dep.idDependencia
        LEFT OUTER JOIN sdin_organismos org ON e.idReparticionOrganismo = org.idOrganismo
        LEFT OUTER JOIN sdin_ramas ON e.idRama = sdin_ramas.idRama
        LEFT OUTER JOIN sdin_usuarios u ON e.usuarioCarga = u.idUsuario
        LEFT OUTER JOIN sdin_normas_tipos nt ON e.idNormaTipo = nt.idNormaTipo
        LEFT OUTER JOIN bo_normas_subtipos xx ON xx.idNormaSubtipo=e.idNormaSubtipo
        LEFT OUTER JOIN sdin_normas_textos_originales tor ON tor.idNormaSDIN=e.idNormaSDIN
        LEFT OUTER JOIN sdin_normas_textos_actualizados tac ON tac.idNormaSDIN=e.idNormaSDIN
        LEFT OUTER JOIN sdin_normas_front w ON e.idNormaSDIN=w.idNormaFront
        WHERE e.idNormaSDIN=? AND f.estado=1 AND e.estado=1`;

        let params = [request.idNormaSDIN]
        results = await conn.query(sql, params).catch((err) => { throw err })

        /*
        /////////////////////
 
        // almaceno el documento xml en la variable xmlText y dsp lo convierto a un objeto
            const xmlText = results[0].textoOriginal;
 
        // 1) HAGO ESTO PARA OBTENER LOS VALORES QUE VIENEN EN IDI Y W EN LA ETIQUETA IMAGEN
            xml2js.parseString(xmlText, (err, result) => {
                if (err) {
                console.error(err);
                return;
                }  
            // const jsonData = JSON.stringify(result, null, 1);
            const jsonData = result;
       
            function recursiveHasOwnProperty(obj, prop) {
                // Check if the object directly has the property
                let res = false;
                if (obj.hasOwnProperty(prop)) {
                    reemplazarImagen(obj[prop])
                    return true
                }
                // Check if the property exists in the prototype chain
                // const prototype = Object.getPrototypeOf(obj);
                if (typeof obj === 'object'){
                    Object.keys(obj).forEach(key => {
                        res = res || recursiveHasOwnProperty(obj[key], prop);
                    });
                }
                if (typeof obj === 'array'){
                    obj.forEach(e => {res = res || recursiveHasOwnProperty(e, prop)})
                }
                // Property not found in the object or its prototype chain
                return res;
            }
            console.log(recursiveHasOwnProperty(jsonData, "imagen" ))
      });
 
 
      // 2) ACA TENGO Q HACER LA FUNCION PARA REEMPLAZAR LA ETIQUETA IMAGEN POR UNA ETIQUETA <a /> CON EL LINK
      function reemplazarImagen(obj){
 
        // var parser = new DOMParser();
        // var xmlDoc = parser.parseFromString(xmlText, 'text/xml');
 
        // console.log(xmlDoc)
 
        let idi = obj[0]["$"].idi
        let w = obj[0]["$"].w
 
        let link = `<a href='${"idi=" + idi + " w=" + w}'>hola mundo</a>`
 
        console.log(JSON.stringify(link))
      }
 
    // 3) CUANDO LO REEMPLAZO ESE NUEVO XML ES EL Q TENGO Q MANDARLE AL FRONT
   */

        /////////////////
        results[0].anexos = await conn.query(`SELECT idAnexoSDIN, textoAnexo, archivo, archivoS3
         FROM sdin_normas_anexos WHERE idNormaSDIN=? AND estado=1`, params)
            .catch((err) => { throw err })
        results[0].adjuntos = await conn.query(`SELECT idAdjuntoSDIN, archivo, archivoS3, CONCAT(?,archivoS3) AS linkPublico
         FROM sdin_adjuntos WHERE idNormaSDIN=? AND estado=1`, [process.env.DOCUMENTOS_PUBLICOS_SDIN, request.idNormaSDIN])
            .catch((err) => { throw err })

        results[0].dependencias = await conn.query(`
            SELECT a.idDependencia, b.dependencia
            FROM sdin_normas_dependencias a
            LEFT OUTER JOIN sdin_dependencias b ON a.idDependencia=b.idDependencia
            WHERE a.idNorma=? AND a.estado=1`,
            params)
            .catch((err) => { throw err })

        await conn.commit();
    }
    catch (error) {
        await conn.rollback();
        throw error
    }
    finally {
        if (conn) conn.release();
    }

    return results;
}

async function crearNormaSDIN(request) {
    let conn = await connection.poolPromise.getConnection();
    let idNormaSDIN;
    try {
        await conn.beginTransaction();
        let sqlCrearNorma = `INSERT INTO sdin_normas (usuarioCarga) VALUES (?);`;
        let sqlCrearMeta = `INSERT INTO sdin_normas_metadatos (idNormaSDIN, 
                idClase, 
                idGestion,
                fechaPublicacion,
                fechaSancion,
                fechaPromulgacion,
                fechaRatificacion,
                titulo,
                archivo,
                archivoS3,
                idReparticion,
                idReparticionOrganismo,
                idNormaTipo,
                idNormaSubtipo,
                normaNumero,
                normaSumario,
                vigenciaEspecial,
                vigenciaEspecialDescripcion,
                vigente,
                usuarioCarga,
                observaciones,
                clausulaDerogatoria,
                clausulaDerogatoriaDescripcion,
                linkPublicacionBO,
                generaTA,
                idTipoPublicacion,
                usuarioAsignado,
                alcance,
                normaAnio,
                numeroBO,
                checkDigesto,
                temasGenerales,
                numeroAD,
                numeroCD,
                checkTA,
                aprobadoNormativamente,
                plazoDeterminado,
                firmantes
                )
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);`;
        let sqlCrearEstado = `INSERT INTO sdin_normas_estados (idNormaSDIN, usuarioCarga, idNormasEstadoTipo)
            VALUES (?, ?, 15);`;
        
        let sqlArchivoTextoActualizado
        if (request.textoActualizadoS3 !== null){
            sqlArchivoTextoActualizado = `
            INSERT INTO sdin_normas_textos_actualizados (idNormaSDIN,textoActualizado,archivo,archivoS3)
            VALUES (?,NULL,?,?)
            `
        }
        let sqlArchivoAdjunto
        if (request.adjuntoS3 !== null){
            sqlArchivoAdjunto = `
            INSERT INTO sdin_adjuntos (idNormaSDIN,archivo,archivoS3,usuarioCarga,estado)
            VALUES (?,?,?,?,1)
            `
        }

        const norma = await conn.query(sqlCrearNorma, [request.usuarioCarga])
            .catch((error) => {
                throw error
            })
        idNormaSDIN = norma.insertId;
        await conn.query(sqlCrearMeta, [norma.insertId, request.idClase, request.idGestion,
        request.fechaPublicacion, request.fechaSancion, request.fechaPromulgacion, request.fechaRatificacion,
        request.titulo, request.archivo, request.archivoS3, request.idReparticion, request.idReparticionOrganismo,
        request.idNormaTipo, request.idNormaSubtipo, request.normaNumero, request.normaSumario,
        request.vigenciaEspecial, request.vigenciaEspecialDescripcion, request.vigencia,
        request.usuarioCarga, request.observaciones, request.clausulaDerogatoria, request.clausulaDerogatoriaDescripcion,
        request.linkPublicacionBO, request.generaTA, request.idTipoPublicacion, request.usuarioCarga, request.alcance,
        request.normaAnio, request.numeroBO, request.checkDigesto, request.temasGenerales, request.numeroAD,
        request.numeroCD, request.checkTA, request.aprobadoNormativamente, request.plazoDeterminado,
        request.firmantes])
            .catch((error) => {
                throw error
            })

        //Guardo texto original
        await conn.query(`INSERT sdin_normas_textos_originales (idNormaSDIN, textoOriginal) VALUES (?,?)`, [norma.insertId, request.textoOriginal])
            .catch((error) => {
                throw error
            })

        for (const dep of request.dependencias) {
            await conn.query(`INSERT INTO sdin_normas_dependencias (idNorma, idDependencia) VALUES (?,?)`, [norma.insertId, dep.idDependencia])
        }

        await conn.query(sqlCrearEstado, [
            norma.insertId, request.usuarioCarga
        ])
            .catch((error) => {
                throw error
            })

        await conn.query(`INSERT INTO trazabilidad (idNorma, negocio, operacion, usuario,tipoOperacion)
            VALUES (?,?,?,?,1)`
            , [norma.insertId, 'SDIN', `Se crea la norma con ID:${norma.insertId}`, request.usuarioCarga])
            .catch((error) => {
                throw error
            })

        //Asigno la norma al usuario que la creo
        await conn.query('UPDATE sdin_normas_estados SET idNormasEstadoTipo=16 WHERE idNormaSDIN=?', [norma.insertId])
            .catch((error) => {
                throw error
            })
        await conn.query(`INSERT INTO trazabilidad (idNorma, negocio, operacion, usuario,tipoOperacion)
            VALUES (?,?,?,?,9)`
            , [norma.insertId, 'SDIN', `Asigna norma a idUsuario:${request.usuarioCarga}`, request.usuarioCarga])
            .catch((error) => {
                throw error
            })

        for (const ax of request.anexos) {
            await conn.query('INSERT INTO sdin_normas_anexos (idNormaSDIN, archivo, archivoS3, usuarioCarga) VALUES (?,?,?,?)',
                [norma.insertId, ax.archivo, ax.archivoS3, request.usuarioCarga])
                .catch((error) => {
                    throw error
                })
        }
        if (sqlArchivoTextoActualizado){
            await conn.query(sqlArchivoTextoActualizado,[idNormaSDIN,request.nombreTextoActualizado,request.textoActualizadoS3])
            .catch((error)=>{
                throw error
            })
        }
        if (sqlArchivoAdjunto){
            await conn.query(sqlArchivoAdjunto,[idNormaSDIN,request.nombreAdjunto,request.adjuntoS3,request.usuarioCarga])
            .catch((error)=>{
                throw error
            })
        }

            
        await conn.commit();

    } catch (error) {
        console.log(error)
        await conn.rollback();
        throw error;
    } finally {
        // Close Connection
        if (conn) conn.close();
        return idNormaSDIN;
    }
}

function traerClases() {
    return new Promise((resolve, reject) => {
        sql = "SELECT idClase, clase FROM sdin_clases WHERE estado=1";
        params = [];
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

function traerGestion() {
    return new Promise((resolve, reject) => {
        sql = "SELECT idGestion, nombre FROM sdin_gestiones ORDER BY idGestion DESC ";
        params = [];
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

function traerTiposPublicaciones() {
    return new Promise((resolve, reject) => {
        sql = "SELECT idTipoPublicacion, tipoPublicacion FROM sdin_tipos_publicaciones WHERE estado=1";
        params = [];
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

async function editarNormasSDIN(request) {
    let conn = await connection.poolPromise.getConnection();
    try {

        //Cargo dinamicamente los metadatos a modificar en la query 
        //doy por hecho que vienen con el mismo nombre con el que estan en la DB
        let metadatos = (Object.keys(request.metadatos)).map(key => key + '=?');
        let params = Object.values(request.metadatos)
        //console.log("EDITAR NORMA METADATOS",newMetadatos)
        let sql = `UPDATE sdin_normas_metadatos SET ${metadatos} WHERE idNormaSDIN IN (?)`;
        params.push(request.normas)

        //Registro el evento 'editar norma'
        let sqlUser = `SELECT apellidoNombre FROM sdin_usuarios WHERE idUsuario =?`
        let usuario = await conn.query(sqlUser, [request?.idUsuario]).catch((error) => { throw error })
        const keys = (Object.keys(request.metadatos)).map(key => key);
        const valores = Object.values(request.metadatos);
        const resultado = keys.map((key, index) => ({ [key]: valores[index] }));
        const fraseQuery = resultado.map(obj => {
            const key = Object.keys(obj)[0];
            const value = obj[key];
            return `${key}="${value}"`;
        }).join(', ');

        let sqlEvento = `INSERT INTO trazabilidad (idNorma,negocio,operacion,usuario,tipoOperacion) VALUES(?,'SDIN',?,?,2)`
        let paramsEvento = request.normas.map(n => ([n, `El usuario ${usuario[0]?.apellidoNombre} edita ${fraseQuery} de la norma con id: ${n}`, request?.idUsuario]))
        /* ------------------------------------------------------- */

        await conn.beginTransaction();
        await conn.query(sql, params)

        await guardarLog(conn, sql, params, request)

        await conn.batch(sqlEvento, paramsEvento)

        await conn.commit();

    } catch (error) {
        await conn.rollback(); console.log(error)
        throw error;
    } finally {
        // Close Connection
        if (conn) conn.close();
    }
}

async function editarArchivoTextoActualizadoSDIN(request) {
    let conn = await connection.poolPromise.getConnection();
    try {
        //Cargo dinamicamente los metadatos a modificar en la query 
        //doy por hecho que vienen con el mismo nombre con el que estan en la DB
        let metadatos = (Object.keys(request.metadatos)).map(key => key + '=?');
        let params = Object.values(request.metadatos)

        let registroTextoActualizado = await traerTextoActualizadoPorNormaId(request.normas[0])
        let sql
        if (registroTextoActualizado.length !== 0) {
            sql = `UPDATE sdin_normas_textos_actualizados SET ${metadatos}, textoActualizado = NULL WHERE idNormaSDIN IN (?)`;
        } else {
            sql = `INSERT INTO sdin_normas_textos_actualizados (archivo, archivoS3, idNormaSDIN, textoActualizado) VALUES (?,?,?,NULL)`;
        }
        params.push(request.normas)

        await conn.beginTransaction();
        await conn.query(sql, params)
            .catch((error) => {
                throw error
            })

        await conn.query(`INSERT INTO trazabilidad (tipoOperacion, operacion, usuario, negocio, idNorma) 
        SELECT 11, CONCAT(apellidoNombre, ?) AS op, ?, ?, ? 
        FROM sdin_usuarios WHERE idUsuario=?`, [` carga el archivo ${request.metadatos.archivo} en el texto actualizado de la norma id: ${request.normas[0]}`, request.idUsuario, 'SDIN', parseInt(request.normas[0]), request.idUsuario])

        await guardarLog(conn, sql, params, request)
        await conn.commit();

    } catch (error) {
        await conn.rollback(); console.log(error)
        throw error;
    } finally {
        // Close Connection
        if (conn) conn.close();
    }
}

function traerTextoActualizadoPorNormaId(idNormaSDIN) {
    return new Promise((resolve, reject) => {
        let sql = `SELECT * FROM sdin_normas_textos_actualizados WHERE idNormaSDIN = ?`;
        let params = [idNormaSDIN]

        connection.pool.query(sql, params, function (error, results) {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
}

async function borrarNormasSDIN(request) {
    let conn = await connection.poolPromise.getConnection();
    try {

        let sql = `UPDATE sdin_normas_estados SET idNormasEstadoTipo=0 WHERE idNormaSDIN IN (?)`;

        await conn.beginTransaction();
        await conn.query(sql, [request.normas])
            .catch((error) => {
                throw error
            })
        await guardarLog(conn, sql, [request.normas], request)
        //Registro evento 'borrar normas SDIN'
        let sqlUser = `SELECT mig_nombre FROM sdin_usuarios WHERE idUsuario =?`
        let usuario = await conn.query(sqlUser, [request?.idUsuario]).catch((error) => { throw error })
        let normasABorrar = [...request.normas]
        for (const n of normasABorrar) {
            try {
                let operacionEvento = `El usuario:${usuario[0].mig_nombre} borra la norma con ID:(${n}) `;
                let sqlEvento = `INSERT INTO trazabilidad (idNorma,negocio,operacion,usuario,tipoOperacion) VALUES (?,'SDIN',?,?,4)`;
                let paramsEvento = [n, operacionEvento, request.idUsuario];
                await conn.query(sqlEvento, paramsEvento);
            } catch (error) {
                console.error("Error al registrar evento:", error);
                throw error
                // Puedes decidir si quieres lanzar una excepción aquí o manejar el error de alguna otra manera
            }
        }


        await conn.commit();

    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        // Close Connection
        if (conn) conn.close();
    }
}

// Asignar una norma a un usuario NO ES UN METADATO, es poner el estado de la norma en "En proceso de edición"
// y a su vez poner el usuario al que corresponda la asignación en el mismo registro del estado
// La func. asigna 1 O VARIAS normas a un usuario
async function asignarNormas(request) {
    let conn = await connection.poolPromise.getConnection();
    try {
        await conn.beginTransaction();
        let sql = `UPDATE sdin_normas_estados SET estado=4 WHERE idNormaSDIN IN (?) AND estado=1;`;
        await conn.query(sql, [request.normas])
        await conn.batch('INSERT INTO sdin_normas_estados (idNormaSDIN, idNormasEstadoTipo, idUsuarioAsignado, usuarioCarga) VALUES (?, 2, ?, ?)',
            request.normas.map(n => [n, request.usuarioAsignado, request.idUsuario]))

        await conn.commit();
        //Registro evento 'asigno normaSDIN a ...'
        let sqlUser = `SELECT mig_nombre FROM sdin_usuarios WHERE idUsuario =?`
        let usuario = await conn.query(sqlUser, [request?.idUsuario]).catch((error) => { throw error })
        let sqlUserAsignado = `SELECT mig_nombre FROM sdin_usuarios WHERE idUsuario=?`
        let usuarioAsignado = await conn.query(sqlUserAsignado, [request.usuarioAsignado]).catch((error) => { throw error })

        let operacionEvento = `El usuario ${usuario[0].mig_nombre} asigna la norma con ID SDIN:(${request.normas}) al usuario ${usuarioAsignado[0].mig_nombre}`
        let sqlEvento = `INSERT INTO trazabilidad (idNorma,negocio,operacion,usuario,tipoOperacion) VALUES(?,'SDIN',?,?,9)`
        let paramsEvento = request.normas.map(n => [n, operacionEvento, request.idUsuario])
        await conn.batch(sqlEvento, paramsEvento)

    } catch (error) {
        console.log(error)
        await conn.rollback();
        throw error;
    } finally {
        // Close Connection
        if (conn) conn.close();
    }
}

function traerRelacionesTipos() {
    return new Promise((resolve, reject) => {
        let sql = `SELECT * FROM sdin_relaciones_tipos WHERE estado=1`;
        let params = []

        connection.pool.query(sql, params, function (error, results) {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
}

function traerHistorial(request) {
    return new Promise((resolve, reject) => {
        let sql = `SELECT e.idNormaSDIN, e.idNormasEstadoTipo, et.normasEstadoTipo, u.apellidoNombre, e.fechaCarga, uu.apellidoNombre AS analista
        from sdin_normas_estados e
        left outer join sdin_usuarios u on e.usuarioCarga = u.idUsuario
        left outer join sdin_normas_estados_tipos et on e.idNormasEstadoTipo = et.idNormasEstadoTipo
        left outer join sdin_usuarios uu on uu.idUsuario = e.idusuarioAsignado
        WHERE 1=1
        AND e.idNormaSDIN = ?`;
        let params = [request.idNormaSDIN];
        connection.pool.query(sql, params, function (error, results) {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
}

async function traerHistorialDJ(request) {
    return new Promise(async (resolve, reject) => {

        let sql = `SELECT
        H.fecha,
        HA.descripcion AS accion,
        U.apellidoNombre,
        U.usuario,
        H.mig_usuario AS usuarioMigracion,
        H.observaciones,
        (SELECT COUNT(*) FROM dj_historial HH WHERE HH.idNormaSDIN = ?) AS totalHistorial
        FROM dj_historial H
        LEFT JOIN sdin_usuarios U ON H.idUsuario=U.idUsuario
        LEFT JOIN dj_historial_acciones HA ON HA.idAccionHistorica= H.idAccionHistorica
        WHERE H.idNormaSDIN = ?`;

        let params = [request.norma, request.norma]
        let res = []
        let conn = await connection.poolPromise.getConnection()
            .catch(error => { throw error })

        try {
            res.historial = await conn.query(paginarQuery(request, sql), params)
                .catch(error => { throw error });
            //res.total = await conn.query('SELECT COUNT(totalDeTodo.id) FROM ' + sql.split('FROM')[0], params)
            //res.total = await conn.query('SELECT COUNT(totalDeTodo.id) FROM (' + sql + ') AS totalDeTodo', params)
            //.catch(error => { throw error });
            //console.log(sql)
        }
        catch (error) {
            console.log(error, paginarQuery(request, sql))
            reject(error)
        }
        finally {
            conn.release();
            resolve(res);
        }

    });
}

async function crearRelacion(request) {
    let conn = await connection.poolPromise.getConnection();
    try {
        await conn.beginTransaction();

        //Tengo que hacer 2 inserts, uno con la relacion ingresada y otro con la equivalente
        let sql = `
        INSERT INTO sdin_normas_relaciones
            (idRelacion, detalle, idNormaOrigen, idNormaDestino)
        VALUES (?,?,?,?)
        ;`;

        await conn.query(sql, [
            request.idRelacion,
            request.detalle,
            request.idNormaOrigen,
            request.idNormaDestino
        ])

        sql = `
        INSERT INTO sdin_normas_relaciones (idRelacion, detalle, idNormaorigen, idNormaDestino)
        SELECT r.idRelacion, ?, ?, ? 
        FROM sdin_relaciones_tipos r, sdin_relaciones_tipos rr
        WHERE rr.idRelacion=? AND r.tipo=rr.tipo AND NOT BINARY r.tipo = rr.tipo
        ;`;

        await conn.query(sql, [
            request.detalle,
            request.idNormaDestino,
            request.idNormaOrigen,
            request.idRelacion
        ])
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

async function traerRelacionesDeNorma(request) {
    let conn = await connection.poolPromise.getConnection();
    let respuesta;
    try {
        await conn.beginTransaction();
        let sql = `
        SELECT a.*, b.relacion, b.descripcion, d.idNormaTipo, d.normaAnio, d.normaNumero, nt.normaTipo, b.tipo
        FROM sdin_normas_relaciones a
        LEFT OUTER JOIN sdin_relaciones_tipos b ON a.idRelacion = b.idRelacion
	    LEFT OUTER JOIN sdin_normas_metadatos d ON a.idNormaDestino = d.idNormaSDIN
	    LEFT OUTER JOIN sdin_normas_tipos nt ON d.idNormaTipo = nt.idNormaTipo
        WHERE (a.idNormaOrigen=?) AND a.estado=1 
        ;`;

        const relaciones = await conn.query(sql, [request.idNormaSDIN, request.idNormaSDIN])
            .catch((error) => {
                throw error
            })
        respuesta = relaciones;

        await conn.commit();

    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        // Close Connection
        if (conn) conn.close();
    }
    return respuesta;
}

async function editarRelacion(request) {
    let conn = await connection.poolPromise.getConnection();
    try {
        await conn.beginTransaction();

        let sql = `
        UPDATE sdin_normas_relaciones
        SET idRelacion=(SELECT r.idRelacion
            FROM sdin_relaciones_tipos r, sdin_relaciones_tipos rr
            WHERE rr.idRelacion=? AND r.tipo=rr.tipo AND NOT BINARY r.tipo = rr.tipo), detalle=? 
        WHERE idNormasRelaciones=(SELECT r.idNormasRelaciones
            FROM sdin_normas_relaciones r LEFT OUTER JOIN sdin_relaciones_tipos rt1 ON rt1.idRelacion=r.idRelacion,
            sdin_normas_relaciones rr LEFT OUTER JOIN sdin_relaciones_tipos rt2 ON rt2.idRelacion=rr.idRelacion
            WHERE rr.idNormasRelaciones=? AND r.idNormaOrigen=rr.idNormaDestino AND r.idNormaDestino=rr.idNormaOrigen
            AND rt1.tipo=rt2.tipo)
        ;`;

        await conn.query(sql, [
            request.idRelacion,
            request.detalle,
            request.idNormasRelaciones
        ])

        sql = `
        UPDATE sdin_normas_relaciones
        SET idRelacion=?, detalle=? 
        WHERE idNormasRelaciones=?
        ;`;

        await conn.query(sql, [
            request.idRelacion,
            request.detalle,
            request.idNormasRelaciones
        ])

        await conn.commit();

    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        // Close Connection
        if (conn) conn.close();
    }
}

async function eliminarRelacion(request) {
    let conn = await connection.poolPromise.getConnection();
    try {
        await conn.beginTransaction();

        let sql = `
        UPDATE sdin_normas_relaciones
        SET estado=4 
        WHERE idNormasRelaciones=(SELECT r.idNormasRelaciones
            FROM sdin_normas_relaciones r LEFT OUTER JOIN sdin_relaciones_tipos rt1 ON rt1.idRelacion=r.idRelacion,
            sdin_normas_relaciones rr LEFT OUTER JOIN sdin_relaciones_tipos rt2 ON rt2.idRelacion=rr.idRelacion
            WHERE rr.idNormasRelaciones=? AND r.idNormaOrigen=rr.idNormaDestino AND r.idNormaDestino=rr.idNormaOrigen
            AND rt1.tipo=rt2.tipo)
        ;`;

        await conn.query(sql, [request.idNormasRelaciones])

        sql = `UPDATE sdin_normas_relaciones SET estado=4 WHERE idNormasRelaciones=?;`;

        await conn.query(sql, [request.idNormasRelaciones])
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

function traerTemas() {
    return new Promise((resolve, reject) => {
        sql = ` SELECT idTema, tema, descripcion FROM sdin_temas WHERE estado=1 `;

        connection.pool.query(sql, function (error, results) {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
}

function traerRamas() {
    return new Promise((resolve, reject) => {
        sql = ` SELECT idRama, rama, descripcion FROM sdin_ramas WHERE estado=1 `;

        connection.pool.query(sql, params, function (error, results) {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
}

function traerDescriptoresPorIdNormaSDIN(request) {
    return new Promise(async (resolve, reject) => {
        let respuesta;
        let sql = "";
        let params = []
        const conn = await connection.poolPromise.getConnection();
        try {
            await conn.beginTransaction();

            sql = ` SELECT b.id, b.descriptor FROM sdin_normas_descriptores a 
            LEFT OUTER JOIN sdin_descriptores b ON a.idDescriptor = b.id
            WHERE a.idNorma=? AND a.estado=1`;
            params = [request.idNormaSDIN]

            respuesta = await conn.query(sql, params);

            await conn.commit();
            resolve(respuesta);
        }
        catch (e) {
            await conn.rollback();
            reject(e);
        }
        finally {
            conn.close();
        }

    });
}

async function traerDescriptores(request) {
    let conn = await connection.poolPromise.getConnection();
    sql = ` SELECT id, descriptor FROM sdin_descriptores
                WHERE (UPPER(descriptor) LIKE UPPER(?)) AND habilitado=1 `;
    params = [request.textInput]
    let res = { totalDescriptores: 0 };

    try {
        await conn.beginTransaction();

        if (request.limite && request.paginaActual) {
            let total = await conn.query('SELECT COUNT(*) as total FROM' + sql.split('FROM')[1], params)
            sql = paginarQuery(request, sql)
            res.totalDescriptores = total[0].total;
        }

        res.results = await conn.query(sql, params);

        await conn.commit();

    }
    catch (e) {
        console.log(e)
        await conn.rollback();
    }
    finally {
        if (conn) conn.close();
        return res;
    }
}

async function agregarDescriptorNorma(request) {
    let conn = await connection.poolPromise.getConnection();
    try {
        await conn.beginTransaction();
        sql = `INSERT INTO sdin_normas_descriptores (idDescriptor, idNorma) VALUES (?,?)`;
        params = [request.idDescriptor, request.idNormaSDIN]
        await conn.query(sql, params).catch(e => { throw e })
        //Registro el evento 'agregar descriptor a normaSDIN'
        let sqlUser = `SELECT mig_nombre FROM sdin_usuarios WHERE idUsuario =?`
        let usuario = await conn.query(sqlUser, [request?.idUsuario]).catch((error) => { throw error })
        let sqlDesc = `SELECT descriptor FROM sdin_descriptores WHERE id=?`
        let descriptor = await conn.query(sqlDesc, [request.idDescriptor])
        let operacionEvento = `El usuario ${usuario[0].mig_nombre} agrega el descriptor ${descriptor[0].descriptor} a la norma con ID SDIN:(${request.idNormaSDIN})`
        let sqlEvento = `INSERT INTO trazabilidad (idNorma,negocio,operacion,usuario,tipoOperacion) VALUES(?,'SDIN',?,?,2)`
        let paramsEvento = [request.idNormaSDIN, operacionEvento, request.idUsuario]
        await conn.query(sqlEvento, paramsEvento).catch((error) => { throw error })

        await conn.commit();
    }
    catch (err) {
        await conn.rollback();
        throw err
    }
    finally {
        conn.close();
        return;
    }
}

async function eliminarDescriptorNorma(request) {
    let conn = await connection.poolPromise.getConnection();
    try {
        await conn.beginTransaction();
        let sql = `UPDATE sdin_normas_descriptores SET estado=4 WHERE idDescriptor=? AND idNorma=?`;
        let params = [request.idDescriptor, request.idNormaSDIN]
        await conn.query(sql, params)
        //Registro evento 'eliminar descriptor de normaSDIN'
        let sqlUser = `SELECT mig_nombre FROM sdin_usuarios WHERE idUsuario =?`
        let usuario = await conn.query(sqlUser, [request?.idUsuario]).catch((error) => { throw error })
        let sqlDesc = `SELECT descriptor FROM sdin_descriptores WHERE id=?`
        let descriptor = await conn.query(sqlDesc, [request.idDescriptor])
        let operacionEvento = `El usuario ${usuario[0].mig_nombre} elimina el descriptor ${descriptor[0].descriptor} a la norma con ID SDIN:(${request.idNormaSDIN})`
        let sqlEvento = `INSERT INTO trazabilidad (idNorma,negocio,operacion,usuario,tipoOperacion) VALUES(?,'SDIN',?,?,2)`
        let paramsEvento = [request.idNormaSDIN, operacionEvento, request.idUsuario]
        await conn.query(sqlEvento, paramsEvento).catch((error) => { throw error })

        await conn.commit();
    }
    catch (err) {
        await conn.rollback();
        throw err
    }
    finally {
        conn.close();
        return;
    }
}

async function obtenerTemasPadres(idTemaEspecifico) {
    let conn = await connection.poolPromise.getConnection();
    let response
    try {
        let sql = `WITH RECURSIVE TemasPadres AS (
            SELECT tj.idTemaHijo, tj.idTema, 1 AS nivel
            FROM sdin_temas_jerarquia tj
            WHERE tj.idTemaHijo = ? AND tj.estado = 1
            UNION ALL
            SELECT tj.idTemaHijo, tj.idTema, tp.nivel + 1
            FROM sdin_temas_jerarquia tj
            INNER JOIN TemasPadres tp ON tj.idTemaHijo = tp.idTema
          )
          SELECT DISTINCT
            tp.idTema,
            GROUP_CONCAT(t.tema ORDER BY tp.nivel DESC SEPARATOR ' > ') AS TemasConcatenados
          FROM sdin_temas t
          INNER JOIN TemasPadres tp ON t.idTema = tp.idTema;
          `;
        // Ejecuta la consulta SQL con el ID del tema específico como parámetro
        let params = [idTemaEspecifico];
        let temasPadres = await conn.query(sql, params).catch(e => { throw e });
        if (temasPadres.length === 0) { response = "RAMAS BADANAC" } else {
            response = temasPadres[0]
        }

    } catch (error) {
        console.log(error)
        throw error
    } finally {
        conn.close();
    }
    return response
}


async function traerTemasPorIdNormaSDIN(request) {
    let conn = await connection.poolPromise.getConnection();
    let temas = [];
    let response = []
    try {
        await conn.beginTransaction();
        sql = ` SELECT a.idTema, b.tema, b.descripcion
                FROM sdin_temas_jerarquia a 
                LEFT OUTER JOIN sdin_temas b ON a.idTema = b.idTema
                WHERE a.idNormaHijo=? AND a.estado=1`;
        params = [request.idNormaSDIN]
        temas = await conn.query(sql, params).catch(e => { throw e })
        //response.temas = temas
        //Armo el arbol de jerarquia
        if (temas.length > 0) {
            for (let index = 0; index < temas.length; index++) {
                let jerarquia = await obtenerTemasPadres(temas[index].idTema)
                response.push({ tema: temas[index], jerarquia: jerarquia.TemasConcatenados })
            }
        }
        await conn.commit();
    }
    catch (err) {
        await conn.rollback();
        throw err
    }
    finally {
        conn.close();
    }
    return response;
}

async function traerImagenesPorIdNormaSDIN(request) {
    let conn = await connection.poolPromise.getConnection();
    let imagenes = [];
    try {
        await conn.beginTransaction();
        sql = ` SELECT a.*
                FROM sdin_imagenes a 
                WHERE a.idNorma=?`;
        params = [request.idNormaSDIN]
        imagenes = await conn.query(sql, params).catch(e => { throw e })
        await conn.commit();
    }
    catch (err) {
        await conn.rollback();
        throw err
    }
    finally {
        conn.close();
    }
    return imagenes;
}

async function traerImagenPorIdNormaSDIN(request) {
    let conn = await connection.poolPromise.getConnection();
    let imagen = [];
    try {
        await conn.beginTransaction();
        sql = ` SELECT a.*
                FROM sdin_imagenes a 
                WHERE a.idNorma = ? AND numero = ?`;
        params = [request.idNormaSDIN, request.numero]
        imagen = await conn.query(sql, params).catch(e => { throw e })
        await conn.commit();
    }
    catch (err) {
        await conn.rollback();
        throw err
    }
    finally {
        conn.close();
    }
    return imagen;
}

async function traerRamaPorIdNormaSDIN(request) {
    let conn = await connection.poolPromise.getConnection();
    let resultado = [];
    try {
        await conn.beginTransaction();
        resultado = await conn.query(`SELECT idRama, rama, descripcion FROM sdin_ramas WHERE idRama=?`, [request.idRama])

        await conn.commit();
    }
    catch (err) {
        await conn.rollback();
        throw err
    }
    finally {
        conn.close();
    }
    return resultado;
}

async function agregarTemaNorma(request) {
    let conn = await connection.poolPromise.getConnection();
    try {
        await conn.beginTransaction();
        /* sql = ` SELECT temas FROM sdin_normas_metadatos
                        WHERE idNormaSDIN=? `;
        params = [request.idNormaSDIN]
        let resultado = await conn.query(sql, params).catch(e => { throw e })
        let temas = JSON.parse(resultado[0].temas)
 
        if (!(temas.temas.includes(request.idTema)) && request.idTema) {
            sql = `UPDATE sdin_normas_metadatos SET temas=? WHERE idNormaSDIN=?`;
            temas.temas.push(request.idTema);
            await conn.query(sql, [JSON.stringify(temas), request.idNormaSDIN])
                .catch(e => { throw e })
        }
        else {
            throw new Error("Tema no válido")
        } */
        let sql = `INSERT INTO sdin_temas_jerarquia (idTema, idNormaHijo, usuarioCreacion) VALUES (?,?,?)`;
        let params = [request.idTema, request.idNormaSDIN, request.idUsuario];

        await conn.query(sql, params).catch(e => { throw e })

        await guardarLog(conn, sql, params, request).catch(e => { throw e })
        //Registro evento 'agregar tema a normaSDIN"
        let sqlUser = `SELECT mig_nombre FROM sdin_usuarios WHERE idUsuario =?`
        let usuario = await conn.query(sqlUser, [request?.idUsuario]).catch((error) => { throw error })
        let sqlTema = `SELECT tema FROM sdin_temas WHERE idTema=?`
        let tema = await conn.query(sqlTema, [request.idTema])
        let operacionEvento = `El usuario ${usuario[0].mig_nombre} agrega el tema ${tema[0].tema} a la norma con ID SDIN:(${request.idNormaSDIN})`
        let sqlEvento = `INSERT INTO trazabilidad (idNorma,negocio,operacion,usuario,tipoOperacion) VALUES(?,'SDIN',?,?,2)`
        let paramsEvento = [request.idNormaSDIN, operacionEvento, request.idUsuario]
        await conn.query(sqlEvento, paramsEvento).catch((error) => { throw error })

        await conn.commit();
    }
    catch (err) {
        await conn.rollback();
        throw err
    }
    finally {
        conn.close();
        return;
    }
}

async function eliminarTemaNorma(request) {
    let conn = await connection.poolPromise.getConnection();
    try {
        await conn.beginTransaction();
        /* sql = ` SELECT temas FROM sdin_normas_metadatos
                        WHERE idNormaSDIN=? `;
        params = [request.idNormaSDIN]
        let resultado = await conn.query(sql, params).catch(e => { throw e })
        let temas = JSON.parse(resultado[0].temas)
 
        if ((temas.temas.includes(request.idTema)) && request.idTema) {
            sql = `UPDATE sdin_normas_metadatos SET temas=? WHERE idNormaSDIN=?`;
            temas.temas.splice(temas.temas.indexOf(request.idTema), 1);
            await conn.query(sql, [JSON.stringify(temas), request.idNormaSDIN])
                .catch(e => { throw e })
        }
        else {
            throw new Error("Tema no válido")
        } */
        let sql = `UPDATE sdin_temas_jerarquia SET estado=4, usuarioActualizacion=?, fechaActualizacion=CURRENT_TIMESTAMP() WHERE idTema=? AND idNormaHijo=?`;
        let params = [request.idUsuario, request.idTema, request.idNormaSDIN];

        await conn.query(sql, params).catch(e => { throw e })

        await guardarLog(conn, sql, params, request).catch(e => { throw e })
        //Registro el evento 'elimnar tema de normaSDIN'
        let sqlUser = `SELECT mig_nombre FROM sdin_usuarios WHERE idUsuario =?`
        let usuario = await conn.query(sqlUser, [request?.idUsuario]).catch((error) => { throw error })
        let sqlTema = `SELECT tema FROM sdin_temas WHERE idTema=?`
        let tema = await conn.query(sqlTema, [request.idTema])
        let operacionEvento = `El usuario ${usuario[0].mig_nombre} elimina el tema ${tema[0].tema} a la norma con ID SDIN:(${request.idNormaSDIN})`
        let sqlEvento = `INSERT INTO trazabilidad (idNorma,negocio,operacion,usuario,tipoOperacion) VALUES(?,'SDIN',?,?,2)`
        let paramsEvento = [request.idNormaSDIN, operacionEvento, request.idUsuario]
        await conn.query(sqlEvento, paramsEvento).catch((error) => { throw error })

        await conn.commit();
    }
    catch (err) {
        await conn.rollback();
        throw err
    }
    finally {
        conn.close();
        return;
    }
}

async function agregarRamaNorma(request) {
    let conn = await connection.poolPromise.getConnection();
    try {
        await conn.beginTransaction();

        sql = `UPDATE sdin_normas_metadatos SET idRama=? WHERE idNormaSDIN=?`;

        await conn.query(sql, [request.idRama, request.idNormaSDIN])
            .catch(e => { throw e })
        //Registro evento 'crear rama a norma'
        let sqlUser = `SELECT mig_nombre FROM sdin_usuarios WHERE idUsuario =?`
        let usuario = await conn.query(sqlUser, [request?.idUsuario]).catch((error) => { throw error })
        let sqlRama = `SELECT rama FROM sdin_ramas WHERE idRama=?`
        let rama = await conn.query(sqlRama, [request.idRama])
        let operacionEvento = `El usuario ${usuario[0].mig_nombre} agrega la rama ${rama[0].rama} a la norma con ID SDIN:(${request.idNormaSDIN})`
        let sqlEvento = `INSERT INTO trazabilidad (idNorma,negocio,operacion,usuario,tipoOperacion) VALUES(?,'SDIN',?,?,2)`
        let paramsEvento = [request.idNormaSDIN, operacionEvento, request.idUsuario]
        await conn.query(sqlEvento, paramsEvento).catch((error) => { throw error })

        await conn.commit();
    }
    catch (err) {
        await conn.rollback();
        throw err
    }
    finally {
        conn.close();
        return;
    }
}

async function eliminarRamaNorma(request) {
    let conn = await connection.poolPromise.getConnection();
    try {
        await conn.beginTransaction();
        sql = `UPDATE sdin_normas_metadatos SET idRama=NULL WHERE idNormaSDIN=?`;
        await conn.query(sql, [request.idNormaSDIN])
            .catch(e => { throw e })
        //Registro evento 'eliminar rama de normaSIN'
        let sqlUser = `SELECT mig_nombre FROM sdin_usuarios WHERE idUsuario =?`
        let usuario = await conn.query(sqlUser, [request?.idUsuario]).catch((error) => { throw error })
        let sqlRama = `SELECT rama FROM sdin_ramas WHERE idRama=?`
        let rama = await conn.query(sqlRama, [request.idRama])
        let operacionEvento = `El usuario ${usuario[0].mig_nombre} elimina la rama ${rama[0].rama} a la norma con ID SDIN:(${request.idNormaSDIN})`
        let sqlEvento = `INSERT INTO trazabilidad (idNorma,negocio,operacion,usuario,tipoOperacion) VALUES(?,'SDIN',?,?,2)`
        let paramsEvento = [request.idNormaSDIN, operacionEvento, request.idUsuario]
        await conn.query(sqlEvento, paramsEvento).catch((error) => { throw error })

        await conn.commit();
    }
    catch (err) {
        await conn.rollback();
        throw err
    }
    finally {
        conn.close();
        return;
    }
}

async function editarTextoOriginal(request) {
    let conn = await connection.poolPromise.getConnection();
    try {
        await conn.beginTransaction();
        sql = `UPDATE sdin_normas_textos_originales SET textoOriginal=? WHERE idNormaSDIN=?`;
        params = [request.textoOriginal, request.idNormaSDIN]
        await conn.query(sql, params).catch(e => { throw e })
        //Registro el evento 'editar texto original'
        let sqlUser = `SELECT mig_nombre FROM sdin_usuarios WHERE idUsuario =?`
        let usuario = await conn.query(sqlUser, [request?.idUsuario]).catch((error) => { throw error })
        let operacionEvento = `El usuario ${usuario[0].mig_nombre} edita el texto original de la norma (${request.idNormaSDIN})`
        let sqlEvento = `INSERT INTO trazabilidad (idNorma,negocio,operacion,usuario,tipoOperacion) VALUES(?,'SDIN',?,?,2)`
        let paramsEvento = [request.idNormaSDIN, operacionEvento, request.idUsuario]
        await conn.query(sqlEvento, paramsEvento).catch((error) => { throw error })

        await conn.commit();
    }
    catch (err) {
        await conn.rollback();
        throw err
    }
    finally {
        conn.close();
        return;
    }
}

async function editarTextoActualizado(request) {
    let conn = await connection.poolPromise.getConnection();
    try {
        await conn.beginTransaction();

        let registroTextoActualizado = await traerTextoActualizadoPorNormaId(request.idNormaSDIN)
        let sql
        if (registroTextoActualizado.length !== 0) {
            sql = `UPDATE sdin_normas_textos_actualizados SET textoActualizado=?, archivo=NULL, archivoS3=NULL WHERE idNormaSDIN=?`;
        } else {
            sql = `INSERT INTO sdin_normas_textos_actualizados (textoActualizado, idNormaSDIN) VALUES (?, ?)`;
        }
        params = [request.textoActualizado, request.idNormaSDIN]
        await conn.query(sql, params).catch(e => { throw e })
        //Registro evento 'actualizar texto actualizado'
        let sqlUser = `SELECT mig_nombre FROM sdin_usuarios WHERE idUsuario =?`
        let usuario = await conn.query(sqlUser, [request?.idUsuario]).catch((error) => { throw error })
        let operacionEvento = `El usuario ${usuario[0].mig_nombre} edita el texto-actualizado de la norma (${request.idNormaSDIN})`
        let sqlEvento = `INSERT INTO trazabilidad (idNorma,negocio,operacion,usuario,tipoOperacion) VALUES(?,'SDIN',?,?,2)`
        let paramsEvento = [request.idNormaSDIN, operacionEvento, request.idUsuario]
        await conn.query(sqlEvento, paramsEvento).catch((error) => { throw error })

        await conn.commit();
    }
    catch (err) {
        await conn.rollback();
        throw err
    }
    finally {
        conn.close();
        return;
    }
}

async function editarEstadoNormas(request) {
    let conn = await connection.poolPromise.getConnection();
    try {
        await conn.beginTransaction();

        sql = `UPDATE sdin_normas_estados SET estado=4, fechaBorrado=CURRENT_TIMESTAMP(), usuarioBorrado=? WHERE idNormaSDIN IN (${request.normas.join()}) AND estado=1`;
        params = [request.idUsuario]
        await conn.query(sql, params).catch(e => { throw e })

        sql = `INSERT INTO sdin_normas_estados (idNormasEstadoTipo, usuarioCarga, idNormaSDIN) VALUES (?,?,?)`;
        params = request.normas.map(n => ([request.idNormasEstadoTipo, request.idUsuario, n]))
        await conn.batch(sql, params).catch(e => { throw e })

        //Registro evento 'editar estado norma'
        let sqlUser = `SELECT mig_nombre FROM sdin_usuarios WHERE idUsuario =?`
        let usuario = await conn.query(sqlUser, [request?.idUsuario]).catch((error) => { throw error })
        let operacionEvento = `El usuario ${usuario[0].mig_nombre} edita el estado de la norma (${request.normas})`
        let sqlEvento = `INSERT INTO trazabilidad (idNorma,negocio,operacion,usuario,tipoOperacion) VALUES(?,'SDIN',?,?,2)`
        let paramsEvento = request.normas.map(n => ([n, operacionEvento, request.idUsuario]))
        await conn.batch(sqlEvento, paramsEvento).catch((error) => { throw error })

        await conn.commit();
    }
    catch (err) {
        console.log(err)
        await conn.rollback();
        throw err
    }
    finally {
        conn.close();
    }
}

async function checkAprobadoDocumental(request) {
    let conn = await connection.poolPromise.getConnection();
    try {
        await conn.beginTransaction();
        let sqlActualizarDato = `
        UPDATE sdin_normas_metadatos
        SET aprobadoDocumentalmente=?
        WHERE idNormaSDIN=?
        ;`;

        await conn.query(sqlActualizarDato, [
            request.aprobadoDocumentalmente,
            request.idNormaSDIN
        ])
            .catch((error) => {
                throw error
            })

        await conn.commit();

    } catch (error) {
        console.log(error)
        await conn.rollback();
        throw error;
    } finally {
        // Close Connection
        if (conn) conn.close();
    }
}

function agregarDescriptor(request) {
    return new Promise((resolve, reject) => {
        let sql = `INSERT INTO sdin_descriptores (descriptor) VALUES (?)`;
        let params = [request.descriptor]
        connection.pool.query(sql, params, function (error, results) {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
}

function traerTemasABM(request) {
    return new Promise(async (resolve, reject) => {

        sql = `SELECT a.*, b.rama 
                FROM sdin_temas a 
                LEFT OUTER JOIN sdin_ramas b ON a.idRama=b.idRama`;
        let res = []
        let conn = await connection.poolPromise.getConnection()
            .catch(error => { throw error });
        try {
            //Saca el total de logs contemplando los filtros de búsqueda
            res.totalTemas = await conn.query('SELECT COUNT(a.idTema) FROM' + sql.split(/FROM(.*)/s)[1])
                .catch(error => { throw error });
            res.temas = await conn.query(paginarQuery(request, sql)) //Agrega LIMIT - OFFSET a la query
                .catch(error => { throw error });
        }
        catch (error) {
            console.log(error, paginarQuery(request, sql))
            reject(error)
        }
        finally {
            conn.release();
            resolve(res);
        }
    });
}

async function agregarTemas(request) {
    sql = "INSERT INTO sdin_temas (tema, descripcion, idRama) VALUES (?,?,?);";
    params = [request.tema, request.descripcion, request.idRama];
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

async function editarTemas(request) {
    sql = `UPDATE sdin_temas
            SET tema=?, descripcion=?, idRama=?, estado=?
            WHERE idTema=?`;
    params = [request.tema, request.descripcion, request.idRama, request.estado, request.idTema];
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

async function eliminarTemas(request) {
    sql = `UPDATE sdin_temas SET estado=4 WHERE idTema=?;`;
    params = [request.idTema];
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

async function habilitarTema(request) {
    sql = `UPDATE sdin_temas SET estado=1 WHERE idTema=?;`;
    params = [request.idTema];
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

function traerClasesABM() {
    return new Promise((resolve, reject) => {

        sql = `SELECT * FROM sdin_clases WHERE estado = 1;`;
        params = [];

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

function borrarDescriptor(request) {
    return new Promise((resolve, reject) => {
        let sql = `UPDATE sdin_descriptores SET habilitado=0 WHERE id=?`;
        let params = [request.id]
        connection.pool.query(sql, params, function (error, results) {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
}
function editarDescriptor(request) {
    return new Promise((resolve, reject) => {
        let sql = `UPDATE sdin_descriptores SET descriptor=? WHERE id=?`;
        let params = [request.descriptor, request.idDescriptor]
        connection.pool.query(sql, params, function (error, results) {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
}

async function agregarClases(request) {
    sql = "INSERT INTO sdin_clases (clase, descripcion) VALUES (?,?);";
    params = [request.clase, request.descripcion];
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

async function editarClases(request) {
    sql = `UPDATE sdin_clases
            SET clase=?, descripcion=?
            WHERE idClase=? AND estado=1;`;
    params = [request.clase, request.descripcion, request.idClase];
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

async function eliminarClases(request) {
    sql = `UPDATE sdin_clases SET estado=4 WHERE idClase=?;`;
    params = [request.idClase];
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

function traerRelacionesTiposABM() {
    return new Promise((resolve, reject) => {

        sql = `SELECT * FROM sdin_relaciones_tipos WHERE estado = 1;`;
        params = [];

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

async function agregarRelacionesTipos(request) {
    sql = "INSERT INTO sdin_relaciones_tipos (relacion, descripcion, tipo) VALUES (?,?,?);";
    params = [request.relacion, request.descripcion, request.tipo];
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

async function editarRelacionesTipos(request) {
    sql = `UPDATE sdin_relaciones_tipos
            SET relacion=?, descripcion=?, tipo=?
            WHERE idRelacion=? AND estado=1;`;
    params = [request.relacion, request.descripcion, request.tipo, request.idRelacion];
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

async function eliminarRelacionesTipos(request) {
    sql = `UPDATE sdin_relaciones_tipos SET estado=4 WHERE idRelacion=?;`;
    params = [request.idRelacion];
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

async function traerJerarquiaTemas() {
    return new Promise((resolve, reject) => {
        let sql = `SELECT a.*, b.tema AS tema, c.tema AS temaHijo 
            FROM sdin_temas_jerarquia a
            LEFT OUTER JOIN sdin_temas b ON a.idTema=b.idTema
            LEFT OUTER JOIN sdin_temas c ON a.idTemaHijo=c.idTema
            WHERE a.estado=1 AND a.idNormaHijo IS NULL;`;
        connection.pool.query(sql, function (error, results) {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
}

async function traerJerarquiaNorma() {
    return new Promise((resolve, reject) => {
        let sql = `SELECT DISTINCT a.idTemasJerarquia, a.idNormaHijo, a.idTema 
                    FROM sdin_temas_jerarquia a
                    LEFT OUTER JOIN sdin_normas b ON b.idNormaSDIN=a.idNormaHijo
                    LEFT OUTER JOIN sdin_normas_estados c ON b.idNormaSDIN = c.idNormaSDIN
                    WHERE c.estado = 1
                    AND a.idNormaHijo IS NOT NULL 
                    AND a.estado=1
                    AND a.idTema IS NOT NULL`;
        connection.pool.query(sql, function (error, results) {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
}

function traerRamasABM() {
    return new Promise((resolve, reject) => {

        sql = `SELECT * FROM sdin_ramas WHERE estado = 1;`;
        params = [];

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

async function agregarRamas(request) {
    sql = "INSERT INTO sdin_ramas (rama, descripcion) VALUES (?,?);";
    params = [request.rama, request.descripcion];
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

async function editarRamas(request) {
    sql = `UPDATE sdin_ramas
            SET rama=?, descripcion=?
            WHERE idRama=? AND estado=1;`;
    params = [request.rama, request.descripcion, request.idRama];
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

async function eliminarRamas(request) {
    sql = `UPDATE sdin_ramas SET estado=4 WHERE idRama=?;`;
    params = [request.idRama];
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

function traerCausalesABM() {
    return new Promise((resolve, reject) => {

        sql = `SELECT * FROM dj_causales WHERE estado = 1;`;
        params = [];

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

async function crearJerarquiaTemas(request) {
    sql = `INSERT INTO sdin_temas_jerarquia (idTema, idTemaHijo, usuarioCreacion) VALUES (?,?,?);`;
    params = [request.idTema, request.idTemaHijo, request.idUsuario];
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

async function agregarCausales(request) {
    sql = "INSERT INTO dj_causales (nombre, causal) VALUES (?,?);";
    params = [request.nombre, request.causal];
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

async function editarCausales(request) {
    sql = `UPDATE dj_causales
            SET nombre=?, causal=?
            WHERE idCausal=? AND estado=1;`;
    params = [request.nombre, request.causal, request.idCausal];
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

async function eliminarCausales(request) {
    sql = `UPDATE dj_causales SET estado=4 WHERE idCausal=?;`;
    params = [request.idCausal];
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

function traerPatologiasABM() {
    return new Promise((resolve, reject) => {

        sql = `SELECT * FROM dj_patologias_normativas WHERE estado = 1;`;
        params = [];

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

async function agregarPatologias(request) {
    sql = "INSERT INTO dj_patologias_normativas (nombre) VALUES (?);";
    params = [request.nombre];
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

async function editarPatologias(request) {
    sql = `UPDATE dj_patologias_normativas
            SET nombre=?
            WHERE idPatologiaNormativa=? AND estado=1;`;
    params = [request.nombre, request.idPatologiaNormativa];
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

async function borrarJerarquiaTemas(request) {
    sql = `UPDATE sdin_temas_jerarquia SET estado=4, fechaActualizacion=CURRENT_TIMESTAMP(), usuarioActualizacion=? WHERE idTemasJerarquia=?;`;
    params = [request.idUsuario, request.idTemasJerarquia];
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

async function eliminarPatologias(request) {
    sql = `UPDATE dj_patologias_normativas SET estado=4 WHERE idPatologiaNormativa=?;`;
    params = [request.idPatologiaNormativa];
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

async function eliminarPatologias(request) {
    sql = `UPDATE dj_patologias_normativas SET estado=4 WHERE idPatologiaNormativa=?;`;
    params = [request.idPatologiaNormativa];
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

async function publicarNormaFront(request) {
    sqlTraerNormaFront = `SELECT * FROM sdin_normas_front WHERE idNormaSDIN=? AND estado=1`;
    let conn = await connection.poolPromise.getConnection().catch(e => { throw e });
    try {
        await conn.beginTransaction().catch(e => { throw e });
        const norma = await conn.query(sqlTraerNormaFront, [request.idNormaSDIN])
            .catch((error) => {
                throw error
            })
        if (norma[0]) {
            const metadatos = await conn.query(`SELECT * FROM sdin_normas_metadatos WHERE idNormaSDIN=? AND estado=1`, [request.idNormaSDIN]);
            delete metadatos[0].idNormasSDINMetadato;

            //Controlador de checks de la solapa "Front" de la Ficha de la Norma
            let check = `UPDATE sdin_normas_front SET mostrarTA=?, mostrarTC=?, mostrarRamaTema=? WHERE idNormaSDIN=?`;
            let paramsCheck = [request.mostrarTA, request.mostrarTC, request.mostrarRamaTema, request.idNormaSDIN];
            await conn.query(check, paramsCheck)
                .catch((error) => {
                    console.log("Este error viene de los checks", error)
                    throw error
                })

            let sql = `UPDATE sdin_normas_front SET ${Object.keys(metadatos[0]).map(n => n + '=?')} WHERE idNormaSDIN=? AND estado=1`;
            await conn.query(sql, [...Object.values(metadatos[0]), request.idNormaSDIN])
                .catch((error) => {
                    throw error
                })
            await guardarLog(conn, sql, [request.idNormaSDIN], request)
                .catch((error) => {
                    throw error
                })

            //Textos
            const textoOriginal = await conn.query('SELECT textoOriginal FROM sdin_normas_textos_originales WHERE idNormaSDIN=?', [norma[0].idNormaFront])
            if (textoOriginal?.length > 0) {
                await conn.query(`INSERT INTO sdin_normas_front_textos_originales (textoOriginal, idNormaFront) VALUES (?,?) ON DUPLICATE KEY UPDATE textoOriginal=values(textoOriginal)`, [textoOriginal[0].textoOriginal, norma[0].idNormaFront])
            }

            const textoActualizado = await conn.query('SELECT textoActualizado FROM sdin_normas_textos_actualizados WHERE idNormaSDIN=?', [norma[0].idNormaFront])
            if (textoActualizado?.length > 0) {
                await conn.query(`INSERT INTO sdin_normas_front_textos_actualizados (textoActualizado, idNormaFront) VALUES (?,?) ON DUPLICATE KEY UPDATE textoActualizado=values(textoActualizado)`, [textoActualizado[0].textoActualizado, norma[0].idNormaFront])
            }

            const archivo = await conn.query('SELECT archivo FROM sdin_normas_textos_actualizados WHERE idNormaSDIN=?', [norma[0].idNormaFront])
            if (archivo?.length > 0) {
                await conn.query(`UPDATE sdin_normas_front_textos_actualizados SET archivo=? WHERE idNormaFront=?`, [archivo[0].archivo, norma[0].idNormaFront])
            }

            const archivoS3 = await conn.query('SELECT archivoS3 FROM sdin_normas_textos_actualizados WHERE idNormaSDIN=?', [norma[0].idNormaFront])
            if (archivoS3?.length > 0) {
                await conn.query(`UPDATE sdin_normas_front_textos_actualizados SET archivoS3=? WHERE idNormaFront=?`, [archivoS3[0].archivoS3, norma[0].idNormaFront])
            }

        }
        else {
            let sql = `INSERT INTO sdin_normas_front (idNormaFront, idNormaSDIN, importadaBO, idNorma, normaAcronimoReferencia, 
                idNormaTipo, idNormaSubtipo, idSeccion, idReparticion, idReparticionOrganismo, normaAnio,
                normaNumero, normaSumario, temasGenerales, vigenciaEspecialDescripcion, vigenciaEspecial,
                vigente, linkPublicacionBO, idClase, idGestion, idTipoPublicacion, fechaPublicacion,
                fechaSancion, fechaPromulgacion, fechaRatificacion, fechaCarga, usuarioCarga, fechaActualizacion,
                usuarioActualizacion, usuarioAsignado, textoConsolidado, 
                archivo, archivoS3, titulo, observaciones, generaTA, clausulaDerogatoria, 
                clausulaDerogatoriaDescripcion, idRama, dependencias, checkDigesto,
                aprobadoNormativamente, aprobadoDocumentalmente, aprobadoEpistemologicamente, asiento, 
                estado, mostrarTA, mostrarTC, mostrarRamaTema) SELECT idNormaSDIN AS idNormaFront, idNormaSDIN, importadaBO, idNorma, normaAcronimoReferencia, 
                idNormaTipo, idNormaSubtipo, idSeccion, idReparticion, idReparticionOrganismo, normaAnio,
                normaNumero, normaSumario, temasGenerales, vigenciaEspecialDescripcion, vigenciaEspecial,
                vigente, linkPublicacionBO, idClase, idGestion, idTipoPublicacion, fechaPublicacion,
                fechaSancion, fechaPromulgacion, fechaRatificacion, fechaCarga, usuarioCarga, fechaActualizacion,
                usuarioActualizacion, usuarioAsignado, textoConsolidado, 
                archivo, archivoS3, titulo, observaciones, generaTA, clausulaDerogatoria, 
                clausulaDerogatoriaDescripcion, idRama, dependencias, checkDigesto,
                aprobadoNormativamente, aprobadoDocumentalmente, aprobadoEpistemologicamente, asiento, 
                estado, ?, ?, ? FROM sdin_normas_metadatos WHERE estado=1 AND idNormaSDIN=?`;
            let norma_publicada = await conn.query(sql, [request.mostrarTA, request.mostrarTC, request.mostrarRamaTema, request.idNormaSDIN])
                .catch((error) => {
                    throw error
                })
            await guardarLog(conn, sql, [request.idNormaSDIN], request)
                .catch((error) => {
                    throw error
                })

            await conn.query(`UPDATE sdin_normas_estados SET estado=4, usuarioCarga=? WHERE idNormaSDIN=? AND estado=1`, [request.idUsuario, request.idNormaSDIN])
                .catch((error) => {
                    throw error
                })
            await guardarLog(conn, `UPDATE sdin_normas_estados SET estado=4, usuarioCarga=? WHERE idNormaSDIN=? AND estado=1`, [request.idUsuario, request.idNormaSDIN], request)
                .catch((error) => {
                    throw error
                })

            await conn.query(`INSERT INTO sdin_normas_estados (idNormasEstadoTipo, idNormaSDIN, usuarioCarga) VALUES (5,?,?)`, [request.idNormaSDIN, request.idUsuario])
                .catch((error) => {
                    throw error
                })
            await guardarLog(conn, `INSERT INTO sdin_normas_estados (idNormasEstadoTipo, idNormaSDIN, usuarioCarga) VALUES (5,?,?)`, [request.idNormaSDIN, request.idUsuario], request)
                .catch((error) => {
                    throw error
                })

            //Textos
            await conn.query(`INSERT INTO sdin_normas_front_textos_originales (idNormaFront, textoOriginal) 
                SELECT idNormaSDIN, textoOriginal FROM sdin_normas_textos_originales WHERE idNormaSDIN=?`, [norma_publicada.insertId])
                .catch((error) => {
                    throw error
                })
            await conn.query(`INSERT INTO sdin_normas_front_textos_actualizados (idNormaFront, textoActualizado, archivo, archivoS3) 
                SELECT idNormaSDIN, textoActualizado, archivo, archivoS3 FROM sdin_normas_textos_actualizados WHERE idNormaSDIN=?`, [norma_publicada.insertId])
                .catch((error) => {
                    throw error
                })
        }

        //Registro evento 'publicar norma' 
        let sqlUser = `SELECT mig_nombre FROM sdin_usuarios WHERE idUsuario =?`
        let usuario = await conn.query(sqlUser, [request?.idUsuario]).catch((error) => { throw error })
        let operacionEvento = `El usuario ${usuario[0].mig_nombre} publica la norma con ID SDIN:(${request.idNormaSDIN})`
        let sqlEvento = `INSERT INTO trazabilidad (idNorma,negocio,operacion,usuario,tipoOperacion) VALUES(?,'SDIN',?,?,7)`
        let paramsEvento = [request.idNormaSDIN, operacionEvento, request.idUsuario]
        await conn.query(sqlEvento, paramsEvento).catch((error) => { throw error })

        await conn.commit();
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        if (conn) conn.close();
    }
}

async function borrarPublicacion(request) {
    let sql = `DELETE FROM sdin_normas_front WHERE idNormaSDIN=?`;
    let conn = await connection.poolPromise.getConnection().catch(e => { throw e });
    try {
        await conn.beginTransaction().catch(e => { throw e });
        await conn.query(sql, [request.idNormaSDIN])
            .catch((error) => {
                throw error
            })
        await conn.query(`DELETE FROM sdin_normas_front_textos_actualizados WHERE idNormaFront=?`, [request.idNormaSDIN])
            .catch((error) => {
                throw error
            })
        await conn.query(`DELETE FROM sdin_normas_front_textos_originales WHERE idNormaFront=?`, [request.idNormaSDIN])
            .catch((error) => {
                throw error
            })

        await guardarLog(conn, sql, [request.idNormaSDIN], request)
            .catch((error) => {
                throw error
            })
        //Registro el evento 'despublicar norma'
        let sqlUser = `SELECT mig_nombre FROM sdin_usuarios WHERE idUsuario =?`
        let usuario = await conn.query(sqlUser, [request?.idUsuario]).catch((error) => { throw error })
        let operacionEvento = `El usuario ${usuario[0].mig_nombre} despublica la norma con ID SDIN:(${request.idNormaSDIN})`
        let sqlEvento = `INSERT INTO trazabilidad (idNorma,negocio,operacion,usuario,tipoOperacion) VALUES(?,'SDIN',?,?,8)`
        let paramsEvento = [request.idNormaSDIN, operacionEvento, request.idUsuario]
        await conn.query(sqlEvento, paramsEvento).catch((error) => { throw error })

        await conn.commit();
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        if (conn) conn.close();
    }
}

async function normaTiposSDIN() {
    return new Promise((resolve, reject) => {
        let sql = `SELECT * FROM sdin_normas_tipos WHERE estado=1;`;
        connection.pool.query(sql, function (error, results) {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
}

async function editarNormaTipoSDIN(data) {
    return new Promise((resolve, reject) => {
        let sql = `UPDATE sdin_normas_tipos SET normaTipo=COALESCE(?,sdin_normas_tipos.normaTipo),nomenclatura=COALESCE(?,sdin_normas_tipos.nomenclatura), sigla=COALESCE(?,sdin_normas_tipos.sigla),orden=COALESCE(?,sdin_normas_tipos.orden) WHERE idNormaTipo=?;`;
        let params = [data.normaTipo, data.nomenclatura, data.sigla, data.orden, data.idNormaTipo]
        connection.pool.query(sql, params, function (error, results) {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
}

async function eliminarNormasTiposSDIN(data) {
    return new Promise((resolve, reject) => {
        let sql = `UPDATE sdin_normas_tipos SET estado=4 WHERE idNormaTipo=?;`;
        let params = [data.idNormaTipo]
        connection.pool.query(sql, params, function (error, results) {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
}

async function agregarNormasTiposSDIN(data) {
    return new Promise((resolve, reject) => {
        let sql = `INSERT INTO sdin_normas_tipos (normaTipo,nomenclatura,sigla,orden,estado) VALUES (?,?,?,?,1);`;
        let params = [data.normaTipo, data.nomenclatura, data.sigla, data.orden]
        connection.pool.query(sql, params, function (error, results) {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
}

async function traerDependencias(request) {
    let conn = await connection.poolPromise.getConnection().catch(e => { throw e });
    let results = {};
    try {
        await conn.beginTransaction().catch(e => { throw e });
        let sql = `SELECT T1.*, T2.organismo, T2.sigla AS organismoSigla, T3.dependencia AS padreNombre, T4.nivel AS nombreNivel,
            (SELECT COUNT(*) FROM sdin_dependencias T5 WHERE T5.padre = T1.idDependencia) AS Dp, 
            (SELECT COUNT(*) FROM sdin_dependencias T6 WHERE T6.padre = T1.idDependencia AND T6.fechaHasta IS NULL) AS DpVigentes
            FROM sdin_dependencias T1
            LEFT OUTER JOIN sdin_organismos T2 ON T1.idOrganismoEmisor = T2.idOrganismo
            LEFT OUTER JOIN sdin_dependencias T3 ON T1.padre = T3.idDependencia
            LEFT OUTER JOIN sdin_dependencias_niveles T4 ON T1.nivel = T4.id
            WHERE T1.estado = 1`;

        let params = []

        for (const [key, value] of Object.entries(request)) {
            if (!value) continue;
            switch (key) {
                case ('padre'):
                    sql += ` AND T1.padre=?`;
                    params.push(value)
                    break;
                case ('idOrganismoEmisor'):
                    sql += ` AND T1.idOrganismoEmisor=?`;
                    params.push(value)
                    break;
                case ('idDependencia'):
                    sql += ` AND T1.idDependencia=?`;
                    params.push(value)
                    break;
                case ('texto'):
                    sql += ` AND (T1.dependencia LIKE ? OR T1.sigla LIKE ?)`;
                    params.push(`%${value}%`, `%${value}%`)
                    break;
                case ('estado'):
                    switch (request.estado) {
                        case ('vigentes'):
                            sql += ` AND T1.fechaHasta IS NULL`;
                            break;
                        case ('no vigentes'):
                            sql += ` AND T1.fechaHasta IS NOT NULL`;
                            break;
                        default: break;
                    }
                    break;
                default: break;
            }
        }
        sql += ' ORDER BY T1.nivel ASC';

        let queryTotal = `
            SELECT COUNT(T1.idDependencia) AS total
            FROM sdin_dependencias T1
            LEFT OUTER JOIN sdin_organismos T2 ON T1.idOrganismoEmisor = T2.idOrganismo
            LEFT OUTER JOIN sdin_dependencias T3 ON T1.padre = T3.idDependencia
            LEFT OUTER JOIN sdin_dependencias_niveles T4 ON T1.nivel = T4.id
            WHERE ` + sql.split('WHERE')[sql.split('WHERE').length - 1];

        const [total] = await conn.query(queryTotal, params)

        //Paginación condicional
        if (request.limite && request.paginaActual) {
            sql = paginarQuery(request, sql)
        }

        results.dependencias = await conn.query(sql, params);
        results.total = total.total;

        await conn.commit();
    } catch (error) {
        console.log(error)
        await conn.rollback();
        throw error;
    } finally {
        if (conn) conn.close();
    }
    return results;
}

async function agregarDependenciasSDIN(data) {
    return new Promise((resolve, reject) => {
        let sql = `INSERT INTO sdin_dependencias 
        (dependencia,sigla,orden,idOrganismoEmisor,padre, fechaDesde, fechaHasta, nivel, idNormaSDIN) 
        VALUES (?,?,?,?,?,?,?,?,?);`;
        let params = [data.dependencia, data.sigla, data.orden, data.idOrganismo,
        data.padre, data.fechaDesde, data.fechaHasta, data.nivel, data.idNormaSDIN]
        connection.pool.query(sql, params, function (error, results) {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
}

async function editarDependenciasSDIN(data) {
    return new Promise((resolve, reject) => {
        let sql = `UPDATE sdin_dependencias SET 
            dependencia=COALESCE(?,sdin_dependencias.dependencia), 
            sigla=COALESCE(?,sdin_dependencias.sigla),
            orden=COALESCE(?,sdin_dependencias.orden),
            fechaDesde=COALESCE(?,sdin_dependencias.fechaDesde),
            fechaHasta=COALESCE(?,sdin_dependencias.fechaHasta),
            nivel=COALESCE(?,sdin_dependencias.nivel),
            padre=COALESCE(?,sdin_dependencias.padre),
            idNormaSDIN=COALESCE(?,sdin_dependencias.idNormaSDIN),
            idOrganismoEmisor=COALESCE(?,sdin_dependencias.idOrganismoEmisor) 
            WHERE idDependencia=?;`;
        let params = [data.dependencia, data.sigla, data.orden, data.fechaDesde, data.fechaHasta,
        data.nivel, data.padre, data.idNormaSDIN, data.idOrganismoEmisor, data.idDependencia];
        connection.pool.query(sql, params, function (error, results) {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
}

async function eliminarDependenciasSDIN(data) {
    return new Promise((resolve, reject) => {
        let sql = `UPDATE sdin_dependencias SET estado=4 WHERE idDependencia=?;`;
        let params = [data.idDependencia]
        connection.pool.query(sql, params, function (error, results) {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
}

async function traerOrganismos() {
    return new Promise((resolve, reject) => {
        let sql = `SELECT * FROM sdin_organismos WHERE estado=1;`;
        connection.pool.query(sql, function (error, results) {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
}

async function normaSubtiposSDIN() {
    return new Promise((resolve, reject) => {
        let sql = `SELECT * FROM bo_normas_subtipos WHERE estado=1;`;
        connection.pool.query(sql, function (error, results) {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
}

async function agregarAnexo(request) {
    let sql = `INSERT INTO sdin_normas_anexos (idNormaSDIN, archivo, archivoS3, usuarioCarga) VALUES (?,?,?,?)`;
    let conn = await connection.poolPromise.getConnection().catch(e => { throw e });
    try {
        await conn.beginTransaction().catch(e => { throw e });
        await conn.query(sql, [request.idNormaSDIN, request.archivo, request.archivoS3, request.idUsuario])
            .catch((error) => {
                throw error
            })

        await guardarLog(conn, sql, [request.idNormaSDIN, request.archivo, request.archivoS3, request.idUsuario], request)
            .catch((error) => {
                throw error
            })
        //Registro el evento 'agregar anexo'
        let sqlUser = `SELECT mig_nombre FROM sdin_usuarios WHERE idUsuario =?`
        let usuario = await conn.query(sqlUser, [request?.idUsuario]).catch((error) => { throw error })
        let operacionEvento = `El usuario ${usuario[0].mig_nombre} agrego un anexo a la norma:${request.idNormaSDIN}`
        let sqlEvento = `INSERT INTO trazabilidad (idNorma,negocio,operacion,usuario,tipoOperacion) VALUES(?,'SDIN',?,?,6)`
        let paramsEvento = [request.idNormaSDIN, operacionEvento, request.idUsuario]
        await conn.query(sqlEvento, paramsEvento)
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

async function borrarAnexo(request) {
    let sql = `UPDATE sdin_normas_anexos SET usuarioActualizacion=?, estado=4, fechaActualizacion=CURRENT_TIMESTAMP() WHERE idAnexoSDIN=?`;
    let conn = await connection.poolPromise.getConnection().catch(e => { throw e });
    try {
        await conn.beginTransaction().catch(e => { throw e });
        await conn.query(sql, [request.idUsuario, request.idAnexoSDIN])
            .catch((error) => {
                throw error
            })

        await guardarLog(conn, sql, [request.idUsuario, request.idAnexoSDIN], request)
            .catch((error) => {
                throw error
            })
        //Registro el evento 'agregar anexo'
        //Buscar la norma asociada al idAnexoSDIN
        let norma = await conn.query(`SELECT idNormaSDIN FROM sdin_normas_anexos WHERE idAnexoSDIN =?`, [request.idAnexoSDIN]).catch((error) => { throw error })
        let sqlUser = `SELECT mig_nombre FROM sdin_usuarios WHERE idUsuario =?`
        let usuario = await conn.query(sqlUser, [request?.idUsuario]).catch((error) => { throw error })
        let operacionEvento = `El usuario ${usuario[0].mig_nombre} elimino un anexo con ID:(${request.idAnexoSDIN}) asociado a la norma de ID:(${norma[0].idNormaSDIN}))`
        let sqlEvento = `INSERT INTO trazabilidad (idNorma,negocio,operacion,usuario,tipoOperacion) VALUES(?,'SDIN',?,?,4)`
        let paramsEvento = [norma[0].idNormaSDIN, operacionEvento, request.idUsuario]
        await conn.query(sqlEvento, paramsEvento)
            .catch((error) => {
                throw error
            })

        await conn.commit();
    } catch (error) {
        console.log(error)
        await conn.rollback();
        throw error;
    } finally {
        if (conn) conn.close();
    }
}

async function agregarAdjunto(request) {
    let sql = `INSERT INTO sdin_adjuntos (idNormaSDIN, archivo, archivoS3, usuarioCarga) VALUES (?,?,?,?)`;
    let conn = await connection.poolPromise.getConnection().catch(e => { throw e });
    try {
        await conn.beginTransaction().catch(e => { throw e });
        await conn.query(sql, [request.idNormaSDIN, request.archivo, request.archivoS3, request.idUsuario])
            .catch((error) => {
                throw error
            })

        await guardarLog(conn, sql, [request.idNormaSDIN, request.archivo, request.archivoS3, request.idUsuario], request)
            .catch((error) => {
                throw error
            })
        //Registro el evento 'agregar adjunto'
        let sqlUser = `SELECT mig_nombre FROM sdin_usuarios WHERE idUsuario =?`
        let usuario = await conn.query(sqlUser, [request?.idUsuario]).catch((error) => { throw error })
        let operacionEvento = `El usuario ${usuario[0].mig_nombre} agregó un adjunto a la norma:${request.idNormaSDIN}`
        let sqlEvento = `INSERT INTO trazabilidad (idNorma,negocio,operacion,usuario,tipoOperacion) VALUES(?,'SDIN',?,?,12)`
        let paramsEvento = [request.idNormaSDIN, operacionEvento, request.idUsuario]
        await conn.query(sqlEvento, paramsEvento)
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

async function borrarAdjunto(request) {
    let sql = `UPDATE sdin_adjuntos SET usuarioActualizacion=?, estado=4, fechaActualizacion=CURRENT_TIMESTAMP() WHERE idAdjuntoSDIN=?`;
    let conn = await connection.poolPromise.getConnection().catch(e => { throw e });
    try {
        await conn.beginTransaction().catch(e => { throw e });
        await conn.query(sql, [request.idUsuario, request.idAdjuntoSDIN])
            .catch((error) => {
                throw error
            })

        await guardarLog(conn, sql, [request.idUsuario, request.idAdjuntoSDIN], request)
            .catch((error) => {
                throw error
            })
        //Registro el evento 'borrar adjunto'
        //Buscar la norma asociada al idAdjuntoSDIN
        let norma = await conn.query(`SELECT idNormaSDIN FROM sdin_adjuntos WHERE idAdjuntoSDIN =?`, [request.idAdjuntoSDIN]).catch((error) => { throw error })
        let sqlUser = `SELECT mig_nombre FROM sdin_usuarios WHERE idUsuario =?`
        let usuario = await conn.query(sqlUser, [request?.idUsuario]).catch((error) => { throw error })
        let operacionEvento = `El usuario ${usuario[0].mig_nombre} elimino un adjunto con ID:(${request.idAdjuntoSDIN}) asociado a la norma de ID:(${norma[0].idNormaSDIN}))`
        let sqlEvento = `INSERT INTO trazabilidad (idNorma,negocio,operacion,usuario,tipoOperacion) VALUES(?,'SDIN',?,?,4)`
        let paramsEvento = [norma[0].idNormaSDIN, operacionEvento, request.idUsuario]
        await conn.query(sqlEvento, paramsEvento)
            .catch((error) => {
                throw error
            })

        await conn.commit();
    } catch (error) {
        console.log(error)
        await conn.rollback();
        throw error;
    } finally {
        if (conn) conn.close();
    }
}

async function agregarDependenciaNormas(request) {
    let sql = `INSERT INTO sdin_normas_dependencias (idNorma, idDependencia) VALUES (?,?)`;
    let conn = await connection.poolPromise.getConnection().catch(e => { throw e });
    try {
        await conn.beginTransaction().catch(e => { throw e });
        let params = request.normas.map(n => ([n, request.idDependencia]));
        await conn.batch(sql, params)

        sql = `INSERT INTO trazabilidad (idNorma, operacion, negocio, usuario, tipoOperacion) VALUES (?,?,'SDIN',?,2)`;
        params = request.normas.map(n => ([n, `${request.apellidoNombre} agrega la dependencia con id ${request.idDependencia} a la norma ${n}`, request.idUsuario]));
        await conn.batch(sql, params)

        await conn.commit();
    } catch (error) {
        console.log(error)
        await conn.rollback();
        throw error;
    } finally {
        if (conn) conn.close();
    }
}

async function borrarDependenciaNormas(request) {
    let sql = `UPDATE sdin_normas_dependencias SET estado=4 WHERE idDependencia=? AND idNorma IN (?)`;
    let conn = await connection.poolPromise.getConnection().catch(e => { throw e });
    try {
        await conn.beginTransaction().catch(e => { throw e });
        await conn.query(sql, [request.idDependencia, request.normas])
            .catch((error) => {
                throw error
            })

        sql = `INSERT INTO trazabilidad (idNorma, operacion, negocio, usuario, tipoOperacion) VALUES (?,?,'SDIN',?,2)`;
        let params = request.normas.map(n => ([n, `${request.apellidoNombre} borra la dependencia con id ${request.idDependencia} de la norma ${n}`, request.idUsuario]));
        await conn.batch(sql, params)

        await conn.commit();
    } catch (error) {
        console.log(error)
        await conn.rollback();
        throw error;
    } finally {
        if (conn) conn.close();
    }
}

async function traerEstadosSDIN() {
    return new Promise((resolve, reject) => {
        let sql = `SELECT * FROM sdin_normas_estados_tipos WHERE habilitado=1`;
        connection.pool.query(sql, function (error, results) {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
}

async function traerNiveles() {
    return new Promise((resolve, reject) => {
        let sql = `SELECT * FROM sdin_dependencias_niveles`;
        connection.pool.query(sql, function (error, results) {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
}

async function traerTrazabilidad(request) {
    return new Promise(async (resolve, reject) => {
        let sql = `SELECT a.*, b.usuario AS cuenta, b.email, b.apellidoNombre, b.mig_nombre, 
                    c.idTipoOperacion, c.nombre_operacion
                    FROM trazabilidad a
                    LEFT OUTER JOIN sdin_usuarios b ON a.usuario=b.idUsuario
                    LEFT OUTER JOIN trazabilidad_tipos c ON a.tipoOperacion=c.idTipoOperacion
                    WHERE 1=1`;

        for (const [key, value] of Object.entries(request)) {
            if (!value) continue;
            switch (key) {
                case ('usuario'):
                    sql = String(sql) + String(` AND a.${key}=${value}`);
                    break;
                case ('idTipoOperacion'):
                    sql = String(sql) + String(` AND c.${key}=${value}`);
                    break;
                case ('idNorma'):
                    sql = String(sql) + String(` AND a.${key}=${value}`);
                    break;
                case ('fechaDesde'):
                    sql = `${sql} AND DATE(a.fechaHora) >= '${request.fechaDesde}'`;
                    break;
                case ('fechaHasta'):
                    sql = `${sql} AND DATE(a.fechaHora) <= '${request.fechaHasta}'`;
                    break;
            }
        }

        sql += " ORDER BY a.fechaHora DESC"

        let res = []
        let conn = await connection.poolPromise.getConnection()
            .catch(error => { throw error });
        try {
            //Saca el total de logs contemplando los filtros de búsqueda
            res.totalLogs = await conn.query('SELECT COUNT(*) FROM' + sql.split(/FROM(.*)/s)[1])
                .catch(error => { throw error });
            res.logs = await conn.query(paginarQuery(request, sql)) //Agrega LIMIT - OFFSET a la query
                .catch(error => { throw error });
        }
        catch (error) {
            console.log(error, paginarQuery(request, sql))
            reject(error)
        }
        finally {
            conn.release();
            resolve(res);
        }

    });
}

async function traerTrazabilidadUsuarios() {
    return new Promise((resolve, reject) => {
        let sql = `SELECT a.*
                    FROM sdin_usuarios a`;
        connection.pool.query(sql, function (error, results) {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
}

async function traerTiposTrazabilidad() {
    return new Promise((resolve, reject) => {
        let sql = `SELECT a.*
                    FROM trazabilidad_tipos a`;
        connection.pool.query(sql, function (error, results) {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
}


module.exports = {
    traerNormasNoPublicadasBO,
    traerNormasPublicadasBO,
    importarNormasNoPublicadasBO,
    traerNormas,
    importarNormasPublicadasBO,
    traerNorma,
    crearNormaSDIN,
    traerClases, traerGestion, traerTiposPublicaciones,
    editarNormasSDIN, asignarNormas, traerRelacionesTipos,
    crearRelacion,
    traerRelacionesDeNorma,
    editarRelacion,
    eliminarRelacion,
    traerTemas,
    traerDescriptoresPorIdNormaSDIN,
    traerDescriptores,
    agregarDescriptorNorma,
    eliminarDescriptorNorma,
    traerTemasPorIdNormaSDIN,
    traerRamaPorIdNormaSDIN,
    traerRamas,
    eliminarTemaNorma,
    agregarTemaNorma,
    eliminarRamaNorma,
    agregarRamaNorma,
    editarTextoOriginal,
    editarTextoActualizado,
    editarEstadoNormas,
    checkAprobadoDocumental,
    agregarDescriptor,
    borrarDescriptor,
    traerJerarquiaTemas, borrarJerarquiaTemas, crearJerarquiaTemas, traerJerarquiaNorma,
    traerTemasABM, agregarTemas, editarTemas, eliminarTemas, habilitarTema,
    traerClasesABM, agregarClases, editarClases, eliminarClases,
    traerRelacionesTiposABM, agregarRelacionesTipos, editarRelacionesTipos, eliminarRelacionesTipos,
    traerRamasABM, agregarRamas, editarRamas, eliminarRamas,
    traerCausalesABM, agregarCausales, editarCausales, eliminarCausales,
    traerPatologiasABM, agregarPatologias, editarPatologias, eliminarPatologias,
    publicarNormaFront, normaTiposSDIN, borrarNormasSDIN, borrarPublicacion,
    normaSubtiposSDIN, agregarAnexo, borrarAnexo, traerDependencias, traerOrganismos, traerHistorial, traerHistorialDJ,
    editarNormaTipoSDIN, eliminarNormasTiposSDIN, agregarNormasTiposSDIN,
    agregarDependenciasSDIN, editarDependenciasSDIN, eliminarDependenciasSDIN, agregarDependenciaNormas,
    traerEstadosSDIN, traerNiveles, editarArchivoTextoActualizadoSDIN, traerTrazabilidad, traerTrazabilidadUsuarios,
    traerImagenesPorIdNormaSDIN, traerImagenPorIdNormaSDIN,
    traerTiposTrazabilidad, agregarAdjunto, borrarAdjunto, borrarDependenciaNormas,
    editarDescriptor

}