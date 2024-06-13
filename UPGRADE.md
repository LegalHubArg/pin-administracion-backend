# Ajustes V1.0.11-BETA
- Agregar las siguientes variables de entorno:
- `VALIDAR_CAPTCHA=true` (si no está declarada esta variable de entorno, se deja por defecto sin recaptcha el login del backoffice.)

# Ajustes V1.0.10-BETA
- Agregar las siguientes variables de entorno:
- `API_SESSION_TIME="2h"` (Tiempo de sesión JWT)
- `API_EXTENSIONES="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"` (mimetype permitidos para carga de archivos)
- `S3_DIGESTO="migration/sdin/digesto/uploads/documentos-qa/"` (Url para acceder a los documentos de pin-ciudadano DIGESTO)
- `DOCUMENTOS_PUBLICOS_SDIN=https://pin-ciudadano-dev.gcba.gob.ar/sdin/documentos/` (Url para acceder a los documentos públicos de pin-ciudadano SDIN)
- `DOCUMENTOS_PUBLICOS_BO=https://pin-ciudadano-dev.gcba.gob.ar/boletin-oficial/documentos/` (Url para acceder a los documentos públicos de pin-ciudadano BO)

IMPORTANTE: las URL tienen que terminar con la barra (/) Para implementar QA, el bucket tiene que estar configurado con las credenciales de QA.

# Ajustes V1.0.9-BETA

 - Agregar las siguientes variables de entorno en el  **config-map.yaml** del entorno de OPENSHIFT:
 - 

    S3_BO_NORMAS=""
    S3_BO_FIRMADOS=""
    S3_BO_PUBLICO=""
    S3_SDIN_NORMAS=""
    FIRMA_USUARIO_CUIT=

    **Ejemplo para QA:**
    S3_BO_NORMAS="migration/boletinoficial/fileserver-qa/"
    S3_BO_FIRMADOS="migration/boletinoficial/boletinesfirmados-qa/"
    S3_BO_PUBLICO="migration/boletinoficial/public-qa/"
    S3_SDIN_NORMAS="migration/sdin/normativa/fileserver-qa/"
    FIRMA_USUARIO_CUIT=20310921395

- Actualizar en los parámetros de S3 las rutas a las carpetas destinadas a tal fin y en FIRMA_USUARIO_CUIT el numero de CUIT (numérico entero) correspondiente a la persona autorizada a firmar y publicar el boletín oficial. 
Importante que estas 4 rutas terminen con "/".
