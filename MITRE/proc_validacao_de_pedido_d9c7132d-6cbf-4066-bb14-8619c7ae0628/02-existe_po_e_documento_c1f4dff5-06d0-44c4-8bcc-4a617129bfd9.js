function init(json) {
    var data = JSON.parse(json);
    onergy.log('Existe PO e Documento ?', data);
    let cond = false;

    // o registro só deverá ir para a validação comercial se o mesmo estiver configurado pra isso e tiver um PO
    if (data.habilitar_validacao_comercial == 'Sim' && data.existPo) {
        cond = true;
    }

    return SetObjectResponse(cond, data, false);
}
function initBefore(json) {
    return true;
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
