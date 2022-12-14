function init(json) {
    var data = JSON.parse(json);
    let result = {
        status: 'PROCESANDO',
        data_de_upload: utils.GetUserDtNow('yyyy-MM-dd HH:mm:ss'),
        data_de_uploadDate: utils.GetUserDtNow('yyyy-MM-dd HH:mm:ss'),
        arquivo: data.CPDT_carregar_arquivo_da_tesouraria,
    };

    return SetObjectResponse(true, result, false);
}
function initBefore(json) {
    //return true;
}
function initDelete(json) {
    //return true;
}
function SetObjectResponse(cond, json, WaitingWebHook) {
    if (WaitingWebHook === undefined) {
        WaitingWebHook = false;
    }

    var obj = {
        cond: cond,
        WaitingWebHook: WaitingWebHook,
    };

    if (json && Object.keys(json).length > 0) {
        obj.json = JSON.stringify(json);
    }

    return obj;
}
