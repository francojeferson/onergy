/**ENV_NODE** =====================================================================================
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
/**CLI_SCRIPT** ===================================================================================
 * Executar automático quando em processo: Não
 * Atividade de longa duração: Não
 * Esconder Menu: Sim
 * Condicional: nenhum
 * Aprovação: nenhum
 */
async function init(json) {
    let data = JSON.parse(json);
    onergy.log(`JFS ~ verifica_captura ~ init: ${JSON.stringify(data)}`);

    //*pesq.ref:constantes
    let idConstantes = 'efb11b9d-58d7-45fb-a8cd-d0ffbc707d0f';
    let getConstantes = await getOnergyItem(idConstantes, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
    let isConstAlertaCaptura = getConstantes.filter((j) => j.UrlJsonContext.nome_interno == 'dias_alerta_captura'); // 5
    let isConstAtrasoCaptura = getConstantes.filter((j) => j.UrlJsonContext.nome_interno == 'dias_atraso_captura'); // 15
    let isConstBuscaCaptura = getConstantes.filter((j) => j.UrlJsonContext.nome_interno == 'dias_antes_captura'); // 15

    //*pesq.ref:estado_cuenta
    let idEstadoCuenta = '4963d2c6-2b94-4c37-bffb-87c0dc296587';
    let getEstadoCuenta = await getOnergyItem(idEstadoCuenta, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
    let isEstadoCuenta = getEstadoCuenta.filter((j) => j.UrlJsonContext.status_conta != 'INACTIVA');

    //*aba:informacion_cuenta(pai:sitios)
    let idInformacionCuenta = '1e6d6595-083f-4bb8-b82c-e9054e9dc8f3';
    let getInformacionCuenta = await getOnergyItem(idInformacionCuenta, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
    let isInformacionCuenta = getInformacionCuenta.filter(
        (j) => j.UrlJsonContext.sta_cont_status_conta == isEstadoCuenta[(0, 1, 2)].UrlJsonContext.status_conta
    );

    let cache = [];
    let logStatus = [];
    if (isInformacionCuenta.length > 0) {
        for (let i in isInformacionCuenta) {
            let objPost = isInformacionCuenta[i].UrlJsonContext;

            //*pesq.ref:tipo_cuenta
            let isTipoCuenta = '';
            let isCache = cache.filter((j) => j.asset_number == objPost.asset_number);
            if (isCache.length > 0) {
                isTipoCuenta = isCache[0].isTipoCuenta;
            } else {
                let idTipoCuenta = '84ca5970-7a49-4192-a2c8-030031503a1a';
                let getTipoCuenta = await getOnergyItem(idTipoCuenta, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
                isTipoCuenta = getTipoCuenta.filter((j) => j.UrlJsonContext.TC_tipo_de_conta == objPost.TCTC_tipo_de_conta__prcs__tipo_de_conta);
                cache.push({ asset_number: objPost.asset_number, tipo_cuenta: objPost.TCTC_tipo_de_conta__prcs__tipo_de_conta, isTipoCuenta: isTipoCuenta });
            }

            //*tipo_cuenta == P || PH || I, calcula ProximoPago e ProximaCaptura
            //*else, copia ProximoPago e ProximaCaptura de P para H || HH
            if (
                isTipoCuenta.length > 0 &&
                (objPost.TCTC_tipo_de_conta__prcs__tipo_de_conta == 'P' ||
                    objPost.TCTC_tipo_de_conta__prcs__tipo_de_conta == 'PH' ||
                    objPost.TCTC_tipo_de_conta__prcs__tipo_de_conta == 'I')
            ) {
                //*pesq.ref:frecuencia_pago
                let idFrecuenciaPago = '2d4edce3-7131-413a-98e5-35d328daef7f';
                let getFrecuenciaPago = await getOnergyItem(idFrecuenciaPago, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
                let isFrecuenciaPago = getFrecuenciaPago.filter((j) => j.UrlJsonContext.frequencia == objPost.fre_pag_frequencia__frequencia_de_pagamento);

                //*frecuencia_pago
                if (isFrecuenciaPago.length > 0) {
                    //*pesq.ref:estado_captura_cuenta
                    let idEstadoCapturaCuenta = '3c2d0727-6359-4c71-9409-465759462854';
                    let getEstadoCapturaCuenta = await getOnergyItem(idEstadoCapturaCuenta, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
                    let isEstadoCapturaCuenta = getEstadoCapturaCuenta.filter(
                        (j) => j.UrlJsonContext.ECCU_estado_da_captura_da_conta == objPost.ECCUECCU_estado_da_captura_da_conta__status_de_capturapago
                    );

                    //*estado_captura_cuenta
                    // if (isEstadoCapturaCuenta.length > 0) {
                    let hoje = new Date();

                    //*DiaDePago
                    let isDiaDePago = objPost.prcs__dia_de_pagamento;
                    let strDiaDePago = JSON.stringify(isDiaDePago);
                    let hojeDiaDePago = gerarData(hoje);
                    let newDiaDePago = hojeDiaDePago.slice(0, -2) + strDiaDePago;
                    let setDiaDePago = new Date(newDiaDePago + ' 00:00:00');

                    //*ProximoPago
                    let isProximoPago = objPost.data_proximo_pagamento;
                    let defProximoPago = isProximoPago == null ? hoje : isProximoPago;
                    let strProximoPago = JSON.stringify(defProximoPago);
                    strProximoPago.includes(' 00:00:00') == true ? strProximoPago : strProximoPago + ' 00:00:00';
                    let objProximoPago = JSON.parse(strProximoPago);
                    let validProximoPago = objProximoPago;
                    let setProximoPago = new Date(validProximoPago);

                    //*se ProximoPago <= ontem, calcula novo ProximoPago e ProximaCaptura
                    let isHoje = new Date(hoje);
                    let ontem = new Date(isHoje.setDate(isHoje.getDate() - 1));
                    if (setProximoPago.getTime() <= ontem.getTime()) {
                        //*calcula ProximoPago
                        let valFrecuenciaPago = isFrecuenciaPago[0].UrlJsonContext.frequencia_em_meses;
                        let thisProximoPago = setProximoPago;
                        let newProximoPago = new Date(thisProximoPago.setMonth(thisProximoPago.getMonth() + valFrecuenciaPago));
                        let ajustProximoPago = new Date(newProximoPago.setDate(setDiaDePago.getDate()));

                        //*calcula ProximaCaptura
                        let valConstBuscaCaptura = JSON.parse(isConstBuscaCaptura[0].UrlJsonContext.valor);
                        let isProximaCaptura = new Date(ajustProximoPago);
                        let newProximaCaptura = new Date(isProximaCaptura.setDate(isProximaCaptura.getDate() - valConstBuscaCaptura));

                        //*estado_captura_cuenta == EN ESPERA
                        let newEstadoCapturaCuenta = objPost.ECCUECCU_estado_da_captura_da_conta__status_de_capturapago;
                        newEstadoCapturaCuenta = 'EN ESPERA';

                        //*envia resultado
                        objPost.data_proximo_pagamento = gerarData(ajustProximoPago);
                        objPost.prcs__proxima_captura = gerarData(newProximaCaptura);
                        objPost.ECCUECCU_estado_da_captura_da_conta__status_de_capturapago = newEstadoCapturaCuenta;

                        let resultPost = await gravarRegistro('asset_number', objPost.asset_number, idInformacionCuenta, objPost, data, isInformacionCuenta[i].ID);
                    } else if (objPost.ECCUECCU_estado_da_captura_da_conta__status_de_capturapago == 'CAPTURADA') {
                        //*else if, estado_captura_cuenta == CAPTURADA
                        continue;
                    } else {
                        //*else, check hoje > (ProximoPago - constAtraso)
                        let valConstAtraso = JSON.parse(isConstAtrasoCaptura[0].UrlJsonContext.valor);
                        let thisProximoPago = setProximoPago;
                        let atrasoProximoPago = new Date(thisProximoPago.setDate(thisProximoPago.getDate() - valConstAtraso)); // constAtraso == 15

                        //*hoje > (ProximoPago - constAtraso)
                        if (hoje.getTime() > atrasoProximoPago.getTime()) {
                            //*estado_captura_cuenta == ATRASADA
                            let newEstadoCapturaCuenta = objPost.ECCUECCU_estado_da_captura_da_conta__status_de_capturapago;
                            newEstadoCapturaCuenta = 'ATRASADA';

                            //*envia resultado
                            objPost.ECCUECCU_estado_da_captura_da_conta__status_de_capturapago = newEstadoCapturaCuenta;

                            let resultPost = await gravarRegistro('asset_number', objPost.asset_number, idInformacionCuenta, objPost, data, isInformacionCuenta[i].ID);
                        } else {
                            //*check hoje >= (ProximoPago - constAlerta)
                            let valConstAlerta = JSON.parse(isConstAlertaCaptura[0].UrlJsonContext.valor);
                            let thisProximoPago = setProximoPago;
                            let alertaProximoPago = new Date(thisProximoPago.setDate(thisProximoPago.getDate() - valConstAlerta)); // constAlerta == 5

                            //*hoje >= (ProximoPago - constAlerta)
                            if (hoje.getTime() > alertaProximoPago.getTime()) {
                                //*estado_captura_cuenta == ALERTA
                                let newEstadoCapturaCuenta = objPost.ECCUECCU_estado_da_captura_da_conta__status_de_capturapago;
                                newEstadoCapturaCuenta = 'ALERTA';

                                //*envia resultado
                                objPost.ECCUECCU_estado_da_captura_da_conta__status_de_capturapago = newEstadoCapturaCuenta;

                                let resultPost = await gravarRegistro('asset_number', objPost.asset_number, idInformacionCuenta, objPost, data, isInformacionCuenta[i].ID);
                            }
                        }
                    }
                    // }
                }
            } else if (
                isTipoCuenta.length > 0 &&
                (objPost.TCTC_tipo_de_conta__prcs__tipo_de_conta == 'H' || objPost.TCTC_tipo_de_conta__prcs__tipo_de_conta == 'HH')
            ) {
                //*else, copia ProximoPago e ProximaCaptura de P para H || HH
                let isCuentaPadre = objPost.prcs__conta_pai;
                let strInformacionCuenta = isInformacionCuenta.filter((j) => j.UrlJsonContext.conta_interna_nic == isCuentaPadre);

                if (strInformacionCuenta.length > 0) {
                    //*envia resultado
                    objPost.data_proximo_pagamento = strInformacionCuenta[0].UrlJsonContext.data_proximo_pagamento;
                    objPost.prcs__proxima_captura = strInformacionCuenta[0].UrlJsonContext.prcs__proxima_captura;
                    objPost.ECCUECCU_estado_da_captura_da_conta__status_de_capturapago =
                        strInformacionCuenta[0].UrlJsonContext.ECCUECCU_estado_da_captura_da_conta__status_de_capturapago;

                    let resultPost = await gravarRegistro('asset_number', objPost.asset_number, idInformacionCuenta, objPost, data, isInformacionCuenta[i].ID);
                } else {
                    logStatus.push(`JFS ~ verifica_captura ~ Cuenta Padre no encontrada para Asset Number ${objPost.asset_number}\n`);
                }
            } else {
                logStatus.push(`JFS ~ verifica_captura ~ Tipo de Cuenta no encontrada para Asset Number ${objPost.asset_number}\n`);
            }
        }
    } else {
        logStatus.push(`JFS ~ verifica_captura ~ Estado de Cuenta ${strEstadoCuenta} no encontrado para Información de la Cuenta ${data.asset_number}\n`);
    }

    onergy.log(`JFS ~ verifica_captura ~ init: ${JSON.stringify(logStatus.join(''))}`);
    //return true;
    return SetObjectResponse(true, data, true);
}
function initBefore(json) {
    //return true;
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
var cacheValues = [];
async function getOnergyItem(fdtid, assid, usrid, filtro) {
    let cache = cacheValues.find(VALUE => VALUE.fdtid == fdtid && VALUE.filter == filtro);
    if (cache) {
        return cache.values;
    } else {
        let result = await (async () => {
            let strResp = await onergy_get({
                fdtid: fdtid,
                assid: assid,
                usrid: usrid,
                filter: filtro,
            });
            return JSON.parse(strResp);
        })();
        if (result.length > 0) {
            cacheValues.push({
                "fdtid": fdtid,
                "filter": filtro,
                "values": result
            });
        }
        return result;
    }
}
async function gravarRegistro(fielNameQ, valueQ, idTabExcel, objPost, data, id) {
    //*consulta registro
    // let filItem = gerarFiltro(fielNameQ, valueQ);
    // let getItem = await getOnergyItem(idTabExcel, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, filItem);
    if (getItem.length > 0) {
        //*se houver registro, atualizar
        return console.log(`${postInfo}`);
        let postInfo = {
            UrlJsonContext: objPost,
        };
        let result = await onergy_updatemany({
            fdtid: idTabExcel,
            assid: data.onergy_js_ctx.assid,
            usrid: data.onergy_js_ctx.usrid,
            id: id,
            data: JSON.stringify(postInfo),
        });
        return result;
    }
}
function gerarFiltro(fielNameP, valueP) {
    return JSON.stringify([
        {
            FielName: fielNameP,
            Type: `${typeof valueP == 'number' ? 'Numeric' : 'string'}`,
            FixedType: `${typeof valueP == 'number' ? 'Numeric' : 'string'}`,
            Value1: valueP,
        },
    ]);
}
function gerarData(dataHoje) {
    let dataHojeFormat = dataHoje.getFullYear() + '-' + (dataHoje.getMonth() + 1) + '-' + dataHoje.getDate();
    let arrayData = dataHojeFormat.split('-');
    let dataHojeFormatada = arrayData[0] + '-' + arrayData[1].padStart(2, '0') + '-' + arrayData[2].padStart(2, '0');
    return dataHojeFormatada;
}
/**MET_PADRAO =====================================================================================
 */
let json = {
    "schedule": 1,
    "oneTemplateTitle": "Verifica Captura",
    "ass_id": "88443605-74d6-4ea4-b426-a6c3e26aa615",
    "assid": "88443605-74d6-4ea4-b426-a6c3e26aa615",
    "email": "prod@atc.com.br",
    "fdtid": "51f0ba7e-35cc-4167-8e4e-da9f52972822",
    "fedid": "cdd7621c-cc7a-4863-8440-2944c033adc2",
    "onergy_rolid": "",
    "timezone": null,
    "usrid": "40ddc5fc-2ef7-4b78-bcc4-5e2048d22331",
    "dtJobScheduleExecDate": "2023-06-12T09:00:00Z",
    "dtJobScheduleExec": "2023-06-12 06:00:00",
    "onergy_js_ctx": {
        "assid": "88443605-74d6-4ea4-b426-a6c3e26aa615",
        "fedid": "cdd7621c-cc7a-4863-8440-2944c033adc2",
        "fdtid": "51f0ba7e-35cc-4167-8e4e-da9f52972822",
        "usrid": "40ddc5fc-2ef7-4b78-bcc4-5e2048d22331",
        "insertDt": "2022-10-26T23:49:39.022Z",
        "updateDt": "2023-06-12T06:00:00.688Z",
        "cur_userid": "40ddc5fc-2ef7-4b78-bcc4-5e2048d22331",
        "email": "prod@atc.com.br",
        "user_name": "prod@atc.com.br",
        "onergy_rolid": "",
        "praid": "e5ef0ec6-3860-4c50-b73f-9edb7df79ec4",
        "pcvid": "9919daa2-e2ec-43c2-b3cd-82e415b5203f",
        "prcid": "0a17be9c-1247-2f1e-b91c-15740976f2c5",
        "timezone": null,
        "timezone_value": "-03:00",
        "pubNubHook": null
    }
};

init(JSON.stringify(json));
