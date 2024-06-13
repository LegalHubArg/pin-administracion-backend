const { traerPatologiasNormativas, guardarAnalisisEpistemologico, traerAnexosDJ,
    traerAnalisisEpistemologico, traerCausales, traerTiposAbrogacion, guardarArbolTematico,
    traerFormulario1, guardarFormulario1, traerFormulario2, guardarFormulario2,
    traerFormulario3, guardarFormulario3, traerArbolTematico, traerFormulario4,
    guardarFormulario4, traerFormulario5, guardarFormulario5, traerFormulario6,
    guardarFormulario6, traerFormulario7, guardarFormulario7, normasAnexoIPrevio, normasAnexoIIPrevio,
    normasAnexoIIIPrevio, normasAnexoIVPrevio, traerLeyesDigesto, traerCortesDigesto,
    normasAnexoI, normasAnexoII, normasAnexoIII, normasAnexoIV, traerAnexosFirmados, firmarAnexo, editarCorte, crearLeyDigesto } = require('./djFunctions.js');
const { subirArchivo, traerArchivo } = require('../../helpers/functionsS3')
const { generarListadoAnexoI, generarAnexoIPorRama, generarAnexoII, generarAnexoIII, generarAnexoIV } = require('./anexosFunctions')
let moment = require('moment')
const { PDFDocument, StandardFonts, rgb, PageSizes } = require("pdf-lib");
const html_pdf = require("html-pdf");
let { pdfToDoc } = require('../../helpers/convertirArchivos');
const libre = require('libreoffice-convert');
libre.convertAsync = require('util').promisify(libre.convert);
const { exec } = require("child_process");
const { corteDigesto } = require('../../models/DJ/DjModel.js');
const { firmaDirectaDocumento } = require('../../helpers/consultaGEDO')

async function traerPatologiasNormativasController(req, res, next) {
    let response;
    try {
        await traerPatologiasNormativas()
            .then(res => {
                response = res;
            })
            .catch((e) => {
                throw ({ mensaje: "PIN: Error al traer las Patologías Normativas.", data: e })
            });

        res.status(200)
        res.send(JSON.stringify({ mensaje: `PIN: patologías Normativas:`, response }))
        res.end();
        return;
    }
    catch (e) {
        console.log(e)
        res.status(409)
        res.send(JSON.stringify({ e }))
        res.end();
        return;
    }
}

async function guardarAnalisisEpistemologicoController(req, res, next) {
    let request = {
        idNormaSDIN: Number(req.body.idNormaSDIN),
        formulario1: Number(req.body.abrogacion),
        formulario2: Number(req.body.conflictos_normativos),
        formulario3: Number(req.body.perdida_vigencia_juridica),
        formulario4: Number(req.body.necesidad_refundir),
        formulario5: Number(req.body.necesidad_abrogacion),
        formulario6: Number(req.body.texto_definitivo),
        formulario7: Number(req.body.antecedentes_equivalencias),
        aprobadoEpistemologicamente: Number(req.body.aprobadoEpistemologicamente),
        idAnexoDJ: isNaN(parseInt(req.body.idAnexoDJ)) ? null : parseInt(req.body.idAnexoDJ),
        observaciones: req.body.observaciones,
        usuarioCarga: isNaN(parseInt(req.body.idUsuario)) ? null : parseInt(req.body.idUsuario)
    };
    try {
        await guardarAnalisisEpistemologico(request)
            .then(res => {
                response = res;
            })
            .catch((e) => {
                throw ({ mensaje: "PIN: Error al guardar el analisis epistemologico.", data: e })
            });

        res.status(200)
        res.send(JSON.stringify({ mensaje: `PIN: Análisis epistemologico guardado correctamente:`, response }))
        res.end();
        return;
    }
    catch (e) {
        console.log(e)
        res.status(409)
        res.send(JSON.stringify({ e }))
        res.end();
        return;
    }
}

async function traerAnexosDJController(req, res, next) {
    let data;
    try {
        await traerAnexosDJ()
            .then(res => {
                data = res;
            })
            .catch((e) => {
                throw ({ mensaje: "PIN: Error al traer anexos DJ.", data: e })
            });

        res.status(200)
        res.send(JSON.stringify({ mensaje: `PIN: Anexos:`, data }))
        res.end();
        return;
    }
    catch (e) {
        console.log(e)
        res.status(409)
        res.send(JSON.stringify({ e }))
        res.end();
        return;
    }
}

async function traerAnalisisEpistemologicoController(req, res, next) {
    let data;
    let request = {
        idNormaSDIN: req.body.idNormaSDIN
    }
    try {
        await traerAnalisisEpistemologico(request)
            .then(res => {
                data = res;
            })
            .catch((e) => {
                throw ({ mensaje: "PIN: Error al traer Analisis Epistemológico.", data: e })
            });

        res.status(200)
        res.send(JSON.stringify({ mensaje: `PIN: Analisis Epistemológico:`, data }))
        res.end();
        return;
    }
    catch (e) {
        res.status(409)
        res.send(JSON.stringify({ e }))
        res.end();
        return;
    }
}

async function traerCausalesController(req, res, next) {
    let data;
    try {
        await traerCausales()
            .then(res => {
                data = res;
            })
            .catch((e) => {
                throw ({ mensaje: "PIN: Error al traer Causales.", data: e })
            });

        res.status(200)
        res.send(JSON.stringify({ mensaje: `PIN: Causales:`, data }))
        res.end();
        return;
    }
    catch (e) {
        res.status(409)
        res.send(JSON.stringify({ e }))
        res.end();
        return;
    }
}

async function traerTiposAbrogacionController(req, res, next) {
    let data;
    try {
        await traerTiposAbrogacion()
            .then(res => {
                data = res;
            })
            .catch((e) => {
                throw ({ mensaje: "PIN: Error al traer tipos de abrogacion.", data: e })
            });

        res.status(200)
        res.send(JSON.stringify({ mensaje: `PIN: Tipos de Abrogacion:`, data }))
        res.end();
        return;
    }
    catch (e) {
        res.status(409)
        res.send(JSON.stringify({ e }))
        res.end();
        return;
    }
}

async function guardarArbolTematicoController(req, res, next) {
    let data;
    let request = {
        html: req.body.html
    }
    try {
        await guardarArbolTematico(request)
            .then(res => {
                data = res;
            })
            .catch((e) => {
                throw ({ mensaje: "PIN: Error.", data: e })
            });

        res.status(200)
        res.send(JSON.stringify({ mensaje: `PIN:`, data }))
        res.end();
        return;
    }
    catch (e) {
        console.log(e)
        res.status(409)
        res.send(JSON.stringify({ e }))
        res.end();
        return;
    }
}

async function traerArbolTematicoController(req, res, next) {
    let data;
    try {
        await traerArbolTematico()
            .then(res => {
                data = res;
            })
            .catch((e) => {
                throw ({ mensaje: "PIN: Error.", data: e })
            });

        res.status(200)
        res.send(JSON.stringify({ mensaje: `PIN:`, data }))
        res.end();
        return;
    }
    catch (e) {
        console.log(e)
        res.status(409)
        res.send(JSON.stringify({ e }))
        res.end();
        return;
    }
}

async function traerFormulario1Controller(req, res, next) {
    let data;
    let request = {
        idNormaSDIN: parseInt(req.body.idNormaSDIN)
    }
    try {
        await traerFormulario1(request)
            .then(res => {
                data = res;
            })
            .catch((e) => {
                throw ({ mensaje: "PIN: Error al traer el Formulario 1.", data: e })
            });

        res.status(200)
        res.send(JSON.stringify({ mensaje: `PIN: Data formulario 1:`, data }))
        res.end();
        return;
    }
    catch (e) {
        res.status(409)
        res.send(JSON.stringify({ e }))
        res.end();
        return;
    }
}

async function guardarFormulario1Controller(req, res, next) {
    let request = {
        idPatologiaNormativa: req.body.idPatologiaNormativa,
        fundamentacionJuridica: req.body.fundamentacionJuridica,
        solucionAdoptada: req.body.solucionAdoptada,
        observaciones: req.body.observaciones,
        idAbrogacionTipoPasiva: req.body.idAbrogacionTipoPasiva,
        idAbrogacionTipoActiva: req.body.idAbrogacionTipoActiva,
        idNormaActiva: req.body.idNormaActiva,
        detallesPasiva: req.body.detallesPasiva,
        detallesActiva: req.body.detallesActiva,
        archivo: req.body.archivo,
        documentoConsolidado: req.body.documentoConsolidado,
        archivoBase64: req.body.archivoBase64,
        idNormaSDIN: req.body.idNormaSDIN,
        usuario: req.body.usuario,
        archivoS3: req.body.archivoS3 ? req.body.archivoS3 : null,
        idUsuario: req.body.idUsuario
    };
    try {
        if (request.archivoBase64 && request.archivo) {
            let archivoSubido = await subirArchivo(request.archivoBase64, request.usuario, process.env.S3_DIGESTO + request.archivo).catch(error => { throw error })
            request.archivoS3 = archivoSubido['Key'].replace(process.env.S3_DIGESTO, '');
        }

        await guardarFormulario1(request)
            .catch((e) => {
                throw ({ mensaje: "PIN: Error al guardar formulario 1.", data: e })
            });

        res.status(200)
        res.send(JSON.stringify({ mensaje: `PIN: Formulario 1 guardado correctamente.` }))
        res.end();
        return;
    }
    catch (e) {
        res.status(409)
        res.send(JSON.stringify({ e }))
        res.end();
        return;
    }
}

async function traerFormulario2Controller(req, res, next) {
    let data;
    let request = {
        idNormaSDIN: req.body.idNormaSDIN
    }
    try {
        await traerFormulario2(request)
            .then(res => {
                data = res;
            })
            .catch((e) => {
                throw ({ mensaje: "PIN: Error al traer el Formulario 2.", data: e })
            });

        res.status(200)
        res.send(JSON.stringify({ mensaje: `PIN: Data formulario 2:`, data }))
        res.end();
        return;
    }
    catch (e) {
        res.status(409)
        res.send(JSON.stringify({ e }))
        res.end();
        return;
    }
}

async function guardarFormulario2Controller(req, res, next) {
    let request = {
        idPatologiaNormativa: req.body.idPatologiaNormativa,
        fundamentacionJuridica: req.body.fundamentacionJuridica,
        solucionAdoptada: req.body.solucionAdoptada,
        observaciones: req.body.observaciones,
        idAbrogacionTipoPasiva: req.body.idAbrogacionTipoPasiva,
        idAbrogacionTipoActiva: req.body.idAbrogacionTipoActiva,
        detallesPasiva: req.body.detallesPasiva,
        detallesActiva: req.body.detallesActiva,
        idNormaActiva: req.body.idNormaActiva,
        idNormaSDIN: req.body.idNormaSDIN,
        usuario: req.body.usuario,
        idUsuario: req.body.idUsuario
    };
    try {
        await guardarFormulario2(request)
            .catch((e) => {
                throw ({ mensaje: "PIN: Error al guardar formulario 2.", data: e })
            });

        res.status(200)
        res.send(JSON.stringify({ mensaje: `PIN: Formulario 2 guardado correctamente.` }))
        res.end();
        return;
    }
    catch (e) {
        console.log(e)
        res.status(409)
        res.send(JSON.stringify({ e }))
        res.end();
        return;
    }
}

async function traerFormulario3Controller(req, res, next) {
    let data;
    let request = {
        idNormaSDIN: req.body.idNormaSDIN
    }
    try {
        await traerFormulario3(request)
            .then(res => {
                data = res;
            })
            .catch((e) => {
                throw ({ mensaje: "PIN: Error al traer el Formulario 3", data: e })
            });

        res.status(200)
        res.send(JSON.stringify({ mensaje: `PIN: Data formulario 3:`, data }))
        res.end();
        return;
    }
    catch (e) {
        res.status(409)
        res.send(JSON.stringify({ e }))
        res.end();
        return;
    }
}

async function guardarFormulario3Controller(req, res, next) {
    let request = {
        idCausal: req.body.idCausal,
        fundamentacionJuridica: req.body.fundamentacionJuridica,
        fechaInicioVigencia: req.body.fechaInicioVigencia ? moment(req.body.fechaInicioVigencia).format('YYYY-MM-DD') : null,
        fechaPerdidaVigencia: req.body.fechaPerdidaVigencia ? moment(req.body.fechaPerdidaVigencia).format('YYYY-MM-DD') : null,
        observaciones: req.body.observaciones,
        idAbrogacionTipoPasiva: req.body.idAbrogacionTipoPasiva,
        idAbrogacionTipoActiva: req.body.idAbrogacionTipoActiva,
        detallesPasiva: req.body.detallesPasiva,
        detallesActiva: req.body.detallesActiva,
        idNormaActiva: req.body.idNormaActiva,
        idNormaSDIN: req.body.idNormaSDIN,
        usuario: req.body.usuario,
        idUsuario: req.body.idUsuario
    };
    try {
        await guardarFormulario3(request)
            .catch((e) => {
                throw ({ mensaje: "PIN: Error al guardar formulario 3.", data: e })
            });

        res.status(200)
        res.send(JSON.stringify({ mensaje: `PIN: Formulario 3 guardado correctamente.` }))
        res.end();
        return;
    }
    catch (e) {
        console.log(e)
        res.status(409)
        res.send(JSON.stringify({ e }))
        res.end();
        return;
    }
}

async function traerFormulario4Controller(req, res, next) {
    let data;
    let request = {
        idNormaSDIN: req.body.idNormaSDIN
    }
    try {
        await traerFormulario4(request)
            .then(res => {
                data = res;
            })
            .catch((e) => {
                throw ({ mensaje: "PIN: Error al traer el Formulario 4", data: e })
            });

        res.status(200)
        res.send(JSON.stringify({ mensaje: `PIN: Data formulario 4:`, data }))
        res.end();
        return;
    }
    catch (e) {
        res.status(409)
        res.send(JSON.stringify({ e }))
        res.end();
        return;
    }
}

async function guardarFormulario4Controller(req, res, next) {
    let request = {
        idCausal: req.body.idCausal,
        fundamentacionJuridica: req.body.fundamentacionJuridica,
        textoUnificado: req.body.textoUnificado,
        observaciones: req.body.observaciones,
        idAbrogacionTipoPasiva: req.body.idAbrogacionTipoPasiva,
        idAbrogacionTipoActiva: req.body.idAbrogacionTipoActiva,
        detallesPasiva: req.body.detallesPasiva,
        detallesActiva: req.body.detallesActiva,
        idNormaActiva: req.body.idNormaActiva,
        idNormaSDIN: req.body.idNormaSDIN,
        usuario: req.body.usuario,
        archivo: req.body.archivo,
        archivoBase64: req.body.archivoBase64,
        archivoS3: req.body.archivoS3 ? req.body.archivoS3 : null,
        documentoConsolidado: req.body.documentoConsolidado,
        idUsuario: req.body.idUsuario,
        solucionAdoptada:req.body.solucionAdoptada
    };
    try {
        if (request.archivoBase64 && request.archivo) {
            let archivoSubido = await subirArchivo(request.archivoBase64, request.usuario, process.env.S3_DIGESTO + request.archivo).catch(error => { throw error })
            request.archivoS3 = archivoSubido['Key'].replace(process.env.S3_DIGESTO, '');
        }

        await guardarFormulario4(request)
            .catch((e) => {
                throw ({ mensaje: "PIN: Error al guardar formulario 4.", data: e })
            });

        res.status(200)
        res.send(JSON.stringify({ mensaje: `PIN: Formulario 4 guardado correctamente.` }))
        res.end();
        return;
    }
    catch (e) {
        console.log(e)
        res.status(409)
        res.send(JSON.stringify({ e }))
        res.end();
        return;
    }
}

async function traerFormulario5Controller(req, res, next) {
    let data;
    let request = {
        idNormaSDIN: req.body.idNormaSDIN
    }
    try {
        await traerFormulario5(request)
            .then(res => {
                data = res;
            })
            .catch((e) => {
                throw ({ mensaje: "PIN: Error al traer el Formulario 5", data: e })
            });

        res.status(200)
        res.send(JSON.stringify({ mensaje: `PIN: Data formulario 5:`, data }))
        res.end();
        return;
    }
    catch (e) {
        res.status(409)
        res.send(JSON.stringify({ e }))
        res.end();
        return;
    }
}

async function guardarFormulario5Controller(req, res, next) {
    let request = {
        idCausal: req.body.idCausal,
        idNormaActiva: req.body.idNormaActiva,
        fundamentacionJuridica: req.body.fundamentacionJuridica,
        observaciones: req.body.observaciones,
        idAbrogacionTipoPasiva: req.body.idAbrogacionTipoPasiva,
        idAbrogacionTipoActiva: req.body.idAbrogacionTipoActiva,
        detallesPasiva: req.body.detallesPasiva,
        detallesActiva: req.body.detallesActiva,
        idNormaSDIN: req.body.idNormaSDIN,
        usuario: req.body.usuario,
        idUsuario: req.body.idUsuario,
        archivo: req.body.archivo,
        archivoBase64: req.body.archivoBase64,
        archivoS3: req.body.archivoS3 ? req.body.archivoS3 : null,
        documentoConsolidado: req.body.documentoConsolidado
    };
    try {
        if (request.archivoBase64 && request.archivo) {
            let archivoSubido = await subirArchivo(request.archivoBase64, request.usuario, process.env.S3_DIGESTO + request.archivo).catch(error => { throw error })
            request.archivoS3 = archivoSubido['Key'].replace(process.env.S3_DIGESTO, '');
        }

        await guardarFormulario5(request)
            .catch((e) => {
                throw ({ mensaje: "PIN: Error al guardar formulario 5.", data: e })
            });

        res.status(200)
        res.send(JSON.stringify({ mensaje: `PIN: Formulario 5 guardado correctamente.` }))
        res.end();
        return;
    }
    catch (e) {
        console.log(e)
        res.status(409)
        res.send(JSON.stringify({ e }))
        res.end();
        return;
    }
}

async function traerFormulario6Controller(req, res, next) {
    let data;
    let request = {
        idNormaSDIN: req.body.idNormaSDIN
    }
    try {
        await traerFormulario6(request)
            .then(res => {
                data = res;
            })
            .catch((e) => {
                throw ({ mensaje: "PIN: Error al traer el Formulario 6", data: e })
            });

        res.status(200)
        res.send(JSON.stringify({ mensaje: `PIN: Data formulario 6:`, data }))
        res.end();
        return;
    }
    catch (e) {
        res.status(409)
        res.send(JSON.stringify({ e }))
        res.end();
        return;
    }
}

async function guardarFormulario6Controller(req, res, next) {
    let request = {
        observacionesGenerales: req.body.observacionesGenerales,
        textoDefinitivo: req.body.textoDefinitivo,
        textoDefinitivoAnexo: req.body.textoDefinitivoAnexo,
        idNormaSDIN: req.body.idNormaSDIN,
        archivo: req.body.archivo,
        archivoBase64: req.body.archivoBase64,
        archivoS3: req.body.archivoS3,
        observacionesGenerales: req.body.observacionesGenerales,
        fechaActualizacion: req.body.fechaActualizacion,
        idUsuario: req.body.idUsuario,
        usuario: req.body.usuario,
        idTextoDefinitivo: req.body.idTextoDefinitivo,
        documentoConsolidado: +req.body.documentoConsolidado
    };
    try {
        if (request.archivoBase64 && request.archivo) {
            let archivoSubido = await subirArchivo(request.archivoBase64, request.usuario, process.env.S3_DIGESTO + request.archivo).catch(error => { throw error })
            request.archivoS3 = archivoSubido['Key'].replace(process.env.S3_DIGESTO, '');
        }
        await guardarFormulario6(request)
            .catch((e) => {
                throw ({ mensaje: "PIN: Error al guardar formulario 6.", data: e })
            });

        res.status(200)
        res.send(JSON.stringify({ mensaje: `PIN: Formulario 6 guardado correctamente.` }))
        res.end();
        return;
    }
    catch (e) {
        console.log(e)
        res.status(409)
        res.send(JSON.stringify({ e }))
        res.end();
        return;
    }
}

async function traerFormulario7Controller(req, res, next) {
    let data;
    let request = {
        idNormaSDIN: req.body.idNormaSDIN
    }
    try {
        await traerFormulario7(request)
            .then(res => {
                data = res;
            })
            .catch((e) => {
                throw ({ mensaje: "PIN: Error al traer el Formulario 7", data: e })
            });

        res.status(200)
        res.send(JSON.stringify({ mensaje: `PIN: Data formulario 7:`, data }))
        res.end();
        return;
    }
    catch (e) {
        console.log(e)
        res.status(409)
        res.send(JSON.stringify({ e }))
        res.end();
        return;
    }
}

async function guardarFormulario7Controller(req, res, next) {
    let request = {
        idNormaSDIN: req.body.idNormaSDIN,
        anexoAntecedentes: req.body.anexoAntecedentes,
        anexoEquivalencias: req.body.anexoEquivalencias,
        leyesDigesto: req.body.leyesDigesto,
        usuario: req.body.usuario
    };

    try {
        for (let i = 0; i < request.leyesDigesto.length; i++) {
            if (request.leyesDigesto[i].archivoBase64 && request.leyesDigesto[i].archivo) {
                let archivoSubido = await subirArchivo(request.leyesDigesto[i].archivoBase64, request.usuario, process.env.S3_DIGESTO + request.leyesDigesto[i].archivo).catch(error => { throw error })
                request.leyesDigesto[i].archivoS3 = archivoSubido['Key'].replace(process.env.S3_DIGESTO, '');
            }
        }

        await guardarFormulario7(request)
            .catch((e) => {
                throw ({ mensaje: "PIN: Error al guardar formulario 7.", data: e })
            });

        res.status(200)
        res.send(JSON.stringify({ mensaje: `PIN: Formulario 7 guardado correctamente.` }))
        res.end();
        return;
    }
    catch (e) {
        console.log(e)
        res.status(409)
        res.send(JSON.stringify({ e }))
        res.end();
        return;
    }
}

//Listado Anexo I: una tabla por rama con: tipo de norma, numero y una descripcion.
async function generarListadoAnexoIPrevioController(req, res, next) {
    try {
        let normas = await normasAnexoIPrevio()
            .catch((e) => {
                throw ({ mensaje: "PIN: Error al traer las normas para el Anexo I.", data: e })
            });

        let buf = await generarListadoAnexoI(normas);

        const base64 = buf.toString('base64'); //pasa el buffer a base64

        /* res.setHeader('Content-Type', 'application/pdf') */
        res.status(200)
        res.send(JSON.stringify({ data: base64 }))
        res.end();
        return;
    }
    catch (e) {
        console.log(e)
        res.status(409)
        res.send(JSON.stringify({ e }))
        res.end();
        return;
    }
}

//Concatenacion de los pdf ingresados en el formulario 6
async function generarAnexoIPorRamaPrevioController(req, res, next) {
    try {
        if (!req.body.idRama) { throw 'Ingresar idRama' }
        let normas = await normasAnexoIPrevio()
            .catch((e) => {
                throw ({ mensaje: "PIN: Error al traer las normas para el Anexo I.", data: e })
            });
        normas = normas.filter(n => n.idRama === req.body.idRama);

        let buf = await generarAnexoIPorRama(normas);

        const base64 = buf.toString('base64'); //pasa el buffer a base64

        /* res.setHeader('Content-Type', 'application/pdf') */
        res.status(200)
        res.send({ data: base64 })
        res.end();
        return;
    }
    catch (e) {
        console.log(e)
        res.status(409)
        res.send(JSON.stringify({ e }))
        res.end();
        return;
    }
}

async function generarAnexoIIPrevioController(req, res, next) {
    try {
        let normas = await normasAnexoIIPrevio()
            .catch((e) => {
                throw ({ mensaje: "PIN: Error al traer las normas para el Anexo II.", data: e })
            });

        let buf = await generarAnexoII(normas);

        let base64 = '';
        if (buf) base64 = buf.toString('base64'); //pasa el buffer a base64

        /* res.setHeader('Content-Type', 'application/pdf') */
        res.status(200)
        res.send({ data: base64 })
        res.end();
        return;
    }
    catch (e) {
        console.log(e)
        res.status(409)
        res.send(JSON.stringify({ e }))
        res.end();
        return;
    }
}
async function generarAnexoIIIPrevioController(req, res, next) {
    try {
        let normas = await normasAnexoIIIPrevio()
            .catch((e) => {
                throw ({ mensaje: "PIN: Error al traer las normas para el Anexo III.", data: e })
            });

        let buf = await generarAnexoIII(normas);

        /* res.setHeader('Content-Type', 'application/pdf') */
        res.status(200)
        res.send({ data: buf.toString('base64') })
        res.end();
        return;
    }
    catch (e) {
        console.log(e)
        res.status(409)
        res.send(JSON.stringify({ e }))
        res.end();
        return;
    }
}

async function generarAnexoIVPrevioController(req, res, next) {
    try {
        let normas = await normasAnexoIVPrevio()
            .catch((e) => {
                throw ({ mensaje: "PIN: Error al traer las normas para el Anexo IV.", data: e })
            });

        let buf = await generarAnexoIV(normas);

        /* res.setHeader('Content-Type', 'application/pdf') */
        res.status(200)
        res.send({ data: buf.toString('base64') })
        res.end();
        return;
    }
    catch (e) {
        console.log(e)
        res.status(409)
        res.send(JSON.stringify({ e }))
        res.end();
        return;
    }
}

async function traerLeyesDigestoController(req, res, next) {
    let data;
    try {
        await traerLeyesDigesto()
            .then(res => {
                data = res;
            })
            .catch((e) => {
                throw ({ mensaje: "PIN: Error al traer leyes de digesto", data: e })
            });

        res.status(200)
        res.send(JSON.stringify({ mensaje: `PIN:`, data }))
        res.end();
        return;
    }
    catch (e) {
        res.status(409)
        res.send(JSON.stringify({ e }))
        res.end();
        return;
    }
}

async function firmarAnexoController(req, res, next) {
    let request = {
        idUsuario: req.body.idUsuario,
        idAnexoDJ: req.body.idAnexoDJ,
        idRama: req.body.idRama,
        idLeyDigesto: req.body.idLeyDigesto,
        fecha: req.body.fecha,
        usuario: req.body.usuario
    }
    try {
        let buf;
        let normas;
        switch (request.idAnexoDJ) {
            case 1:
                normas = await normasAnexoI(request)
                    .catch((e) => {
                        throw ({ mensaje: "PIN: Error al traer las normas para el Anexo I.", data: e })
                    });
                if (!request.idRama) {
                    buf = await generarListadoAnexoI(normas);
                }
                else {
                    normas = normas.filter(n => n.idRama === request.idRama);
                    buf = await generarAnexoIPorRama(normas);
                }
                break;
            case 2:
                normas = await normasAnexoII(request)
                    .catch((e) => {
                        throw ({ mensaje: "PIN: Error al traer las normas para el Anexo II.", data: e })
                    });
                buf = await generarAnexoII(normas);
                break;
            case 3:
                normas = await normasAnexoIII(request)
                    .catch((e) => {
                        throw ({ mensaje: "PIN: Error al traer las normas para el Anexo III.", data: e })
                    });
                buf = await generarAnexoIII(normas);
                break;
            case 4:
                normas = await normasAnexoIV(request)
                    .catch((e) => {
                        throw ({ mensaje: "PIN: Error al traer las normas para el Anexo IV.", data: e })
                    });
                buf = await generarAnexoIV(normas);
                break;
            default:
                throw ({ mensaje: "PIN: Error " })
        }

        base64 = buf.toString('base64')

        let documentoFirmado = await firmaDirectaDocumento(base64, 'IFTDI', request.usuario)
            .catch(err => { throw ({ mensaje: "PIN: Error al firmar Anexo", data: err }) });

        documentoFirmado.base64 = 'data:application/pdf;base64,' + documentoFirmado.base64;

        const archivoSubido = await subirArchivo(documentoFirmado.base64, request.idUsuario, documentoFirmado.numero)
            .catch((e) => {
                throw ({ mensaje: "PIN: Error al firmar Anexo", data: e })
            });

        request.archivoS3 = archivoSubido['Key'];

        await firmarAnexo(request)
            .catch((e) => {
                throw ({ mensaje: "PIN: Error al firmar Anexo", data: e })
            });

        res.status(200)
        res.send(JSON.stringify({ mensaje: `PIN: Anexo Firmado Exitosamente` }))
        res.end();
        return;
    }
    catch (e) {
        console.log(e)
        res.status(409)
        res.send(JSON.stringify({ e }))
        res.end();
        return;
    }
}

async function corteDigestoController(req, res, next) {
    let request = { idUsuario: req.body.idUsuario }
    try {
        await corteDigesto(request)
            .catch((e) => {
                throw ({ mensaje: "PIN: Error al realizar el corte del digesto", data: e })
            });

        res.status(200)
        res.send(JSON.stringify({ mensaje: `PIN: Operación realizada con éxito.` }))
        res.end();
        return;
    }
    catch (e) {
        console.log(e)
        res.status(409)
        res.send(JSON.stringify({ e }))
        res.end();
        return;
    }
}

async function traerCortesDigestoController(req, res, next) {
    try {
        let results = await traerCortesDigesto()
            .catch((e) => {
                throw ({ mensaje: "PIN: Error al traer cortes del digesto", data: e })
            });

        res.status(200)
        res.send(JSON.stringify({ mensaje: `PIN: Operación realizada con éxito.`, data: results }))
        res.end();
        return;
    }
    catch (e) {
        console.log(e)
        res.status(409)
        res.send(JSON.stringify({ e }))
        res.end();
        return;
    }
}

//Listado Anexo I: una tabla por rama con: tipo de norma, numero y una descripcion.
async function generarListadoAnexoIController(req, res, next) {
    let request = {
        fecha: req.body.fecha
    }
    try {
        let normas = await normasAnexoI(request)
            .catch((e) => {
                throw ({ mensaje: "PIN: Error al traer las normas para el Anexo I.", data: e })
            });

        let buf = await generarListadoAnexoI(normas);

        const base64 = buf.toString('base64'); //pasa el buffer a base64

        /* res.setHeader('Content-Type', 'application/pdf') */
        res.status(200)
        res.send(JSON.stringify({ data: base64 }))
        res.end();
        return;
    }
    catch (e) {
        console.log(e)
        res.status(409)
        res.send(JSON.stringify({ e }))
        res.end();
        return;
    }
}

//Concatenacion de los pdf ingresados en el formulario 6
async function generarAnexoIPorRamaController(req, res, next) {
    let request = {
        fecha: req.body.fecha
    }
    try {
        if (!req.body.idRama) { throw 'Ingresar idRama' }
        let normas = await normasAnexoI(request)
            .catch((e) => {
                throw ({ mensaje: "PIN: Error al traer las normas para el Anexo I.", data: e })
            });
        normas = normas.filter(n => n.idRama === req.body.idRama);

        let buf = await generarAnexoIPorRama(normas);

        const base64 = buf.toString('base64'); //pasa el buffer a base64

        /* res.setHeader('Content-Type', 'application/pdf') */
        res.status(200)
        res.send({ data: base64 })
        res.end();
        return;
    }
    catch (e) {
        console.log(e)
        res.status(409)
        res.send(JSON.stringify({ e }))
        res.end();
        return;
    }
}

async function generarAnexoIIController(req, res, next) {
    let request = {
        fecha: req.body.fecha
    }
    try {
        let normas = await normasAnexoII(request)
            .catch((e) => {
                throw ({ mensaje: "PIN: Error al traer las normas para el Anexo II.", data: e })
            });

        let buf = await generarAnexoII(normas);

        let base64 = '';
        if (buf) base64 = buf.toString('base64'); //pasa el buffer a base64

        /* res.setHeader('Content-Type', 'application/pdf') */
        res.status(200)
        res.send({ data: base64 })
        res.end();
        return;
    }
    catch (e) {
        console.log(e)
        res.status(409)
        res.send(JSON.stringify({ e }))
        res.end();
        return;
    }
}
async function generarAnexoIIIController(req, res, next) {
    let request = {
        fecha: req.body.fecha
    }
    try {
        let normas = await normasAnexoIII(request)
            .catch((e) => {
                throw ({ mensaje: "PIN: Error al traer las normas para el Anexo III.", data: e })
            });

        let buf = await generarAnexoIII(normas);

        /* res.setHeader('Content-Type', 'application/pdf') */
        res.status(200)
        res.send({ data: buf.toString('base64') })
        res.end();
        return;
    }
    catch (e) {
        console.log(e)
        res.status(409)
        res.send(JSON.stringify({ e }))
        res.end();
        return;
    }
}

async function generarAnexoIVController(req, res, next) {
    let request = {
        fecha: req.body.fecha
    }
    try {
        let normas = await normasAnexoIV(request)
            .catch((e) => {
                throw ({ mensaje: "PIN: Error al traer las normas para el Anexo IV.", data: e })
            });

        let buf = await generarAnexoIV(normas);

        /* res.setHeader('Content-Type', 'application/pdf') */
        res.status(200)
        res.send({ data: buf.toString('base64') })
        res.end();
        return;
    }
    catch (e) {
        console.log(e)
        res.status(409)
        res.send(JSON.stringify({ e }))
        res.end();
        return;
    }
}

async function traerAnexosFirmadosController(req, res, next) {
    let request = {
        fecha: req.body.fecha
    }
    try {
        let anexos = await traerAnexosFirmados(request)
            .catch((e) => {
                throw ({ mensaje: "PIN: Error al traer anexos firmados.", data: e })
            });

        res.status(200)
        res.send({ mensaje: 'PIN: Anexos Firmados.', data: anexos })
        res.end();
        return;
    }
    catch (e) {
        console.log(e)
        res.status(409)
        res.send(JSON.stringify({ e }))
        res.end();
        return;
    }
}

async function cargarDocumentoFirmadoController(req, res, next) {
    let request = {
        fecha: req.body.fecha,
        idUsuario: req.body.idUsuario,
        archivo: req.body.archivo,
        idRama: req.body.idRama,
        idAnexoDJ: req.body.idAnexoDJ
    }
    try {
        const archivoSubido = await subirArchivo('data:application/pdf;base64,' + req.body.base64, request.idUsuario, request.archivo)
            .catch((e) => {
                throw ({ mensaje: "PIN: Error al subir Anexo", data: e })
            });

        request.archivoS3 = archivoSubido['Key'];

        await firmarAnexo(request)
            .catch((e) => {
                throw ({ mensaje: "PIN: Error al cargar Anexo", data: e })
            });

        res.status(200)
        res.send({ mensaje: 'PIN: Anexos Firmados.' })
        res.end();
        return;
    }
    catch (e) {
        console.log(e)
        res.status(409)
        res.send(JSON.stringify({ e }))
        res.end();
        return;
    }
}

async function editarCorteDigestoController(req, res, next) {
    let request = {
        idUsuario: req.body.idUsuario,
        id: req.body.id,
        enviadoLegislatura: req.body.enviadoLegislatura,
        aprobadoLegislatura: req.body.aprobadoLegislatura
    }
    try {

        await editarCorte(request)
            .catch((e) => {
                throw ({ mensaje: "PIN: Error.", data: e })
            });

        res.status(200)
        res.send({ mensaje: 'PIN: .' })
        res.end();
        return;
    }
    catch (e) {
        console.log(e)
        res.status(409)
        res.send(JSON.stringify({ e }))
        res.end();
        return;
    }
}

async function crearLeyDigestoController(req, res, next) {
    let request = {
        numeroLey:(req.body.numeroLey !== "")? Number(req.body.numeroLey):"",
        anio: Number(req.body.anio),
        fechaFin: req.body.fechaFin,
        leyendaLey: req.body.leyendaLey,
        leyendaModificaciones: req.body.leyendaModificaciones,
    };
    try {
        await crearLeyDigesto(request)
            .then(res => {
                response = res;
            })
            .catch((e) => {
                throw ({ mensaje: "PIN: Error al guardar la ley digesto.", data: e })
            });

        res.status(200)
        res.send(JSON.stringify({ mensaje: `PIN: Ley Digesto guardada correctamente:`, response }))
        res.end();
        return;
    }
    catch (e) {
        console.log(e)
        res.status(409)
        res.send(JSON.stringify({ e }))
        res.end();
        return;
    }
}

module.exports = {
    traerPatologiasNormativasController,
    guardarAnalisisEpistemologicoController,
    traerAnexosDJController,
    traerAnalisisEpistemologicoController,
    traerCausalesController,
    traerTiposAbrogacionController,
    guardarFormulario1Controller,
    traerFormulario1Controller,
    guardarFormulario2Controller,
    traerFormulario2Controller,
    guardarFormulario3Controller,
    traerFormulario3Controller,
    guardarArbolTematicoController,
    traerArbolTematicoController,
    traerFormulario4Controller,
    guardarFormulario4Controller,
    traerFormulario5Controller,
    guardarFormulario5Controller,
    traerFormulario6Controller,
    guardarFormulario6Controller,
    traerFormulario7Controller,
    guardarFormulario7Controller,
    generarListadoAnexoIPrevioController,
    generarAnexoIPorRamaPrevioController,
    generarAnexoIIPrevioController,
    generarAnexoIIIPrevioController,
    generarAnexoIVPrevioController,
    traerLeyesDigestoController,
    firmarAnexoController,
    corteDigestoController,
    traerCortesDigestoController,
    generarListadoAnexoIController,
    generarAnexoIPorRamaController,
    generarAnexoIIController,
    generarAnexoIIIController,
    generarAnexoIVController,
    traerAnexosFirmadosController,
    cargarDocumentoFirmadoController,
    editarCorteDigestoController,
    crearLeyDigestoController
}