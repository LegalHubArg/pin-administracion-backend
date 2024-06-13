//----------------- operaciones
const normasModel = require('../../models/BO/NormasModel')
async function actualizarNorma(request) {
    return new Promise((resolve, reject) => {
        normasModel.actualizarNorma(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}
async function traerNormasDeReparticiones(request) {
    return new Promise((resolve, reject) => {
        normasModel.traerNormasDeReparticiones(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}
async function traerNormasDeCuenta(request) {
    return new Promise((resolve, reject) => {
        normasModel.traerNormasDeCuenta(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}
async function crearNorma(request) {
    return new Promise((resolve, reject) => {
        normasModel.crearNorma(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}
async function crearEstadoNorma(request) {
    return new Promise((resolve, reject) => {
        normasModel.crearEstadoNorma(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}
async function traerNormaPorId(request) {
    return new Promise((resolve, reject) => {
        normasModel.traerNormaPorId(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}
async function traerNormasDelUsuario(request) {
    return new Promise((resolve, reject) => {
        normasModel.traerNormasDelUsuario(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}
async function traerNormasDeReparticionesDelUsuario(request) {
    return new Promise((resolve, reject) => {
        normasModel.traerNormasDeReparticionesDelUsuario(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });

}
async function borrarNorma(request) {
    return new Promise((resolve, reject) => {
        normasModel.borrarNorma(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function crearAnexoNorma(request) {
    return new Promise((resolve, reject) => {
        normasModel.crearAnexoNorma(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function borrarAnexosNorma(request) {
    return new Promise((resolve, reject) => {
        normasModel.borrarAnexosNorma(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerAnexosPorIdNorma(request) {
    return new Promise((resolve, reject) => {
        normasModel.traerAnexosPorIdNorma(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerDigitalizacionPorIdNorma(request) {
    return new Promise((resolve, reject) => {
        normasModel.traerDigitalizacionPorIdNorma(request)
            .then(results => {
                if (results[0]) {
                    resolve(results[0]);
                }
                else {
                    resolve({});
                }

            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function actualizarDigitalizacionPorIdNorma(request) {
    return new Promise((resolve, reject) => {
        normasModel.actualizarDigitalizacionPorIdNorma(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}


async function crearMetadatosNorma(request) {
    return new Promise((resolve, reject) => {
        normasModel.crearMetadatosNorma(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function crearDigitalizacionNorma(request) {
    return new Promise((resolve, reject) => {
        normasModel.crearDigitalizacionNorma(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function crearObservacion(request) {
    return new Promise(async (resolve, reject) => {
        await normasModel.crearObservacion(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerObservacionesMotivos() {
    return new Promise((resolve, reject) => {
        normasModel.traerObservacionesMotivos()
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function revision(request) {
    return new Promise((resolve, reject) => {
        normasModel.revision(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerPrioridades() {
    return new Promise((resolve, reject) => {
        normasModel.traerPrioridades()
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function cambiarEstadoNorma(request) {
    return new Promise((resolve, reject) => {
        normasModel.cambiarEstadoNorma(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function crearEstadoNormaPorTipo(request) {
    return new Promise((resolve, reject) => {
        normasModel.crearEstadoNormaPorTipo(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function borrarEstadoNorma(request) {
    return new Promise((resolve, reject) => {
        normasModel.borrarEstadoNorma(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function asignarPrioridad(request) {
    return new Promise((resolve, reject) => {
        normasModel.asignarPrioridad(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function cotizarNorma(request) {
    return new Promise((resolve, reject) => {
        normasModel.cotizarNorma(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function aprobarNormaParaCotizacion(request) {
    return new Promise((resolve, reject) => {
        normasModel.aprobarNormaParaCotizacion(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}
async function aprobarNorma(request) {
    return new Promise((resolve, reject) => {
        normasModel.aprobarNorma(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function desaprobarNorma(request) {
    return new Promise((resolve, reject) => {
        normasModel.desaprobarNorma(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerObservacionesPorIdUsuario(request) {
    return new Promise((resolve, reject) => {
        normasModel.traerObservacionesPorIdUsuario(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerObservacionPorIdNorma(request) {
    return new Promise((resolve, reject) => {
        normasModel.traerObservacionPorIdNorma(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerTrazabilidadPorIdNorma(request) {
    return new Promise((resolve, reject) => {
        normasModel.traerTrazabilidadPorIdNorma(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerEstadosNormas() {
    return new Promise((resolve, reject) => {
        normasModel.traerEstadosNormas()
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerNormasConFiltro(request) {
    return new Promise((resolve, reject) => {
        normasModel.traerNormasConFiltro(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function republicarNorma(request) {
    return new Promise((resolve, reject) => {
        normasModel.republicarNorma(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerOrganismosConjuntos(request) {
    return new Promise((resolve, reject) => {
        normasModel.traerOrganismosConjuntos(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function editarFechaLimite(request) {
    return new Promise((resolve, reject) => {
        normasModel.editarFechaLimite(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function asociarAviso(request) {
    return new Promise((resolve, reject) => {
        normasModel.asociarAviso(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerAvisoAsociado(request) {
    return new Promise((resolve, reject) => {
        normasModel.traerAvisoAsociado(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function revisarNorma(request) {
    return new Promise((resolve, reject) => {
        normasModel.revisarNorma(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerUsuariosActivosPorIdNorma(request) {
    return new Promise((resolve, reject) => {
        normasModel.traerUsuariosActivosPorIdNorma(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function registrarIngresoEdicion(request) {
    return new Promise((resolve, reject) => {
        normasModel.registrarIngresoEdicion(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerPublicacionesNormaDesdeHasta(request) {
    return new Promise((resolve, reject) => {
        normasModel.traerPublicacionesNormaDesdeHasta(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function guardarRepublicaciones(request) {
    return new Promise((resolve, reject) => {
        normasModel.guardarRepublicaciones(request)
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
        normasModel.traerUsuarios(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerPerfil(request) {
    return new Promise((resolve, reject) => {
        normasModel.traerPerfil(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerCuenta(request) {
    return new Promise((resolve, reject) => {
        normasModel.traerCuenta(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

module.exports = {
    crearMetadatosNorma,
    traerAnexosPorIdNorma,
    crearAnexoNorma,
    traerNormaPorId,
    traerNormasDelUsuario,
    traerNormasDeReparticionesDelUsuario,
    borrarNorma,
    crearNorma,
    traerNormasDeCuenta,
    traerNormasDeReparticiones,
    crearEstadoNorma,
    traerObservacionesMotivos,
    crearObservacion,
    revision,
    traerPrioridades,
    cambiarEstadoNorma,
    crearEstadoNormaPorTipo,
    borrarEstadoNorma,
    asignarPrioridad,
    cotizarNorma,
    aprobarNormaParaCotizacion,
    actualizarNorma,
    aprobarNorma,
    desaprobarNorma,

    borrarAnexosNorma,

    traerObservacionesPorIdUsuario,

    traerObservacionPorIdNorma,
    crearDigitalizacionNorma,
    traerDigitalizacionPorIdNorma,
    actualizarDigitalizacionPorIdNorma,
    traerTrazabilidadPorIdNorma,

    traerEstadosNormas,
    traerNormasConFiltro,
    republicarNorma,
    traerOrganismosConjuntos,
    editarFechaLimite,
    asociarAviso,
    traerAvisoAsociado,
    revisarNorma,
    traerUsuariosActivosPorIdNorma,
    registrarIngresoEdicion,
    traerPublicacionesNormaDesdeHasta,
    guardarRepublicaciones,
    traerUsuarios, traerPerfil, traerCuenta
}