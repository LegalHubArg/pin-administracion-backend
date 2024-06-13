const fs = require('fs');
const AWS = require('aws-sdk');
require('dotenv').config()

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    endpoint: process.env.AWS_ENDPOINT
    /*     bucketName: process.env.AWS_BUCKET_NAME,
        port: process.env.AWS_PORT     */
});

/* const fileName = 'prueba1.txt';

const uploadFile = () => {
    fs.readFile(fileName, (err, data) => {
        if (err) throw err;
        const params = {
            Bucket: 'proyecto-pin', // pass your bucket name
            Key: 'prueba1.txt',
            Body: JSON.stringify(data, null, 2)
        };
        s3.upload(params, function (s3Err, data) {
            if (s3Err) throw s3Err
            console.log(`File uploaded successfully at ${data.Location}`)
        });
    });
}; */

// subida de un archivo a s3 (SÓLO BOLETÍN)
async function subirArchivoBucketS3(req, res, next) {

    let usuario = req.body.usuario;
    let date = new Date;// AAAA-MM-DDTHH:MM:SS

    let type = (String(req.body.documentBinary)).split(';')[0].split(':')[1];
    let documento = req.body.documentBinary;
    let extension = '';

    //Manejo de extensiones del archivo
    switch (type.split('/')[0]) {
        case ('application'):
            switch (type.split('/')[1]) {
                case ('pdf'):
                    extension = '.pdf'
                    break;
                case ('msword'):
                    extension = '.doc'
                    break;
                case ('json'):
                    extension = '.json'
                    break;
                case ('zip'):
                    extension = '.zip'
                    break;
                case ('ogg'):
                    extension = '.ogg'
                    break;
            }
            break;
        case ('text'):
            switch (type.split('/')[1]) {
                case ('plain'):
                    extension = '.txt'
                    break;
                case ('css'):
                    extension = '.css'
                    break;
                case ('xml'):
                    extension = '.xml'
                    break;
                case ('html'):
                    extension = '.html'
                    break;
            }
            break;
        case ('image'):
            switch (type.split('/')[1]) {
                case ('jpeg'):
                    extension = '.jpeg'
                    break;
                case ('png'):
                    extension = '.png'
                    break;
                case ('gif'):
                    extension = '.gif'
                    break;
            }
            break;
    }

    let nombreDocumento = (req.body.nombre).split(`.${type.split('/')[1]}`)[0] + '-' +
        (date.toISOString()) + '-' +
        usuario + extension;

    if (type.split('/')[0] === 'text') {
        nombreDocumento = nombreDocumento.split('.txt').join('')
        nombreDocumento = nombreDocumento.split('.plain').join('') + '.txt';
    }
    if (type.split('/')[1] === 'msword') {
        nombreDocumento = nombreDocumento.split('.doc').join('')
        nombreDocumento = nombreDocumento.split('.msword').join('') + '.doc';
    }

    let buf = new Buffer.from(documento.replace(/^data:.+;base64,/, ""), 'base64')

    let params = {
        Key: nombreDocumento,
        Body: buf,
        Bucket: process.env.AWS_BUCKET_NAME,
        ContentType: type // Content-Type posibles valores: https://www.geeksforgeeks.org/http-headers-content-type/
    };

    s3.upload(params, function (err, data) {
        if (err) {
            console.log(err);
            console.log('Error uploading data: ', data);
            res.status(409).send(err.toString().split('already')[0] + nombreDocumento + ' ' + err.toString().split('Object ')[1])
        } else {
            console.log('Documento subido satisfactoriamente!', data);
            res.status(200).send(data)
        }
    });
}

// descarga de un archivo en (SOLO BOLETIN)
async function traerArchivoBucketS3(req, res, next) {
    try {
        console.log(req.body.nombre)
        let params = {
            Key: process.env.S3_BO_NORMAS + req.body.nombre,
            Bucket: process.env.AWS_BUCKET_NAME
        };
        function encode(data) {
            let buf = Buffer.from(data);
            let base64 = buf.toString('base64');
            return base64
        }
        let object = await s3.getObject(params).promise();
        res.status(200).send(encode(object.Body));
    }
    catch (e) {
        res.status(409).send({ mensaje: `No se encontró el documento "${req.body.nombre}"` })
    }
}

async function traerArchivoFirmadoBucketS3(req, res, next) {
    try {
        console.log(req.body.nombre)
        let params = {
            Key: process.env.S3_BO_FIRMADOS + req.body.nombre,
            Bucket: process.env.AWS_BUCKET_NAME
        };
        function encode(data) {
            let buf = Buffer.from(data);
            let base64 = buf.toString('base64');
            return base64
        }
        let object = await s3.getObject(params).promise();
        res.status(200).send(encode(object.Body));
    }
    catch (e) {
        res.status(409).send({ mensaje: `No se encontró el documento "${req.body.nombre}"` })
    }
}

// descarga de un archivo en (SDIN)
async function traerArchivoNormaSDIN(req, res, next) {
    try {
        console.log(req.body.nombre)
        let params = {
            Key: process.env.S3_SDIN_NORMAS + req.body.nombre,
            Bucket: process.env.AWS_BUCKET_NAME
        };
        function encode(data) {
            let buf = Buffer.from(data);
            let base64 = buf.toString('base64');
            return base64
        }
        let object = await s3.getObject(params).promise();
        res.status(200).send(encode(object.Body));
    }
    catch (e) {
        res.status(409).send({ mensaje: `No se encontró el documento "${req.body.nombre}"` })
    }
}

// descarga de un archivo en (Digesto)
async function traerArchivoDigesto(req, res, next) {
    try {
        console.log(req.body.nombre)
        let params = {
            Key: process.env.S3_DIGESTO + req.body.nombre,
            Bucket: process.env.AWS_BUCKET_NAME
        };
        function encode(data) {
            let buf = Buffer.from(data);
            let base64 = buf.toString('base64');
            return base64
        }
        let object = await s3.getObject(params).promise();
        res.status(200).send(encode(object.Body));
    }
    catch (e) {
        res.status(409).send({ mensaje: `No se encontró el documento "${req.body.nombre}"` })
    }
}

//elimina un archivo de s3
async function eliminarArchivoBucketS3(req, res) {
    let params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: req.body.nombre,
    };
    s3.deleteObject(params, function (err, data) {
        if (err) console.log(err, err.stack);
        else { console.log(data) };

    })
};

async function subirPdfBucketS3(base64, usuario, nombreDocumento, sin_timestamp) {

    let date = new Date; //AAAA-MM-DDTHH:MM:SS

    let key = nombreDocumento.split('.')[0] + '-' +
        (date.toISOString()) + '-' +
        usuario + '.pdf';

    if (sin_timestamp) {
        key = nombreDocumento;
    }

    let buf = new Buffer.from(base64, 'base64')

    let params = {
        Key: key,
        Body: buf,
        Bucket: process.env.AWS_BUCKET_NAME,
        ContentType: 'application/pdf'
    };

    let dataBucket = {}
    try {
        const stored = await s3.upload(params).promise()
        dataBucket = stored;
    }
    catch (e) {
        throw e
    }
    return dataBucket;
}

async function subirArchivo(base64, user, archivo) {
    let usuario = user;
    let date = new Date;// AAAA-MM-DDTHH:MM:SS

    let type = (String(base64)).split(';')[0].split(':')[1];
    let extension = '';

    //Manejo de extensiones del archivo
    switch (type.split('/')[0]) {
        case ('application'):
            switch (type.split('/')[1]) {
                case ('pdf'):
                    extension = '.pdf'
                    break;
                case ('msword'):
                    extension = '.doc'
                    break;
                case ('json'):
                    extension = '.json'
                    break;
                case ('zip'):
                    extension = '.zip'
                    break;
                case ('ogg'):
                    extension = '.ogg'
                    break;
            }
            break;
        case ('text'):
            switch (type.split('/')[1]) {
                case ('plain'):
                    extension = '.txt'
                    break;
                case ('css'):
                    extension = '.css'
                    break;
                case ('xml'):
                    extension = '.xml'
                    break;
                case ('html'):
                    extension = '.html'
                    break;
            }
            break;
        case ('image'):
            switch (type.split('/')[1]) {
                case ('jpeg'):
                    extension = '.jpeg'
                    break;
                case ('png'):
                    extension = '.png'
                    break;
                case ('gif'):
                    extension = '.gif'
                    break;
            }
            break;
    }

    let nombreDocumento = archivo.split(`.${type.split('/')[1]}`)[0] + '-' +
        (date.toISOString()) /*+ '-' +  usuario*/ + extension;

    if (type.split('/')[0] === 'text') {
        nombreDocumento = nombreDocumento.split('.txt').join('')
        nombreDocumento = nombreDocumento.split('.plain').join('') + '.txt';
    }
    if (type.split('/')[1] === 'msword') {
        nombreDocumento = nombreDocumento.split('.doc').join('')
        nombreDocumento = nombreDocumento.split('.msword').join('') + '.doc';
    }

    let buf = new Buffer.from(base64.replace(/^data:.+;base64,/, ""), 'base64')

    console.log("subiendo archivo a S3: " + nombreDocumento)

    let params = {
        Key: nombreDocumento,
        Body: buf,
        Bucket: process.env.AWS_BUCKET_NAME,
        ContentType: type
    };
    let dataBucket = {};
    try {
        const stored = await s3.upload(params).promise()
            .catch(err => {
                throw err.toString().split('already')[0] + nombreDocumento + ' ' + err.toString().split('Object ')[1]
            });
        dataBucket = stored;
    }
    catch (e) {
        throw e
    }
    return dataBucket;
}

async function traerArchivo(nombre) {
    let params = {
        Key: nombre,
        Bucket: process.env.AWS_BUCKET_NAME
    };

    let object = await s3.getObject(params).promise();
    return Buffer.from(object.Body);
}

async function copiarArchivo(source, target) {
    try {
        console.log("Copiando archivo: " + String(source) + " en " + String(target))
        
        const headParams = {
            Key: source,
            Bucket: process.env.AWS_BUCKET_NAME
        };

        // Verificar si el objeto existe
        await s3.headObject(headParams).promise();

        // Si el objeto existe, proceder con la copia
        let params = {
            Key: target,
            CopySource: encodeURI('/' + process.env.AWS_BUCKET_NAME + '/' + source),
            Bucket: process.env.AWS_BUCKET_NAME
        };

        let copia = await s3.copyObject(params).promise();
        console.log(copia)
        return;
    }
    catch (e) {
        throw e
    }
}

module.exports = {
    subirArchivoBucketS3,
    traerArchivoBucketS3,
    traerArchivoFirmadoBucketS3,
    eliminarArchivoBucketS3,
    subirPdfBucketS3,
    subirArchivo,
    traerArchivo,
    traerArchivoNormaSDIN,
    copiarArchivo,
    traerArchivoDigesto
}