//!NODE_ENV ===
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

replaceAll = function (content, needle, replacement) {
    return content.split(needle).join(replacement);
};

async function ajax(args) {
    return await onergy.ajax(args);
}

async function ajaxPost(args) {
    return await onergy.ajaxPost(args);
}

function failureCallback(error) {
    console.log('It failed with ' + error);
}

function get_usr_tmz_dt_now(data) {
    return new Date().toLocaleString();
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
    const r = await onergy.onergy_get(args);
    return JSON.stringify(r);
}

async function onergy_save(args) {
    return await onergy.onergy_save(args);
}

function onergy_updatemany(data) {}

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
    var r = await onergy.onergy_sendto(args);
    return JSON.stringify(r);
}

function onergy_updatemany(data) {
    return data;
}

function successCallback(result) {
    console.log('It succeeded with ' + result);
}

//!SCRIPT ===
async function getOnergyItem(fdtid, assid, usrid, filtro) {
    let keepSearching = true;
    let skip = 0;
    let take = 500;
    let result = [];
    while (keepSearching) {
        let strPageResp = await onergy_get({
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

function sendItemToOnergy(templateid, usrid, assid, data, fedid, ukField, checkTemplateDuplicate, addCfgViewGroup) {
    let onergySaveData = {
        fdtid: templateid,
        assid: assid,
        usrid: usrid,
        data: JSON.stringify(data),
        executeAction: false,
    };
    if (fedid != undefined && fedid != '') {
        onergySaveData.id = fedid;
    }
    if (ukField != undefined && ukField != '') {
        onergySaveData.ukField = ukField;
        onergySaveData.blockDuplicate = true;
    }
    if (checkTemplateDuplicate != undefined && checkTemplateDuplicate != '') {
        onergySaveData.checkTemplateDuplicate = true;
    }
    if (addCfgViewGroup != undefined && addCfgViewGroup.length > 0) {
        onergySaveData.lstGrpID = addCfgViewGroup;
    }
    return onergy_save(onergySaveData);
}

const fdtControleReservaPedido = '47e350b5-fc68-4598-92f9-583716d80c2c';
const fdtEnvioEmailValidacaoComercialFiscal = '82d06b32-d231-4b9a-8481-42f770a246bd';
const fdtGerenciamentoStatus = 'b4d40fa5-fe8a-4af5-941f-a252e5056556';
const fdtGridUMSiglas = '90710c2a-d186-4808-adf8-6a9281c04c5c';
const fdtHistoricoValidacaoComercial = 'e748f511-f9cb-4afa-8ac6-4dcff3bef547';
const fdtInboxGlobal = 'e99e21dc-5847-484e-9142-9a8cdd78e8cd';
const fdtItensControleReservaPedido = '199db1f6-e610-4122-a019-52ac256362b4';
const fdtListaERP = '0128ff17-4ea4-4999-afdd-0f671d4df0d0';
const fdtMovimentacaoItensControleReservaPedido = 'f4ebf0a8-6db3-45fa-87c1-bbd794c7ebbb';
const fdtProdutos = '89029c17-ce75-4afd-a46b-ad83659555d4';
const fdtRegrasValidacoes = 'd5482e8e-a646-4a35-a36c-3037a8e2b401';
const fdtUnidadeMedida = 'd9d7c604-5f44-4b68-8880-6b7a523a70a0';
const fdtValidacaoComercial = 'ed86f53c-c07e-4d66-a71e-add5be02de91';

async function BuscarDocumento(data) {
    const strFiltro = JSON.stringify([{ FielName: '_id', Type: 'string', FixedType: 'string', Value1: data.id_save_inbox }]);
    const documento = await getOnergyItem(fdtInboxGlobal, data.assid, data.usrid, strFiltro);
    if (documento != null && documento.length > 0) {
        data.id_template_inbox = documento[0].templateid;
        idDocumento = documento[0].ID;
        return documento[0].UrlJsonContext;
    } else {
        return null;
    }
}

async function BuscarPedido(data, idPedido) {
    const strFiltro = JSON.stringify([{ FielName: '_id', Type: 'string', FixedType: 'string', Value1: idPedido }]);
    const pedido = await getOnergyItem(data.templatePedido, data.assid, data.usrid, strFiltro);
    if (pedido != null && pedido.length > 0) {
        pedido = pedido[0].UrlJsonContext;
        return pedido;
    } else {
        return null;
    }
    /*
    if (data.ERP_erp_type == 'ORACLE') {
        pedido.UrlJsonContext.itens = BuscarItensPedidoOracle(data, pedido.ID);
        for (let itemIndex in pedido.UrlJsonContext.itens) {
            let item = pedido.UrlJsonContext.itens[itemIndex].UrlJsonContext;
            item.Locais = BuscarLocaisDosItensOracle(data, item.ID);
            for (let LocalIndex in item.Locais) {
                let local = item.Locais[LocalIndex].UrlJsonContext;
                local.distribuicao = BuscarDistribuicaoDosLocaisOracle(data, local.ID);
            }
        }
    }
    */
}

async function checkErrorValidation(arrayLogValid, data, documento) {
    let errorCheck = arrayLogValid.filter((x) => x.resultado_validacao == 'inconsistente' && x.severidade == 'Erro');
    let objSaveStatus = {
        ctdDocInbox_fedid: documento.fedid,
        habilitar_val_comercial: documento.habilitar_validacao_comercial,
        habilitar_val_fiscal: documento.habilitar_validacao_fiscal_taxfy_link,
        templateId_Inbox: data.id_template_inbox,
    };
    let EnviaParaGerenciamentoStatus = await sendItemToOnergy(fdtGerenciamentoStatus, data.usrid, data.assid, objSaveStatus, null, true, 'ctdDocInbox_fedid');
}

function compararValores(regra, documento, pedido, itemDocPed, tipoValid) {
    let resp = false;
    let multiplosItens = regra.campo_documento.substring(0, regra.campo_documento.indexOf('[')) != '';
    if (multiplosItens) {
        for (let item in itemDocPed) {
            let campoValorDoc = getLastField(regra.campo_documento);
            let campoValorPed = getLastField(regra.campo_pedido);
            let deParaAtual = itemDocPed[item];
            let valDoc = parseFloat(deParaAtual.itemDoc[campoValorDoc]);
            let valPed = parseFloat(deParaAtual.itemPed[campoValorPed]);
            if (typeof valDoc == 'number') {
                valDoc = valDoc.toString();
            }
            if (typeof valPed == 'number') {
                valPed = valPed.toString();
            }
            if (valDoc == valPed) {
                resp = true;
            }
            if (!resp) {
                return resp;
            }
        }
        return resp;
    } else {
        let val_a = null;
        if (tipoValid != 'Moeda') {
            let fnDoc = new Function('documento', 'return ' + regra.campo_documento);
            val_a = fnDoc.call(null, documento);
        } else {
            val_a = 'BRL';
        }
        let fnPedido = new Function('pedido', 'return ' + regra.campo_pedido);
        let val_b = fnPedido.call(null, pedido);
        if (typeof val_a == 'number') {
            val_a = val_a.toString();
        }
        if (typeof val_b == 'number') {
            val_b = val_b.toString();
        }
        if (val_a == val_b) {
            resp = true;
        }
        return resp;
    }
}

async function consumirApi(assid, usrid, fedid, pedido, documento, regra, itemDocPed) {
    //let objExt = JSON.parse(params);
    let lstRespApi = [];
    let strParams = regra.script;
    let rgex = /\n/gi;
    let params_chamada_api = strParams.replace(rgex, '');
    params_chamada_api = JSON.parse(params_chamada_api);
    let lstUrlApi = await converParmsBuscApi(regra, pedido, documento, itemDocPed, assid, usrid);
    let resp = null;
    if (lstUrlApi != null && lstUrlApi.length > 0) {
        for (let x in lstUrlApi) {
            params_chamada_api.url = lstUrlApi[x].url;
            let url = encodeURI(params_chamada_api.url);
            if (!lstUrlApi[x].cancelarBuscaApi) {
                let he = params_chamada_api.headers;
                params_chamada_api.url = url;
                params_chamada_api.headers;
                //params_chamada_api.data = JSON.stringify({ user_key: "856211e607a528fd9655cec646b7cb7e" });
                params_chamada_api.async = false;
                params_chamada_api.assid = assid;
                params_chamada_api.usrid = usrid;
                params_chamada_api.fedid = fedid;
                let headers = JSON.stringify(params_chamada_api.headers);
                let respDic = dicionarioRespApi.filter((zz) => zz.keyUrl == lstUrlApi[x].keyUrl);
                if (respDic.length == 0) {
                    ajax({
                        url: params_chamada_api.url,
                        headers: headers,
                        //data: params_chamada_api.data,
                        async: params_chamada_api.async,
                        method: 'GET',
                        contentType: 'application/json',
                        assid: params_chamada_api.assid,
                        usrid: params_chamada_api.usrid,
                        fedid: params_chamada_api.fedid,
                        success: function (json) {
                            if (typeof json === 'string') {
                                json = JSON.parse(json);
                            }
                            resp = json;
                            lstRespApi.push({
                                url: url,
                                keyUrl: lstUrlApi[x].keyUrl,
                                respApi: resp,
                            });
                            dicionarioRespApi.push({
                                url: url,
                                keyUrl: lstUrlApi[x].keyUrl,
                                respApi: resp,
                            });
                        },
                        error: function (json) {
                            return null;
                        },
                    });
                } else {
                    return respDic;
                }
            } else {
                lstRespApi.push({
                    url: url,
                    keyUrl: lstUrlApi[x].keyUrl,
                    consultaDesdenessaria: lstUrlApi[x].cancelarBuscaApi,
                });
                dicionarioRespApi.push({
                    url: url,
                    keyUrl: lstUrlApi[x].keyUrl,
                    consultaDesdenessaria: lstUrlApi[x].cancelarBuscaApi,
                });
            }
        }
    }
    return lstRespApi;
}

async function consumirQtd(itensReserva, documento, regra, resultlog, tipConsumo, assid, usrid, fedid, dtAtual, pedido, camposErp, arrayDeParaItens) {
    let itemDocPed = arrayDeParaItens.arrayRetorno;
    let lstError = arrayDeParaItens.lstError;
    if (lstError == null || lstError == undefined || lstError.length == 0) {
        let campoQtdDoc_caminho = regra.campo_quantidade_documento;
        let campoQtdPed = camposErp.campo_quantidade;
        let codItemPed = camposErp.campo_codigo_produto;
        let unidMedPed = camposErp.campo_unidade_medida;
        let unidMedDoc = regra.campo_unidade_medida;
        let campo_retorno_api = regra.campo_retorno_api;
        let campoNumDoc = camposErp.campo_numero_pedido;
        let unidMedItemPed = null;
        let unidMedItemDoc = null;
        let idItemConsumir = null;
        let fdtIdItemConsumir = null;
        let valTotDoc = null;
        let valTotPed = null;
        let numDoc = null;
        let campoLinhaItem = getLastField(camposErp.campo_linha_item);
        let novaQtd_posConsumir = '';
        let consumaDocumento = null;
        for (let it in itemDocPed) {
            if (tipConsumo == 'Quantidade') {
                campoQtdDoc = getLastField(campoQtdDoc_caminho);
                campoQtdPed = getLastField(campoQtdPed);
                campoCodItemPed = getLastField(codItemPed);
                let unidMedPed_final = getLastField(unidMedPed);
                let unidMedDoc_final = getLastField(unidMedDoc);
                let ctxItemDocPed = itemDocPed[it];
                let qtdItemDoc = ctxItemDocPed.itemDoc[campoQtdDoc];
                let qtdItemPed = ctxItemDocPed.itemPed[campoQtdPed];
                let CodItemPed = ctxItemDocPed.itemPed[campoCodItemPed];
                let linhaItemPed = ctxItemDocPed.itemPed[campoLinhaItem];
                unidMedItemPed = ctxItemDocPed.itemPed[unidMedPed_final];
                unidMedItemDoc = ctxItemDocPed.itemDoc[unidMedDoc_final];
                let item = itensReserva.filter((x) => x.UrlJsonContext.codigo_produto == CodItemPed && x.UrlJsonContext.linha_item == linhaItemPed);
                if (item.length > 0) {
                    idItemConsumir = item[0].ID;
                    fdtIdItemConsumir = item[0].templateid;
                    let ctxItem = item[0].UrlJsonContext;
                    numDoc = ctxItem.numero_pedido;
                    if (tipConsumo == 'Quantidade') {
                        consumaReserva = strToNumber(ctxItem.quantidade_produto_atual);
                        toleranciaPorcent = strToNumber(ctxItem.porcent_toleranc_qtd);
                        valToleranc = consumaReserva * (toleranciaPorcent / 100);
                        consumaDocumento = strToNumber(qtdItemDoc);
                        unidMedItemDoc = await getUnidMed(usrid, assid, unidMedItemDoc);
                        unidMedItemPed = await getUnidMed(usrid, assid, unidMedItemPed);
                    }
                }
            } else if (tipConsumo == 'Valor Total') {
                let campoNumPed = camposErp.campo_numero_pedido;
                let valDoc = regra.campo_documento;
                let valPed = camposErp.campo_valor_total;
                let fnNumDoc = new Function('pedido', 'return ' + campoNumPed);
                let fnValTotDoc = new Function('documento', 'return ' + valDoc);
                let fnValTotPed = new Function('pedido', 'return ' + valPed);
                valTotDoc = fnValTotDoc.call(null, itemDocPed[0].itemDoc);
                valTotPed = fnValTotPed.call(null, itemDocPed[0].itemPed);
                numDoc = fnNumDoc.call(null, itemDocPed[0].itemPed);
                let pedControleReserva = getPedControleReserva(pedido.id_controle_reserva, assid, usrid);
            }
            let respApi = await consumirApi(assid, usrid, fedid, pedido, documento, regra, itemDocPed);
            let consumirOK = false;
            if (tipConsumo == 'Quantidade') {
                if (
                    unidMedItemDoc != null &&
                    unidMedItemPed != null &&
                    (unidMedItemPed.unidMedValBusc === unidMedItemDoc.unidMedValBusc || respApi[0].respApi != null)
                ) {
                    consumirOK = true;
                }
            } else if (tipConsumo == 'Valor Total') {
            }
            if (consumirOK) {
                if (consumaDocumento != null) {
                    try {
                        if (respApi[0].respApi != null) {
                            let fnValconvercao = new Function('respApi', 'return ' + campo_retorno_api);
                            if (respApi[0].respApi != null) {
                                //let x = campo_retorno_api.replace('respApi.', '');
                                //let primeiroCampRespApi = x.substring(x.indexOf('['), -1);
                                let primeiroCampRespApi = getFirstField(campo_retorno_api);
                                if (respApi[0].respApi[primeiroCampRespApi].length > 0) {
                                    let valCovercao = fnValconvercao.call(null, respApi[0].respApi);
                                    if (valCovercao > 1) {
                                        let x = consumaDocumento / valCovercao;
                                        consumaDocumento = x;
                                    }
                                } else {
                                    resultlog.resultado_validacao = 'inconsistente';
                                    resultlog.resultado_validacao_desc = 'Inconsistente';
                                    resultlog.msg_interno = 'API Não reconheceu consulta, retorno vazio.';
                                }
                            }
                        }
                        let resultDescReserva = consumaReserva - consumaDocumento;
                        if (resultDescReserva >= 0 || resultDescReserva * -1 <= valToleranc) {
                            resultlog.resultado_validacao = 'consistente';
                            resultlog.resultado_validacao_desc = 'Consistente';
                            novaQtd_posConsumir = resultDescReserva;
                        } else if (resultDescReserva < 0) {
                            if (resultDescReserva * -1 > valToleranc) {
                                resultlog.resultado_validacao = 'inconsistente';
                                resultlog.resultado_validacao_desc = 'Inconsistente';
                                resultlog.msg_erro = regra.msg_erro;
                                resultlog.severidade = regra.severidade;
                                resultlog.severidade_desc = regra.severidade_desc;
                            } else {
                                resultlog.resultado_validacao = 'consistente';
                                resultlog.resultado_validacao_desc = 'Consistente';
                                novaQtd_posConsumir = resultDescReserva;
                            }
                        }
                    } catch {
                        resultlog.resultado_validacao = 'inconsistente';
                        resultlog.resultado_validacao_desc = 'Inconsistente';
                        resultlog.msg_interno = 'ERRO AO CONSUMIR API';
                    }
                } else {
                    resultlog.resultado_validacao = 'inconsistente';
                    resultlog.resultado_validacao_desc = 'Inconsistente';
                }
                if (novaQtd_posConsumir != null && resultlog.resultado_validacao == 'consistente') {
                    updateItem(assid, usrid, tipConsumo, idItemConsumir, fdtIdItemConsumir, novaQtd_posConsumir);
                    await criarLogConsumo(assid, usrid, idItemConsumir, numDoc, dtAtual, tipConsumo, consumaDocumento, documento);
                }
            } else {
                resultlog.resultado_validacao = 'inconsistente';
                resultlog.resultado_validacao_desc = 'Inconsistente';
                //resultlog.msg_erro = "As unidades de medidas não coincidem.";
                resultlog.severidade = regra.severidade;
                resultlog.severidade_desc = regra.severidade_desc;
            }
        }
    } else if (lstError != null && lstError.length > 0) {
        resultlog.resultado_validacao = 'inconsistente';
        resultlog.resultado_validacao_desc = 'Inconsistente';
        resultlog.severidade = regra.severidade;
        resultlog.severidade_desc = regra.severidade_desc;
        let erroMsgFormat = criarLogErroCodItem(lstError);
        resultlog.msg_erro = regra.msg_erro + '\n ' + erroMsgFormat;
    }
}

async function converParmsBuscApi(regra, pedido, documento, itensDoc, assid, usrid) {
    let strParams = regra.script;
    let paramsVals = regra.parametros_chamada_api;
    let tipoValid = regra.LVC_validacao;
    let lstUrl = [];
    let rgex = /\n/gi;
    let params_chamada_api = strParams.replace(rgex, '');
    params_chamada_api = JSON.parse(params_chamada_api);
    let params_url_array = convertStrParamsInArr(paramsVals);
    if (params_chamada_api != null && params_url_array != null) {
        for (let z = 0; z < itensDoc.length; z++) {
            let concatUrl = '';
            let url = params_chamada_api.url + '?';
            let cancelarBuscaApi = false;
            let keyUrl = '';
            for (let i = 0; i < params_url_array.length; i++) {
                if (params_url_array[i] !== null && params_url_array[i] != '') {
                    let resp = params_url_array[i];
                    if (i % 2 == 0) {
                        concatUrl = concatUrl + resp + '=';
                    } else if (i % 2 == 1) {
                        if (resp[0].indexOf('pedido') == 0) {
                            let valFormat = false;
                            if (resp[0].indexOf('toLowerCase()') > 0) {
                                valFormat = 'lower';
                                resp[0] = resp[0].replace('.toLowerCase()', '');
                            } else if (resp[0].indexOf('.toUpperCase()') > 0) {
                                valFormat = 'upper';
                                resp[0] = resp[0].replace('.toUpperCase()', '');
                            }
                            let campoValPed = getLastField(resp[0]);
                            campoValPed = 'x.' + campoValPed;
                            let fnPedido = new Function('x', 'return ' + campoValPed);
                            let paramVal = '';
                            if (tipoValid != 'Preço Unitário') {
                                paramVal = fnPedido.call(null, itensDoc[z].itemPed);
                            }
                            if (tipoValid == 'Moeda' || tipoValid == 'Preço Unitário' || tipoValid == 'Valor Total') {
                                if (tipoValid == 'Preço Unitário') {
                                    paramVal = fnPedido.call(null, pedido);
                                }
                                cancelarBuscaApi = paramVal == keyUrl;
                            }
                            keyUrl = keyUrl + paramVal;
                            if (regra.LVC_validacao == 'Unidade de Medida' || regra.LVC_validacao == 'Quantidade') {
                                let x = await getUnidMed(usrid, assid, paramVal);
                                if (x.unidMedValBusc && x.unidMedValBusc.length > 0) {
                                    paramVal = x.unidMedValBusc;
                                }
                            }
                            if (valFormat) {
                                if (valFormat == 'lower') {
                                    paramVal = paramVal.toLowerCase();
                                } else if (valFormat == 'upper') {
                                    paramVal = paramVal.toUpperCase();
                                }
                            }
                            concatUrl = concatUrl + paramVal + '&';
                        } else if (resp[0].indexOf('documento') == 0) {
                            let valFormat = false;
                            if (resp[0].indexOf('.toLowerCase()') > 0) {
                                valFormat = 'lower';
                                resp[0] = resp[0].replace('.toLowerCase()', '');
                            } else if (resp[0].indexOf('.toUpperCase()') > 0) {
                                valFormat = 'upper';
                                resp[0] = resp[0].replace('.toUpperCase()', '');
                            }
                            let campoValdoc = getLastField(resp[0]);
                            campoValdoc = 'x.' + campoValdoc;
                            let fnDoc = new Function('x', 'return ' + campoValdoc);
                            let paramVal = '';
                            if (tipoValid != 'Preço Unitário') {
                                paramVal = fnDoc.call(null, itensDoc[z].itemDoc);
                            }
                            if (tipoValid == 'Moeda' || tipoValid == 'Preço Unitário' || tipoValid == 'Valor Total') {
                                cancelarBuscaApi = paramVal == keyUrl;
                                if (tipoValid == 'Preço Unitário') {
                                    paramVal = fnDoc.call(null, documento);
                                }
                                cancelarBuscaApi = paramVal == keyUrl;
                            }
                            keyUrl = keyUrl + paramVal;
                            if (regra.LVC_validacao == 'Unidade de Medida' || regra.LVC_validacao == 'Quantidade') {
                                let x = await getUnidMed(usrid, assid, paramVal);
                                if (x.unidMedValBusc && x.unidMedValBusc.length > 0) {
                                    paramVal = x.unidMedValBusc;
                                }
                            }
                            if (valFormat) {
                                if (valFormat == 'lower') {
                                    paramVal = paramVal.toLowerCase();
                                } else if (valFormat == 'upper') {
                                    paramVal = paramVal.toUpperCase();
                                }
                            }
                            concatUrl = concatUrl + paramVal + '&';
                        } else {
                            if (tipoValid == 'Moeda' || tipoValid == 'Preço Unitário' || tipoValid == 'Valor Total') {
                                cancelarBuscaApi = resp == keyUrl;
                            }
                            keyUrl = keyUrl + resp;
                            concatUrl = concatUrl + resp + '&';
                        }
                    }
                }
            }
            let newUrl = url + concatUrl;
            let x = newUrl.charAt(newUrl.length - 1);
            if (x == '&') {
                newUrl = newUrl.substring(0, newUrl.length - 1);
            }
            if (lstUrl.filter((x) => x.url === newUrl).length == 0) {
                lstUrl.push({
                    url: newUrl,
                    keyUrl: keyUrl,
                    cancelarBuscaApi: cancelarBuscaApi,
                });
            }
        }
    }
    return lstUrl;
}

function convertCompararValores(tipoValid, itemDocPedAtual, itensControleReserva, campoPrecDoc, campoPrecOc, camposErp) {
    let itemDocCtx = itemDocPedAtual.itemDoc;
    let itemPedCtx = itemDocPedAtual.itemPed;
    if (tipoValid == 'Preço Unitário') {
        let campoLinhaItem = getLastField(camposErp.campo_linha_item);
        let linhaItemPed = itemDocPedAtual.itemPed[campoLinhaItem];
        let precoItemDoc = formatNumericValue(itemDocCtx[campoPrecDoc]);
        let precoItemOc = formatNumericValue(itemPedCtx[campoPrecOc]);
        let itemControleReserva = itensControleReserva.filter((x) => x.UrlJsonContext.linha_item == linhaItemPed);
        if (itemControleReserva != null && itemControleReserva.length > 0) {
            if (itemDocPedAtual.valConvert != null && itemDocPedAtual.valConvert != undefined) {
                let x = precoItemDoc / itemDocPedAtual.valConvert;
                precoItemDoc = x;
            }
            let tolerancia_porcent = itemControleReserva[0].UrlJsonContext.porcent_toleranc_preco;
            let precoTolerancia = precoItemOc * (tolerancia_porcent / 100);
            let difPrecoItens = precoItemDoc - precoItemOc;
            if (precoTolerancia < 0) {
                precoTolerancia = precoTolerancia * -1;
            }
            let resp = difPrecoItens <= precoTolerancia;
            return resp;
        }
    } else if (tipoValid == 'Valor Total') {
        let valTotDoc = formatNumericValue(itemDocCtx[campoPrecDoc]);
        let valTotPed = formatNumericValue(itemPedCtx[campoPrecOc]);
        let resp = valTotDoc == valTotPed;
        return resp;
    }
}

async function converter(regra, documento, pedido, resultlog, assid, usrid, fedid, itemDocPed, itensControleReserva, camposErp, lstError) {
    if (regra.local_consulta == 'api') {
        let campoRetornoApi = regra.campo_retorno_api;
        let paramsVals = regra.parametros_chamada_api;
        let params_url_array = convertStrParamsInArr(paramsVals);
        if (params_url_array != null) {
            let campoDoc = null;
            let campoOc = null;
            let campoConvertDoc = null;
            let campoConvertPed = null;
            if (regra.LVC_validacao == 'Moeda') {
                //let fnGetCampoDoc = new Function('documento', "return " + regra.campo_documento);
                let fnGetCampoOc = new Function('pedido', 'return ' + regra.campo_pedido);
                campoConvertDoc = 'BRL';
                campoConvertPed = fnGetCampoOc.call(null, itemDocPed[0].itemPed);
            } else {
                campoDoc = getLastField(regra.campo_documento);
                campoOc = getLastField(regra.campo_pedido);
            }
            let campoResultApi = campoRetornoApi.substring(0, campoRetornoApi.indexOf('['));
            let fnGetArray = new Function('respApi', 'return ' + campoRetornoApi);
            let primeiroCampRespApi = getFirstField(campoRetornoApi);
            let respApi = await consumirApi(assid, usrid, fedid, pedido, documento, regra, itemDocPed);
            if (respApi != null && itemDocPed != null && itemDocPed.length > 0) {
                for (let item in itemDocPed) {
                    let key = null;
                    if (regra.LVC_validacao == 'Preço Unitário' || regra.LVC_validacao == 'Valor Total') {
                        key = creatKeyValid(documento, pedido, params_url_array);
                    }
                    if (key == null) {
                        let deParaCtxAtual = itemDocPed[item];
                        if (campoConvertDoc == null) {
                            campoConvertDoc = deParaCtxAtual.itemDoc[campoDoc];
                        }
                        if (campoConvertPed == null) {
                            campoConvertPed = deParaCtxAtual.itemPed[campoOc];
                        }
                        key = campoConvertDoc + campoConvertPed;
                    }
                    //let buscRespApi = respApi.filter(x => x.keyUrl == key);
                    let buscRespApi = respApi.filter(function (x) {
                        let keyFormat = key.split('').reverse().join('');
                        if (regra.LVC_validacao == 'Moeda' || regra.LVC_validacao == 'Preço Unitário' || regra.LVC_validacao == 'Valor Total') {
                            return x.keyUrl == key || keyFormat;
                        } else {
                            return x.keyUrl == key;
                        }
                    });
                    try {
                        if (buscRespApi != null && buscRespApi.length > 0 && !buscRespApi[0].consultaDesdenessaria) {
                            let ctxRespApi = buscRespApi[0].respApi;
                            //ctxRespApi = ctxRespApi[primeiroCampRespApi];
                            if (ctxRespApi != null) {
                                let valConvertion = fnGetArray.call(null, ctxRespApi);
                                itemDocPed[item].valConvert = valConvertion;
                                resultlog.resultado_validacao = 'consistente';
                                resultlog.resultado_validacao_desc = 'Consistente';
                                if (regra.LVC_validacao == 'Preço Unitário' || regra.LVC_validacao == 'Valor Total') {
                                    let validItemOk = convertCompararValores(
                                        regra.LVC_validacao,
                                        itemDocPed[item],
                                        itensControleReserva,
                                        campoDoc,
                                        campoOc,
                                        camposErp
                                    );
                                    if (validItemOk) {
                                        resultlog.resultado_validacao = 'consistente';
                                        resultlog.resultado_validacao_desc = 'Consistente';
                                    } else {
                                        resultlog.resultado_validacao = 'inconsistente';
                                        resultlog.resultado_validacao_desc = 'Inconsistente';
                                        resultlog.severidade = regra.severidade;
                                        resultlog.severidade_desc = regra.severidade_desc;
                                        resultlog.msg_erro = regra.msg_erro;
                                        resultlog.msg_interno = 'DATA NOT FOUND';
                                    }
                                }
                            } else {
                                resultlog.resultado_validacao = 'inconsistente';
                                resultlog.resultado_validacao_desc = 'Inconsistente';
                                resultlog.msg_interno = 'API Não reconheceu consulta, retorno vazio.';
                            }
                        } else if (buscRespApi != null && buscRespApi.length > 0 && buscRespApi[0].consultaDesdenessaria) {
                            resultlog.resultado_validacao = 'consistente';
                            resultlog.resultado_validacao_desc = 'Consistente';
                            if (regra.LVC_validacao == 'Preço Unitário' || regra.LVC_validacao == 'Valor Total') {
                                let validItemOk = convertCompararValores(
                                    regra.LVC_validacao,
                                    itemDocPed[item],
                                    itensControleReserva,
                                    campoDoc,
                                    campoOc,
                                    camposErp
                                );
                                if (validItemOk) {
                                    resultlog.resultado_validacao = 'consistente';
                                    resultlog.resultado_validacao_desc = 'Consistente';
                                } else {
                                    resultlog.resultado_validacao = 'inconsistente';
                                    resultlog.resultado_validacao_desc = 'Inconsistente';
                                    resultlog.severidade = regra.severidade;
                                    resultlog.severidade_desc = regra.severidade_desc;
                                    resultlog.msg_erro = regra.msg_erro;
                                    resultlog.msg_interno = 'DATA NOT FOUND';
                                }
                            }
                        } else {
                            resultlog.resultado_validacao = 'inconsistente';
                            resultlog.resultado_validacao_desc = 'Inconsistente';
                            resultlog.severidade = regra.severidade;
                            resultlog.severidade_desc = regra.severidade_desc;
                            resultlog.msg_erro = regra.msg_erro;
                            resultlog.msg_interno = 'DATA NOT FOUND';
                            resultlog.msg_erro = 'Não foi encontrado nenhuma relação ' + campoConvertDoc + 'X' + campoConvertPed + ' na API de consulta.';
                            break;
                        }
                    } catch {
                        resultlog.resultado_validacao = 'inconsistente';
                        resultlog.resultado_validacao_desc = 'Inconsistente';
                        resultlog.severidade = regra.severidade;
                        resultlog.severidade_desc = regra.severidade_desc;
                        resultlog.msg_erro = regra.msg_erro;
                        resultlog.msg_interno = 'ERRO AO CONSUMIR API';
                        return;
                    }
                }
                if (lstError != null && lstError.length > 0) {
                    resultlog.resultado_validacao = 'inconsistente';
                    resultlog.resultado_validacao_desc = 'Inconsistente';
                    resultlog.severidade = regra.severidade;
                    resultlog.severidade_desc = regra.severidade_desc;
                    let erroMsgFormat = criarLogErroCodItem(lstError);
                    resultlog.msg_erro = regra.msg_erro + '\n ' + erroMsgFormat;
                }
            } else {
                resultlog.resultado_validacao = 'inconsistente';
                resultlog.resultado_validacao_desc = 'Inconsistente';
                resultlog.severidade = regra.severidade;
                resultlog.severidade_desc = regra.severidade_desc;
                resultlog.msg_erro = regra.msg_erro;
                resultlog.msg_interno = 'DATA NOT FOUND';
                resultlog.msg_erro = 'Erro ao consumir API';
                if (lstError != null && lstError.length > 0) {
                    resultlog.resultado_validacao = 'inconsistente';
                    resultlog.resultado_validacao_desc = 'Inconsistente';
                    resultlog.severidade = regra.severidade;
                    resultlog.severidade_desc = regra.severidade_desc;
                    let erroMsgFormat = criarLogErroCodItem(lstError);
                    resultlog.msg_erro = regra.msg_erro + '\n ' + erroMsgFormat;
                }
            }
        }
    } else {
        if (regra.campo_documento.indexOf('[args.x]') != -1) {
            //let arrayfield = regra.campo_documento.substring(0, regra.campo_documento.indexOf('['))
            //let fnGetArray = new Function('documento', "return " + arrayfield);
            // ArrayItens = fnGetArray.call(null, documento);
            //let fnDoc = new Function('documento', 'args', "return " + regra.campo_documento);
            //let fnPedido = new Function('pedido', 'args', "return " + regra.campo_pedido);
            let fnRecordResult = new Function('record', 'args', 'return ' + regra.campo_retorno);
            let campoPed = getLastField(camposErp.campo_codigo_produto);
            let campoDoc = null;
            if (regra.LVC_validacao == 'Código do Produto') {
                campoDoc = getLastField(regra.campo_documento);
            } else {
                campoDoc = getLastField(regra.campo_codigo_item);
            }
            for (let x in itemDocPed) {
                let argsdata = {
                    x: x,
                };
                //data_document = fnDoc.call(null, documento, argsdata);
                //data_pedido = fnPedido.call(null, pedido, argsdata);
                let ctxItemDocPed = itemDocPed[x];
                data_pedido = ctxItemDocPed.itemPed[campoPed];
                data_document = ctxItemDocPed.itemDoc[campoDoc];
                // data_document = fnDoc.call(null, documento, argsdata);
                //data_pedido = fnPedido.call(null, pedido, argsdata);
                let tabela_onergy_template = regra.tabela_conversao;
                let argsFilter = {
                    documento: documento,
                    data_document: data_document,
                    data_pedido: data_pedido,
                };
                let fnFilter = new Function('args', 'return [' + regra.filter + ']');
                let filterResult = fnFilter.call(null, argsFilter);
                let record = getOnergyItem(tabela_onergy_template, assid, usrid, JSON.stringify(filterResult));
                if (record.length != 0) {
                    let recordFound = record[0].UrlJsonContext;
                    let resultData = fnRecordResult.call(null, recordFound, argsFilter);
                    if (resultData == data_pedido) {
                        resultlog.resultado_validacao = 'consistente';
                        resultlog.resultado_validacao_desc = 'Consistente';
                    } else {
                        resultlog.resultado_validacao = 'inconsistente';
                        resultlog.resultado_validacao_desc = 'Inconsistente';
                        resultlog.severidade = regra.severidade;
                        resultlog.severidade_desc = regra.severidade_desc;
                        resultlog.msg_erro = regra.msg_erro;
                        resultlog.msg_interno = resultData + ':' + data_pedido;
                    }
                } else {
                    resultlog.resultado_validacao = 'inconsistente';
                    resultlog.resultado_validacao_desc = 'Inconsistente';
                    resultlog.severidade = regra.severidade;
                    resultlog.severidade_desc = regra.severidade_desc;
                    resultlog.msg_erro = regra.msg_erro;
                    resultlog.msg_interno = 'DATA NOT FOUND';
                }
            }
            if (lstError != null && lstError.length > 0) {
                resultlog.resultado_validacao = 'inconsistente';
                resultlog.resultado_validacao_desc = 'Inconsistente';
                resultlog.severidade = regra.severidade;
                resultlog.severidade_desc = regra.severidade_desc;
                let erroMsgFormat = criarLogErroCodItem(lstError);
                resultlog.msg_erro = regra.msg_erro + '\n ' + erroMsgFormat;
            }
        }
    }
}

function convertStrParamsInArr(strParams) {
    try {
        let rgex = /\n/gi;
        let params_url = strParams.replace(rgex, '');
        params_url = JSON.parse(params_url);
        let params_url_array = Object.keys(params_url).map(function (key) {
            return [params_url[key]];
        });
        return params_url_array;
    } catch {
        return null;
    }
}

function creatKeyValid(documento, pedido, arrayParamsUrl) {
    let keyFinal = '';
    for (let l in arrayParamsUrl) {
        let key = '';
        if (l % 2 == 1) {
            let caminhoParam = arrayParamsUrl[l];
            if (caminhoParam[0].indexOf('pedido') == 0) {
                let fnGetCampoOc = new Function('pedido', 'return ' + caminhoParam[0]);
                key = fnGetCampoOc.call(null, pedido);
                keyFinal = keyFinal + key;
            } else if (caminhoParam[0].indexOf('documento') == 0) {
                let fnGetCampoDoc = new Function('documento', 'return ' + caminhoParam[0]);
                key = fnGetCampoOc.call(null, documento);
                keyFinal = keyFinal + key;
            } else {
                key = caminhoParam[0];
                keyFinal = keyFinal + key;
            }
        }
    }
    return keyFinal;
}

async function criarLogConsumo(assid, usrid, ID_ONE_REF, numDoc, dtMoviment, tipoMoviment, qtd_val_moviment, documento) {
    let objMoviment = {
        numero_documento_movimentacao: documento.numeroNf,
        idDocumento_refConsumacao: documento.fedid,
        tipo_movimentacao: 'debito',
        tipo_movimentacao_desc: 'Dédito',
        quantidade_movimentacao: 0,
        //valor_movimentacao: 0,
        data_movimentacao: dtMoviment,
        ID_ONE_REF: ID_ONE_REF,
    };
    if (tipoMoviment == 'Quantidade') {
        objMoviment.quantidade_movimentacao = qtd_val_moviment;
    } else if (tipoMoviment != 'Quantidade') {
    }
    let x = await sendItemToOnergy(fdtMovimentacaoItensControleReservaPedido, usrid, assid, objMoviment);
}

function criarLogErroCodItem(arrayLstErro) {
    let msg = 'Itens com erro(s): \n ';
    let erros = '';
    for (let er in arrayLstErro) {
        let cod = arrayLstErro[er].codItemDoc_erro;
        let mot = arrayLstErro[er].tipoErro;
        switch (mot) {
            case 'nItemPed erro':
                erros = erros + 'Erro no nItemPed do item : ' + cod + '; \n';
                break;
            case 'item pedido':
                erros = erros + 'Item não encontrado no pedido : ' + cod + '; \n';
                break;
            case 'de-para item':
                erros = erros + 'Item não encontrado no de-para codigo item ERP X Fornecedor : ' + cod + '; \n';
                break;
            case 'de-para cnpj vazio':
                erros = erros + 'Item não encontrado no de-para codigo item ERP X Fornecedor : ' + cod + '; \n';
                break;
        }
    }
    msg = msg + erros;
    return msg;
}

function formatNumericValue(val) {
    try {
        if (val == undefined || val == null) {
            return 0;
        } else {
            return parseFloat(val.toString());
        }
    } catch {
        return 0;
    }
}

async function getCamposErp(key, assid, usrid) {
    const strFiltro = JSON.stringify([{ FielName: 'erp_type', Type: 'string', FixedType: 'string', Value1: key }]);
    const campos = await getOnergyItem(fdtListaERP, assid, usrid, strFiltro);
    if (campos != null && campos.length > 0) {
        return campos[0].UrlJsonContext;
    }
    return null;
}

function getFirstField(x) {
    if (x == 'null') {
        return null;
    }
    let z = x.split('.');
    let y = z[1].substring(z[1].indexOf('['), -1);
    return y;
}

async function getItensControleReserva(pedido, assid, usrid) {
    const strFiltro = JSON.stringify([{ FielName: 'ID_ONE_REF', Type: 'string', FixedType: 'string', Value1: pedido.id_controle_reserva }]);
    const itensControleReserva = await getOnergyItem(fdtItensControleReservaPedido, assid, usrid, strFiltro);
    if (itensControleReserva != null && itensControleReserva.length > 0) {
        return itensControleReserva;
    }
    return null;
}

function getLastField(x) {
    if (x == 'null') {
        return null;
    }
    let z = x.split('').reverse().join('');
    let y = z.substring(0, z.indexOf('.'));
    return y.split('').reverse().join('');
}

function getPedControleReserva(key, assid, usrid) {
    let filtro = JSON.stringify([{ FielName: '_id', Type: 'string', FixedType: 'string', Value1: key }]);
    let dado = getOnergyItem(fdtControleReservaPedido, assid, usrid, filtro);
    let rec = dado[0].UrlJsonContext;
    return rec;
}

async function getTipoValidComercial(idConfigValid, assid, usrid) {
    const strFiltro = JSON.stringify([{ FielName: 'ID_ONE_REF', Type: 'string', FixedType: 'string', Value1: idConfigValid }]);
    const strTipoValid = await getOnergyItem(fdtRegrasValidacoes, assid, usrid, strFiltro);
    const itemTipValid = strTipoValid;
    const arrayRespValid = [];
    if (itemTipValid != null && itemTipValid.length > 0) {
        for (let tipValid in itemTipValid) {
            let ctx = itemTipValid[tipValid].UrlJsonContext;
            arrayRespValid.push(ctx);
        }
    }
    return arrayRespValid;
}

async function getUnidMed(usrid, assid, unidMed) {
    const resp = {};
    const strFiltro = JSON.stringify([{ FielName: 'sig', Type: 'string', FixedType: 'string', Value1: unidMed }]);
    const siglaUnidMed = await getOnergyItem(fdtGridUMSiglas, assid, usrid, strFiltro);
    if (siglaUnidMed.length > 0) {
        const unidMedRef_pai = siglaUnidMed[0].UrlJsonContext.ID_ONE_REF;
        const strFiltro = JSON.stringify([{ FielName: '_id', Type: 'string', FixedType: 'string', Value1: unidMedRef_pai }]);
        const siglaUnidMed = await getOnergyItem(fdtUnidadeMedida, assid, usrid, strFiltro);
        if (siglaUnidMed.length > 0) {
            resp.unidMedId = unidMedRef_pai;
            resp.unidMedDesc = siglaUnidMed[0].UrlJsonContext.unid_medida;
            resp.unidMedValBusc = siglaUnidMed[0].UrlJsonContext.val_busc_unid_med;
        } else {
            resp.error = true;
            resp.msg_error = 'Não foi possível encontra a unidade de medida "' + unidMed + '" no cadastro de unidade de medidas';
        }
    } else {
        resp.error = true;
        resp.msg_error = 'Não foi possível encontra a unidade de medida "' + unidMed + '" no cadastro de unidade de medidas';
    }
    return resp;
}

async function initSendMailValidation(docId, docFdtId, data) {
    let ctx = {
        ERP_erp_type: data.ERP_erp_type,
        id_doc_inbox: docId,
        fdtid_doc_inbox: docFdtId,
    };
    return await sendItemToOnergy(fdtEnvioEmailValidacaoComercialFiscal, data.usrid, data.assid, ctx, undefined, true);
}

function strToNumber(x) {
    try {
        if (typeof x != 'number') {
            return parseInt(x);
        } else if (typeof x == 'number') {
            return x;
        }
    } catch {
        return null;
    }
}

function tratDeParaItensIntegra(pedido, deParaItens, camposErp) {
    try {
        let objTrat = {};
        let caminhoCampoNumPed = camposErp.campo_numero_pedido.trim();
        let fnNumPed = new Function('pedido', 'return ' + caminhoCampoNumPed);
        let numPed = fnNumPed.call(null, pedido);
        objTrat.numPed = numPed;
        let itensDocPedTrat = [];
        for (let ule in deParaItens) {
            let objResp = {};
            let ctxItemDoc = deParaItens[ule].itemDoc;
            let ctxItemPed = deParaItens[ule].itemPed;
            objResp.itemDoc = ctxItemDoc;
            let caminhoCampoFinalidade = camposErp.campo_finalidade.trim();
            let caminhoCampoUnidMed = camposErp.campo_unidade_medida.trim();
            let caminhoCampoCod = camposErp.campo_codigo_produto.trim();
            caminhoCampoFinalidade = getLastField(caminhoCampoFinalidade);
            caminhoCampoUnidMed = getLastField(caminhoCampoUnidMed);
            caminhoCampoCod = getLastField(caminhoCampoCod);
            let numFinalid = ctxItemPed[caminhoCampoFinalidade];
            let unidMedOc = ctxItemPed[caminhoCampoUnidMed];
            let CodItemOc = ctxItemPed[caminhoCampoCod];
            let objItemPedTrat = {
                numFinalid: numFinalid,
                unidMedOc: unidMedOc,
                CodItemOc: CodItemOc,
            };
            objResp.itemPed = objItemPedTrat;
            itensDocPedTrat.push(objResp);
        }
        objTrat.itensTrat = itensDocPedTrat;
        return objTrat;
    } catch {
        return null;
    }
}

function updateItem(assid, usrid, tipConsumo, idItemConsumir, fdtIdItemConsumir, novaQtd_posConsumir) {
    let postInfo = null;
    if (tipConsumo === 'Quantidade') {
        postInfo = {
            UrlJsonContext: {
                quantidade_produto_atual: novaQtd_posConsumir,
            },
        };
    }
    if (postInfo != null) {
        onergy_updatemany({
            fdtid: fdtIdItemConsumir,
            assid: assid,
            usrid: usrid,
            data: JSON.stringify(postInfo),
            filter: JSON.stringify([{ FielName: '_id', Type: 'string', FixedType: 'string', Value1: idItemConsumir }]),
            isMultiUpdate: false,
        });
    }
}

//TODO verificar função e eliminar tudo o que chama pedido
// 214 linhas, 5 camadas de indentação
async function validacaoComercial(
    /*lstValid,*/ documento,
    /*pedido, itensControleReserva,*/ camposErp,
    ID_ONE_REF,
    assid,
    usrid,
    fedid,
    /*po,*/ id_template_inbox
) {
    const arrayRespValid = [];
    const dtAtual = get_usr_tmz_dt_now({
        assid: documento.assid,
        usrid: documento.usrid,
    });
    const postInfo = {
        UrlJsonContext: {
            status: 'Executando Validações',
            status_desc: 'Executando Validações',
        },
    };
    onergy_updatemany({
        fdtid: id_template_inbox,
        assid: assid,
        usrid: usrid,
        data: JSON.stringify(postInfo),
        filter: JSON.stringify([{ FielName: '_id', Type: 'string', FixedType: 'string', Value1: idDocumento }]),
        isMultiUpdate: false,
    });
    //!for (let tipValid in lstValid) {
    //!let ctx_valid = lstValid[tipValid];
    //!let tipValidNome = ctx_valid.tipo_validacao;
    //!let objAtual = {
        //!LVC_validacao: ctx_valid.LVC_validacao,
        //!LVC_id: ctx_valid.LVC_id,
        //!data_validacao: dtAtual,
        //!ID_ONE_REF: ID_ONE_REF,
        //!ped_ref: po,
        //!numero_po_oc: po,
    //!};
    //!const filterSearchDuplicate = JSON.stringify([
        //!{ FielName: 'numero_po_oc', Type: 'string', FixedType: 'string', Value1: po },
        //!{ FielName: 'ID_ONE_REF', Type: 'string', FixedType: 'string', Value1: documento.fedid },
    //!]);
    const strBuscDuplicate = await getOnergyItem(fdtValidacaoComercial, assid, usrid, filterSearchDuplicate);
    if (strBuscDuplicate != null && strBuscDuplicate.length > 0) {
        for (let duplicate in strBuscDuplicate) {
            let postInfoDelet = {
                UrlJsonContext: {
                    id_user_resp_delet: documento.usrid,
                },
                BlockCount: 1,
            };
            onergy_updatemany({
                fdtid: fdtValidacaoComercial,
                assid: documento.assid,
                usrid: documento.usrid,
                data: JSON.stringify(postInfoDelet),
                id: strBuscDuplicate[duplicate].ID,
                isMultiUpdate: true,
            });
        }
    }
    let itemDocPed = null;
    let validNome = objAtual.LVC_validacao;
    if (
        (tipValidNome == 'converter' || tipValidNome == 'comparar' || tipValidNome == 'consumir') &&
        (validNome == 'Unidade de Medida' || validNome == 'Quantidade' || validNome == 'Preço Unitário' || validNome == 'Código do Produto')
    ) {
        let linha_item_doc = ctx_valid.campo_documento;
        if (
            validNome == 'Quantidade' &&
            tipValidNome == 'consumir' &&
            (linha_item_doc == null || linha_item_doc == undefined || linha_item_doc.trim().length == 0)
        ) {
            linha_item_doc = ctx_valid.campo_item_documento;
        }
        itemDocPed = await validDeParaItemDocPed(linha_item_doc, documento, pedido, camposErp.campo_linha_item, ctx_valid, assid, usrid, camposErp);
        if (arrayRetornoItensDePara != null && arrayRetornoItensDePara.length > 0 && relacaoItens == null) {
            relacaoItens = tratDeParaItensIntegra(pedido, arrayRetornoItensDePara, camposErp);
            if (relacaoItens != null) {
                let postInfo = {
                    addObjectToArray: JSON.stringify({ itensPosValidacao: [relacaoItens] }),
                };
                onergy_updatemany({
                    fdtid: fdtInboxGlobal,
                    assid: assid,
                    usrid: usrid,
                    data: JSON.stringify(postInfo),
                    filter: JSON.stringify([{ FielName: '_id', Type: 'string', FixedType: 'string', Value1: idDocumento }]),
                    isMultiUpdate: false,
                });
            }
        }
    }
    if (validNome == 'Moeda' || validNome == 'Valor Total') {
        itemDocPed = {
            arrayRetorno: [
                {
                    itemPed: pedido,
                    itemDoc: documento,
                },
            ],
            lstError: [],
        };
    }
    // else if (validNome == 'Preço Unitário') {
    //   itemDocPed = itemDocPed.concat({
    //     origem: {
    //       pedidoOriginal: pedido,
    //       documentoOriginal: documento
    //     }
    //   })
    // }
    else if (validNome == 'CNPJ Origem' || (validNome == 'CNPJ Destino' && documento.tipo == 'NFSE')) {
        try {
            let caminhoCampoNumPed = camposErp.campo_numero_pedido.trim();
            let caminhoCampoMoeda = camposErp.campo_moeda.trim();
            let caminhoCampoFinalidade = camposErp.campo_finalidade.trim();
            let caminhoCampoUnidMed = camposErp.campo_unidade_medida.trim();
            let caminhoCampoQtd = camposErp.campo_quantidade.trim();
            let caminhoCampoUnidPre = camposErp.campo_preco_unitario.trim();
            let caminhoCampoLinhaItem = camposErp.campo_linha_item.trim();
            let fnNumPed = new Function('pedido', 'return ' + caminhoCampoNumPed);
            let fnMoeda = new Function('pedido', 'return ' + caminhoCampoMoeda);
            let args = {
                x: 0,
            };
            let fnFinalid = new Function('pedido', 'args', 'return ' + caminhoCampoFinalidade);
            let fnUnidMed = new Function('pedido', 'args', 'return ' + caminhoCampoUnidMed);
            let fnQuantidade = new Function('pedido', 'args', 'return ' + caminhoCampoQtd);
            let fnPrecoUnid = new Function('pedido', 'args', 'return ' + caminhoCampoUnidPre);
            let fnLinhaItem = new Function('pedido', 'args', 'return ' + caminhoCampoLinhaItem);
            let numPed = fnNumPed.call(null, pedido);
            let moedaOc = fnMoeda.call(null, pedido);
            let numFinalid = fnFinalid.call(null, pedido, args);
            let unidMedOc = fnUnidMed.call(null, pedido, args);
            let quantidadeOc = fnQuantidade.call(null, pedido, args);
            let precoUnidOc = fnPrecoUnid.call(null, pedido, args);
            let linhaItemOc = fnLinhaItem.call(null, pedido, args);
            relacaoItens = [
                {
                    numPed: numPed,
                    itensTrat: [
                        {
                            itemPed: {
                                unidMedOc: unidMedOc,
                                numFinalid: numFinalid,
                                moedaOc: moedaOc,
                                quantidadeOc: quantidadeOc,
                                precoUnidOc: precoUnidOc,
                                linhaItemOc: linhaItemOc,
                            },
                        },
                    ],
                },
            ];
            if (relacaoItens != null) {
                let postInfo = {
                    addObjectToArray: JSON.stringify({ itensPosValidacao: relacaoItens }),
                };
                onergy_updatemany({
                    fdtid: fdtInboxGlobal,
                    assid: assid,
                    usrid: usrid,
                    data: JSON.stringify(postInfo),
                    filter: JSON.stringify([{ FielName: '_id', Type: 'string', FixedType: 'string', Value1: idDocumento }]),
                    isMultiUpdate: false,
                });
            }
        } catch {
            onergy.log('Não foi possível tratar o item da NFSE : ', documento.numeroNf);
        }
    }
    switch (tipValidNome) {
        case 'comparar':
            let respComp = compararValores(ctx_valid, documento, pedido, itemDocPed, ctx_valid.LVC_validacao);
            if (respComp) {
                objAtual.resultado_validacao = 'consistente';
                objAtual.resultado_validacao_desc = 'Consistente';
            } else {
                objAtual.resultado_validacao = 'inconsistente';
                objAtual.resultado_validacao_desc = 'Inconsistente';
                objAtual.severidade = ctx_valid.severidade;
                objAtual.severidade_desc = ctx_valid.severidade_desc;
                objAtual.msg_erro = ctx_valid.msg_erro;
            }
            break;
        case 'converter':
            await converter(
                ctx_valid,
                documento,
                pedido,
                objAtual,
                assid,
                usrid,
                fedid,
                itemDocPed.arrayRetorno,
                itensControleReserva,
                camposErp,
                itemDocPed.lstError
            );
            break;
        case 'consumir':
            await consumirQtd(
                itensControleReserva,
                documento,
                ctx_valid,
                objAtual,
                ctx_valid.LVC_validacao,
                assid,
                usrid,
                fedid,
                dtAtual,
                pedido,
                camposErp,
                itemDocPed
            );
            break;
    }
    arrayRespValid.push(objAtual);
    //!}
    return arrayRespValid;
}

async function validDeParaItemDocPed(linhaItem_doc, documento, pedido, campoLinhaItem, regra, assid, usrid, camposErp) {
    let ArrayItensDoc = null;
    let ArrayItensPedido = null;
    let arrayRetorno = [];
    let campoCodItemDoc = '';
    let campoCodItemErp = getLastField(camposErp.campo_codigo_produto);
    if (regra.LVC_validacao == 'Código do Produto') {
        campoCodItemDoc = getLastField(regra.campo_documento);
    } else {
        campoCodItemDoc = getLastField(regra.campo_codigo_item);
    }
    let lstCodErro = [];
    if (linhaItem_doc.indexOf('[args.x]') != -1) {
        let arrayfield = linhaItem_doc.substring(0, linhaItem_doc.indexOf('['));
        let fnGetArray = new Function('documento', 'return ' + arrayfield);
        ArrayItensDoc = fnGetArray.call(null, documento);
        let arrayfieldOc = campoLinhaItem.substring(0, campoLinhaItem.indexOf('['));
        fnGetArray = new Function('pedido', 'return ' + arrayfieldOc);
        ArrayItensPedido = fnGetArray.call(null, pedido);
        let campoLinhaPedidoNome = getLastField(campoLinhaItem);
    }
    if (ArrayItensDoc != null && ArrayItensDoc.length > 0) {
        let dicDadosItensCnpjEmit = [];
        for (let it in ArrayItensDoc) {
            let isError = false;
            let tipoErro = '';
            let ctxItem = ArrayItensDoc[it].prod;
            let ctxItemCompleto = ArrayItensDoc[it];
            let nItemPed = ctxItem.nItemPed;
            let codItemDoc_erro = ctxItem[campoCodItemDoc];
            if (nItemPed != null && nItemPed.length > 0) {
                nItemPed = nItemPed.replace(/^(0+)(\d)/g, '$2');
                let item = ArrayItensPedido.filter((x) => x[campoLinhaPedidoNome] == nItemPed);
                if (item.length > 0) {
                    let newObjArrayItens = ArrayItensPedido.filter((x) => x[campoLinhaPedidoNome] != nItemPed);
                    ArrayItensPedido = newObjArrayItens;
                    arrayRetorno.push({
                        itemDoc: ctxItem,
                        itemPed: item[0],
                    });
                    arrayRetornoItensDePara.push({
                        itemDoc: ctxItemCompleto,
                        itemPed: item[0],
                    });
                } else {
                    isError = true;
                    tipoErro = 'nItemPed erro';
                }
            } else {
                let campo_codigo_item = '';
                if (regra.LVC_validacao == 'Código do Produto') {
                    campo_codigo_item = getLastField(regra.campo_documento);
                } else {
                    campo_codigo_item = getLastField(regra.campo_codigo_item);
                }
                let codItemDoc = ArrayItensDoc[it].prod[campo_codigo_item];
                codItemDoc_erro = codItemDoc;
                let fnGetCnpj = new Function('documento', 'return ' + regra.campo_cnpj_origem);
                let cnpjEmit = fnGetCnpj.call(null, documento);
                if (dicDadosItensCnpjEmit.length == 0) {
                    const strFiltro = JSON.stringify([
                        { FielName: 'basis_emp_cnpj__cnpj_fornecedor', Type: 'string', FixedType: 'string', Value1: cnpjEmit },
                        // { FielName: "cod_forn", Type: "string", FixedType: "string", Value1: codItemDoc },
                    ]);
                    const strBusc = await getOnergyItem(fdtProdutos, assid, usrid, strFiltro);
                    if (strBusc != null && strBusc.length > 0) {
                        dicDadosItensCnpjEmit = strBusc;
                    }
                }
                if (dicDadosItensCnpjEmit != null && dicDadosItensCnpjEmit.length > 0) {
                    let itemDoc = dicDadosItensCnpjEmit.filter((x) => x.UrlJsonContext.cod_forn == codItemDoc);
                    if (itemDoc.length > 0) {
                        let codItemErp = itemDoc[0].UrlJsonContext.codigo;
                        let item = ArrayItensPedido.filter((x) => x[campoCodItemErp] == codItemErp);
                        if (item.length > 0) {
                            let newObjArrayItens = ArrayItensPedido.filter((x) => x[campoCodItemErp] != codItemErp);
                            ArrayItensPedido = newObjArrayItens;
                            arrayRetorno.push({
                                itemDoc: ctxItem,
                                itemPed: item[0],
                            });
                            arrayRetornoItensDePara.push({
                                itemDoc: ctxItemCompleto,
                                itemPed: item[0],
                            });
                        } else {
                            isError = true;
                            tipoErro = 'item pedido';
                        }
                    } else {
                        isError = true;
                        tipoErro = 'de-para item';
                    }
                } else {
                    isError = true;
                    tipoErro = 'de-para cnpj vazio';
                }
            }
            if (isError) {
                lstCodErro.push({
                    codItemDoc_erro: codItemDoc_erro,
                    tipoErro: tipoErro,
                });
            }
        }
    }
    return {
        arrayRetorno: arrayRetorno,
        lstError: lstCodErro,
    };
}

//TODO check variaveis fora do init
let relacaoItens = null;
let arrayRetornoItensDePara = [];
let idDocumento = null;
let dicionarioRespApi = [];

async function init(json) {
    const data = JSON.parse(json);
    //!const pedidosRel = data.pedidosid;
    const id_inbox = data.id_save_inbox;
    const id_template_inbox = data.id_template_inbox;
    //!if (data.habilitar_validacao_comercial == 'Sim' && data.existPo) {
    //!const lstRegrasValidComercial = await getTipoValidComercial(data.id_ref_validacoesComercial, data.assid, data.usrid);
    //!if (lstRegrasValidComercial != null && lstRegrasValidComercial.length > 0) {
    //!if (data.pedidosid != null && data.pedidosid.length > 0) {
    //!const pedido = await BuscarPedido(data, data.pedidosid[0]);
    const camposErp = await getCamposErp(data.ERP_erp_type, data.assid, data.usrid);
    const documento = await BuscarDocumento(data, data.id_save_inbox);
    if (/*pedido != null &&*/ documento != null) {
        //!const itensControleReserva = await getItensControleReserva(pedido, data.assid, data.usrid);
        const log = await validacaoComercial(
            //!lstRegrasValidComercial,
            documento,
            //!pedido,
            //!itensControleReserva,
            camposErp,
            id_inbox,
            data.assid,
            data.usrid,
            data.fedid,
            //!data.po,
            id_template_inbox
        );
        //?onergy.InsertManyOnergy(log, fdtHistoricoValidacaoComercial, data.usrid);
        //?onergy.InsertManyOnergy(log, fdtValidacaoComercial, data.usrid);
        if (log != null && log.length > 0) {
            await checkErrorValidation(log, data, documento);
            data.id_processo_sendMail_validacao = await initSendMailValidation(data.data_id_inbox, fdtInboxGlobal, data);
        }
    }
    //!}
    //!}
    //!}
    //?return SetObjectResponse(true, data, true);
    return true;
}
/*
function initBefore(json) {
    return true;
}

function initDelete(json) {
    //return true;
}

function SetObjectResponse(cond, json, WaitingWebHook) {
    if (WaitingWebHook === undefined) WaitingWebHook = false;
    let obj = {
        cond: cond,
        json: JSON.stringify(json),
        WaitingWebHook: WaitingWebHook,
    };
    return obj;
}
*/

//!METODOS PADRAO ===
const json = {
    chaveNfe: '07882930000165_20220523_331219__28060172891',
    cnpj: '28060172891',
    razaoSocial: 'ARMANDO CLAPIS 13.RI CNPJ:4557293/0001-46',
    numeroNf: '331219',
    dest_cnpj: '07882930000165',
    razao_social_tomador: 'MITRE REALTY EMPREENDIMENTOS E PARTICIPACOES S.A.',
    valorNFe: 63.69,
    urlpdf: 'https://taxapi.onetech.com.br/api/nfse/7a42f7a1-6705-3d21-b0b0-1b676c981856/pdf?id=628cf18fe9abde2bf420658a',
    dtEmissaoNfDate: '2022-05-23 14:12:15',
    dtEmissaoNf: '2022-05-23 11:12:15',
    dtEntradaDate: '2022-05-24 17:54:07',
    dtEntrada: '2022-05-24 14:54:07',
    tipo: 'NFSE',
    conteudo:
        'Emissão de certidão(ões) de imóvel(is) inscrito(s) no 13º Oficial de Registro de Imóveis da Capital, conforme pedido protocolado sob o número 731074.\n\n Oficial..............R$      38,17\n Estado...............R$      10,85\n IPESP................R$       7,43\n Registro Civil ......R$       2,01\n Tribunal de Justiça..R$       2,62\n Prefeitura...........R$       0,78\n Ministério Público...R$       1,83\n Total................R$      63,69\n\nDeduções da base de cálculo nos termos do disposto no art. 14-A da Lei Municipal nº 13.701, de 24/12/2003, e em conformidade com a sentença proferida pelo MM Juízo da 1ª Vara da Fazenda Pública em Mandado de Segurança de São Paulo, Processo nº 053.09.16575-9.',
    urlxml: 'https://taxfystorage.blob.core.windows.net/nfse/WSSaoPaulo/32790ced-5ec5-4a6c-a05c-d30c47c9260f/07882930000165/2022/05/24/628cf18fe9abde2bf420658a.xml?sv=2015-07-08&sr=b&sig=L0TnPT2sIxMPhhKKgwblSQtLLp0vAkYwXxCwWveGYuc%3D&se=2022-12-10T14%3A54%3A07Z&sp=r',
    codServico: '3877',
    munPrestador: 3550308,
    munTomador: 3550308,
    codIBGEMunicipioNota: 3550308,
    municipioPrestacao: '',
    nomeMunicipioPrestacao: '',
    ISSRetido: false,
    prestadorCEP: 1435001,
    po: '',
    dtCancelamento: null,
    descricao_de_servico: '',
    txOrigemNota: 'Web Service',
    txValorBaseCalculo: 63.69,
    txValorLiquidoNfse: 63.69,
    txVlIrrf: 0,
    txVlCsll: 0,
    txVlCofins: 0,
    txVlPis: 0,
    txValorIss: 0.77,
    txVlInss: 0,
    txVlDeducoes: 24.74,
    txISSAliq: 0.02,
    txValorTotalRecebido: 0,
    txSerieNFse: null,
    txRpsNumero: '333442',
    txRpsSerie: 'REG',
    txPrestEndereco: 'SAO GABRIEL',
    txPrestEndTipoLogradouro: 'AV',
    txPrestEndNumero: '00201',
    txPrestEndComplemento: 'SALAS 101 A 110',
    txPrestEndBairro: 'JARDIM PAULISTA',
    txPrestEndUf: 'SP',
    txPrestEndCodMunicipio: 3550308,
    txPrestEndNomeMunicipio: 'São Paulo',
    txPrestEndCep: 1435001,
    txPrestEndTelefone: null,
    txPrestEndEmail: 'contasapagar@13registro.com.br',
    txTomadEndereco: 'SANTOS',
    txTomadEndTipoLogradouro: 'AL',
    txTomadEndNumero: '700',
    txTomadEndBairro: 'CERQUEIRA CESAR',
    txTomadEndCodMunicipio: 3550308,
    txPrestEndInscEstadual: 0,
    txPrestEndInscMunicipal: 0,
    txTomadEndUf: 'SP',
    txTomadEndCep: 1418002,
    txTomadEndPaisObra: null,
    txTomadEndTelefone: null,
    txTomadEndEmail: 'contasapagar@mitrerealty.com.br',
    txTomadEndInscEstadual: 0,
    txTomadEndInscMunicipal: 34996770,
    txCodigoVerificacao: 'VXLSJWEM',
    txTomadEndComplemento: 'ANDAR 5',
    txNrNfseSubst: null,
    txIdlegado: null,
    oneTemplateTitle: '',
    ass_id: 'a278fa91-cf28-4e29-8410-f2bf89a02d93',
    assid: 'a278fa91-cf28-4e29-8410-f2bf89a02d93',
    fedid: 'b12d1339-b69c-4347-802c-1f1750596883',
    fdtid: '9253cd1f-f178-4129-a0e0-a7585d7f51c5',
    usrid: 'a08e0ca2-0ee3-4909-81f8-1e73c5ee9901',
    email: 'adm@mitre.com.br',
    onergy_rolid: '',
    timezone: null,
    onergy_js_ctx: null,
    eventos: [],
    pedidos_relacionados: [],
    itensPosValidacao: [],
    erp_type: 'MEGA',
    ERP_erp_type: 'MEGA',
    ERP_id: '12bae88a-3e5d-5b3c-40ec-761918810323',
    lst_siglas: ['AP:', 'Pedido:'],
    habilitar_validacao_comercial: 'Não',
    habilitar_validacao_comercial_desc: 'Não',
    forma_integracao: 'ativa',
    forma_integracao_desc: 'Onergy envia os dados para outros sistemas',
    inbox_automatico: 'nao',
    inbox_automatico_desc: 'Não',
    habilitar_workflow_aprovacao: 'Sim',
    habilitar_workflow_aprovacao_desc: 'Sim',
    habilitar_sugestao_escrituracao: ' ',
    habilitar_manifestacao: ' ',
    habilitar_validacao_fiscal_taxfy_link: 'Não',
    habilitar_validacao_fiscal_taxfy_link_desc: 'Não',
    CFD_LDOC_documento__tipo_documento__tipo_documento: 'Fatura',
    CFD_tipo_documento_id: 'dadfb076-f5ed-90e0-450b-1784846ca5b1',
    habilitar_condicao_pagamento: 'Sim',
    habilitar_condicao_pagamento_desc: 'Sim',
    preencher_condicao_pagamento: 'onergy',
    preencher_condicao_pagamento_desc: 'Cadastro Onergy',
    habilitar_btn_validar_registro: 'Não',
    habilitar_btn_validar_registro_desc: 'Não',
    campo_condicao_pagamento: ' ',
    dtUploadDate: '2022-07-26 18:56:32',
    dtUpload: '2022-07-26 15:56:32',
    upload_data_hora: '26/07/2022 15:56:32',
    responsavel_upload: 'INTEGRAÇÃO',
    selectFinalid: 'Não',
    env: 'CLI',
    necessario_validar_documentos: false,
    aliquota_porcentagem: 2,
    MIMPmun_issdesc:
        'Serviços de registros públicos, cartorários e notariais, exceto autenticação de documentos, reconhecimento de firmas e prestação de informações por qualquer forma ou meio quando o interessado dispensar a certidão correspondente.',
    MIMPlc_cod: '21.01',
    MIMPcodServico_id: '8b1b48f1-1706-4ea2-b9d7-fb4b758fd963',
    MIMPmun_isscod__codServico: '3877',
    po_extraido: null,
    cnpjRaizEmit: '28060172',
    cnpjRaizDest: '07882930',
    prestacao_servicos: 'Não',
    competencia: '05/2022',
    LDOC_documento__tipo_documento: 'NFS-e',
    LDOC_tipo_documento_id: 'e2804a2a-8ed0-355a-9f3a-f3225f867bec',
    id_save_inbox: 'e196a930-01ab-4f40-bf80-417ed36fb80d',
    id_template_inbox: '254907b2-d9fe-4c4c-bc5e-6c4aec3d5bed',
    doc_original: 'f08ed5e9-67ad-4f94-9622-78b63bfccd69',
    id_retencao_ref: 'dd030dfe-a17a-4c5a-ba89-96cc2cfb1eb2',
    cadastro_no_cpom: 'Cadastrado no CEPOM',
    codigo_da_lei_complementar: '21.01-Serviços de registros públicos, cartorários e notariais',
    iss_bitrib: 0,
    simples_nacional: 'Não Optante',
    tot_impostos: null,
    tot_liq: null,
    valor_cofins: null,
    valor_csll: null,
    valor_inss: null,
    valor_irrf: null,
    valor_iss: 0,
    valor_iss_bitrib: 0,
    valor_pispasep: null,
};

init(JSON.stringify(json));
