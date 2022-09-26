/*

=============================   NESTLÉ, CRIAÇÃO DE ATIVIDADES VIA CHECKLIST    =============================

*/

const { date } = require('assert-plus');
const { type } = require('os');
const { formatDate } = require('tough-cookie');
var onergy = require('./onergy/onergy-client');

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
    //return await onergy.onergy_save(args);
}

function sendmail() {
    return;
}

function getusermail() {
    return;
}

/*

=============================   SCRIPT    =============================

*/
async function init(json) {
    var data = JSON.parse(json);

    // fltro para excluir o registro em Log de atividades se for Supervisor
    let fdtLogDPO = 'bf48ca5e-c503-4140-8f0d-76f9da0048e0';

    let strFiltro = JSON.stringify([{ FielName: 'usuario_dpo_email', Type: 'string', FixedType: 'string', Value1: data.email_colaborador }]);

    let cadastroLOG = await getOnergyItem(fdtLogDPO, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, strFiltro);

    if (cadastroLOG.length > 0) {
        let postInfoDelet = {
            UrlJsonContext: {
                id_user_resp_delet: data.usrid,
            },
            BlockCount: 1,
        };
        let excluirFilter = JSON.stringify([{ FielName: 'id_upload_planilha', Type: 'string', FixedType: 'string', Value1: data.onergy_js_ctx.fedid }]);

        // onergy_updatemany({
        //     fdtid: fdtLogDPO,
        //     assid: data.onergy_js_ctx.assid,
        //     usrid: data.onergy_js_ctx.usrid,
        //     data: JSON.stringify(postInfoDelet),
        //     id: cadastroLOG[0].ID,
        //     isMultiUpdate: true
        // });
    }

    // Excluir o usuario do console e dentro do registro de cliente em que ele se encontra
    let fdtClientes = 'f4e2fac7-fc0e-48d9-92a2-cd599047cb23';

    let strFiltroDelete = JSON.stringify([
        {
            FielName: 'usuario_adm_cliente_id',
            Value1: data.OnergyCadUsrID,
            Conditional: 'or',
        },
        {
            FielName: 'usuario_perfil_sup_id',
            Value1: data.OnergyCadUsrID,
            Conditional: 'or',
        },
        {
            FielName: 'usuario_dpo_cliente_id',
            Value1: data.OnergyCadUsrID,
            Conditional: 'or',
        },
    ]);

    let removeUsrEmCliente = await getOnergyItem(fdtClientes, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, strFiltroDelete);

    if (removeUsrEmCliente.length > 0) {
        for (let i in removeUsrEmCliente) {
            let indexUsrADM = removeUsrEmCliente[i].UrlJsonContext.usuario_adm_cliente_id.indexOf(data.OnergyCadUsrID);
            let indexUsrSUP = removeUsrEmCliente[i].UrlJsonContext.usuario_perfil_sup_id.indexOf(data.OnergyCadUsrID);
            let indexUsrDPO = removeUsrEmCliente[i].UrlJsonContext.usuario_dpo_cliente_id.indexOf(data.OnergyCadUsrID);

            if (indexUsrADM > -1) {
                removeUsrEmCliente[i].UrlJsonContext.usuario_adm_cliente_id.splice(indexUsrADM, 1);
                removeUsrEmCliente[i].UrlJsonContext.usuario_adm_cliente.splice(indexUsrADM, 1);
            }
            if (indexUsrSUP > -1) {
                removeUsrEmCliente[i].UrlJsonContext.usuario_perfil_sup_id.splice(indexUsrSUP, 1);
                removeUsrEmCliente[i].UrlJsonContext.usuario_perfil_sup.splice(indexUsrSUP, 1);
            }
            if (indexUsrDPO > -1) {
                removeUsrEmCliente[i].UrlJsonContext.usuario_dpo_cliente_id.splice(indexUsrDPO, 1);
                removeUsrEmCliente[i].UrlJsonContext.usuario_dpo_cliente.splice(indexUsrDPO, 1);
            }

            onergy_updatemany({
                fdtid: fdtClientes,
                assid: data.assid,
                usrid: data.usrid,
                data: JSON.stringify(removeUsrEmCliente[i].UrlJsonContext),
                isMultiUpdate: false,
                id: removeUsrEmCliente[i].ID,
            });
        }
    }
    user.RemoveUser(data.OnergyCadUsrID);

    //return true;
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

    var obj = {
        cond: cond,
        json: JSON.stringify(json),
        WaitingWebHook: WaitingWebHook,
    };
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
// obj que estamos simulando a compra
let obj = {
    nome_colaborador: 'Teste Excluir',
    email_colaborador: 'excluir@teste.com',
    FUNnome_funcao: 'Supervisor/ DPO no Cliente',
    FUNid: '63b54f46-27b9-0f1a-ea6f-d14ba4ec27dc',
    FUNperfil_interno: '1',
    FUNperfil_administrativo: '2',
    lider_area: 'nao',
    FUNonergyFuncaoRoleID: 'dd391c82-b6e7-4f5c-a552-44641ad0f068',
    AREsigla_area: '',
    senha_colaborador: '',
    alterar_senha: null,
    enviar_email_colaborador: 'false',
    ativo_colaborador: 'não',
    FUNperfil_interno_desc: 'Sim',
    FUNperfil_administrativo_desc: 'Não',
    enviar_email_colaborador_desc: 'Não',
    ativo_colaborador_desc: 'Não',
    oneTemplateTitle: 'Colaboradores Internos - Inativos',
    OnergyCadUsrID: 'eb3baa0d-448d-40cb-acbb-665308062674',
    alterar_senha_desc: null,
    ass_id: 'c9fbea7f-a0ec-410e-948c-07e79b477aa3',
    assid: 'c9fbea7f-a0ec-410e-948c-07e79b477aa3',
    email: 'adm@devdigitrust.com.br',
    fdtid: '68ef8b5a-ffe1-46d9-8903-6d5e96fcae49',
    fedid: '56082eb5-c7c3-fd7b-d8be-39f8b0d31ad0',
    onergyAreaGroupID: '2d8f5962-c6be-43e7-9abc-81b65e95fbea',
    onergy_rolid: '',
    timezone: null,
    usrid: 'b6feb372-17bb-4569-b85d-846ea86d6108',
    data_inativacao: '2022-05-06 17:21:55',
    data_inativacaoDate: '2022-05-06 20:21:55',
    usr_inativacao: 'ADM DEV Digitrust',
    onergy_js_ctx: {
        assid: 'c9fbea7f-a0ec-410e-948c-07e79b477aa3',
        fedid: '56082eb5-c7c3-fd7b-d8be-39f8b0d31ad0',
        fdtid: 'a9757dc5-4a27-46a2-8f9d-06a2845ef14c',
        usrid: 'b6feb372-17bb-4569-b85d-846ea86d6108',
        insertDt: '2022-05-06 17:21:36.536',
        updateDt: '2022-05-06 17:21:55.326',
        cur_userid: 'b6feb372-17bb-4569-b85d-846ea86d6108',
        email: 'adm@devdigitrust.com.br',
        user_name: 'ADM DEV Digitrust',
        onergy_rolid: '',
        praid: '4c1b883d-6e1a-4a49-88de-ec13b36e98ab',
        pcvid: '2ccd785d-0bc1-4b35-bc93-08d6b98b5be5',
        timezone: null,
        timezone_value: '-03:00',
        pubNubHook: null,
    },
};

init(JSON.stringify(obj));
