const sumarioModel = require('../../models/BO/SumarioModel')
// isEmpty
const { isEmpty } = require('../../helpers/utils')

async function traerSumario(request) {
    return new Promise((resolve, reject) => {
        sumarioModel.traerSumario(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerSecciones(request) {
    return new Promise((resolve, reject) => {
        sumarioModel.traerSecciones(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerTiposDeNormaPorSeccion(request) {
    return new Promise((resolve, reject) => {
        sumarioModel.traerTiposDeNormaPorSeccion(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerReparticiones(request) {
    return new Promise((resolve, reject) => {
        sumarioModel.traerReparticiones(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerSubtipos(request) {
    return new Promise((resolve, reject) => {
        sumarioModel.traerSubtipos(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerSumarioItemPorId(request) {
    return new Promise((resolve, reject) => {
        sumarioModel.traerSumarioItemPorId(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}
async function traerSeccionPorId(request) {
    return new Promise((resolve, reject) => {
        sumarioModel.traerSeccionPorId(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}
async function crearSumarioItem(request) {
    return new Promise((resolve, reject) => {
        sumarioModel.crearSumarioItem(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}
async function crearSeccion(request) {
    return new Promise((resolve, reject) => {
        sumarioModel.crearSeccion(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}
async function mostrarSeccion(request) {
    return new Promise((resolve, reject) => {
        sumarioModel.mostrarSeccion(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}
async function borrarSeccion(request) {
    return new Promise((resolve, reject) => {
        sumarioModel.borrarSeccion(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}
async function borrarSumarioItemPorId(request) {
    return new Promise((resolve, reject) => {
        sumarioModel.borrarSumarioItemPorId(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}
async function borrarSeccionPorId(request) {
    return new Promise((resolve, reject) => {
        sumarioModel.borrarSeccionPorId(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}
async function crearSumarioSubtipo(request) {
    return new Promise((resolve, reject) => {
        sumarioModel.crearSumarioSubtipo(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}
async function borrarSumarioSubtipo(request) {
    return new Promise((resolve, reject) => {
        sumarioModel.borrarSumarioSubtipo(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}
async function crearSumarioReparticion(request) {
    return new Promise((resolve, reject) => {
        sumarioModel.crearSumarioReparticion(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}
async function borrarSumarioReparticion(request) {
    return new Promise((resolve, reject) => {
        sumarioModel.borrarSumarioReparticion(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function actualizarSeccionPorId(request) {
    return new Promise((resolve, reject) => {
        sumarioModel.actualizarSeccionPorId(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function ordenarSecciones(request) {
    return new Promise((resolve, reject) => {
        sumarioModel.ordenarSecciones(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function ordenarNormaTiposSumario(request) {
    return new Promise((resolve, reject) => {
        sumarioModel.ordenarNormaTiposSumario(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function ordenarSubtiposSumario(request) {
    return new Promise((resolve, reject) => {
        sumarioModel.ordenarSubtiposSumario(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function ordenarReparticiones(request) {
    return new Promise((resolve, reject) => {
        sumarioModel.ordenarReparticiones(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerReparticionesPorSeccion(request) {
    return new Promise((resolve, reject) => {
        sumarioModel.traerReparticionesPorSeccion(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function reactivarSubtipo(request) {
    return new Promise((resolve, reject) => {
        sumarioModel.reactivarSubtipo(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function reactivarSumarioItemPorId(request) {
    return new Promise((resolve, reject) => {
        sumarioModel.reactivarSumarioItemPorId(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

module.exports = {
    traerSumario,
    traerSecciones,
    traerTiposDeNormaPorSeccion,
    traerReparticiones,
    traerSubtipos,
    actualizarSeccionPorId,

    traerSumarioItemPorId,
    traerSeccionPorId,
    crearSumarioItem,
    crearSeccion,
    mostrarSeccion,
    borrarSeccion,
    borrarSumarioItemPorId,
    borrarSeccionPorId,
    crearSumarioSubtipo,
    borrarSumarioSubtipo,
    crearSumarioReparticion,
    borrarSumarioReparticion,
    ordenarSecciones,
    ordenarNormaTiposSumario,
    ordenarSubtiposSumario,
    ordenarReparticiones,
    traerReparticionesPorSeccion,
    reactivarSubtipo,
    reactivarSumarioItemPorId
}