/**ENV_NODE**
 * node:test (find and replace)
 * async /**
 * await /**
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
/**CLI_SCRIPT**
 * Executar automático quando em processo: Não
 * Atividade de longa duração: Não
 * Esconder Menu: Sim
 * Condicional: nenhum
 * Aprovação: nenhum
 */
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
async function init(json) {
    let data = JSON.parse(json);
    debugger;

    let idSeleccionDeCarga = 'ec2d14aa-a0c9-4e33-8856-4e16d703f0b8';
    let getSeleccionDeCarga = await getOnergyItem(
        idSeleccionDeCarga,
        data.onergy_js_ctx.assid,
        data.onergy_js_ctx.usrid,
        gerarFiltro('ID_ONE_REF', data.onergy_js_ctx.fedid)
    );

    for (let fatura of getSeleccionDeCarga) {
        if (data.CDE__atualizar_status_legalizacao == '1') {
            let idFaturaHijaIndividual = '11bb183c-d30d-4ed9-af2d-286b2dcb1a89';
            await onergy_updatemany({
                fdtid: idFaturaHijaIndividual,
                assid: data.onergy_js_ctx.assid,
                usrid: data.onergy_js_ctx.usrid,
                id: fatura.UrlJsonContext.one_copied_from,
                data: JSON.stringify({
                    UrlJsonContext: {
                        ESTLlegalizacao_do_status_id: '598756cb-de3a-fbdf-7e1d-4b84b4effff3',
                        ESTLstatus__legalizacao_do_status: 'ENVIADO',
                    },
                }),
            });
        }
        if (data.CDE__atualizar_status_pagamento == '1') {
            let idFaturaHijaIndividual = '11bb183c-d30d-4ed9-af2d-286b2dcb1a89';
            await onergy_updatemany({
                fdtid: idFaturaHijaIndividual,
                assid: data.onergy_js_ctx.assid,
                usrid: data.onergy_js_ctx.usrid,
                id: fatura.UrlJsonContext.one_copied_from,
                data: JSON.stringify({
                    UrlJsonContext: {
                        ESTPstatus__status_pagamento: fatura.UrlJsonContext.CDE__valor_a_pagar_parcial ? 'ENVIADO PARCIAL' : 'ENVIADO TOTAL',
                        ESTPstatus_pagamento_id: fatura.UrlJsonContext.CDE__valor_a_pagar_parcial
                            ? 'a318f2ec-770f-aa2a-759b-f760850de465'
                            : '9a5e2aa8-27b4-93bc-5772-b456f1bbffa2',
                    },
                }),
            });
        }
    }

    return false;
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
    CDE__atualizar_status_legalizacao: '0',
    CDE__atualizar_status_pagamento: '0',
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
    CDE__atualizar_status_legalizacao_desc: 'Não',
    CDE__atualizar_status_pagamento_desc: 'Não',
    oneTemplateTitle: '',
    ass_id: '67c0b77d-abae-4c48-ba4b-6c8faf27e14a',
    assid: '67c0b77d-abae-4c48-ba4b-6c8faf27e14a',
    fedid: '7780abfc-3e0f-4183-5cfe-fdc71da022d9',
    fdtid: '8a46f1a6-e2ae-48a2-9480-352493d9cb17',
    usrid: '0c44d4fc-d654-405b-9b8f-7fea162948b5',
    email: 'admin-colombia@atc.com.co',
    onergy_rolid: 'e4d0298c-245e-454a-89d4-8f27aef8645b',
    timezone: null,
    onergy_js_ctx: {
        assid: '67c0b77d-abae-4c48-ba4b-6c8faf27e14a',
        fedid: '7780abfc-3e0f-4183-5cfe-fdc71da022d9',
        fdtid: '8a46f1a6-e2ae-48a2-9480-352493d9cb17',
        usrid: '0c44d4fc-d654-405b-9b8f-7fea162948b5',
        insertDt: '2022-11-02T16:42:26.506Z',
        updateDt: '2022-11-02T16:42:26.506Z',
        cur_userid: '0c44d4fc-d654-405b-9b8f-7fea162948b5',
        email: 'admin-colombia@atc.com.co',
        user_name: 'Administrador Colômbia',
        onergy_rolid: 'e4d0298c-245e-454a-89d4-8f27aef8645b',
        praid: 'd8e84497-2700-441f-9994-264368e48893',
        pcvid: '544541f8-0c5f-45e2-8cd4-e950bb8b490c',
        prcid: '2c136341-fc64-c751-5cf4-0b92500c7a1e',
        timezone: null,
        timezone_value: '-03:00',
        pubNubHook: null,
    },
};
init(JSON.stringify(json));
