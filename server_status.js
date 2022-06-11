const serverStatus= {
    OK:200,//La solicitud ha tenido éxito
    CREATED:201,//La solicitud ha tenido éxito y se ha creado un nuevo recurso como resultado de ello=>para PUT/POST
    ACCEPTED:202, //La petición se ha completado con éxito, pero su contenido no se ha obtenido de la fuente originalmente solicitada
    BAD_REQUEST:400,//Esta respuesta significa que el servidor no pudo interpretar la solicitud dada una sintaxis inválida.
    UNAUTHORIZED:401,//Es necesario autenticar para obtener la respuesta solicitada
    FORBIDDEN:403,//l cliente no posee los permisos necesarios para cierto contenido
    NOT_FOUND:404,//La solicitud no se ha encontrado en el servidor
    INTERNAL_SERVER_ERROR:500//El servidor ha encontrado un error interno y no puede completar la solicitud
}
module.exports=serverStatus;