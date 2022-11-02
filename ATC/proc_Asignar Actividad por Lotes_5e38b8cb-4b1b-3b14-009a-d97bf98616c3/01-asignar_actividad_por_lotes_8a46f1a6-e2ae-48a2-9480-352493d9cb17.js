/**ENV_NODE**
 * node:test (find and replace)
 * /*async*/ /**
 * /*await*/ /**
 */
const { date } = require('assert-plus');
const { formatDate } = require('tough-cookie');
const { log, debug } = require('console');
const { memory } = require('console');
const { resolve } = require('path');
const { type } = require('os');
const axios = require('axios');
const fs = require('fs');
const jsuser = require('../../onergy/onergy-utils');
const onergy = require('../../onergy/onergy-client');
const utils = require('../../onergy/onergy-utils');
/*async*/ function ajax(args) {
    return /*await*/ onergy.ajax(args);
}
/*async*/ function ajaxPost(args) {
    return /*await*/ onergy.ajaxPost(args);
}
/*async*/ function hashMd5(args) {
    return /*await*/ onergy.hashMd5(args);
}
/*async*/ function increment(args) {
    return /*await*/ onergy.increment(args);
}
/*async*/ function onergy_countdocs(args) {
    return /*await*/ onergy.onergy_countdocs(args);
}
/*async*/ function onergy_get(args) {
    let r = /*await*/ onergy.onergy_get(args);
    return JSON.stringify(r);
}
/*async*/ function onergy_save(args) {
    return /*await*/ onergy.onergy_save(args);
}
/*async*/ function ReadExcelToJson(args) {
    return /*await*/ onergy.ReadExcelToJson(args);
}
/*async*/ function ReadTextPdf(args) {
    return /*await*/ onergy.ReadTextPdf(args);
}
/*async*/ function sendmail(args) {
    return /*await*/ onergy.sendmail(args);
}
/*async*/ function onergy_sendto(args) {
    let r = /*await*/ onergy.onergy_sendto(args);
    return JSON.stringify(r);
}
/*async*/ function onergy_updatemany(data) {
    return data;
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
/**CLI_SCRIPT**
 * Executar automático quando em processo: Não
 * Atividade de longa duração: Não
 * Esconder Menu: Sim
 * Condicional: nenhum
 * Aprovação: nenhum
 */
/*async*/ function getOnergyItem(fdtid, assid, usrid, filtro) {
    let keepSearching = true;
    let skip = 0;
    let take = 500;
    let result = [];
    while (keepSearching) {
        let strPageResp = /*await*/ onergy_get({
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
/*async*/ function sendItemToOnergy(templateid, usrid, assid, data, fedid, ukField, checkTemplateDuplicate, addCfgViewGroup, execAction) {
    let onergySaveData = {
        fdtid: templateid,
        assid: assid,
        usrid: usrid,
        data: JSON.stringify(data),
        //executeAction: false
    };
    if (!execAction) {
        onergySaveData.executeAction = false;
    }
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
        onergySaveData.addCfgViewGroup = addCfgViewGroup;
    }
    return /*await*/ onergy_save(onergySaveData);
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
/*async*/ function init(json) {
    let data = JSON.parse(json);

    let idSeleccionDeCarga = 'ec2d14aa-a0c9-4e33-8856-4e16d703f0b8';
    let getSeleccionDeCarga = /*await*/ getOnergyItem(idSeleccionDeCarga, data.assid, data.usrid, null);

    let idCargarExcel = 'af7df2b1-1962-4157-bd19-4c70271945ca';
    let getCargarExcel = /*await*/ getOnergyItem(idCargarExcel, data.assid, data.usrid, null);

    let idAsignarActividadPorLotes = '8a46f1a6-e2ae-48a2-9480-352493d9cb17';
    let getAsignarActividadPorLotes = /*await*/ getOnergyItem(idAsignarActividadPorLotes, data.assid, data.usrid, null);

    for (let i in getAsignarActividadPorLotes) {
        let item = getAsignarActividadPorLotes[i].UrlJsonContext;
        if (item.CDE__atualizar_status_legalizacao == '1') {
            //TODO: atualizar Estado Legalizacion == ENVIADO
        }
        if (item.CDE__atualizar_status_pagamento == '1') {
            //TODO: se Valor Pago Parcial == 0, atualizar Estado Pago == ENVIADO TOTAL
            //TODO: se Valor Pago Parcial != 0, atualizar Estado Pago == ENVIADO PARCIAL
        }
        debugger;
    }

    // return true;
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
/**STD_METHODS**
 */
let json = {
    planilla_legalizacion_y_pago: null,
    seleccion_de_carga: null,
    CDE__atualizar_status_legalizacao: '1',
    CDE__atualizar_status_pagamento: '1',
    CDE__mes_processo: 'nov',
    forma_de_pagamento: null,
    ESTLlegalizacao_do_status_id: ['2fca9ef9-6b49-6f7a-ce52-3ad1a426244a'],
    ESTLstatus__legalizacao_do_status: ['PARA ANALISIS'],
    ESTPstatus_pagamento_id: ['70aa7e30-a2b8-90ef-ae4f-0b5ab5148cb1'],
    ESTPstatus__status_pagamento: ['PENDIENTE'],
    data_inicio_pagamento: null,
    data_fim_pagamento: null,
    CDE__ultima_captura: null,
    tipo_de_conta: null,
    cargar_excel: ' ',
    registro_salvo: 'sim',
    CDE__atualizar_status_legalizacao_desc: 'Sim',
    CDE__atualizar_status_pagamento_desc: 'Sim',
    oneTemplateTitle: '',
};
let idATC = {
    assid: '67c0b77d-abae-4c48-ba4b-6c8faf27e14a',
    usrid: '0c44d4fc-d654-405b-9b8f-7fea162948b5',
};
json = Object.assign(json, idATC);
init(JSON.stringify(json));
