/**ENV_NODE** =====================================================================================
 */
const { date } = require('assert-plus');
const { formatDate } = require('tough-cookie');
const { log, debug } = require('console');
const { memory } = require('console');
const { resolve } = require('path');
const { type } = require('os');
const axios = require('axios');
const fs = require('fs');
const jsuser = require('../onergy/onergy-utils');
const onergy = require('../onergy/onergy-client');
const utils = require('../onergy/onergy-utils');
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
 * Esconder Menu: Sim
 * Condicional: nenhum
 * Aprovação: nenhum
 */
async function init(json) {
    let data = JSON.parse(json);

    const buscarFeriados = async (data) => {
        let feriadoAno = await getOnergyItem(feriadosAnosID, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
        let feriadoDias = await (async () => {
            let filtroFeriadosDias = JSON.stringify([
                { FielName: 'ID_ONE_REF', Type: 'string', FixedType: 'string', Value1: feriadoAno.map((VALUE) => VALUE.ID) },
            ]);
            return await getOnergyItem(feriadosDiasID, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, filtroFeriadosDias);
        })();
        debugger;
    };

    buscarFeriados(data);
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
async function getOnergyItem(fdtid, assid, usrid, filtro) {
    let keepSearching = true;
    let skip = 0;
    let take = 500;
    let result = [];
    while (keepSearching) {
        let strPageResp = await onergy_get({
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
/**MET_PADRAO =====================================================================================
 */
let json = {
    planilla_legalizacion_y_pago: null,
    seleccion_de_carga: null,
    CDE__atualizar_status_legalizacao: '0',
    CDE__atualizar_status_pagamento: '0',
    cargar_excel: ' ',
    registro_salvo: 'sim',
    CDE__atualizar_status_legalizacao_desc: 'Não',
    CDE__atualizar_status_pagamento_desc: 'Não',
    oneTemplateTitle: '',
    ass_id: '67c0b77d-abae-4c48-ba4b-6c8faf27e14a',
    assid: '67c0b77d-abae-4c48-ba4b-6c8faf27e14a',
    fedid: 'dcc3884c-4d50-e0d7-fae7-bf940393d159',
    fdtid: '8a46f1a6-e2ae-48a2-9480-352493d9cb17',
    usrid: '0c44d4fc-d654-405b-9b8f-7fea162948b5',
    email: 'admin-colombia@atc.com.co',
    onergy_rolid: 'e4d0298c-245e-454a-89d4-8f27aef8645b',
    timezone: null,
    onergy_js_ctx: {
        assid: '67c0b77d-abae-4c48-ba4b-6c8faf27e14a',
        fedid: 'dcc3884c-4d50-e0d7-fae7-bf940393d159',
        fdtid: '8a46f1a6-e2ae-48a2-9480-352493d9cb17',
        usrid: '0c44d4fc-d654-405b-9b8f-7fea162948b5',
        insertDt: '2022-11-22T16:57:33.735Z',
        updateDt: '2022-11-22T16:57:33.735Z',
        cur_userid: '0c44d4fc-d654-405b-9b8f-7fea162948b5',
        email: 'admin-colombia@atc.com.co',
        user_name: 'Administrador Colômbia',
        onergy_rolid: 'e4d0298c-245e-454a-89d4-8f27aef8645b',
        praid: '59910694-7660-4d0e-82d4-a554f3e46625',
        pcvid: '9d68648b-b3e7-4e88-a185-24f33a61ca86',
        prcid: '2c136341-fc64-c751-5cf4-0b92500c7a1e',
        timezone: null,
        timezone_value: '-03:00',
        pubNubHook: null,
    },
};
init(JSON.stringify(json));
