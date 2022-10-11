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
    const r = await onergy.onergy_sendto(args);
    return JSON.stringify(r);
}
async function onergy_updatemany(args) {
    return await onergy.onergy_save(args);
}
function successCallback(result) {
    console.log('It succeeded with ' + result);
}

//!SCRIPT ===
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
        if (pageResp !== null && pageResp.length > 0) {
            keepSearching = pageResp.length === take;
            result = result.concat(pageResp);
        } else {
            keepSearching = false;
        }
    }
    return result;
}

async function sendToOnergy(oldFdt, newFdt, assid, usrid, fedid) {
    let param = {
        assid: assid,
        usrid: usrid,
        fdtid: oldFdt,
        newfdtid: newFdt,
        resetFdtData: true,
        fedid: fedid,
        resetPrc: true,
    };
    await onergy_sendto(param);
}

const fdtCompartliharDoctosParaValidacaoDeDuplicados = '8a7b4e11-0afb-4d61-9baf-a10f01cc1606';
const fdtConsDet_Nfse = '9253cd1f-f178-4129-a0e0-a7585d7f51c5';
const fdtConfSis_ConfigurarValidacoes = '33e92d6e-8d4b-4c85-bb0e-c332c9948b97';
const fedConfVal_Nfse = 'dadfb076-f5ed-90e0-450b-1784846ca5b1';
const fdtConfSis_RegrasValidacoes = 'd5482e8e-a646-4a35-a36c-3037a8e2b401';
const fdtMonitDoc_Nfse = '254907b2-d9fe-4c4c-bc5e-6c4aec3d5bed';
const fdtMonitAp_Nfse = 'f87511fa-1a34-436b-b62a-83f4a978f19e';
const fedRegValid_ValorInss = '504db105-265d-29af-9a79-2430b072df40';
const fedRegValid_ValorPisPasep = '85db7c95-1afb-0606-e1cb-692868fe43ab';
const fedRegValid_ValorIrrf = 'f6528194-15b6-6e28-c697-2be89473324d';
const fedRegValid_ValorCsll = 'ce9ef27d-9908-0f16-5b66-083545eb3c4c';
const fedRegValid_ValorCofins = '34eb0a72-f1ec-fe97-66a1-8f068da61417';
async function init(json) {
    const data = JSON.parse(json);
    // onergy.log('JFS: initProcRetencao_ValidarRetencao');

    //* ConsultaDetalhada_Nfse
    //* busca getConsDet_Nfse filtrando fedid em idfk
    let filtConsDet_Nfse = JSON.stringify([{ FielName: 'fedid', Type: 'string', FixedType: 'string', Value1: data.idfk }]);
    let getConsDet_Nfse = await getOnergyItem(
        fdtConsDet_Nfse,
        data.onergy_js_ctx.assid ? data.onergy_js_ctx.assid : data.assid,
        data.onergy_js_ctx.usrid ? data.onergy_js_ctx.usrid : data.usrid,
        filtConsDet_Nfse
    );
    let objNfse = typeof getConsDet_Nfse !== 'object' ? JSON.parse(getConsDet_Nfse) : getConsDet_Nfse;
    // onergy.log('JFS: getOnergyItem: fdtConsDet_Nfse: objNfse: ' + JSON.stringify(objNfse[0].UrlJsonContext));

    //* CadastroGeral_ConfiguracoesSistemicas_ConfigurarValidacoes
    //* busca getConfVal_Nfse filtrando _id em fedConfVal_Nfse
    let filtConfVal_Nfse = JSON.stringify([{ FielName: '_id', Type: 'string', FixedType: 'string', Value1: fedConfVal_Nfse }]);
    let getConfVal_Nfse = await getOnergyItem(
        fdtConfSis_ConfigurarValidacoes,
        data.onergy_js_ctx.assid ? data.onergy_js_ctx.assid : data.assid,
        data.onergy_js_ctx.usrid ? data.onergy_js_ctx.usrid : data.usrid,
        filtConfVal_Nfse
    );
    // onergy.log('JFS: getOnergyItem: fdtConfSis_ConfigurarValidacoes: getConfigValidNFSe: ' + JSON.stringify(getConfVal_Nfse[0].UrlJsonContext));

    let radValidacaoComercial = getConfVal_Nfse[0].UrlJsonContext.habilitar_validacao_comercial_desc;
    //* se validacao comercial habilitado, segue
    if (radValidacaoComercial === 'Sim') {
        let arrErr = [];
        let strPedido, strDocumento, numPedido, numDocumento, postInfo;
        //* tolerancia definida pelo cliente
        let tolerance = 0.05;

        //* CadastroGeral_ConfiguracoesSistemicas_RegrasValidacoes
        //* busca getRegValid_ValorInss filtrando _id em fedRegValid_ValorInss
        let filtRegValid_ValorInss = JSON.stringify([{ FielName: '_id', Type: 'string', FixedType: 'string', Value1: fedRegValid_ValorInss }]);
        let getRegValid_ValorInss = await getOnergyItem(
            fdtConfSis_RegrasValidacoes,
            data.onergy_js_ctx.assid ? data.onergy_js_ctx.assid : data.assid,
            data.onergy_js_ctx.usrid ? data.onergy_js_ctx.usrid : data.usrid,
            filtRegValid_ValorInss
        );
        // onergy.log('JFS: getOnergyItem: fdtConfSis_RegrasValidacoes: getRegValid_ValorInss: ' + JSON.stringify(getRegValid_ValorInss[0].UrlJsonContext));

        //* se ValorInss encontrado, segue
        if (getRegValid_ValorInss[0].UrlJsonContext.LVC_validacao === 'Valor INSS') {
            //* campos dos impostos a comparar
            strPedido = getRegValid_ValorInss[0].UrlJsonContext.campo_pedido;
            strDocumento = getRegValid_ValorInss[0].UrlJsonContext.campo_documento;
            //* valores dos impostos a comparar
            numPedido = objNfse[0].UrlJsonContext[strPedido] ? parseFloat(objNfse[0].UrlJsonContext[strPedido].toFixed(2)) : 0;
            numDocumento = objNfse[0].UrlJsonContext[strDocumento] ? parseFloat(objNfse[0].UrlJsonContext[strDocumento].toFixed(2)) : 0;

            //* se imposto maior que tolerancia, armazena mensagem de erro no array
            if (Math.abs(numPedido - numDocumento) > tolerance) {
                arrErr.push(getRegValid_ValorInss[0].UrlJsonContext.msg_erro + '\n');
            }
        }

        //* CadastroGeral_ConfiguracoesSistemicas_RegrasValidacoes
        //* busca getRegValid_ValorPisPasep filtrando _id em fedRegValid_ValorPisPasep
        let filtRegValid_ValorPisPasep = JSON.stringify([{ FielName: '_id', Type: 'string', FixedType: 'string', Value1: fedRegValid_ValorPisPasep }]);
        let getRegValid_ValorPisPasep = await getOnergyItem(
            fdtConfSis_RegrasValidacoes,
            data.onergy_js_ctx.assid ? data.onergy_js_ctx.assid : data.assid,
            data.onergy_js_ctx.usrid ? data.onergy_js_ctx.usrid : data.usrid,
            filtRegValid_ValorPisPasep
        );
        // onergy.log(
        //     'JFS: getOnergyItem: fdtConfSis_RegrasValidacoes: getRegValid_ValorPisPasep: ' + JSON.stringify(getRegValid_ValorPisPasep[0].UrlJsonContext)
        // );

        //* se ValorPisPasep encontrado, segue
        if (getRegValid_ValorPisPasep[0].UrlJsonContext.LVC_validacao) {
            //* campos dos impostos a comparar
            strPedido = getRegValid_ValorPisPasep[0].UrlJsonContext.campo_pedido;
            strDocumento = getRegValid_ValorPisPasep[0].UrlJsonContext.campo_documento;
            //* valores dos impostos a comparar
            numPedido = objNfse[0].UrlJsonContext[strPedido] ? parseFloat(objNfse[0].UrlJsonContext[strPedido].toFixed(2)) : 0;
            numDocumento = objNfse[0].UrlJsonContext[strDocumento] ? parseFloat(objNfse[0].UrlJsonContext[strDocumento].toFixed(2)) : 0;

            //* se imposto maior que tolerancia, armazena mensagem de erro no array
            if (Math.abs(numPedido - numDocumento) > tolerance) {
                arrErr.push(getRegValid_ValorPisPasep[0].UrlJsonContext.msg_erro + '\n');
            }
        }

        //* CadastroGeral_ConfiguracoesSistemicas_RegrasValidacoes
        //* busca getRegValid_ValorIrrf filtrando _id em fedRegValid_ValorIrrf
        let filtRegValid_ValorIrrf = JSON.stringify([{ FielName: '_id', Type: 'string', FixedType: 'string', Value1: fedRegValid_ValorIrrf }]);
        let getRegValid_ValorIrrf = await getOnergyItem(
            fdtConfSis_RegrasValidacoes,
            data.onergy_js_ctx.assid ? data.onergy_js_ctx.assid : data.assid,
            data.onergy_js_ctx.usrid ? data.onergy_js_ctx.usrid : data.usrid,
            filtRegValid_ValorIrrf
        );
        // onergy.log('JFS: getOnergyItem: fdtConfSis_RegrasValidacoes: getRegValid_ValorIrrf: ' + JSON.stringify(getRegValid_ValorIrrf[0].UrlJsonContext));

        //* se ValorIrrf encontrado, segue
        if (getRegValid_ValorIrrf[0].UrlJsonContext.LVC_validacao) {
            //* campos dos impostos a comparar
            strPedido = getRegValid_ValorIrrf[0].UrlJsonContext.campo_pedido;
            strDocumento = getRegValid_ValorIrrf[0].UrlJsonContext.campo_documento;
            //* valores dos impostos a comparar
            numPedido = objNfse[0].UrlJsonContext[strPedido] ? parseFloat(objNfse[0].UrlJsonContext[strPedido].toFixed(2)) : 0;
            numDocumento = objNfse[0].UrlJsonContext[strDocumento] ? parseFloat(objNfse[0].UrlJsonContext[strDocumento].toFixed(2)) : 0;

            //* se imposto maior que tolerancia, armazena mensagem de erro no array
            if (Math.abs(numPedido - numDocumento) > tolerance) {
                arrErr.push(getRegValid_ValorIrrf[0].UrlJsonContext.msg_erro + '\n');
            }
        }

        //* CadastroGeral_ConfiguracoesSistemicas_RegrasValidacoes
        //* busca getRegValid_ValorCsll filtrando _id em fedRegValid_ValorCsll
        let filtRegValid_ValorCsll = JSON.stringify([{ FielName: '_id', Type: 'string', FixedType: 'string', Value1: fedRegValid_ValorCsll }]);
        let getRegValid_ValorCsll = await getOnergyItem(
            fdtConfSis_RegrasValidacoes,
            data.onergy_js_ctx.assid ? data.onergy_js_ctx.assid : data.assid,
            data.onergy_js_ctx.usrid ? data.onergy_js_ctx.usrid : data.usrid,
            filtRegValid_ValorCsll
        );
        // onergy.log('JFS: getOnergyItem: fdtConfSis_RegrasValidacoes: getRegValid_ValorCsll: ' + JSON.stringify(getRegValid_ValorCsll[0].UrlJsonContext));

        //* se ValorIrrf encontrado, segue
        if (getRegValid_ValorCsll[0].UrlJsonContext.LVC_validacao) {
            //* campos dos impostos a comparar
            strPedido = getRegValid_ValorCsll[0].UrlJsonContext.campo_pedido;
            strDocumento = getRegValid_ValorCsll[0].UrlJsonContext.campo_documento;
            //* valores dos impostos a comparar
            numPedido = objNfse[0].UrlJsonContext[strPedido] ? parseFloat(objNfse[0].UrlJsonContext[strPedido].toFixed(2)) : 0;
            numDocumento = objNfse[0].UrlJsonContext[strDocumento] ? parseFloat(objNfse[0].UrlJsonContext[strDocumento].toFixed(2)) : 0;

            //* se imposto maior que tolerancia, armazena mensagem de erro no array
            if (Math.abs(numPedido - numDocumento) > tolerance) {
                arrErr.push(getRegValid_ValorCsll[0].UrlJsonContext.msg_erro + '\n');
            }
        }

        //* CadastroGeral_ConfiguracoesSistemicas_RegrasValidacoes
        //* busca getRegValid_ValorCofins filtrando _id em fedRegValid_ValorCofins
        let filtRegValid_ValorCofins = JSON.stringify([{ FielName: '_id', Type: 'string', FixedType: 'string', Value1: fedRegValid_ValorCofins }]);
        let getRegValid_ValorCofins = await getOnergyItem(
            fdtConfSis_RegrasValidacoes,
            data.onergy_js_ctx.assid ? data.onergy_js_ctx.assid : data.assid,
            data.onergy_js_ctx.usrid ? data.onergy_js_ctx.usrid : data.usrid,
            filtRegValid_ValorCofins
        );
        // onergy.log('JFS: getOnergyItem: fdtConfSis_RegrasValidacoes: getRegValid_ValorCofins: ' + JSON.stringify(getRegValid_ValorCofins[0].UrlJsonContext));

        //* se ValorCofins encontrado, segue
        if (getRegValid_ValorCofins[0].UrlJsonContext.LVC_validacao) {
            //* campos dos impostos a comparar
            strPedido = getRegValid_ValorCofins[0].UrlJsonContext.campo_pedido;
            strDocumento = getRegValid_ValorCofins[0].UrlJsonContext.campo_documento;
            //* valores dos impostos a comparar
            numPedido = objNfse[0].UrlJsonContext[strPedido] ? parseFloat(objNfse[0].UrlJsonContext[strPedido].toFixed(2)) : 0;
            numDocumento = objNfse[0].UrlJsonContext[strDocumento] ? parseFloat(objNfse[0].UrlJsonContext[strDocumento].toFixed(2)) : 0;

            //* se imposto maior que tolerancia, armazena mensagem de erro no array
            if (Math.abs(numPedido - numDocumento) > tolerance) {
                arrErr.push(getRegValid_ValorCofins[0].UrlJsonContext.msg_erro + '\n');
            }
        }

        //* se houver erros, segue
        if (arrErr.length > 0) {
            //* cria objeto para onergy_updatemany
            postInfo = {
                UrlJsonContext: {
                    outras_informacoes: arrErr,
                },
            };

            //* fdtCompartliharDoctosParaValidacaoDeDuplicados
            //* isMultiUpdate: true - atualiza todos os registros
            //* contendo doc_original: MonitDoc + ConsDet
            // onergy.log('JFS: onergy_updatemany: fdtCompartliharDoctosParaValidacaoDeDuplicados: postInfo: ' + JSON.stringify(postInfo[0].UrlJsonContext));
            await onergy_updatemany({
                fdtid: fdtCompartliharDoctosParaValidacaoDeDuplicados,
                assid: data.onergy_js_ctx.assid ? data.onergy_js_ctx.assid : data.assid,
                usrid: data.onergy_js_ctx.usrid ? data.onergy_js_ctx.usrid : data.usrid,
                data: JSON.stringify(postInfo),
                filter: JSON.stringify([{ FielName: 'doc_original', Type: 'string', FixedType: 'string', Value1: data.doc_original }]),
                isMultiUpdate: true,
            });
        } else {
            //* se nao houver erros, move Nfse
            //* de MonitorDocumentos para MonitorAprovacao
            await sendToOnergy(
                fdtMonitDoc_Nfse,
                fdtMonitAp_Nfse,
                data.onergy_js_ctx.assid ? data.onergy_js_ctx.assid : data.assid,
                data.onergy_js_ctx.usrid ? data.onergy_js_ctx.usrid : data.usrid,
                data.onergy_js_ctx.fedid ? data.onergy_js_ctx.fedid : data.fedid
            );
        }
    }

    // onergy.log('JFS: endinitProcRetencao_ValidarRetencao');
    // return true;
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
const json = {
    doc_original: '9b99963f-3e5f-4a20-86fc-67d4e43acb63',
    idfk: '09d6b71e-4755-4116-98d4-2d3f96d92158',
    cnpj: '06990590000123',
    razaoSocial: 'GOOGLE BRASIL INTERNET LTDA.',
    valor: 610.33,
    valorNFe: 610.33,
    numeroNf: '18580268',
    chaveNfe: '07882930000165_20220803_18580268__06990590000123',
    codServico: '06298',
    munTomador: 3550308,
    munPrestador: 3550308,
    codIBGEMunicipioNota: 3550308,
    ISSRetido: false,
    prestadorCEP: 4538133,
    grpidResp: '',
    oneTemplateTitle: 'Consultar Lei Complementar',
    ass_id: 'a278fa91-cf28-4e29-8410-f2bf89a02d93',
    assid: 'a278fa91-cf28-4e29-8410-f2bf89a02d93',
    email: 'adm@mitre.com.br',
    fdtid: '60cc362c-fe45-4f2b-9cbc-7fb88deaeebe',
    fedid: '6ae7a8f8-4f92-4ac8-81e5-a89b45cf3af5',
    onergy_rolid: '',
    timezone: null,
    usrid: 'a08e0ca2-0ee3-4909-81f8-1e73c5ee9901',
    onergy_js_ctx: {
        assid: 'a278fa91-cf28-4e29-8410-f2bf89a02d93',
        fedid: '6ae7a8f8-4f92-4ac8-81e5-a89b45cf3af5',
        fdtid: '60cc362c-fe45-4f2b-9cbc-7fb88deaeebe',
        usrid: 'a08e0ca2-0ee3-4909-81f8-1e73c5ee9901',
        insertDt: '2022-08-24T12:53:49.16Z',
        updateDt: '2022-08-24T12:54:01.368Z',
        cur_userid: 'a08e0ca2-0ee3-4909-81f8-1e73c5ee9901',
        email: 'adm@mitre.com.br',
        user_name: 'ADM Mitre',
        onergy_rolid: '',
        praid: '01acf923-8ef8-4188-9f8f-4dde9de726e6',
        pcvid: '2ee9a653-fbd9-42fd-b237-81049f7dddf6',
        prcid: 'b1e7617c-b585-a4e8-c439-2a9d09d9dd5b',
        timezone: null,
        timezone_value: '-03:00',
        pubNubHook: null,
    },
    anexos: [
        {
            Name: 'Simples.html',
            UrlAzure:
                'https://api.onergy.com.br//api/storage/a278fa91-cf28-4e29-8410-f2bf89a02d93/3ac84f42-0200-49f0-9acb-89576859c1fc?ofname=133b6105036f43c9822b3f60befc8f0f_0_8LU.html',
            Url: 'https://api.onergy.com.br//api/storage/a278fa91-cf28-4e29-8410-f2bf89a02d93/3ac84f42-0200-49f0-9acb-89576859c1fc?ofname=133b6105036f43c9822b3f60befc8f0f_0_8LU.html',
        },
    ],
    simples_nacional: false,
    cadastro_no_cpom: 'Cadastrado no CEPOM',
};

init(JSON.stringify(json));
