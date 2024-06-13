const connection = require("../../services/conexion-mariadb");
const { guardarLog } = require("../../helpers/logs");
async function traerSumario() {
  let conn = await connection.poolPromise.getConnection();
  let sumario = {};
  try {
    await conn.beginTransaction();
    let sql_es_poder = `SELECT
        xx.idSeccion,
        xx.seccion,
        xx.seccionOrden,
        xx.es_poder,
        yy.idSumarioNormasTipo,
        yy.idNormaTipo,
        yy.normaTipo,
        yy.normaTipoOrden,
        yy.normaTipoHoraCargaInicial,
        yy.normaTipoHoraCargaFinal,
        yy.estado as estadoSumarioNormasTipo,
        zz.idNormaSubtipo,
        zz.normaSubtipo,
        zz.normaSubtipoOrden,
        zz.idSumarioNormasTiposSubtipo,
        zz.estado AS estadoSubtipo,
        rr.idReparticion,
        rr.reparticion,
        rr.reparticionOrden,
        rr.idSumarioNormasTiposReparticion,
        rr.estado AS estadoReparticion
    FROM
        bo_sumario_secciones xx
        LEFT OUTER JOIN
        (SELECT
            c.idSeccion,
            a.idSumarioNormasTipo,
            b.idNormaTipo,
            b.normaTipo,
            a.normaTipoOrden,
            a.normaTipoHoraCargaInicial,
            a.normaTipoHoraCargaFinal,
            a.estado
        FROM
            bo_sumario_seccion_normas_tipos a
            LEFT OUTER JOIN bo_normas_tipos b
            ON a.idNormaTipo = b.idNormaTipo
            LEFT OUTER JOIN bo_sumario_secciones c
            ON a.idSeccion = c.idSeccion
        WHERE b.estado = 1
        ORDER BY a.normaTipoOrden ASC) yy
        ON xx.idSeccion = yy.idSeccion
        LEFT OUTER JOIN
        (SELECT
            d.idSumarioNormasTipo,
            d.idSumarioNormasTiposSubtipo,
            f.idNormaSubtipo,
            f.normaSubtipo,
            d.normaSubtipoOrden,
            d.estado
        FROM
            bo_sumario_seccion_normas_tipos_subtipos d
            LEFT OUTER JOIN bo_normas_subtipos f
            ON d.idNormaSubtipo = f.idNormaSubtipo
        WHERE 1 = 1
    -- ACA BORRE LA CONDICION DEL SUBTIPO SUMARIO
            AND f.estado = 1
        ORDER BY d.normaSubtipoOrden ASC) zz
        ON yy.idSumarioNormasTipo = zz.idSumarioNormasTipo
        LEFT OUTER JOIN
        (SELECT
            g.idSumarioNormasTiposReparticion,
            g.idSumarioNormasTipo,
            i.reparticion,
            i.siglaReparticion,
            g.reparticionOrden,
            g.idReparticion,
            g.estado
        FROM
            bo_sumario_seccion_normas_tipos_reparticiones g
            LEFT OUTER JOIN bo_reparticiones i
            ON g.idReparticion = i.idReparticion
        WHERE 1 = 1
            AND i.estado = 1
        ORDER BY g.reparticionOrden ASC) rr
        ON yy.idSumarioNormasTipo = rr.idSumarioNormasTipo
    WHERE 1 = 1
        AND xx.estado = 1
        AND xx.es_poder = 1
    ORDER BY xx.seccionOrden,
        yy.normaTipoOrden,
        zz.normaSubtipoOrden,
        rr.reparticionOrden ASC`;

    let sql_no_es_poder = `SELECT sec.idSeccion, sec.seccion, sec.seccionOrden, sec.es_poder, nt.estado as estadoSumarioNormasTipo,
    nt.idNormaTipo, nt.idSumarioNormasTipo, nt.normaTipoOrden, bo_normas_tipos.normaTipo, bo_normas_tipos.normaTipoSigla,
    ns.idNormaSubtipo, ns.idSumarioNormasTiposSubtipo, ns.normaSubtipoOrden,ns.estado AS estadoSubtipo, bo_normas_subtipos.normaSubtipo, bo_normas_subtipos.normaSubtipoSigla
    ,rp.estado AS estadoReparticion
             
             FROM bo_sumario_secciones sec
             LEFT OUTER JOIN bo_sumario_seccion_normas_tipos nt ON nt.idSeccion = sec.idSeccion
             LEFT OUTER JOIN bo_normas_tipos ON bo_normas_tipos.idNormaTipo = nt.idNormaTipo
             LEFT OUTER JOIN bo_sumario_seccion_normas_tipos_subtipos ns ON ns.idSumarioNormasTipo = nt.idSumarioNormasTipo
             LEFT OUTER JOIN bo_normas_subtipos ON bo_normas_subtipos.idNormaSubtipo = ns.idNormaSubtipo
             LEFT OUTER JOIN bo_sumario_seccion_normas_tipos_reparticiones rp ON rp.estado
             WHERE sec.estado=1 AND sec.es_poder=0 AND bo_normas_subtipos.estado=1
             ORDER BY sec.seccionOrden, nt.normaTipoOrden, ns.normaSubtipoOrden
            `;

    let sqlRepas = `SELECT bo_reparticiones.reparticion, sec.idSeccion, repa.idReparticion, repa.reparticionOrden, repa.idSumarioSeccionReparticiones,repa.estado AS estadoReparticion
    FROM bo_sumario_secciones sec 
    LEFT OUTER JOIN bo_sumario_seccion_reparticiones repa ON repa.idSeccion = sec.idSeccion
    LEFT OUTER JOIN bo_reparticiones ON bo_reparticiones.idReparticion = repa.idReparticion
    WHERE bo_reparticiones.estado = 1 AND sec.estado = 1`;

    //Traigo los 2 tipos de secciones por separado porque tienen estructuras distintas
    sumario.es_poder = await conn.query(sql_es_poder);
    sumario.no_es_poder = await conn.query(sql_no_es_poder);
    sumario.no_es_poder_repas = await conn.query(sqlRepas);

    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.close();
  }
  return sumario;
}

function traerSecciones() {
  return new Promise((resolve, reject) => {
    sql = `SELECT a.idSeccion, a.seccion, a.seccionSigla, a.seccionOrden, es_poder, cod_proceso,
                IF (b.idSeccion IS NOT NULL, 1, 0) AS esImportablePorSDIN
                FROM bo_sumario_secciones a
                LEFT OUTER JOIN sdin_sumario_secciones_importables b ON a.idSeccion=b.idSeccion
                WHERE estado = 1
                ORDER BY seccionOrden ASC`;

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

function traerReparticiones(request) {
  return new Promise((resolve, reject) => {
    sql = `SELECT a.idSumarioNormasTiposReparticion, a.idSumarioNormasTipo, c.reparticion, c.siglaReparticion, a.reparticionOrden, a.idReparticion
        FROM bo_sumario_seccion_normas_tipos_reparticiones a
        LEFT OUTER JOIN bo_reparticiones c ON a.idReparticion = c.idReparticion
        WHERE
        a.idSumarioNormasTipo = ?
        AND a.estado = 1
        AND c.estado = 1
        ORDER BY a.reparticionOrden`;
    params = [request.idSumarioNormasTipo];
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

function traerTiposDeNormaPorSeccion(request) {
  return new Promise((resolve, reject) => {
    sql = `SELECT c.idSeccion, c.seccion, a.idSumarioNormasTipo, a.idNormaTipo, b.normaTipo, b.normaTipoSigla, a.normaTipoOrden
        FROM bo_sumario_seccion_normas_tipos a
        LEFT OUTER JOIN bo_normas_tipos b ON a.idNormaTipo = b.idNormaTipo
        LEFT OUTER JOIN bo_sumario_secciones c ON a.idSeccion = c.idSeccion
        WHERE a.estado = 1
        AND a.idSeccion = ?
        AND b.estado = 1
        ORDER BY a.normaTipoOrden`;
    params = [request.idSeccion];
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

function traerSubtipos(request) {
  return new Promise((resolve, reject) => {
    sql = `SELECT 	a.idSumarioNormasTiposSubtipo,
        a.idSumarioNormasTipo,
        b.idNormaSubtipo,
        b.normaSubtipo,
        a.normaSubtipoOrden
    FROM bo_sumario_seccion_normas_tipos_subtipos a
    LEFT OUTER JOIN bo_normas_subtipos b ON a.idNormaSubtipo = b.idNormaSubtipo
    WHERE
    1=1
    AND a.estado = 1
    AND b.estado = 1
    AND a.idSumarioNormasTipo = ?
    ORDER BY a.normaSubtipoOrden
    `;
    params = [request.idSumarioNormasTipo];
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

function traerSumarioItemPorId(request) {
  return new Promise((resolve, reject) => {
    sql = `SELECT xx.idSeccion, xx.seccion, xx.seccionOrden, yy.idSumarioNormasTipo, yy.idNormaTipo, yy.normaTipo, yy.normaTipoOrden, yy.normaTipoHoraCargaInicial, yy.normaTipoHoraCargaFinal, zz.idNormaSubtipo, zz.normaSubtipo, zz.normaSubtipoOrden, rr.idOrgJerarquia, rr.idReparticion, rr.reparticion, rr.reparticionOrden, rr.idReparticionOrganismo, rr.organismo
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
        SELECT g.idSumarioNormasTiposReparticion, g.idSumarioNormasTipo, i.idReparticion, i.reparticion, i.siglaReparticion, g.reparticionOrden, g.idOrgJerarquia, j.idReparticion AS idReparticionOrganismo, j.reparticion AS organismo
                FROM bo_sumario_seccion_normas_tipos_reparticiones g
                LEFT OUTER JOIN org_jerarquia h ON g.idOrgJerarquia = h.idOrgJerarquia
                LEFT OUTER JOIN bo_reparticiones i ON h.idReparticionHijo = i.idReparticion
                LEFT OUTER JOIN bo_reparticiones j ON h.idReparticionPadre = j.idReparticion
                WHERE 1=1
                AND g.estado = 1
                AND h.estado = 1
                AND i.estado = 1
                ORDER BY g.reparticionOrden ASC
        
        ) rr ON zz.idSumarioNormasTipo = rr.idSumarioNormasTipo
        
        
        
        WHERE 1=1
        AND xx.estado = 1 
        AND yy.idSumarioNormasTipo = ?
        ORDER BY xx.seccionOrden, yy.normaTipoOrden, zz.normaSubtipoOrden, rr.reparticionOrden ASC
    `;
    params = [request.idSumarioNormasTipo];
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
function traerSeccionPorId(request) {
  return new Promise((resolve, reject) => {
    sql = `SELECT idSeccion, seccionSigla, seccion, seccionOrden
        FROM
        bo_sumario_secciones
        WHERE
        estado = 1
        AND idSeccion = ?
    `;
    params = [request.idSeccion];
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

function crearSeccion(request) {
  return new Promise((resolve, reject) => {
    let sql = `INSERT INTO bo_sumario_secciones (
            seccion,
            seccionSigla,
            seccionOrden,
            es_poder
            ) 
            SELECT ?,?, COALESCE((MAX(seccionOrden) + 1), 1), ? FROM bo_sumario_secciones WHERE estado=1;
            `;
    params = [request.seccion, request.seccionSigla, request.es_poder];
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

function mostrarSeccion(request) {
  return new Promise((resolve, reject) => {
    let sql = `SELECT idSeccion, seccion, seccionSigla, seccionOrden 
                FROM bo_sumario_secciones
                WHERE
                estado = 1;
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

function borrarSeccion(request) {
  return new Promise((resolve, reject) => {
    let sql = `DELETE FROM bo_sumario_secciones 
        WHERE idSeccion=?;
            `;
    params = [request.idSeccion];
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

function crearSumarioItem(request) {
  return new Promise((resolve, reject) => {
    let sql = `INSERT INTO bo_sumario_seccion_normas_tipos (
            idSeccion,
            idNormaTipo,
            normaTipoOrden
            ) 
            VALUES (?,?,?);
            `;
    params = [request.idSeccion, request.idNormaTipo, request.normaTipoOrden];
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
function borrarSumarioItemPorId(request) {
  return new Promise((resolve, reject) => {
    let sql = `UPDATE bo_sumario_seccion_normas_tipos SET estado=4, fechaBorrado = CURRENT_TIMESTAMP WHERE idSumarioNormasTipo=?;`;
    params = [request.idSumarioNormasTipo];
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

function reactivarSumarioItemPorId(request) {
  return new Promise((resolve, reject) => {
    let sql = `UPDATE bo_sumario_seccion_normas_tipos SET estado=1, fechaBorrado = NULL WHERE idSumarioNormasTipo=?;`;
    params = [request.idSumarioNormasTipo];
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

function borrarSumarioSubtipo(request) {
  return new Promise((resolve, reject) => {
    let sql = `UPDATE bo_sumario_seccion_normas_tipos_subtipos SET estado=4, fechaBorrado = CURRENT_TIMESTAMP WHERE idSumarioNormasTiposSubtipo=?;`;
    params = [request.idSumarioNormasTiposSubtipo];
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

function reactivarSubtipo(request) {
  return new Promise((resolve, reject) => {
    let sql = `UPDATE bo_sumario_seccion_normas_tipos_subtipos SET estado=1, fechaBorrado = NULL WHERE idSumarioNormasTiposSubtipo=?;`;
    params = [request.idSumarioNormasTiposSubtipo];
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

function crearSumarioSubtipo(request) {
  return new Promise((resolve, reject) => {
    let sql = `INSERT INTO bo_sumario_seccion_normas_tipos_subtipos 
        (idSumarioNormasTipo, idNormaSubtipo, normaSubtipoOrden, usuarioCreacion) 
        SELECT ?,?, COALESCE((MAX(normaSubtipoOrden) + 1), 1), ? FROM bo_sumario_seccion_normas_tipos_subtipos WHERE idSumarioNormasTipo=? AND estado=1`;
    params = [
      request.idSumarioNormasTipo,
      request.idNormaSubtipo,
      request.idUsuario,
      request.idSumarioNormasTipo,
    ];
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
function borrarSumarioReparticion(request) {
  return new Promise((resolve, reject) => {
    let sql = `UPDATE bo_sumario_seccion_normas_tipos_reparticiones SET estado=4, fechaBorrado = CURRENT_TIMESTAMP WHERE idSumarioNormasTiposReparticion=?;`;
    params = [request.idSumarioNormasTiposReparticion];
    if (request.idSumarioSeccionReparticiones) {
      sql = `UPDATE bo_sumario_seccion_reparticiones SET estado=4, fechaBorrado = CURRENT_TIMESTAMP WHERE idSumarioSeccionReparticiones=?;`;
      params = [request.idSumarioSeccionReparticiones];
    }

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

function crearSumarioReparticion(request) {
  return new Promise((resolve, reject) => {
    let sql = `INSERT INTO bo_sumario_seccion_normas_tipos_reparticiones 
        (idSumarioNormasTipo, idReparticion, reparticionOrden, usuarioCreacion) 
        SELECT ?,?, COALESCE((MAX(reparticionOrden) + 1), 1), ? FROM bo_sumario_seccion_normas_tipos_reparticiones WHERE idSumarioNormasTipo=? AND estado=1`;
    params = [
      request.idSumarioNormasTipo,
      request.idReparticion,
      request.idUsuario,
      request.idSumarioNormasTipo,
    ];
    if (request.idSeccion) {
      sql = `INSERT INTO bo_sumario_seccion_reparticiones 
                (idSeccion, idReparticion, reparticionOrden, usuarioCreacion) 
                SELECT ?,?, COALESCE((MAX(reparticionOrden) + 1), 1), ? 
                FROM bo_sumario_seccion_reparticiones 
                WHERE idSeccion=? AND estado=1`;
      params = [
        request.idSeccion,
        request.idReparticion,
        request.idUsuario,
        request.idSeccion,
      ];
    }
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

function borrarSeccionPorId(request) {
  return new Promise((resolve, reject) => {
    let sql = `UPDATE bo_sumario_secciones SET estado=4, fechaBorrado = CURRENT_TIMESTAMP WHERE idSeccion=?;`;
    params = [request.idSeccion];
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
function traerReparticionPorId(request) {
  return new Promise((resolve, reject) => {
    sql = `SELECT idReparticion, siglaReparticion, reparticion
        FROM
        bo_reparticiones
        WHERE
        estado = 1
        AND idReparticion = ?
    `;
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
function traerTipoNormaPorId(request) {
  return new Promise((resolve, reject) => {
    sql = `SELECT idNormaTipo, normaTipoSigla, normaTipo
        FROM
        bo_normas_tipos
        WHERE
        estado = 1
        AND idNormaTipo = ?
    `;
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

function actualizarSeccionPorId(request) {
  return new Promise((resolve, reject) => {
    let sql = `UPDATE bo_sumario_secciones 
                SET seccion=?, seccionSigla=?, seccionOrden=?, es_poder=?
                WHERE idSeccion=? AND estado=1;`;
    params = [
      request.seccion,
      request.seccionSigla,
      request.seccionOrden,
      request.es_poder,
      request.idSeccion,
    ];
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

function traerReparticionesPorSeccion(request) {
  return new Promise((resolve, reject) => {
    let sql = `SELECT a.*, b.reparticion FROM bo_sumario_seccion_reparticiones a
                LEFT OUTER JOIN bo_reparticiones b ON b.idReparticion = a.idReparticion
                WHERE a.idSeccion=? AND a.estado=1;`;
    params = [request.idSeccion];
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

async function ordenarSecciones(request) {
  let conn = await connection.poolPromise.getConnection().catch((e) => {
    throw e;
  });
  try {
    await conn.beginTransaction().catch((e) => {
      throw e;
    });
    for (const seccion of request.secciones) {
      let sql = `UPDATE bo_sumario_secciones 
                        SET seccionOrden=?
                        WHERE idSeccion=? AND estado=1;`;
      params = [seccion.seccionOrden, seccion.idSeccion];

      await conn.query(sql, params).catch((error) => {
        throw error;
      });
      await guardarLog(conn, sql, params, request).catch((error) => {
        throw error;
      });
    }
    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.close();
  }
}

async function ordenarNormaTiposSumario(request) {
  let conn = await connection.poolPromise.getConnection().catch((e) => {
    throw e;
  });
  try {
    await conn.beginTransaction().catch((e) => {
      throw e;
    });
    for (const normaTipo of request.normaTipos) {
      let sql = `UPDATE bo_sumario_seccion_normas_tipos 
                        SET normaTipoOrden=?
                        WHERE idSeccion=? AND idNormaTipo=? AND estado=1;`;
      params = [
        normaTipo.normaTipoOrden,
        request.idSeccion,
        normaTipo.idNormaTipo,
      ];

      await conn.query(sql, params).catch((error) => {
        throw error;
      });
      await guardarLog(conn, sql, params, request).catch((error) => {
        throw error;
      });
    }
    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.close();
  }
}

async function ordenarSubtiposSumario(request) {
  let conn = await connection.poolPromise.getConnection().catch((e) => {
    throw e;
  });
  try {
    await conn.beginTransaction().catch((e) => {
      throw e;
    });
    for (const normaSubtipo of request.subtiposNorma) {
      let sql = `UPDATE bo_sumario_seccion_normas_tipos_subtipos 
                        SET normaSubtipoOrden=?
                        WHERE idSumarioNormasTipo=? AND idNormaSubtipo=? AND estado=1;`;
      params = [
        normaSubtipo.normaSubtipoOrden,
        request.idSumarioNormasTipo,
        normaSubtipo.idNormaSubtipo,
      ];

      await conn.query(sql, params).catch((error) => {
        throw error;
      });
      await guardarLog(conn, sql, params, request).catch((error) => {
        throw error;
      });
    }
    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.close();
  }
}

async function ordenarReparticiones(request) {
  let conn = await connection.poolPromise.getConnection().catch((e) => {
    throw e;
  });
  try {
    await conn.beginTransaction().catch((e) => {
      throw e;
    });
    for (const repa of request.reparticiones) {
      let sql = `UPDATE bo_sumario_seccion_normas_tipos_reparticiones
            SET reparticionOrden=?
            WHERE idSumarioNormasTipo=? AND idReparticion=? AND estado=1;`;
      let params = [
        repa.reparticionOrden,
        request.idSumarioNormasTipo,
        repa.idReparticion,
      ];

      if (request.idSeccion) {
        sql = `UPDATE bo_sumario_seccion_reparticiones
                SET reparticionOrden=?
                WHERE idSeccion=? AND idReparticion=? AND estado=1;`;
        params = [repa.reparticionOrden, request.idSeccion, repa.idReparticion];
      }

      await conn.query(sql, params).catch((error) => {
        throw error;
      });
      await guardarLog(conn, sql, params, request).catch((error) => {
        throw error;
      });
    }
    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.close();
  }
}

module.exports = {
  traerSecciones,
  traerTiposDeNormaPorSeccion,
  traerReparticiones,
  traerSubtipos,
  traerSumario,

  traerSumarioItemPorId,
  traerSeccionPorId,
  crearSumarioItem,
  crearSeccion,
  actualizarSeccionPorId,
  mostrarSeccion,
  borrarSeccion,
  borrarSumarioItemPorId,
  borrarSeccionPorId,
  traerReparticionPorId,
  traerTipoNormaPorId,
  crearSumarioSubtipo,
  borrarSumarioSubtipo,
  borrarSumarioReparticion,
  crearSumarioReparticion,
  ordenarSecciones,
  ordenarNormaTiposSumario,
  ordenarSubtiposSumario,
  ordenarReparticiones,
  traerReparticionesPorSeccion,
  reactivarSubtipo,
  reactivarSumarioItemPorId
};
