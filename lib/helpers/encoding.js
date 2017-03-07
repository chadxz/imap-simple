module.exports = function getEncoding(body) {
    if (body['content-type']) {
        var charsetString = body['content-type'].find(function (item) {
            return item.indexOf('charset=') === -1 ? false : true;
        });

        if (charsetString) {
            var result  = /.*charset="(.*)"/.exec(charsetString);
            return result ? result[1] : 'utf8';
        }
    }

    return 'utf8';
}
