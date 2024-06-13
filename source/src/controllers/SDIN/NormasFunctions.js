const normasModel = require('../../models/SDIN/NormasModel')
async function traerNormasNoPublicadasBO(request) {
    return new Promise((resolve, reject) => {
        normasModel.traerNormasNoPublicadasBO(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerNormasPublicadasBO(request) {
    return new Promise((resolve, reject) => {
        normasModel.traerNormasPublicadasBO(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function importarNormasNoPublicadasBO(request) {
    return new Promise((resolve, reject) => {
        normasModel.importarNormasNoPublicadasBO(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function importarNormasPublicadasBO(request) {
    return new Promise((resolve, reject) => {
        normasModel.importarNormasPublicadasBO(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerNormas(request) {
    return new Promise((resolve, reject) => {
        normasModel.traerNormas(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerNorma(request) {
    return new Promise((resolve, reject) => {
        normasModel.traerNorma(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function crearNormaSDIN(request) {
    return new Promise((resolve, reject) => {
        normasModel.crearNormaSDIN(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerClases() {
    return new Promise((resolve, reject) => {
        normasModel.traerClases()
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerGestion() {
    return new Promise((resolve, reject) => {
        normasModel.traerGestion()
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}
async function traerTiposPublicaciones() {
    return new Promise((resolve, reject) => {
        normasModel.traerTiposPublicaciones()
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function editarNormasSDIN(request) {
    return new Promise((resolve, reject) => {
        normasModel.editarNormasSDIN(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function editarArchivoTextoActualizadoSDIN(request) {
    return new Promise((resolve, reject) => {
        normasModel.editarArchivoTextoActualizadoSDIN(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerTemas() {
    return new Promise((resolve, reject) => {
        normasModel.traerTemas()
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerDescriptoresPorIdNormaSDIN(request) {
    return new Promise((resolve, reject) => {
        normasModel.traerDescriptoresPorIdNormaSDIN(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function agregarDescriptor(request) {
    return new Promise((resolve, reject) => {
        normasModel.agregarDescriptor(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function borrarDescriptor(request) {
    return new Promise((resolve, reject) => {
        normasModel.borrarDescriptor(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}
async function editarDescriptor(request) {
    return new Promise((resolve, reject) => {
        normasModel.editarDescriptor(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}


async function asignarNormas(request) {
    return new Promise((resolve, reject) => {
        normasModel.asignarNormas(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerRelacionesTipos() {
    return new Promise((resolve, reject) => {
        normasModel.traerRelacionesTipos()
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerHistorial(request) {
    return new Promise((resolve, reject) => {
        normasModel.traerHistorial(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerHistorialDJ(request) {
    return new Promise((resolve, reject) => {
        normasModel.traerHistorialDJ(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function crearRelacion(request) {
    return new Promise((resolve, reject) => {
        normasModel.crearRelacion(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerRelacionesDeNorma(request) {
    return new Promise((resolve, reject) => {
        normasModel.traerRelacionesDeNorma(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function editarRelacion(request) {
    return new Promise((resolve, reject) => {
        normasModel.editarRelacion(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function eliminarRelacion(request) {
    return new Promise((resolve, reject) => {
        normasModel.eliminarRelacion(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerDescriptores(request) {
    return new Promise((resolve, reject) => {
        normasModel.traerDescriptores(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function agregarDescriptorNorma(request) {
    return new Promise((resolve, reject) => {
        normasModel.agregarDescriptorNorma(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function eliminarDescriptorNorma(request) {
    return new Promise((resolve, reject) => {
        normasModel.eliminarDescriptorNorma(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerTemasPorIdNormaSDIN(request) {
    return new Promise((resolve, reject) => {
        normasModel.traerTemasPorIdNormaSDIN(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerImagenesPorIdNormaSDIN(request) {
    return new Promise((resolve, reject) => {
        normasModel.traerImagenesPorIdNormaSDIN(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerImagenPorIdNormaSDIN(request) {
    return new Promise((resolve, reject) => {
        normasModel.traerImagenPorIdNormaSDIN(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerRamaPorIdNormaSDIN(request) {
    return new Promise((resolve, reject) => {
        normasModel.traerRamaPorIdNormaSDIN(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerRamas() {
    return new Promise((resolve, reject) => {
        normasModel.traerRamas()
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function agregarTemaNorma(request) {
    return new Promise((resolve, reject) => {
        normasModel.agregarTemaNorma(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function eliminarTemaNorma(request) {
    return new Promise((resolve, reject) => {
        normasModel.eliminarTemaNorma(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function agregarRamaNorma(request) {
    return new Promise((resolve, reject) => {
        normasModel.agregarRamaNorma(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function eliminarRamaNorma(request) {
    return new Promise((resolve, reject) => {
        normasModel.eliminarRamaNorma(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function editarTextoOriginal(request) {
    return new Promise((resolve, reject) => {
        normasModel.editarTextoOriginal(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function editarTextoActualizado(request) {
    return new Promise((resolve, reject) => {
        normasModel.editarTextoActualizado(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function editarTextoOriginal(request) {
    return new Promise((resolve, reject) => {
        normasModel.editarTextoOriginal(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function editarEstadoNormas(request) {
    return new Promise((resolve, reject) => {
        normasModel.editarEstadoNormas(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function checkAprobadoDocumental(request) {
    return new Promise((resolve, reject) => {
        normasModel.checkAprobadoDocumental(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerTemasABM(request) {
    let response = {}
    await normasModel.traerTemasABM(request)
        .then(results => {
            response = results
        })
        .catch(err => {
            throw new Error(err);

        })
    return response;
}

async function agregarTemas(request) {
    let response = {}
    await normasModel.agregarTemas(request)
        .then(results => {
            response = results
        })
        .catch(err => {
            throw new Error(err);

        })
    return response;
}

async function editarTemas(request) {
    let response = {}
    await normasModel.editarTemas(request)
        .then(results => {
            response = results
        })
        .catch(err => {
            throw new Error(err);

        })
    return response;
}

async function eliminarTemas(request) {
    let response = {}
    await normasModel.eliminarTemas(request)
        .then(results => {
            response = results
        })
        .catch(err => {
            throw new Error(err);

        })
    return response;
}

async function habilitarTema(request) {
    let response = {}
    await normasModel.habilitarTema(request)
        .then(results => {
            response = results
        })
        .catch(err => {
            throw new Error(err);

        })
    return response;
}

async function traerClasesABM() {
    return new Promise((resolve, reject) => {
        normasModel.traerClasesABM()
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function agregarClases(request) {
    let response = {}
    await normasModel.agregarClases(request)
        .then(results => {
            response = results
        })
        .catch(err => {
            throw new Error(err);

        })
    return response;
}

async function editarClases(request) {
    let response = {}
    await normasModel.editarClases(request)
        .then(results => {
            response = results
        })
        .catch(err => {
            throw new Error(err);

        })
    return response;
}

async function eliminarClases(request) {
    let response = {}
    await normasModel.eliminarClases(request)
        .then(results => {
            response = results
        })
        .catch(err => {
            throw new Error(err);

        })
    return response;
}

async function traerRelacionesTiposABM() {
    return new Promise((resolve, reject) => {
        normasModel.traerRelacionesTiposABM()
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function agregarRelacionesTipos(request) {
    let response = {}
    await normasModel.agregarRelacionesTipos(request)
        .then(results => {
            response = results
        })
        .catch(err => {
            throw new Error(err);

        })
    return response;
}

async function editarRelacionesTipos(request) {
    let response = {}
    await normasModel.editarRelacionesTipos(request)
        .then(results => {
            response = results
        })
        .catch(err => {
            throw new Error(err);

        })
    return response;
}

async function eliminarRelacionesTipos(request) {
    let response = {}
    await normasModel.eliminarRelacionesTipos(request)
        .then(results => {
            response = results
        })
        .catch(err => {
            throw new Error(err);

        })
    return response;
}

async function traerJerarquiaTemas() {
    let response = {}
    await normasModel.traerJerarquiaTemas()
        .then(results => {
            response = results
        })
        .catch(err => {
            throw new Error(err);
        })
    return response;
}

async function traerJerarquiaNorma() {
    let response = {}
    await normasModel.traerJerarquiaNorma()
        .then(results => {
            response = results
        })
        .catch(err => {
            throw new Error(err);
        })
    return response;
}

async function traerRamasABM() {
    return new Promise((resolve, reject) => {
        normasModel.traerRamasABM()
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function agregarRamas(request) {
    let response = {}
    await normasModel.agregarRamas(request)
        .then(results => {
            response = results
        })
        .catch(err => {
            throw new Error(err);

        })
    return response;
}

async function editarRamas(request) {
    let response = {}
    await normasModel.editarRamas(request)
        .then(results => {
            response = results
        })
        .catch(err => {
            throw new Error(err);

        })
    return response;
}

async function eliminarRamas(request) {
    let response = {}
    await normasModel.eliminarRamas(request)
        .then(results => {
            response = results
        })
        .catch(err => {
            throw new Error(err);
        })
    return response;
}

async function crearJerarquiaTemas(request) {
    let response = {}
    await normasModel.crearJerarquiaTemas(request)
        .then(results => {
            response = results
        })
        .catch(err => {
            throw new Error(err);
        })
    return response;
}

async function traerCausalesABM() {
    return new Promise((resolve, reject) => {
        normasModel.traerCausalesABM()
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function agregarCausales(request) {
    let response = {}
    await normasModel.agregarCausales(request)
        .then(results => {
            response = results
        })
        .catch(err => {
            throw new Error(err);
        })
    return response;
}

async function borrarJerarquiaTemas(request) {
    let response = {}
    await normasModel.borrarJerarquiaTemas(request)
        .then(results => {
            response = results
        })
        .catch(err => {
            throw new Error(err);

        })
    return response;
}

async function editarCausales(request) {
    let response = {}
    await normasModel.editarCausales(request)
        .then(results => {
            response = results
        })
        .catch(err => {
            throw new Error(err);

        })
    return response;
}

async function eliminarCausales(request) {
    let response = {}
    await normasModel.eliminarCausales(request)
        .then(results => {
            response = results
        })
        .catch(err => {
            throw new Error(err);

        })
    return response;
}

async function traerPatologiasABM() {
    return new Promise((resolve, reject) => {
        normasModel.traerPatologiasABM()
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function agregarPatologias(request) {
    let response = {}
    await normasModel.agregarPatologias(request)
        .then(results => {
            response = results
        })
        .catch(err => {
            throw new Error(err);

        })
    return response;
}

async function editarPatologias(request) {
    let response = {}
    await normasModel.editarPatologias(request)
        .then(results => {
            response = results
        })
        .catch(err => {
            throw new Error(err);

        })
    return response;
}

async function eliminarPatologias(request) {
    let response = {}
    await normasModel.eliminarPatologias(request)
        .then(results => {
            response = results
        })
        .catch(err => {
            throw new Error(err);

        })
    return response;
}

async function publicarNormaFront(request) {
    let response = {}
    await normasModel.publicarNormaFront(request)
        .then(results => {
            response = results
        })
        .catch(err => {
            throw new Error(err);

        })
    return response;
}

async function normaTiposSDIN(request) {
    let response = {}
    await normasModel.normaTiposSDIN(request)
        .then(results => {
            response = results
        })
        .catch(err => {
            throw new Error(err);

        })
    return response;
}

async function editarNormasTiposSDIN(request) {
    let response = {}
    await normasModel.editarNormaTipoSDIN(request)
        .then(results => {
            response = results
        })
        .catch(err => {
            throw new Error(err);

        })
    return response;
}

async function eliminarNormasTiposSDIN(request) {
    let response = {}
    await normasModel.eliminarNormasTiposSDIN(request)
        .then(results => {
            response = results
        })
        .catch(err => {
            throw new Error(err);

        })
    return response;
}

async function agregarNormasTiposSDIN(request) {
    let response = {}
    await normasModel.agregarNormasTiposSDIN(request)
        .then(results => {
            response = results
        })
        .catch(err => {
            throw new Error(err);

        })
    return response;
}

async function agregarDependenciasSDIN(request) {
    let response = {}
    await normasModel.agregarDependenciasSDIN(request)
        .then(results => {
            response = results
        })
        .catch(err => {
            throw new Error(err);

        })
    return response;
}

async function editarDependenciasSDIN(request) {
    let response = {}
    await normasModel.editarDependenciasSDIN(request)
        .then(results => {
            response = results
        })
        .catch(err => {
            throw new Error(err);

        })
    return response;
}

async function eliminarDependenciasSDIN(request) {
    let response = {}
    await normasModel.eliminarDependenciasSDIN(request)
        .then(results => {
            response = results
        })
        .catch(err => {
            throw new Error(err);

        })
    return response;
}

async function normaSubtiposSDIN(request) {
    let response = {}
    await normasModel.normaSubtiposSDIN(request)
        .then(results => {
            response = results
        })
        .catch(err => {
            throw new Error(err);

        })
    return response;
}

async function borrarNormasSDIN(request) {
    let response = {}
    await normasModel.borrarNormasSDIN(request)
        .then(results => {
            response = results
        })
        .catch(err => {
            throw new Error(err);

        })
    return response;
}
async function borrarPublicacion(request) {
    let response = {}
    await normasModel.borrarPublicacion(request)
        .then(results => {
            response = results
        })
        .catch(err => {
            throw new Error(err);

        })
    return response;
}

async function agregarAnexo(request) {
    let response = {}
    await normasModel.agregarAnexo(request)
        .then(results => {
            response = results
        })
        .catch(err => {
            throw new Error(err);

        })
    return response;
}

async function borrarAnexo(request) {
    let response = {}
    await normasModel.borrarAnexo(request)
        .then(results => {
            response = results
        })
        .catch(err => {
            throw new Error(err);

        })
    return response;
}

async function agregarAdjunto(request) {
    let response = {}
    await normasModel.agregarAdjunto(request)
        .then(results => {
            response = results
        })
        .catch(err => {
            throw new Error(err);

        })
    return response;
}

async function borrarAdjunto(request) {
    let response = {}
    await normasModel.borrarAdjunto(request)
        .then(results => {
            response = results
        })
        .catch(err => {
            throw new Error(err);

        })
    return response;
}

async function traerDependencias(request) {
    let response = {}
    await normasModel.traerDependencias(request)
        .then(results => {
            response = results
        })
        .catch(err => {
            throw new Error(err);

        })
    return response;
}

async function traerOrganismos(request) {
    let response = {}
    await normasModel.traerOrganismos(request)
        .then(results => {
            response = results
        })
        .catch(err => {
            throw new Error(err);

        })
    return response;
}

async function agregarDependenciaNormas(request) {
    let response = {}
    await normasModel.agregarDependenciaNormas(request)
        .then(results => {
            response = results
        })
        .catch(err => {
            throw new Error(err);

        })
    return response;
}

async function traerEstadosSDIN() {
    let response = {}
    await normasModel.traerEstadosSDIN()
        .then(results => {
            response = results
        })
        .catch(err => {
            throw new Error(err);

        })
    return response;
}

async function traerNiveles() {
    let response = {}
    await normasModel.traerNiveles()
        .then(results => {
            response = results
        })
        .catch(err => {
            throw new Error(err);

        })
    return response;
}

async function traerTrazabilidad(request) {
    let response = {}
    await normasModel.traerTrazabilidad(request)
        .then(results => {
            response = results
        })
        .catch(err => {
            throw new Error(err);

        })
    return response;
}

async function traerTrazabilidadUsuarios(request) {
    let response = {}
    await normasModel.traerTrazabilidadUsuarios(request)
        .then(results => {
            response = results
        })
        .catch(err => {
            throw new Error(err);

        })
    return response;
}

async function traerTiposTrazabilidad(request) {
    let response = {}
    await normasModel.traerTiposTrazabilidad(request)
        .then(results => {
            response = results
        })
        .catch(err => {
            throw new Error(err);

        })
    return response;
}

async function borrarDependenciaNormas(request) {
    let response = {}
    await normasModel.borrarDependenciaNormas(request)
        .then(results => {
            response = results
        })
        .catch(err => {
            throw new Error(err);

        })
    return response;
}

module.exports = {
    traerNormasNoPublicadasBO,
    traerNormasPublicadasBO,
    importarNormasNoPublicadasBO,
    traerNormas,
    importarNormasPublicadasBO,
    traerNorma,
    crearNormaSDIN, traerClases, traerGestion, traerTiposPublicaciones,
    editarNormasSDIN, asignarNormas, traerRelacionesTipos, crearRelacion,
    traerRelacionesDeNorma, editarRelacion, eliminarRelacion, traerTemas,
    traerDescriptoresPorIdNormaSDIN, agregarDescriptor, traerDescriptores,
    agregarDescriptorNorma, eliminarDescriptorNorma,
    traerTemasPorIdNormaSDIN, traerRamaPorIdNormaSDIN, traerRamas,
    eliminarTemaNorma, agregarTemaNorma, eliminarRamaNorma, agregarRamaNorma,
    editarTextoOriginal, editarTextoActualizado, editarEstadoNormas,
    checkAprobadoDocumental, borrarDescriptor,
    traerTemasABM, agregarTemas, editarTemas, eliminarTemas, habilitarTema,
    traerClasesABM, agregarClases, editarClases, eliminarClases,
    traerRelacionesTiposABM, agregarRelacionesTipos, editarRelacionesTipos, eliminarRelacionesTipos,
    traerJerarquiaTemas, crearJerarquiaTemas, borrarJerarquiaTemas, traerJerarquiaNorma,
    traerRamasABM, agregarRamas, editarRamas, eliminarRamas,
    traerCausalesABM, agregarCausales, editarCausales, eliminarCausales,
    traerPatologiasABM, agregarPatologias, editarPatologias, eliminarPatologias,
    publicarNormaFront, normaTiposSDIN, borrarNormasSDIN, borrarPublicacion,
    normaSubtiposSDIN, agregarAnexo, borrarAnexo, traerDependencias, traerOrganismos, traerHistorial, traerHistorialDJ,
    editarNormasTiposSDIN,eliminarNormasTiposSDIN,agregarNormasTiposSDIN,
    agregarDependenciasSDIN,editarDependenciasSDIN,eliminarDependenciasSDIN, agregarDependenciaNormas,
    traerEstadosSDIN, traerNiveles, editarArchivoTextoActualizadoSDIN, traerTrazabilidad, traerTrazabilidadUsuarios,
    traerImagenesPorIdNormaSDIN, traerImagenPorIdNormaSDIN, traerTiposTrazabilidad, agregarAdjunto, borrarAdjunto,
    borrarDependenciaNormas,editarDescriptor
}