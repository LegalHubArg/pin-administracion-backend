const soapRequest = require('easy-soap-request');

async function checkUsuarioSADE(req, res, next) {

    let usuario = parseInt(req.body.usuario); //cuitCuil

    //Parser XML
    let xml2js = require('xml2js');
    let parser = new xml2js.Parser();

    //Request Body
    let xml = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ext="http://external.service.eu.gcaba.gob.ar/">
        <soapenv:Header/>
            <soapenv:Body>
                <ext:consultaCuitCuil>
                    <consultaCuitCuilRequest>${usuario}</consultaCuitCuilRequest>
            </ext:consultaCuitCuil>
        </soapenv:Body>
    </soapenv:Envelope>`;

    //Request url
    let url = 'http://sade-mule.hml.gcba.gob.ar/EUServices/consultaCuitCuil'; //<----- url de QA

    //Request headers
    let sampleHeaders = {
        'Content-Type': 'text/xml',
        'Accept': 'application/xml'
    };

    let metadatos = {}

    let parsedData = {}

    try {
        let { response } = await soapRequest({ method: 'POST', url: url, headers: sampleHeaders, xml: xml, timeout: 2000 })// Optional timeout parameter(milliseconds)

        let { headers, body, statusCode } = response;

        parser.parseString(body, function (err, result) {//Extract the value from the data element
            parsedData = result['soap:Envelope']['soap:Body'][0]['ns2:consultaCuitCuilResponse'][0]['consultaCuitCuilResponse'][0]
        })

        metadatos.apellidoNombre = parsedData.apellidoNombre[0];
        //metadatos.cargo = parsedData.cargo[0]; 
        metadatos.usuario = parsedData.cuitCuil[0];
        metadatos.email = parsedData.email[0];
        //metadatos.reparticion = parsedData.reparticion[0];
        metadatos.existeEnSADE = true;

        req.metadatosSADE = metadatos;

        next();

    }
    catch (error) {
        parser.parseString(error, function (err, result) {//Extract the value from the data element
            parsedData = result['soap:Envelope']['soap:Body'][0]['soap:Fault'][0]['faultstring'][0]
        })
        res.status(409).send({ error: parsedData });
    }
}

module.exports = { checkUsuarioSADE };