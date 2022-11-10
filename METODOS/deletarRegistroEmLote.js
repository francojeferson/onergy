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
 * @param {string} args
 * @returns {string}
 * @description Script de teste
 * @example para deletar registros em lote
 */
async function init(strData) {
    var data = JSON.parse(strData);
    //*inserir fdtid de onde o registro se encontra
    let idGridRegistro = '5ea06f19-d11a-4d61-b4ff-c74610e933cd';
    let strInfo = await getOnergyItem(idGridRegistro, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
    //*função para deletar os registros em lote
    if (strInfo.length > 0) {
        for (let i in strInfo) {
            await DeletarRegistro(strInfo[i], data.onergy_js_ctx.usrid, strInfo[i].ID);
            onergy.log(`deletado: ${strInfo[i].ID}`);
        }
    }
}
function initBefore(json) {
    //return true;
}
function initDelete(json) {
    //return true;
}
function SetObjectResponse(cond, json, WaitingWebHook, UsrID, GrpID) {
    var obj = {
        cond: cond,
        json: JSON.stringify(json),
        WaitingWebHook: WaitingWebHook,
    };
    if (WaitingWebHook === undefined) {
        WaitingWebHook = false;
    }
    if (UsrID != null && UsrID.length > 0) {
        obj.UsrID = UsrID;
    }
    if (GrpID != null && GrpID.length > 0) {
        obj.GrpID = GrpID;
    }
    return obj;
}
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
    return result;
}
async function DeletarRegistro(data, usrid, fedid) {
    //*browser, f12, console, cabeçalho(header), pegar o valor do "ocp-apim-subscription-key" em algum "GetMongo" gerado
    const Ocp_Apim_Subscription_Key = '1ae92442465648cf8607540e41376936'; //Excluir registro, feedView, ocp-apim-subscription-key

    await axios({
        url: `https://gateway.onergy.com.br/homol/api/Feed/FeedView?usr_id=${usrid}&fedid=[%22${fedid}%22]`,
        method: 'POST',
        data: data,
        headers: { 'Ocp-Apim-Subscription-Key': Ocp_Apim_Subscription_Key },
        contentType: 'application/json',
    }).then(
        (response) => {
            strRespToken = response.data;
        },
        (error) => {
            strRespToken = '';
        }
    );
}
/**MET_PADRAO =====================================================================================
 * @param {string} json
 * @returns {string}
 * @description Método padrão para execução de scripts em NodeJS
 * @example json extraído do cloud.onergy através do "onergy.log(JSON.stringify(data));" no "init"
 * @example garante a execução do "onergy_js_ctx" em chamadas de métodos
 */
let obj = {
    nomePlanilhaCarga: 'tablas_maestras_v4.xlsx',
    equipe: 'COL',
    ID_ONE_REF: 'c8f78529-2e61-4f2c-9ca6-511d9d9a93ef',
    PCSclsit__portifolio_cliente_id: '',
    clsit__codigo_do_sitio_do_cliente: 'MED0574',
    RCSclsit__regional_do_cliente_id: '',
    RCSRCS_nome_regional__clsit__regional_do_cliente: '',
    PCSPCS_portafolio_cliente__clsit__portifolio_cliente: '',
    tppf_tipo_portifolio: 'Tigo Occasio',
    site_name: 'Éxito Laureles II',
    asset_number: '195732',
    profit_cost_center: '195732-RT1',
    emp_atc_site: 'ATC SITIOS DE COLOMBIA S.A.S',
    loca_cida_municipio: 'MEDELLIN',
    loca_cida_loca_uf_uf: 'ANTIOQUIA',
    regio_regional: 'NOROCCIDENTE',
    onergyteam_equipe: 'COL',
    onergyteam_id: '084942ee-dd72-45f7-b044-6a47395bf6cc',
    COLCCOLC_nit_cliente: '',
    COLCclsit__nit_cliente_id: '',
    COLCCOLC_nome_cliente__clsit__nit_cliente: '',
    COLCCOLC_codigo_cliente: '',
    oneTemplateTitle: '',
    onergy_js_ctx: {
        assid: '67c0b77d-abae-4c48-ba4b-6c8faf27e14a',
        fedid: '35feaa8a-e157-41b6-83a9-0aa2d8708385',
        fdtid: '0e8dc4f0-4a4f-4fb1-8268-423b45128203',
        usrid: '0c44d4fc-d654-405b-9b8f-7fea162948b5',
        insertDt: '2022-11-03T16:21:32.646Z',
        updateDt: '2022-11-03T16:21:32.646Z',
        cur_userid: '0c44d4fc-d654-405b-9b8f-7fea162948b5',
        email: 'admin-colombia@atc.com.co',
        user_name: 'Administrador Colômbia',
        onergy_rolid: 'e4d0298c-245e-454a-89d4-8f27aef8645b',
        praid: '271375f3-86c8-4ca2-a775-cd2581b9177f',
        pcvid: '7e93e307-2ae0-4376-a428-e07a2dfa578d',
        prcid: '0da6dd0d-3707-0c6c-c387-0a332c9bce38',
        timezone: null,
        timezone_value: '-03:00',
        pubNubHook: null,
    },
};

init(JSON.stringify(obj));
