const organismosModel = require('../../models/organismos/OrganismosModel')


async function traerJerarquia(request) {
    return new Promise((resolve, reject) => {
        organismosModel.traerJerarquia(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}
async function traerReparticionesBO(request) {
    return new Promise((resolve, reject) => {
        organismosModel.traerReparticionesBO(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}
async function traerReparticionPorId(request) {
    return new Promise((resolve, reject) => {
        organismosModel.traerReparticionPorId(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}
async function traerJerarquiaPorId(request) {
    return new Promise((resolve, reject) => {
        organismosModel.traerJerarquiaPorId(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}
async function crearJerarquia(request) {
    return new Promise((resolve, reject) => {
        organismosModel.crearJerarquia(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}
async function crearReparticion(request) {
    return new Promise((resolve, reject) => {
        organismosModel.crearReparticion(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}
async function borrarJerarquiaPorId(request) {
    return new Promise((resolve, reject) => {
        organismosModel.borrarJerarquiaPorId(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}
async function borrarReparticionPorId(request) {
    return new Promise((resolve, reject) => {
        organismosModel.borrarReparticionPorId(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerOrganismosEmisores(request) {
    return new Promise((resolve, reject) => {
        organismosModel.traerOrganismosEmisores(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerOrganismosEmisoresExterno(request) {
    return new Promise((resolve, reject) => {
        organismosModel.traerOrganismosEmisoresExterno(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function crearOrganismosEmisores(request) {
    return new Promise((resolve, reject) => {
        organismosModel.crearOrganismosEmisores(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function editarOrganismosEmisores(request) {
    return new Promise((resolve, reject) => {
        organismosModel.editarOrganismosEmisores(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function eliminarOrganismosEmisores(request) {
    return new Promise((resolve, reject) => {
        organismosModel.eliminarOrganismosEmisores(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}
module.exports =    {  
    traerJerarquia,
    traerJerarquiaPorId,
    crearJerarquia,
    borrarJerarquiaPorId,
    traerReparticionesBO,
    traerReparticionPorId,
    crearReparticion,
    borrarReparticionPorId,
    traerOrganismosEmisores,
    crearOrganismosEmisores,
    editarOrganismosEmisores,
    eliminarOrganismosEmisores,
    traerOrganismosEmisoresExterno
}