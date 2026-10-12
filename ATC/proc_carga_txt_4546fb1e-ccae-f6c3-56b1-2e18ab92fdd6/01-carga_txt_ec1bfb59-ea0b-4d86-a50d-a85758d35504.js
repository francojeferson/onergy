//!NODE_ENV ===
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
    const r = await onergy.onergy_get(args);
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

//!SCRIPT ===
function init(json) {
    var data = JSON.parse(json);
    let execCargTXTFdtId = 'ed69017f-8437-4b9d-b0d6-54318d3d71e5'; // id do proximo card do processo
    data.processamento = 'Processando';

    data.id_upload_txt = data.onergy_js_ctx.fedid;

    let itemPost = {};
    itemPost.data = JSON.stringify(data);
    itemPost.assid = data.onergy_js_ctx.assid;
    itemPost.fdtid = execCargTXTFdtId;
    itemPost.usrid = data.onergy_js_ctx.usrid;
    onergy_save(itemPost);
    //return true;
    return SetObjectResponse(true, data, true);
}

function initBefore(json) {
    //return true;
}

function initDelete(json) {
    let data = JSON.parse(json);
    var idSalvo = data.id_do_card; // id do card onde será gravado os registros
    let postInfoDelet = {
        UrlJsonContext: {
            id_user_resp_delet: data.usrid,
        },
        BlockCount: 1,
    };
    let excluirFilter = JSON.stringify([{ FielName: 'id_upload_txt', Type: 'string', FixedType: 'string', Value1: data.onergy_js_ctx.fedid }]);
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
    var obj = {
        cond: cond,
        json: JSON.stringify(json),
        WaitingWebHook: WaitingWebHook,
    };
    return obj;
}
