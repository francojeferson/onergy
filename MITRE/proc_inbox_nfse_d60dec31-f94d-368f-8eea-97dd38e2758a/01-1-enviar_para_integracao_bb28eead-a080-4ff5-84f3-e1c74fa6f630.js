function init(json) {
    var data = JSON.parse(json);

    return SetObjectResponse(true, null, false);
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

    let obj = {
        cond: cond,
        WaitingWebHook: WaitingWebHook,
    };
    if (json) {
        obj.json = JSON.stringify(json);
    }
    if (!WaitingWebHook) {
        obj.onergy_prc_id = 'b45d6b8b-e386-4354-69f5-703524c30542'; // id do processo: Integração ERP
        obj.onergy_new_prc_id_fdtid = '1af4c232-96ea-4d1a-a586-c0a71d414d46'; // id da tarefa: Verificar forma de Integração
    }
    return obj;
}
