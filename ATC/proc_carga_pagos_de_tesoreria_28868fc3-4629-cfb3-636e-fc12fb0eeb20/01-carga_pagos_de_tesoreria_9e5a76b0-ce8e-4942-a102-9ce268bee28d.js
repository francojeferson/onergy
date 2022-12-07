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
    a: 1,
    oneTemplateTitle: '',
    ass_id: '67c0b77d-abae-4c48-ba4b-6c8faf27e14a',
    assid: '67c0b77d-abae-4c48-ba4b-6c8faf27e14a',
    fedid: '62e956e5-f2eb-4643-bcfb-f73dd7eb955c',
    fdtid: '51f0ba7e-35cc-4167-8e4e-da9f52972822',
    usrid: '0c44d4fc-d654-405b-9b8f-7fea162948b5',
    email: 'admin-colombia@atc.com.co',
    onergy_rolid: 'e4d0298c-245e-454a-89d4-8f27aef8645b',
    timezone: null,
    onergy_js_ctx: {
        assid: '67c0b77d-abae-4c48-ba4b-6c8faf27e14a',
        fedid: '62e956e5-f2eb-4643-bcfb-f73dd7eb955c',
        fdtid: '51f0ba7e-35cc-4167-8e4e-da9f52972822',
        usrid: '0c44d4fc-d654-405b-9b8f-7fea162948b5',
        insertDt: '2022-12-06T12:54:27.035Z',
        updateDt: '2022-12-06T12:54:27.035Z',
        cur_userid: '0c44d4fc-d654-405b-9b8f-7fea162948b5',
        email: 'admin-colombia@atc.com.co',
        user_name: 'Administrador Colômbia',
        onergy_rolid: 'e4d0298c-245e-454a-89d4-8f27aef8645b',
        praid: '25dd5bdb-2c5c-4df0-9810-f8eb8d244b87',
        pcvid: '388b1790-14b8-4312-a249-ec36040e298b',
        prcid: '0a17be9c-1247-2f1e-b91c-15740976f2c5',
        timezone: null,
        timezone_value: '-03:00',
        pubNubHook: null,
    },
};
init(JSON.stringify(json));
