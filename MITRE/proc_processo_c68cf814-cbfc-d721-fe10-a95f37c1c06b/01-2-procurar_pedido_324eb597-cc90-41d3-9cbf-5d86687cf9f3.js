function init(json) {
    var data = JSON.parse(json);

    data.testeGabriel = true;

    // com base no tipo de ERP, vamos saber em qual tela vamos buscar o pedido e quais os campos vamos usar para fazer essa busca
    let erp = data.ERP_erp_type;
    let templateBuscPed = null;
    let templateBuscPedCopy = null;
    let pedCtx = null;
    let nota_cancelada = data.nota_cancelada === 'Sim';

    if (!nota_cancelada) {
        IniciaProcessoRelacionaPedidoXDocumento(data);
    }

    //return true;
    return SetObjectResponse(true, data, true);
}
function sendItemToOnergy(templateid, usrid, assid, data, fedid, ukField) {
    let onergySaveData = {
        fdtid: templateid,
        assid: assid,
        usrid: usrid,
        data: JSON.stringify(data),
    };
    if (fedid != undefined && fedid != '') {
        onergySaveData.id = fedid;
    }
    if (ukField != undefined && ukField != '') {
        onergySaveData.ukField = ukField;
    }

    return onergy_save(onergySaveData);
}

function IniciaProcessoRelacionaPedidoXDocumento(data) {
    let dataProcessoRelacao = {
        doc_original: data.doc_original,
        idfk: data.fedid,
        tipo: data.tipo,
        data_id_inbox: data.id_save_inbox,
        ERP_erp_type: data.ERP_erp_type,
        id_template_inbox: data.id_template_inbox,
        habilitar_validacao_comercial: data.habilitar_validacao_comercial,
        habilitar_validacao_fiscal: data.habilitar_validacao_fiscal_taxfy_link,
        id_ref_validacoesComercial: data.id_ref_validacoesComercial,
        inbox_automatico: data.inbox_automatico,
        forma_integracao: data.forma_integracao,
        cnpj_destinatario: data.dest_cnpj,
    };

    if (data.tipo == 'NFE' || data.tipo == 'NFSE') {
        dataProcessoRelacao.po = data.po_extraido;
    }
    // Envia para o processo de ASSOCIAR PEDIDOxDOC:  c97be184-ca7a-4c6f-9f2c-8d015a2d5e64
    let id_relation_pedido = sendItemToOnergy('c97be184-ca7a-4c6f-9f2c-8d015a2d5e64', data.usrid, data.assid, dataProcessoRelacao, null, 'idfk');

    data.id_relation_pedido = id_relation_pedido;
}

// buscar os tipos de validação comercial
function getTipoValidComercial(idConfigValid, assid, usrid) {
    let strFiltro = JSON.stringify([{ FielName: 'ID_ONE_REF', Type: 'string', FixedType: 'string', Value1: idConfigValid }]);

    var strTipoValid = getOnergyItem('d5482e8e-a646-4a35-a36c-3037a8e2b401', assid, usrid, strFiltro);
    let itemTipValid = strTipoValid;

    // esse arrray com as configurações da validação comercial
    let arrayRespValid = [];

    if (itemTipValid != null && itemTipValid.length > 0) {
        for (let tipValid in itemTipValid) {
            let ctx = itemTipValid[tipValid].UrlJsonContext;
            arrayRespValid.push(ctx);
        }
    }
    return arrayRespValid;
}

// metodo responsável por fazer as validações comercial e criar um log para cada uma delas se for necessario
function validacaoComercial(lstValid, docCtx, pedCtx, ID_ONE_REF) {
    let arrayRespValid = [];
    let dtAtual = get_usr_tmz_dt_now({
        assid: docCtx.onergy_js_ctx.assid,
        usrid: docCtx.onergy_js_ctx.usrid,
    });

    for (let tipValid in lstValid) {
        let ctx_valid = lstValid[tipValid];
        let tipValidNome = ctx_valid.tipo_validacao;
        let objAtual = {
            LVC_validacao: ctx_valid.LVC_validacao,
            LVC_id: ctx_valid.LVC_id,
            data_validacao: dtAtual,
            ID_ONE_REF: ID_ONE_REF,
        };

        if (tipValidNome == 'comparar') {
            let val_a = docCtx[ctx_valid.campo_documento];
            let val_b = pedCtx[ctx_valid.campo_pedido];
            let respComp = compararValores(val_a, val_b);

            if (respComp) {
                objAtual.resultado_validacao = 'consistente';
                objAtual.resultado_validacao_desc = 'Consistente';
            } else {
                objAtual.resultado_validacao = 'inconsistente';
                objAtual.resultado_validacao_desc = 'Inconsistente';
                objAtual.severidade = ctx_valid.severidade;
                objAtualseveridade_desc = ctx_valid.severidade_desc;
                objAtual.msg_erro = ctx_valid.msg_erro;
            }
            arrayRespValid.push(objAtual);
        }
    }
    return arrayRespValid;
}

function compararValores(val_a, val_b, ctx_valid) {
    let resp = false;
    if (typeof val_a == 'number') {
        val_a.toString();
    }
    if (typeof val_b == 'number') {
        val_b = val_b.toString();
    }
    if (val_a == val_b) {
        resp = true;
    }
    return resp;
}

function getPedido(data, fdtidPedOrig, fdtidPedCopy, numPed_ref) {
    let docCompartilhados = '8a7b4e11-0afb-4d61-9baf-a10f01cc1606';

    let strFiltroPed = JSON.stringify([{ FielName: numPed_ref, Type: 'string', FixedType: 'string', Value1: data.po_extraido }]);

    var strPed = getOnergyItem(fdtidPedCopy, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, strFiltroPed);
    let itemPed = strPed;

    // depois de encontrar o pedido na tela de historico, vamos buscar a copoia dele para amarrar os dois como referencia dessa nota atual que esta rodando no processo
    if (itemPed != null && itemPed.length > 0) {
        let postInfo = {
            addToArray: JSON.stringify({ pedidos_relacionados: [itemPed[0].ID] }),
        };

        onergy_updatemany({
            fdtid: docCompartilhados,
            assid: data.onergy_js_ctx.assid,
            usrid: data.onergy_js_ctx.usrid,
            data: JSON.stringify(postInfo),
            filter: JSON.stringify([{ FielName: 'doc_original', Type: 'string', FixedType: 'string', Value1: data.onergy_js_ctx.fedid }]),
            isMultiUpdate: true,
        });

        // retornar o id do pedido será importando para fazer a validação comercial
        return itemPed[0].UrlJsonContext;
    } else {
        return false;
    }
}

function initBefore(json) {
    return true;
}

function initDelete(json) {
    let data = JSON.parse(json);

    let postInfoDelet = {
        UrlJsonContext: {
            id_user_resp_delet: data.usrid,
        },
        BlockCount: 1,
    };

    let excluirFilter = JSON.stringify([{ FielName: 'doc_original', Type: 'string', FixedType: 'string', Value1: data.fedid }]);
    // documentos compartilhados
    onergy_updatemany({
        fdtid: '8a7b4e11-0afb-4d61-9baf-a10f01cc1606',
        assid: data.onergy_js_ctx.assid,
        usrid: data.onergy_js_ctx.usrid,
        data: JSON.stringify(postInfoDelet),
        filter: excluirFilter,
        isMultiUpdate: true,
    });

    // integração
    onergy_updatemany({
        fdtid: '1af4c232-96ea-4d1a-a586-c0a71d414d46',
        assid: data.onergy_js_ctx.assid,
        usrid: data.onergy_js_ctx.usrid,
        data: JSON.stringify(postInfoDelet),
        filter: excluirFilter,
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
    var r = onergy_get({
        fdtid: fdtid,
        assid: assid,
        usrid: usrid,
        filter: filtro,
    });
    return JSON.parse(r);
}
