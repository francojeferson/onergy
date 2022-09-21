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
function sendItemToOnergy(templateid, usrid, assid, data, fedid) {
    let onergySaveData = {
        fdtid: templateid,
        assid: assid,
        usrid: usrid,
        data: JSON.stringify(data),
        //executeAction: false
    };
    if (fedid != undefined && fedid != '') {
        onergySaveData.id = fedid;
    }
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

function init(json) {
    let data = JSON.parse(json);
    let status_desc = '';
    const fdtidCargaTxt = 'ec1bfb59-ea0b-4d86-a50d-a85758d35504';
    const fdtidPagamentoFaturas = 'd30c5633-af5b-42b5-9d16-b1d4b6cbbb83';
    let link = data.txt_pagamentos[0].UrlAzure;
    let b64 = ConvertUrlFileToB64({ file: link });
    let b64txt = utils.GetTextFromBase64(b64);
    let arr = b64txt.split('\r\n').slice(2, -3);
    let arrSave = [];
    for (let i = 0; i < arr.length; i++) {
        // capturar itens da posiçao 201 a 207
        let arr_conta_de_debito = arr[i].substring(201, 207);
        arr_conta_de_debito = parseInt(arr_conta_de_debito).toString();
        // capturar itens da posiçao 150 a 168
        let arr_valor_lancamento = arr[i].substring(150, 168);
        arr_valor_lancamento = (arr_valor_lancamento / 100).toFixed(2);
        // salvar novo objeto
        objSave = {
            conta_de_debito: arr_conta_de_debito,
            valor_lancamento: arr_valor_lancamento,
        };
        arrSave.push(objSave);
    }

    if (arrSave !== null && arrSave.length > 0) {
        onergy.InsertManyOnergy(arrSave, fdtidPagamentoFaturas, data.usrid);
        status_desc = 'Concluido';
    } else {
        status_desc = 'ERRO, DOCUMENTO INDEFINIDO ';
    }
    let postInfo = {
        UrlJsonContext: {
            processamento: status_desc,
        },
    };

    let strFiltro = gerarFiltro('_id', data.id_upload_txt);
    /*onergy_updatemany*/
    onergy_updatemany({
        fdtid: fdtidCargaTxt,
        assid: data.onergy_js_ctx.assid,
        usrid: data.onergy_js_ctx.usrid,
        data: JSON.stringify(postInfo),
        filter: strFiltro,
    });

    //return true;
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

    var obj = {
        cond: cond,
        json: JSON.stringify(json),
        WaitingWebHook: WaitingWebHook,
    };
    return obj;
}
