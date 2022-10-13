/**NODE_ENV ===
 */
let { date } = require('assert-plus');
let { formatDate } = require('tough-cookie');
let { log } = require('console');
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
function onergy_updatemany(data) {
    return data;
}
function successCallback(result) {
    console.log('It succeeded with ' + result);
}

/**SCRIPT ===
 * Executar automático quando em processo: Não
 * Atividade de longa duração: Não
 * Esconder Menu: Sim
 * Condicional: nenhum
 * Aprovação: nenhum
 */
async function init(json) {
    let data = JSON.parse(json);
    let execCargExcelFdtId = '0e8dc4f0-4a4f-4fb1-8268-423b45128203';
    data.processamento = 'Procesando'`${data.load_index_tab_excel}`;

    data.id_upload_planilha = data.onergy_js_ctx.fedid;

    let itemPost = {};
    itemPost.data = JSON.stringify(data);
    itemPost.assid = data.onergy_js_ctx.assid;
    itemPost.fdtid = execCargExcelFdtId;
    itemPost.usrid = data.onergy_js_ctx.usrid;
    await onergy_save(itemPost);
    //return true;
    return SetObjectResponse(true, data, true);
}
function initBefore(json) {
    //return true;
}
async function initDelete(json) {
    let data = JSON.parse(json);
    let idSalvo = data.load_index_id_do_card;
    let postInfoDelet = {
        UrlJsonContext: {
            id_user_resp_delet: data.usrid,
        },
        BlockCount: 1,
    };
    let excluirFilter = JSON.stringify([{ FielName: 'id_upload_planilha', Type: 'string', FixedType: 'string', Value1: data.onergy_js_ctx.fedid }]);
    onergy_updatemany({
        fdtid: idSalvo,
        assid: data.onergy_js_ctx.assid,
        usrid: data.onergy_js_ctx.usrid,
        data: JSON.stringify(postInfoDelet),
        filter: excluirFilter,
        isMultiUpdate: true,
    });
    return true;
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

/**METODOS PADRAO ===
 */
let json = {
    load_index_equipe: 'COL',
    load_index_id_do_card: '55ec978d-7dbe-4a6f-8cb4-536b53361d54',
    planilha: [
        {
            Url: 'https://onebackupservices.blob.core.windows.net/67c0b77d-abae-4c48-ba4b-6c8faf27e14a/tablas_maestras.xlsxa347cd75-cda2-4054-b50e-cd2920750eb9.xlsx?sv=2018-03-28&sr=b&sig=MUgbTYDYvWmpzrxHesdEiPTz%2FjfThsbiMWrbLoJ8aAw%3D&se=2023-04-29T15%3A30%3A06Z&sp=r',
            UrlAzure:
                'https://onebackupservices.blob.core.windows.net/67c0b77d-abae-4c48-ba4b-6c8faf27e14a/tablas_maestras.xlsxa347cd75-cda2-4054-b50e-cd2920750eb9.xlsx?sv=2018-03-28&sr=b&sig=MUgbTYDYvWmpzrxHesdEiPTz%2FjfThsbiMWrbLoJ8aAw%3D&se=2023-04-29T15%3A30%3A06Z&sp=r',
            Name: 'tablas_maestras.xlsx',
        },
    ],
    load_index_tab_excel: 'categorias',
    load_index_id: '72adb5cf-cbdc-4887-bedf-0ba2239e36dc',
    em_caso_de_duplicidade: '1',
    em_caso_de_duplicidade_desc: 'Sobrescribir',
    ass_id: '67c0b77d-abae-4c48-ba4b-6c8faf27e14a',
    assid: '67c0b77d-abae-4c48-ba4b-6c8faf27e14a',
    email: 'admin-colombia@atc.com.co',
    fdtid: '181c67a8-e7a9-4c9a-9ea1-ca4719c0e23f',
    fedid: 'be530235-fdad-2222-14b8-94adf6be7b8b',
    onergy_rolid: 'e4d0298c-245e-454a-89d4-8f27aef8645b',
    timezone: null,
    usrid: '0c44d4fc-d654-405b-9b8f-7fea162948b5',
};

init(JSON.stringify(json));
