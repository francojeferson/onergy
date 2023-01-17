const axios = require('axios');
const fs = require('fs');
const md5 = require('md5');
const request = require('request');
const Uri = 'https://gateway.onetech.com.br/v1';

function Read(filename) {
    return new Promise((resolve, reject) => {
        const result = excelToJson({
            sourceFile: filename,
            header: {
                rows: 1,
            },
            columnToKey: {
                '*': '{{columnHeader}}',
            },
        });
        if (resolve) resolve(result);
    });
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

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

exports.DowloadFile = async function (url, filename, file) {
    return new Promise((resolve, reject) => {
        try {
            const response = axios({
                url,
                method: 'GET',
                responseType: 'stream',
            }).then((resp) => {
                resp.data.pipe(file);
                sleep(1000).then((x) => {
                    Read(filename).then((result) => {
                        resolve(result);
                    });
                });
            });
        } catch (error) {
            console.log(error);
        }
    });
};

exports.getInMemory = function (args) {
    return new Promise((resolve, reject) => {
        request(
            'https://gateway.onetech.com.br/ocs/api/cache?subscription-key=b30026bf1e1c40bda7777c64050fceb6&key=' + args.key,
            { json: false },
            (err, res, body) => {
                if (err) {
                    return console.log(err);
                }
                if (resolve != null) resolve(body);
            }
        );
    });
};

exports.hashMd5 = function (args) {
    var hash = md5(args.content);
    return hash;
};

exports.increment = function (args) {
    let responseReturn = new Promise((resolve, reject) => {
        try {
            request.get(
                {
                    headers: { 'content-type': 'application/json' },
                    url: `https://hapi.onergy.com.br/api/Feed/IncrementCounter?ass_id=${args['assid']}&key=${args['key_name']}&genblocks=0`,
                },
                function (error, response, body) {
                    if (response.statusCode == 200) resolve(body);
                    else reject(error);
                }
            );
        } catch (err) {
            reject(err);
        }
    });
    return responseReturn;
};

exports.InsertManyOnergy = async function (records, template, userid, assid) {
    for (var recIndex in records) {
        var dta = records[recIndex];
        let onergySaveData = {
            fdtid: template,
            assid: assid,
            usrid: userid,
            data: JSON.stringify(dta),
        };
        await exports.onergy_save(onergySaveData);
    }
};

exports.log = function (msg) {
    console.log(msg);
};

exports.Log = function (message) {
    console.log(message);
};

exports.LogConsole = function (message) {
    console.log(message);
};

exports.MetaDados = function (usrid, fdtid, assid, complete) {
    var url = Uri + '/api/Feed/GetFeedTemplateByID?subscription-key=f8da69f006064cb69814963c3f768715&?usr_id=' + usrid + '&ass_id=' + assid + '&fdtid=' + fdtid;
    request(url, { json: true }, (err, res, body) => {
        if (err) {
            return console.log(err);
        }
        if (complete != null) {
            var grid = body.gridJson;
            complete(JSON.parse(grid));
        }
    });
};

exports.onergy_get = function (args) {
    return new Promise((resolve, reject) => {
        var data = new Array();
        if (args.page == undefined) args.page = 0;
        if (args.rows == undefined) args.rows = 10000;
        this.onergy_get_internal(
            args.usrid,
            args.fdtid,
            args.assid,
            args.filter,
            args.rows,
            args.page,
            args.fedid,
            (rows) => {
                if (Array.isArray(rows))
                    rows.forEach((element) => {
                        data.push(element);
                    });
                else data.push(rows);
            },
            () => {
                resolve(data);
            }
        );
    });
};

exports.onergy_get_internal = function (usrid, fdtid, assid, filter, vtake, vskip, fedid, complete, end) {
    var take = vtake;
    var skip = vskip;
    var url = '';
    if (fedid != null && fedid != undefined)
        url =
            Uri +
            '/api/Feed/OpenFeedMongo?subscription-key=f8da69f006064cb69814963c3f768715&usrID=' +
            usrid +
            '&assId=' +
            assid +
            '&fdtID=' +
            fdtid +
            '&fedid=' +
            fedid;
    else
        url =
            Uri +
            '/api/Feed/GetMongo?subscription-key=f8da69f006064cb69814963c3f768715&usr_id=' +
            usrid +
            '&ass_id=' +
            assid +
            '&take=' +
            take +
            '&skip=' +
            skip +
            '&type=' +
            fdtid +
            // '&orderField=' +
            // 'conta_pai' + // TODO: INSERIR VARIAVEL DE ORDENACAO
            '&filter=' +
            encodeURI(filter);
    //console.log(url);
    request(url, { json: true }, (err, res, body) => {
        if (err) {
            return console.log(err);
        }
        var continuefind = true;
        if (complete != null) complete(body);
        skip += take;
        /*if (body.length == take) this.onergy_get_internal(usrid, fdtid, assid, filter, take, skip, fedid, complete, end);
        else if (end != null) end();*/
        end();
    });
};

exports.onergy_save = function (args) {
    return new Promise((resolve, reject) => {
        const SaveDataByTemplate = {
            assid: args.assid,
            usrid: args.usrid,
            fdtid: args.fdtid,
            executeAction: true,
        };
        if (args.deleteFeed != undefined) {
            SaveDataByTemplate.deleteFeed = args.deleteFeed;
        }
        if(args.executeAction != undefined) {
            SaveDataByTemplate.executeAction = args.executeAction;
        }
        if (args.data != undefined) {
            let data = JSON.parse(args.data);
            if (data.urlJsonContext) {
                data = data.urlJsonContext;
                data = JSON.stringify(data);
            } else if (data.UrlJsonContext) {
                data = data.UrlJsonContext;
                data = JSON.stringify(data);
            } else {
                data = JSON.stringify(data);
            }
            SaveDataByTemplate.jsondata = data;
        }
        if (args.ukField != undefined) {
            SaveDataByTemplate.ukField = args.ukField;
        }
        if (args.id != undefined) {
            SaveDataByTemplate.id = args.id;
        }
        //const data = JSON.stringify(SaveDataByTemplate);
        try {
            request.post(
                {
                    headers: { 'content-type': 'application/json' },
                    url: Uri + '/api/Analytics/SaveDataByTemplateRule?subscription-key=f8da69f006064cb69814963c3f768715',
                    body: JSON.stringify(SaveDataByTemplate),
                },
                function (error, response, body) {
                    if (error != undefined || error == null) {
                        if (response.statusCode == 200) resolve(body);
                        else if (response.statusCode == 500) resolve(body);
                    } else reject(error);
                }
            );
        } catch (err) {
            reject(err);
        }
    });
};

exports.onergy_sendto = function (args) {
    return new Promise((resolve, reject) => {
        //const data = JSON.stringify(SaveDataByTemplate);
        //https://api.onergy.com.br/api/Feed/SendFeedItemToTemplate?usrid=9eb545b7-ef0e-4c79-b1a9-e706dfd63d1b&assid=7bc8ee17-f738-4085-958f-9fc27a737cc7&newfdtid=968cf322-ea7b-4c59-96f9-f278fe8b5bfc&resetFdtData=true&fedid=2a7186f6-784f-1dbc-30ab-c9a8ea76fb52
        try {
            var url =
                'https://api.onergy.com.br/api/Feed/SendFeedItemToTemplate?usrid=' +
                args.usrid +
                '&assid=' +
                args.assid +
                '&newfdtid=' +
                args.fdtid +
                '&resetFdtData=true&fedid=' +
                args.fedid;
            request(url, { json: true }, (err, res, body) => {
                if (err) {
                    return console.log(err);
                }
                resolve(body);
            });
        } catch (err) {
            reject(err);
        }
    });
};

exports.ReaderCsv = function (args) {
    return new Promise((resolve, reject) => {
        var csvData = [];
        fs.createReadStream(args.file)
            .pipe(csv())
            .on('data', (row) => {
                csvData.push(row);
            })
            .on('end', () => {
                console.log('CSV file successfully processed');
                if (resolve != null) resolve(csvData);
            });
        console.log(csvData);
    });
};

exports.ReadExcelToJson = function (args) {
    return new Promise((resolve, reject) => {
        request('https://onergynodefunctions.azurewebsites.net/api/ReadExcel?url=' + args.url, { json: false }, (err, res, body) => {
            if (err) {
                return console.log(err);
            }
            if (resolve != null) resolve(body);
        });
    });
};

exports.ReadTextPdf = function (args) {
    return new Promise((resolve, reject) => {
        request('https://onergynodefunctions.azurewebsites.net/api/PdfReader?url=' + args.url, { json: false }, (err, res, body) => {
            if (err) {
                return console.log(err);
            }
            if (resolve != null) resolve(body);
        });
    });
};

exports.saveInMemory = function (args) {
    return new Promise((resolve, reject) => {
        try {
            request.post(
                {
                    headers: { 'content-type': 'application/json' },
                    url: 'https://gateway.onetech.com.br/ocs/api/cache/' + args.key + '/' + args.time + '?subscription-key=b30026bf1e1c40bda7777c64050fceb6',
                    body: JSON.stringify(args.data),
                },
                function (error, response, body) {
                    if (response.statusCode == 200) resolve(body);
                    else reject(error);
                }
            );
        } catch (err) {
            reject(err);
        }
    });
};

exports.sendmail = function (args) {
    let responseReturn = new Promise((resolve, reject) => {
        try {
            request.post(
                {
                    headers: { 'content-type': 'application/json' },
                    url: `https://hapi.onergy.com.br/api/EmailMkt/SendMailTo?ass_id=${args['assid']}&emk_id=${args['tmpid']}&to=${args['email_to']}&usr_id=${args['usrid']}&fed_id=${args['id']}`,
                },
                function (error, response, body) {
                    if (response.statusCode == 200) resolve(body);
                    else reject(error);
                }
            );
        } catch (err) {
            reject(err);
        }
    });
    return responseReturn;
};
