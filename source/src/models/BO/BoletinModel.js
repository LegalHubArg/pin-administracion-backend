var connection = require("../../services/conexion-mariadb");
const { guardarLog } = require('../../helpers/logs')
const { paginarQuery } = require('../../helpers/paginacion');

let crearEstadoBoletinSql = `INSERT INTO bo_boletines_estados (
    idBoletin, 
    idBoletinEstadoTipo,
    usuarioCreacion
    ) VALUES (?,?,?)`;

let borrarEstadoBoletinSql = `UPDATE bo_boletines_estados SET fechaBorrado=CURRENT_TIMESTAMP,
        usuarioBorrado=?,
        estado=4
        WHERE idBoletin=? 
        AND estado=1`;

let crearMetadatosBoletinSql = `INSERT INTO bo_boletines_metadatos (
    idBoletin, 
    boletinSecciones,
    boletinNombre,
    boletinNumero,
    usuarioCreacion
    ) VALUES (?,?,?,?,?)`;

let borrarMetadatoBoletinSql = `UPDATE bo_boletines_metadatos SET fechaBorrado=CURRENT_TIMESTAMP,
    usuarioBorrado=?,
    estado=4
    WHERE idBoletin=? 
    AND estado=1`;

async function crearBoletin(request) {
    let crearBoletinSql = `INSERT INTO bo_boletines (fechaPublicacion, usuarioCreacion) VALUES (?,?)`;
    let params = [request.fechaPublicacion, request.usuario]

    let conn = await connection.poolPromise.getConnection();

    try {

        await conn.beginTransaction();

        //Creacion del Boletin
        const boletinCreado = await conn.query(crearBoletinSql, params)
            .catch(err => { throw err });

        await conn.query(crearEstadoBoletinSql, [boletinCreado.insertId, 1, request.usuario])
            .catch(err => { throw err });

        await conn.query(crearMetadatosBoletinSql,
            [boletinCreado.insertId,
            request.boletinSecciones,
            request.boletinNombre,
            request.boletinNumero,
            request.usuario]
        )
            .catch(err => { throw err });

        await guardarLog(conn, crearBoletinSql, params, request).catch(err => { throw err });
        await guardarLog(conn, crearEstadoBoletinSql, [boletinCreado.insertId, 1, request.usuario], request).catch(err => { throw err });
        await guardarLog(conn, crearMetadatosBoletinSql, [boletinCreado.insertId,
        request.boletinSecciones,
        request.boletinNombre,
        request.boletinNumero,
        request.usuario], request).catch(err => { throw err });

        //Si el boletin que estoy creando es una segunda edición para la fecha, no debo asignar ninguna norma al mismo
        const [esSegundaEdicion] = await conn.query('SELECT 1 FROM bo_boletines WHERE fechaPublicacion=?', [request.fechaPublicacion])
        if (esSegundaEdicion) { await conn.commit(); return; }

        //Traigo todas las normas desde-hasta, tal que la fecha de publicacion DEL BOLETIN QUE SE ESTÁ INTENTANDO CREAR
        //esté entre la fechaDesde y la fechaHasta de la norma, y además, que la norma no esté ya asignada a un 
        //boletín para dicha fecha, ya que puede haber más de una edición para el mismo día
        const normasDesdeHasta = await conn.query(`
            (SELECT DISTINCT a.idNorma 
            FROM normas a
            LEFT OUTER JOIN normas_metadatos b ON a.idNorma = b.idNorma
            LEFT OUTER JOIN normas_estados c ON a.idNorma = c.idNorma
            LEFT OUTER JOIN bo_boletines_normas d ON d.idNorma=a.idNorma
            LEFT OUTER JOIN bo_boletines e ON d.idBoletin=e.idBoletin
            WHERE b.estado=1
            AND c.estado=1
            AND ? BETWEEN b.fechaDesde AND b.fechaHasta
            AND c.idNormasEstadoTipo >= 7
            AND (e.fechaPublicacion != ? OR e.fechaPublicacion IS NULL)
            )
            UNION (SELECT idNorma FROM normas_republicaciones WHERE fechaPublicacion=?)`,
            [request.fechaPublicacion, request.fechaPublicacion, request.fechaPublicacion])
            .catch(err => { throw err });

        //Cambio de Estado de las Normas y las asocio al boletin
        if (request.normas.length > 0) {

            let sqlBorrarEstadoNormas = `UPDATE normas_estados 
            SET estado=4, fechaBorrado=CURRENT_TIMESTAMP, usuarioBorrado=${request.usuario} 
            WHERE estado=1 AND idNorma IN (${request.normas})`;

            let sqlCrearEstadoNormas = `INSERT INTO normas_estados (idNorma, idNormasEstadoTipo, usuarioCarga) 
            VALUES (${request.normas.join(`,8,${request.usuario}),(`)},8,${request.usuario});`;

            await conn.query(sqlBorrarEstadoNormas).catch(err => { throw err });
            await conn.query(sqlCrearEstadoNormas).catch(err => { throw err });

            await guardarLog(conn, sqlBorrarEstadoNormas, [], request).catch(err => { throw err });
            await guardarLog(conn, sqlCrearEstadoNormas, [], request).catch(err => { throw err });

            let sql = `INSERT INTO bo_boletines_normas (idBoletin, idNorma) VALUES ${request.normas.map(n => `(${boletinCreado.insertId},${n})`)}`
            await conn.query(sql)
            await guardarLog(conn, sql, [], request)

        }

        if (normasDesdeHasta?.length > 0) {
            let sql = `INSERT INTO bo_boletines_normas (idBoletin, idNorma) VALUES ${normasDesdeHasta.map(n => `(${boletinCreado.insertId},${n.idNorma})`)}`
            await conn.query(sql)
            await guardarLog(conn, sql, [], request)
        }

        await conn.commit();

    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        // Close Connection
        if (conn) conn.close();
    }
}

function existeBoletinPorFecha(request) {
    return new Promise(async (resolve, reject) => {
        sql = `SELECT a.idBoletin, a.fechaPublicacion, c.idBoletinEstadoTipo, c.boletinEstadoTipo 
        FROM bo_boletines a 
        LEFT OUTER JOIN bo_boletines_estados b ON a.idBoletin = b.idBoletin
        LEFT OUTER JOIN bo_boletines_estados_tipos c ON b.idBoletinEstadoTipo = c.idBoletinEstadoTipo
        WHERE a.fechaPublicacion = ? AND b.idBoletinEstadoTipo != 5 AND b.estado=1`;
        params = [request]

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

function traerNormaParaPDF(request) {
    return new Promise(async (resolve, reject) => {
        let res = {};
        let sql = "";
        let params = []
        const conn = await connection.poolPromise.getConnection();
        try {
            await conn.beginTransaction();

            sql = `SELECT meta.*, digi.normaDocumento

            FROM
            normas nrm , normas_metadatos meta, normas_estados estado, normas_digitalizaciones digi
                    
            WHERE nrm.idNorma = meta.idNorma
            AND nrm.idNorma = estado.idNorma
            AND nrm.idNorma = digi.idNorma            
            
            AND meta.estado = 1
            AND estado.estado = 1
            AND digi.estado = 1
                    
                    AND nrm.idNorma = ?
                    LIMIT 1
                        `;
            params = [request.idNorma]
            res.meta = await conn.query(sql, params);

            let a = await conn.commit();
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

//Trae las normas que ya están asignadas al boletín
function traerNormasOrdenadasDeUnBoletin(request) {
    return new Promise(async (resolve, reject) => {
        let res = {};
        let sql = "";
        let params = []
        let conn = await connection.poolPromise.getConnection();
        try {
            await conn.beginTransaction();

            sql = `
                        SELECT a.idBoletin, c.boletinSecciones, a.fechaPublicacion, c.boletinNumero 
                        FROM
                        bo_boletines a, bo_boletines_estados b, bo_boletines_metadatos c
                        WHERE
                        a.idBoletin = b.idBoletin 
                        AND a.idBoletin = c.idBoletin
                        AND b.estado = 1
                        AND c.estado = 1
            
                        AND a.idBoletin = ?
                        `;
            params = [request.idBoletin, request.idBoletin]
            res.meta = await conn.query(sql, params);

            res.normas = await conn.query(
                `(SELECT meta.*, bn.idBoletin, bn.archivoPublicado, s.seccionOrden, s.seccion, nt.normaTipoOrden, ns.normaSubtipoOrden, r.reparticionOrden,
                bo_reparticiones.siglaReparticion, bo_normas_tipos.normaTipoSigla, s.es_poder, bo_normas_subtipos.normaSubtipoSigla,
                bo_normas_subtipos.normaSubtipo, bo_normas_tipos.normaTipo, bo_reparticiones.reparticion, digi.normaDocumento, ne.idNormasEstadoTipo
                FROM bo_boletines_normas bn, normas_metadatos meta
                LEFT OUTER JOIN bo_sumario_secciones s ON s.idSeccion=meta.idSeccion
                LEFT OUTER JOIN bo_sumario_seccion_reparticiones r ON (r.idReparticion=meta.idReparticion AND r.idSeccion=s.idSeccion)
                LEFT OUTER JOIN bo_sumario_seccion_normas_tipos nt ON (nt.idNormaTipo=meta.idNormaTipo AND nt.idSeccion=s.idSeccion)
                LEFT OUTER JOIN bo_sumario_seccion_normas_tipos_subtipos ns ON (ns.idNormaSubtipo=meta.idNormaSubtipo AND ns.idSumarioNormasTipo=nt.idSumarioNormasTipo)
                LEFT OUTER JOIN bo_reparticiones ON meta.idReparticion=bo_reparticiones.idReparticion
                LEFT OUTER JOIN bo_normas_tipos ON meta.idNormaTipo=bo_normas_tipos.idNormaTipo
                LEFT OUTER JOIN bo_normas_subtipos ON meta.idNormaSubtipo=bo_normas_subtipos.idNormaSubtipo
                LEFT OUTER JOIN normas_digitalizaciones digi ON meta.idNorma=digi.idNorma
                LEFT OUTER JOIN normas_estados ne ON ne.idNorma=meta.idNorma
                LEFT OUTER JOIN normas_estados_tipos net ON ne.idNormasEstadoTipo=net.idNormasEstadoTipo
                WHERE bn.idNorma=meta.idNorma 
                AND (digi.estado=1 OR digi.estado IS NULL)
                AND bn.idBoletin=?
                AND ne.estado=1
                AND meta.estado=1
                AND s.es_poder=0)
                UNION 
                (SELECT meta.*, bn.idBoletin, bn.archivoPublicado, s.seccionOrden, s.seccion, nt.normaTipoOrden, ns.normaSubtipoOrden, r.reparticionOrden,
                bo_reparticiones.siglaReparticion, bo_normas_tipos.normaTipoSigla, s.es_poder, bo_normas_subtipos.normaSubtipoSigla,
                bo_normas_subtipos.normaSubtipo, bo_normas_tipos.normaTipo, bo_reparticiones.reparticion, digi.normaDocumento, ne.idNormasEstadoTipo
                FROM bo_boletines_normas bn, normas_metadatos meta
                LEFT OUTER JOIN bo_sumario_secciones s ON s.idSeccion=meta.idSeccion
                LEFT OUTER JOIN bo_sumario_seccion_normas_tipos nt ON (nt.idNormaTipo=meta.idNormaTipo AND nt.idSeccion=s.idSeccion)
                LEFT OUTER JOIN bo_sumario_seccion_normas_tipos_subtipos ns ON (ns.idNormaSubtipo=meta.idNormaSubtipo AND ns.idSumarioNormasTipo=nt.idSumarioNormasTipo)
                LEFT OUTER JOIN bo_sumario_seccion_normas_tipos_reparticiones r ON (r.idReparticion=meta.idReparticion AND r.idSumarioNormasTipo=nt.idSumarioNormasTipo)
                LEFT OUTER JOIN bo_reparticiones ON meta.idReparticion=bo_reparticiones.idReparticion
                LEFT OUTER JOIN bo_normas_tipos ON meta.idNormaTipo=bo_normas_tipos.idNormaTipo
                LEFT OUTER JOIN bo_normas_subtipos ON meta.idNormaSubtipo=bo_normas_subtipos.idNormaSubtipo
                LEFT OUTER JOIN normas_digitalizaciones digi ON meta.idNorma=digi.idNorma
                LEFT OUTER JOIN normas_estados ne ON ne.idNorma=meta.idNorma
                LEFT OUTER JOIN normas_estados_tipos net ON ne.idNormasEstadoTipo=net.idNormasEstadoTipo
                WHERE bn.idNorma=meta.idNorma 
                AND (digi.estado=1 OR digi.estado IS NULL)
                AND bn.idBoletin=?
                AND ne.estado=1
                AND meta.estado=1
                AND s.es_poder=1)
                ORDER BY seccionOrden,
                    (CASE WHEN es_poder=0 THEN reparticionOrden END),
                    normaTipoOrden,
                    normaSubtipoOrden, 
                    (CASE WHEN es_poder=1 THEN reparticionOrden END),
                    organismoEmisor, 
                    normaAnio, 
                    normaNumero`
                , params);

            if (!res.meta[0]) {
                console.log("NO HAY NORMAS")
            }

            await conn.commit();
            resolve(res);
        }
        catch (e) {
            reject(e);
        }
        finally {
            conn.close();
        }

    });
}

async function crearEstadoBoletin(request) {
    sql = `INSERT INTO bo_boletines_estados (
                idBoletin, 
                usuarioCreacion
                ) VALUES (?,?)`;
    params = [request.idBoletin, request.usuario]
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

async function crearMetadatosBoletin(request) {
    sql = `INSERT INTO bo_boletines_estados (
        idBoletin, 
        boletinNormas,
        boletinSecciones,
        boletinNombre,
        boletinNumero,
        usuarioCreacion
        ) VALUES (?,?,?,?,?,?)`;
    params = [request.idBoletin, request.boletinNormas, request.boletinSecciones, request.boletinNombre, request.boletinNumero, request.usuario]
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

function traerNormasPorFechaOrdenadasPorSumario(request) {
    return new Promise(async (resolve, reject) => {
        sql = `SELECT meta.* 

        FROM
        normas nrm , normas_metadatos meta, normas_estados estado,
        
        ( SELECT xx.idSeccion, xx.seccion, xx.seccionOrden, yy.idSumarioNormasTipo, yy.idNormaTipo, yy.normaTipo, yy.normaTipoOrden, yy.normaTipoHoraCargaInicial, yy.normaTipoHoraCargaFinal, zz.idNormaSubtipo, zz.normaSubtipo, zz.normaSubtipoOrden, rr.idOrgJerarquia, rr.idReparticion, rr.reparticion, rr.reparticionOrden, rr.idReparticionOrganismo, rr.organismo
                FROM bo_sumario_secciones xx
                LEFT OUTER JOIN ( 
                SELECT c.idSeccion, a.idSumarioNormasTipo, b.idNormaTipo, b.normaTipo, a.normaTipoOrden, a.normaTipoHoraCargaInicial, a.normaTipoHoraCargaFinal
                        FROM bo_sumario_seccion_normas_tipos a
                        LEFT OUTER JOIN bo_normas_tipos b ON a.idNormaTipo = b.idNormaTipo
                        LEFT OUTER JOIN bo_sumario_secciones c ON a.idSeccion = c.idSeccion
                        WHERE a.estado = 1
                        AND b.estado = 1
                        ORDER BY a.normaTipoOrden ASC
                
                ) yy ON xx.idSeccion = yy.idSeccion
                LEFT OUTER JOIN ( 
                SELECT 	d.idSumarioNormasTipo,
                f.idNormaSubtipo,
                        f.normaSubtipo,
                        d.normaSubtipoOrden
                    FROM bo_sumario_seccion_normas_tipos_subtipos d
                    LEFT OUTER JOIN bo_normas_subtipos f ON d.idNormaSubtipo = f.idNormaSubtipo
                    WHERE
                    1=1
                    AND d.estado = 1
                    AND f.estado = 1
                    ORDER BY d.normaSubtipoOrden ASC
                
                ) zz ON yy.idSumarioNormasTipo = zz.idSumarioNormasTipo
                LEFT OUTER JOIN ( 
                SELECT g.idSumarioNormasTiposReparticion, g.idSumarioNormasTipo, i.idReparticion, i.reparticion, i.siglaReparticion, g.reparticionOrden, g.idOrgJerarquia
                        FROM bo_sumario_seccion_normas_tipos_reparticiones g
                        LEFT OUTER JOIN bo_reparticiones i ON g.idReparticion = i.idReparticion
                        WHERE 1=1
                        AND i.estado = 1
                        ORDER BY g.reparticionOrden ASC
                
                ) rr ON zz.idSumarioNormasTipo = rr.idSumarioNormasTipo
                
                
                
                WHERE 1=1
                AND xx.estado = 1 
                
                ORDER BY xx.seccionOrden, yy.normaTipoOrden, zz.normaSubtipoOrden, rr.reparticionOrden ASC ) sumario
                
        WHERE nrm.idNorma = meta.idNorma
        AND nrm.idNorma = estado.idNorma
        AND ( estado.idNormasEstadoTipo = 7 OR estado.idNormasEstadoTipo = 8)
        AND meta.idSeccion = sumario.idSeccion
        AND meta.idNormaTipo = sumario.idNormaTipo
        AND meta.idNormaSubtipo = sumario.idNormaSubtipo
        AND meta.idReparticion = sumario.idReparticion
        
        AND meta.estado = 1
        AND estado.estado = 1
        
        AND DATE(meta.fechaCarga) = ? 
        
        ORDER BY sumario.seccionOrden, sumario.normaTipoOrden, sumario.normaSubtipoOrden, sumario.reparticionOrden`;
        params = [request]

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

function traerNormasPorFechaPublicacionOrdenadasPorSumario(request) {
    return new Promise(async (resolve, reject) => {
        sql = `(SELECT meta.*, s.seccionOrden, s.seccion, nt.normaTipoOrden, ns.normaSubtipoOrden, r.reparticionOrden,
            bo_reparticiones.siglaReparticion, bo_normas_tipos.normaTipoSigla, s.es_poder, bo_normas_subtipos.normaSubtipoSigla,
            bo_normas_subtipos.normaSubtipo, bo_normas_tipos.normaTipo, bo_reparticiones.reparticion, digi.normaDocumento
            FROM normas_metadatos meta
            LEFT OUTER JOIN normas_estados ON normas_estados.idNorma=meta.idNorma
            LEFT OUTER JOIN bo_sumario_secciones s ON s.idSeccion=meta.idSeccion
            LEFT OUTER JOIN bo_sumario_seccion_reparticiones r ON (r.idReparticion=meta.idReparticion AND r.idSeccion=s.idSeccion)
            LEFT OUTER JOIN bo_sumario_seccion_normas_tipos nt ON (nt.idNormaTipo=meta.idNormaTipo AND nt.idSeccion=s.idSeccion)
            LEFT OUTER JOIN bo_sumario_seccion_normas_tipos_subtipos ns ON (ns.idNormaSubtipo=meta.idNormaSubtipo AND ns.idSumarioNormasTipo=nt.idSumarioNormasTipo)
            LEFT OUTER JOIN bo_reparticiones ON meta.idReparticion=bo_reparticiones.idReparticion
            LEFT OUTER JOIN bo_normas_tipos ON meta.idNormaTipo=bo_normas_tipos.idNormaTipo
            LEFT OUTER JOIN bo_normas_subtipos ON meta.idNormaSubtipo=bo_normas_subtipos.idNormaSubtipo
            LEFT OUTER JOIN normas_digitalizaciones digi ON meta.idNorma=digi.idNorma
            WHERE (digi.estado=1 OR digi.estado IS NULL)
            AND meta.fechaPublicacion=?
            AND meta.estado=1
            AND normas_estados.estado=1
            /* idNormasEstadoTipo=7 es APROBADA_PARA_PUBLICACION y idNormasEstadoTipo=8 es BO_EN_REDACCION */
            AND (normas_estados.idNormasEstadoTipo=7 OR normas_estados.idNormasEstadoTipo=8)
            AND s.es_poder=0)
            UNION 
            (SELECT meta.*, s.seccionOrden, s.seccion, nt.normaTipoOrden, ns.normaSubtipoOrden, r.reparticionOrden,
            bo_reparticiones.siglaReparticion, bo_normas_tipos.normaTipoSigla, s.es_poder, bo_normas_subtipos.normaSubtipoSigla,
            bo_normas_subtipos.normaSubtipo, bo_normas_tipos.normaTipo, bo_reparticiones.reparticion, digi.normaDocumento
            FROM normas_metadatos meta
            LEFT OUTER JOIN normas_estados ON normas_estados.idNorma=meta.idNorma
            LEFT OUTER JOIN bo_sumario_secciones s ON s.idSeccion=meta.idSeccion
            LEFT OUTER JOIN bo_sumario_seccion_normas_tipos nt ON (nt.idNormaTipo=meta.idNormaTipo AND nt.idSeccion=s.idSeccion)
            LEFT OUTER JOIN bo_sumario_seccion_normas_tipos_subtipos ns ON (ns.idNormaSubtipo=meta.idNormaSubtipo AND ns.idSumarioNormasTipo=nt.idSumarioNormasTipo)
            LEFT OUTER JOIN bo_sumario_seccion_normas_tipos_reparticiones r ON (r.idReparticion=meta.idReparticion AND r.idSumarioNormasTipo=nt.idSumarioNormasTipo)
            LEFT OUTER JOIN bo_reparticiones ON meta.idReparticion=bo_reparticiones.idReparticion
            LEFT OUTER JOIN bo_normas_tipos ON meta.idNormaTipo=bo_normas_tipos.idNormaTipo
            LEFT OUTER JOIN bo_normas_subtipos ON meta.idNormaSubtipo=bo_normas_subtipos.idNormaSubtipo
            LEFT OUTER JOIN normas_digitalizaciones digi ON meta.idNorma=digi.idNorma
            WHERE (digi.estado=1 OR digi.estado IS NULL)
            AND s.es_poder=1
            AND meta.fechaPublicacion=?
            AND normas_estados.estado=1
            /* idNormasEstadoTipo=7 es APROBADA_PARA_PUBLICACION y idNormasEstadoTipo=8 es BO_EN_REDACCION */
            AND (normas_estados.idNormasEstadoTipo=7 OR normas_estados.idNormasEstadoTipo=8)
            AND meta.estado=1)
            ORDER BY seccionOrden,
                (CASE WHEN es_poder=0 THEN reparticionOrden END),
                normaTipoOrden,
                normaSubtipoOrden, 
                (CASE WHEN es_poder=1 THEN reparticionOrden END),
                organismoEmisor, 
                normaAnio, 
                normaNumero`;
        params = [request, request]

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

function traerNormasPorFechaLimite(request) {
    return new Promise(async (resolve, reject) => {
        sql = `
        SELECT
            a.idNorma,
            d.normasEstadoTipo,
            c.fechaPublicacion,
            c.organismoEmisor,
            c.fechaSugerida,
            c.fechaLimite,
            c.normaAcronimoReferencia,
            c.checkPreRevisado,
            e.normaTipo,
            e.normaTipoSigla,
            c.idSeccion,
            b.idNormasEstadoTipo,
            f.siglaReparticion,
            f.reparticion,
            c.normaNumero,
            c.normaAnio,
            c.fechaDesde,
            c.fechaHasta,
            c.normaRevisada
        FROM
        normas a
        LEFT OUTER JOIN normas_estados b
            ON a.idNorma = b.idNorma
        LEFT OUTER JOIN normas_metadatos c
            ON a.idNorma = c.idNorma
        LEFT OUTER JOIN normas_estados_tipos d
            ON b.idNormasEstadoTipo = d.idNormasEstadoTipo
        LEFT OUTER JOIN bo_normas_tipos e
            ON c.idNormaTipo = e.idNormaTipo
        LEFT OUTER JOIN bo_reparticiones f
            ON c.idReparticion = f.idReparticion
        WHERE c.fechaLimite = ?
        AND c.estado = 1
        AND b.estado = 1
        AND b.idNormasEstadoTipo != 0
        `; //Se omiten las que tienen estado ELIMINADA
        params = [request.fechaLimite, request.idNormasEstadoTipo]

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
function traerNormasBoletinDesdeHasta(request) {
    return new Promise(async (resolve, reject) => {
        console.log(request.fechaPublicacionDelBoletin)
        if (!request.fechaPublicacionDelBoletin) { reject() }
        sql = `
        SELECT
            a.idNorma,
            d.normasEstadoTipo,
            c.fechaPublicacion,
            c.organismoEmisor,
            c.fechaHasta,
            c.fechaDesde,
            c.normaAcronimoReferencia,
            c.checkPreRevisado,
            e.normaTipo,
            e.normaTipoSigla,
            c.idSeccion,
            b.idNormasEstadoTipo,
            f.siglaReparticion, 
            f.reparticion, 
            c.normaNumero,
            c.normaAnio,
            c.numeroReparto,
            c.procedimiento,
            c.numeroEdicionSubtipo,
            c.idTipoProceso,
            c.normaRevisada
        FROM
        normas a
        LEFT OUTER JOIN normas_estados b
            ON a.idNorma = b.idNorma
        LEFT OUTER JOIN normas_metadatos c
            ON a.idNorma = c.idNorma
        LEFT OUTER JOIN normas_estados_tipos d
            ON b.idNormasEstadoTipo = d.idNormasEstadoTipo
        LEFT OUTER JOIN bo_normas_tipos e
            ON c.idNormaTipo = e.idNormaTipo
        LEFT OUTER JOIN bo_reparticiones f
            ON c.idReparticion = f.idReparticion
        WHERE DATE(?) BETWEEN c.fechaDesde AND c.fechaHasta
        AND c.estado = 1
        AND b.estado = 1
        `;
        params = [request.fechaPublicacionDelBoletin]

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

function traerBoletinesEnEdicion(request) {
    return new Promise(async (resolve, reject) => {
        let sql = `
        SELECT a.idBoletin, a.fechaPublicacion, b.idBoletinEstadoTipo, c.boletinEstadoTipo AS estado, d.boletinNumero AS numero, p.mig_fileserver_id
        FROM bo_boletines a
        left outer join bo_boletines_publicados p on a.idBoletin = p.idBoletin, bo_boletines_estados b, bo_boletines_estados_tipos c, bo_boletines_metadatos d
        WHERE 
        a.idBoletin = b.idBoletin
        AND	d.idBoletin = a.idBoletin
        AND b.idBoletinEstadoTipo = c.idBoletinEstadoTipo
        AND a.estado = 1
        AND b.estado = 1
        AND	d.estado = 1
        AND b.idBoletinEstadoTipo IN (1,2,3)
        ORDER BY a.fechaPublicacion DESC
        `;
        let conn = await connection.poolPromise.getConnection()
            .catch(error => { throw error });
        let res = {};
        try {
            //Saca el total de normas contemplando los filtros de búsqueda
            res.totalBoletines = await conn.query('SELECT COUNT(a.idBoletin) FROM' + sql.split('FROM')[1])
                .catch(error => { throw error });
            res.boletines = await conn.query(paginarQuery(request, sql))
                .catch(error => { throw error });

            await conn.commit();
        }
        catch (e) {
            await conn.rollback();
            reject(e)
        }
        finally {
            conn.release();
        }
        resolve(res);
    });
}

function traerBoletinPorId(request) {
    return new Promise(async (resolve, reject) => {
        sql = `
        SELECT a.idBoletin, a.fechaPublicacion, 
        b.idBoletinEstadoTipo, d.boletinEstadoTipo, c.boletinSecciones, c.boletinNombre, 
        c.boletinNumero, c.boletinDocumento, c.boletinFirmado
        FROM bo_boletines a 
        LEFT OUTER JOIN bo_boletines_estados b ON a.idBoletin = b.idBoletin
        LEFT OUTER JOIN bo_boletines_metadatos c ON a.idBoletin = c.idBoletin
        LEFT OUTER JOIN bo_boletines_estados_tipos d ON b.idBoletinEstadoTipo = d.idBoletinEstadoTipo
        WHERE a.estado = 1
        AND b.estado = 1
        AND c.estado = 1
        AND a.idBoletin = ?;
        `;

        let conn = await connection.poolPromise.getConnection()
            .catch(error => { throw error });
        let res = {}
        try {

            const boletin = await conn.query(sql, [request.idBoletin])
                .catch(error => { throw error })
            res = boletin[0]

            const normas = await conn.query(`SELECT idNorma FROM bo_boletines_normas WHERE idBoletin=?`, [request.idBoletin])
                .catch(error => { throw error });

            res.normas = normas.length > 0 ? normas.map(n => n.idNorma) : [];

            res.anexos = await conn.query(`SELECT * FROM bo_boletines_anexos WHERE idBoletin=?`, [request.idBoletin])

            await conn.commit();
        }
        catch (e) {
            await conn.rollback();
            reject(e)
        }
        finally {
            conn.release();
        }
        resolve(res);
    });
}

function traerNormasPorFechaPublicacionSeccion(request) {
    return new Promise(async (resolve, reject) => {
        sql = `
        SELECT
            a.idNorma,
            d.normasEstadoTipo,
            c.fechaPublicacion,
            c.fechaSugerida,
            c.fechaLimite,
            c.normaAcronimoReferencia,
            e.normaTipo,
            e.normaTipoSigla,
            c.idSeccion,
            b.idNormasEstadoTipo,
            f.siglaReparticion, fa.siglaReparticion AS siglaOrganismo,
            f.reparticion, fa.reparticion AS organismo,
            c.normaNumero,
            c.normaAnio
        FROM
        normas a
        LEFT OUTER JOIN normas_estados b
            ON a.idNorma = b.idNorma
        LEFT OUTER JOIN normas_metadatos c
            ON a.idNorma = c.idNorma
        LEFT OUTER JOIN normas_estados_tipos d
            ON b.idNormasEstadoTipo = d.idNormasEstadoTipo
        LEFT OUTER JOIN bo_normas_tipos e
            ON c.idNormaTipo = e.idNormaTipo
        LEFT OUTER JOIN bo_reparticiones f
            ON c.idReparticion = f.idReparticion
        LEFT OUTER JOIN bo_reparticiones fa
            ON c.idReparticionOrganismo = fa.idReparticion
        WHERE c.fechaPublicacion = ?
        AND c.idSeccion = ?
        AND c.estado = 1
        AND b.estado = 1
        `;
        params = [request.fechaPublicacion, request.seccion]

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

async function editarBoletin(request) {

    let params = [request.usuario, request.idBoletin]

    let conn = await connection.poolPromise.getConnection();

    try {

        await conn.beginTransaction();

        await conn.query(`UPDATE bo_boletines_metadatos SET boletinSecciones=? WHERE idBoletin=? AND estado=1;`,
            [request.boletinSecciones,
            request.idBoletin]
        ).catch(err => { throw err });

        await guardarLog(conn, `UPDATE bo_boletines_metadatos SET boletinSecciones=? WHERE idBoletin=? AND estado=1;`,
            [request.boletinSecciones, request.idBoletin], request).catch(err => { throw err });

        for (const norma of request.normasParaAsignar) {
            await conn.query(`INSERT INTO bo_boletines_normas (idBoletin, idNorma) VALUES (?,?)`, [request.idBoletin, norma])

            await guardarLog(conn, `INSERT INTO bo_boletines_normas (idBoletin, idNorma) VALUES (?,?)`, [request.idBoletin, norma], request)
        }
        //Cambia estado a EN_REDACCION a las no asignadas
        for (const norma of request.normasNoAsignadas) {
            let consultaAux = await conn.query('SELECT idNorma FROM normas WHERE idNorma=?', [norma])
            if (consultaAux.length > 0) {
                let sqlBorrarEstadoNorma = `UPDATE normas_estados 
            SET estado=4, fechaBorrado=CURRENT_TIMESTAMP, usuarioBorrado=? 
            WHERE idNorma=? AND estado=1;`;
                let sqlCrearEstado = `INSERT INTO normas_estados (idNorma, idNormasEstadoTipo, usuarioCarga) 
            VALUES (?,?,?)`;

                await conn.query(sqlBorrarEstadoNorma, [request.usuario, norma])
                    .catch(err => { throw err });

                await conn.query(sqlCrearEstado, [norma, 1, request.usuario])
                    .catch(err => { throw err });

                await conn.query('DELETE FROM bo_boletines_normas WHERE idNorma=?', [norma])
                    .catch(err => { throw err });

                await guardarLog(conn, sqlBorrarEstadoNorma, [request.usuario, norma], request).catch(err => { throw err });
                await guardarLog(conn, sqlCrearEstado, [norma, 1, request.usuario], request).catch(err => { throw err });
                await guardarLog(conn, 'DELETE FROM bo_boletines_normas WHERE idNorma=?', [norma], request).catch(err => { throw err });
            }
        }

        //Cambia estado a BO_EN_REDACCION a las asignadas
        for (const norma of request.normas) {
            let sqlBorrarEstadoNorma = `UPDATE normas_estados 
            SET estado=4, fechaBorrado=CURRENT_TIMESTAMP, usuarioBorrado=? 
            WHERE idNorma=? AND estado=1;`;
            let sqlCrearEstado = `INSERT INTO normas_estados (idNorma, idNormasEstadoTipo, usuarioCarga) 
            VALUES (?,?,?)`;

            await conn.query(sqlBorrarEstadoNorma, [request.usuario, norma])
                .catch(err => { throw err });

            await conn.query(sqlCrearEstado, [norma, 8, request.usuario])
                .catch(err => { throw err });

            await guardarLog(conn, sqlBorrarEstadoNorma, [request.usuario, norma], request).catch(err => { throw err });
            await guardarLog(conn, sqlCrearEstado, [norma, 8, request.usuario], request).catch(err => { throw err });
        }
        await conn.commit();

    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        // Close Connection
        if (conn) conn.close();
    }
}

async function cambiarEstadoBoletin(request) {

    let params = [request.idBoletin, request.idBoletinEstadoTipo, request.usuario]

    let conn = await connection.poolPromise.getConnection();

    try {

        await conn.beginTransaction();

        await conn.query(borrarEstadoBoletinSql, [request.usuario, request.idBoletin])
            .catch(err => { throw err });

        await conn.query(crearEstadoBoletinSql, params)
            .catch(err => { throw err });

        await guardarLog(conn, borrarEstadoBoletinSql, [request.usuario, request.idBoletin], request).catch(err => { throw err });
        await guardarLog(conn, crearEstadoBoletinSql, params, request).catch(err => { throw err });

        await conn.commit();

    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        // Close Connection
        if (conn) conn.close();
    }
}

async function traerUltimoBoletinPublicado() {
    return new Promise(async (resolve, reject) => {
        sql = `
        SELECT MAX(a.numeroBoletin) AS boletinNumero, b.idBoletinEstadoTipo FROM bo_boletines_publicados a 
        LEFT OUTER JOIN bo_boletines_estados b ON a.idBoletin = b.idBoletin 
        WHERE a.estado=1 AND b.estado=1;
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

async function descargarBoletin(request) {

    let crearMetadatosBoletin = `
        INSERT INTO bo_boletines_metadatos (
            idBoletin,
            boletinSecciones,
            boletinNombre,
            boletinNumero,
            boletinDocumento,
            usuarioCreacion
            ) VALUES (?,?,?,?,?,?)
    `

    let borrarEstadoNorma = `
        UPDATE normas_estados 
        SET estado=4, fechaBorrado=CURRENT_TIMESTAMP, usuarioBorrado=? 
        WHERE idNorma=? AND estado=1;
    `

    let crearEstadoNorma = `
        INSERT INTO normas_estados (idNorma, idNormasEstadoTipo, usuarioCarga) VALUES (?,?,?)
    `

    let conn = await connection.poolPromise.getConnection();

    try {

        await conn.beginTransaction();

        await conn.query(borrarEstadoBoletinSql, [request.usuario, request.idBoletin])
            .catch(err => { throw err });

        await conn.query(borrarMetadatoBoletinSql, [request.usuario, request.idBoletin])
            .catch(err => { throw err });

        await conn.query(crearEstadoBoletinSql, [request.idBoletin, 2, request.usuario])
            .catch(err => { throw err });

        await conn.query(crearMetadatosBoletin, [
            request.idBoletin,
            request.boletinSecciones,
            null,
            request.boletinNumero,
            request.boletinDocumento,
            request.usuario])
            .catch(err => { throw err });

        const normasDelBoletin = request.normas;
        const normas = await conn.query(`SELECT idNorma FROM normas_estados WHERE estado=1 AND idNormasEstadoTipo=8 AND 
            idNorma IN (?)`, [normasDelBoletin])
            .catch(e => { throw e })
        for (const norma of normas) {
            await conn.query(borrarEstadoNorma, [
                request.usuario,
                norma.idNorma
            ])
            await conn.query(crearEstadoNorma, [
                norma.idNorma,
                9,
                request.usuario
            ])
            await guardarLog(conn, borrarEstadoNorma, [request.usuario, norma.idNorma], request).catch(err => { throw err });
            await guardarLog(conn, crearEstadoNorma, [norma.idNorma, 9, request.usuario], request).catch(err => { throw err });
        }

        await guardarLog(conn, borrarEstadoBoletinSql, [request.usuario, request.idBoletin], request)
            .catch(err => { throw err });

        await guardarLog(conn, borrarMetadatoBoletinSql, [request.usuario, request.idBoletin], request)
            .catch(err => { throw err });

        await guardarLog(conn, crearEstadoBoletinSql, [request.idBoletin, 2, request.usuario], request)
            .catch(err => { throw err });

        await guardarLog(conn, crearMetadatosBoletin, [
            request.idBoletin,
            request.boletinSecciones,
            null,
            request.boletinNumero,
            request.boletinDocumento,
            request.usuario], request)
            .catch(err => { throw err });

        await conn.commit();

    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        // Close Connection
        if (conn) conn.close();
    }
}

async function traerHTMLDeUnBoletin(request) {
    return new Promise(async (resolve, reject) => {
        let sql = "";
        let params = []
        sql = `
        SELECT a.idBoletin, a.fechaPublicacion, c.boletinNumero, c.boletinDocumento
        FROM
            bo_boletines a,
            bo_boletines_estados b,
            bo_boletines_metadatos c
            
        WHERE
            a.idBoletin = b.idBoletin
            AND a.idBoletin = c.idBoletin
            AND a.estado = 1
            AND b.estado = 1
            AND c.estado = 1
            
            AND b.idBoletinEstadoTipo = 2
            AND a.idBoletin = ?;
        `;
        params = [request.idBoletin];

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

async function publicarBoletin(request) {
    let borrarEstadoNorma = `
        UPDATE normas_estados 
        SET estado=4, fechaBorrado=CURRENT_TIMESTAMP, usuarioBorrado=? 
        WHERE idNorma=? AND estado=1;
    `
    let crearEstadoNorma = `
        INSERT INTO normas_estados (idNorma, idNormasEstadoTipo, usuarioCarga) VALUES (?,?,?)
    `
    let conn = await connection.poolPromise.getConnection();

    try {

        await conn.beginTransaction();

        await conn.query(borrarEstadoBoletinSql, [request.usuario, request.idBoletin])
            .catch(err => { throw err });

        await conn.query(crearEstadoBoletinSql, [request.idBoletin, 4, request.usuario])
            .catch(err => { throw err });

        const normas = await conn.query(`SELECT idNorma FROM normas_estados WHERE estado=1 AND idNormasEstadoTipo=10 AND 
        idNorma IN (?)`, [request.normas])
            .catch(e => { throw e })

        for (const norma of normas) {

            await conn.query(borrarEstadoNorma, [request.usuario, norma.idNorma])
                .catch(err => { throw err });

            await conn.query(crearEstadoNorma, [norma.idNorma, 11, request.usuario])
                .catch(err => { throw err });

            await guardarLog(conn, borrarEstadoNorma, [request.usuario, norma.idNorma], request).catch(err => { throw err });
            await guardarLog(conn, crearEstadoNorma, [norma.idNorma, 11, request.usuario], request).catch(err => { throw err });

        }

        await guardarLog(conn, borrarEstadoBoletinSql, [request.usuario, request.idBoletin], request).catch(err => { throw err });
        await guardarLog(conn, crearEstadoBoletinSql, [request.idBoletin, 4, request.usuario], request).catch(err => { throw err });

        await conn.commit();

    } catch (err) {
        console.log(err)
        await conn.rollback();
        throw err;
    } finally {
        // Close Connection
        if (conn) conn.close();
    }
}

async function anularDescargaBoletin(request) {

    let borrarEstadoNormas = `
        UPDATE normas_estados 
        SET estado=4, fechaBorrado=CURRENT_TIMESTAMP, usuarioBorrado=? 
        WHERE idNorma IN (?) AND estado=1;
    `
    let crearEstadoNormas = `
        INSERT INTO normas_estados (idNorma, idNormasEstadoTipo, usuarioCarga) VALUES (?,?,?)
    `

    let conn = await connection.poolPromise.getConnection();

    try {

        await conn.beginTransaction();

        await conn.query(borrarEstadoBoletinSql, [request.usuario, request.idBoletin])
            .catch(err => { throw err });

        await conn.query(borrarMetadatoBoletinSql, [request.usuario, request.idBoletin])
            .catch(err => { throw err });

        await conn.query(crearEstadoBoletinSql, [request.idBoletin, 1, request.usuario])
            .catch(err => { throw err });

        await conn.query(crearMetadatosBoletinSql, [
            request.idBoletin,
            request.boletinSecciones,
            null,
            null,
            request.usuario])
            .catch(err => { throw err });

        await conn.query(borrarEstadoNormas, [
            request.usuario,
            request.normas
        ])

        let arrayInsert = request.normas.map(n => ([n, 8, request.usuario]));
        await conn.batch(crearEstadoNormas, arrayInsert)

        await conn.commit();

    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        // Close Connection
        if (conn) conn.close();
    }
}

async function firmarBoletin(request) {

    let crearMetadatosBoletin = `INSERT INTO bo_boletines_metadatos (
        idBoletin, 
        boletinSecciones,
        boletinNombre,
        boletinNumero,
        boletinDocumento,
        boletinFirmado,
        usuarioCreacion
        ) VALUES (?,?,?,?,?,?,?)`

    let borrarEstadoNorma = `
        UPDATE normas_estados 
        SET estado=4, fechaBorrado=CURRENT_TIMESTAMP, usuarioBorrado=? 
        WHERE idNorma IN (?) AND estado=1;
    `
    let crearEstadoNorma = `
        INSERT INTO normas_estados (idNorma, idNormasEstadoTipo, usuarioCarga) VALUES (?,?,?)
    `

    let insertBoletinesPublicados = `
        INSERT INTO bo_boletines_publicados
        (
            idBoletin, 
            numeroBoletin,
            fechaPublicacion,
            archivoBoletin,
            usuarioCreacion
        ) VALUES (?,?,?,?,?)
    `
    let insertAnexos = `
        INSERT INTO bo_boletines_anexos (nombre, archivo, archivoS3, principal, idBoletin) VALUES (?,?,?,?,?)
    `

    let params = [
        request.idBoletin,
        request.boletinNumero,
        request.fechaPublicacion,
        request.boletinFirmado,
        request.usuario
    ]

    let conn = await connection.poolPromise.getConnection();

    try {

        await conn.beginTransaction();

        await conn.query(borrarEstadoBoletinSql, [request.usuario, request.idBoletin])
            .catch(err => { throw err });

        await conn.query(borrarMetadatoBoletinSql, [request.usuario, request.idBoletin])
            .catch(err => { throw err });

        await conn.query(crearEstadoBoletinSql, [request.idBoletin, request.idBoletinEstadoTipo, request.usuario])
            .catch(err => { throw err });

        await conn.query(crearMetadatosBoletin, [
            request.idBoletin,
            request.boletinSecciones,
            request.boletinNombre,
            request.boletinNumero,
            request.boletinDocumento,
            request.boletinFirmado,
            request.usuario])
            .catch(err => { throw err });

        await conn.query(insertBoletinesPublicados, params)
            .catch(err => { throw err });

        for (const anexo of request.anexos) {
            await conn.query(insertAnexos, [anexo.nombre, anexo.archivo, anexo.archivoS3, anexo.principal, request.idBoletin])
                .catch(err => { throw err });
        }

        await conn.query(borrarEstadoNorma, [request.usuario, request.normas.filter(n => n.idNormasEstadoTipo === 9).map(n => n.idNorma)])
            .catch(err => { throw err });

        await guardarLog(conn, borrarEstadoNorma, [request.usuario, request.normas.filter(n => n.idNormasEstadoTipo === 9).map(n => n.idNorma)], request).catch(err => { throw err });

        await conn.batch("UPDATE bo_boletines_normas SET archivoPublicado=? WHERE idBoletin=? AND idNorma=?",
            request.normas.map(n => ([n.pdfNormaS3, request.idBoletin, n.idNorma])))

        if (request.normas.map(n => ([...n.anexos]))?.flat()?.length > 0) {
            await conn.batch("UPDATE normas_anexos SET archivoPublico=? WHERE idNormasAnexo=?",
                request.normas.map(n => ([...n.anexos])).flat().map(n => ([n.archivoPublico, n.idNormasAnexo])))
        }

        for (const norma of request.normas.filter(n => n.idNormasEstadoTipo === 9)) {

            await conn.query(crearEstadoNorma, [norma.idNorma, 10, request.usuario])
                .catch(err => { throw err });

            await guardarLog(conn, crearEstadoNorma, [norma.idNorma, 10, request.usuario], request).catch(err => { throw err });

        }

        await guardarLog(conn, borrarEstadoBoletinSql, [request.usuario, request.idBoletin], request)
            .catch(err => { throw err });

        await guardarLog(conn, borrarMetadatoBoletinSql, [request.usuario, request.idBoletin], request)
            .catch(err => { throw err });

        await guardarLog(conn, crearEstadoBoletinSql, [request.idBoletin, request.idBoletinEstadoTipo, request.usuario], request)
            .catch(err => { throw err });

        await guardarLog(conn, crearMetadatosBoletin, [
            request.idBoletin,
            request.boletinSecciones,
            request.boletinNombre,
            request.boletinNumero,
            request.boletinDocumento,
            request.boletinFirmado,
            request.usuario], request)
            .catch(err => { throw err });

        await guardarLog(conn, insertBoletinesPublicados, params, request)
            .catch(err => { throw err });

        await conn.commit();

    } catch (err) {
        console.log(err)
        await conn.rollback();
        throw err;
    } finally {
        // Close Connection
        if (conn) conn.close();
    }
}

async function traerDocumentosPublicados(request) {
    let response = [];
    let conn = await connection.poolPromise.getConnection();

    try {

        await conn.beginTransaction();

        const boletin = await conn.query(`SELECT archivoBoletin, numeroBoletin
        FROM bo_boletines_publicados 
        WHERE idBoletin=? AND estado=1`, [request.idBoletin])

        response.push({ idBoletin: request.idBoletin, nombre: `Boletin Oficial N°${boletin[0].numeroBoletin}`, archivoBoletin: boletin[0].archivoBoletin });

        const anexos = await conn.query('SELECT * FROM bo_boletines_anexos WHERE idBoletin=?', [request.idBoletin]);
        response = response.concat(anexos.map(n => ({
            idBoletin: request.idBoletin,
            nombre: n.principal ? `Separata del Boletin N°${boletin[0].numeroBoletin}` : n.nombre,
            archivoAnexo: n.archivoS3
        })))

        const normas = await conn.query(`SELECT a.idNorma, CONCAT(?,a.normaAcronimoReferencia) AS nombre, b.archivoPublicado AS archivoNorma
            FROM normas_metadatos a, bo_boletines_normas b WHERE a.idNorma IN (?) AND b.idNorma=a.idNorma AND b.idBoletin=? AND a.estado=1`,
            ['Norma: ', request.normas, request.idBoletin])
        
        response.push(...normas)

        await conn.commit();

    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        // Close Connection
        if (conn) conn.close();
    }
    return response;
}

async function anularFirma(request) {

    let borrarEstadoNorma = `
        UPDATE normas_estados 
        SET estado=4, fechaBorrado=CURRENT_TIMESTAMP, usuarioBorrado=? 
        WHERE idNorma=? AND estado=1;
    `

    let crearEstadoNorma = `
        INSERT INTO normas_estados (idNorma, idNormasEstadoTipo, usuarioCarga) VALUES (?,?,?)
    `

    let params = [request.idBoletin, request.idBoletinEstadoTipo, request.usuario]

    let conn = await connection.poolPromise.getConnection();

    try {

        await conn.beginTransaction();

        await conn.query(borrarEstadoBoletinSql, [request.usuario, request.idBoletin])
            .catch(err => { throw err });

        await conn.query(crearEstadoBoletinSql, params)

        await conn.query(`UPDATE bo_boletines_publicados SET fechaBorrado=CURRENT_TIMESTAMP, usuarioBorrado=?, estado=4
        WHERE idBoletin=? AND estado=1`, [request.usuario, request.idBoletin])
            .catch(err => { throw err });

        const boletinNormas = request.boletinNormas.normas;
        const normas = await conn.query(`SELECT idNorma FROM normas_estados WHERE estado=1 AND idNormasEstadoTipo=10 AND 
            idNorma IN (${boletinNormas.join(',')})`)
            .catch(e => { throw e })

        for (const norma of normas) {

            await conn.query(borrarEstadoNorma, [request.usuario, norma.idNorma])
                .catch(err => { throw err });

            await conn.query(crearEstadoNorma, [norma.idNorma, 9, request.usuario])
                .catch(err => { throw err });
        }

        await conn.commit();

    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        // Close Connection
        if (conn) conn.close();
    }
}

async function republicarBoletin(request) {

    let conn = await connection.poolPromise.getConnection();
    // console.log(request.documento)
    try {

        await conn.beginTransaction();

        await conn.query(borrarEstadoBoletinSql, [request.usuario, request.documento.idBoletin])
            .catch(err => { throw err });

        await conn.query(crearEstadoBoletinSql, [request.documento.idBoletin, 6, request.usuario])

        await conn.query(`UPDATE bo_boletines_publicados SET archivoBoletin=? WHERE idBoletin=? AND estado=1`,
            [request.archivoBoletin, request.documento.idBoletin])
            .catch(err => { throw err });

        await guardarLog(conn, borrarEstadoBoletinSql, [request.usuario, request.documento.idBoletin], request).catch(err => { throw err });
        await guardarLog(conn, crearEstadoBoletinSql, [request.documento.idBoletin, 6, request.usuario], request).catch(err => { throw err });
        await guardarLog(conn, `UPDATE bo_boletines_publicados SET archivoBoletin=? WHERE idBoletin=? AND estado=1`,
            [request.archivoBoletin, request.documento.idBoletin], request).catch(err => { throw err });

        await conn.commit();

    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        // Close Connection
        if (conn) conn.close();
    }
}

async function republicarSeparata(request) {

    let conn = await connection.poolPromise.getConnection();

    try {

        await conn.beginTransaction();

        await conn.query(`UPDATE bo_boletines_anexos SET archivo=?, archivoS3=? WHERE idBoletin=? AND estado=1`,
            [request.nombreArchivo, request.archivoAnexo, request.documento.idBoletin])
            .catch(err => { throw err });

        await conn.commit();

    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        // Close Connection
        if (conn) conn.close();
    }
}

async function borrarBoletin(request) {

    let conn = await connection.poolPromise.getConnection();
    let sql = `DELETE FROM bo_boletines_normas WHERE idBoletin=?`;

    try {

        await conn.beginTransaction();

        await conn.query(borrarEstadoBoletinSql, [request.usuario, request.idBoletin])
            .catch(err => { throw err });

        await conn.query(crearEstadoBoletinSql, [request.idBoletin, 5, request.usuario]) //estado 5: BO_ELIMINADO
            .catch(err => { throw err });

        await guardarLog(conn, borrarEstadoBoletinSql, [request.usuario, request.idBoletin], request).catch(err => { throw err });
        await guardarLog(conn, crearEstadoBoletinSql, [request.idBoletin, 5, request.usuario], request).catch(err => { throw err });

        await conn.query(sql, [request.idBoletin])
            .catch(err => { throw err });

        await guardarLog(conn, sql, [request.idBoletin], request)

        await conn.commit();

    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        // Close Connection
        if (conn) conn.close();
    }
}


function traerBoletinesPublicados(request) {
    return new Promise(async (resolve, reject) => {
        let sql = `
        SELECT a.idBoletin, a.fechaPublicacion, b.idBoletinEstadoTipo, c.boletinEstadoTipo AS estado, d.boletinNumero AS numero, p.mig_fileserver_id,
        p.archivoBoletin as documento_publico
        FROM bo_boletines a
        left outer join bo_boletines_publicados p on a.idBoletin = p.idBoletin, bo_boletines_estados b, bo_boletines_estados_tipos c, bo_boletines_metadatos d
        WHERE 
        a.idBoletin = b.idBoletin
        AND	d.idBoletin = a.idBoletin
        AND b.idBoletinEstadoTipo = c.idBoletinEstadoTipo
        AND a.estado = 1
        AND b.estado = 1
        AND	d.estado = 1
        AND b.idBoletinEstadoTipo IN (4,5,6)
        ORDER BY a.fechaPublicacion DESC
        `;
        let conn = await connection.poolPromise.getConnection()
            .catch(error => { throw error });
        let res = {};
        try {
            //Saca el total de normas contemplando los filtros de búsqueda
            res.totalBoletines = await conn.query('SELECT COUNT(a.idBoletin) FROM' + sql.split('FROM')[1])
                .catch(error => { throw error });
            res.boletines = await conn.query(paginarQuery(request, sql))
                .catch(error => { throw error });

            await conn.commit();
        }
        catch (e) {
            await conn.rollback();
            reject(e)
        }
        finally {
            conn.release();
        }
        resolve(res);
    });
}


function traerBoletinPorFechaPublicacion(request) {
    return new Promise((resolve, reject) => {
        let sql = `SELECT * FROM bo_boletines WHERE fechaPublicacion=DATE(?) AND estado=1`;

        connection.pool.query(sql, [request.fechaPublicacion], function (error, results) {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
}

module.exports = {
    crearBoletin,
    existeBoletinPorFecha,
    traerNormasOrdenadasDeUnBoletin,
    traerNormasPorFechaLimite,
    traerBoletinesEnEdicion,
    crearEstadoBoletin,
    crearMetadatosBoletin,
    traerNormasPorFechaOrdenadasPorSumario,
    traerNormasPorFechaPublicacionOrdenadasPorSumario,
    traerBoletinPorId,
    traerNormasPorFechaPublicacionSeccion,
    editarBoletin,
    traerNormaParaPDF,
    cambiarEstadoBoletin,
    traerUltimoBoletinPublicado,
    descargarBoletin,
    traerHTMLDeUnBoletin,
    publicarBoletin,
    anularDescargaBoletin,
    firmarBoletin,
    traerDocumentosPublicados,
    anularFirma,
    republicarBoletin,
    republicarSeparata,
    traerNormasBoletinDesdeHasta,
    borrarBoletin,
    traerBoletinesPublicados,
    traerBoletinPorFechaPublicacion
};
