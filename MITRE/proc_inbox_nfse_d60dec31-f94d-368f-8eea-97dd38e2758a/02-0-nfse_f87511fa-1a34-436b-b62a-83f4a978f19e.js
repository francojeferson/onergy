function init(json) {
    var data = JSON.parse(json);

    // Se o Cancelamento em andamento for sim, encmainhar para tela de cancelado. Se não, continuar para integração
    if (data.status_processo == 'cancelada') {
        return SetObjectResponse(false, data, false);
    }

    let ficarNaTela = true;

    if (data.status_processo == 'ap_lancada' || data.status_processo == 'lancar_ap_direta') {
        ficarNaTela = false;
    }

    // Adicionar usr para visualizar o registro
    let UsrID = [];
    if (data.usuario_atribuidos_id) {
        UsrID.push(data.usuario_atribuidos_id);
    }

    data.lastUsrSelID = data.UsrSelID;

    data.UsrSelID = UsrID[0];

    //return true;
    return SetObjectResponse(true, data, ficarNaTela, data.UsrSelID, data.lastUsrSelID);
}

function initBefore(json) {
    //return true;
}
function initDelete(json) {
    //return true;
}

function SetObjectResponse(cond, json, WaitingWebHook, usrID, lstDelUsrid) {
    if (WaitingWebHook === undefined) WaitingWebHook = false;

    var obj = {
        cond: cond,
        json: JSON.stringify(json),
        WaitingWebHook: WaitingWebHook,
    };

    if (lstDelUsrid && lstDelUsrid.length > 0) {
        obj['lstDelUsrid'] = lstDelUsrid;
    }

    if (usrID && usrID.length > 0) {
        obj['UsrID'] = usrID;
    }

    return obj;
}
