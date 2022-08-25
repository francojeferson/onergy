exports.ajax = function (args, resolve) {
    return new Promise((resolve, reject) => {
        console.log(args.url);
        let header = {
            json: false,
        };
        if (args.headers) {
            header = JSON.parse(args.headers);
        }
        if (args.authorization) {
            let tmpAuth = JSON.parse(args.authorization);
            let auth = 'Basic ' + new Buffer.from(tmpAuth.username + ':' + tmpAuth.password).toString('base64');
            header.auth = {
                username: tmpAuth.username,
                password: tmpAuth.password,
            };
        }
        request.get(
            {
                headers: header,
                url: args.url,
            },
            function (error, response, body) {
                if (response.statusCode == 200) {
                    args.success(JSON.parse(body));
                    resolve(body);
                } else {
                    args.error(error);
                    reject(error);
                }
            }
        );
    });
};

exports.ajaxPost = function (args) {
    return new Promise((resolve, reject) => {
        request.post(
            {
                headers: JSON.parse(args.headers),
                url: args.url,
                body: args.data,
            },
            function (error, response, body) {
                if (response.statusCode == 200) {
                    args.success(JSON.parse(body));
                    resolve(body);
                } else {
                    args.error(JSON.parse(error));
                    reject(error);
                }
            }
        );
    });
};

exports.ConvertUrlFileToB64 = function (strText) {
    let buff = new Buffer.from(strText, 'utf-8');
    let text = buff.toString('base64');
    return text;
};

exports.GetBase64FromText = function (strText) {
    let buff = new Buffer.from(strText, 'utf-8');
    let text = buff.toString('base64');
    return text;
};

exports.GetTextFromBase64 = function (b64Text) {
    let buff = new Buffer.from(b64Text, 'base64');
    let text = buff.toString('utf-8');
    return text;
};

exports.GetUserDtNow = function (strFormat) {
    let result = new Date();
    return result;
};
