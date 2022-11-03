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
 * @example para substituir o valor de um campo vazio por um valor padrão
 * @example primeiro busca o registro do valor padrão a ser usado (this_)
 * @example depois busca os registros que tem o campo vazio dentro de um loop (old_)
 * @example para cada loop atualiza registros com campo vazio através do método updatemany (new_)
 */
async function init(json) {
    let data = JSON.parse(json);

    let idPortafolioATC = '18615527-c678-4f1c-87e0-d7a9735d0c6e';
    let getPortafolioATC = await getOnergyItem(idPortafolioATC, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
    let isPortafolioATC = getPortafolioATC.filter((item) => item.UrlJsonContext.tipo_portifolio == 'ATC');
    let this_idPortfolio = isPortafolioATC[0].ID;
    let this_portfolio = isPortafolioATC[0].UrlJsonContext.tipo_portifolio;
    onergy.log(`this-portfolio: ${this_portfolio}, this-id: ${this_idPortfolio}`);

    let idSitios = 'e43b9fe0-6752-446d-8495-0b4fdd7a70b4';
    let getSitios = await getOnergyItem(idSitios, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);

    for (item of getSitios) {
        let old_portfolio = item.UrlJsonContext.tppf_tipo_portifolio;
        let old_portfolio2 = item.UrlJsonContext.tppf_tipo_portifolio__portfolio;
        let old_idTipoPortifolio = item.UrlJsonContext.tppf_portfolio_id;

        if (old_portfolio.length == 0) {
            onergy.log(`old-portfolio: ${old_portfolio}, old-portfolio2: ${old_portfolio2}, old-idTipoPortifolio: ${old_idTipoPortifolio}`);

            let new_portfolio = this_portfolio;
            let new_portfolio2 = this_portfolio;
            let new_idTipoPortifolio = this_idPortfolio;
            onergy.log(`new-portfolio: ${new_portfolio}, new-portfolio2: ${new_portfolio2}, new-idTipoPortifolio: ${new_idTipoPortifolio}`);

            await onergy_updatemany({
                fdtid: idSitios,
                assid: data.onergy_js_ctx.assid,
                usrid: data.onergy_js_ctx.usrid,
                id: item.ID,
                data: JSON.stringify({
                    UrlJsonContext: {
                        tppf_tipo_portifolio: new_portfolio,
                        tppf_tipo_portifolio__portfolio: new_portfolio2,
                        tppf_portfolio_id: new_idTipoPortifolio,
                    },
                }),
            });
        }
    }

    return true;
    //return SetObjectResponse(true, data, true);
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
async function getOnergyItem(fdtid, assid, usrid, filtro, fedid) {
    let keepSearching = true;
    let skip = 0;
    let take = 500;
    let result = [];
    while (keepSearching) {
        let onergyGetObj = {
            fdtid: fdtid,
            assid: assid,
            usrid: usrid,
            filter: filtro,
            skip: skip,
            take: take,
        };
        if (fedid) {
            onergyGetObj.fedid = fedid;
        }
        let strPageResp = await onergy_get(onergyGetObj);
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
 * @param {string} json
 * @returns {string}
 * @description Método padrão para execução de scripts em NodeJS
 * @example json extraído do cloud.onergy através do "onergy.log(JSON.stringify(data));" no "init"
 * @example garante a execução do "onergy_js_ctx" em chamadas de métodos
 */
let json = {
    nomePlanilhaCarga: 'tablas_maestras_v4.xlsx',
    equipe: 'COL',
    modificado_por: 'Administrador Colômbia',
    asset_number: '161898',
    profit_cost_center: '161898-WT1',
    emp_atc_site__empresa_atc: 'ATC SITIOS DE COLOMBIA S.A.S',
    loca_cida_municipio: 'MAGANGUE',
    sta_site_status_do_site_id: '67bf756f-ac4e-4d23-b285-5261d357530a',
    codigo_ancora: 'BOL0088',
    logradouro: 'Calle 13 # 21 - 52, Cascajal Magangue - Bolivar',
    sta_site_status__status_do_site: 'ACTIVO',
    tppf_tipo_portifolio__portfolio: 'ATC',
    regio_regional__regiao_atc: 'COSTA',
    onergyteam_equipe: 'COL',
    onergyteam_id: '084942ee-dd72-45f7-b044-6a47395bf6cc',
    modificado_em: '2022-11-03 16:45:40',
    site_name: 'Cascajal B',
    emp_atc_empresa_atc_id: '6566a66e-8be5-4bd0-b950-7123d075ce0d',
    emp_atc_site: 'ATC SITIOS DE COLOMBIA S.A.S',
    loca_cida_id: '73ab00b3-32ea-4875-aa95-0699d4c2b677',
    loca_cida_loca_uf_uf: 'BOLÍVAR',
    loca_cida_loca_uf_id: 'adaf5905-d9d5-4b74-b772-3b7a4902112b',
    sta_site_status: 'ACTIVO',
    tppf_tipo_portifolio: 'ATC',
    tppf_portfolio_id: '00a1361e-9500-d0a6-d2d7-3cc93ac350ba',
    regio_regional: 'COSTA',
    regio_regional_regiao_atc_id: 'ae5b1593-61f3-48f3-ae76-4ea080797220',
    regio_regiao_atc_id: 'ae5b1593-61f3-48f3-ae76-4ea080797220',
    oneTemplateTitle: 'Sitios',
    grid_info_conta: '',
    grid_info_site: '',
    grid_info_tec: '',
    pode_apagar: 'sim',
    registro_salvo: 'sim',
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

init(JSON.stringify(json));
/**FIM ============================================================================================
 */
