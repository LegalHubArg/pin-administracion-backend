var connection = require("../../services/conexion-mariadb");
const { httpError } = require('../../helpers/handleError')
async function checkUsuarioPINAdminBO(req, res, next) {
    let cuentaUsuario = req.usuario.cuenta.idCuenta;
    await esAdministradorBO(cuentaUsuario)
        .then(results => {
            // console.log(results)
            if (results.length === 0) {
                throw { status: 'bloqueado', mensaje: 'PIN: El Usuario no es Administrador BO.', error: 'Petición no permitida.' }
            }
            else {
                // Es administrador
                // console.log('ES ADMIN')
                next()
            }
        })
        .catch(err => {
            httpError(res, err, 'PIN: Error verificando perfil.')
            /* throw new Error(err)  */
            res.status(409)
            res.send(JSON.stringify(err))
            res.end();
        })
}

async function checkAdminSDIN(req, res, next) {
    let usuarioPIN = req.body.idUsuario;
    await esAdministradorSDIN(usuarioPIN)
        .then(results => {
            // console.log(results)
            if (results.length === 0) {
                throw { status: 'bloqueado', mensaje: 'PIN: El Usuario no es Administrador SDIN.', error: 'Petición no permitida.' }
            }
            else {
                // Es administrador
                // console.log('ES ADMIN')
                next()
            }
        })
        .catch(err => {
            httpError(res, err, 'PIN: Error verificando perfil.')
            /* throw new Error(err)  */
            res.status(409)
            res.send(JSON.stringify(err))
            res.end();
        })
}

function esAdministradorBO(usuario) {
    return new Promise((resolve, reject) => {

        let sql = `SELECT b.descripcion 
        FROM perm_cuentas_perfiles a, perm_perfiles b 
        WHERE a.idPerfil = b.idPerfil 
        AND (a.idPerfil = 1 OR a.idPerfil = 5) 
        AND a.idCuenta=?`;

        params = [usuario];

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

function esAdministradorSDIN(usuario) {
    return new Promise((resolve, reject) => {

        let sql = "SELECT b.descripcion FROM sdin_usuarios_perfiles a, perm_perfiles b WHERE a.idPerfil = b.idPerfil AND (a.idPerfil = 1 OR a.idPerfil = 9) AND a.idUsuario=?";

        params = [usuario];

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

module.exports = { checkUsuarioPINAdminBO, checkAdminSDIN };