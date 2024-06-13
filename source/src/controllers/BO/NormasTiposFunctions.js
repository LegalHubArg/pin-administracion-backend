//----------------- operaciones
const normasTiposModel = require('../../models/BO/NormasTiposModel')
async function traerNormasTipos() {
    return new Promise((resolve, reject) => {
        normasTiposModel.traerNormasTipos()
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}
async function traerNormaTipoPorId(request) {
    return new Promise((resolve, reject) => {
        normasTiposModel.traerNormaTipoPorId(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}
async function crearNormaTipo(request) {
    return new Promise((resolve, reject) => {
        normasTiposModel.crearNormaTipo(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}
async function borrarNormaTipo(request) {
    return new Promise((resolve, reject) => {
        normasTiposModel.borrarNormaTipo(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function editarNormaTipo(request) {
    return new Promise((resolve, reject) => {
        normasTiposModel.editarNormaTipo(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerTodosNormaTipos(request) {
    return new Promise((resolve, reject) => {
        normasTiposModel.traerTodosNormaTipos(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

module.exports = {
    crearNormaTipo,
    borrarNormaTipo,
    traerNormaTipoPorId,
    traerNormasTipos,
    editarNormaTipo,
    traerTodosNormaTipos
}