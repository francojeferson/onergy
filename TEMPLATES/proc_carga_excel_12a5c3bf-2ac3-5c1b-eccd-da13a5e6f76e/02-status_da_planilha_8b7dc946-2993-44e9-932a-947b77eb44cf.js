function init(json) {
    var data = JSON.parse(json);
    let execCargExcelFdtId = '374fb18a-9072-4cdb-b46b-cead22d6be58';

    let dataUpdate = {};

    dataUpdate.id_upload_planilha = data.onergy_js_ctx.fedid;
    data.id_upload_planilha = data.onergy_js_ctx.fedid;

    let itemPost = {};
    itemPost.data = JSON.stringify(data);
    itemPost.assid = data.onergy_js_ctx.assid;
    itemPost.fdtid = execCargExcelFdtId;
    itemPost.usrid = data.onergy_js_ctx.usrid;

    dataUpdate.id_exec_planilha = onergy_save(itemPost);

    return SetObjectResponse(true, dataUpdate, true);
}
function initBefore(json) {
    //return true;
}
function initDelete(json) {
    var data = JSON.parse(json);
    let childrenUploadFilter = JSON.stringify([{ FielName: 'id_upload_planilha', Type: 'string', FixedType: 'string', Value1: data.onergy_js_ctx.fedid }]);

    // apagar todos os registros da tela designar que foram criados atraves desse upload de planilha
    onergy_updatemany({
        fdtid: data.CDPE_id_card,
        assid: data.onergy_js_ctx.assid,
        usrid: data.onergy_js_ctx.usrid,
        data: JSON.stringify({ BlockCount: 1 }),
        filter: childrenUploadFilter,
        isMultiUpdate: true,
    });

    return true;
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
    return JSON.stringify(result);
}
