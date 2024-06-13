const connection = require("../../services/conexion-mariadb");

/*** Para permitir que la norma se pueda observar, priorizar, o editar alguno de sus metadatos, el estado debe ser anterior a BO_DESCARGADO. */
async function esEditable(req, res, next) {
    await traerEstadoDeLaNorma(req.body.idNorma)
        .then(results => {
            if (results[0].idNormasEstadoTipo < 9) {
                next()
            }
            else {
                res.status(409)
                res.send(JSON.stringify({
                    status: 'bloqueado',
                    mensaje: 'No puede alterar esta norma porque pertenece a un Boletín en estado BO_DESCARGADO o superior.',
                    error: 'Petición no permitida.'
                }))
                res.end();
            }
        })
        .catch(err => { throw new Error(err) })

}

function traerEstadoDeLaNorma(idNorma) {
    return new Promise((resolve, reject) => {

        sql = `SELECT idNormasEstadoTipo FROM normas_estados WHERE idNorma=? AND estado=1`;
        params = [idNorma];

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
    })
}

module.exports = { esEditable };