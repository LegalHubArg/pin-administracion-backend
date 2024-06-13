const { PDFDocument } = require("pdf-lib");
const html_pdf = require("html-pdf");
const { subirArchivo, traerArchivo } = require('../../helpers/functionsS3')
const moment = require('moment')

//Funcion para generar pdf con un html
async function crearContenido(htmlParam) {
    return new Promise((resolve, reject) => {
        const options = { format: 'A4', border: { left: "10mm", right: "10mm", top: "20mm", bottom: "25mm" }, type: 'pdf' };
        html_pdf.create(htmlParam, options).toBuffer(async (err, stream) => {
            if (err) {
                reject(err)
            } else {
                resolve(Buffer.from(stream))
            }
        });
    })
}

async function generarListadoAnexoI(normas) {
    return new Promise(async (resolve, reject) => {
        const anexoI = await PDFDocument.create(); // crea el archivo pdf
        if (normas.length > 0) {
            let caratula;
            const caratulaHtml = `
                <!DOCTYPE html>
                    <html>
                        <head>
                        <style>
                            body {
                                font-family: "Arial", sans-serif;
                            }
                            p {
                                text-align: center;
                                margin-top: 20px;
                                margin-bottom: 20px;
                                font-size: 12px;
                                font-weight: bold;
                            }
                        </style>
                        </head>
                        <body>
                            <p>ANEXO I</p>
                            <p>LISTADO DE ORDENANZAS, LEYES, DECRETOS-ORDENANZAS Y DECRETOS DE
                            NECESIDAD Y URGENCIA DE ALCANCE GENERAL Y CARÁCTER PERMANENTE VIGENTES</p>
                        </body>
                    </html>`;
            //Genero el pdf de la carátula
            caratula = await crearContenido(caratulaHtml);
            const caratulaPdf = await PDFDocument.load(caratula);
            const pages = await anexoI.copyPages(caratulaPdf, caratulaPdf.getPageIndices());
            pages.forEach((page) => {
                anexoI.addPage(page); // Agrego la carátula al pdf del anexo I
            });
            let normasDeLaTabla = ``;
            let idRamaControl = null;
            for (const norma of normas) { //el array viene ordenado por idRama, idNormaTipo, normaNumero
                if (norma.idRama === idRamaControl) {
                    normasDeLaTabla = normasDeLaTabla + `<tr>
                        <td>${norma.normaTipo}</td>
                        <td>${norma.normaNumero}</td>
                        <td>${norma.temasGenerales}</td>
                    </tr>`;
                }
                else {
                    idRamaControl = norma.idRama;
                    normasDeLaTabla = normasDeLaTabla + `
                        </tbody>
                    </table>
                    <p>RAMA: ${norma.rama} </p>
                    <table>
                        <thead>
                            <tr>
                                <th>NORMATIVA</th>
                                <th>NÚMERO/FECHA SANCIÓN</th>
                                <th>TEMA</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>${norma.normaTipo || " - "}</td>
                                <td>${norma.normaNumero || " - "}</td>
                                <td>${norma.temasGenerales || " - "}</td>
                            </tr>`;
                }
            }
            let tablas = `
                <!DOCTYPE html>
                <html>
                    <head>
                    <style>
                        body {
                            font-family: "Arial", sans-serif;
                        }
                        p {
                            text-align: center;
                            margin-top: 20px;
                            margin-bottom: 20px;
                            font-size: 10px;
                            font-weight: bold;
                        }
                        table {
                            border: 1px solid black;
                            margin-bottom: 30px;
                            text-align: justify;
                            font-size: 10px;
                            border-collapse: collapse;
                            width: 100%
                        }
                        th, td {
                            border: 1px solid black;
                            text-align: center;
                            padding: 5px;
                        }
                    </style>
                    </head>
                    <body>
                                ${normasDeLaTabla} 
                            </tbody>
                        </table>
                    </body>
                </html>
            `;
            let htmlContenido = await crearContenido(tablas);
            const pdf = await PDFDocument.load(htmlContenido);
            const pagesContenido = await anexoI.copyPages(pdf, pdf.getPageIndices());
            for await (const p of pagesContenido) {
                anexoI.addPage(p)
            }
        }
        const pdfBytes = await anexoI.save() //crea un array de bytes del pdf
        resolve(Buffer.from(pdfBytes)); //crea el buffer con el array anterior
    }
    )
};

async function generarAnexoIPorRama(normas) {
    return new Promise(async (resolve, reject) => {
        const anexoI = await PDFDocument.create();
        if (normas.length > 0) {
            let caratula;
            const caratulaHtml = `
                <!DOCTYPE html>
                    <html>
                        <head>
                        <style>
                            body {
                                font-family: "Arial", sans-serif;
                            }
                            p {
                                text-align: center;
                                margin-top: 20px;
                                margin-bottom: 20px;
                                font-size: 12px;
                                font-weight: bold;
                            }
                        </style>
                        </head>
                        <body>
                            <p>ANEXO I</p>
                            <p>ORDENANZAS, LEYES, DECRETOS-ORDENANZAS Y 
                            DECRETOS DE NECESIDAD YURGENCIA DE ALCANCE GENERAL Y CARÁCTER PERMANENTE</p>
                            <p>RAMA: ${normas[0].rama}</p>
                        </body>
                    </html>`;
            caratula = await crearContenido(caratulaHtml);
            const caratulaPdf = await PDFDocument.load(caratula);
            const pages = await anexoI.copyPages(caratulaPdf, caratulaPdf.getPageIndices());
            pages.forEach((page) => {
                anexoI.addPage(page); // Agrego la carátula al pdf del anexo I
            });
            for (const norma of normas) {
                let documento = await traerArchivo(norma.archivoS3).catch(err => { throw err });
                const pdf = await PDFDocument.load(documento);
                const copiedPages = await anexoI.copyPages(pdf, pdf.getPageIndices());
                copiedPages.forEach((page) => {
                    anexoI.addPage(page);
                });
            }
        }
        const pdfBytes = await anexoI.save() //crea un array de bytes del pdf
        resolve(Buffer.from(pdfBytes)); //crea el buffer con el array anterior
    }
    )
};

async function generarAnexoII(normas) {
    return new Promise(async (resolve, reject) => {
        let buf;
        if (normas.length > 0) {
            let normasDeLaTabla = ``;
            for (const norma of normas) {
                normasDeLaTabla = normasDeLaTabla + `<tr>
                <td>${norma.normaTipo || ''}</td>
                <td>${norma.normaNumero || ''}</td>
                <td>${norma.fechaSancion ? moment(norma.fechaSancion).format('DD/MM/YYYY') : ''}</td>
                <td>${'Abrogada por'}</td>
                <td>${norma.normaTipoActiva || ''}</td>
                <td>${norma.normaNumeroActiva || ''}</td>
                <td>${norma.fechaSancionActiva ? moment(norma.fechaSancionActiva).format('DD/MM/YYYY') : ''}</td>
                <td>${''}</td>
                <td>${''}</td>
                </tr>`;
            }
            const html = `
                <!DOCTYPE html>
                    <html>
                        <head>
                        <style>
                            body {
                                font-family: "Arial", sans-serif;
                            }
                            p {
                                text-align: center;
                                margin-top: 20px;
                                margin-bottom: 20px;
                                font-size: 10px;
                                font-weight: bold;
                            }
                            table {
                                border: 1px solid black;
                                margin-bottom: 30px;
                                text-align: justify;
                                font-size: 10px;
                                border-collapse: collapse;
                                width: 100%
                            }
                            th, td {
                                border: 1px solid black;
                                text-align: center;
                                padding: 5px;
                            }
                        </style>
                        </head>
                        <body>
                            <p>ANEXO II</p>
                            <p>LISTADO DE ORDENANZAS, LEYES, DECRETOS-ORDENANZAS Y DECRETOS DE NECESIDAD 
                            Y URGENCIA DE ALCANCE GENERAL Y CARÁCTER PERMANENTE ABROGADOS EXPRESAMENTE</p>
                            <table>
                            <thead>
                                <tr>
                                    <th>TIPO</th>
                                    <th>NÚMERO</th>
                                    <th>FECHA</th>
                                    <th>ACCIÓN</th>
                                    <th>TIPO</th>
                                    <th>NÚMERO</th>
                                    <th>FECHA</th>
                                    <th>ART.</th>
                                    <th>ANEXO</th>
                                </tr>
                            </thead>
                            <tbody>
                               ${normasDeLaTabla} 
                            </tbody>
                        </table>
                        </body>
                    </html>`;
            buf = await crearContenido(html);
        }
        resolve(buf)
    })
}
async function generarAnexoIII(normas) {
    return new Promise(async (resolve, reject) => {
        const anexoIII = await PDFDocument.create();

        if (normas.length > 0) {
            let caratula;
            const caratulaHtml = `
                <!DOCTYPE html>
                    <html>
                        <head>
                        <style>
                            body {
                                font-family: "Arial", sans-serif;
                            }
                            p {
                                text-align: center;
                                margin-top: 20px;
                                margin-bottom: 20px;
                                font-size: 12px;
                                font-weight: bold;
                            }
                        </style>
                        </head>
                        <body>
                            <p>ANEXO III</p>
                            <p>LISTADO DE ORDENANZAS, LEYES, DECRETOS-ORDENANZAS Y DECRETOS DE
                            NECESIDAD Y URGENCIA DE ALCANCE GENERAL Y CARACTER PERMANENTE ABROGADOS IMPLÍCITAMENTE
                            </p>
                        </body>
                    </html>`;

            //Genero el pdf de la carátula
            caratula = await crearContenido(caratulaHtml);
            const caratulaPdf = await PDFDocument.load(caratula);
            const pages = await anexoIII.copyPages(caratulaPdf, caratulaPdf.getPageIndices());
            pages.forEach((page) => {
                anexoIII.addPage(page); // Agrego la carátula al pdf del anexo I
            });

            let htmlNormas = ``;
            let buffersNormas = [];
            let idRamaControl = null;

            //Ciclo sobre las normas (vienen ordenadas por idRama)
            for (let i = 0; i < normas.length; i++) {
                if (normas[i].idRama === idRamaControl) {
                    let documento = await traerArchivo(normas[i].archivoS3).catch(err => { throw err });
                    buffersNormas.push(documento);
                    htmlNormas += `<tr>
                        <td>${normas[i].normaTipo}</td>
                        <td>${normas[i].normaNumero}</td>
                        <td>${normas[i].normaTipoActiva}</td>
                        <td>${normas[i].normaNumeroActiva}</td>
                    </tr>`;
                }
                else {
                    if (idRamaControl !== null) { //Controla que no sea la primera iteración
                        htmlNormas += `</tbody></table><p>FUNDAMENTACIÓN PROPUESTA DE ABROGACIÓN IMPLICITA</p></body></html>`;
                        let htmlContenido = await crearContenido(htmlNormas);
                        const pdf = await PDFDocument.load(htmlContenido);
                        const pagesContenido = await anexoIII.copyPages(pdf, pdf.getPageIndices());
                        for await (const p of pagesContenido) {
                            anexoIII.addPage(p)
                        }
                        for (const buf of buffersNormas) {
                            const pdf = await PDFDocument.load(buf);
                            const pagesContenido = await anexoIII.copyPages(pdf, pdf.getPageIndices());
                            for await (const p of pagesContenido) {
                                anexoIII.addPage(p)
                            }
                        }
                        buffersNormas = [];
                    }
                    idRamaControl = normas[i].idRama;
                    htmlNormas = `
                        <!DOCTYPE html>
                        <html>
                            <head>
                            <style>
                                body {
                                    font-family: "Arial", sans-serif;
                                    font-size: 10px;
                                }
                                p {
                                    text-align: center;
                                    margin-top: 20px;
                                    margin-bottom: 20px;
                                    font-weight: bold;
                                }
                                table {
                                    border: 1px solid black;
                                    margin-bottom: 30px;
                                    text-align: justify;
                                    border-collapse: collapse;
                                    width: 100%;
                                }
                                th, td {
                                    border: 1px solid black;
                                    text-align: center;
                                    padding: 5px;
                                }
                            </style>
                            </head>
                            <body>
                                <p>RAMA: ${normas[i].rama} </p>
                                <table>
                                    <thead>
                                        <tr>
                                            <th colspan="2">NORMAS ABROGADAS</th>
                                            <th colspan="2">NORMAS ABROGANTES</th>
                                        </tr>
                                    </thead>
                                    <thead>
                                        <tr>
                                            <th>TIPO DE NORMA</th>
                                            <th>NÚMERO DE NORMA / FECHA DE NORMA</th>
                                            <th>TIPO DE NORMA</th>
                                            <th>NÚMERO DE NORMA / FECHA DE NORMA</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>${normas[i].normaTipo}</td>
                                            <td>${normas[i].normaNumero}</td>
                                            <td>${normas[i].normaTipoActiva}</td>
                                            <td>${normas[i].normaNumeroActiva}</td>
                                        </tr>
                                    `;
                    let documento = await traerArchivo(normas[i].archivoS3).catch(err => { throw err });
                    buffersNormas.push(documento);
                }
                if (i + 1 === normas.length) {
                    htmlNormas += `</tbody></table><p>FUNDAMENTACIÓN PROPUESTA DE ABROGACIÓN IMPLICITA</p></body></html>`;
                    let htmlContenido = await crearContenido(htmlNormas);
                    const pdf = await PDFDocument.load(htmlContenido);
                    const pagesContenido = await anexoIII.copyPages(pdf, pdf.getPageIndices());
                    for await (const p of pagesContenido) {
                        anexoIII.addPage(p)
                    }
                    for (const buf of buffersNormas) {
                        const pdf = await PDFDocument.load(buf);
                        const pagesContenido = await anexoIII.copyPages(pdf, pdf.getPageIndices());
                        for await (const p of pagesContenido) {
                            anexoIII.addPage(p)
                        }
                    }
                    buffersNormas = [];
                }
            }
        }
        const pdfBytes = await anexoIII.save() //crea un array de bytes del pdf
        resolve(Buffer.from(pdfBytes)) //crea el buffer con el array anterior
    })
}
async function generarAnexoIV(normas) {
    return new Promise(async (resolve, reject) => {
        const anexoIV = await PDFDocument.create();
        if (normas.length > 0) {
            let caratula;
            const caratulaHtml = `
                <!DOCTYPE html>
                    <html>
                        <head>
                        <style>
                            body {
                                font-family: "Arial", sans-serif;
                            }
                            p {
                                text-align: center;
                                margin-top: 20px;
                                margin-bottom: 20px;
                                font-size: 12px;
                                font-weight: bold;
                            }
                        </style>
                        </head>
                        <body>
                            <p>ANEXO IV</p>
                            <p>LISTADO DE ORDENANZAS, LEYES, DECRETOS - ORDENANZAS Y DECRETOS DE
                            NECESIDAD Y URGENCIA DE ALCANCE GENERAL Y CARÁCTER PERMANENTE CADUCOS
                            POR CUMPLIMIENTO DE OBJETO O CONDICIÓN Y POR FUSIÓN ENTRE EL 01/03/2018 Y EL
                            31/08/2020                            
                            </p>
                        </body>
                    </html>`;
            //Genero el pdf de la carátula
            caratula = await crearContenido(caratulaHtml);
            const caratulaPdf = await PDFDocument.load(caratula);
            const pages = await anexoIV.copyPages(caratulaPdf, caratulaPdf.getPageIndices());
            pages.forEach((page) => {
                anexoIV.addPage(page); // Agrego la carátula al pdf del anexo I
            });
            let htmlNormas = ``;
            let buffersNormas = [];
            let idRamaControl = null;

            //Ciclo sobre las normas (vienen ordenadas por idRama)
            for (let i = 0; i < normas.length; i++) {
                if (normas[i].idRama === idRamaControl) {
                    let documento = await traerArchivo(normas[i].archivoS3).catch(err => { throw err });
                    buffersNormas.push(documento);
                    htmlNormas += `<tr>
                        <td>${normas[i].normaTipo || " - "}</td>
                        <td>${normas[i].normaNumero || " - "}</td>
                        <td>${normas[i].causal || " - "}</td>
                    </tr>`;
                }
                else {
                    if (idRamaControl !== null) { //Controla que no sea la primera iteración
                        htmlNormas += `</tbody></table><p>FUNDAMENTACIÓN PROPUESTA DE ABROGACIÓN IMPLICITA</p></body></html>`;
                        let htmlContenido = await crearContenido(htmlNormas);
                        const pdf = await PDFDocument.load(htmlContenido);
                        const pagesContenido = await anexoIV.copyPages(pdf, pdf.getPageIndices());
                        for await (const p of pagesContenido) {
                            anexoIV.addPage(p)
                        }
                        for (const buf of buffersNormas) {
                            const pdf = await PDFDocument.load(buf);
                            const pagesContenido = await anexoIV.copyPages(pdf, pdf.getPageIndices());
                            for await (const p of pagesContenido) {
                                anexoIV.addPage(p)
                            }
                        }
                        buffersNormas = [];
                    }
                    idRamaControl = normas[i].idRama;
                    htmlNormas = `
                        <!DOCTYPE html>
                        <html>
                            <head>
                            <style>
                                body {
                                    font-family: "Arial", sans-serif;
                                    font-size: 10px;
                                }
                                p {
                                    text-align: center;
                                    margin-top: 20px;
                                    margin-bottom: 20px;
                                    font-weight: bold;
                                }
                                table {
                                    border: 1px solid black;
                                    margin-bottom: 30px;
                                    text-align: justify;
                                    border-collapse: collapse;
                                    width: 100%;
                                }
                                th, td {
                                    border: 1px solid black;
                                    text-align: center;
                                    padding: 5px;
                                }
                            </style>
                            </head>
                            <body>
                                <p>RAMA: ${normas[i].rama} </p>
                                <table>
                                    <thead>
                                        <tr>
                                            <th colspan="2">NORMA CADUCA</th>
                                            <th rowspan="2" width="50%" >CAUSAL</th>
                                        </tr>
                                        <tr>
                                            <th>TIPO DE NORMA</th>
                                            <th>NÚMERO DE NORMA</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>${normas[i].normaTipo || " - "}</td>
                                            <td>${normas[i].normaNumero || " - "}</td>
                                            <td>${normas[i].causal || " - "}</td>
                                        </tr>

                                    `;
                    let documento = await traerArchivo(normas[i].archivoS3).catch(err => { throw err });
                    buffersNormas.push(documento);
                }
                if (i + 1 === normas.length) {
                    htmlNormas += `</tbody></table><p>FUNDAMENTACIÓN PROPUESTA DE ABROGACIÓN IMPLICITA</p></body></html>`;
                    let htmlContenido = await crearContenido(htmlNormas);
                    const pdf = await PDFDocument.load(htmlContenido);
                    const pagesContenido = await anexoIV.copyPages(pdf, pdf.getPageIndices());
                    for await (const p of pagesContenido) {
                        anexoIV.addPage(p)
                    }
                    for (const buf of buffersNormas) {
                        const pdf = await PDFDocument.load(buf);
                        const pagesContenido = await anexoIV.copyPages(pdf, pdf.getPageIndices());
                        for await (const p of pagesContenido) {
                            anexoIV.addPage(p)
                        }
                    }
                    buffersNormas = [];
                }
            }
        }
        const pdfBytes = await anexoIV.save() //crea un array de bytes del pdf
        resolve(Buffer.from(pdfBytes)) //crea el buffer con el array anterior
    })
}

module.exports = {
    generarListadoAnexoI,
    generarAnexoIPorRama,
    generarAnexoII,
    generarAnexoIII,
    generarAnexoIV
}