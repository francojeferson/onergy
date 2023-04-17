/**NODE_ENV ===
 */
let { date } = require('assert-plus');
let { formatDate } = require('tough-cookie');
let { log, debug } = require('console');
let { memory } = require('console');
let { resolve } = require('path');
let { type } = require('os');
let axios = require('axios');
let fs = require('fs');
let jsuser = require('../onergy/onergy-utils');
let onergy = require('../onergy/onergy-client');
let utils = require('../onergy/onergy-utils');
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
    return data;
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
async function onergy_updatemany(data) {
    return data;
}
function successCallback(result) {
    console.log('It succeeded with ' + result);
}

/*
=============================   SCRIPT    =============================
*/
const passthruReadOnlyID = 'acb34798-0a36-424f-9f0e-619238120d33';
async function init(json) {
    const data = JSON.parse(json);

    let objFatReadOnly = await getOnergyItem(passthruReadOnlyID, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, gerarFiltro('_id', data.pstr_ids_faturas_selecionadas[0]));
    let totalFatura = formatNumber(objFatReadOnly[0].UrlJsonContext.valor_total_informado);
    let totalContribucion = formatNumber(objFatReadOnly[0].UrlJsonContext.energia_de_contribuicao);
    let totalAlumbrado = formatNumber(objFatReadOnly[0].UrlJsonContext.taxa_de_iluminacao);
    let totalCnac = formatNumber(objFatReadOnly[0].UrlJsonContext.total_cnac);

    // factura valor neto
    // total factura - contribucion - alumbrado - cnac == valor neto
    let valorNeto = totalFatura - totalContribucion - totalAlumbrado - totalCnac;

    // tarifa energia
    // ( ( valor neto / consumo kwh ) * 100 ) / 120 == tarifa energia
    let tarifaEnergia = (Number(((valorNeto * 100) / 120).toFixed(2)) > 0) ? Number(((valorNeto * 100) / 120).toFixed(2)) : 0;

    // reembolso energia
    // tarifa energia * consumo noc == reembolso energia
    let consumoNoc = 0; //import from consumo telemedidas
    let reembolsoEnergia = formatNumber(tarifaEnergia * consumoNoc);

    // reembolso contribucion
    // reembolso energia * constante contribucion == reembolso contribucion
    let constanteContribucion = 0; //import from tablas auxiliares: constante
    let reembolsoContribucion = formatNumber(reembolsoEnergia * constanteContribucion);

    // reembolso alumbrado publico
    // alumbrado * sujeto pasivo == reembolso alumbrado
    // inserir coluna Valor em tablas auxiliares: sujeto pasivo
    // dependendo de qtd provisional, sujeto pasivo é alterado
    let sujetoPasivo = 0; //import from tablas auxiliares: sujeto pasivo
    let reembolsoAlumbradoPublico = formatNumber(totalAlumbrado * sujetoPasivo);

    // reembolso cnac / cnac occasio operador
    // se cnac == occasio operador,
    // ( cnac * consumo ami ) / consumo kwh == cnac tigo
    // (cnac - cnac tigo) == cnac atc
    // senão,
    // cnac * constante cnac == reembolso cnac
    let constanteCnac = 0; //import from tablas auxiliares: constante
    let reembolsoCnac = formatNumber(totalCnac - constanteCnac);

    // total reembolso
    // reembolso energia + reembolso contribucion + reembolso alumbrado publico + reembolso cnac == total reembolso
    let totalReembolso = formatNumber(reembolsoEnergia + reembolsoContribucion + reembolsoAlumbradoPublico + reembolsoCnac);

    // costo atc
    // total factura - total reembolso == costo atc
    let costoAtc = formatNumber(totalFatura - totalReembolso);
    debugger;

    // promedio total reembolso

    //return true;
    //return SetObjectResponse(true, data, true);
}
function initBefore(json) {
    //return true;
}
function initDelete(json) {
    //return true;
}
function SetObjectResponse(cond, json, WaitingWebHook) {
    if (WaitingWebHook === undefined)
        WaitingWebHook = false;

    var obj = {
        'cond': cond,
        'json': JSON.stringify(json),
        'WaitingWebHook': WaitingWebHook,
    };
    return obj;
}

const getOnergyItem = async (fdtid, assid, usrid, filtro) => {
    let strResp = await onergy_get({
        fdtid: fdtid,
        assid: assid,
        usrid: usrid,
        filter: filtro,
    });
    return JSON.parse(strResp);
};

const gerarFiltro = (fielNameP, valueP) => {
    return JSON.stringify([{ FielName: fielNameP, Type: `${typeof valueP == 'number' ? 'Numeric' : 'string'}`, FixedType: `${typeof valueP == 'number' ? 'Numeric' : 'string'}`, Value1: valueP }]);
};

async function sendItemToOnergy(templateid, assid, usrid, data, fedid, ukField) {
    let onergySaveData = {
        fdtid: templateid,
        assid: assid,
        usrid: usrid,
        data: JSON.stringify(data)
    };

    if (fedid !== undefined && fedid !== '') {
        onergySaveData.id = fedid;
    }
    if (ukField !== undefined && ukField !== '') {
        onergySaveData.ukField = ukField;
    }

    return await onergy_save(onergySaveData);
}

const formatNumber = (value) => {
    if (typeof value === 'undefined') {
        return 0;
    }
    const number = Number(value);
    if (isNaN(number)) {
        return 0;
    } else {
        return Math.floor(number);
    }
};

const getISODate = (strDate) => {
    if (!strDate) { return undefined; }

    let isIsoDate = (() => {
        if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(strDate)) {
            return undefined;
        }
        const date = new Date(strDate);
        if (!(date instanceof Date) || isNaN(date) || date.toISOString() != strDate) {
            return undefined;
        }
        return date.toJSON();
    })();

    let brFormatDate = (() => {
        let splitDate = strDate.split("/").map(VALUE => Number(VALUE));
        if (splitDate.length != 3) {
            return false;
        }
        let date = new Date(splitDate[2], splitDate[1] - 1, splitDate[0], 0, 0, 0);
        let reverseDate = `${(date.getDate().toString().padStart(2, 0))}/${((date.getMonth() + 1).toString().padStart(2, 0))}/${date.getFullYear()}`;
        if (reverseDate != strDate) {
            return false;
        }
        return date.toJSON();
    })();

    return (() => {
        if (isIsoDate) return isIsoDate;
        if (brFormatDate) return brFormatDate;
        return undefined;
    })();
};

//====================================================================================================
var jsonInput = {
    "facturas_disponibles": null,
    "facturas_seleccionadas": null,
    "facturas_seleccionadas_readonly": " ",
    "pstr_registro_salvo": "sim",
    "pstr_status_processo": "ENVIADO A PROCESO",
    "pstr_ids_faturas_selecionadas": [
        "c578a729-462f-4f0b-99db-a21b43331c71",
        "e6c35464-db66-4da1-bf46-67cafdf8fe54"
    ],
    "onergy_js_ctx_ORIGINAL": {
        "assid": "67c0b77d-abae-4c48-ba4b-6c8faf27e14a",
        "fedid": "7961814b-dc63-6e01-12e7-4db7a7b8661e",
        "fdtid": "06456424-a022-46a3-93b9-67e65eb31726",
        "usrid": "1ec86197-d331-483a-b325-62cc26433ea5",
        "insertDt": "2023-04-17T13:59:38.29Z",
        "updateDt": "2023-04-17T13:59:38.29Z",
        "cur_userid": "1ec86197-d331-483a-b325-62cc26433ea5",
        "email": "adm@atc.com.br",
        "user_name": "ADM ATC",
        "onergy_rolid": "",
        "praid": "e981dd71-e7fc-4b38-8cca-21173dfa8d72",
        "pcvid": "1ddb5c50-6a27-4c00-a379-cd6bdb83850e",
        "prcid": "3c17d734-8235-914f-9382-75e79ec29b16",
        "timezone": null,
        "timezone_value": "-03:00",
        "pubNubHook": null
    },
    "oneTemplateTitle": "",
    "ass_id": "67c0b77d-abae-4c48-ba4b-6c8faf27e14a",
    "assid": "67c0b77d-abae-4c48-ba4b-6c8faf27e14a",
    "fedid": "ee7f44cd-9ce7-4f27-ba3e-56615a488f87",
    "fdtid": "89594537-4225-46d5-96c4-dcbf5629f754",
    "usrid": "1ec86197-d331-483a-b325-62cc26433ea5",
    "email": "adm@atc.com.br",
    "onergy_rolid": "",
    "timezone": null,
    "onergy_js_ctx": {
        "assid": "67c0b77d-abae-4c48-ba4b-6c8faf27e14a",
        "fedid": "ee7f44cd-9ce7-4f27-ba3e-56615a488f87",
        "fdtid": "89594537-4225-46d5-96c4-dcbf5629f754",
        "usrid": "1ec86197-d331-483a-b325-62cc26433ea5",
        "insertDt": "2023-04-17T13:59:41.693Z",
        "updateDt": "2023-04-17T13:59:41.693Z",
        "cur_userid": "1ec86197-d331-483a-b325-62cc26433ea5",
        "email": "adm@atc.com.br",
        "user_name": "ADM ATC",
        "onergy_rolid": "",
        "praid": "96544335-4857-45c0-81e0-eef1a4d3ef74",
        "pcvid": "1ddb5c50-6a27-4c00-a379-cd6bdb83850e",
        "prcid": "3c17d734-8235-914f-9382-75e79ec29b16",
        "timezone": null,
        "timezone_value": "-03:00",
        "pubNubHook": null
    }
};

init(JSON.stringify(jsonInput));
