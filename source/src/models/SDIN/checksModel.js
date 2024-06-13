var connection = require("../../services/conexion-mariadb");
const { paginarQuery } = require('../../helpers/paginacion');
const { guardarLog } = require('../../helpers/logs')

function checkRama(request) {
    return new Promise(async (resolve, reject) => {
        sql = `
        SELECT *
        FROM sdin_ramas
        WHERE UPPER(?)=UPPER(rama);
        `;

        params = [request.rama]

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

function checkPatologias(request) {
    return new Promise(async (resolve, reject) => {
        sql = `
        SELECT *
        FROM dj_patologias_normativas
        WHERE UPPER(?)=UPPER(nombre);
        `;

        params = [request.nombre]

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

function checkCausales(request) {
    return new Promise(async (resolve, reject) => {
        sql = `
        SELECT *
        FROM dj_causales
        WHERE UPPER(?)=UPPER(nombre);
        `;

        params = [request.nombre]

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

function checkRelacionesTipos(request) {
    return new Promise(async (resolve, reject) => {
        sql = `
        SELECT *
        FROM sdin_relaciones_tipos
        WHERE UPPER(?)=UPPER(relacion);
        `;

        params = [request.relacion]

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

function checkClases(request) {
    return new Promise(async (resolve, reject) => {
        sql = `
        SELECT *
        FROM sdin_clases
        WHERE UPPER(?)=UPPER(clase);
        `;

        params = [request.clase]

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

function checkClases(request) {
    return new Promise(async (resolve, reject) => {
        sql = `
        SELECT *
        FROM sdin_clases
        WHERE UPPER(?)=UPPER(clase);
        `;

        params = [request.clase]

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

function checkTemas(request) {
    return new Promise(async (resolve, reject) => {
        sql = `
        SELECT *
        FROM sdin_temas
        WHERE UPPER(?)=UPPER(tema);
        `;

        params = [request.tema]

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

function checkBoletin(request) {
    return new Promise(async (resolve, reject) => {
        sql = `
            SELECT a.* 
            FROM sdin_normas_metadatos a 
            LEFT OUTER JOIN normas_estados b ON a.idNorma=b.idNorma
            WHERE a.idNormaSDIN=?
            AND ((b.idNormasEstadoTipo=11
            AND b.estado=1) OR (a.importadaBO=0));
        `;

        params = [request.idNormaSDIN]

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
    checkRama,
    checkPatologias,
    checkCausales,
    checkRelacionesTipos,
    checkClases,
    checkTemas,
    checkBoletin
}