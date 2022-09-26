/*

=============================   NESTLÉ, CRIAÇÃO DE ATIVIDADES VIA CHECKLIST    =============================

*/

const { date } = require('assert-plus');
const { type } = require('os');
const { formatDate } = require('tough-cookie');
var onergy = require('../Mitre/NodeTryJS/onergy/onergy-client');

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
async function hashMd5(args) {
    return await 'idHash';
}
function get_usr_tmz_dt_now(args) {
    return '2022-07-14';
}

const axios = require('axios');

/*

=============================   SCRIPT    =============================

- Após salvar esse formulário, o dado seguirá para verificações automáticas de duplicidade, caso essas informações já tenham sido inseridas na
plataforma, esse registro ficará como histórico no menu: “Documentos Duplicados”.

- Caso algum dado não esteja legível, onde não é possível efetuar a extração e é uma informação obrigatória para o processo, então o registro irá para
a etapa: “Verificar e Complementar informações”.

*/

function initBefore(json) {
    // return true;
}

async function init(strData) {
    var data = JSON.parse(strData);

    let strFiltro = JSON.stringify([{ FielName: 'numero_da_nota', Type: 'string', FixedType: 'string', Value1: '127704695' }]);

    let strInfo = await getOnergyItem('8a7b4e11-0afb-4d61-9baf-a10f01cc1606', data.assid, data.usrid, strFiltro);

    if (strInfo.length > 0) {
        for (let i in strInfo) {
            await DeletarRegistro(strInfo[i], strInfo[i].UrlJsonContext.usrid, strInfo[i].UrlJsonContext.fedid);
        }
    }
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

function sendItemToOnergy(templateid, usrid, assid, data, fedid, ukField, checkTemplateDuplicate, addCfgViewGroup) {
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
    return await result;
}

let obj = {};

init(JSON.stringify(obj));
