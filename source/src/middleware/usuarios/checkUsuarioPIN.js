let connection = require("../../services/conexion-mariadb");
async function checkJSONValidoPermisos(req, res, next) {

    try {
        let o = JSON.parse(JSON.stringify(req.body.permisosCargaUsuario))
        // console.log(o)
        next();
    } catch (e) {
        res.status(409)
        res.send(JSON.stringify({ status: 'bloqueado', mensaje: 'PIN: JSON Inválido.', error: 'Petición no permitida.' }))
        res.end();
    }
    return;

}
async function checkJSONValidoPermisosReparticion(req, res, next) {

    try {
        let o = JSON.parse(JSON.stringify(req.body.permisosCargaReparticion))
        // console.log(o)
        next();
    } catch (e) {
        res.status(409)
        res.send(JSON.stringify({ status: 'bloqueado', mensaje: 'PIN: JSON Inválido.', error: 'Petición no permitida.' }))
        res.end();
    }
    return;

}
async function checkUsuarioPINPerfil(req, res, next) {
    //MODIFICO ESTA FUNCION PARA QUE SI VALIDA TRAIGA EL USUARIO. HACE DE PUENTE ENTRE CUIT Y USERPIN
    //Validar que sea un numero entero. Si es string u otro que rebote
    let usuario = req.usuario.idUsuario;
    next();
    return;
    await existeUsuarioEnPIN(usuario)
        .then(results => {
            console.log(results)
            if (results.length === 0) {
                res.status(409)
                res.send(JSON.stringify({ status: 'bloqueado', mensaje: 'PIN: El Usuario no tiene un perfil asignado en PIN.', error: 'Petición no permitida.' }))
                res.end();
            }
            else {
                req.usuario = results[0];
                next()
            }
        })
        .catch(err => { throw new Error(err) })
}

async function checkUsuarioPIN(req, res, next) {
    //Para que valide el usuario en PIN debe existir como usuario SDIN o como usuario BO
    try {
        let usuario = parseInt(req.body.usuario);
        let resultsSDIN = await getUsuarioSDIN(usuario)
        let resultsBO = await getUsuarioBO(usuario)
        let cuenta = [];
        if (resultsBO.length === 1) {
            cuenta = await getCuenta(usuario)
        }
        if (resultsSDIN.length === 0 && resultsBO.length === 0) {
            throw { status: 'bloqueado', mensaje: 'PIN: El Usuario no pertenece a la plataforma PIN.', error: 'Petición no permitida.' }
        }
        else {
            const bo = resultsBO.length === 1 ? resultsBO[0] : {};
            const sdin = resultsSDIN.length === 1 ? resultsSDIN[0] : {};
            req.usuario = { ...bo, ...sdin };
            if (cuenta.length === 1) {
                req.usuario.cuenta = cuenta[0];
            }
            next()
        }
    }
    catch (err) {
        console.log('error en checkUsuarioPIN: ', err)
        res.status(409)
        res.send(JSON.stringify(err))
        res.end()

    }
}

async function checkExistePerfilDeUsuario(req, res, next) {
    //MODIFICO ESTA FUNCION PARA QUE SI VALIDA TRAIGA EL USUARIO. HACE DE PUENTE ENTRE CUIT Y USERPIN
    //Validar que sea un numero entero. Si es string u otro que rebote
    let perfil = parseInt(req.body.idUsuariosPerfil);
    await existePerfil(perfil)
        .then(results => {
            // console.log(results)
            if (results.length === 0) {
                res.status(409)
                res.send(JSON.stringify({ status: 'bloqueado', mensaje: 'PIN: El perfil no existe o no está activo.', error: 'Petición no permitida.' }))
                res.end();
            }
            else {
                req.perfil = perfil;
                next()
            }
        })
        .catch(err => { throw new Error(err) })
}

async function checkExistePerfilDeUsuarioAlta(req, res, next) {
    let perfil = parseInt(req.body.idPerfil);
    let usuario = req.usuario.idUsuario;
    await existePerfilAlta(usuario, perfil)
        .then(results => {
            console.log(results)
            if (results.length !== 0) {
                res.status(409)
                res.send(JSON.stringify({ status: 'bloqueado', mensaje: 'PIN: El usuario ya posee el perfil que intenta asignar.', error: 'Petición no permitida.' }))
                res.end();
            }
            else {
                req.perfil = perfil;
                next()
            }
        })
        .catch(err => { throw new Error(err) })
}

async function checkUsuarioPINAltaDeUsuario(req, res, next) {
    let usuario = parseInt(req.body.usuario);
    await existeUsuarioEnPIN(usuario)
        .then(results => {
            if (results.length === 0) {
                next()
            }
            else {
                res.writeHead(409, { 'Content-Type': 'application/json' });
                res.write(JSON.stringify({ status: 'bloqueado', mensaje: "El usuario ingresado ya existe en la plataforma PIN." }));
                res.end();

                //res.status(409).end({ error: "El usuario ingresado ya existe en la plataforma PIN." })
            }
        })
        .catch(err => { throw new Error(err) })
}

async function checkExistenPermisosAlta(req, res, next) {
    let usuario = req.body.idCuenta;
    await existePermisosUsuario(usuario)
        .then(results => {
            console.log("PermisosAlta",results)
            if (results.length === 0) {
                next()
            }
            else {
                //Si ya tiene permisos, verifico que dentro del array de los permisos no exista un ítem igual al que se quiere ingresar
                if (results.filter(n => n.idSeccion === req.body.permisosCargaUsuario.idSeccion &&
                    n.idNormaTipo === req.body.permisosCargaUsuario.idNormaTipo &&
                    n.idReparticion === req.body.permisosCargaUsuario.idReparticion &&
                    n.nombre === req.body.nombre && n.sigla === req.body.sigla).length === 0){
                    next()
                }
                else {
                    throw JSON.stringify({ status: 'bloqueado', mensaje: "El usuario ingresado ya tiene permisos en la plataforma PIN." })
                }
            }
        })
        .catch(err => { console.log(err); res.status(409).send(err) })
}

async function checkReparticionesAlta(req, res, next) {
    let usuario = req.usuario.idUsuario;
    await existeReparticionesUsuario(usuario)
        .then(results => {
            if (results.length === 0) {
                next()
            }
            else {
                res.writeHead(409, { 'Content-Type': 'application/json' });
                res.write(JSON.stringify({ status: 'bloqueado', mensaje: "El usuario ingresado ya tiene asignadas reparticiones en la plataforma PIN." }));
                res.end();
                //res.status(409).end({ error: "El usuario ingresado ya existe en la plataforma PIN." })
            }
        })
        .catch(err => { throw new Error(err) })
}

async function checkExistenPermisos(req, res, next) {
    let usuario = req.body.idCuenta;
    await existePermisosUsuario(usuario)
        .then(results => {
            if (results.length === 0) {

                res.writeHead(409, { 'Content-Type': 'application/json' });
                res.write(JSON.stringify({ status: 'bloqueado', mensaje: "El usuario ingresado no tiene permisos de usuario asignados." }));
                res.end();
                //res.status(409).end({ error: "El usuario ingresado ya existe en la plataforma PIN." })
            }
            else {
                next()

            }
        })
        .catch(err => { throw new Error(err) })
}


function getUsuarioSDIN(usuario) {
    return new Promise((resolve, reject) => {

        let sql = `SELECT idUsuario AS idUsuarioSDIN, usuario, email, apellidoNombre, estadoUsuario 
            FROM sdin_usuarios WHERE usuario=? AND estadoUsuario = 1`;
        let params = [usuario];

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

function getUsuarioBO(usuario) {
    return new Promise((resolve, reject) => {

        let sql = `SELECT idUsuario AS idUsuarioBO, usuario, email, apellidoNombre, existeEnSADE, estadoUsuario
        FROM bo_usuarios
        WHERE usuario=? AND estadoUsuario = 1 AND idCuenta IS NOT NULL`;
        let params = [usuario];

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

function getCuenta(usuario) {
    return new Promise((resolve, reject) => {

        let sql = `SELECT bo_cuentas.* 
        FROM bo_cuentas 
        LEFT OUTER JOIN bo_usuarios ON bo_cuentas.idCuenta = bo_usuarios.idCuenta
        WHERE bo_usuarios.usuario=?
        AND bo_usuarios.estadoUsuario = 1 
        AND bo_cuentas.estado=1`;
        let params = [usuario];

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

function existePerfil(idUsuariosPerfil) {
    return new Promise((resolve, reject) => {

        let sql = "SELECT * FROM perm_usuarios_perfiles WHERE idUsuariosPerfil=? AND estado = 1";
        let params = [idUsuariosPerfil];

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

function existePerfilAlta(idUsuario, idPerfil) {
    return new Promise((resolve, reject) => {

        let sql = "SELECT * FROM perm_usuarios_perfiles WHERE idUsuario=? AND idPerfil=? AND estado = 1";
        let params = [idUsuario, idPerfil];

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
function existePermisosUsuario(idCuenta) {
    return new Promise((resolve, reject) => {

        let sql = "SELECT * FROM bo_permisos_carga_cuentas a WHERE a.idCuenta = ? AND a.estado = 1 LIMIT 1";
        let params = [idCuenta];

        console.log(idCuenta)

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
function existeReparticionesUsuario(idUsuario) {
    return new Promise((resolve, reject) => {

        let sql = "SELECT * FROM perm_usuarios_reparticiones a WHERE a.idUsuario = ? AND a.estado = 1 LIMIT 1";
        let params = [idUsuario];

        console.log(idUsuario)

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
module.exports = { checkReparticionesAlta, checkJSONValidoPermisosReparticion, checkUsuarioPIN, checkUsuarioPINAltaDeUsuario, checkUsuarioPINPerfil, checkExistePerfilDeUsuario, checkExistePerfilDeUsuarioAlta, checkExistenPermisosAlta, checkJSONValidoPermisos, checkExistenPermisos };