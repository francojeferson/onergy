function init(json) {
    var data = JSON.parse(json);

    let taxNotifFdtId = '89c6134b-e39b-48c8-bd79-95777e2a0555';

    let chaveNfe = data.chaveNfe;

    let strFiltro = JSON.stringify([{ FielName: 'chave', Type: 'string', FixedType: 'string', Value1: chaveNfe }]);

    let taxNot = getOnergyItem(taxNotifFdtId, data.assid, data.usrid, strFiltro);
    if (taxNot != null && taxNot.length > 0) {
        let idTaxNot = taxNot[0].ID;

        let onergySaveData = {
            fdtid: taxNotifFdtId,
            assid: data.assid,
            usrid: data.usrid,
            data: JSON.stringify({
                chave: chaveNfe,
            }),
            id: idTaxNot,
            executeAction: true,
        };
        let x = onergy_save(onergySaveData);
    }

    return SetObjectResponse(true, data, false);
}

function getOnergyItem(fdtid, assid, usrid, filtro) {
    let keepSearching = true;
    let skip = 0;
    take = 500;
    let result = [];
    while (keepSearching) {
        let strPageResp = onergy_get({
            fdtid: fdtid,
            assid: assid,
            usrid: usrid,
            filter: filtro,
            skip: skip,
            take: take,
        });
        skip += take;
        let pageResp = JSON.parse(strPageResp);
        if (pageResp != null && pageResp.length > 0) {
            keepSearching = pageResp.length == take;
            result = result.concat(pageResp);
        } else {
            keepSearching = false;
        }
    }
    return result;
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
