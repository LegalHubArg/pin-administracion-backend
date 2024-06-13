require('dotenv').config()
let nodemailer = require("nodemailer");
let smtpTransport = require("nodemailer-smtp-transport");

let fs = require("fs");
const handlebars = require("handlebars");

const TEMPLATES = {
  observacion: `./src/helpers/emailTemplates/observacion.html`,
};

const MAIN_MAIL_IMPORTS = [
  {
    filename: "",
    path: __dirname + "",
    cid: "",
  },
];

let readHTMLFile = function (path, callback) {
  fs.readFile(
    path,
    {
      encoding: "utf-8",
    },
    function (err, html) {
      if (err) {
        throw err;
      } else {
        callback(null, html);
      }
    }
  );
};

let transporter = nodemailer.createTransport(
  {
    host: process.env.MAILER_HOST,
    port: process.env.MAILER_PORT,
    secure: false,
    auth: {
      user: process.env.MAILER_ADMIN,
      pass: process.env.MAILER_ADMIN_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
      ciphers: "SSLv3",
    },
  }
);

function observacion(res, to, datosEmail) {
  readHTMLFile(TEMPLATES.observacion, function (err, html) {
    let template = handlebars.compile(html);
    let replacements = {
      solicitud: datosEmail.solicitud,
    };
    let htmlToSend = template(replacements);
    let mailOptions = {
      from: process.env.MAILER_ADMIN,
      to: to,
      subject: "PIN | Observacion",
      html: htmlToSend,
      /* attachments: MAIN_MAIL_IMPORTS, */
    };
    transporter.sendMail(mailOptions, function (error, response) {
      if (error) {
        console.log(error);
      } else {
        // console.log(response)
      }
    });
  });
}

module.exports = {
  observacion
};
