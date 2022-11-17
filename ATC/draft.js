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
let jsuser = require('../onergy/onergy-utils');
let onergy = require('../onergy/onergy-client');
let utils = require('../onergy/onergy-utils');
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
async function onergy_updatemany(data) {
    return data;
}
function successCallback(result) {
    console.log('It succeeded with ' + result);
}

/**SCRIPT ===
 * Executar automático quando em processo: Não
 * Atividade de longa duração: Não
 * Esconder Menu: Não
 * Condicional: nenhum
 * Aprovação: nenhum
 */
function initBefore(json) {
    // return true;
}

async function init(strData) {
    var data = JSON.parse(strData);

    let date = new Date();
    let time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'America/Bogota' });

    let strPost = {
        nomePlanilhaCarga: 'tablas_maestras.xlsx',
        equipe: 'COL',
        id_equipe_txt: '084942ee-dd72-45f7-b044-6a47395bf6cc',
        nit_proveedor: 800089809,
        nombre_proveedor: 'IBAL SA ESP',
        nit_beneficiario: 800089809,
        nombre_beneficiario: 'IBAL SA ESP',
        tipo_tercero: 'SERVICIO NAC',
        nombre_comercial: 'IBAL SA ESP',
        dia_de_pago: '',
        tipo_acceso: 'USUARIO/CONTRASEÑA',
        link_web: 'http://190.107.23.34:8091/websolin/',
        usuario: 'edwin.nieto@americantower.com',
        contrasena: 'Colombia2021',
        nit_provedor: 800089809,
        nome_provedor: 'IBAL SA ESP',
        beneficiario: 'IBAL SA ESP',
        tp3o_tipo_de_terceiro: 'SERVICIO NAC',
        tp3o_id: '89b4ac83-c073-f37a-6deb-77ca065670e6',
        nome_comercial: 'IBAL SA ESP',
        dia_de_vencimento: '',
        tp_acces_tipo_de_acesso: 'USUARIO/CONTRASEÑA',
        tp_acces_id: '1653c595-a04f-3fc5-5f14-3ae6ca864bff',
    };

    let respSave = await sendItemToOnergy('4783ca0b-357d-42ab-a5c8-3328ee315f86', data.usrid, data.assid, strPost, '', 'nit_provedor', true, false, false);
}

async function DeletarRegistro(data, usrid, fedid) {
    const Ocp_Apim_Subscription_Key = 'e2dc35dfcc8048eeba0805b090ab9f97'; //Excluir registro, feedView, ocp-apim-subscription-key

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

async function sendItemToOnergy(templateid, usrid, assid, data, fedid, ukField, checkTemplateDuplicate, addCfgViewGroup, execAction) {
    let onergySaveData = {
        fdtid: templateid,
        assid: assid,
        usrid: usrid,
        data: JSON.stringify(data),
        //executeAction: false
    };
    if (!execAction) {
        onergySaveData.executeAction = false;
    }
    if (fedid != undefined && fedid != '') {
        onergySaveData.id = fedid;
    }
    if (ukField != undefined && ukField != '') {
        onergySaveData.ukField = ukField;
        onergySaveData.blockDuplicate = true;
    }
    if (checkTemplateDuplicate != undefined && checkTemplateDuplicate != '') {
        onergySaveData.checkTemplateDuplicate = true;
    }
    if (addCfgViewGroup != undefined && addCfgViewGroup.length > 0) {
        onergySaveData.addCfgViewGroup = addCfgViewGroup;
    }
    return onergy_save(onergySaveData);
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

/**METODOS PADRAO ===
 */
let json = {
    load_index_equipe: 'COL',
    load_index_id_do_card: '55ec978d-7dbe-4a6f-8cb4-536b53361d54',
    planilha: [
        {
            Url: 'https://onebackupservices.blob.core.windows.net/67c0b77d-abae-4c48-ba4b-6c8faf27e14a/tablas_maestras.xlsx8dd74d34-0c31-4d85-a53d-1fa63f68e4a4.xlsx?sv=2018-03-28&sr=b&sig=g6J6Wk1VXBcVOjGXMqNCd27RC3yLxFJauSJ6AxdHTGI%3D&se=2023-04-30T23%3A30%3A30Z&sp=r',
            UrlAzure:
                'https://onebackupservices.blob.core.windows.net/67c0b77d-abae-4c48-ba4b-6c8faf27e14a/tablas_maestras.xlsx8dd74d34-0c31-4d85-a53d-1fa63f68e4a4.xlsx?sv=2018-03-28&sr=b&sig=g6J6Wk1VXBcVOjGXMqNCd27RC3yLxFJauSJ6AxdHTGI%3D&se=2023-04-30T23%3A30%3A30Z&sp=r',
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

// init(JSON.stringify(json));
let b64txt = utils.GetTextFromBase64('dWcyOXM2YjhuamtoZGtjcmgydXp2YWdkOm5uUk5CclRuMzI=');
const encode = Buffer.from(b64txt).toString('base64');
debugger;
