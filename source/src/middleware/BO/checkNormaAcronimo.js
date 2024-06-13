const { traerSiglasParaAcronimo } = require('../../models/BO/NormasModel');
const { traerNormaPorAcronimo } = require('../../models/BO/NormasModel')

async function checkNormaAcronimo(req, res, next) {
    let acronimo = req.body.normaAcronimoReferencia;
    // console.log(req.body)
    //Traigo las siglas que voy a usar para armar el acrónimo
    let dataAcronimo = await traerSiglasParaAcronimo(req.body)
        .catch(error => {
            res.status(409)
            res.send(JSON.stringify(error))
            res.end();
        })

    const tipo = dataAcronimo.siglas[0].normaTipoSigla;
    const anio = req.body.normaAnio;
    const num = req.body.normaNumero;
    const organismo = req.body.organismoEmisor;
    const repa = dataAcronimo.siglas[0].siglaReparticion;
    const sec = dataAcronimo.siglas[0].seccionSigla;

    if (req.body.idNormaSubtipo === 58) {
        // ACRÓNIMO FIRMA CONJUNTA => "SECCION - NORMA TIPO - REPA PADRE - ORGANISMOS FIRMANTES - REPA HIJA - NUMERO - AÑO"
        acronimo = [sec, tipo, req.body.siglasReparticiones, organismo, num, anio].join('-');
    }
    else {
        if (dataAcronimo.siglas[0].cod_proceso === 'PR_LIC') {
            // ACRÓNIMO PARA LAS LICITACIONES, PARA QUE LES AGREGUE EL SUBTIPO
            acronimo = [sec, tipo, dataAcronimo.siglas[0].normaSubtipoSigla, repa, organismo,  num, anio].join('-');
        } 
        else {
            if (req.body.numeroEdicionSubtipo !== null && req.body.numeroEdicionSubtipo !== undefined) {
                // ACRÓNIMO FIRMA SIMPLE CON NUMERO DE PRÓRROGA => "SECCION - NORMA TIPO - NORMA SUBTIPO - REPA PADRE - REPA HIJA - NUMERO - AÑO"
                acronimo = [sec, tipo, dataAcronimo.siglas[0].normaSubtipoSigla, String(req.body.numeroEdicionSubtipo),repa, organismo,  num, anio].join('-');
            }
            else {
                // ACRÓNIMO FIRMA SIMPLE => "SECCION - NORMA TIPO - REPA PADRE - REPA HIJA - NUMERO - AÑO"
                acronimo = [sec, tipo,repa, organismo,  num, anio].join('-');
            }
        }

    }

    req.body.normaAcronimoReferencia = acronimo;

    await traerNormaPorAcronimo(req.body)
        .then(results => {
            if (results.length === 0) {
                next()
            }
            else {
                if (req.body.idNorma && results[0].idNorma === req.body.idNorma) {
                    next()
                }
                else {
                    res.status(409)
                    res.send(JSON.stringify({ mensaje: 'PIN: La norma que está intentando ingresar ya existe.', norma: results[0] }))
                    res.end();
                }
            }
        })
        .catch(error => {
            res.status(409)
            res.send(JSON.stringify({ mensaje: 'PIN: Error al verificar la existencia de la norma', data: error }))
            res.end();
        })
}

module.exports = { checkNormaAcronimo }