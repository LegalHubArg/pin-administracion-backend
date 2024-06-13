//----------------- operaciones
const normasSubtiposModel = require('../../models/BO/NormasSubtiposModel')
async function traerNormasSubtipos(request) {
    return new Promise((resolve, reject) => {
        normasSubtiposModel.traerNormasSubtipos(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}
async function traerNormaSubtipoPorId(request) {
    return new Promise((resolve, reject) => {
        normasSubtiposModel.traerNormaSubtipoPorId(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}
async function crearNormaSubtipo(request) {
    return new Promise((resolve, reject) => {
        normasSubtiposModel.crearNormaSubtipo(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}
async function borrarNormaSubtipo(request) {
    return new Promise((resolve, reject) => {
        normasSubtiposModel.borrarNormaSubtipo(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function editarNormaSubtipo(request) {
    return new Promise((resolve, reject) => {
        normasSubtiposModel.editarNormaSubtipo(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

module.exports =    {  
                        crearNormaSubtipo, 
                        borrarNormaSubtipo, 
                        traerNormaSubtipoPorId, 
                        traerNormasSubtipos,
                        editarNormaSubtipo 
                    }