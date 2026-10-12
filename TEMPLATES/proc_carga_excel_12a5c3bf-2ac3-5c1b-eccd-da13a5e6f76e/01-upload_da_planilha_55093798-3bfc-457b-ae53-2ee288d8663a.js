function init(json) {
    var data = JSON.parse(json);

    let dataUpdate = {};

    dataUpdate.nome_planilha = data.upload_planilha[0].Name;

    dataUpdate.status_planilha = 'processando';
    dataUpdate.status_planilha_desc = 'Processando';

    return SetObjectResponse(true, dataUpdate, false);
}

function initBefore(json) {
    //return true;
}
function initDelete(json) {
    //return true;
}
function SetObjectResponse(cond, json, WaitingWebHook) {
    if (WaitingWebHook === undefined) WaitingWebHook = false;

    var obj = {
        cond: cond,
        json: JSON.stringify(json),
        WaitingWebHook: WaitingWebHook,
    };
    return obj;
}

function getOnergyItem(fdtid, assid, usrid, filtro) {
    return onergy_get({
        fdtid: fdtid,
        assid: assid,
        usrid: usrid,
        filter: filtro,
    });
}
