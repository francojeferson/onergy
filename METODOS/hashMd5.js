/*

=============================   NESTLÉ, CRIAÇÃO DE ATIVIDADES VIA CHECKLIST    =============================

*/

const { date } = require('assert-plus');
const { type } = require('os');
const { formatDate } = require('tough-cookie');
const onergy = require('../../onergy/onergy-client');

replaceAll = function (content, needle, replacement) {
    return content.split(needle).join(replacement);
};
async function ReadExcelToJson(args) {
    return await onergy.ReadExcelToJson(args);
}
async function ReadTextPdf(args) {
    return await onergy.ReadTextPdf(args);
}
async function onergy_get(args) {
    var r = await onergy.onergy_get(args);

    return JSON.stringify(r);
}
async function hashMd5(args) {
    return await onergy.hashMd5(args);
}
async function onergy_save(args) {
    return await onergy.onergy_save(args);
}

/*

=============================   SCRIPT    =============================

*/

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

// salvar item
async function sendItemToOnergy(templateid, usrid, assid, data, fedid) {
    let onergySaveData = {
        fdtid: templateid,
        assid: assid,
        usrid: usrid,
        data: JSON.stringify(data),
    };
    if (fedid != undefined && fedid != '') {
        onergySaveData.id = fedid;
    }
    return await onergy_save(onergySaveData);
}

async function initBefore(json) {
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

// antigo - 99914b932bd37a50b983c5e7c90ae93b
// autal -  82017ab8818075f8529af1dfe3b62ceb

async function init(json) {
    let data = JSON.parse(json);

    // passar os campos que deseja verificar se estao alterados
    let jsonValid = JSON.stringify({
        nome_agente: data.nome_agente,
        sobrenome_agente: data.sobrenome_agente,
        area_agente: data.area_agente,
        email_agente: data.email_agente,
        mensagem_intermediaria: data.mensagem_intermediaria,
        prazo_interno: data.prazo_interno,
        data_resposta: data.data_resposta,
        mensagem_resposta: data.mensagem_resposta,
    });
    // reposta se existe alteração ou nao nos campos
    let returnHas = await hashMd5({
        content: jsonValid,
    });

    if (data.hashOld === undefined || data.hashOld != returnHas) {
        // sendmail({
        //     assid: data.onergy_js_ctx.assid,
        //     usrid: data.onergy_js_ctx.usrid,
        //     tmpid: 'bfbd7e31-1cb7-48f6-bf09-966a56bf1c06',
        //     email_to: data.email_agente,
        //     id: data.onergy_js_ctx.fedid
        // });

        data.hashOld = returnHas;
    }

    return SetObjectResponse(true, data, false);
}

function getStrFormattedDateEmail(dateItem) {
    let strDt = dateItem.split(' ');
    let dt = strDt[0].split('-');
    let dt_formart = dt[2] + '/' + dt[1] + '/' + dt[0];

    return dt_formart;
}

function getStrFormattedDate(dateItem) {
    return dateItem.toISOString().split('T')[0] + ' 00:00:00';
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

let obj = {
    ORdescricao__origem: 'Titular de Dados',
    cod_demanda_externa: 'DE20220300052',
    MPNGusuario_dpo_cliente: 'Supervisor 2',
    sit_demanda: '2',
    cod_demanda_interna: 'DI20220300053',
    nome_portal: 'AMANDA',
    sobrenome_portal: 'LAVIA',
    detalhes_solicitacao_portal: 'AAAA',
    nome_agente: 'IAGO',
    sobrenome_agente: 'PAIVA',
    area_agente: 'DEV',
    email_agente: 'iago.paiva@keeptrue.com',
    mensagem_intermediaria: 'E-mail origem titular de dados',
    prazo_interno: 7,
    data_previsao_internaDate: '2022-04-07 03:00:00',
    data_previsao_interna: null,
    data_resposta: null,
    mensagem_resposta: 'aaa',
    sit_demanda_desc: 'Em Andamento',
    usuario_edicao_sidpo: 'ADM DEV Digitrust',
    data_criacao_sinternaDate: '2022-03-31 13:46:42',
    data_criacao_sinterna: '2022-03-31 10:46:42',
    usuario_criacao_sinterna: 'ADM DEV Digitrust',
    data_edicao_sidpoDate: '2022-03-31 18:01:05',
    data_edicao_sidpo: '2022-03-31 15:01:05',
    ID_ONE_REF: '619600ac-762c-5700-bd86-a9a8b5ed88fd',
    oneTemplateTitle: 'Demandas Internas',
    str_dt_format_email: '7/4/2022',
    ass_id: 'c9fbea7f-a0ec-410e-948c-07e79b477aa3',
    assid: 'c9fbea7f-a0ec-410e-948c-07e79b477aa3',
    email: 'adm@devdigitrust.com.br',
    fdtid: 'f8334d40-5ebb-4415-8f26-3f299a013e1c',
    fedid: '69d998d7-b353-08ce-55c2-59728739ff2a',
    hashOld: '6c427ef63eed6cc751d61c7cb30ec063',
    onergy_rolid: '',
    timezone: null,
    usrid: 'b6feb372-17bb-4569-b85d-846ea86d6108',
};

init(JSON.stringify(obj));
