const djModel = require('../../models/DJ/DjModel');

async function traerPatologiasNormativas(request) {
    return new Promise((resolve, reject) => {
        djModel.traerPatologiasNormativas(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function guardarAnalisisEpistemologico(request) {
    return new Promise((resolve, reject) => {
        djModel.guardarAnalisisEpistemologico(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerAnexosDJ(request) {
    return new Promise((resolve, reject) => {
        djModel.traerAnexosDJ(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerAnalisisEpistemologico(request) {
    return new Promise((resolve, reject) => {
        djModel.traerAnalisisEpistemologico(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerCausales() {
    return new Promise((resolve, reject) => {
        djModel.traerCausales()
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerTiposAbrogacion() {
    return new Promise((resolve, reject) => {
        djModel.traerTiposAbrogacion()
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function guardarArbolTematico(request) {
    return new Promise((resolve, reject) => {
        djModel.guardarArbolTematico(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerArbolTematico() {
    return new Promise((resolve, reject) => {
        djModel.traerArbolTematico()
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerFormulario1(request) {
    return new Promise((resolve, reject) => {
        djModel.traerFormulario1(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function guardarFormulario1(request) {
    return new Promise((resolve, reject) => {
        djModel.guardarFormulario1(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerFormulario2(request) {
    return new Promise((resolve, reject) => {
        djModel.traerFormulario2(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function guardarFormulario2(request) {
    return new Promise((resolve, reject) => {
        djModel.guardarFormulario2(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerFormulario3(request) {
    return new Promise((resolve, reject) => {
        djModel.traerFormulario3(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function guardarFormulario3(request) {
    return new Promise((resolve, reject) => {
        djModel.guardarFormulario3(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerFormulario4(request) {
    return new Promise((resolve, reject) => {
        djModel.traerFormulario4(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function guardarFormulario4(request) {
    return new Promise((resolve, reject) => {
        djModel.guardarFormulario4(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerFormulario5(request) {
    return new Promise((resolve, reject) => {
        djModel.traerFormulario5(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function guardarFormulario5(request) {
    return new Promise((resolve, reject) => {
        djModel.guardarFormulario5(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerFormulario6(request) {
    return new Promise((resolve, reject) => {
        djModel.traerFormulario6(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function guardarFormulario6(request) {
    return new Promise((resolve, reject) => {
        djModel.guardarFormulario6(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerFormulario7(request) {
    return new Promise((resolve, reject) => {
        djModel.traerFormulario7(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function guardarFormulario7(request) {
    return new Promise((resolve, reject) => {
        djModel.guardarFormulario7(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function normasAnexoIPrevio() {
    return new Promise((resolve, reject) => {
        djModel.normasAnexoIPrevio()
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function normasAnexoIIPrevio() {
    return new Promise((resolve, reject) => {
        djModel.normasAnexoIIPrevio()
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function normasAnexoIIIPrevio() {
    return new Promise((resolve, reject) => {
        djModel.normasAnexoIIIPrevio()
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function normasAnexoIVPrevio() {
    return new Promise((resolve, reject) => {
        djModel.normasAnexoIVPrevio()
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerLeyesDigesto() {
    return new Promise((resolve, reject) => {
        djModel.traerLeyesDigesto()
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function corteDigesto(request) {
    return new Promise((resolve, reject) => {
        djModel.corteDigesto(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerCortesDigesto() {
    return new Promise((resolve, reject) => {
        djModel.traerCortesDigesto()
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function normasAnexoI(request) {
    return new Promise((resolve, reject) => {
        djModel.normasAnexoI(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function normasAnexoII(request) {
    return new Promise((resolve, reject) => {
        djModel.normasAnexoII(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function normasAnexoIII(request) {
    return new Promise((resolve, reject) => {
        djModel.normasAnexoIII(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function normasAnexoIV(request) {
    return new Promise((resolve, reject) => {
        djModel.normasAnexoIV(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerAnexosFirmados(request) {
    return new Promise((resolve, reject) => {
        djModel.traerAnexosFirmados(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function firmarAnexo(request) {
    return new Promise((resolve, reject) => {
        djModel.firmarAnexo(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function editarCorte(request) {
    return new Promise((resolve, reject) => {
        djModel.editarCorte(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function crearLeyDigesto(request) {
    return new Promise((resolve, reject) => {
        djModel.crearLeyDigesto(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

module.exports = {
    guardarAnalisisEpistemologico,
    traerPatologiasNormativas,
    traerAnexosDJ,
    traerAnalisisEpistemologico,
    traerCausales,
    traerTiposAbrogacion,
    guardarArbolTematico,
    traerArbolTematico,
    traerFormulario1,
    guardarFormulario1,
    traerFormulario2,
    guardarFormulario2,
    traerFormulario3,
    guardarFormulario3,
    traerFormulario4,
    guardarFormulario4,
    traerFormulario5,
    guardarFormulario5,
    traerFormulario6,
    guardarFormulario6,
    normasAnexoIPrevio,
    normasAnexoIIPrevio,
    normasAnexoIIIPrevio,
    normasAnexoIVPrevio,
    traerFormulario7,
    guardarFormulario7,
    traerLeyesDigesto,
    corteDigesto,
    traerCortesDigesto,
    normasAnexoI,
    normasAnexoII,
    normasAnexoIII,
    normasAnexoIV,
    traerAnexosFirmados,
    firmarAnexo,
    editarCorte,
    crearLeyDigesto
}