const BoletinModel = require('../../models/BO/BoletinModel')
const { generarBoletinPDF, generarBoletinPrevioPDF, generarNormaPDF, generarSeparataPDF, generarBoletinPrevioDoc } = require('../../helpers/pdf-boletin')

//const html_to_pdf = require('html-pdf-node');
const pdf = require("html-pdf");

async function crearBoletin(request) {
    return new Promise((resolve, reject) => {
        BoletinModel.crearBoletin(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerNormasOrdenadasDeUnBoletin(request) {
    
    return new Promise(async (resolve, reject) => {
        BoletinModel.traerNormasOrdenadasDeUnBoletin(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
        
}

async function traerHTMLDeUnBoletin(request) {
    
    return new Promise(async (resolve, reject) => {
        BoletinModel.traerHTMLDeUnBoletin(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
        
}

async function traerNormaParaPDF(request) {
    
    return new Promise((resolve, reject) => {
        BoletinModel.traerNormaParaPDF(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerVistaPreviaBoletin(request) {
    return new Promise(async (resolve, reject) => {
        try {
            /* let normas = request.normas;
            let numero = request.boletinNumero;
            let fechaPublicacion = request.fechaPublicacion; */
            let pdf = await generarBoletinPrevioPDF(request)
            resolve(pdf);
        }
        catch (err) {
            reject(new Error(err));
        }
        });
}

async function traerVistaPreviaDocBoletin(request) {
    return new Promise(async (resolve, reject) => {
        try {
            /* let normas = request.normas;
            let numero = request.boletinNumero;
            let fechaPublicacion = request.fechaPublicacion; */
            let doc = await generarBoletinPrevioDoc(request)
            resolve(doc);
        }
        catch (err) {
            reject(new Error(err));
        }
        });
}

async function traerBoletinPDF(request) {
    return new Promise(async (resolve, reject) => {
        try {
            /* let normas = request.normas;
            let numero = request.boletinNumero;
            let fechaPublicacion = request.fechaPublicacion; */
            let pdf = await generarBoletinPDF(request)
            resolve(pdf);
        }
        catch (err) {
            reject(new Error(err));
        }
        });
}
async function traerSeparataPDF(request) {
    return new Promise(async (resolve, reject) => {
        try {
            /* let normas = request.normas;
            let numero = request.boletinNumero;
            let fechaPublicacion = request.fechaPublicacion; */
            let pdf = await generarSeparataPDF(request)
            resolve(pdf);
        }
        catch (err) {
            reject(new Error(err));
        }
        });
}
async function traerVistaPreviaNorma(request) {
    return new Promise(async (resolve, reject) => {
        try {
            //console.log(request)
            let pdf = await generarNormaPDF(request)
            resolve(pdf);
        }
        catch (err) {
            reject(new Error(err));
        }
        });
}

async function traerNormasPorFechaLimite(request) {
    return new Promise((resolve, reject) => {
        BoletinModel.traerNormasPorFechaLimite(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerBoletinesEnEdicion(request) {
    return new Promise((resolve, reject) => {
        BoletinModel.traerBoletinesEnEdicion(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerNormasPorFechaOrdenadasPorSumario(request) {
    return new Promise((resolve, reject) => {
        BoletinModel.traerNormasPorFechaOrdenadasPorSumario(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}
async function traerNormasPorFechaPublicacionOrdenadasPorSumario(request) {
    return new Promise((resolve, reject) => {
        BoletinModel.traerNormasPorFechaPublicacionOrdenadasPorSumario(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerBoletinPorId(request) {
    return new Promise((resolve, reject) => {
        BoletinModel.traerBoletinPorId(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerNormasPorFechaPublicacionSeccion(request) {
    return new Promise((resolve, reject) => {
        BoletinModel.traerNormasPorFechaPublicacionSeccion(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function editarBoletin(request) {
    return new Promise((resolve, reject) => {
        BoletinModel.editarBoletin(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function existeBoletinPorFecha(request) {
    return new Promise((resolve, reject) => {
        BoletinModel.existeBoletinPorFecha(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function cambiarEstadoBoletin(request) {
    return new Promise((resolve, reject) => {
        BoletinModel.cambiarEstadoBoletin(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerUltimoBoletinPublicado() {
    return new Promise((resolve, reject) => {
        BoletinModel.traerUltimoBoletinPublicado()
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function descargarBoletin(request) {
    return new Promise((resolve, reject) => {
        BoletinModel.descargarBoletin(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function publicarBoletin(request) {
    return new Promise((resolve, reject) => {
        BoletinModel.publicarBoletin(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function anularDescargaBoletin(request) {
    return new Promise((resolve, reject) => {
        BoletinModel.anularDescargaBoletin(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function firmarBoletin(request) {
    return new Promise((resolve, reject) => {
        BoletinModel.firmarBoletin(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerDocumentosPublicados(request) {
    return new Promise((resolve, reject) => {
        BoletinModel.traerDocumentosPublicados(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function anularFirma(request) {
    return new Promise((resolve, reject) => {
        BoletinModel.anularFirma(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function republicarBoletin(request) {
    return new Promise((resolve, reject) => {
        BoletinModel.republicarBoletin(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function republicarSeparata(request) {
    return new Promise((resolve, reject) => {
        BoletinModel.republicarSeparata(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerNormasBoletinDesdeHasta(request) {
    return new Promise((resolve, reject) => {
        BoletinModel.traerNormasBoletinDesdeHasta(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function borrarBoletin(request) {
    return new Promise((resolve, reject) => {
        BoletinModel.borrarBoletin(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerBoletinesPublicados(request) {
    return new Promise((resolve, reject) => {
        BoletinModel.traerBoletinesPublicados(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

async function traerBoletinPorFechaPublicacion(request) {
    return new Promise((resolve, reject) => {
        BoletinModel.traerBoletinPorFechaPublicacion(request)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(new Error(err));
            })
    });
}

module.exports = {
    crearBoletin,
    traerVistaPreviaBoletin,
    traerNormasOrdenadasDeUnBoletin,
    traerNormasPorFechaLimite,
    traerBoletinesEnEdicion,
    traerNormasPorFechaOrdenadasPorSumario,
    traerNormasPorFechaPublicacionOrdenadasPorSumario,
    traerBoletinPorId,
    traerNormasPorFechaPublicacionSeccion,
    editarBoletin,
    traerNormaParaPDF,
    existeBoletinPorFecha,
    cambiarEstadoBoletin,
    traerVistaPreviaNorma,
    traerUltimoBoletinPublicado,
    descargarBoletin,
    traerHTMLDeUnBoletin,
    traerBoletinPDF,
    traerSeparataPDF,
    publicarBoletin,
    anularDescargaBoletin,
    firmarBoletin,
    traerDocumentosPublicados,
    anularFirma,
    republicarBoletin,
    republicarSeparata,
    traerNormasBoletinDesdeHasta,
    traerVistaPreviaDocBoletin,
    borrarBoletin,
    traerBoletinesPublicados,
    traerBoletinPorFechaPublicacion
}
