var connection = require("../../services/conexion-mariadb");
const { guardarLog } = require('../../helpers/logs')
const moment = require('moment')

async function traerPatologiasNormativas() {

    let conn = await connection.poolPromise.getConnection();
    let res;
    try {

        await conn.beginTransaction();

        res = await conn.query(`SELECT * FROM dj_patologias_normativas`)
            .catch(err => { throw err });

        await conn.commit();

    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        // Close Connection
        if (conn) conn.close();
    }
    return res
}

async function guardarAnalisisEpistemologico(request) {

    let conn = await connection.poolPromise.getConnection();
    let sqlInsert = `INSERT INTO dj_analisis_epistemologico 
                (idNormaSDIN, formulario1, formulario2, formulario3,formulario4,formulario5,formulario6,formulario7,
                    observaciones, usuarioCarga, idAnexoDJ) 
                VALUES (?,?,?,?,?,?,?,?,?,?,?)`;
    try {

        await conn.beginTransaction();

        const formActual = await conn.query("SELECT * FROM dj_analisis_epistemologico WHERE idNormaSDIN=?", [request.idNormaSDIN])
            .catch(err => { throw err });

        if (formActual.length === 0) {
            await conn.query(sqlInsert, [request.idNormaSDIN, request.formulario1, request.formulario2,
            request.formulario3, request.formulario4, request.formulario5, request.formulario6,
            request.formulario7, request.observaciones, request.usuarioCarga, request.idAnexoDJ])
                .catch(err => { throw err });
        }
        else {
            let sqlUpdate = `UPDATE dj_analisis_epistemologico SET formulario1=?, formulario2=?, formulario3=?, 
                formulario4=?, formulario5=?, formulario6=?, formulario7=?, 
                observaciones=?, usuarioActualizacion=?, idAnexoDJ=? WHERE idNormaSDIN=?`;
            await conn.query(sqlUpdate, [request.formulario1, request.formulario2,
            request.formulario3, request.formulario4, request.formulario5, request.formulario6,
            request.formulario7, request.observaciones, request.usuarioCarga, request.idAnexoDJ, request.idNormaSDIN])
                .catch(err => { throw err });
        }
        await conn.query("UPDATE sdin_normas_metadatos SET aprobadoEpistemologicamente=? WHERE idNormaSDIN=?",
            [request.aprobadoEpistemologicamente, request.idNormaSDIN])
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

async function traerAnexosDJ() {

    let conn = await connection.poolPromise.getConnection();
    let res;

    try {

        await conn.beginTransaction();

        res = await conn.query(`SELECT * FROM dj_anexos`).catch(err => { throw err });

        await conn.commit();

    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        // Close Connection
        if (conn) conn.close();
    }
    return res
}

async function traerAnalisisEpistemologico(request) {

    let conn = await connection.poolPromise.getConnection();
    let res;
    try {

        await conn.beginTransaction();

        res = await conn.query(`SELECT * FROM dj_analisis_epistemologico WHERE idNormaSDIN=?`, [request.idNormaSDIN]).catch(err => { throw err });

        await conn.commit();

    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        // Close Connection
        if (conn) conn.close();
    }
    return res
}

async function traerCausales() {

    let conn = await connection.poolPromise.getConnection();
    let res;
    try {

        await conn.beginTransaction();

        res = await conn.query(`SELECT * FROM dj_causales`).catch(err => { throw err });

        await conn.commit();

    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        // Close Connection
        if (conn) conn.close();
    }
    return res
}


async function traerTiposAbrogacion() {

    let conn = await connection.poolPromise.getConnection();
    let res;
    try {

        await conn.beginTransaction();

        res = await conn.query(`SELECT * FROM dj_abrogacion_tipos`).catch(err => { throw err });

        await conn.commit();

    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        // Close Connection
        if (conn) conn.close();
    }
    return res
}

async function guardarArbolTematico(request) {

    let conn = await connection.poolPromise.getConnection();

    try {

        await conn.beginTransaction();

        const arbol_tematico = await conn.query(`SELECT * FROM dj_arbol_tematico`).catch(err => { throw err });
        if (arbol_tematico.length === 0) {
            await conn.query(`INSERT INTO dj_arbol_tematico (html) VALUES (?)`, [request.html]).catch(err => { throw err })
        }
        else {
            const date = moment().format('YYYY-MM-DD HH:mm:ss')
            await conn.query(`UPDATE dj_arbol_tematico SET html=?, fechaActualizacion=?`, [request.html, date]).catch(err => { throw err })
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

async function traerArbolTematico() {

    let conn = await connection.poolPromise.getConnection();
    let res;
    try {

        await conn.beginTransaction();

        res = await conn.query(`SELECT * FROM dj_arbol_tematico`).catch(err => { throw err });

        await conn.commit();

    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        // Close Connection
        if (conn) conn.close();
    }
    return res
}
async function traerFormulario1(request) {

    let conn = await connection.poolPromise.getConnection();
    let res;
    let sql = `SELECT a.*, c.idAbrogacionTipo AS idAbrogacionTipoPasiva, d.idAbrogacionTipo AS idAbrogacionTipoActiva
        FROM dj_valores_formularios a
        LEFT OUTER JOIN dj_analisis_epistemologico b ON a.idValoresFormulario = b.valoresFormulario1
        LEFT OUTER JOIN dj_secciones_formularios c ON a.idSeccionNormaPasiva = c.idSeccionFormulario
        LEFT OUTER JOIN dj_secciones_formularios d ON a.idSeccionNormaActiva = d.idSeccionFormulario
        WHERE b.idNormaSDIN=?`;
    let sqlDetalles = `SELECT * FROM dj_secciones_detalles WHERE idSeccionFormulario=?`;
    let params = [request.idNormaSDIN]
    try {

        await conn.beginTransaction();

        res = await conn.query(sql, params).catch(err => { throw err });
        if (res.length > 0) {
            res[0].detallesActiva = await conn.query(sqlDetalles, [res[0].idSeccionNormaActiva])
            res[0].detallesPasiva = await conn.query(sqlDetalles, [res[0].idSeccionNormaPasiva])
        }

        await conn.commit();

    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        // Close Connection
        if (conn) conn.close();
    }
    return res
}

async function guardarFormulario1(request) {

    let conn = await connection.poolPromise.getConnection();
    let res;
    let sql = ``;
    let params = []

    try {

        await conn.beginTransaction();

        formularioActual = await traerFormulario1(request);

        if (formularioActual.length > 0) {

            sql = `UPDATE dj_secciones_formularios SET idAbrogacionTipo=? WHERE idSeccionFormulario=?`;
            await conn.query(sql, [request.idAbrogacionTipoActiva, formularioActual[0].idSeccionNormaActiva])
            await conn.query(sql, [request.idAbrogacionTipoPasiva, formularioActual[0].idSeccionNormaPasiva])

            for (const detalle of request.detallesActiva) {
                //Si el detalle viene con el idDetalle es porque ya estaba ingresado en el formulario
                if (detalle.hasOwnProperty('idDetalle')) {
                    await conn.query(`UPDATE dj_secciones_detalles SET esAnexo=?, detalle=? WHERE idDetalle=?`,
                        [detalle.esAnexo, detalle.detalle, detalle.idDetalle])
                }
                else {
                    await conn.query('INSERT INTO dj_secciones_detalles (idSeccionFormulario, detalle, esAnexo) VALUES (?,?,?)',
                        [formularioActual[0].idSeccionNormaActiva, detalle.detalle, detalle.esAnexo])
                }
            }

            for (const detalle of request.detallesPasiva) {
                //Si el detalle viene con el idDetalle es porque ya estaba ingresado en el formulario
                if (detalle.hasOwnProperty('idDetalle')) {
                    await conn.query(`UPDATE dj_secciones_detalles SET esAnexo=?, detalle=? WHERE idDetalle=?`,
                        [detalle.esAnexo, detalle.detalle, detalle.idDetalle])
                }
                else {
                    await conn.query('INSERT INTO dj_secciones_detalles (idSeccionFormulario, detalle, esAnexo) VALUES (?,?,?)',
                        [formularioActual[0].idSeccionNormaPasiva, detalle.detalle, detalle.esAnexo])
                }
            }

            let detallesEliminadosActiva = formularioActual[0].detallesActiva.filter(
                detalle => !request.detallesActiva.some(n => n.idDetalle === detalle.idDetalle)
            );
            if (detallesEliminadosActiva.length > 0) {
                await conn.query("DELETE FROM dj_secciones_detalles WHERE idDetalle IN (?)", [detallesEliminadosActiva.map(n => n.idDetalle)])
            }

            let detallesEliminadosPasiva = formularioActual[0].detallesPasiva.filter(
                detalle => !request.detallesPasiva.some(n => n.idDetalle === detalle.idDetalle)
            );
            if (detallesEliminadosPasiva.length > 0) {
                await conn.query("DELETE FROM dj_secciones_detalles WHERE idDetalle IN (?)", [detallesEliminadosPasiva.map(n => n.idDetalle)])
            }

            sql = `UPDATE dj_valores_formularios SET idNormaActiva=?, 
            idPatologiaNormativa=?, 
            usuarioActualizacion=?,
            solucionAdoptada=?,
            fundamentacionJuridica=?, 
            observaciones=?,
            archivo=?,
            archivoS3=?,
            documentoConsolidado=?
            WHERE idValoresFormulario=?`;
            params = [request.idNormaActiva, request.idPatologiaNormativa,
            request.idUsuario, request.solucionAdoptada,
            request.fundamentacionJuridica, request.observaciones, request.archivo,
            request.archivoS3, request.documentoConsolidado, formularioActual[0].idValoresFormulario]
            await conn.query(sql, params).catch(err => { throw err });
        }
        else {
            //Secciones
            const idSeccionNormaActiva = await conn.query('INSERT INTO dj_secciones_formularios (idAbrogacionTipo) VALUES (?)',
                [request.idAbrogacionTipoActiva])
            const idSeccionNormaPasiva = await conn.query('INSERT INTO dj_secciones_formularios (idAbrogacionTipo) VALUES (?)',
                [request.idAbrogacionTipoPasiva])

            //El resto de los valores del formulario
            sql = `INSERT INTO dj_valores_formularios (
            idNormaActiva, 
            idSeccionNormaActiva, 
            idSeccionNormaPasiva, 
            idPatologiaNormativa, 
            solucionAdoptada,
            fundamentacionJuridica, 
            observaciones,
            usuarioCarga,
            archivo,
            archivoS3,
            documentoConsolidado) VALUES (?,?,?,?,?,?,?,?,?,?,?)`;
            params = [request.idNormaActiva, idSeccionNormaActiva.insertId,
            idSeccionNormaPasiva.insertId, request.idPatologiaNormativa,
            request.solucionAdoptada, request.fundamentacionJuridica,
            request.observaciones, request.idUsuario, request.archivo,
            request.archivoS3, request.documentoConsolidado]
            const formIngresado = await conn.query(sql, params).catch(err => { throw err });

            //Pongo el id del registro en la tabla de análisis epist.
            await conn.query("INSERT INTO dj_analisis_epistemologico (valoresFormulario1, idNormaSDIN) VALUES (?,?) ON DUPLICATE KEY UPDATE valoresFormulario1=values(valoresFormulario1)",
                [formIngresado.insertId, request.idNormaSDIN]).catch(err => { throw err });
            if (request.detallesActiva?.length > 0) {
                await conn.batch('INSERT INTO dj_secciones_detalles (idSeccionFormulario, detalle, esAnexo) VALUES (?,?,?)',
                    request.detallesActiva.map(n => [idSeccionNormaActiva.insertId, n.detalle, n.esAnexo]))
            }
            if (request.detallesPasiva?.length > 0) {
                await conn.batch('INSERT INTO dj_secciones_detalles (idSeccionFormulario, detalle, esAnexo) VALUES (?,?,?)',
                    request.detallesPasiva.map(n => [idSeccionNormaPasiva.insertId, n.detalle, n.esAnexo]))
            }
        }

        await conn.commit();

    } catch (err) {
        console.log(err)
        await conn.rollback();
        throw err;
    } finally {
        // Close Connection
        if (conn) conn.close();
    }
    return res
}

async function traerFormulario2(request) {

    let conn = await connection.poolPromise.getConnection();
    let res;
    let sql = `SELECT a.*, c.idAbrogacionTipo AS idAbrogacionTipoPasiva, d.idAbrogacionTipo AS idAbrogacionTipoActiva
        FROM dj_valores_formularios a
        LEFT OUTER JOIN dj_analisis_epistemologico b ON a.idValoresFormulario = b.valoresFormulario2
        LEFT OUTER JOIN dj_secciones_formularios c ON a.idSeccionNormaPasiva = c.idSeccionFormulario
        LEFT OUTER JOIN dj_secciones_formularios d ON a.idSeccionNormaActiva = d.idSeccionFormulario
        WHERE b.idNormaSDIN=?`;
    let sqlDetalles = `SELECT * FROM dj_secciones_detalles WHERE idSeccionFormulario=?`;
    let params = [request.idNormaSDIN]
    try {

        await conn.beginTransaction();

        res = await conn.query(sql, params).catch(err => { throw err });
        if (res.length > 0) {
            res[0].detallesActiva = await conn.query(sqlDetalles, [res[0].idSeccionNormaActiva])
            res[0].detallesPasiva = await conn.query(sqlDetalles, [res[0].idSeccionNormaPasiva])
        }

        await conn.commit();

    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        // Close Connection
        if (conn) conn.close();
    }
    return res
}

async function guardarFormulario2(request) {

    let conn = await connection.poolPromise.getConnection();
    let res;
    let sql = ``;
    let params = []

    try {

        await conn.beginTransaction();

        formularioActual = await traerFormulario2(request);

        if (formularioActual.length > 0) {

            sql = `UPDATE dj_secciones_formularios SET idAbrogacionTipo=? WHERE idSeccionFormulario=?`;
            await conn.query(sql, [request.idAbrogacionTipoActiva, formularioActual[0].idSeccionNormaActiva])
            await conn.query(sql, [request.idAbrogacionTipoPasiva, formularioActual[0].idSeccionNormaPasiva])

            for (const detalle of request.detallesActiva) {
                //Si el detalle viene con el idDetalle es porque ya estaba ingresado en el formulario
                if (detalle.hasOwnProperty('idDetalle')) {
                    await conn.query(`UPDATE dj_secciones_detalles SET esAnexo=?, detalle=? WHERE idDetalle=?`,
                        [detalle.esAnexo, detalle.detalle, detalle.idDetalle])
                }
                else {
                    await conn.query('INSERT INTO dj_secciones_detalles (idSeccionFormulario, detalle, esAnexo) VALUES (?,?,?)',
                        [formularioActual[0].idSeccionNormaActiva, detalle.detalle, detalle.esAnexo])
                }
            }

            for (const detalle of request.detallesPasiva) {
                //Si el detalle viene con el idDetalle es porque ya estaba ingresado en el formulario
                if (detalle.hasOwnProperty('idDetalle')) {
                    await conn.query(`UPDATE dj_secciones_detalles SET esAnexo=?, detalle=? WHERE idDetalle=?`,
                        [detalle.esAnexo, detalle.detalle, detalle.idDetalle])
                }
                else {
                    await conn.query('INSERT INTO dj_secciones_detalles (idSeccionFormulario, detalle, esAnexo) VALUES (?,?,?)',
                        [formularioActual[0].idSeccionNormaPasiva, detalle.detalle, detalle.esAnexo])
                }
            }

            let detallesEliminadosActiva = formularioActual[0].detallesActiva.filter(
                detalle => !request.detallesActiva.some(n => n.idDetalle === detalle.idDetalle)
            );
            if (detallesEliminadosActiva.length > 0) {
                await conn.query("DELETE FROM dj_secciones_detalles WHERE idDetalle IN (?)", [detallesEliminadosActiva.map(n => n.idDetalle)])
            }

            let detallesEliminadosPasiva = formularioActual[0].detallesPasiva.filter(
                detalle => !request.detallesPasiva.some(n => n.idDetalle === detalle.idDetalle)
            );
            if (detallesEliminadosPasiva.length > 0) {
                await conn.query("DELETE FROM dj_secciones_detalles WHERE idDetalle IN (?)", [detallesEliminadosPasiva.map(n => n.idDetalle)])
            }

            sql = `UPDATE dj_valores_formularios SET idNormaActiva=?, 
            idPatologiaNormativa=?, 
            usuarioActualizacion=?,
            solucionAdoptada=?,
            fundamentacionJuridica=?, 
            observaciones=?
            WHERE idValoresFormulario=?`;
            params = [request.idNormaActiva, request.idPatologiaNormativa,
            request.idUsuario, request.solucionAdoptada,
            request.fundamentacionJuridica, request.observaciones,
            formularioActual[0].idValoresFormulario]
            await conn.query(sql, params).catch(err => { throw err });
        }
        else {
            //Secciones
            const idSeccionNormaActiva = await conn.query('INSERT INTO dj_secciones_formularios (idAbrogacionTipo) VALUES (?)',
                [request.idAbrogacionTipoActiva])
            const idSeccionNormaPasiva = await conn.query('INSERT INTO dj_secciones_formularios (idAbrogacionTipo) VALUES (?)',
                [request.idAbrogacionTipoPasiva])

            //El resto de los valores del formulario
            sql = `INSERT INTO dj_valores_formularios (
            idNormaActiva, 
            idSeccionNormaActiva, 
            idSeccionNormaPasiva, 
            idPatologiaNormativa, 
            solucionAdoptada,
            fundamentacionJuridica, 
            observaciones,
            usuarioCarga) VALUES (?,?,?,?,?,?,?,?)`;
            params = [request.idNormaActiva, idSeccionNormaActiva.insertId,
            idSeccionNormaPasiva.insertId, request.idPatologiaNormativa,
            request.solucionAdoptada, request.fundamentacionJuridica,
            request.observaciones, request.idUsuario]
            const formIngresado = await conn.query(sql, params).catch(err => { throw err });

            //Pongo el id del registro en la tabla de análisis epist.
            await conn.query("INSERT INTO dj_analisis_epistemologico (valoresFormulario2, idNormaSDIN) VALUES (?,?) ON DUPLICATE KEY UPDATE valoresFormulario2=values(valoresFormulario2)",
                [formIngresado.insertId, request.idNormaSDIN]).catch(err => { throw err });
            if (request.detallesActiva?.length > 0) {
                await conn.batch('INSERT INTO dj_secciones_detalles (idSeccionFormulario, detalle, esAnexo) VALUES (?,?,?)',
                    request.detallesActiva.map(n => [idSeccionNormaActiva.insertId, n.detalle, n.esAnexo]))
            }
            if (request.detallesPasiva?.length > 0) {
                await conn.batch('INSERT INTO dj_secciones_detalles (idSeccionFormulario, detalle, esAnexo) VALUES (?,?,?)',
                    request.detallesPasiva.map(n => [idSeccionNormaPasiva.insertId, n.detalle, n.esAnexo]))
            }
        }

        await conn.commit();

    } catch (err) {
        console.log(err)
        await conn.rollback();
        throw err;
    } finally {
        // Close Connection
        if (conn) conn.close();
    }
    return res
}

async function traerFormulario3(request) {

    let conn = await connection.poolPromise.getConnection();
    let res;
    let sql = `SELECT a.*, c.idAbrogacionTipo AS idAbrogacionTipoPasiva, d.idAbrogacionTipo AS idAbrogacionTipoActiva
        FROM dj_valores_formularios a
        LEFT OUTER JOIN dj_analisis_epistemologico b ON a.idValoresFormulario = b.valoresFormulario3
        LEFT OUTER JOIN dj_secciones_formularios c ON a.idSeccionNormaPasiva = c.idSeccionFormulario
        LEFT OUTER JOIN dj_secciones_formularios d ON a.idSeccionNormaActiva = d.idSeccionFormulario
        WHERE b.idNormaSDIN=?`;
    let params = [request.idNormaSDIN]
    let sqlDetalles = `SELECT * FROM dj_secciones_detalles WHERE idSeccionFormulario=?`;
    try {

        await conn.beginTransaction();

        res = await conn.query(sql, params).catch(err => { throw err });
        if (res.length > 0) {
            res[0].detallesActiva = await conn.query(sqlDetalles, [res[0].idSeccionNormaActiva])
            res[0].detallesPasiva = await conn.query(sqlDetalles, [res[0].idSeccionNormaPasiva])
        }

        await conn.commit();

    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        // Close Connection
        if (conn) conn.close();
    }
    return res
}

async function guardarFormulario3(request) {

    let conn = await connection.poolPromise.getConnection();
    let sql = ``;
    let params = [];

    try {

        await conn.beginTransaction();

        formularioActual = await traerFormulario3(request)

        if (formularioActual.length > 0) {
            sql = `UPDATE dj_secciones_formularios SET idAbrogacionTipo=? WHERE idSeccionFormulario=?`;
            await conn.query(sql, [request.idAbrogacionTipoActiva, formularioActual[0].idSeccionNormaActiva])
            await conn.query(sql, [request.idAbrogacionTipoPasiva, formularioActual[0].idSeccionNormaPasiva])

            for (const detalle of request.detallesActiva) {
                //Si el detalle viene con el idDetalle es porque ya estaba ingresado en el formulario
                if (detalle.hasOwnProperty('idDetalle')) {
                    await conn.query(`UPDATE dj_secciones_detalles SET esAnexo=?, detalle=? WHERE idDetalle=?`,
                        [detalle.esAnexo, detalle.detalle, detalle.idDetalle])
                }
                else {
                    await conn.query('INSERT INTO dj_secciones_detalles (idSeccionFormulario, detalle, esAnexo) VALUES (?,?,?)',
                        [formularioActual[0].idSeccionNormaActiva, detalle.detalle, detalle.esAnexo])
                }
            }

            for (const detalle of request.detallesPasiva) {
                //Si el detalle viene con el idDetalle es porque ya estaba ingresado en el formulario
                if (detalle.hasOwnProperty('idDetalle')) {
                    await conn.query(`UPDATE dj_secciones_detalles SET esAnexo=?, detalle=? WHERE idDetalle=?`,
                        [detalle.esAnexo, detalle.detalle, detalle.idDetalle])
                }
                else {
                    await conn.query('INSERT INTO dj_secciones_detalles (idSeccionFormulario, detalle, esAnexo) VALUES (?,?,?)',
                        [formularioActual[0].idSeccionNormaPasiva, detalle.detalle, detalle.esAnexo])
                }
            }

            let detallesEliminadosActiva = formularioActual[0].detallesActiva.filter(
                detalle => !request.detallesActiva.some(n => n.idDetalle === detalle.idDetalle)
            );
            if (detallesEliminadosActiva.length > 0) {
                await conn.query("DELETE FROM dj_secciones_detalles WHERE idDetalle IN (?)", [detallesEliminadosActiva.map(n => n.idDetalle)])
            }

            let detallesEliminadosPasiva = formularioActual[0].detallesPasiva.filter(
                detalle => !request.detallesPasiva.some(n => n.idDetalle === detalle.idDetalle)
            );
            if (detallesEliminadosPasiva.length > 0) {
                await conn.query("DELETE FROM dj_secciones_detalles WHERE idDetalle IN (?)", [detallesEliminadosPasiva.map(n => n.idDetalle)])
            }

            sql = `UPDATE dj_valores_formularios SET idNormaActiva=?, 
                idCausal=?,
                usuarioActualizacion=?,
                fundamentacionJuridica=?, 
                observaciones=?,
                fechaInicioVigencia=?,
                fechaPerdidaVigencia=?
                WHERE idValoresFormulario=?`;

            params = [request.idNormaActiva, request.idCausal,
            request.idUsuario, request.fundamentacionJuridica, request.observaciones,
            request.fechaInicioVigencia, request.fechaPerdidaVigencia,
            formularioActual[0].idValoresFormulario]
            await conn.query(sql, params).catch(err => { throw err });
        }
        else {
            //Secciones
            const idSeccionNormaActiva = await conn.query('INSERT INTO dj_secciones_formularios (idAbrogacionTipo) VALUES (?)',
                [request.idAbrogacionTipoActiva])
            const idSeccionNormaPasiva = await conn.query('INSERT INTO dj_secciones_formularios (idAbrogacionTipo) VALUES (?)',
                [request.idAbrogacionTipoPasiva])

            //El resto de los valores del formulario
            sql = `INSERT INTO dj_valores_formularios (
            idNormaActiva,
            idCausal, 
            idSeccionNormaPasiva,
            idSeccionNormaActiva,
            fundamentacionJuridica, 
            observaciones,
            fechaInicioVigencia,
            fechaPerdidaVigencia,
            usuarioCarga) VALUES (?,?,?,?,?,?,?,?,?)`;
            params = [request.idNormaActiva, request.idCausal, idSeccionNormaPasiva.insertId,
            idSeccionNormaActiva.insertId, request.fundamentacionJuridica, request.observaciones,
            request.fechaInicioVigencia, request.fechaPerdidaVigencia, request.idUsuario]
            const formIngresado = await conn.query(sql, params).catch(err => { throw err });

            //Pongo el id del registro en la tabla de análisis epist.
            await conn.query("INSERT INTO dj_analisis_epistemologico (valoresFormulario3, idNormaSDIN) VALUES (?,?) ON DUPLICATE KEY UPDATE valoresFormulario3=values(valoresFormulario3)",
                [formIngresado.insertId, request.idNormaSDIN]).catch(err => { throw err });
            if (request.detallesActiva?.length > 0) {
                await conn.batch('INSERT INTO dj_secciones_detalles (idSeccionFormulario, detalle, esAnexo) VALUES (?,?,?)',
                    request.detallesActiva.map(n => [idSeccionNormaActiva.insertId, n.detalle, n.esAnexo]))
            }
            if (request.detallesPasiva?.length > 0) {
                await conn.batch('INSERT INTO dj_secciones_detalles (idSeccionFormulario, detalle, esAnexo) VALUES (?,?,?)',
                    request.detallesPasiva.map(n => [idSeccionNormaPasiva.insertId, n.detalle, n.esAnexo]))
            }

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

async function traerFormulario4(request) {

    let conn = await connection.poolPromise.getConnection();
    let res;
    let sql = `SELECT a.*, c.idAbrogacionTipo AS idAbrogacionTipoPasiva, d.idAbrogacionTipo AS idAbrogacionTipoActiva
        FROM dj_valores_formularios a
        LEFT OUTER JOIN dj_analisis_epistemologico b ON a.idValoresFormulario = b.valoresFormulario4
        LEFT OUTER JOIN dj_secciones_formularios c ON a.idSeccionNormaPasiva = c.idSeccionFormulario
        LEFT OUTER JOIN dj_secciones_formularios d ON a.idSeccionNormaActiva = d.idSeccionFormulario
        WHERE b.idNormaSDIN=?`;
    let sqlDetalles = `SELECT * FROM dj_secciones_detalles WHERE idSeccionFormulario=?`;
    let params = [request.idNormaSDIN]
    try {

        await conn.beginTransaction();

        res = await conn.query(sql, params).catch(err => { throw err });
        if (res.length > 0) {
            res[0].detallesActiva = await conn.query(sqlDetalles, [res[0].idSeccionNormaActiva])
            res[0].detallesPasiva = await conn.query(sqlDetalles, [res[0].idSeccionNormaPasiva])
        }

        await conn.commit();

    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        // Close Connection
        if (conn) conn.close();
    }
    return res
}

async function guardarFormulario4(request) {

    let conn = await connection.poolPromise.getConnection();
    let sql = ``;
    let params = []

    try {

        await conn.beginTransaction();

        formularioActual = await traerFormulario4(request);

        if (formularioActual.length > 0) {

            sql = `UPDATE dj_secciones_formularios SET idAbrogacionTipo=? WHERE idSeccionFormulario=?`;
            await conn.query(sql, [request.idAbrogacionTipoActiva, formularioActual[0].idSeccionNormaActiva])
            await conn.query(sql, [request.idAbrogacionTipoPasiva, formularioActual[0].idSeccionNormaPasiva])

            for (const detalle of request.detallesActiva) {
                //Si el detalle viene con el idDetalle es porque ya estaba ingresado en el formulario
                if (detalle.hasOwnProperty('idDetalle')) {
                    await conn.query(`UPDATE dj_secciones_detalles SET esAnexo=?, detalle=? WHERE idDetalle=?`,
                        [detalle.esAnexo, detalle.detalle, detalle.idDetalle])
                }
                else {
                    await conn.query('INSERT INTO dj_secciones_detalles (idSeccionFormulario, detalle, esAnexo) VALUES (?,?,?)',
                        [formularioActual[0].idSeccionNormaActiva, detalle.detalle, detalle.esAnexo])
                }
            }

            for (const detalle of request.detallesPasiva) {
                //Si el detalle viene con el idDetalle es porque ya estaba ingresado en el formulario
                if (detalle.hasOwnProperty('idDetalle')) {
                    await conn.query(`UPDATE dj_secciones_detalles SET esAnexo=?, detalle=? WHERE idDetalle=?`,
                        [detalle.esAnexo, detalle.detalle, detalle.idDetalle])
                }
                else {
                    await conn.query('INSERT INTO dj_secciones_detalles (idSeccionFormulario, detalle, esAnexo) VALUES (?,?,?)',
                        [formularioActual[0].idSeccionNormaPasiva, detalle.detalle, detalle.esAnexo])
                }
            }

            let detallesEliminadosActiva = formularioActual[0].detallesActiva.filter(
                detalle => !request.detallesActiva.some(n => n.idDetalle === detalle.idDetalle)
            );
            if (detallesEliminadosActiva.length > 0) {
                await conn.query("DELETE FROM dj_secciones_detalles WHERE idDetalle IN (?)", [detallesEliminadosActiva.map(n => n.idDetalle)])
            }

            let detallesEliminadosPasiva = formularioActual[0].detallesPasiva.filter(
                detalle => !request.detallesPasiva.some(n => n.idDetalle === detalle.idDetalle)
            );
            if (detallesEliminadosPasiva.length > 0) {
                await conn.query("DELETE FROM dj_secciones_detalles WHERE idDetalle IN (?)", [detallesEliminadosPasiva.map(n => n.idDetalle)])
            }

            sql = `UPDATE dj_valores_formularios SET idNormaActiva=?, 
            idCausal=?,
            usuarioActualizacion=?,
            fundamentacionJuridica=?, 
            observaciones=?,
            textoUnificado=?,
            archivo=?,
            archivoS3=?,
            documentoConsolidado=?,
            solucionAdoptada=?
            WHERE idValoresFormulario=?`;

            params = [request.idNormaActiva, request.idCausal,
            request.idUsuario, request.fundamentacionJuridica, request.observaciones,
            request.textoUnificado, request.archivo, request.archivoS3, request.documentoConsolidado,
            request.solucionAdoptada, formularioActual[0].idValoresFormulario]

            await conn.query(sql, params).catch(err => { throw err });
        }
        else {
            //Secciones
            const idSeccionNormaActiva = await conn.query('INSERT INTO dj_secciones_formularios (idAbrogacionTipo) VALUES (?)',
                [request.idAbrogacionTipoActiva])
            const idSeccionNormaPasiva = await conn.query('INSERT INTO dj_secciones_formularios (idAbrogacionTipo) VALUES (?)',
                [request.idAbrogacionTipoPasiva])

            //El resto de los valores del formulario
            sql = `INSERT INTO dj_valores_formularios (
            idNormaActiva, 
            idSeccionNormaPasiva, 
            idSeccionNormaActiva, 
            idCausal, 
            fundamentacionJuridica, 
            observaciones,
            textoUnificado,
            archivo,
            archivoS3,
            documentoConsolidado,
            usuarioCarga) VALUES (?,?,?,?,?,?,?,?,?,?,?)`;
            params = [request.idNormaActiva, idSeccionNormaPasiva.insertId, idSeccionNormaActiva.insertId, request.idCausal,
            request.fundamentacionJuridica, request.observaciones, request.textoUnificado, request.archivo,
            request.archivoS3, request.documentoConsolidado, request.idUsuario]

            const formIngresado = await conn.query(sql, params).catch(err => { throw err });

            //Pongo el id del registro en la tabla de análisis epist.
            await conn.query("INSERT INTO dj_analisis_epistemologico (valoresFormulario4, idNormaSDIN) VALUES (?,?) ON DUPLICATE KEY UPDATE valoresFormulario4=values(valoresFormulario4)",
                [formIngresado.insertId, request.idNormaSDIN]).catch(err => { throw err });

            if (request.detallesActiva?.length > 0) {
                await conn.batch('INSERT INTO dj_secciones_detalles (idSeccionFormulario, detalle, esAnexo) VALUES (?,?,?)',
                    request.detallesActiva.map(n => [idSeccionNormaActiva.insertId, n.detalle, n.esAnexo]))
            }
            if (request.detallesPasiva?.length > 0) {
                await conn.batch('INSERT INTO dj_secciones_detalles (idSeccionFormulario, detalle, esAnexo) VALUES (?,?,?)',
                    request.detallesPasiva.map(n => [idSeccionNormaPasiva.insertId, n.detalle, n.esAnexo]))
            }
        }

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

async function traerFormulario5(request) {

    let conn = await connection.poolPromise.getConnection();
    let res;
    let sql = `SELECT a.*, c.idAbrogacionTipo AS idAbrogacionTipoPasiva, d.idAbrogacionTipo AS idAbrogacionTipoActiva
        FROM dj_valores_formularios a
        LEFT OUTER JOIN dj_analisis_epistemologico b ON a.idValoresFormulario = b.valoresFormulario5
        LEFT OUTER JOIN dj_secciones_formularios c ON a.idSeccionNormaPasiva = c.idSeccionFormulario
        LEFT OUTER JOIN dj_secciones_formularios d ON a.idSeccionNormaActiva = d.idSeccionFormulario
        WHERE b.idNormaSDIN=?`;
    let params = [request.idNormaSDIN]
    let sqlDetalles = `SELECT * FROM dj_secciones_detalles WHERE idSeccionFormulario=?`;
    try {

        await conn.beginTransaction();

        res = await conn.query(sql, params).catch(err => { throw err });
        if (res.length > 0) {
            res[0].detallesActiva = await conn.query(sqlDetalles, [res[0].idSeccionNormaActiva])
            res[0].detallesPasiva = await conn.query(sqlDetalles, [res[0].idSeccionNormaPasiva])
        }

        await conn.commit();

    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        // Close Connection
        if (conn) conn.close();
    }
    return res
}

async function guardarFormulario5(request) {

    let conn = await connection.poolPromise.getConnection();
    let sql = `SELECT a.* FROM dj_valores_formularios a
        LEFT OUTER JOIN dj_analisis_epistemologico b ON a.idValoresFormulario = b.valoresFormulario5
        WHERE b.idNormaSDIN=?`;
    let params = [request.idNormaSDIN]

    try {

        await conn.beginTransaction();

        formularioActual = await traerFormulario5(request);

        if (formularioActual.length > 0) {
            sql = `UPDATE dj_secciones_formularios SET idAbrogacionTipo=? WHERE idSeccionFormulario=?`;
            await conn.query(sql, [request.idAbrogacionTipoActiva, formularioActual[0].idSeccionNormaActiva])
            await conn.query(sql, [request.idAbrogacionTipoPasiva, formularioActual[0].idSeccionNormaPasiva])

            for (const detalle of request.detallesActiva) {
                //Si el detalle viene con el idDetalle es porque ya estaba ingresado en el formulario
                if (detalle.hasOwnProperty('idDetalle')) {
                    await conn.query(`UPDATE dj_secciones_detalles SET esAnexo=?, detalle=? WHERE idDetalle=?`,
                        [detalle.esAnexo, detalle.detalle, detalle.idDetalle])
                }
                else {
                    await conn.query('INSERT INTO dj_secciones_detalles (idSeccionFormulario, detalle, esAnexo) VALUES (?,?,?)',
                        [formularioActual[0].idSeccionNormaActiva, detalle.detalle, detalle.esAnexo])
                }
            }

            for (const detalle of request.detallesPasiva) {
                //Si el detalle viene con el idDetalle es porque ya estaba ingresado en el formulario
                if (detalle.hasOwnProperty('idDetalle')) {
                    await conn.query(`UPDATE dj_secciones_detalles SET esAnexo=?, detalle=? WHERE idDetalle=?`,
                        [detalle.esAnexo, detalle.detalle, detalle.idDetalle])
                }
                else {
                    await conn.query('INSERT INTO dj_secciones_detalles (idSeccionFormulario, detalle, esAnexo) VALUES (?,?,?)',
                        [formularioActual[0].idSeccionNormaPasiva, detalle.detalle, detalle.esAnexo])
                }
            }

            let detallesEliminadosActiva = formularioActual[0].detallesActiva.filter(
                detalle => !request.detallesActiva.some(n => n.idDetalle === detalle.idDetalle)
            );
            if (detallesEliminadosActiva.length > 0) {
                await conn.query("DELETE FROM dj_secciones_detalles WHERE idDetalle IN (?)", [detallesEliminadosActiva.map(n => n.idDetalle)])
            }

            let detallesEliminadosPasiva = formularioActual[0].detallesPasiva.filter(
                detalle => !request.detallesPasiva.some(n => n.idDetalle === detalle.idDetalle)
            );
            if (detallesEliminadosPasiva.length > 0) {
                await conn.query("DELETE FROM dj_secciones_detalles WHERE idDetalle IN (?)", [detallesEliminadosPasiva.map(n => n.idDetalle)])
            }

            sql = `UPDATE dj_valores_formularios SET 
            idCausal=?,
            idNormaActiva=?,
            usuarioActualizacion=?,
            fundamentacionJuridica=?, 
            observaciones=?,
            archivo=?,
            archivoS3=?,
            documentoConsolidado=?
            WHERE idValoresFormulario=?`;
            params = [request.idCausal, request.idNormaActiva, request.idUsuario,
            request.fundamentacionJuridica, request.observaciones, request.archivo,
            request.archivoS3, request.documentoConsolidado, formularioActual[0].idValoresFormulario]
            await conn.query(sql, params)
        }
        else {
            //Secciones
            const idSeccionNormaActiva = await conn.query('INSERT INTO dj_secciones_formularios (idAbrogacionTipo) VALUES (?)',
                [request.idAbrogacionTipoActiva])
            const idSeccionNormaPasiva = await conn.query('INSERT INTO dj_secciones_formularios (idAbrogacionTipo) VALUES (?)',
                [request.idAbrogacionTipoPasiva])

            //El resto de los valores del formulario
            sql = `INSERT INTO dj_valores_formularios (
            idSeccionNormaPasiva, 
            idSeccionNormaActiva, 
            idNormaActiva,
            idCausal, 
            fundamentacionJuridica, 
            observaciones,
            archivo,
            archivoS3,
            documentoConsolidado,
            usuarioCarga) VALUES (?,?,?,?,?,?,?,?,?,?)`;
            params = [idSeccionNormaPasiva.insertId, idSeccionNormaActiva.insertId, request.idNormaActiva,
            request.idCausal, request.fundamentacionJuridica,
            request.observaciones, request.archivo, request.archivoS3,
            request.documentoConsolidado, request.idUsuario]
            const formIngresado = await conn.query(sql, params).catch(err => { throw err });

            //Pongo el id del registro en la tabla de análisis epist.
            await conn.query("INSERT INTO dj_analisis_epistemologico (valoresFormulario5, idNormaSDIN) VALUES (?,?) ON DUPLICATE KEY UPDATE valoresFormulario5=values(valoresFormulario5)",
                [formIngresado.insertId, request.idNormaSDIN]).catch(err => { throw err });

            if (request.detallesActiva?.length > 0) {
                await conn.batch('INSERT INTO dj_secciones_detalles (idSeccionFormulario, detalle, esAnexo) VALUES (?,?,?)',
                    request.detallesActiva.map(n => [idSeccionNormaActiva.insertId, n.detalle, n.esAnexo]))
            }
            if (request.detallesPasiva?.length > 0) {
                await conn.batch('INSERT INTO dj_secciones_detalles (idSeccionFormulario, detalle, esAnexo) VALUES (?,?,?)',
                    request.detallesPasiva.map(n => [idSeccionNormaPasiva.insertId, n.detalle, n.esAnexo]))
            }
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
async function traerFormulario6(request) {

    let conn = await connection.poolPromise.getConnection();
    let res;
    let sql = `SELECT a.* FROM dj_texto_definitivo a
        LEFT OUTER JOIN dj_analisis_epistemologico b ON a.idTextoDefinitivo = b.valoresFormulario6
        WHERE b.idNormaSDIN=?`;
    let params = [request.idNormaSDIN, request.idTextoDefinitivo]
    try {

        await conn.beginTransaction();

        res = await conn.query(sql, params).catch(err => { throw err });

        await conn.commit();

    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        // Close Connection
        if (conn) conn.close();
    }
    return res
}

async function guardarFormulario6(request) {

    let conn = await connection.poolPromise.getConnection();
    let sql = `SELECT a.* FROM dj_texto_definitivo a
        LEFT OUTER JOIN dj_analisis_epistemologico b ON a.idTextoDefinitivo = b.valoresFormulario6
        WHERE b.idNormaSDIN=?`;
    let params = [request.idNormaSDIN]

    try {

        await conn.beginTransaction();

        formularioActual = await conn.query(sql, params).catch(err => { throw err });

        if (formularioActual.length > 0) {
            sql = `UPDATE dj_texto_definitivo SET 
            fechaActualizacion=CURRENT_TIMESTAMP,
            usuarioActualizacion=?,
            textoDefinitivo=?, 
            textoDefinitivoAnexo=?, 
            observacionesGenerales=?,
            archivo=?,
            archivoS3=?,
            documentoConsolidado=?
            WHERE idTextoDefinitivo=?`;
            params = [request.idUsuario,
            request.textoDefinitivo, request.textoDefinitivoAnexo,
            request.observacionesGenerales, request.archivo, request.archivoS3, request.documentoConsolidado,
            formularioActual[0].idTextoDefinitivo]
            await conn.query(sql, params).catch(err => { throw err });
        }
        else {
            sql = `INSERT INTO dj_texto_definitivo (
            textoDefinitivo, 
            textoDefinitivoAnexo, 
            observacionesGenerales,
            archivo,
            archivoS3,
            documentoConsolidado,
            usuarioCarga,
            fechaCarga) VALUES (?,?,?,?,?,?,?,CURRENT_TIMESTAMP)`;
            params = [request.textoDefinitivo, request.textoDefinitivoAnexo,
            request.observacionesGenerales, request.archivo, request.archivoS3,
            request.documentoConsolidado, request.idUsuario]
            const formIngresado = await conn.query(sql, params).catch(err => { throw err });
            await conn.query("INSERT INTO dj_analisis_epistemologico (valoresFormulario6, idNormaSDIN) VALUES (?,?) ON DUPLICATE KEY UPDATE valoresFormulario6=values(valoresFormulario6)",
                [formIngresado.insertId, request.idNormaSDIN]).catch(err => { throw err });
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

async function traerFormulario7(request) {

    let conn = await connection.poolPromise.getConnection();
    let res;
    let sql = `SELECT a.* FROM dj_antecedentes_equivalencias a
            LEFT OUTER JOIN dj_analisis_epistemologico b ON a.idAntecedentesEquivalencias = b.valoresFormulario7
            WHERE b.idNormaSDIN=?`;
    let params = [request.idNormaSDIN]
    try {

        await conn.beginTransaction();

        res = await conn.query(sql, params).catch(err => { throw err });
        if (res.length > 0) {
            sql = `SELECT idLeyDigesto, archivo, archivoS3, documentoConsolidado
                FROM dj_antecedentes_equivalencias_documentos WHERE idAntecedentesEquivalencias=?`
            res[0].leyesDigesto = await conn.query(sql, [res[0].idAntecedentesEquivalencias]).catch(err => { throw err });
        }
        await conn.commit();

    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        // Close Connection
        if (conn) conn.close();
    }
    return res
}

async function guardarFormulario7(request) {

    let conn = await connection.poolPromise.getConnection();
    let sql = `SELECT a.* FROM dj_antecedentes_equivalencias a
            LEFT OUTER JOIN dj_analisis_epistemologico b ON a.idAntecedentesEquivalencias = b.valoresFormulario7
            WHERE b.idNormaSDIN=?`;
    let params = [request.idNormaSDIN]

    try {

        await conn.beginTransaction();

        let formularioActual = await conn.query(sql, params).catch(err => { throw err });

        if (formularioActual.length > 0) {
            sql = `UPDATE dj_antecedentes_equivalencias SET 
                anexoAntecedentes=?,
                anexoEquivalencias=?
                WHERE idAntecedentesEquivalencias=?`;
            params = [request.anexoAntecedentes,
            request.anexoEquivalencias,
            formularioActual[0].idAntecedentesEquivalencias]
            await conn.query(sql, params).catch(err => { throw err });
            let leyesDigestoActuales = await conn.query(`SELECT * FROM dj_antecedentes_equivalencias_documentos WHERE idAntecedentesEquivalencias=?`,
                [formularioActual[0].idAntecedentesEquivalencias]).catch(err => { throw err });
            for (const ley of request.leyesDigesto) {
                if (leyesDigestoActuales.map(n => n.idLeyDigesto).includes(ley.idLeyDigesto)) {
                    sql = `UPDATE dj_antecedentes_equivalencias_documentos SET 
                    archivo=?,
                    archivoS3=?, 
                    documentoConsolidado=?
                    WHERE idAntecedentesEquivalencias=?`;
                    params = [ley.archivo, ley.archivoS3, ley.documentoConsolidado, formularioActual[0].idAntecedentesEquivalencias]
                    await conn.query(sql, params).catch(err => { throw err });
                }
                else {
                    sql = `INSERT INTO dj_antecedentes_equivalencias_documentos 
                        (archivo, archivoS3, documentoConsolidado, idLeyDigesto, idAntecedentesEquivalencias) VALUES (?,?,?,?,?)`;
                    params = [ley.archivo, ley.archivoS3, ley.documentoConsolidado, ley.idLeyDigesto, formularioActual[0].idAntecedentesEquivalencias]
                    await conn.query(sql, params).catch(err => { throw err });
                }
            }
        }
        else {
            sql = `INSERT INTO dj_antecedentes_equivalencias (
                anexoAntecedentes, 
                anexoEquivalencias) VALUES (?,?)`;
            params = [request.anexoAntecedentes,
            request.anexoEquivalencias]
            const formIngresado = await conn.query(sql, params).catch(err => { throw err });
            await conn.query("INSERT INTO dj_analisis_epistemologico (valoresFormulario7, idNormaSDIN) VALUES (?,?) ON DUPLICATE KEY UPDATE valoresFormulario7=values(valoresFormulario7)",
                [formIngresado.insertId, request.idNormaSDIN]).catch(err => { throw err });
            for (const ley of request.leyesDigesto) {
                sql = `INSERT INTO dj_antecedentes_equivalencias_documentos 
                (archivo, archivoS3, documentoConsolidado, idLeyDigesto, idAntecedentesEquivalencias) VALUES (?,?,?,?,?)`;
                params = [ley.archivo, ley.archivoS3, ley.documentoConsolidado, ley.idLeyDigesto, formIngresado.insertId]
                await conn.query(sql, params).catch(err => { throw err });
            }
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

async function normasAnexoIPrevio() {

    let conn = await connection.poolPromise.getConnection();
    let sql = `SELECT a.idNormaSDIN, a.temasGenerales, a.idRama, d.rama, c.archivoS3, 
        a.normaNumero, e.normaTipo, a.idNormaTipo, c.observacionesGenerales
        FROM sdin_normas_metadatos a
        LEFT OUTER JOIN dj_analisis_epistemologico b ON a.idNormaSDIN = b.idNormaSDIN
        LEFT OUTER JOIN dj_texto_definitivo c ON b.valoresFormulario6 = c.idTextoDefinitivo
        LEFT OUTER JOIN sdin_ramas d ON a.idRama = d.idRama
        LEFT OUTER JOIN bo_normas_tipos e ON a.idNormaTipo = e.idNormaTipo
        WHERE b.idAnexoDJ=1 AND a.aprobadoEpistemologicamente=1 AND b.formulario6=1 
        AND c.archivoS3 IS NOT NULL AND a.idRama IS NOT NULL
        ORDER BY idRama ASC, idNormaTipo ASC, normaNumero ASC`;
    let res;
    try {

        await conn.beginTransaction();

        res = await conn.query(sql).catch(err => { throw err });

        await conn.commit();

    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        // Close Connection
        if (conn) conn.close();
    }
    return res;
}

async function normasAnexoIIPrevio() { //Normas derogadas expresamente (Formulario 1)

    let conn = await connection.poolPromise.getConnection();
    let sql = `SELECT a.idNormaSDIN, a.temasGenerales, a.idRama, d.rama, a.normaNumero, e.normaTipo, 
        a.idNormaTipo, a.fechaSancion, c.idNormaActiva, f.idNormaTipo AS idNormaTipoActiva,
        g.normaTipo AS normaTipoActiva, f.normaNumero AS normaNumeroActiva, f.fechaSancion AS fechaSancionActiva
        FROM sdin_normas_metadatos a
        LEFT OUTER JOIN dj_analisis_epistemologico b ON a.idNormaSDIN = b.idNormaSDIN
        LEFT OUTER JOIN dj_valores_formularios c ON b.valoresFormulario1 = c.idValoresFormulario
        LEFT OUTER JOIN sdin_ramas d ON a.idRama = d.idRama
        LEFT OUTER JOIN bo_normas_tipos e ON a.idNormaTipo = e.idNormaTipo
        LEFT OUTER JOIN sdin_normas_metadatos f ON c.idNormaActiva = f.idNormaSDIN
        LEFT OUTER JOIN bo_normas_tipos g ON f.idNormaTipo = g.idNormaTipo
        WHERE b.idAnexoDJ=2 AND a.aprobadoEpistemologicamente=1 AND a.idRama IS NOT NULL
        AND b.formulario1=1 AND c.idNormaActiva IS NOT NULL AND c.archivoS3 IS NOT NULL
        ORDER BY idRama ASC, idNormaTipo ASC, normaNumero ASC`;
    let res;
    try {

        await conn.beginTransaction();

        res = await conn.query(sql).catch(err => { throw err });

        await conn.commit();

    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        // Close Connection
        if (conn) conn.close();
    }
    return res;
}

async function normasAnexoIIIPrevio() { //Normas abrogadas implícitamente (Formulario 2)

    let conn = await connection.poolPromise.getConnection();
    let sql = `SELECT a.idNormaSDIN, a.idRama, d.rama, a.normaNumero, e.normaTipo, a.idNormaTipo, 
        c.idNormaActiva, f.idNormaTipo AS idNormaTipoActiva, g.normaTipo AS normaTipoActiva, 
        f.normaNumero AS normaNumeroActiva, c.archivoS3
        FROM sdin_normas_metadatos a
        LEFT OUTER JOIN dj_analisis_epistemologico b ON a.idNormaSDIN = b.idNormaSDIN
        LEFT OUTER JOIN dj_valores_formularios c ON b.valoresFormulario5 = c.idValoresFormulario
        LEFT OUTER JOIN sdin_ramas d ON a.idRama = d.idRama
        LEFT OUTER JOIN bo_normas_tipos e ON a.idNormaTipo = e.idNormaTipo
        LEFT OUTER JOIN sdin_normas_metadatos f ON c.idNormaActiva = f.idNormaSDIN
        LEFT OUTER JOIN bo_normas_tipos g ON f.idNormaTipo = g.idNormaTipo
        WHERE b.idAnexoDJ=3 AND a.aprobadoEpistemologicamente=1 AND b.formulario5=1
        AND c.idNormaActiva IS NOT NULL AND a.idRama IS NOT NULL AND c.archivoS3 IS NOT NULL
        ORDER BY idRama ASC, idNormaTipo ASC, normaNumero ASC`;
    let res;
    try {

        await conn.beginTransaction();

        res = await conn.query(sql).catch(err => { throw err });

        await conn.commit();

    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        // Close Connection
        if (conn) conn.close();
    }
    return res;
}

async function normasAnexoIVPrevio() {

    let conn = await connection.poolPromise.getConnection();
    let sql = `SELECT a.idNormaSDIN, a.idRama, d.rama, a.normaNumero, e.normaTipo, a.idNormaTipo, a.archivoS3,
        c.idNormaActiva, f.idNormaTipo AS idNormaTipoActiva, g.normaTipo AS normaTipoActiva, f.normaNumero AS normaNumeroActiva,
        c.idCausal, h.causal
        FROM sdin_normas_metadatos a
        LEFT OUTER JOIN dj_analisis_epistemologico b ON a.idNormaSDIN = b.idNormaSDIN
        LEFT OUTER JOIN dj_valores_formularios c ON b.valoresFormulario2 = c.idValoresFormulario
        LEFT OUTER JOIN sdin_ramas d ON a.idRama = d.idRama
        LEFT OUTER JOIN bo_normas_tipos e ON a.idNormaTipo = e.idNormaTipo
        LEFT OUTER JOIN sdin_normas_metadatos f ON c.idNormaActiva = f.idNormaSDIN
        LEFT OUTER JOIN bo_normas_tipos g ON f.idNormaTipo = g.idNormaTipo
        LEFT OUTER JOIN dj_causales h ON c.idCausal = h.idCausal
        WHERE b.idAnexoDJ=4 AND a.aprobadoEpistemologicamente=1 AND b.formulario5=1
        AND c.idNormaActiva IS NOT NULL AND b.formulario3=1 AND a.idRama IS NOT NULL
        ORDER BY idRama ASC, idNormaTipo ASC, normaNumero ASC`;
    let res;
    try {

        await conn.beginTransaction();

        res = await conn.query(sql).catch(err => { throw err });

        await conn.commit();

    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        // Close Connection
        if (conn) conn.close();
    }
    return res;
}

function traerLeyesDigesto() {
    return new Promise((resolve, reject) => {
        let sql = `SELECT * FROM dj_leyes_digesto`;

        connection.pool.query(sql, function (error, results) {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
}

async function corteDigesto(request) {
    let conn = await connection.poolPromise.getConnection();
    let normas = `SELECT a.idNormaSDIN, a.importadaBO, a.idNorma, a.normaAcronimoReferencia, 
        a.idNormaTipo, a.idNormaSubtipo, a.idSeccion, a.idReparticion, a.idReparticionOrganismo, a.normaAnio,
        a.normaNumero, a.normaSumario, a.temasGenerales, a.vigenciaEspecialDescripcion, a.vigenciaEspecial,
        a.vigente, a.linkPublicacionBO, a.idClase, a.idGestion, a.idTipoPublicacion, a.fechaPublicacion,
        a.fechaSancion, a.fechaPromulgacion, a.fechaRatificacion, a.fechaCarga, a.usuarioCarga, a.fechaActualizacion,
        a.usuarioActualizacion, a.usuarioAsignado, a.textoOriginal, a.textoActualizado, a.textoConsolidado, 
        a.archivo, a.archivoS3, a.titulo, a.observaciones, a.generaTA, a.clausulaDerogatoria, 
        a.clausulaDerogatoriaDescripcion, a.idRama, a.dependencias, a.checkDigesto,
        a.aprobadoNormativamente, a.aprobadoDocumentalmente, a.aprobadoEpistemologicamente, a.asiento, 
        a.estado FROM sdin_normas_metadatos a
        LEFT OUTER JOIN dj_analisis_epistemologico b ON a.idNormaSDIN = b.idNormaSDIN
        WHERE a.aprobadoEpistemologicamente=1 AND b.idAnexoDJ IS NOT NULL`;
    try {
        await conn.beginTransaction();

        const fechaCorte = moment().format('YYYY-MM-DD');

        let sql = `INSERT INTO final_cortes (fechaCorte, usuarioCarga) VALUES (?,?)`;
        await conn.query(sql, [fechaCorte, request.idUsuario]).catch(err => { throw err });

        //Copiar los metadatos de las normas
        sql = `INSERT INTO final_normas (idNormaSDIN, importadaBO, idNorma, normaAcronimoReferencia, 
            idNormaTipo, idNormaSubtipo, idSeccion, idReparticion, idReparticionOrganismo, normaAnio,
            normaNumero, normaSumario, temasGenerales, vigenciaEspecialDescripcion, vigenciaEspecial,
            vigente, linkPublicacionBO, idClase, idGestion, idTipoPublicacion, fechaPublicacion,
            fechaSancion, fechaPromulgacion, fechaRatificacion, fechaCarga, usuarioCarga, fechaActualizacion,
            usuarioActualizacion, usuarioAsignado, textoOriginal, textoActualizado, textoConsolidado, 
            archivo, archivoS3, titulo, observaciones, generaTA, clausulaDerogatoria, 
            clausulaDerogatoriaDescripcion, idRama, dependencias, checkDigesto,
            aprobadoNormativamente, aprobadoDocumentalmente, aprobadoEpistemologicamente, asiento, 
            estado, fechaCorte) SELECT *, ? AS fechaCorte FROM (${normas}) AS table1`;
        await conn.query(sql, [fechaCorte]).catch(err => { throw err });

        //Copiar los datos del análisis epistemológico
        sql = `INSERT INTO final_analisis_epistemologico (fechaCorte, idNormaSDIN, idAnexoDJ, observaciones, usuarioCarga, 
            formulario1, formulario2, formulario3, formulario4, formulario5, formulario6, formulario7)
            SELECT '${fechaCorte}' AS fechaCorte, idNormaSDIN, idAnexoDJ, observaciones, usuarioCarga, 
            formulario1, formulario2, formulario3, formulario4, formulario5, formulario6, formulario7 
            FROM dj_analisis_epistemologico WHERE idNormaSDIN IN (SELECT idNormaSDIN FROM (${normas}) AS table1)`;
        await conn.query(sql).catch(err => { throw err });

        //Copiar los valores de los formularios norma por norma y actualizar en analisis epist. los id
        sql = `SELECT idNormaSDIN FROM (${normas}) AS table1`;
        let ids = await conn.query(sql).catch(err => { throw err });
        ids = ids.map(n => n.idNormaSDIN);
        for (const id of ids) {
            //Copiar formularios del 1 al 5 (6 y 7 tienen tablas separadas)
            for (let i = 1; i <= 5; i++) {
                //Ingreso el formulario
                sql = `INSERT INTO final_valores_formularios (idNormaActiva, idAbrogacionTipoPasiva, idAbrogacionTipoActiva, 
                    idPatologiaNormativa, idCausal, detallesActiva, detallesPasiva, fechaCarga, fechaActualizacion, usuarioCarga, 
                    usuarioActualizacion, solucionAdoptada, fundamentacionJuridica, observaciones, textoUnificado,
                    fechaInicioVigencia, fechaPerdidaVigencia, archivo, archivoS3, documentoConsolidado) 
                    SELECT b.idNormaActiva, b.idAbrogacionTipoPasiva, b.idAbrogacionTipoActiva, 
                    b.idPatologiaNormativa, b.idCausal, b.detallesActiva, b.detallesPasiva, b.fechaCarga, b.fechaActualizacion, b.usuarioCarga, 
                    b.usuarioActualizacion, b.solucionAdoptada, b.fundamentacionJuridica, b.observaciones, b.textoUnificado,
                    b.fechaInicioVigencia, b.fechaPerdidaVigencia, b.archivo, b.archivoS3, b.documentoConsolidado
                    FROM dj_analisis_epistemologico a 
                    LEFT OUTER JOIN dj_valores_formularios b ON a.valoresFormulario${i} = b.idValoresFormulario
                    WHERE a.idNormaSDIN=?`;
                const formIngresado = await conn.query(sql, [id]).catch(err => { throw err });
                //Cargo el Id del formulario ingresado en el analisis epistemologico
                sql = `UPDATE final_analisis_epistemologico SET valoresFormulario${i}=? WHERE idNormaSDIN=? AND fechaCorte=?`;
                await conn.query(sql, [formIngresado.insertId, id, fechaCorte]).catch(err => { throw err });
            }

            //Copiar formulario 6
            sql = `INSERT INTO final_texto_definitivo (textoDefinitivo, textoDefinitivoAnexo, archivo, archivoS3, 
                documentoConsolidado, observacionesGenerales, usuarioCarga, fechaCarga, usuarioActualizacion, fechaActualizacion) 
                SELECT b.textoDefinitivo, b.textoDefinitivoAnexo, b.archivo, b.archivoS3, b.documentoConsolidado,
                b.observacionesGenerales, b.usuarioCarga, b.fechaCarga, b.usuarioActualizacion, b.fechaActualizacion
                FROM dj_analisis_epistemologico a 
                LEFT OUTER JOIN dj_texto_definitivo b ON a.valoresFormulario6 = b.idTextoDefinitivo
                WHERE a.idNormaSDIN=?`;
            const formIngresado6 = await conn.query(sql, [id]).catch(err => { throw err });
            sql = `UPDATE final_analisis_epistemologico SET valoresFormulario6=? WHERE idNormaSDIN=? AND fechaCorte=?`;
            await conn.query(sql, [formIngresado6.insertId, id, fechaCorte]).catch(err => { throw err });

            //Copiar formulario 7
            sql = `INSERT INTO final_antecedentes_equivalencias (anexoAntecedentes, anexoEquivalencias) 
                SELECT b.anexoAntecedentes, b.anexoEquivalencias FROM dj_analisis_epistemologico a 
                LEFT OUTER JOIN dj_antecedentes_equivalencias b ON a.valoresFormulario7 = b.idAntecedentesEquivalencias
                WHERE a.idNormaSDIN=?`;
            const formIngresado7 = await conn.query(sql, [id]).catch(err => { throw err });
            sql = `UPDATE final_analisis_epistemologico SET valoresFormulario7=? WHERE idNormaSDIN=? AND fechaCorte=?`;
            await conn.query(sql, [formIngresado7.insertId, id, fechaCorte]).catch(err => { throw err });

            sql = `INSERT INTO final_antecedentes_equivalencias_documentos (idAntecedentesEquivalencias, idLeyDigesto, 
                archivo, archivoS3, documentoConsolidado)
                SELECT ? AS idAntecedentesEquivalencias, idLeyDigesto, archivo, archivoS3, documentoConsolidado 
                FROM dj_antecedentes_equivalencias_documentos WHERE idAntecedentesEquivalencias=(SELECT idAntecedentesEquivalencias 
                FROM dj_antecedentes_equivalencias a, dj_analisis_epistemologico b
                WHERE b.valoresFormulario7=a.idAntecedentesEquivalencias AND b.idNormaSDIN=?)`;
            await conn.query(sql, [formIngresado7.insertId, id, fechaCorte]).catch(err => { throw err });

            sql = `INSERT INTO final_temas_jerarquia (idTema, idNormaHijo) 
                SELECT a.idTema, b.idNormaFinal FROM sdin_temas_jerarquia a, final_normas b 
                WHERE a.idNormaHijo=? AND b.idNormaSDIN=? AND b.fechaCorte=?`;
            await conn.query(sql, [id, id, fechaCorte])

            sql = `INSERT INTO final_normas_descriptores (idNorma, idDescriptor) 
                SELECT b.idNormaFinal, a.idDescriptor FROM sdin_normas_descriptores a
                INNER JOIN final_normas b ON a.idNorma = b.idNormaSDIN 
                WHERE a.idNorma=? AND b.idNormaSDIN=? AND b.fechaCorte=?`;
            await conn.query(sql, [id, id, fechaCorte])
        }

        await conn.commit();
    }
    catch (err) {
        await conn.rollback();
        throw err;
    }
    finally {
        // Close Connection
        if (conn) conn.close();
    }
}

async function normasAnexoI(request) {
    let conn = await connection.poolPromise.getConnection();
    let sql = `SELECT a.idNormaSDIN, a.temasGenerales, a.idRama, d.rama, c.archivoS3, 
        a.normaNumero, e.normaTipo, a.idNormaTipo, c.observacionesGenerales
        FROM final_normas a
        LEFT OUTER JOIN final_analisis_epistemologico b ON a.idNormaSDIN = b.idNormaSDIN
        LEFT OUTER JOIN final_texto_definitivo c ON b.valoresFormulario6 = c.idTextoDefinitivo
        LEFT OUTER JOIN sdin_ramas d ON a.idRama = d.idRama
        LEFT OUTER JOIN bo_normas_tipos e ON a.idNormaTipo = e.idNormaTipo
        WHERE b.idAnexoDJ=1 AND a.aprobadoEpistemologicamente=1 AND b.formulario6=1 
        AND c.archivoS3 IS NOT NULL AND a.idRama IS NOT NULL AND a.fechaCorte=?
        ORDER BY idRama ASC, idNormaTipo ASC, normaNumero ASC`;
    let res;
    let params = [request.fecha]
    try {

        await conn.beginTransaction();

        res = await conn.query(sql, params).catch(err => { throw err });

        await conn.commit();

    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        // Close Connection
        if (conn) conn.close();
    }
    return res;
}

async function normasAnexoII(request) { //Normas derogadas expresamente (Formulario 1)

    let conn = await connection.poolPromise.getConnection();
    let sql = `SELECT a.idNormaSDIN, a.temasGenerales, a.idRama, d.rama, a.normaNumero, e.normaTipo, 
        a.idNormaTipo, a.fechaSancion, c.idNormaActiva, f.idNormaTipo AS idNormaTipoActiva,
        g.normaTipo AS normaTipoActiva, f.normaNumero AS normaNumeroActiva, f.fechaSancion AS fechaSancionActiva
        FROM final_normas a
        LEFT OUTER JOIN final_analisis_epistemologico b ON a.idNormaSDIN = b.idNormaSDIN
        LEFT OUTER JOIN final_valores_formularios c ON b.valoresFormulario1 = c.idValoresFormulario
        LEFT OUTER JOIN sdin_ramas d ON a.idRama = d.idRama
        LEFT OUTER JOIN bo_normas_tipos e ON a.idNormaTipo = e.idNormaTipo
        LEFT OUTER JOIN final_normas f ON c.idNormaActiva = f.idNormaSDIN
        LEFT OUTER JOIN bo_normas_tipos g ON f.idNormaTipo = g.idNormaTipo
        WHERE b.idAnexoDJ=2 AND a.aprobadoEpistemologicamente=1 AND a.idRama IS NOT NULL
        AND b.formulario1=1 AND c.idNormaActiva IS NOT NULL AND c.archivoS3 IS NOT NULL AND a.fechaCorte=?
        ORDER BY idRama ASC, idNormaTipo ASC, normaNumero ASC`;
    let res;
    let params = [request.fecha]
    try {

        await conn.beginTransaction();

        res = await conn.query(sql, params).catch(err => { throw err });

        await conn.commit();

    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        // Close Connection
        if (conn) conn.close();
    }
    return res;
}

async function normasAnexoIII(request) { //Normas abrogadas implícitamente (Formulario 2)

    let conn = await connection.poolPromise.getConnection();
    let sql = `SELECT a.idNormaSDIN, a.idRama, d.rama, a.normaNumero, e.normaTipo, a.idNormaTipo, 
        c.idNormaActiva, f.idNormaTipo AS idNormaTipoActiva, g.normaTipo AS normaTipoActiva, 
        f.normaNumero AS normaNumeroActiva, c.archivoS3
        FROM final_normas a
        LEFT OUTER JOIN final_analisis_epistemologico b ON a.idNormaSDIN = b.idNormaSDIN
        LEFT OUTER JOIN final_valores_formularios c ON b.valoresFormulario5 = c.idValoresFormulario
        LEFT OUTER JOIN sdin_ramas d ON a.idRama = d.idRama
        LEFT OUTER JOIN bo_normas_tipos e ON a.idNormaTipo = e.idNormaTipo
        LEFT OUTER JOIN final_normas f ON c.idNormaActiva = f.idNormaSDIN
        LEFT OUTER JOIN bo_normas_tipos g ON f.idNormaTipo = g.idNormaTipo
        WHERE b.idAnexoDJ=3 AND a.aprobadoEpistemologicamente=1 AND b.formulario5=1
        AND c.idNormaActiva IS NOT NULL AND a.idRama IS NOT NULL AND c.archivoS3 IS NOT NULL AND a.fechaCorte=?
        ORDER BY idRama ASC, idNormaTipo ASC, normaNumero ASC`;
    let res;
    let params = [request.fecha]
    try {

        await conn.beginTransaction();

        res = await conn.query(sql, params).catch(err => { throw err });

        await conn.commit();

    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        // Close Connection
        if (conn) conn.close();
    }
    return res;
}

async function normasAnexoIV(request) {
    let conn = await connection.poolPromise.getConnection();
    let sql = `SELECT a.idNormaSDIN, a.idRama, d.rama, a.normaNumero, e.normaTipo, a.idNormaTipo, a.archivoS3,
        c.idNormaActiva, f.idNormaTipo AS idNormaTipoActiva, g.normaTipo AS normaTipoActiva, f.normaNumero AS normaNumeroActiva,
        c.idCausal, h.causal
        FROM final_normas a
        LEFT OUTER JOIN dj_analisis_epistemologico b ON a.idNormaSDIN = b.idNormaSDIN
        LEFT OUTER JOIN dj_valores_formularios c ON b.valoresFormulario2 = c.idValoresFormulario
        LEFT OUTER JOIN sdin_ramas d ON a.idRama = d.idRama
        LEFT OUTER JOIN bo_normas_tipos e ON a.idNormaTipo = e.idNormaTipo
        LEFT OUTER JOIN sdin_normas_metadatos f ON c.idNormaActiva = f.idNormaSDIN
        LEFT OUTER JOIN bo_normas_tipos g ON f.idNormaTipo = g.idNormaTipo
        LEFT OUTER JOIN dj_causales h ON c.idCausal = h.idCausal
        WHERE b.idAnexoDJ=4 AND a.aprobadoEpistemologicamente=1 AND b.formulario5=1
        AND c.idNormaActiva IS NOT NULL AND b.formulario3=1 AND a.idRama IS NOT NULL AND a.fechaCorte=?
        ORDER BY idRama ASC, idNormaTipo ASC, normaNumero ASC`;
    let params = [request.fecha]
    let res;
    try {

        await conn.beginTransaction();

        res = await conn.query(sql, params).catch(err => { throw err });

        await conn.commit();

    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        // Close Connection
        if (conn) conn.close();
    }
    return res;
}

function traerCortesDigesto() {
    return new Promise((resolve, reject) => {
        let sql = `SELECT * FROM final_cortes`;

        connection.pool.query(sql, function (error, results) {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
}

function traerAnexosFirmados(request) {
    return new Promise((resolve, reject) => {
        let sql = `SELECT * FROM dj_anexos_firmados WHERE fechaDigesto=? AND estado=1`;
        let params = [request.fecha]
        connection.pool.query(sql, params, function (error, results) {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
}

function firmarAnexo(request) {
    return new Promise((resolve, reject) => {
        let sql = `INSERT INTO dj_anexos_firmados (idAnexoDJ, archivoS3, idRama, fechaDigesto, usuarioCarga) VALUES (?,?,?,?,?)`;
        let params = [request.idAnexoDJ, request.archivoS3, request.idRama, request.fecha, request.idUsuario]
        connection.pool.query(sql, params, function (error, results) {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
}

function editarCorte(request) {
    return new Promise((resolve, reject) => {
        let sql = `UPDATE final_cortes SET aprobadoLegislatura=?, enviadoLegislatura=? WHERE id=?`;
        let params = [request.aprobadoLegislatura, request.enviadoLegislatura, request.id]
        connection.pool.query(sql, params, function (error, results) {
            if (error) {
                reject(error);
            }
            resolve(results);
        });
    });
}

async function crearLeyDigesto(request) {

    let conn = await connection.poolPromise.getConnection();
    let sqlInsert = `INSERT INTO dj_leyes_digesto 
                (numeroLey, leyendaLey, leyendaModificaciones, esUltima, anio, anioDigestoAnterior,fechaFin) 
                VALUES (?,?,?,?,?,?,?)`;
    let sqlUpdate = `UPDATE dj_leyes_digesto SET esUltima=0 WHERE idLeyDigesto=?`;

    try {
        await conn.beginTransaction();

        const leyActual = await conn.query("SELECT * FROM dj_leyes_digesto WHERE esUltima=1")
            .catch(err => { throw err });

        await conn.query(
            sqlUpdate, [leyActual[0].idLeyDigesto])
            .catch(err => { throw err });

        await conn.query(
            sqlInsert, [request.numeroLey, request.leyendaLey, request.leyendaModificaciones, 1, request.anio, leyActual[0].anio, request.fechaFin])
            .catch(err => { throw err });

        const normasSDINConTextoDef = await conn.query(`
            (SELECT 
                DAP.idNormaSDIN, 
                DAP.valoresFormulario6 AS idTexto, 
                DAP.valoresFormulario7 AS idEquivalencias,
                DTF.archivo,
                DTF.archivoS3
                FROM dj_analisis_epistemologico DAP
            INNER JOIN dj_texto_definitivo DTF ON DTF.idTextoDefinitivo = DAP.valoresFormulario6 
            WHERE DAP.formulario6 = 1 AND DAP.valoresFormulario6 IS NOT NULL
            )
            UNION (
            SELECT 
                DAP.idNormaSDIN, 
                DAP.valoresFormulario6 AS idTexto, 
                DAP.valoresFormulario7 AS idEquivalencias,
                DTD.archivo, 
                DTD.archivoS3
            FROM dj_analisis_epistemologico DAP
            INNER JOIN dj_valores_formularios DVF ON DVF.idValoresFormulario = DAP.valoresFormulario1
            INNER JOIN dj_texto_definitivo DTD ON DTD.idTextoDefinitivo = DAP.valoresFormulario6
            WHERE DAP.formulario1 = 1 AND DAP.valoresFormulario1 IS NOT NULL
            )
            UNION (
            SELECT 
                DAP.idNormaSDIN, 
                DAP.valoresFormulario6 AS idTexto, 
                DAP.valoresFormulario7 AS idEquivalencias,
                DTD.archivo, 
                DTD.archivoS3
            FROM dj_analisis_epistemologico DAP
            INNER JOIN dj_valores_formularios DVF ON DVF.idValoresFormulario = DAP.valoresFormulario5
            INNER JOIN dj_texto_definitivo DTD ON DTD.idTextoDefinitivo = DAP.valoresFormulario6
            WHERE DAP.formulario5 = 1 AND DAP.valoresFormulario5 IS NOT NULL
            )`)
            .catch(err => { throw err });

        //Normas con form 1 y que están publicadas. Les tengo que pegar la patologia normativa en sdin_normas_front
        const normasSDINConForm1 = await conn.query(`
        SELECT DAP.idNormaSDIN, DVF.idPatologiaNormativa
        FROM dj_analisis_epistemologico DAP
        INNER JOIN dj_valores_formularios DVF ON DVF.idValoresFormulario = DAP.valoresFormulario1 AND DVF.idPatologiaNormativa IS NOT NULL
        INNER JOIN sdin_normas_front SNF ON SNF.idNormaFront = DAP.idNormaSDIN
        WHERE DAP.formulario1 = 1 AND DAP.valoresFormulario1 IS NOT NULL`)
            .catch(err => { throw err });

        if (normasSDINConForm1?.length > 0) {
            await conn.batch(`UPDATE sdin_normas_front SET idCausal=?, esCausal=0 WHERE idNormaFront=?`,
                normasSDINConForm1.map(n => [n.idPatologiaNormativa, n.idNormaSDIN]));
        }

        //Normas con form 5 y que están publicadas. Les tengo que pegar la patologia normativa en sdin_normas_front
        const normasSDINConForm5 = await conn.query(`
        SELECT 
        DAP.idNormaSDIN, 
        DVF.idCausal
        FROM dj_analisis_epistemologico DAP
        INNER JOIN dj_valores_formularios DVF ON DVF.idValoresFormulario = DAP.valoresFormulario5 AND DVF.idCausal IS NOT NULL
        INNER JOIN sdin_normas_front SNF ON SNF.idNormaFront = DAP.idNormaSDIN
        WHERE DAP.formulario5 = 1 AND DAP.valoresFormulario5 IS NOT NULL`)

        if (normasSDINConForm5?.length > 0) {
            await conn.batch(`UPDATE sdin_normas_front SET idCausal=?, esCausal=1 WHERE idNormaFront=?`,
                normasSDINConForm5.map(n => [n.idCausal, n.idNormaSDIN]));
        }

        const idsTextosDefinitivos = normasSDINConTextoDef.map(item => item.idTexto)

        for (const id of idsTextosDefinitivos) {
            await conn.query(
                `UPDATE dj_texto_definitivo
                    SET archivo = "", archivoS3 = "", documentoConsolidado = 0
                WHERE idtextoDefinitivo = ?` , [id])
                .catch(err => { throw err });
        }

        for (const norma of normasSDINConTextoDef) {
            if (norma.idEquivalencias) {
                await conn.query(
                    `INSERT INTO dj_antecedentes_equivalencias_documentos 
                        (idAntecedentesEquivalencias, idLeyDigesto, archivo, archivoS3) 
                    VALUES 
                        (?,?,?,?);` , [norma.idEquivalencias, leyActual[0].idLeyDigesto, norma.archivo, norma.archivoS3])
                    .catch(err => { throw err });
            } else {
                let result = await conn.query(
                    `INSERT INTO dj_antecedentes_equivalencias 
                        (anexoAntecedentes, anexoEquivalencias) 
                    VALUES 
                        ("", "");`)
                    .catch(err => { throw err });

                let nuevoIdAntecedentesEquivalencias = result.insertId

                await conn.query(
                    `INSERT INTO dj_antecedentes_equivalencias_documentos 
                        (idAntecedentesEquivalencias, idLeyDigesto, archivo, archivoS3) 
                    VALUES 
                        (?,?,?,?);` , [nuevoIdAntecedentesEquivalencias, leyActual[0].idLeyDigesto, norma.archivo, norma.archivoS3])
                    .catch(err => { throw err });

                await conn.query(
                    `UPDATE dj_analisis_epistemologico 
                        SET formulario7 = 1, valoresFormulario7 = ? 
                    WHERE idNormaSDIN = ?` , [nuevoIdAntecedentesEquivalencias, norma.idNormaSDIN])
                    .catch(err => { throw err });
            }
        }

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

module.exports = {
    traerPatologiasNormativas,
    guardarAnalisisEpistemologico,
    traerAnexosDJ,
    traerAnalisisEpistemologico,
    traerCausales,
    traerTiposAbrogacion,
    guardarArbolTematico,
    traerFormulario1,
    guardarFormulario1,
    traerFormulario2,
    guardarFormulario2,
    traerFormulario3,
    guardarFormulario3,
    traerFormulario4,
    guardarFormulario4,
    traerArbolTematico,
    guardarFormulario5,
    traerFormulario5,
    guardarFormulario6,
    traerFormulario6,
    normasAnexoIPrevio,
    normasAnexoIIPrevio,
    normasAnexoIIIPrevio,
    normasAnexoIVPrevio,
    guardarFormulario7,
    traerFormulario7,
    traerLeyesDigesto,
    corteDigesto,
    traerCortesDigesto,
    normasAnexoI,
    normasAnexoII,
    normasAnexoIII,
    normasAnexoIV,
    traerAnexosFirmados,
    firmarAnexo,
    editarCorte,
    crearLeyDigesto
};