function init(json) {
    var data = JSON.parse(json);
    var aprovado = data.aprovado_cliente == '1';

    if (aprovado) {
        data.aprovado_user = data.usrid;
        data.aprovado_data = new Date();

        var dateObj = new Date();
        var month = dateObj.getUTCMonth() + 1; //months from 1-12
        var day = dateObj.getUTCDate();
        var year = dateObj.getUTCFullYear();

        data.competencia = month + '/' + year;
    }

    return SetObjectResponse(aprovado, data, !aprovado);
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
