/******************** ENV_NODE ********************
 ******************** NAO_MEXA ********************
 */
const { date } = require('assert-plus');
const { formatDate } = require('tough-cookie');
const { log } = require('console');
const { memory } = require('console');
const { resolve } = require('path');
const { type } = require('os');
const axios = require('axios');
const fs = require('fs');
const jsuser = require('../../onergy/onergy-utils');
const onergy = require('../../onergy/onergy-client');
const utils = require('../../onergy/onergy-utils');
async function ajax(args) {
    return await onergy.ajax(args);
}
async function ajaxPost(args) {
    return await onergy.ajaxPost(args);
}
async function hashMd5(args) {
    return await onergy.hashMd5(args);
}
async function increment(args) {
    return await onergy.increment(args);
}
async function onergy_countdocs(args) {
    return await onergy.onergy_countdocs(args);
}
async function onergy_get(args) {
    let r = await onergy.onergy_get(args);
    return JSON.stringify(r);
}
async function onergy_save(args) {
    return await onergy.onergy_save(args);
}
async function ReadExcelToJson(args) {
    return await onergy.ReadExcelToJson(args);
}
async function ReadTextPdf(args) {
    return await onergy.ReadTextPdf(args);
}
async function sendmail(args) {
    return await onergy.sendmail(args);
}
async function onergy_sendto(args) {
    let r = await onergy.onergy_sendto(args);
    return JSON.stringify(r);
}
async function onergy_updatemany(args) {
    args.executeAction = false;
    return await onergy.onergy_save(args);
}
function failureCallback(error) {
    console.log('It failed with ' + error);
}
function get_usr_tmz_dt_now(data) {
    return data;
}
function replaceAll(content, needle, replacement) {
    return content.split(needle).join(replacement);
}
function successCallback(result) {
    console.log('It succeeded with ' + result);
}
/******************** NODE_SCRIPT ********************
 * Nome Tarefa: Oracle - Ordem de Compra (Histórico)
 * ID: 2444bb14-5b70-438b-9cd5-fff0ab95c46c
 * Executar automático quando em processo: Sim
 * Atividade de longa duração: Não
 * Esconder Menu: Sim
 * SLA: nenhum
 * Condicional: nenhum
 * Aprovação: nenhum
 ******************** NODE_SCRIPT ********************
 */
const idOrdemdeCompraOracleTratamento = '6434e04d-bb4e-3f8a-6081-469af01641de';
const idOracleOrdemdeCompraHistorico = '2444bb14-5b70-438b-9cd5-fff0ab95c46c';

function init(json) {
    let data = JSON.parse(json);
    let onergy_js_ctx = data.onergy_js_ctx;

    if (
        data['PURCHASE ORDER'] != null &&
        data['PURCHASE ORDER'].length > 0 &&
        data['PURCHASE ORDER'][0].PO_HEADERS_ALL != null &&
        data['PURCHASE ORDER'][0].PO_HEADERS_ALL.length > 0
    ) {
        data = data['PURCHASE ORDER'][0].PO_HEADERS_ALL[0];
        data['PURCHASE ORDER'] = '';
        data.onergy_js_ctx = onergy_js_ctx;

        if (!data.oc_tratada) {
            data.oc_tratada = true;

            let ordemCompraFdtId = '38923436-0277-42da-a534-890708524ec8';

            let copyPed = JSON.parse(JSON.stringify(data));

            copyPed.oc_original_id = data.onergy_js_ctx.fedid;

            let HDR_SEGMENT1_str = JSON.stringify(copyPed.HDR_SEGMENT1);
            copyPed.HDR_SEGMENT1 = HDR_SEGMENT1_str;

            // arrays com as linhas (itens) da Ordem de compra
            let arrayItens = data.PO_LINES_ALL;

            delete copyPed.onergy_js_ctx;
            delete copyPed.fdtid;
            delete copyPed.assid;
            delete copyPed.fedid;
            delete copyPed.usrid;

            copyPed.HDR_REGISTRATION_NUMBER_TO = formatNumberToString(data.HDR_REGISTRATION_NUMBER_TO);
            copyPed.HDR_REGISTRATION_NUMBER = formatNumberToString(data.HDR_REGISTRATION_NUMBER);

            // formatar/traduzir status da OC-Oracle
            let copyPedFormat = translationStatus(copyPed);

            let idCheckOc = criarOC(ordemCompraFdtId, copyPedFormat, data);

            // o script só deve continuar se o pedido for criado com sucesso
            if (idCheckOc != null && idCheckOc.Status == true && idCheckOc.Id != null && idCheckOc.Id.length > 0) {
                data.copia_oc_id = idCheckOc.Id;
            } else if (!idCheckOc.Status) {
                data.msgRegDuplicado = idCheckOc.Message;
                data.dtRegDuplicado = get_usr_tmz_dt_now({
                    assid: data.onergy_js_ctx.assid,
                    usrid: data.onergy_js_ctx.usrid,
                });

                let postInfo = {
                    UrlJsonContext: {
                        msgRegDuplicado: idCheckOc.Message,
                        dtRegDuplicado: data.dtRegDuplicado,
                        copia_oc_id: data.copia_oc_id,
                    },
                };

                onergy_updatemany({
                    fdtid: data.onergy_js_ctx.fdtid,
                    assid: data.onergy_js_ctx.assid,
                    usrid: data.onergy_js_ctx.usrid,
                    data: JSON.stringify(postInfo),
                    filter: JSON.stringify([{ FielName: '_id', Type: 'string', FixedType: 'string', Value1: data.onergy_js_ctx.fedid }]),
                    isMultiUpdate: false,
                });
            }
        }
    }
    // não estou salvando o pedido para manter o documento original que veio do oracle (manter a estrutura original)
    return SetObjectResponse(true, data, true);
}

// formatar/traduzir status da OC-Oracle
function translationStatus(copyPed) {
    if (copyPed.HDR_AUTHORIZATION_STATUS) {
        let statusCapa = copyPed.HDR_AUTHORIZATION_STATUS;

        let newStatus = '';
        let newStatusDesc = '';

        switch (statusCapa) {
            case 'APPROVED':
                newStatus = statusCapa;
                newStatusDesc = 'APROVADO';
                break;

            case 'IN PROCESS':
                newStatus = statusCapa;
                newStatusDesc = 'EM PROCESSO';
                break;

            case 'INCOMPLETE':
                newStatus = statusCapa;
                newStatusDesc = 'INCOMPLETO';
                break;

            case 'PRE-APPROVED':
                newStatus = statusCapa;
                newStatusDesc = 'PRÉ-APROVADO';
                break;

            case 'REJECTED':
                newStatus = statusCapa;
                newStatusDesc = 'REJEITADO';
                break;

            case 'REQUIRES REAPPROVAL':
                newStatus = statusCapa;
                newStatusDesc = 'REQUER REAPROVAÇÃO';
                break;
        }

        copyPed.HDR_AUTHORIZATION_STATUS_desc = newStatusDesc;
    }
    if (copyPed.HDR_CANCEL_FLAG) {
        let statusCapa = copyPed.HDR_CANCEL_FLAG;

        let newStatus = '';
        let newStatusDesc = '';

        switch (statusCapa) {
            case 'Y':
                newStatus = statusCapa;
                newStatusDesc = 'SIM';
                break;
            case 'N':
                newStatus = statusCapa;
                newStatusDesc = 'NÃO';
                break;
        }

        copyPed.HDR_CANCEL_FLAG_desc = newStatusDesc;
    }
    if (copyPed.HDR_CLOSED_CODE) {
        let statusCapa = copyPed.HDR_CLOSED_CODE;

        let newStatus = '';
        let newStatusDesc = '';

        switch (statusCapa) {
            case 'OPEN':
                newStatus = statusCapa;
                newStatusDesc = 'ABERTO';
                break;
            case 'CLOSED':
                newStatus = statusCapa;
                newStatusDesc = 'FECHADO';
                break;
        }

        copyPed.HDR_CLOSED_CODE_desc = newStatusDesc;
    }

    // status dos itens
    if (copyPed.PO_LINES_ALL && copyPed.PO_LINES_ALL.length > 0) {
        let totItens = copyPed.PO_LINES_ALL;
        for (let item in totItens) {
            let itemAtual = totItens[item];
            if (itemAtual.LIN_CANCEL_FLAG) {
                let statusLinha = itemAtual.LIN_CANCEL_FLAG;
                let newStatus = '';
                let newStatusDesc = '';

                switch (statusLinha) {
                    case 'Y':
                        newStatus = statusLinha;
                        newStatusDesc = 'SIM';
                        break;
                    case 'N':
                        newStatus = statusLinha;
                        newStatusDesc = 'NÃO';
                        break;
                }

                itemAtual.LIN_CANCEL_FLAG_desc = newStatusDesc;
            }

            if (itemAtual.LIN_CLOSED_CODE) {
                let statusLinha = itemAtual.LIN_CLOSED_CODE;
                let newStatus = '';
                let newStatusDesc = '';

                switch (statusLinha) {
                    case 'OPEN':
                        newStatus = statusLinha;
                        newStatusDesc = 'ABERTO';
                        break;
                    case 'CLOSED':
                        newStatus = statusLinha;
                        newStatusDesc = 'FECHADO';
                        break;
                }

                itemAtual.LIN_CLOSED_CODE_desc = newStatusDesc;
            }

            // locais de entrega de cada item
            if (itemAtual.PO_LINE_LOCATIONS_ALL) {
                let totLocaisEntrega = itemAtual.PO_LINE_LOCATIONS_ALL;
                for (let loc in totLocaisEntrega) {
                    let localAtual = totLocaisEntrega[loc];
                    if (localAtual.SHP_CANCEL_FLAG) {
                        let statusLocal = localAtual.SHP_CANCEL_FLAG;
                        let newStatus = '';
                        let newStatusDesc = '';

                        switch (statusLocal) {
                            case 'Y':
                                newStatus = statusLocal;
                                newStatusDesc = 'SIM';
                                break;
                            case 'N':
                                newStatus = statusLocal;
                                newStatusDesc = 'NÃO';
                                break;
                        }

                        localAtual.SHP_CANCEL_FLAG_desc = newStatusDesc;
                    }

                    if (localAtual.SHP_CLOSED_CODE) {
                        let statusLocal = localAtual.SHP_CLOSED_CODE;
                        let newStatus = '';
                        let newStatusDesc = '';

                        switch (statusLocal) {
                            case 'OPEN':
                                newStatus = statusLocal;
                                newStatusDesc = 'ABERTO';
                                break;
                            case 'CLOSED':
                                newStatus = statusLocal;
                                newStatusDesc = 'FECHADO';
                                break;
                        }

                        localAtual.SHP_CLOSED_CODE_desc = newStatusDesc;
                    }

                    // Distribuição de cada local de entrega
                    if (localAtual.PO_DISTRIBUTIONS_ALL) {
                        let totDistribuicao = localAtual.PO_DISTRIBUTIONS_ALL;
                        for (let loc in totDistribuicao) {
                            let distAtual = totDistribuicao[loc];
                            if (distAtual.DST_CANCEL_FLAG) {
                                let statusDist = distAtual.DST_CANCEL_FLAG;
                                let newStatus = '';
                                let newStatusDesc = '';

                                switch (statusDist) {
                                    case 'Y':
                                        newStatus = statusDist;
                                        newStatusDesc = 'SIM';
                                        break;
                                    case 'N':
                                        newStatus = statusDist;
                                        newStatusDesc = 'NÃO';
                                        break;
                                }

                                distAtual.DST_CANCEL_FLAG_desc = newStatusDesc;
                            }

                            if (distAtual.DST_CLOSED_FLAG) {
                                let statusDist = distAtual.DST_CLOSED_FLAG;
                                let newStatus = '';
                                let newStatusDesc = '';

                                switch (statusDist) {
                                    case 'Y':
                                        newStatus = statusDist;
                                        newStatusDesc = 'SIM';
                                        break;
                                    case 'N':
                                        newStatus = statusDist;
                                        newStatusDesc = 'NÃO';
                                        break;
                                }

                                distAtual.DST_CLOSED_FLAG_desc = newStatusDesc;
                            }
                        }
                    }
                }
            }
        }
    }

    return copyPed;
}

function formatNumberToString(x) {
    if (typeof x != 'string') {
        return x.toString();
    } else {
        return x;
    }
}

// relacionar pedido com seu documento
function relacionarPedidoDoc(idPed, assid, usrid, oc) {
    let docCompartilhados = '8a7b4e11-0afb-4d61-9baf-a10f01cc1606';

    //procurar se no sistema já temos uma nota relacionada a esse pedido
    let strFiltroDoc = JSON.stringify([{ FielName: 'po_extraido', Type: 'string', FixedType: 'string', Value1: oc }]);

    var strDoc = getOnergyItem(docCompartilhados, assid, usrid, strFiltroDoc);
    let itemDoc = strDoc;
    if (itemDoc != null && itemDoc.length > 0) {
        for (let doc in itemDoc) {
            let postInfo = {
                addToArray: JSON.stringify({ pedidos_relacionados: [idPed] }),
            };

            onergy_updatemany({
                fdtid: docCompartilhados,
                assid: assid,
                usrid: usrid,
                data: JSON.stringify(postInfo),
                filter: JSON.stringify([{ FielName: '_id', Type: 'string', FixedType: 'string', Value1: itemDoc[doc].ID }]),
                isMultiUpdate: false,
            });
        }
    }
}

// Salvar OC
function criarOC(fdtid, ctxSave, data) {
    let idOcUpdate = undefined;

    let strFiltro = JSON.stringify([{ FielName: 'HDR_SEGMENT1', Type: 'string', FixedType: 'string', Value1: ctxSave.HDR_SEGMENT1 }]);

    let dataPedido = getOnergyItem('38923436-0277-42da-a534-890708524ec8', data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, strFiltro);
    let updateControleReserva = false;

    if (dataPedido != null && dataPedido.length > 0) {
        updateControleReserva = true;
        idOcUpdate = dataPedido[0].ID;
    } else {
        updateControleReserva = false;
    }

    ctxSave.updateControleReserva = updateControleReserva;
    ctxSave.liberarRelacao = false;
    data.updateControleReserva = updateControleReserva;

    return sendItemToOnergy(fdtid, data.onergy_js_ctx.usrid, data.onergy_js_ctx.assid, ctxSave, idOcUpdate, true, 'HDR_SEGMENT1');
}

// salvar itens
function criarItens(arrayItens, ID_ONE_REF, usrid, assid, oc_original_id) {
    let ItensOcFdtId = 'b5c7e592-e0e2-4f7c-8b2e-86db57777cc0';

    for (let itens in arrayItens) {
        //let idOnergyItem = generateUUID();
        let locais = arrayItens[itens].PO_LINE_LOCATIONS_ALL;

        let ctxItem = arrayItens[itens];
        ctxItem.ID_ONE_REF = ID_ONE_REF;
        delete ctxItem.PO_LINE_LOCATIONS_ALL;

        ctxItem.oc_original_id = oc_original_id;

        let idItemSave = sendItemToOnergy(ItensOcFdtId, usrid, assid, ctxItem, null);
        // o script só deve continuar se o item for criado com sucesso
        if (idItemSave != null && locais != null && locais.length > 0) {
            criarLocais(locais, usrid, assid, idItemSave, oc_original_id);
        }
    }
}

// salvar locais
function criarLocais(arrayLocais, usrid, assid, ID_ONE_REF, oc_original_id) {
    let localEntregaFdtId = '8b99018e-1859-46c3-9f77-9c764931f302';

    for (let local in arrayLocais) {
        //let idOnergyLocal = generateUUID();
        let arrayDist = arrayLocais[local].PO_DISTRIBUTIONS_ALL;

        let ctxLocal = arrayLocais[local];
        ctxLocal.ID_ONE_REF = ID_ONE_REF;
        delete ctxLocal.PO_DISTRIBUTIONS_ALL;

        ctxLocal.oc_original_id = oc_original_id;

        let idItemSave = sendItemToOnergy(localEntregaFdtId, usrid, assid, ctxLocal, null);
        if (idItemSave != null && arrayDist != null && arrayDist.length > 0) {
            criarDistrib(arrayDist, usrid, assid, idItemSave, oc_original_id);
        }
    }
}

// salvar distribuidoras
function criarDistrib(arrayDist, usrid, assid, ID_ONE_REF, oc_original_id) {
    for (let dist in arrayDist) {
        let idOnergyItem = generateUUID();

        let ctxDist = arrayDist[dist];
        ctxDist.ID_ONE_REF = ID_ONE_REF;

        ctxDist.oc_original_id = oc_original_id;

        return sendItemToOnergy('54afd465-c634-4246-b6f0-5ab40aa41369', usrid, assid, ctxDist, null);
    }
}

function getOnergyItem(fdtid, assid, usrid, filtro) {
    let r = onergy_get({
        fdtid: fdtid,
        assid: assid,
        usrid: usrid,
        filter: filtro,
    });

    return JSON.parse(r);
}

function initBefore(json) {
    var data = JSON.parse(json);

    if (
        data['PURCHASE ORDER'] != null &&
        data['PURCHASE ORDER'].length > 0 &&
        data['PURCHASE ORDER'][0].PO_HEADERS_ALL != null &&
        data['PURCHASE ORDER'][0].PO_HEADERS_ALL.length > 0
    ) {
        if (data['PURCHASE ORDER'][0].PO_HEADERS_ALL[0].HDR_SEGMENT1 != null && data['PURCHASE ORDER'][0].PO_HEADERS_ALL[0].HDR_SEGMENT1.length > 0) {
            return true;
        } else {
            return {
                cond: false,
                msg_result: 'Invalid parameters: { HDR_SEGMENT1 } must have PO Number',
            };
        }
    } else {
        return {
            cond: false,
            msg_result: 'Invalid parameters: Body must have the following structure: { PURCHASE ORDER [ { PO_HEADERS_ALL [ { ... } ] } ] }',
        };
    }
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

// salvar item
function sendItemToOnergy(templateid, usrid, assid, data, fedid, statusRetorno, uk) {
    if (!statusRetorno || statusRetorno == undefined) {
        let onergySaveData = {
            fdtid: templateid,
            assid: assid,
            usrid: usrid,
            data: JSON.stringify(data),
        };
        if (fedid != null && fedid != undefined && fedid != '') {
            onergySaveData.id = fedid;
        }

        return onergy_save(onergySaveData);
    } else if (statusRetorno) {
        let onergySaveData = {
            fdtid: templateid,
            assid: assid,
            usrid: usrid,
            jsondata: JSON.stringify(data),
        };
        if (uk != null && uk.length > 0) {
            onergySaveData.ukField = uk;

            // true : não deixar duplicar e não salvar o registro
            // false : não duplicar o registro e fazer o registro duplicado rodar o save da tela onde ele esta
            onergySaveData.blockDuplicate = false;

            // true : o onergy vai olhar a duplicidade apenas nesse template onde vc esta adicioanando o dado
            // false : o onergy vai olhar no onergy toda essa possível duplicidade
            // if (checkTemplateDuplicate != undefined && checkTemplateDuplicate != '') {
            onergySaveData.checkTemplateDuplicate = true;
            // }

            //onergySaveData.executeAction = false;
        }

        if (fedid != null && fedid != undefined && fedid.length > 0) {
            onergySaveData.id = fedid;
        }

        let jsOnergySaveData = JSON.stringify(onergySaveData);

        return onergy.SaveData(jsOnergySaveData);
    }
}

// gerar guuid
function generateUUID() {
    // Public Domain/MIT
    return utils.GetNewGuid();
    /*
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
    */
}
/******************** MET_PADRAO ********************
 ******************** JSON_INIT ********************
 */
const json = {
    'PURCHASE ORDER': [
        {
            PO_HEADERS_ALL: [
                {
                    HDR_AUTHORIZATION_STATUS: 'APPROVED',
                    HDR_AUTHORIZATION_STATUS_desc: 'APROVADO',
                    HDR_BILL_TO_LOCATION: 'Campus-BRA-Sao Paulo',
                    HDR_CANCEL_FLAG: 'N',
                    HDR_CANCEL_FLAG_desc: 'NÃO',
                    HDR_CLOSED_CODE: '',
                    HDR_CLOSED_CODE_desc: '',
                    HDR_CURRENCY_CODE: 'BRL',
                    HDR_FREIGHT_TERMS_LOOKUP_CODE: '',
                    HDR_FULL_NAME: 'Rezende, Fernanda',
                    HDR_LAST_UPDATE_DATE: '2021-11-25 14:53:46',
                    HDR_PO_TOTAL_DSP: '461693.78',
                    HDR_RECIPIENT_NAME: 'Biogen Brazil Produtos Farmaceuticos LTDA',
                    HDR_REGISTRATION_NUMBER: '004.175.458',
                    HDR_REGISTRATION_NUMBER_TO: '07986222000174',
                    HDR_REGISTRATION_TYPE: 'CNPJ',
                    HDR_REVISION_NUM: '0',
                    HDR_SEGMENT1: '',
                    HDR_TERMS_NAME: '45 Days',
                    HDR_TYPE_LOOKUP_CODE: 'STANDARD',
                    HDR_VENDOR_NAME: 'OPTIONLINE LTDA',
                    HDR_VENDOR_SITE_CODE: '0001',
                    PO_HEADER_ID: '2600599',
                    PO_LINES_ALL: [
                        {
                            LIN_CANCEL_FLAG: 'N',
                            LIN_CANCEL_FLAG_desc: 'NÃO',
                            LIN_CLOSED_CODE: '',
                            LIN_CLOSED_CODE_desc: '',
                            LIN_DESCRIPTION: 'OTHER FEES AND SERVICES',
                            LIN_FICAL_CLASSIFICATION_CODE: '00000000',
                            LIN_ITEM: '519A',
                            LIN_ITEM_CATEGORY: 'N/A.N/A.N/A',
                            LIN_LAST_UPDATE_DATE: '2021-11-18 21:34:19',
                            LIN_LINE_NUM: '1',
                            LIN_LINE_TYPE: 'SERVICES RECEIVED',
                            LIN_QUANTITY: '461693.78',
                            LIN_TRANSACTION_REASON_CODE: 'SERVICOS',
                            LIN_UNIT_PRICE: '1',
                            LIN_UOM: 'EACH',
                            LIN_VL_CONTEXTO: 'JL.BR.INVIDITM.XX.Fiscal',
                            PO_HEADER_ID: '2600599',
                            PO_LINE_ID: '4087635',
                            PO_LINE_LOCATIONS_ALL: [
                                {
                                    PO_DISTRIBUTIONS_ALL: [
                                        {
                                            DST_ACCRUAL_ACCOUNT: '1335.0000.302500.00000.000.000.000.00000000.0000',
                                            DST_BUDGET_ACCOUNT: '',
                                            DST_CANCEL_FLAG: 'NULL',
                                            DST_CANCEL_FLAG_desc: '',
                                            DST_CHARGE_ACCOUNT: '1335.4803.751900.00000.000.000.000.BR720001.0000',
                                            DST_CLOSED_FLAG: 'NULL',
                                            DST_CLOSED_FLAG_desc: '',
                                            DST_DELIVER_TO_LOCATION: 'Campus-BRA-Sao Paulo',
                                            DST_DELIVER_TO_PERSON: 'Iwasaki, ��rika (��rika)',
                                            DST_DESTINATION_TYPE: 'EXPENSE',
                                            DST_DISTRIBUTION_NUM: '1',
                                            DST_LAST_UPDATE_DATE: '2022-01-12 13:01:10',
                                            DST_LOCATION_CODE: 'Campus-BRA-Sao Paulo',
                                            DST_QUANTITY: '461693.78',
                                            DST_SHIP_TO_ORGANIZATION_CODE: 'Brazil/INV',
                                            DST_VARIANCE_ACCOUNT: '1335.4803.751900.00000.000.000.000.BR720001.0000',
                                            PO_DISTRIBUTION_ID: '3789011',
                                            PO_HEADER_ID: '2600599',
                                            PO_LINE_ID: '4087635',
                                            PO_LINE_LOCATION_ID: '4426573',
                                        },
                                    ],
                                    PO_HEADER_ID: '2600599',
                                    PO_LINE_ID: '4087635',
                                    PO_LINE_LOCATION_ID: '4426573',
                                    SHP_CANCEL_FLAG: 'N',
                                    SHP_CANCEL_FLAG_desc: 'NÃO',
                                    SHP_CLOSED_CODE: 'OPEN',
                                    SHP_CLOSED_CODE_desc: 'ABERTO',
                                    SHP_LAST_UPDATE_DATE: '2022-01-12 14:00:46',
                                    SHP_LOCATION_CODE: 'Campus-BRA-Sao Paulo',
                                    SHP_NEED_BY_DATE: '',
                                    SHP_PRICE_OVERRIDE: '1',
                                    SHP_PROMISED_DATE: '',
                                    SHP_QUANTITY: '461693.78',
                                    SHP_QUANTITY_ACCEPTED: '0',
                                    SHP_QUANTITY_BILLED: '126838.95',
                                    SHP_QUANTITY_CANCELLED: '0',
                                    SHP_QUANTITY_RECEIVED: '126838.95',
                                    SHP_QUANTITY_REJECTED: '0',
                                    SHP_RCV_TOLERANCE_PERCENTUAL: '5',
                                    SHP_RCV_TOLERANCE_PERC_AMOUNT: '5',
                                    SHP_SHIPMENT_NUM: '1',
                                    SHP_SHIP_TO_ORGANIZATION_CODE: 'Brazil/INV',
                                    SHP_UOM: 'EACH',
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
};

initBefore(JSON.stringify(json));
