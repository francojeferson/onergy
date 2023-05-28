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
    "pstr_sequecial_passthru": "PASS202300030",
    "pstr_usuario_de_criacao": "ADM ATC",
    "data_de_criacao_pstrDate": "2023-05-27T20:05:17Z",
    "data_de_criacao_pstr": "2023-05-27 17:05:17",
    "pstr_hora_criacao": "17:05",
    "pstr_status_processo": "ENVIADO A PROCESO",
    "pstr_ids_faturas_selecionadas": "",
    "onergy_js_ctx_ORIGINAL": {
        "assid": "67c0b77d-abae-4c48-ba4b-6c8faf27e14a",
        "fedid": "23bcc47f-aab1-8bb2-3cd3-71e63ff551e8",
        "fdtid": "06456424-a022-46a3-93b9-67e65eb31726",
        "usrid": "1ec86197-d331-483a-b325-62cc26433ea5",
        "insertDt": "2023-05-27T20:04:05.947Z",
        "updateDt": "2023-05-27T20:04:05.947Z",
        "cur_userid": "1ec86197-d331-483a-b325-62cc26433ea5",
        "email": "adm@atc.com.br",
        "user_name": "ADM ATC",
        "onergy_rolid": "",
        "praid": "1513e76f-a9ce-4f1f-a387-207bed950359",
        "pcvid": "d5d667c9-3937-4e95-a76f-4623f4d86768",
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
    "ass_id": "67c0b77d-abae-4c48-ba4b-6c8faf27e14a",
    "assid": "67c0b77d-abae-4c48-ba4b-6c8faf27e14a",
    "email": "adm@atc.com.br",
    "fdtid": "997dd5cd-4125-4d83-b035-259049710a91",
    "fedid": "619eaf2b-3597-4baf-a99f-fcd2b8269e27",
    "onergy_rolid": "",
    "timezone": null,
    "usrid": "1ec86197-d331-483a-b325-62cc26433ea5",
    "onergy_js_ctx": {
        "assid": "67c0b77d-abae-4c48-ba4b-6c8faf27e14a",
        "fedid": "619eaf2b-3597-4baf-a99f-fcd2b8269e27",
        "fdtid": "997dd5cd-4125-4d83-b035-259049710a91",
        "usrid": "1ec86197-d331-483a-b325-62cc26433ea5",
        "insertDt": "2023-05-27T20:04:12.45Z",
        "updateDt": "2023-05-27T20:04:44.455Z",
        "cur_userid": "1ec86197-d331-483a-b325-62cc26433ea5",
        "email": "adm@atc.com.br",
        "user_name": "ADM ATC",
        "onergy_rolid": "",
        "praid": "12c04a7d-50df-4fe8-9d94-befbf338e834",
        "pcvid": "d5d667c9-3937-4e95-a76f-4623f4d86768",
        "prcid": "3c17d734-8235-914f-9382-75e79ec29b16",
        "timezone": null,
        "timezone_value": "-03:00",
        "pubNubHook": null
    }
};

init(JSON.stringify(jsonInput));
