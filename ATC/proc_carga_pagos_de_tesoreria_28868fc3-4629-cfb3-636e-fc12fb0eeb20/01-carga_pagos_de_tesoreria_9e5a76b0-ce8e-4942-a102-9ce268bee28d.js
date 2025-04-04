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
 * Esconder Menu: Não
 * Condicional: nenhum
 * Aprovação: nenhum
 */
function init(json) {
    var data = JSON.parse(json);
    let result = {
        status: 'PROCESANDO',
        data_de_upload: utils.GetUserDtNow('yyyy-MM-dd HH:mm:ss'),
        data_de_uploadDate: utils.GetUserDtNow('yyyy-MM-dd HH:mm:ss'),
        aquivo: data.CPDT_carregar_arquivo_da_tesouraria,
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
/**MET_PADRAO =====================================================================================
 */
let json = {
    archivos: '',
    hora_da_carga: '06:58',
    CPDT_carregar_arquivo_da_tesouraria: [
        {
            Url: 'https://onebackupservices.blob.core.windows.net/67c0b77d-abae-4c48-ba4b-6c8faf27e14a/DEBITOS ENERO BANCO COLPATRIA REPORTE 1.xlsxfb6457e7-0747-48af-825a-490ce88dad10.xlsx?sv=2018-03-28&sr=b&sig=kjJC71SPgsgTOsrOZSNhysIxUyOmfcdE4eLlrmRhWuQ%3D&se=2023-08-05T09%3A58%3A37Z&sp=r',
            UrlAzure:
                'https://onebackupservices.blob.core.windows.net/67c0b77d-abae-4c48-ba4b-6c8faf27e14a/DEBITOS ENERO BANCO COLPATRIA REPORTE 1.xlsxfb6457e7-0747-48af-825a-490ce88dad10.xlsx?sv=2018-03-28&sr=b&sig=kjJC71SPgsgTOsrOZSNhysIxUyOmfcdE4eLlrmRhWuQ%3D&se=2023-08-05T09%3A58%3A37Z&sp=r',
            Name: 'DEBITOS ENERO BANCO COLPATRIA REPORTE 1.xlsx',
        },
    ],
    oneTemplateTitle: 'Archivos - PA',
    aquivo: [
        {
            Url: 'https://onebackupservices.blob.core.windows.net/67c0b77d-abae-4c48-ba4b-6c8faf27e14a/DEBITOS ENERO BANCO COLPATRIA REPORTE 1.xlsxfb6457e7-0747-48af-825a-490ce88dad10.xlsx?sv=2018-03-28&sr=b&sig=kjJC71SPgsgTOsrOZSNhysIxUyOmfcdE4eLlrmRhWuQ%3D&se=2023-08-05T09%3A58%3A37Z&sp=r',
            UrlAzure:
                'https://onebackupservices.blob.core.windows.net/67c0b77d-abae-4c48-ba4b-6c8faf27e14a/DEBITOS ENERO BANCO COLPATRIA REPORTE 1.xlsxfb6457e7-0747-48af-825a-490ce88dad10.xlsx?sv=2018-03-28&sr=b&sig=kjJC71SPgsgTOsrOZSNhysIxUyOmfcdE4eLlrmRhWuQ%3D&se=2023-08-05T09%3A58%3A37Z&sp=r',
            Name: 'DEBITOS ENERO BANCO COLPATRIA REPORTE 1.xlsx',
        },
    ],
    data_de_upload: '2023-01-17 06:58:49',
    data_de_uploadDate: '2023-01-17T09:58:49Z',
    status: 'PROCESANDO',
    ass_id: '67c0b77d-abae-4c48-ba4b-6c8faf27e14a',
    assid: '67c0b77d-abae-4c48-ba4b-6c8faf27e14a',
    email: 'adm@atc.com.br',
    fdtid: 'e966c904-9be6-4028-b0e1-b83164b1bde0',
    fedid: 'fa58f65f-10ea-70c3-bc85-87107cb8ab8a',
    onergy_rolid: '',
    timezone: null,
    usrid: '1ec86197-d331-483a-b325-62cc26433ea5',
    onergy_js_ctx: {
        assid: '67c0b77d-abae-4c48-ba4b-6c8faf27e14a',
        fedid: 'fa58f65f-10ea-70c3-bc85-87107cb8ab8a',
        fdtid: 'e966c904-9be6-4028-b0e1-b83164b1bde0',
        usrid: '1ec86197-d331-483a-b325-62cc26433ea5',
        insertDt: '2023-01-17T09:58:47.163Z',
        updateDt: '2023-01-17T09:58:49.545Z',
        cur_userid: '1ec86197-d331-483a-b325-62cc26433ea5',
        email: 'adm@atc.com.br',
        user_name: 'ADM ATC',
        onergy_rolid: '',
        praid: '9da26490-35a3-4997-b477-e66f4444f0a4',
        pcvid: '33a7a5ea-7a1c-472b-a9b0-35a6d7cc0e6a',
        prcid: '28868fc3-4629-cfb3-636e-fc12fb0eeb20',
        timezone: null,
        timezone_value: '-03:00',
        pubNubHook: null,
    },
};
init(JSON.stringify(json));
