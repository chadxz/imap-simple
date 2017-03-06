module.exports = function getEncoding(body) {
    if (body['content-type']) {
        var charsetString = body['content-type'].find(function (item) {
            return item.indexOf('charset=') === -1 ? false : true;
        });

        if (charsetString) {
            var result  = /.*charset="(.*)"/.exec(charsetString);
            var encodingString = result[1];

            switch (encodingString) {
                case 'iso-8859-1':
                    return 'latin1';
                case 'ascii':
                case 'utf8':
                case 'utf16le':
                case 'ucs2':
                case 'base64':
                case 'latin1':
                case 'binary':
                case 'hex':
                    return encodingString;
                default:
                    return 'utf8';
            }
        }
    }

    return 'utf8';
}
