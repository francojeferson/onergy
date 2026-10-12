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
let jsuser = require('../../onergy/onergy-utils');
let onergy = require('../../onergy/onergy-client');
let utils = require('../../onergy/onergy-utils');
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

let calculosID = "a8594cca-5f2c-4bcd-b2be-92b5e03d57f3";

async function init(json) {
    let data = JSON.parse(json);
    let result = {};
    //========== LOG =============//
    if (data?.onergyLog?.log_fluxo) {
        onergy.log("PASSTHRU - Criação de Excel");
    }
    if (data?.onergyLog?.logData?.criacao_de_excel) {
        onergy.log(JSON.stringify({
            type: 'Message',
            origem: 'Passthru:Criação de Excel:init',
            data: data,
        }));
    }
    //============================//

    try {
        let filtroCalculos = utilsProcess.gerarFiltro("ID_ONE_REF", data.onergy_js_ctx_ORIGINAL.fedid);
        let calculos = await getOnergyItem(calculosID, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, filtroCalculos);
        if (calculos.length == 0) { return false; }
        let linhasExcel = [];

        while (calculos.length > 0) {
            let grupoDeMesmoPortfolio = calculos.filter((VALUE) => VALUE.UrlJsonContext.pstr_portifolio == calculos[0].UrlJsonContext.pstr_portifolio);
            calculos = utilsProcess.removeGroupFromArray(calculos, grupoDeMesmoPortfolio);

            let portfolio = grupoDeMesmoPortfolio[0].UrlJsonContext.pstr_portifolio;
            let linhasPortfolio = [];

            while (grupoDeMesmoPortfolio.length > 0) {
                let grupoDeMesmaTipologia = grupoDeMesmoPortfolio.filter((VALUE) => VALUE.UrlJsonContext.pstr_tipologia == grupoDeMesmoPortfolio[0].UrlJsonContext.pstr_tipologia);
                grupoDeMesmoPortfolio = utilsProcess.removeGroupFromArray(grupoDeMesmoPortfolio, grupoDeMesmaTipologia);

                let linhaExcel = {
                    "PORTAFOLIO": grupoDeMesmaTipologia[0].UrlJsonContext.pstr_portifolio,
                    "TIPOLOGIA": grupoDeMesmaTipologia[0].UrlJsonContext.pstr_tipologia,
                    "ALUMBRADO PUBLICO": grupoDeMesmaTipologia.map(VALUE => Number(VALUE.UrlJsonContext.passthru__reembolso_alumbrado_publico)).reduce((previousValue, currentValue) => Number(previousValue) + Number(currentValue)),
                    "ENERGIA": grupoDeMesmaTipologia.map((VALUE) => (Number(VALUE.UrlJsonContext.passthru__total_energ_contrib_cnac))).reduce((previousValue, currentValue) => Number(previousValue) + Number(currentValue))
                };
                linhaExcel["TOTAL COBRO"] = linhaExcel["ALUMBRADO PUBLICO"] + linhaExcel["ENERGIA"];
                linhasPortfolio.push(linhaExcel);
            }

            linhasExcel = linhasExcel.concat(linhasPortfolio);
            linhasExcel.push({
                "PORTAFOLIO": "",
                "TIPOLOGIA": `TOTAL ${portfolio}`,
                "ALUMBRADO PUBLICO": linhasPortfolio.map(VALUE => VALUE["ALUMBRADO PUBLICO"]).reduce((previousValue, currentValue) => Number(previousValue) + Number(currentValue)),
                "ENERGIA": linhasPortfolio.map(VALUE => VALUE["ENERGIA"]).reduce((previousValue, currentValue) => Number(previousValue) + Number(currentValue)),
                "TOTAL COBRO": linhasPortfolio.map(VALUE => VALUE["ENERGIA"]).reduce((previousValue, currentValue) => Number(previousValue) + Number(currentValue)),
            });
        }

        let urlExcel = fileutils.CreateExcel(linhasExcel, data.CDE__numero_lote, Object.keys(linhasExcel[0]), Object.keys(linhasExcel[0]), false);

        result.pstr_archivos_passthru = [{
            "Url": urlExcel,
            "UrlAzure": urlExcel,
            "Name": `Passthru.xlsx`
        }];

        await utilsProcess.atualizaDocumentoOriginal(data, result);
        return SetObjectResponse(false, result, false);
    } catch (error) {
        onergy.log(
            JSON.stringify({
                type: 'Erro',
                origem: 'Passthru:Criação de Excel:init',
                stack: error.stack,
                message: error.message,
                data: data,
            })
        );
        return SetObjectResponse(false, null, false, true);
    }
}

function initBefore(json) {
    //return true;
}

function initDelete(json) {
    //return true;
}

function SetObjectResponse(cond, json, WaitingWebHook, fimProcesso) {
    if (WaitingWebHook === undefined) {
        WaitingWebHook = false;
    }
    var obj = {
        'cond': cond,
        'WaitingWebHook': WaitingWebHook,
    };
    if (json && Object.keys(json).length > 0) {
        obj.json = JSON.stringify(json);
    }
    if (fimProcesso) {
        obj.onergy_prc_id = "3c17d734-8235-914f-9382-75e79ec29b16"; // Passthru
        obj.onergy_new_prc_id_fdtid = "659303b2-00bb-4d97-b9e3-83a5d56c450b"; // Fim
    }
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

const utilsProcess = {
    removeGroupFromArray: (array, group) => {
        let finalArray = [];
        for (const ITEM_ARRAY of array) {
            let item = group.find(ITEM => ITEM.ID == ITEM_ARRAY.ID);
            if (!item) {
                finalArray.push(ITEM_ARRAY);
            }
        }
        return finalArray;
    },
    gerarFiltro: (fielNameP, valueP) => {
        return JSON.stringify([{ FielName: fielNameP, Type: `${typeof valueP == 'number' ? 'Numeric' : 'string'}`, FixedType: `${typeof valueP == 'number' ? 'Numeric' : 'string'}`, Value1: valueP }]);
    },
    atualizaDocumentoOriginal: async (data, postInfo) => {
        await onergy_updatemany({
            fdtid: data.onergy_js_ctx.fdtid,
            assid: data.onergy_js_ctx.assid,
            usrid: data.onergy_js_ctx.usrid,
            id: data.onergy_js_ctx_ORIGINAL.fedid,
            data: JSON.stringify({
                "UrlJsonContext": postInfo
            })
        });
    }
};

//====================================================================================================
const jsonInput = {
    "facturas_disponibles": null,
    "facturas_seleccionadas": null,
    "facturas_seleccionadas_readonly": " ",
    "pstr_archivos_passthru": " ",
    "pstr_registro_salvo": "sim",
    "pstr_sequecial_passthru": "PASS202300010",
    "pstr_usuario_de_criacao": "prod@atc.com.br",
    "data_de_criacao_pstrDate": "2023-06-25T20:12:17Z",
    "data_de_criacao_pstr": "2023-06-25 17:12:17",
    "pstr_hora_criacao": "17:12",
    "pstr_status_processo": "ENVIADO A PROCESO",
    "pstr_ids_faturas_selecionadas": "",
    "onergy_js_ctx_ORIGINAL": {
        "assid": "88443605-74d6-4ea4-b426-a6c3e26aa615",
        "fedid": "6d84767d-a9a2-8ec6-e731-63879e0ac139",
        "fdtid": "06456424-a022-46a3-93b9-67e65eb31726",
        "usrid": "40ddc5fc-2ef7-4b78-bcc4-5e2048d22331",
        "insertDt": "2023-06-25T20:12:14.905Z",
        "updateDt": "2023-06-25T20:12:14.905Z",
        "cur_userid": "40ddc5fc-2ef7-4b78-bcc4-5e2048d22331",
        "email": "prod@atc.com.br",
        "user_name": "prod@atc.com.br",
        "onergy_rolid": "",
        "praid": "fcca96ae-6317-4425-a293-6b97c2fbc4e1",
        "pcvid": "58780e12-423b-4fff-bf70-f7f7bda53041",
        "prcid": "3c17d734-8235-914f-9382-75e79ec29b16",
        "timezone": null,
        "timezone_value": "-03:00",
        "pubNubHook": null
    },
    "oneTemplateTitle": "Criação de Excel",
    "onergyLog": {
        "log_fluxo": true,
        "logData": {
            "criar_linhas_calculo": true,
            "motor_calculo": true,
            "criacao_de_excel": true
        }
    },
    "ass_id": "88443605-74d6-4ea4-b426-a6c3e26aa615",
    "assid": "88443605-74d6-4ea4-b426-a6c3e26aa615",
    "email": "prod@atc.com.br",
    "fdtid": "997dd5cd-4125-4d83-b035-259049710a91",
    "fedid": "7bdb772e-c66c-4445-9e6c-0f21a132cc2c",
    "onergy_rolid": "",
    "timezone": null,
    "usrid": "40ddc5fc-2ef7-4b78-bcc4-5e2048d22331",
    "onergy_js_ctx": {
        "assid": "88443605-74d6-4ea4-b426-a6c3e26aa615",
        "fedid": "7bdb772e-c66c-4445-9e6c-0f21a132cc2c",
        "fdtid": "997dd5cd-4125-4d83-b035-259049710a91",
        "usrid": "40ddc5fc-2ef7-4b78-bcc4-5e2048d22331",
        "insertDt": "2023-06-25T20:12:19.275Z",
        "updateDt": "2023-06-25T20:15:21.538Z",
        "cur_userid": "40ddc5fc-2ef7-4b78-bcc4-5e2048d22331",
        "email": "prod@atc.com.br",
        "user_name": "prod@atc.com.br",
        "onergy_rolid": "",
        "praid": "eae09a06-8e2d-46b2-84be-a45f84ea1a88",
        "pcvid": "58780e12-423b-4fff-bf70-f7f7bda53041",
        "prcid": "3c17d734-8235-914f-9382-75e79ec29b16",
        "timezone": null,
        "timezone_value": "-03:00",
        "pubNubHook": null
    }
};

init(JSON.stringify(jsonInput));
