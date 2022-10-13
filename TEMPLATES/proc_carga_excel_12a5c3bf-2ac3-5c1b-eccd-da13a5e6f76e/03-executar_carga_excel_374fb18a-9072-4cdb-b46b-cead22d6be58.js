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
async function getOnergyItem(fdtid, assid, usrid, filtro) {
    let keepSearching = true;
    let skip = 0;
    take = 500;
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
    return JSON.stringify(result);
}

async function init(json) {
    const data = JSON.parse(json);

    let fdtdIdPost = data.CDPE_id_card;

    let arrayPost = [];

    let strArrExcel = await ReadExcelToJson({
        url: data.upload_planilha[0].UrlAzure,
    });

    let dataExcel = JSON.parse(strArrExcel);
    let tabExcel = data.load_index_tab_excel;

    if (dataExcel != null) {
        let nomePlanilha = data.upload_planilha[0].Name;
        let idPlanilha = data.id_upload_planilha;

        let ctxExcel = dataExcel['DADOS_CARGA_EXCEL'];

        if (ctxExcel.length > 0) {
            let arrayObj = ctxExcel[0];

            let fielName = Object.keys(arrayObj);

            for (let x in ctxExcel) {
                let objLine = {
                    nomePlanilhaCarga: nomePlanilha,
                    id_upload_planilha: idPlanilha,
                };

                for (let n in fielName) {
                    let name = fielName[n];
                    let val = ctxExcel[x];
                    objLine[name] = val[name];
                }

                arrayPost.push(objLine);
            }
        } else {
            let postInfo = {
                UrlJsonContext: {
                    status_planilha: 'Erro',
                    status_planilha_desc: 'erro',
                    mensagem_erro: 'Não foi encontrado nenhuma aba com o nome "DADOS_CARGA_EXCEL".',
                },
            };
            await onergy_updatemany({
                fdtid: '8b7dc946-2993-44e9-932a-947b77eb44cf',
                assid: data.onergy_js_ctx.assid,
                usrid: data.onergy_js_ctx.usrid,
                data: JSON.stringify(postInfo),
                filter: JSON.stringify([{ FielName: '_id', Type: 'string', FixedType: 'string', Value1: data.id_upload_planilha }]),
                isMultiUpdate: false,
            });

            return true;
        }

        let qtdReg = 0;
        if (arrayPost.length > 0) {
            // validar se existe configuração de duplicidade
            let configDupli = dataExcel['config_duplicidade'];

            qtdReg = arrayPost.length;

            /*
            for (var recIndex in arrayPost) {
                var dta = arrayPost[recIndex];
                let onergySaveData = {
                    fdtid: fdtdIdPost,
                    assid: data.onergy_js_ctx.assid,
                    usrid: data.onergy_js_ctx.usrid,
                    data: JSON.stringify(dta)
                }

                let x = await onergy_save(onergySaveData);
                let y = 0;
            }
            */
            await onergy.InsertManyOnergy(arrayPost, fdtdIdPost, data.onergy_js_ctx.usrid);
        }

        let postInfo = {
            UrlJsonContext: {
                status_planilha: 'concluido',
                status_planilha_desc: 'Concluído',
                quantidadeRegistros: qtdReg,
                fdtIdSaveRegistros: fdtdIdPost,
            },
        };
        await onergy_updatemany({
            fdtid: '8b7dc946-2993-44e9-932a-947b77eb44cf',
            assid: data.onergy_js_ctx.assid,
            usrid: data.onergy_js_ctx.usrid,
            data: JSON.stringify(postInfo),
            filter: JSON.stringify([{ FielName: '_id', Type: 'string', FixedType: 'string', Value1: data.id_upload_planilha }]),
            isMultiUpdate: false,
        });
    }

    return true;
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

//!METODOS PADRAO ===
const json = {};
init(JSON.stringify(json));
