const libre = require('libreoffice-convert');
libre.convertAsync = require('util').promisify(libre.convert);

// Convert it to pdf format with undefined filter 
//(see Libreoffice docs about filter) 
//https://help.libreoffice.org/latest/en-ZA/text/shared/guide/convertfilters.html

async function convertirConLibreOffice(req, res) {
    try {
        req.setTimeout(500000);
        const bufferEntrada = new Buffer.from(req.body.archivo, 'base64');
        const formatoSalida = req.body.formatoSalida;

        let bufferSalida = await libre.convertAsync(bufferEntrada, formatoSalida, undefined);

        res.status(200).send(bufferSalida)
    }
    catch (err) {
        console.log(err)
        res.status(400).send(err)
    }
}

module.exports = {
    convertirConLibreOffice
}