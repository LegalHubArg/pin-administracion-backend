//----------------- operaciones
const usuariosModel = require('../../models/usuarios/usuariosModel')
async function crearReparticionesUsuario(request) {
    return new Promise((resolve, reject) => {
        usuariosModel.crearReparticionesUsuario(request)
            .then(results => {

                resolve(results);


            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}
async function borrarReparticionesUsuario(request) {
    return new Promise((resolve, reject) => {
        usuariosModel.borrarReparticionesUsuario(request)
            .then(results => {

                resolve(results);


            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}
async function crearPermisoReparticion(request) {
    return new Promise((resolve, reject) => {
        usuariosModel.crearPermisoReparticion(request)
            .then(results => {

                resolve(results);


            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}
async function traerPermisosReparticion(request) {
    return new Promise((resolve, reject) => {
        usuariosModel.traerPermisosReparticion(request)
            .then(results => {

                resolve(results);


            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}
async function borrarPermisoUsuario(request) {
    return new Promise((resolve, reject) => {
        usuariosModel.borrarPermisoUsuario(request)
            .then(results => {

                resolve(results);


            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}
async function borrarPermisoReparticion(request) {
    return new Promise((resolve, reject) => {
        usuariosModel.borrarPermisoReparticion(request)
            .then(results => {

                resolve(results);


            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}
async function crearPermisoUsuario(request) {
    return new Promise((resolve, reject) => {
        usuariosModel.crearPermisoUsuario(request)
            .then(results => {
                resolve(results);


            })
            .catch(err => {
                reject(new Error(JSON.stringify(err)));
            })
    });
}

async function traerPermisosBOCargaPorId(request) {
    return new Promise((resolve, reject) => {
        usuariosModel.traerPermisosBOCargaPorId(request)
            .then(results => {

                resolve(results);


            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}
async function traerUsuarios(request) {
    return new Promise((resolve, reject) => {
        usuariosModel.traerUsuarios(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}
async function traerReparticionesUsuario(request) {
    return new Promise((resolve, reject) => {
        usuariosModel.traerReparticionesUsuario(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}
async function nuevoUsuario(request) {
    let response = {}
    await usuariosModel.agregarUsuario(request)
        .then(results => {
            response = results
        })
        .catch(err => {
            throw new Error(err);

        })
    return response;
}

async function editarUsuario(request) {
    let response = {}
    await usuariosModel.editarUsuario(request)
        .then(results => {
            response = results
        })
        .catch(err => {
            throw new Error(err);

        })
    return response;
}
async function eliminarUsuario(request) {
    let response = {}
    await usuariosModel.eliminarUsuario(request)
        .then(results => {
            response = results
        })
        .catch(err => {
            throw new Error(err);

        })
    return response;
}

async function getPerfilesUsuario(request) {
    let response = {}
    await usuariosModel.getPerfilesUsuario(request)
        .then(results => {
            response = results
        })
        .catch(err => {
            throw new Error(err);

        })
    return response;
}

async function getPerfilVistas(request) {
    let response = {}
    await usuariosModel.getPerfilVistas(request)
        .then(results => {
            response = results
        })
        .catch(err => {
            throw new Error(err);

        })
    return response;
}

async function traerPerfiles() {
    return new Promise((resolve, reject) => {
        usuariosModel.traerPerfiles()
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function asignarPerfilUsuario(request) {
    let response = {}
    await usuariosModel.asignarPerfilUsuario(request)
        .then(results => {
            response = results
        })
        .catch(err => {
            throw new Error(err);

        })
    return response;
}

async function eliminarPerfilUsuario(request) {
    let response = {}
    await usuariosModel.eliminarPerfilUsuario(request)
        .then(results => {
            response = results
        })
        .catch(err => {
            throw new Error(err);

        })
    return response;
}

async function traerUsuarioPorId(request) {
    let response = {}
    await usuariosModel.traerUsuarioPorId(request)
        .then(results => {
            response = results
        })
        .catch(err => {
            throw new Error(err);

        })
    return response;
}

async function traerUsuariosSDIN(request) {
    let response = {}
    await usuariosModel.traerUsuariosSDIN(request)
        .then(results => {
            response = results
        })
        .catch(err => {
            throw new Error(err);

        })
    return response;
}

async function editarUsuarioSDIN(request) {
    let response = {}
    await usuariosModel.editarUsuarioSDIN(request)
        .then(results => {
            response = results
        })
        .catch(err => {
            throw new Error(err);

        })
    return response;
}

async function borrarUsuarioSDIN(request) {
    let response = {}
    await usuariosModel.borrarUsuarioSDIN(request)
        .then(results => {
            response = results
        })
        .catch(err => {
            throw new Error(err);

        })
    return response;
}

async function reactivarUsuarioSDIN(request) {
    let response = {}
    await usuariosModel.reactivarUsuarioSDIN(request)
        .then(results => {
            response = results
        })
        .catch(err => {
            throw new Error(err);

        })
    return response;
}

async function crearUsuarioSDIN(request) {
    let response = {}
    await usuariosModel.crearUsuarioSDIN(request)
        .then(results => {
            response = results
        })
        .catch(err => {
            throw new Error(err);

        })
    return response;
}

async function traerUsuarioSDIN(request) {
    let response = {}
    await usuariosModel.traerUsuarioSDIN(request)
        .then(results => {
            response = results
        })
        .catch(err => {
            throw new Error(err);

        })
    return response;
}

async function asignarPerfilUsuarioSDIN(request) {
    let response = {}
    await usuariosModel.asignarPerfilUsuarioSDIN(request)
        .then(results => {
            response = results
        })
        .catch(err => {
            throw new Error(err);

        })
    return response;
}

async function borrarPerfilUsuarioSDIN(request) {
    let response = {}
    await usuariosModel.borrarPerfilUsuarioSDIN(request)
        .then(results => {
            response = results
        })
        .catch(err => {
            throw new Error(err);

        })
    return response;
}

module.exports = {
    borrarReparticionesUsuario,
    crearReparticionesUsuario,
    traerReparticionesUsuario,
    crearPermisoReparticion,
    traerPermisosReparticion,
    borrarPermisoUsuario,
    borrarPermisoReparticion,
    crearPermisoUsuario,
    nuevoUsuario,
    editarUsuario,
    eliminarUsuario,
    getPerfilesUsuario,
    getPerfilVistas,
    traerPermisosBOCargaPorId,
    traerUsuarios,
    traerPerfiles,
    asignarPerfilUsuario,
    eliminarPerfilUsuario,
    traerUsuarioPorId,
    traerUsuariosSDIN,
    editarUsuarioSDIN,
    borrarUsuarioSDIN,
    crearUsuarioSDIN,
    traerUsuarioSDIN,
    asignarPerfilUsuarioSDIN,
    borrarPerfilUsuarioSDIN,
    reactivarUsuarioSDIN
}