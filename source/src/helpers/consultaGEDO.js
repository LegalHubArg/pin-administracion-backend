require('dotenv').config()
const soapRequest = require('easy-soap-request');
const { traerOrganismoPorSigla, traerNormaTipoSubtipoGEDO } = require('../models/BO/NormasModel')
const { traerPermisosCuenta } = require('../models/BO/cuentas')

//Parser XML
let xml2js = require('xml2js');
let parser = new xml2js.Parser();

async function traerPdfGEDO(req, res, next) {

    let cuit = parseInt(req.body.cuit);
    let numeroDocumento = String(req.body.nombreNorma);

    //Request headers
    let sampleHeaders = {
        'Content-Type': 'text/xml',
        'Accept': 'application/xml'
    };

    //Request url
    let urlConsultaDocumento = process.env.GCBA_SADE + '/GEDOServices/consultaDocumento'; //<----- url de QA
    let urlConsultaCuitCuil = process.env.GCBA_SADE + '/EUServices/consultaCuitCuil'; //<----- url de QA

    let usuario = '';
    //Request Body
    let xml = {
        consultaCuitCuil:
            `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ext="http://external.service.eu.gcaba.gob.ar/">
                <soapenv:Header/>
                <soapenv:Body>
                    <ext:consultaCuitCuil>
                        <consultaCuitCuilRequest>${cuit}</consultaCuitCuilRequest>
                    </ext:consultaCuitCuil>
                </soapenv:Body>
            </soapenv:Envelope>`,

        consultarDocumentoPdf: '',
        consultarDocumentoPorNumero: ''
    };

    let parsedData = {}
    let metadatosDocumento = {}

    try {

        await soapRequest({ method: 'POST', url: urlConsultaCuitCuil, headers: sampleHeaders, xml: xml.consultaCuitCuil, timeout: 50000 })// Optional timeout parameter(milliseconds)
            .then(res => {
                usuario = String((res.response.body.toString()).split('<usuario>')[1].split('</usuario>')[0]);
                xml.consultarDocumentoPdf =
                    `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ar="http://ar.gob.gcaba.gedo.satra.services.external.consulta/">
                        <soapenv:Header/>
                        <soapenv:Body>
                            <ar:consultarDocumentoPdf>
                                <request>
                                    <numeroDocumento>${numeroDocumento}</numeroDocumento>
                                    <numeroEspecial></numeroEspecial>
                                    <usuarioConsulta>${usuario}</usuarioConsulta>
                                </request>
                            </ar:consultarDocumentoPdf>
                        </soapenv:Body>
                    </soapenv:Envelope>`;
                xml.consultarDocumentoPorNumero =
                    `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
                        <soapenv:Header/>
                        <soapenv:Body>
                            <tns:consultarDocumentoPorNumero xmlns:tns="http://ar.gob.gcaba.gedo.satra.services.external.consulta/">
                                <request>
                                    <numeroDocumento>${numeroDocumento}</numeroDocumento>
                                    <numeroEspecial></numeroEspecial>
                                    <usuarioConsulta>${usuario}</usuarioConsulta>
                                </request>
                            </tns:consultarDocumentoPorNumero>
                        </soapenv:Body>
                   </soapenv:Envelope>`
            })
            .catch((err) => { throw String(err) })

        await soapRequest({ method: 'POST', url: urlConsultaDocumento, headers: sampleHeaders, xml: xml.consultarDocumentoPorNumero, timeout: 50000 })
            .then((res) => {
                parser.parseString(res.response.body, function (err, result) {//Extract the value from the data element
                    if (err) {
                        console.log(err)
                    }
                    else {
                        let auxObj = result['soap:Envelope']['soap:Body'][0]['ns2:consultarDocumentoPorNumeroResponse'][0]['return'][0]
                        for (const item in auxObj) {
                            metadatosDocumento[item] = auxObj[item][0]
                        }

                    }
                })
            })
            .catch((err) => { throw String(err) })

        let { response } = await soapRequest({ method: 'POST', url: urlConsultaDocumento, headers: sampleHeaders, xml: xml.consultarDocumentoPdf, timeout: 50000 })
            .catch((err) => { throw String(err) })

        let { headers, body, statusCode } = response;

        parser.parseString(body, function (err, result) {//Extract the value from the data element
            if (err) {
                console.log(err)
            }
            else {
                parsedData = result['soap:Envelope']['soap:Body'][0]['ns2:consultarDocumentoPdfResponse'][0]['return'][0]
            }
        })
        console.log(parsedData.slice(0, 10)) //Primeros 10 caracteres del base64 (control)
        res.status(200).send({ base64: parsedData, metadatos: metadatosDocumento });

    }
    catch (error) {
        parser.parseString(error, function (err, result) {//Extract the value from the data element
            res.status(409).send('Error al traer documento GEDO - ' + result['soap:Envelope']['soap:Body'][0]['soap:Fault'][0]['faultstring'][0])
        })
    }
}

async function traerPdfGEDONumeroEspecial(req, res, next) {

    let cuit = parseInt(req.body.cuit);
    let numeroDocumento = String(req.body.nombreNorma);

    //Request headers
    let sampleHeaders = {
        'Content-Type': 'text/xml',
        'Accept': 'application/xml'
    };

    //Request url
    let urlConsultaDocumento = process.env.GCBA_SADE + '/GEDOServices/consultaDocumento'; //<----- url de QA
    let urlConsultaCuitCuil = process.env.GCBA_SADE + '/EUServices/consultaCuitCuil'; //<----- url de QA

    let usuario = '';
    //Request Body
    let xml = {
        consultaCuitCuil:
            `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ext="http://external.service.eu.gcaba.gob.ar/">
                <soapenv:Header/>
                <soapenv:Body>
                    <ext:consultaCuitCuil>
                        <consultaCuitCuilRequest>${cuit}</consultaCuitCuilRequest>
                    </ext:consultaCuitCuil>
                </soapenv:Body>
            </soapenv:Envelope>`,

        consultarDocumentoPdf: '',
        consultarDocumentoPorNumero: ''
    };

    let parsedData = {}
    let metadatosDocumento = {}

    try {

        await soapRequest({ method: 'POST', url: urlConsultaCuitCuil, headers: sampleHeaders, xml: xml.consultaCuitCuil, timeout: 50000 })// Optional timeout parameter(milliseconds)
            .then(res => {
                usuario = String((res.response.body.toString()).split('<usuario>')[1].split('</usuario>')[0]);
                xml.consultarDocumentoPdf =
                    `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ar="http://ar.gob.gcaba.gedo.satra.services.external.consulta/">
                        <soapenv:Header/>
                        <soapenv:Body>
                            <ar:consultarDocumentoPdf>
                                <request>
                                    <numeroEspecial>${numeroDocumento}</numeroEspecial>
                                    <usuarioConsulta>${usuario}</usuarioConsulta>
                                </request>
                            </ar:consultarDocumentoPdf>
                        </soapenv:Body>
                    </soapenv:Envelope>`;
                xml.consultarDocumentoPorNumero =
                    `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
                        <soapenv:Header/>
                        <soapenv:Body>
                            <tns:consultarDocumentoPorNumero xmlns:tns="http://ar.gob.gcaba.gedo.satra.services.external.consulta/">
                                <request>
                                    <numeroEspecial>${numeroDocumento}</numeroEspecial>
                                    <usuarioConsulta>${usuario}</usuarioConsulta>
                                </request>
                            </tns:consultarDocumentoPorNumero>
                        </soapenv:Body>
                   </soapenv:Envelope>`
            })
            .catch((err) => { throw String(err) })

        await soapRequest({ method: 'POST', url: urlConsultaDocumento, headers: sampleHeaders, xml: xml.consultarDocumentoPorNumero, timeout: 50000 })
            .then((res) => {
                parser.parseString(res.response.body, function (err, result) {//Extract the value from the data element
                    if (err) {
                        console.log(err)
                    }
                    else {
                        let auxObj = result['soap:Envelope']['soap:Body'][0]['ns2:consultarDocumentoPorNumeroResponse'][0]['return'][0]
                        for (const item in auxObj) {
                            metadatosDocumento[item] = auxObj[item][0]
                        }

                    }
                })
            })
            .catch((err) => { throw String(err) })

        let { response } = await soapRequest({ method: 'POST', url: urlConsultaDocumento, headers: sampleHeaders, xml: xml.consultarDocumentoPdf, timeout: 50000 })
            .catch((err) => { throw String(err) })

        let { headers, body, statusCode } = response;

        parser.parseString(body, function (err, result) {//Extract the value from the data element
            if (err) {
                console.log(err)
            }
            else {
                parsedData = result['soap:Envelope']['soap:Body'][0]['ns2:consultarDocumentoPdfResponse'][0]['return'][0]
            }
        })
        console.log(parsedData.slice(0, 10)) //Primeros 10 caracteres del base64 (control)

        //Busco la repa (última en la lista de firmantes)
        let xmlConsultarDocumentoDetalle = `
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
                <soapenv:Body>
                    <tns:consultarDocumentoDetalle xmlns:tns="http://ar.gob.gcaba.gedo.satra.services.external.consulta/"><!-- mandatory -->
                        <request>
                            <numeroEspecial>${numeroDocumento}</numeroEspecial>
                            <usuarioConsulta>${usuario}</usuarioConsulta>
                        </request>
                    </tns:consultarDocumentoDetalle>
                </soapenv:Body>
                </soapenv:Envelope>
            `;
        let organismo = (numeroDocumento.split('-')).pop();
        let firmantes = [];
        let tipoDocumento = metadatosDocumento.tipoDocumento;

        await soapRequest({ method: 'POST', url: urlConsultaDocumento, headers: sampleHeaders, xml: xmlConsultarDocumentoDetalle, timeout: 10000 })
            .then((res) => {
                parser.parseString(res.response.body, function (err, result) {
                    if (err) {
                        throw err;
                    }
                    else {
                        let resultados = result['soap:Envelope']['soap:Body'][0]['ns2:consultarDocumentoDetalleResponse'][0]['return'][0]
                        /* reparticion = resultados.listaFirmantes[(resultados.listaFirmantes).length - 1].split('- ')[1].split(' )')[0] */
                        resultados.listaFirmantes.pop();
                        firmantes = resultados.listaFirmantes;
                    }
                })
            })
            .catch((err) => {
                throw err
            })

        //Traigo el organismo
        await traerOrganismoPorSigla({ sigla: organismo })
            .then((res) => {
                if (res.length > 0) {
                    metadatosDocumento.organismo = res[0]
                }
                else {
                    throw "La organismo " + String(reparticion) + " no existe en PIN"
                }
            })
            .catch((err) => {
                throw err
            })

        //Hago lo mismo para las otras firmantes
        for (const repa of firmantes) {
            await traerOrganismoPorSigla({ sigla: (repa.split('- ')[1].split(' )')[0]) })
                .then((res) => {
                    if (res.length > 0) {
                        metadatosDocumento.organismosConjuntos = [];
                        metadatosDocumento.organismosConjuntos.push({
                            organismo: res[0]
                        })
                    }
                    else {
                        throw "La norma ingresada es correcta, pero debe contactarse con el Administrador del Sistema PIN para validar la existencia de la Repartición firmante de la norma."
                    }
                })
                .catch((err) => {
                    throw err
                })
        }

        // Tipo y Subtipo
        let tipoSubtipo = await traerNormaTipoSubtipoGEDO(metadatosDocumento)
            .catch((err) => {
                throw err
            })

        if (tipoSubtipo.length === 0) {
            throw new Error("La norma ingresada es correcta, pero debe contactarse con el Administrador del Sistema PIN para validar la existencia del Tipo y Subtipo de dicha norma.")
        }
        else {
            metadatosDocumento.normaTipo = tipoSubtipo[0].normaTipo
            metadatosDocumento.normaSubtipo = tipoSubtipo[0].normaSubtipo
            metadatosDocumento.idNormaTipo = tipoSubtipo[0].idNormaTipo
            metadatosDocumento.idNormaSubtipo = tipoSubtipo[0].idNormaSubtipo
        }

        //Si NO es Admin: Verifico que el usuario tenga permisos para validar organismo y reparticion
        const esAdmin = (req.body.idPerfil === 5);
        if (!esAdmin) {
            await traerPermisosCuenta({ idCuenta: req.body.idCuenta })
                .then((result) => {
                    if (res.length === 0) {
                        throw new Error(`No posee los permisos de carga para ${metadatosDocumento.organismo.nombre}.`)
                    }
                    let tienePermiso = false;
                    if (result.some(r =>
                        (r.sigla === metadatosDocumento.organismo.sigla) &&
                        (r.idNormaTipo === metadatosDocumento.idNormaTipo)
                    )) {
                        tienePermiso = true;
                    }
                    if (!tienePermiso) {
                        throw `No posee los permisos de carga para ${metadatosDocumento.organismo.nombre}.`
                    }
                })
                .catch((err) => {
                    throw err
                })
        }

        res.status(200).send({ base64: parsedData, metadatos: metadatosDocumento });

    }
    catch (error) {
        let mensajeError = '';
        if (typeof error === 'string') { mensajeError = error } else { 'Error al traer documento GEDO' }
        parser.parseString(error, function (err, result) {//Extract the value from the data element
            if (err) {
                res.status(409).send({ mensaje: mensajeError, error: err })
            }
            else {
                res.status(409).send({
                    mensaje: `La norma ingresada no pudo validarse en GEDO. 
                Recuerde que se debe ingresar el Número Especial de la misma; 
                caso contrario, favor de realizar la carga manual.`,
                    error: result['soap:Envelope']['soap:Body'][0]['soap:Fault'][0]['faultstring'][0]
                })
            }
        })
    }
}

//Integración WS de Firma Directa:
//Le pasa un base64 y devuelve un documento GEDO Firmado
//Despues hay que hacer la consulta del doc para traer el base64 desde GEDO
async function firmaDirectaDocumento(documento, tipo, cuit) {
    /* console.log('firmaDirecta --> req.body:', req.body) */
    let base64 = documento;
    let tipoDocumento = tipo;

    //Request headers
    let sampleHeaders = {
        'Content-Type': 'text/xml',
        'Accept': 'application/xml'
    };

    //Request url
    let urlGenerarDocumento = process.env.GCBA_SADE + `/GEDOServices/generarDocumento`;
    let urlConsultaCuitCuil = process.env.GCBA_SADE + '/EUServices/consultaCuitCuil';

    //Request Body
    let xmlConsultaCuitCuil = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ext="http://external.service.eu.gcaba.gob.ar/">
    <soapenv:Header/>
    <soapenv:Body>
    <ext:consultaCuitCuil>
    <consultaCuitCuilRequest>${cuit}</consultaCuitCuilRequest>
    </ext:consultaCuitCuil>
    </soapenv:Body>
    </soapenv:Envelope>
    `;

    let documentoGenerado = {};
    let numeroDocumento = '';

    let response = {};

    try {
        //Trae el nombre de usuario
        let usuario = '';

        await soapRequest({ method: 'POST', url: urlConsultaCuitCuil, headers: sampleHeaders, xml: xmlConsultaCuitCuil, timeout: 50000 })
            .then((respuesta) => {
                usuario = String((respuesta.response.body.toString()).split('<usuario>')[1].split('</usuario>')[0]);
            })
            .catch((error) => {
                throw error
            })

        let xmlGenerarDocumentoGEDO = `
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ar="http://ar.gob.gcaba.gedo.satra.services.external.generardocumento/">
            <soapenv:Header/>
            <soapenv:Body>
                <ar:generarDocumentoGEDO>
                    <!--Optional:-->
                    <request>
                        <!--Optional:-->
                        <acronimoTipoDocumento>${tipoDocumento}</acronimoTipoDocumento>
                        <!--Optional:-->
                        <data>${base64}</data>
                        <!--Optional:-->
                        <idTransaccion></idTransaccion>
                        <!--Zero or more repetitions:-->
                        <listaUsuariosDestinatarios></listaUsuariosDestinatarios>
                        <!--Zero or more repetitions:-->
                        <listaUsuariosDestinatariosCopia></listaUsuariosDestinatariosCopia>
                        <!--Zero or more repetitions:-->
                        <listaUsuariosDestinatariosCopiaOculta></listaUsuariosDestinatariosCopiaOculta>
                        <!--Optional:-->
                        <mensajeDestinatario></mensajeDestinatario>
                        <!--Optional:-->
                        <referencia>DOCUMENTO PIN</referencia>
                        <!--Optional:-->
                        <sistemaOrigen>PIN</sistemaOrigen>
                        <!--Optional:-->
                        <tipoArchivo>pdf</tipoArchivo>
                        <!--Optional:-->
                        <usuario>${usuario}</usuario>
                    </request>
                </ar:generarDocumentoGEDO>
            </soapenv:Body>
        </soapenv:Envelope>
        `;

        //Genera un Documento con Firma
        await soapRequest({ method: 'POST', url: urlGenerarDocumento, headers: sampleHeaders, xml: xmlGenerarDocumentoGEDO })// Optional timeout parameter(milliseconds)
            .then(res => {
                parser.parseString(res.response.body, function (err, result) {
                    if (err) {
                        throw err;
                    }
                    else {
                        numeroDocumento = result['soap:Envelope']['soap:Body'][0]['ns2:generarDocumentoGEDOResponse'][0]['return'][0]['numero'][0]
                    }
                })
            })
            .catch((err) => { throw String(err) })

        let urlConsultaDocumento = process.env.GCBA_SADE + '/GEDOServices/consultaDocumento';

        //Debo consultar el 'numero especial'
        let xmlConsultaNumeroEspecial = `
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ar="http://ar.gob.gcaba.gedo.satra.services.external.consulta/">
            <soapenv:Header/>
            <soapenv:Body>
                <ar:consultarDocumentoPorNumero>
                    <request>
                        <numeroDocumento>${numeroDocumento}</numeroDocumento>
                        <usuarioConsulta>${usuario}</usuarioConsulta>
                    </request>
                </ar:consultarDocumentoPorNumero>
            </soapenv:Body>
            </soapenv:Envelope>
                `

        await soapRequest({ method: 'POST', url: urlConsultaDocumento, headers: sampleHeaders, xml: xmlConsultaNumeroEspecial })
            .then(res => {
                parser.parseString(res.response.body, function (err, result) {
                    if (err) {
                        throw err;
                    }
                    else {
                        if (tipoDocumento === 'IFTDI') {
                            numeroDocumento = result['soap:Envelope']['soap:Body'][0]['ns2:consultarDocumentoPorNumeroResponse'][0]['return'][0]['numeroDocumento'][0]
                        }
                        else {
                            numeroDocumento = result['soap:Envelope']['soap:Body'][0]['ns2:consultarDocumentoPorNumeroResponse'][0]['return'][0]['numeroEspecial'][0]
                        }
                    }

                })
            })
            .catch((err) => { throw String(err) })

        let xmlConsultaDocumento = `
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ar="http://ar.gob.gcaba.gedo.satra.services.external.consulta/">
            <soapenv:Header/>
            <soapenv:Body>
                <ar:consultarDocumentoPdf>
                    <request>
                        <numeroDocumento>${tipoDocumento === 'IFTDI' ? numeroDocumento : ''}</numeroDocumento>
                        <numeroEspecial>${tipoDocumento !== 'IFTDI' ? numeroDocumento : ''}</numeroEspecial>
                        <usuarioConsulta>${usuario}</usuarioConsulta>
                    </request>
                </ar:consultarDocumentoPdf>
            </soapenv:Body>
        </soapenv:Envelope>`

        //Traigo el base64
        await soapRequest({ method: 'POST', url: urlConsultaDocumento, headers: sampleHeaders, xml: xmlConsultaDocumento })
            .then(res => {
                /* console.log('firmaDirecta --> res2:', res) */
                parser.parseString(res.response.body, function (err, result) {
                    if (err) {
                        throw err;
                    }
                    else {
                        documentoGenerado = result['soap:Envelope']['soap:Body'][0]['ns2:consultarDocumentoPdfResponse'][0]['return'][0]
                    }
                })
                response = { base64: String(documentoGenerado), numero: String(numeroDocumento) };
            })
            .catch((err) => { throw String(err) })

    }
    catch (error) {
        console.log(error)
        parser.parseString(error, function (err, result) {
            throw (Error(result['soap:Envelope']['soap:Body'][0]['soap:Fault'][0]['faultstring'][0]))
        })
    }
    return response
}

module.exports = { traerPdfGEDO, traerPdfGEDONumeroEspecial, firmaDirectaDocumento }