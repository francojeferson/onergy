function init(json) {
    var data = JSON.parse(json);
    onergy.log('Associar Pedido - Documento', data);
    data.existPo = false;

    //RELACIONA DOCUMENTO COM PEDIDO
    var FieldSearchOrder = '';
    var pedCtx = null;

    if (data.tipo == 'NFSE' || data.tipo == 'NFE') {
        if (data.ERP_erp_type == 'ORACLE') {
            templateBuscPed = '38923436-0277-42da-a534-890708524ec8';
            FieldSearchOrder = 'HDR_SEGMENT1';
            getPedido(data, templateBuscPed, FieldSearchOrder);
            data.templatePedido = templateBuscPed;
        } else if (data.ERP_erp_type == 'B1') {
            templateBuscPed = 'e15ffd95-9894-40ac-acc7-ad573ae27c6b';
            FieldSearchOrder = 'DocNum';
            getPedido(data, templateBuscPed, FieldSearchOrder);
            data.templatePedido = templateBuscPed;
        }
    } else if (data.tipo == 'PEDIDO') {
        if (data.ERP_erp_type == 'ORACLE' && data.pedido_ok_relacionamento == 'Sim') {
            getDocPed(data);
        }
        // else if (data.ERP_erp_type == "B1") {
        //     templateBuscPed = 'e15ffd95-9894-40ac-acc7-ad573ae27c6b';
        //     FieldSearchOrder = 'DocNum';
        //     await getPedido(data, templateBuscPed, FieldSearchOrder);
        // }
    }

    //Integracao AUTOMATICA verificar validacao comercial e fiscal

    if (data.inbox_automatico == 'sim' && data.habilitar_validacao_comercial == 'Não' && data.habilitar_validacao_fiscal == 'Não') {
        let ctxIntrecaoOk = {
            inbox_automatico: data.inbox_automatico,
        };

        let x = sendItemToOnergy(data.id_template_inbox, data.usrid, data.assid, ctxIntrecaoOk, data.data_id_inbox);

        return SetObjectResponse(false, data, true);
    }

    //return true;
    return SetObjectResponse(true, data, false);
}

function IniciarSugesEscrit(data) {
    /*
    "pedidos_relacionados": pedidos_relacionados,
    "usrid": contextdata.usrid,
    "assid": contextdata.assid,
    "id_dado": contextdata.fedid,
    "ped_finalid_codigo": mtdOnergy.JsEvtGetItemValue("ped_finalid_codigo"),
    "dest_cnpj": mtdOnergy.JsEvtGetItemValue("cnpj_destinatario"),
    "screenSessionID": screenSessionID
    */

    let objSugestEscrit = {};

    if (data.tipo == 'PEDIDO') {
        objSugestEscrit.pedidos_relacionados = [data.idfk];
        objSugestEscrit.usrid = data.usrid;
        objSugestEscrit.assid = data.assid;
        objSugestEscrit.id_dado = data.idDocumento;
        objSugestEscrit.dest_cnpj = data.cnpj_destinatario;
    } else if (data.tipo == 'NFE') {
        objSugestEscrit.usrid = data.usrid;
        objSugestEscrit.assid = data.assid;
        objSugestEscrit.id_dado = data.data_id_inbox;
        objSugestEscrit.dest_cnpj = data.cnpj_destinatario;
        objSugestEscrit.pedidos_relacionados = [data.idPedido];
    }

    sendItemToOnergy('87108061-7189-462a-b376-8e7765f94ed2', data.usrid, data.assid, objSugestEscrit);
}

function getControleReserva(id, data) {
    // buscar registro de controle e reserva de estoque
    let strFiltro = JSON.stringify([{ FielName: 'idfk', Type: 'string', FixedType: 'string', Value1: id }]);

    var controleReserva = getOnergyItem('47e350b5-fc68-4598-92f9-583716d80c2c', data.assid, data.usrid, strFiltro);
    if (controleReserva != null && controleReserva.length > 0) {
        data.id_controle_reserva = controleReserva[0].ID;
    }
}

function getPedido(data, fdtidPedCopy, numPed_ref) {
    let strFiltroPed = JSON.stringify([
        { FielName: numPed_ref, Type: 'string', FixedType: 'string', Value1: data.po },
        { FielName: 'pedido_ok_relacionamento', Type: 'string', FixedType: 'string', Value1: 'Sim' },
    ]);

    var itemPeds = getOnergyItem(fdtidPedCopy, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, strFiltroPed);

    // depois de encontrar o pedido na tela de historico, vamos buscar a copoia dele para amarrar os dois como referencia dessa nota atual que esta rodando no processo
    if (itemPeds != null && itemPeds.length > 0) {
        var pedidoHeader = [];
        //template dos pedidos do inbox (NFE, NFSE?)
        //af5cf9ee-6a7e-46de-85de-1b6e6f470508

        // buscar documento para ver status atual dele
        let strFiltroDoc = JSON.stringify([{ FielName: '_id', Type: 'string', FixedType: 'string', Value1: data.data_id_inbox }]);
        var itemDoc = getOnergyItem(data.id_template_inbox, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, strFiltroDoc);

        let statusDoc = null;
        if (itemDoc != null && itemDoc.length > 0) {
            statusDoc = itemDoc[0].UrlJsonContext.status;
        }

        let postInfo = {
            addToArray: JSON.stringify({ pedidos_relacionados: [itemPeds[0].ID] }),
            UrlJsonContext: {},
        };

        // se o documento Inbox já estiver com um status de 'Verificar Inconsistências', não devemos mexer nesse status
        if (statusDoc != null && statusDoc != 'Verificar Inconsistências' && data.habilitar_validacao_comercial == 'Não') {
            postInfo.UrlJsonContext.status = 'Aguardando Aprovação';
            postInfo.UrlJsonContext.status_desc = 'Aguardando Aprovação';
        }

        data.idPedido = itemPeds[0].ID;
        data.existPo = true;

        if (data.pedidosid == undefined) {
            data.pedidosid = [];
        }

        data.pedidosid.push(itemPeds[0].ID);

        onergy_updatemany({
            fdtid: data.id_template_inbox,
            assid: data.onergy_js_ctx.assid,
            usrid: data.onergy_js_ctx.usrid,
            data: JSON.stringify(postInfo),
            filter: JSON.stringify([{ FielName: '_id', Type: 'string', FixedType: 'string', Value1: data.data_id_inbox }]),
            isMultiUpdate: true,
        });
        getControleReserva(itemPeds[0].ID, data);
    }
}

function getDocPed(data) {
    let inboxGlobalFdtId = 'e99e21dc-5847-484e-9142-9a8cdd78e8cd';

    let strFiltroDoc = JSON.stringify([
        { FielName: 'po_extraido', Type: 'string', FixedType: 'string', Value1: data.po },
        //{ FielName: "pedido_ok_relacionamento", Type: "string", FixedType: "string", Value1: "Sim" }
    ]);

    var itemDoc = getOnergyItem(inboxGlobalFdtId, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, strFiltroDoc);
    if (itemDoc != null && itemDoc.length > 0) {
        var pedidoHeader = [];
        //template dos pedidos do inbox (NFE, NFSE?)
        //af5cf9ee-6a7e-46de-85de-1b6e6f470508

        data.idDocumento = itemDoc[0].ID;

        data.data_id_inbox = itemDoc[0].ID;
        data.id_template_inbox = itemDoc[0].UrlJsonContext.fdtid;
        data.habilitar_validacao_comercial = itemDoc[0].UrlJsonContext.habilitar_validacao_comercial;
        data.id_ref_validacoesComercial = itemDoc[0].UrlJsonContext.id_ref_validacoesComercial;
        data.inbox_automatico = itemDoc[0].UrlJsonContext.inbox_automatico;

        let postInfo = {
            addToArray: JSON.stringify({ pedidos_relacionados: [data.idfk] }),
            UrlJsonContext: {},
        };

        // se o documento Inbox já estiver com um status de 'Verificar Inconsistências', não devemos mexer nesse status
        if (data.status != 'Verificar Inconsistências' && data.habilitar_validacao_comercial == 'Não') {
            postInfo.UrlJsonContext.status = 'Aguardando Aprovação';
            postInfo.UrlJsonContext.status_desc = 'Aguardando Aprovação';
        }

        data.existPo = true;

        if (data.pedidosid == undefined) {
            data.pedidosid = [];
        }

        data.pedidosid.push(data.idfk);

        onergy_updatemany({
            fdtid: inboxGlobalFdtId,
            assid: data.onergy_js_ctx.assid,
            usrid: data.onergy_js_ctx.usrid,
            data: JSON.stringify(postInfo),
            filter: JSON.stringify([{ FielName: '_id', Type: 'string', FixedType: 'string', Value1: itemDoc[0].ID }]),
            isMultiUpdate: true,
        });
    }
}

function AssociarDocumentoAoPedido(data) {}

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
        if (pageResp !== null && pageResp.length > 0) {
            keepSearching = pageResp.length == take;
            result = result.concat(pageResp);
        } else {
            keepSearching = false;
        }
    }
    return result;
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

function sendItemToOnergy(templateid, usrid, assid, data, fedid, ukField) {
    let onergySaveData = {
        fdtid: templateid,
        assid: assid,
        usrid: usrid,
        //data: JSON.stringify(data)
    };
    if (data != null) {
        onergySaveData.data = JSON.stringify(data);
    }
    if (fedid != undefined && fedid != '') {
        onergySaveData.id = fedid;
    }
    if (ukField != undefined && ukField != '') {
        onergySaveData.ukField = ukField;
    }

    return onergy_save(onergySaveData);
}
