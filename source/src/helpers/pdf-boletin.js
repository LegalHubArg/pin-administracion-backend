const moment = require('moment')
const sanitizeHtml = require('sanitize-html');
const { PDFDocument, StandardFonts, rgb, PageSizes } = require("pdf-lib");
const path = require('path');
const fs = require('fs');
const pdf = require("html-pdf");
const HTMLtoDOCX = require('html-to-docx');

const html_to_pdf = require('html-pdf-node');
const PDFParser = require("pdf2json");

const ArialFontSize = 11;

const { traerAnexosPorIdNorma } = require('../controllers/BO/NormasFunctions')

//parsearPDF: Toma el Buffer de un PDF y devuelve {rawText:'...', data: {}}
async function parsearPDF(pdfBuffer) {

  const pdfParser = new PDFParser(this, 1); //pdf2json

  pdfParser.parseBuffer(pdfBuffer); //parsea el Buffer (para evitar crear archivos provisorios)
  //alternativa: pdfParser.loadPDF("./ejemplo.pdf")

  return new Promise(async (resolve, reject) => {

    pdfParser.on("pdfParser_dataError", errData => reject(errData.parserError))
    pdfParser.on("pdfParser_dataReady", (pdfData) => {
      const raw = pdfParser.getRawTextContent().replace(/\r\n/g, "");
      resolve({
        rawText: raw, //guardo el texto crudo
        data: pdfData //guardo la data del pdf
      })
    });
  })
}

async function generarTapa(pdfDoc, unaTapa, unNumero, unaFecha) {
  const unaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const imageTapa = await pdfDoc.embedPng(unaTapa)
  //A4 TAPA
  const page = pdfDoc.addPage(PageSizes.a4)

  const { width, height } = page.getSize()
  const fontSize = 17

  page.drawImage(imageTapa, {
    x: 0,
    y: 0,
    width: width,
    height: height,
  });
  //NUMERO DE BOLETIN
  page.drawText('N° ' + unNumero, {
    x: 214,
    y: height - 8.4 * fontSize,
    size: fontSize,
    font: unaFont,
    color: rgb(0, 0, 0),
  })
  //FECHA DE BOLETIN
  page.drawText(unaFecha, {
    x: 300,
    y: height - 8.4 * fontSize,
    size: fontSize,
    font: unaFont,
    color: rgb(0, 0, 0),
  })

  return pdfDoc

}

async function generarContratapa(pdfDoc, unaContratapa) {
  const imageContratapa = await pdfDoc.embedPng(unaContratapa)
  //A4 CONTRATAPA
  const page = pdfDoc.addPage(PageSizes.a4)

  const { width, height } = page.getSize()

  page.drawImage(imageContratapa, {
    x: 0,
    y: 0,
    width: width,
    height: height,
  });


  return pdfDoc

}
async function generarContenidoIndividual(normaHTML) {
  return new Promise((resolve, reject) => {



    /* const clean = sanitizeHtml(normaHTML, {
      allowedTags: [ 'b','strong', 'a', 'p', 'br'],
      allowedAttributes: {
        'p': [ 'align', 'style' ]
      },
      
    }); */





    const unaBase = `file://${path.resolve('../assets')}`;
    let options = {
      localUrlAccess: true,
      loadImages: true,
      base: unaBase,
      format: 'A4',
      scale: 1,
      border: {
        left: "30mm",
        right: "30mm",
        top: "55mm",
        bottom: "25mm"
      },
      type: 'pdf',
    };

    let unContent = `<!DOCTYPE html>
    <html>
    <head>
        <style>
          
        body {
            font-family: "Arial", sans-serif;
            font-size: ${ArialFontSize.toString() + 'px'};
            line-height: normal;
        }
         p {
          margin: 4px 0 4px 0;
          text-align: justify;
        } 
         table {
          max-width: 100%;
          text-align: justify;
          margin: 0px;
        } 
        td{
          border: 1px solid #343334;
        }
        </style>
    </head>
    <body>
        ${normaHTML}
    </body>
    </html>`;


    pdf.create(unContent, options).toBuffer(async (err, stream) => {
      if (err) {
        reject(err)
      } else {
        let buf = await Buffer.from(stream);
        resolve(buf)

      }
    });

  })


}

async function generarPDFdeHTML(html, header_data) {
  return new Promise((resolve, reject) => {
    const header_html = `
    <style>
      .header {
        text-align: center;
        font-size: 6;
        width: 100%;
        padding-top: 10mm;
        margin-top: 0px;
        margin-bottom: 0px;
      }
      #fecha {
        position: absolute;
        left: 0px;
      }
      #pagina {
        position: absolute;
        right: 0px;
      }
    </style>
    <div class="header">
      <span id="fecha">N° ${header_data?.numero} - ${header_data?.fecha}</span>
      <span id="titulo">Boletín Oficial de la Ciudad de Buenos Aires</span>
      <span id="pagina">Página {{page}}</span>
    </div>`
    const unaBase = `file://${path.resolve('../assets')}`;
    let options = {
      localUrlAccess: true,
      loadImages: true,
      base: unaBase,
      format: 'A4',
      scale: 1,
      border: {
        left: "15mm",
        right: "15mm",
        // top: "35mm",
        bottom: "35mm"
      },
      type: 'pdf',
      header: { height: "33mm", contents: header_html, paginationOffset: header_data?.totalPaginas }
    };

    let unContent = '';
    if (!html) {
      unContent = '<p></p>'
    }

    unContent = `<!DOCTYPE html>
    <html>
    <head>
        <style>
        
        body {
          font-family: "Arial", sans-serif;
          font-size: ${ArialFontSize.toString() + 'px'};
          line-height: normal;
          width:80%;
          margin: 0 auto; 
          text-align: center; 
      }
      p {
        margin: 4px 0 4px 0;
        text-align: justify;
      } 
       table {
        max-width: 100%;
        text-align: justify;
        margin: 0px;
      } 
      td{
        border: 1px solid #343334;
      }
        </style>
    </head>
    <body>
        ${html}
    </body>
    </html>`;
    pdf.create(unContent, options).toBuffer(async (err, stream) => {
      if (err) {
        reject(err)
      } else {
        let buf = await Buffer.from(stream);
        resolve(buf)

      }
    });

  })


}

async function generarContenido(normas, header_data) {
  return new Promise(async (resolve, reject) => {
    const header_html = `
    <style>
      .header {
        text-align: center;
        font-size: 6;
        width: 100%;
        padding-top: 10mm;
        margin-top: 0px;
        margin-bottom: 0px;
      }
      #fecha {
        position: absolute;
        left: 0px;
      }
      #pagina {
        position: absolute;
        right: 0px;
      }
    </style>
    <div class="header">
      <span id="fecha">N° ${header_data.numero} - ${header_data.fecha}</span>
      <span id="titulo">Boletín Oficial de la Ciudad de Buenos Aires</span>
      <span id="pagina">Página {{page}}</span>
    </div>`
    const unaBase = `file://${path.resolve('../assets')}`;
    let options = {
      localUrlAccess: true,
      loadImages: true,
      base: unaBase,
      format: 'A4',
      scale: 1,
      border: {
        left: "15mm",
        right: "15mm",
        // top: "35mm",
        bottom: "35mm"
      },
      type: 'pdf',
      header: { height: "33mm", contents: header_html, paginationOffset: header_data?.totalPaginas }
    };

    let unContent = '';
    let idSeccionActual = null;
    let idNormaTipoActual = null;
    let OrganismoActual = null;
    for (let i = 0; i < normas.length; i++) {
      let request = {}
      request.idNorma = normas[i].idNorma;
      let anexos
      if (normas[i].anexos){
        anexos = normas[i].anexos
      }else{
        anexos = await traerAnexosPorIdNorma(request)
      } 
      if (normas[i].idSeccion !== idSeccionActual) {
        idSeccionActual = normas[i].idSeccion;
        unContent += `<h2 style="
          background-color: #383434;
          font-family: 'Arial', sans-serif;
          line-height: normal;
          text-align: center;
          padding: 5px;
          color: #ffffff;
          margin: 0;">
            ${normas[i].seccion}
          </h2>`
      }

      if (normas[i].idNormaTipo !== idNormaTipoActual) {
        idNormaTipoActual = normas[i].idNormaTipo;
        unContent += `<h3 style="
          background-color: #636363;
          font-family: 'Arial', sans-serif;
          line-height: normal;
          padding: 5px;
          text-align: center;
          color: #ffffff;
          margin: 0">
            ${normas[i].normaTipo}
          </h3>`
      }

      if (normas[i].organismoEmisor !== OrganismoActual) {
        OrganismoActual = normas[i].organismoEmisor;
        unContent += `<h3 style="
        background-color: #aaaaaa;
        font-family: 'Arial', sans-serif;
        line-height: normal;
        padding: 5px;
        text-align: center;
        color: #ffffff;
        margin: 0 0 15px 0">
              ${normas[i].reparticion}
          </h3>`
      }

      let linkAnexos = '';
      for (let j = 0; j < anexos.length; j++) {
        linkAnexos += `<a href="${process.env.DOCUMENTOS_PUBLICOS_BO}${anexos[j].archivoPublico}" target="_blank" style="font-weight: bold !important; outline: none !important; text-decoration: none !important; color: #000 !important; font-size: 14px !important; margin-right: 10px !important;">
                        ANEXO ${anexos.length > 1 ? j + 1 : ''}</a>
                      `;
      }


      // Luego, envuelve los enlaces en un contenedor div con margen superior e inferior de 1 cm (aproximadamente 37.8 píxeles)
      linkAnexos = `<div style="text-align: center; margin-bottom: 37.8px !important;">${linkAnexos}</div>`;

      let divNorma = 'selector-' + String(normas[i].idNorma) + 'nm'
      unContent += '<div id="' + divNorma + '">'
      if (normas[i].pagina === undefined) {
        unContent += `<p style='float: right; font-size:1px'>-idNorma${normas[i].idNorma}-</p>`;
      }
      unContent += String(normas[i].normaDocumento) + '<p>&nbsp;</p></div>' + linkAnexos
      //unContent += String(normas[i].normaDocumento) + '<br>'
    }


    /*     unContent += '<h3>INDICE:</h3>'
    
        //INDICE
        for (let i = 0; i < normas.length; i++) {
          let divNorma = 'selector-' + String(normas[i].idNorma) + 'nm'
          unContent += '<a href="#' + divNorma + '">' + String(normas[i].normaAcronimoReferencia) + '<p>&nbsp;</p><p>&nbsp;</p></a>'
          //unContent += String(normas[i].normaDocumento) + '<br>'
        } */

    if (normas.length === 0) {
      unContent = '<p></p>'
    }

    /* console.log(unContent) */

    unContent = `<!DOCTYPE html>
    <html>
    <head>
        <style>
        
        body {
          font-family: "Arial", sans-serif;
          font-size: ${ArialFontSize.toString() + 'px'};
          line-height: normal;
          width:80%;
          margin: 0 auto; 
          text-align: center; 
      }
      p {
        margin: 4px 0 4px 0;
        text-align: justify;
      } 
       table {
        max-width: 100%;
        text-align: justify;
        margin: 0px;
      } 
      td{
        border: 1px solid #343334;
      }
        </style>
    </head>
    <body>
        ${unContent}
    </body>
    </html>`;
    //html-pdf
    pdf.create(unContent, options).toBuffer(async (err, stream) => {
      if (err) {
        reject(err)
      } else {
        let buf = await Buffer.from(stream);
        resolve(buf)

      }
    });

    /*     options = { format: 'A4',
                    preferCSSPageSize: true,
                    margin: {
                      left: "30mm",
                      right: "30mm",
                      top: "65mm",
                      bottom: "25mm"
                    },
                   };
    
    
        let file = { content: unContent };
        console.log('elHTML', unContent)
        //html-pdf-node  puppeter
        html_to_pdf.generatePdf(file, options).then(async pdfBuffer => {
          try{
            let buf = await Buffer.from(pdfBuffer);
            resolve(buf)
          }
          catch(err){
            reject(err)
          }
        }); */


  })


}

async function generarSumario(normas) {
  return new Promise((resolve, reject) => {
    const unaBase = `file://${path.resolve('../assets')}`;
    let options = {
      localUrlAccess: true,
      loadImages: true,
      base: unaBase,
      format: 'A4',
      scale: 1,
      border: {
        left: "20mm",
        right: "20mm",
        top: "20mm",
        bottom: "20mm"
      },
      type: 'pdf',
    };

    let unContent = '';
    let idSeccionActual = null;
    let idNormaTipoActual = null;
    let idOrganismoActual = null;
    for (let i = 0; i < normas.length; i++) {
      let subtipo = String(normas[i].normaTipo);
      if (!normas[i].es_poder) {
        subtipo += '/' + normas[i].normaSubtipo;
      }

      if (normas[i].idSeccion !== idSeccionActual) {
        idSeccionActual = normas[i].idSeccion;
        unContent += `<h2 style="
          background-color: #636363;
          font-family: 'Arial', sans-serif;
          line-height: normal;
          padding: 15px;
          text-align: center;
          color: #ffffff;
          margin: 0;">
            ${normas[i].seccion}
          </h2>`
      }

      if (normas[i].idNormaTipo !== idNormaTipoActual && normas[i].es_poder) {
        idNormaTipoActual = normas[i].idNormaTipo;
        unContent += `<h3 style="
          background-color: #aaaaaa;
          font-family: 'Arial', sans-serif;
          line-height: normal;
          padding: 5px;
          text-align: center;
          color: #ffffff;
          margin: 0">
            ${normas[i].normaTipo}
          </h3>`
      }

      if (normas[i].idReparticion !== idOrganismoActual) {
        idOrganismoActual = normas[i].idReparticion;
        unContent += `<h4 style="font-family: 'Arial', sans-serif;
          line-height: normal;
          padding: 20px 0 0 0;
          text-align: left;
          color: #000000;
          font-weight: bold;
          margin: 0;
          margin-bottom:20px;">
              ${normas[i].reparticiones}
          </h4>`
      }



      unContent += `
        <a href="#selector-${String(normas[i].idNorma)}nm">
          ${String(subtipo) + ' N°' + String(normas[i].normaNumero) + '/' + String(normas[i].organismoEmisor) + '/' + String(normas[i].normaAnio)}
        </a>
        
        <p>
          <span class="norma-sumario">
            ${String(normas[i].normaSumario).charAt(0).toUpperCase() + String(normas[i].normaSumario).slice(1) /* POR SI LA PRIMERA NO ES MAYUSCULA */}
          </span>
        `
      if (normas[i].pagina) {
        let pag = normas[i].pagina
        unContent += `
          <span class="pagina">
            Pág. ${pag + 1}
          </span>
        </p>
      
`
      }
      else {
        unContent += `
        <span class="pagina">Pág. xxx</span>
      </p>
`
      }




      if (i + 1 < normas.length) {
        if (normas[i + 1].organismoEmisor !== normas[i].organismoEmisor) {
          unContent += `<br/>`
        }
      }
      if (i + 1 < normas.length) {
        if (normas[i + 1].idNormaTipo !== normas[i].idNormaTipo) {
          unContent += `<br/>`
        }
      }
    }


    if (normas.length === 0) {
      unContent = '<p></p>'
    }


    unContent = `<!DOCTYPE html>
    <html>
    <head>
      <style>
        *,
        *:after,
        *:before {
          box-sizing: border-box;
          -moz-box-sizing: border-box;
        }

        * {
          margin: 0;
          padding: 0;
          border: 0 none;
          position: relative;
        }

        body {
          font-family: "Arial", sans-serif;
          font-size: ${ArialFontSize.toString() + 'px'};
          line-height: normal;
        }
      
        a {
          line-height: normal;
          padding: 20px 0 0 0;
          text-align: left;
          color: #000000;
          font-weight: normal;
          margin: 0;
          text-decoration:none;
        }

        p {
          width: 100%;
          max-width: 40rem;
          min-width: 100px;
          margin: 0 auto;
          font-size: 9px;
          line-height: normal;
          padding: 4px 0 0 0;
        }
            
        p:before {
          content: '';
          position: absolute;
          bottom: .1rem;
          width: 100%;
          height: 0;
          line-height: 0;
          border-bottom: 1px dotted #333;
        }
    
        .norma-sumario {
          width: 30px;
          background-color: white;
          display: inline;
          z-index: 1;
        }
    
        .pagina {
          background-color: white;
          position: absolute;
          display: inline;
          bottom: 0;
          right: 0;
          text-align: right;
          z-index: 2;
        }
      </style>
    </head>
    <body>
    <h2 style="
      background-color: #000000;
      font-family: 'Arial', sans-serif;
      line-height: normal;
      padding: 15px;
      text-align: center;
      color: #ffffff;
      margin: 0;
    ">Sumario</h2>
        ${unContent}
    </body>
    </html>`;
    pdf.create(unContent, options).toBuffer(async (err, stream) => {
      if (err) {
        reject(err)
      } else {
        let buf = await Buffer.from(stream);
        resolve(buf)

      }
    });

  })


}

async function generarSeparata(normas) {
  return new Promise(async (resolve, reject) => {
    const unaBase = `file://${path.resolve('../assets')}`;
    let options = {
      localUrlAccess: true,
      loadImages: true,
      base: unaBase,
      format: 'A4',
      scale: 1,
      border: {
        left: "30mm",
        right: "30mm",
        top: "65mm",
        bottom: "25mm"
      },
      type: 'pdf',
    };

    let unContent = '';
    let idSeccionActual = null;
    let idNormaTipoActual = null;
    let idOrganismoActual = null;
    for (let i = 0; i < normas.length; i++) {
      let request = {}
      request.idNorma = normas[i].idNorma;
      let anexos = await traerAnexosPorIdNorma(request)
      if (anexos && anexos.length > 0) {
        let subtipo = String(normas[i].normaTipo);
        if (!normas[i].es_poder) {
          subtipo += '/' + normas[i].normaSubtipo;
        }

        if (normas[i].idSeccion !== idSeccionActual) {
          idSeccionActual = normas[i].idSeccion;
          unContent += `<h2 style="
          background-color: #636363;
          font-family: 'Arial', sans-serif;
          line-height: normal;
          padding: 15px;
          text-align: center;
          color: #ffffff;
          margin: 0;">
            ${normas[i].seccion}
          </h2>`
        }

        if (normas[i].idNormaTipo !== idNormaTipoActual && normas[i].es_poder) {
          idNormaTipoActual = normas[i].idNormaTipo;
          unContent += `<h3 style="
          background-color: #aaaaaa;
          font-family: 'Arial', sans-serif;
          line-height: normal;
          padding: 5px;
          text-align: center;
          color: #ffffff;
          margin: 0">
            ${normas[i].normaTipo}
          </h3>`
        }

        if (normas[i].idReparticion !== idOrganismoActual) {
          idOrganismoActual = normas[i].idReparticion;
          unContent += `<h4 style="font-family: 'Arial', sans-serif;
          line-height: normal;
          padding: 20px 0 0 0;
          text-align: left;
          color: #000000;
          font-weight: bold;
          margin: 0;">
              ${normas[i].reparticion}
          </h4>`
        }

        let linkAnexos = '';
        for (let j = 0; j < anexos.length; j++) {
          linkAnexos += `<a href="${process.env.DOCUMENTOS_PUBLICOS_BO}${anexos[j].archivoPublico}"
            target="_blank" style="font-weight: bold;" >
              ANEXO ${anexos.length > 1 ? j + 1 : ''}
            </a>&nbsp;`;
        }

        unContent += `
        <div style="width: 100%; text-overflow:clip;"><dt style="font-family: 'Arial', sans-serif;
        line-height: normal;
        padding: 20px 0 0 0;
        text-align: left;
        color: #000000;
        font-weight: normal;
        margin: 0;
        ">
          ${String(subtipo) + ' N°' + String(normas[i].normaNumero) + '/' + String(normas[i].organismoEmisor) + '/' + String(normas[i].normaAnio)}
          ${linkAnexos}
        </dt> 
    `

        unContent += ` <dd style="font-family: 'Arial', sans-serif;
        font-size:${(ArialFontSize - 2).toString() + 'px'};
        line-height: normal;
        padding: 4px 0 0 0;
        text-align: left;
        color: #000000;
        font-weight: normal;
        margin: 0;
        max-width: 80ch;
        overflow: hidden;
        white-space: initial;
        display: inline-block;text-overflow:clip;
        ">${String(normas[i].normaSumario).charAt(0).toUpperCase() + String(normas[i].normaSumario).slice(1) /* POR SI LA PRIMERA NO ES MAYUSCULA */}
        </dd>`

      }
    }

    if (normas.length === 0) {
      unContent = '<p></p>'
    }


    unContent = `<!DOCTYPE html>
    <html>
    <head>
        <style>
       
        body {
          font-family: "Arial", sans-serif;
          font-size: ${ArialFontSize.toString() + 'px'};
          line-height: normal;
      }

 p {
        margin: 0;
        width: 100%;
      }
        </style>
    </head>
    <body>
        ${unContent}
    </body>
    </html>`;
    pdf.create(unContent, options).toBuffer(async (err, stream) => {
      if (err) {
        reject(err)
      } else {
        let buf = await Buffer.from(stream);
        resolve(buf)

      }
    });

  })


}

async function formatearContenido(pdfDoc, bufferData, unHeader, boletin) {
  const pdfData = await PDFDocument.load(bufferData)
  const pages = pdfData.getPages()
  //RECORRIENDO EL CONTENIDO
  for (let i = 0; i < pages.length; i++) {
    const [paginaACopiar] = await pdfDoc.copyPages(pdfData, [i])
    pdfDoc.addPage(paginaACopiar)
    const { width, height } = paginaACopiar.getSize();
    if (unHeader) {
      const imageHeader = await pdfDoc.embedPng(unHeader);
      paginaACopiar.drawImage(imageHeader, {
        x: 0,
        y: 0,
        width: width,
        height: height,
      });
    }
    if (boletin !== undefined) {
      paginaACopiar.drawText(`Boletín Oficial de la Ciudad Autónoma de Buenos Aires - Nro ${boletin.boletinNumero} - ${moment(boletin.fechaPublicacion).format("DD/MM/YYYY")}`, {
        x: 30,
        y: height - 42,
        size: 6
      })
    }
  }

  return pdfDoc

}

async function generarBoletinPrevioPDF(request) {

  //CREAR DOCUMENTO
  const pdfDoc = await PDFDocument.create()
  //CREAR TAPA
  const fecha = moment(request.fechaPublicacion).format('DD/MM/YYYY').trim()
  let numero = '';
  if (request.boletinNumero != null) {
    numero = request.boletinNumero.toString()
  }
  const tapa_boletin = fs.readFileSync(path.resolve(__dirname, "../assets/boletin/tapa_boletin.png"), 'base64');
  await generarTapa(pdfDoc, tapa_boletin, numero, fecha)

  //GENERAR SUMARIO
  let buffer = await generarSumario(request.normas)
  //FORMATEAR CONTENIDO
  const header_boletin = fs.readFileSync(path.resolve(__dirname, "../assets/boletin/header_boletin.png"), 'base64');
  await formatearContenido(pdfDoc, buffer)

  const header_data = { totalPaginas: pdfDoc.getPageCount(), fecha: moment(request.fechaPublicacion).format('DD/MM/YYYY').trim(), numero }
  //GENERAR CONTENIDO
  buffer = await generarContenido(request.normas, header_data)
  //header_boletin = fs.readFileSync(path.resolve(__dirname, "../assets/boletin/header_boletin.png"), 'base64');
  //FORMATEAR CONTENIDO
  await formatearContenido(pdfDoc, buffer)

  //CREAR CONTRATAPA
  const contratapa_boletin = fs.readFileSync(path.resolve(__dirname, "../assets/boletin/contratapa_boletin.png"), 'base64');
  await generarContratapa(pdfDoc, contratapa_boletin)


  //EXTRAER TEXTO DEL PDF
  const pdfBytes = await pdfDoc.save() //crea un array de bytes del pdf

  let buf = Buffer.from(pdfBytes); //crea el buffer con el array anterior
  if (request.paginasCalculadas !== true) {
    let boletinPdf = await parsearPDF(buf);

    let paginasBoletin = boletinPdf.rawText.split('Break' + '-'.repeat(16));//separar las paginas

    //BUSCAR EL idNorma EN EL TEXTO Y EXTRAER EL NUMERO DE PAGINA
    for (let i = 0; i < paginasBoletin.length; i++) {
      let ids = paginasBoletin[i].match(/-idNorma\d*-/g);
      if (ids !== null) {
        for (const idNorma of ids) {
          let id = parseInt(idNorma.replace(/[idNorma-]/g, ''));
          let indexNorma = request.normas.indexOf(request.normas.find(norma => norma.idNorma === id))
          request.normas[indexNorma].pagina = i;
        }
      }
    }
    /*     fs.writeFileSync('./src/helpers/pdfData.json', JSON.stringify(boletinPdf.data), { flag: 'w' }, function (err) {
          if (err)
            return console.error(err);
        }) */
    request.paginasCalculadas = true;
    return await generarBoletinPrevioPDF(request);
  }

  let base64 = buf.toString('base64');
  return base64;

};


async function generarBoletinPrevioDoc(request) {

  let normas = request.normas;

  let unContent = '';
  for (let i = 0; i < normas.length; i++) {
    let divNorma = 'selector-' + String(normas[i].idNorma) + 'nm'
    unContent += '<div id="' + divNorma + '">' + String(normas[i].normaDocumento) + '<p>&nbsp;</p><p>&nbsp;</p></div>'
    //unContent += String(normas[i].normaDocumento) + '<br>'
  }


  unContent += '<h3>INDICE:</h3>'

  //INDICE
  for (let i = 0; i < normas.length; i++) {
    let divNorma = 'selector-' + String(normas[i].idNorma) + 'nm'
    unContent += '<a href="#' + divNorma + '">' + String(normas[i].normaAcronimoReferencia) + '<p>&nbsp;</p><p>&nbsp;</p></a>'
    //unContent += String(normas[i].normaDocumento) + '<br>'
  }

  if (normas.length === 0) {
    unContent = '<p></p>'
  }

  /* console.log(unContent) */

  unContent = `<!DOCTYPE html>
    <html>
    <head>
        <style>
        
        body {
          font-family: "Arial", sans-serif;
          font-size: ${ArialFontSize.toString() + 'px'};
          line-height: normal;
      }
       p {
        margin: 4px 0 4px 0;
      } 
        </style>
    </head>
    <body>
        ${unContent}
    </body>
    </html>`;




  //GENERAR CONTENIDO
  const fileBuffer = await HTMLtoDOCX(unContent, null, {
    table: { row: { cantSplit: true } },
    footer: true,
    font: 'Arial',
    fontSize: 11,
    pageNumber: true,
  });


  let buf = Buffer.from(fileBuffer);
  let base64 = buf.toString('base64');
  return base64;

};

async function generarBoletinPDF(request) {
  try {
    //CREAR DOCUMENTO
    const pdfDoc = await PDFDocument.create()
    //CREAR TAPA
    const fecha = moment(request.fechaPublicacion).format('DD/MM/YYYY').trim()
    let numero = '';
    if (request.boletinNumero != null) {
      numero = request.boletinNumero.toString()
    }
    const tapa_boletin = fs.readFileSync(path.resolve(__dirname, "../assets/boletin/tapa_boletin.png"), 'base64');
    await generarTapa(pdfDoc, tapa_boletin, numero, fecha)

    //GENERAR SUMARIO
    let buffer = await generarSumario(request.normas)
    //FORMATEAR CONTENIDO
    const header_boletin = fs.readFileSync(path.resolve(__dirname, "../assets/boletin/header_boletin.png"), 'base64');
    await formatearContenido(pdfDoc, buffer)

    //GENERAR CONTENIDO
    let html = request.htmlBoletin;
    const header_data = { totalPaginas: pdfDoc.getPageCount(), fecha: moment(request.fechaPublicacion).format('DD/MM/YYYY').trim(), numero }
    let buffer2 = await generarPDFdeHTML(html, header_data)

    //FORMATEAR CONTENIDO
    await formatearContenido(pdfDoc, buffer2)

    //CREAR CONTRATAPA
    const contratapa_boletin = fs.readFileSync(path.resolve(__dirname, "../assets/boletin/contratapa_boletin.png"), 'base64');
    await generarContratapa(pdfDoc, contratapa_boletin)


    //EXTRAER TEXTO DEL PDF
    const pdfBytes = await pdfDoc.save() //crea un array de bytes del pdf

    let buf = Buffer.from(pdfBytes); //crea el buffer con el array anterior

    let boletinPdf = await parsearPDF(buf);

    let paginasBoletin = boletinPdf.rawText.split('Break' + '-'.repeat(16));//separar las paginas

    //BUSCAR EL idNorma EN EL TEXTO Y EXTRAER EL NUMERO DE PAGINA
    for (let i = 0; i < paginasBoletin.length; i++) {
      let ids = paginasBoletin[i].match(/-idNorma\d*-/g);
      if (ids !== null) {
        for (const idNorma of ids) {
          let id = parseInt(idNorma.replace(/[idNorma-]/g, ''));
          let indexNorma = request.normas.indexOf(request.normas.find(norma => norma.idNorma === id))
          request.normas[indexNorma].pagina = i;
        }
      }
    }

    const pdfDocFinal = await PDFDocument.create()

    numero = '';
    if (request.boletinNumero != null) {
      numero = request.boletinNumero.toString()
    }
    await generarTapa(pdfDocFinal, tapa_boletin, numero, fecha)

    //GENERAR SUMARIO
    buffer = await generarSumario(request.normas)
    //FORMATEAR CONTENIDO
    await formatearContenido(pdfDocFinal, buffer)

    html = html.replace(/-idNorma\d*-/g, '');
    let buffer3 = await generarPDFdeHTML(html, header_data)
    await formatearContenido(pdfDocFinal, buffer3)

    //CREAR CONTRATAPA
    await generarContratapa(pdfDocFinal, contratapa_boletin)


    //EXTRAER TEXTO DEL PDF
    const pdfBytesFinal = await pdfDocFinal.save() //crea un array de bytes del pdf

    let bufFinal = Buffer.from(pdfBytesFinal); //crea el buffer con el array anterior

    let base64 = bufFinal.toString('base64');
    return base64;
  } catch (e) { console.log(e) }
};


async function generarSeparataPDF(request) {

  //CREAR DOCUMENTO
  const pdfDoc = await PDFDocument.create()
  //CREAR TAPA
  const fecha = moment(request.fechaPublicacion).format('D/M/YYYY').trim()
  let numero = '';
  if (request.boletinNumero != null) {
    numero = request.boletinNumero.toString()
  }
  const tapa_boletin = fs.readFileSync(path.resolve(__dirname, "../assets/separata/tapa_separata.png"), 'base64');
  await generarTapa(pdfDoc, tapa_boletin, numero, fecha)


  //GENERAR CONTENIDO
  //let html = request.htmlSeparata;
  let buffer = await generarSeparata(request.normas)
  const header_boletin = fs.readFileSync(path.resolve(__dirname, "../assets/separata/header_separata.png"), 'base64');
  //FORMATEAR CONTENIDO
  await formatearContenido(pdfDoc, buffer, header_boletin)

  //CREAR CONTRATAPA
  const contratapa_boletin = fs.readFileSync(path.resolve(__dirname, "../assets/separata/contratapa_separata.png"), 'base64');
  await generarContratapa(pdfDoc, contratapa_boletin)


  //GUARDAR Y ENVIAR
  const pdfBytes = await pdfDoc.save()
  let buf = Buffer.from(pdfBytes);
  let base64 = buf.toString('base64');
  return base64;

};

async function generarNormaPDF(request) {

  //CREAR DOCUMENTO
  const pdfDoc = await PDFDocument.create()

  //GENERAR CONTENIDO
  let buffer = await generarContenidoIndividual(request.norma)
  //FORMATEAR CONTENIDO
  const header_norma = fs.readFileSync(path.resolve(__dirname, "../assets/norma/header_norma.png"), 'base64');
  if (request.boletin) {
    await formatearContenido(pdfDoc, buffer, header_norma, request.boletin)
  }
  else {
    await formatearContenido(pdfDoc, buffer, header_norma)
  }

  //GUARDAR Y ENVIAR
  const pdfBytes = await pdfDoc.save()
  let buf = Buffer.from(pdfBytes);
  let base64 = buf.toString('base64');
  return base64;

};

async function generarHTMLBoletin(normas) {
  let unContent = '';
  let idSeccionActual = null;
  let idNormaTipoActual = null;
  let idOrganismoActual = null;
  for (let i = 0; i < normas.length; i++) {
    let request = {}
    request.idNorma = normas[i].idNorma;
    let anexos = await traerAnexosPorIdNorma(request)
    if (normas[i].idSeccion !== idSeccionActual) {
      idSeccionActual = normas[i].idSeccion;
      unContent += `<h2 style="
        background-color: #383434;
        font-family: 'Arial', sans-serif;
        line-height: normal;
        text-align: center;
        padding: 5px;
        color: #ffffff;
        margin: 0;">
          ${normas[i].seccion}
        </h2>`
    }

    if (normas[i].idNormaTipo !== idNormaTipoActual) {
      idNormaTipoActual = normas[i].idNormaTipo;
      unContent += `<h3 style="
        background-color: #636363;
        font-family: 'Arial', sans-serif;
        line-height: normal;
        padding: 5px;
        text-align: center;
        color: #ffffff;
        margin: 0">
          ${normas[i].normaTipo}
        </h3>`
    }

    if (normas[i].idReparticionOrganismo !== idOrganismoActual) {
      idOrganismoActual = normas[i].idReparticionOrganismo;
      unContent += `<h3 style="
      background-color: #aaaaaa;
      font-family: 'Arial', sans-serif;
      line-height: normal;
      padding: 5px;
      text-align: center;
      color: #ffffff;
      margin: 0 0 15px 0">
            ${normas[i].reparticion}
        </h3>`
    }

    let linkAnexos = '';
    for (let j = 0; j < anexos.length; j++) {
      linkAnexos += `<a href="${process.env.DOCUMENTOS_PUBLICOS_BO}${anexos[j].archivoPublico}" target="_blank" style="font-weight: bold !important; outline: none !important; text-decoration: none !important; color: #000 !important; font-size: 14px !important; margin-right: 10px !important;">
                        ANEXO ${anexos.length > 1 ? j + 1 : ''}
                      </a>`;
    }

    // Luego, envuelve los enlaces en un contenedor div con margen superior e inferior de 1 cm (aproximadamente 37.8 píxeles)
    linkAnexos = `<div style="text-align: center; margin-bottom: 37.8px !important;">${linkAnexos}</div>`;

    let divNorma = 'selector-' + String(normas[i].idNorma) + 'nm'
    unContent += '<div id="' + divNorma + '">'
    if (normas[i].pagina === undefined) {
      unContent += `<p style='float: right; font-size:1px'>-idNorma${normas[i].idNorma}-</p>`;
    }
    unContent += String(normas[i].normaDocumento) + '<p>&nbsp;</p></div>' + linkAnexos
    //unContent += String(normas[i].normaDocumento) + '<br>'
  }

  if (normas.length === 0) {
    unContent = '<p></p>'
  }

  unContent = `<!DOCTYPE html>
  <html>
  <head>
      <style>
      
      body {
        font-family: "Arial", sans-serif;
        font-size: ${ArialFontSize.toString() + 'px'};
        line-height: normal;
    }
     p {
      margin: 4px 0 4px 0;
    } 
      </style>
  </head>
  <body>
      ${unContent}
  </body>
  </html>`;

  return unContent
}

async function generarHTMLSeparata(normas) {
  let unContent = '';
  for (let i = 0; i < normas.length; i++) {
    unContent += `<p style="font-family: 'Arial', sans-serif;
      font-size: ${ArialFontSize.toString() + 'px'};
      line-height: normal;
      padding: 20px 0 0 0;
      text-align: left;
      color: #000000;
      font-weight: bold;
      margin: 0;">
      ${String(normas[i].reparticion)}
</p>   
       <p style="font-family: 'Arial', sans-serif;
      font-size: ${(ArialFontSize - 1).toString() + 'px'};
      line-height: normal;
      padding: 20px 0 0 0;
      text-align: left;
      color: #000000;
      font-weight: normal;
      margin: 0;
      text-transform: uppercase;;
      ">
      ${String(normas[i].normaTipo) + ' N°' + String(normas[i].normaNumero) + '/' + String(normas[i].siglaOrganismo) + '/' + String(normas[i].normaAnio)}
</p>
<p style="font-family: 'Arial', sans-serif;
      font-size: ${(ArialFontSize - 4).toString() + 'px'};
      line-height: normal;
      padding: 4px 0 0 0;
      text-align: left;
      color: #000000;
      font-weight: normal;
      margin: 0;">
      ${String(normas[i].normaSumario).charAt(0).toUpperCase() + String(normas[i].normaSumario).slice(1) /* POR SI LA PRIMERA NO ES MAYUSCULA */}
<dt></dt>
<dd style="font-family: 'Arial', sans-serif;
      font-size:  ${(ArialFontSize - 4).toString() + 'px'};
      line-height: normal;
      padding: 4px 0 0 0;
      text-align: left;
      color: #000000;
      font-weight: normal;
      margin: 0;">Pag. xxx</dd>
</p>`
  }

  if (normas.length === 0) {
    unContent = '<p>&nbsp;</p>'
  }

  return unContent
}

module.exports = {
  generarBoletinPDF,
  generarNormaPDF,
  generarBoletinPrevioPDF,
  generarSeparataPDF,
  generarHTMLBoletin,
  generarHTMLSeparata
}