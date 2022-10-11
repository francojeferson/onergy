function init(json) {
    var data = JSON.parse(json);
    // if(data.env =="BPO")
    // {
    //     let aprroved = data.enviar_para_cliente == "1";
    //     return SetObjectResponse(aprroved,data,!aprroved);
    // }
    // else
    // {
    //     return SetObjectResponse(false,data,false);
    // }

    return SetObjectResponse(true, data, false);
}
function initBefore(json) {
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
