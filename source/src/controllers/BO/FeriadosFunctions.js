//----------------- operaciones
const feriadosModel = require('../../models/BO/FeriadosModel')

async function traerFeriadosPorAnio(request) {
    return new Promise((resolve, reject) => {
        feriadosModel.traerFeriadosPorAnio(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}
async function traerFeriadoPorFecha(request) {
    return new Promise((resolve, reject) => {
        feriadosModel.traerFeriadoPorFecha(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}
async function crearFeriado(request) {
    return new Promise((resolve, reject) => {
        feriadosModel.crearFeriado(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}
async function borrarFeriadoPorId(request) {
    return new Promise((resolve, reject) => {
        feriadosModel.borrarFeriadoPorId(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

module.exports = {
    traerFeriadosPorAnio,
    traerFeriadoPorFecha,
    crearFeriado,
    borrarFeriadoPorId
}