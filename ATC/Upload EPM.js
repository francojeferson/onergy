const { JSDOM } = require("jsdom");
const { window } = new JSDOM("");
const $ = require("jquery")(window);
const axios = require('axios');
const fs = require('fs');


const { date, func } = require('assert-plus');
const { type } = require('os');
const { formatDate } = require('tough-cookie');
var onergy = require('../onergy/onergy-client');
// let UriJSONSubscriptionConfig = "C:/Users/TallesAndrade/Documents/Onergy Local/SubscriptionConfig.json";
const bodyParser = require('body-parser');

replaceAll = function (content, needle, replacement) {
    return content.split(needle).join(replacement);
};

async function ReadExcelToJson(args) {
    return await onergy.ReadExcelToJson(args);
}

async function onergy_get(args) {
    var r = await onergy.onergy_get(args);
    return JSON.stringify(r);
}

async function hashMd5(args) {
    return await onergy.hashMd5(args);
}

async function onergy_save(args) {
    return await onergy.onergy_save(args);
}

async function onergy_updatemany(args) {
    return await onergy.onergy_save(args);
}

async function sendmail(args) {
    return await onergy.sendmail(args);
}

async function increment(args) {
    return await onergy.increment(args);
}

class Memory {
    valMemory = [];
    TryAdd(key, value, time) {
        var exist = false;
        for (let s in this.valMemory) {
            if (this.valMemory[s].key == key) {
                exist = true;
            }
        }
        if (exist) {
            return false;
        } else {
            this.valMemory.push({ 'key': key, 'value': value, 'time': time });
            return true;
        }
    }
    Remove(key) {

    }
}
let memory = new Memory();

class Utils {
    GetUserDtNow(format) {
        let dataAtual = new Date();
        let ano = dataAtual.getFullYear();
        let mes = ((dataAtual.getMonth() + 1).toString().padStart(2, 0));
        let dia = (dataAtual.getDate().toString().padStart(2, 0));
        let horas = (dataAtual.getHours()).toString().padStart(2, 0);
        let minutos = (dataAtual.getMinutes()).toString().padStart(2, 0);
        let segundos = (dataAtual.getSeconds()).toString().padStart(2, 0);
        return `${ano}-${mes}-${dia} ${horas}:${minutos}:${segundos}`;
    }

    sleep(milliseconds) {
        var start = new Date().getTime();
        for (var i = 0; i < 1e7; i++) {
            if ((new Date().getTime() - start) > milliseconds) {
                break;
            }
        }
    }

}
let utils = new Utils();

function get_usr_tmz_dt_now(args) {
    let dataAtual = new Date();
    let ano = dataAtual.getFullYear();
    let mes = ((dataAtual.getMonth() + 1).toString().padStart(2, 0));
    let dia = (dataAtual.getDate().toString().padStart(2, 0));
    return `${ano}-${mes}-${dia} 00:00:00`;
}

async function onergy_countdocs(args) {
    let result = await getOnergyItem(args["fdtid"], args["assid"], args["usrid"], args["filter"]);
    return result.length;
}

function ConvertUrlFileToB64(args) {
    return "VGVzdGUNClRlc3RlDQpUZXN0ZQ0KVGVzdGUNClRlc3RlDQpUZXN0ZQ0KVGVzdGU=";
}

/*
=============================   SCRIPT    =============================
*/
let faturasFilhasID = "11bb183c-d30d-4ed9-af2d-286b2dcb1a89";

async function init(json) {
    let data = JSON.parse(json);

    let dataExcel = await (async () => {
        try {
            let stringDataExcel = await ReadExcelToJson({ url: encodeURI(data.Url) });
            let jsonParse = JSON.parse(stringDataExcel);
            return jsonParse;
        } catch (err) {
            return null;
        }
    })();
    if (!dataExcel?.Plan1?.length > 0) { return; }

    for (let VALUE of dataExcel.Plan1) {
        let postInfo = {
            "conta_interna_nic": VALUE["Cuenta Interna (NIC)"]?.toString(),
            "numero_da_nota_fiscal": VALUE["Numero de Factura"]?.toString(),
            "nit_provedor": VALUE["NIT Provedor"]?.toString(),
            "data_emissao": getISODate(VALUE["Fecha de Expedición"]),
            "data_inicio_pagamento": getISODate(VALUE["Inicio de Cobro"]),
            "data_fim_pagamento": getISODate(VALUE["Final de Cobro"]),
            "numero_do_medidor": VALUE["No Medidor"]?.toString(),
            "tipo_de_leitura": VALUE["Tipo Lectura"],
            "data_vencimento": getISODate(VALUE["Pago Oportuno"]),
            "valor_total_informado": Number(VALUE["TOTAL FACTURA"]) ? Number(VALUE["TOTAL FACTURA"]) : 0,
            "valor_energia": Number(VALUE["TOTAL ENERGIA"]) ? Number(VALUE["TOTAL ENERGIA"]) : 0,
            "energia_de_contribuicao": Number(VALUE["Contribuicion Energia"]) ? Number(VALUE["Contribuicion Energia"]) : 0,
            "taxa_de_iluminacao": Number(VALUE["Alumbrado Publico"]) ? Number(VALUE["Alumbrado Publico"]) : 0,
            "compensacao_de_energia": Number(VALUE["Compensaciones de Energia"]) ? Number(VALUE["Compensaciones de Energia"]) : 0,
            "reliquidacoes": Number(VALUE["Reliquidaciones"]) ? Number(VALUE["Reliquidaciones"]) : 0,
            "outras_energias": Number(VALUE["OTROS ENERGIAS"]) ? Number(VALUE["OTROS ENERGIAS"]) : 0,
            "reajuste": Number(VALUE["Ajuste"]) ? Number(VALUE["Ajuste"]) : 0,
            "agua_e_esgoto": Number(VALUE["Aseo / Acueducto"]) ? Number(VALUE["Aseo / Acueducto"]) : 0,
            "imposto_de_vigilancia": Number(VALUE["Vigilancia"]) ? Number(VALUE["Vigilancia"]) : 0,
            "juros_de_mora": Number(VALUE["Intereses de Mora"]) ? Number(VALUE["Intereses de Mora"]) : 0,
            "financiamentos": Number(VALUE["Financiación"]) ? Number(VALUE["Financiación"]) : 0,
            "reconexao": Number(VALUE["Reconexión"]) ? Number(VALUE["Reconexión"]) : 0,
            "taxa_de_conexao": Number(VALUE["Tarifa de conexión"]) ? Number(VALUE["Tarifa de conexión"]) : 0,
            "aluguel_do_medidor": Number(VALUE["Alquiler de contadores"]) ? Number(VALUE["Alquiler de contadores"]) : 0,
            "iva": Number(VALUE["IVA"]) ? Number(VALUE["IVA"]) : 0,
            "consumo_kwh": Number(VALUE["Consumo KWH"]) ? Number(VALUE["Consumo KWH"]) : 0,
            "valor_kwh": Number(VALUE["Tarifa"]) ? Number(VALUE["Tarifa"]) : 0
        };
        postInfo.cargaHash = await hashMd5({ content: JSON.stringify(postInfo) });
        console.log(JSON.stringify(postInfo));

        let filtroFaturaCarga = gerarFiltro("cargaHash", postInfo.cargaHash);
        let faturaCarga = await getOnergyItem(faturasFilhasID, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, filtroFaturaCarga);
        if (faturaCarga.length > 0) { continue; }

        await sendItemToOnergy(faturasFilhasID, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, postInfo);
    }
    debugger;
}

function initBefore(json) {
    //return true;
}

function initDelete(json) {
    //return true;
}

function SetObjectResponse(cond, json, WaitingWebHook) {
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
    "Url": "https://onebackupservices.blob.core.windows.net/67c0b77d-abae-4c48-ba4b-6c8faf27e14a/Planilha Fatura.xlsxac1746ba-c12d-439d-be99-3bf84ad753a5.xlsx?sv=2018-03-28&sr=b&sig=W8mu3Bc9keKgDmcAikez4wTeMip5gZ5mmqK6JaQQWMM%3D&se=2023-10-31T13%3A11%3A32Z&sp=r", // carga telemedidas
    "onergy_js_ctx": {
        "assid": "67c0b77d-abae-4c48-ba4b-6c8faf27e14a",
        "fedid": "3b156c58-6363-d6ec-8fc6-b901c020b6b9",
        "fdtid": "4ebec026-ac41-4d3c-bbc9-6733a324b23f",
        "usrid": "1ec86197-d331-483a-b325-62cc26433ea5",
        "insertDt": "2023-04-14T12:36:53.093Z",
        "updateDt": "2023-04-14T12:36:58.547Z",
        "cur_userid": "1ec86197-d331-483a-b325-62cc26433ea5",
        "email": "adm@atc.com.br",
        "user_name": "ADM ATC",
        "onergy_rolid": "",
        "praid": "67b450dd-6684-4e21-bdc1-4489934f8f2b",
        "pcvid": "f4f92286-d6d7-457e-bf95-251e551a9cc6",
        "prcid": "e835dece-2488-1ee5-60dd-b45b12104189",
        "timezone": null,
        "timezone_value": "-03:00",
        "pubNubHook": null
    }
};

init(JSON.stringify(jsonInput));
