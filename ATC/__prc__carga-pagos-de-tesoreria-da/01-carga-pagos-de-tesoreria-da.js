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
 * Nome Tarefa: Carga Pagos de Tesoreria - DA
 * ID: d035db55-a235-4159-b5db-5a17b053de16
 * Executar automático quando em processo: Sim
 * Atividade de longa duração: Não
 * Esconder Menu: Não
 * SLA: nenhum
 * Condicional: nenhum
 * Aprovação: nenhum
 ******************** NODE_SCRIPT ********************
 */
function init(json) {
    var data = JSON.parse(json);
    let result = {
        status: 'PROCESANDO',
        data_de_upload: utils.GetUserDtNow('yyyy-MM-dd HH:mm:ss'),
        data_de_uploadDate: utils.GetUserDtNow('yyyy-MM-dd HH:mm:ss'),
        arquivo: data.CPDA_carregar_arquivo_da_tesouraria,
    };

    return SetObjectResponse(true, result, false);
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
        cond: cond,
        WaitingWebHook: WaitingWebHook,
    };

    if (json && Object.keys(json).length > 0) {
        obj.json = JSON.stringify(json);
    }

    return obj;
}
/******************** MET_PADRAO ********************
 ******************** JSON_INIT ********************
 */
let json = {
    archivos: '',
    hora_da_carga: '06:56',
    CPDA_carregar_arquivo_da_tesouraria: [
        {
            Url: 'https://onebackupservices.blob.core.windows.net/67c0b77d-abae-4c48-ba4b-6c8faf27e14a/DEBITOS ENERO BANCO COLPATRIA REPORTE 1.xlsx2d3121d1-c812-40b4-ac60-e10d047e3d5b.xlsx?sv=2018-03-28&sr=b&sig=rUSCjeY%2FXlNahgvzJMAtJqDeozjJU6XR%2B%2FQCzmpJwNs%3D&se=2023-08-05T09%3A56%3A22Z&sp=r',
            UrlAzure:
                'https://onebackupservices.blob.core.windows.net/67c0b77d-abae-4c48-ba4b-6c8faf27e14a/DEBITOS ENERO BANCO COLPATRIA REPORTE 1.xlsx2d3121d1-c812-40b4-ac60-e10d047e3d5b.xlsx?sv=2018-03-28&sr=b&sig=rUSCjeY%2FXlNahgvzJMAtJqDeozjJU6XR%2B%2FQCzmpJwNs%3D&se=2023-08-05T09%3A56%3A22Z&sp=r',
            Name: 'DEBITOS ENERO BANCO COLPATRIA REPORTE 1.xlsx',
        },
    ],
    oneTemplateTitle: 'Archivos - DA',
    data_de_upload: '2023-01-17 06:56:52',
    data_de_uploadDate: '2023-01-17T09:56:52Z',
    status: 'PROCESANDO',
    ass_id: '67c0b77d-abae-4c48-ba4b-6c8faf27e14a',
    assid: '67c0b77d-abae-4c48-ba4b-6c8faf27e14a',
    email: 'adm@atc.com.br',
    fdtid: '93e63d10-d356-4301-8909-9bba81ba1653',
    fedid: 'ec6195d1-e7b3-b717-74b2-5aff91020d43',
    onergy_rolid: '',
    timezone: null,
    usrid: '1ec86197-d331-483a-b325-62cc26433ea5',
    onergy_js_ctx: {
        assid: '67c0b77d-abae-4c48-ba4b-6c8faf27e14a',
        fedid: 'ec6195d1-e7b3-b717-74b2-5aff91020d43',
        fdtid: '93e63d10-d356-4301-8909-9bba81ba1653',
        usrid: '1ec86197-d331-483a-b325-62cc26433ea5',
        insertDt: '2023-01-17T09:56:49.924Z',
        updateDt: '2023-01-17T09:56:52.357Z',
        cur_userid: '1ec86197-d331-483a-b325-62cc26433ea5',
        email: 'adm@atc.com.br',
        user_name: 'ADM ATC',
        onergy_rolid: '',
        praid: 'edd996d2-f463-4fbc-94af-3955d767f994',
        pcvid: 'be0b5d8d-601b-4ced-a96f-383c3f73c273',
        prcid: 'c019f8a6-6a6d-fb8f-c9ac-2ae0b69cb707',
        timezone: null,
        timezone_value: '-03:00',
        pubNubHook: null,
    },
};
init(JSON.stringify(json));
