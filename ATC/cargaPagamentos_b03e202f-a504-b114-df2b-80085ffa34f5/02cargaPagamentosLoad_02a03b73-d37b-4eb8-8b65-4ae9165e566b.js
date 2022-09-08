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
/*async*/ function getOnergyItem(fdtid, assid, usrid, filtro) {
    let keepSearching = true;
    let skip = 0;
    let take = 500;
    let result = [];
    while (keepSearching) {
        let strPageResp = /*await*/ onergy_get({
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

/*async*/ function init(json) {
    let data = JSON.parse(json);
    const fdtidFaturasEnergia = '11bb183c-d30d-4ed9-af2d-286b2dcb1a89';
    const fdtidPagamentoFaturas = 'd30c5633-af5b-42b5-9d16-b1d4b6cbbb83';
    const fdtidContadeEnergia = 'd2e36529-ae04-4fd3-9658-2867d2c684cb';
    const fdtidCargaPagamentos = 'a2711eb9-33a9-4b90-bf43-f568b253865b';
    const fdtidConfiguracoes = 'efb11b9d-58d7-45fb-a8cd-d0ffbc707d0f';
    let status_desc = '';
    let strArrExcel = /*await*/ ReadExcelToJson({
        url: data.planilha[0].UrlAzure,
    });
    let dataExcel = JSON.parse(strArrExcel);
    let tabExcel = data.CIP_tab_excel_pagamentos;
    let equipe = data.CIP_equipe_pagamentos;
    let arrSave = [];
    if (dataExcel !== null) {
        let arrInfo = dataExcel[tabExcel];
        for (let line in arrInfo) {
            let objItem = {};
            objItem.id_upload_planilha = data.id_upload_planilha;
            objItem.load_index_equipe = equipe;
            objItem.load_index_id_equipe = data.CIP_id_equipe_pagamentos;
            if (tabExcel == 'Facturas') {
                // ABA FACTURAS
                objItem.valor_total_informado = arrInfo[line]['VALOR FATURA INFORMADO'];
                objItem.total_da_fatura_calculada = arrInfo[line][''];
                objItem.reajuste = arrInfo[line][''];
                objItem.overflow = arrInfo[line][''];
                objItem.total_da_fatura_validado = arrInfo[line][''];
                objItem.valor_da_energia_calculado = arrInfo[line][''];
                objItem.compensacao_de_energia = arrInfo[line]['Compensação de Energia'];
                objItem.outros_energia = arrInfo[line]['Outros Energia'];
                objItem.taxa_de_iluminacao = arrInfo[line]['Taxa de Iluminação'];
                objItem.outros_custos_total = arrInfo[line][''];
                objItem.energia_de_contribuicao = arrInfo[line]['Energia de Contribuição'];
                objItem.agua_e_esgoto = arrInfo[line]['Água e Esgoto'];
                objItem.valor_energia = arrInfo[line]['VALOR ENERGIA INFORMADO'];
                objItem.valor_da_energia_validado = arrInfo[line][''];
                objItem.consumo_kwh = arrInfo[line]['Consumo KW/h'];
                objItem.valor_kwh = arrInfo[line]['Valor Kw/h'];
                objItem.juros_de_mora = arrInfo[line]['Juros de Mora'];
                objItem.taxa_de_conexao = arrInfo[line]['Taxa de Conexão'];
                objItem.aluguel_do_medidor = arrInfo[line]['Aluguel do Medidor'];
                objItem.financiamentos = arrInfo[line]['Financiamentos'];
                objItem.reconexao = arrInfo[line]['Reconexão'];
                objItem.iva = arrInfo[line]['IVA'];
                objItem.imposto_de_vigilancia = arrInfo[line]['Imposto de Vigilância'];
                objItem.data_de_pagamento = arrInfo[line]['Data de Pagamento'];
                objItem.valor_pago = arrInfo[line][''];
                objItem.status = arrInfo[line][''];
                objItem.asset_number = arrInfo[line]['CMS'];
                objItem.razao_social_concessionaria = arrInfo[line]['Razão Social Concessionária'];
                objItem.id_da_concessionaria = arrInfo[line]['Id da Concessionária'];
                objItem.titularidade_da_conta = arrInfo[line]['Titularidade da Conta'];
                objItem.data_inicio_pagamento = arrInfo[line]['Data Início Pagamento'];
                objItem.data_fim_pagamento = arrInfo[line]['Data Fim Pagamento'];
                objItem.referencia__competencia = arrInfo[line]['Referência / Competência'];
                objItem.data_emissao = arrInfo[line]['Data de Emissão'];
                objItem.data_vencimento = arrInfo[line]['Data do Vencimento'];
                objItem.tipo_de_leitura = arrInfo[line]['Tipo de Leitura'];
                objItem.numero_do_medidor = arrInfo[line]['Número do Medidor'];
                objItem.numero_da_conta = arrInfo[line]['Número da Conta'];
                objItem.conta_especial = arrInfo[line]['Conta Especial'];
                objItem.numero_da_nota_fiscal = arrInfo[line]['Número da Nota Fiscal'];
            } else {
                // ABA PAGOS
                objItem.numero_documento_comprobatorio = arrInfo[line]['Número Obligación'];
                objItem.data_de_registro = arrInfo[line]['Fecha Inscripción'];
                objItem.tipo_de_conta = arrInfo[line]['Tipo Cuenta'];
                objItem.conta_de_debito = arrInfo[line]['Cuenta Débito'];
                objItem.nit_da_conta = arrInfo[line]['NIT de la Cuenta'];
                objItem.valor_lancamento = arrInfo[line]['Valor Pago'];
                objItem.data_pagamento = arrInfo[line]['Fecha Pago'];
                objItem.data_programada = arrInfo[line]['Fecha Programada'];
            }
            objItem.resultado_processamento = 'Carga Realizada';
            arrSave.push(objItem);
        }
    }

    if (arrSave !== null && arrSave.length > 0) {
        if (tabExcel == 'Facturas') {
            if (equipe == 'BRA') {
                //* !InsertManyOnergy
                // onergy.log('BRA-ContadeEnergia');
                onergy.InsertManyOnergy(arrSave, fdtidContadeEnergia, data.usrid);
            } else {
                //* !InsertManyOnergy
                // onergy.log('COL-Facturas');
                onergy.InsertManyOnergy(arrSave, fdtidFaturasEnergia, data.usrid);
            }
        } else {
            //* !InsertManyOnergy
            // onergy.log('COL-Pagos');
            onergy.InsertManyOnergy(arrSave, fdtidPagamentoFaturas, data.usrid);
        }
        status_desc = 'Carga Realizada';
    } else {
        status_desc = 'Error: documento indefinido';
    }

    let postInfo = {
        UrlJsonContext: {
            processamento: status_desc,
        },
    };

    //* !onergy_updatemany
    // onergy.log('postInfo: ' + JSON.stringify(postInfo));
    let strFiltro = gerarFiltro('_id', data.id_upload_planilha);
    onergy_updatemany({
        fdtid: fdtidCargaPagamentos,
        assid: data.onergy_js_ctx.assid,
        usrid: data.onergy_js_ctx.usrid,
        data: JSON.stringify(postInfo),
        filter: strFiltro,
    });

    let regPagFaturas = /*await*/ getOnergyItem(fdtidPagamentoFaturas, data.assid, data.usrid, null);
    let regFatEnergia = /*await*/ getOnergyItem(fdtidFaturasEnergia, data.assid, data.usrid, null);
    let valTolerancia = /*await*/ getOnergyItem(fdtidConfiguracoes, data.assid, data.usrid, null);
    for (let i in regPagFaturas) {
        let isValid = false;
        let objPagFaturas = regPagFaturas[i].UrlJsonContext;
        if (regPagFaturas[i].UrlJsonContext.resultado_processamento == 'Carga Realizada') {
            for (let j in regFatEnergia) {
                let objFatEnergia = regFatEnergia[j].UrlJsonContext;
                if (regPagFaturas[i].UrlJsonContext.numero_documento_comprobatorio == regFatEnergia[j].UrlJsonContext.numero_da_nota_fiscal) {
                    if (regPagFaturas[i].UrlJsonContext.data_programada !== null && regPagFaturas[i].UrlJsonContext.data_programada.length > 0) {
                        objFatEnergia.status = 'Programado';
                        isValid = true;
                    } else {
                        if (regFatEnergia[j].UrlJsonContext.data_de_pagamento !== null && regFatEnergia[j].UrlJsonContext.data_de_pagamento.length > 0) {
                            objPagFaturas.resultado_processamento = 'Registro Duplicado';
                            isValid = true;
                        } else {
                            objFatEnergia.data_de_pagamento = regPagFaturas[i].UrlJsonContext.data_pagamento;
                            objFatEnergia.valor_pago = regPagFaturas[i].UrlJsonContext.valor_lancamento;

                            let strTolerancia = valTolerancia.find((o) => o.UrlJsonContext.nome_interno == 'limite_ajuste');
                            let highTolerancia = regFatEnergia[j].UrlJsonContext.valor_total_informado + Number(strTolerancia.UrlJsonContext.valor);
                            let lowTolerancia = regFatEnergia[j].UrlJsonContext.valor_total_informado - Number(strTolerancia.UrlJsonContext.valor);
                            if (regFatEnergia[j].UrlJsonContext.valor_pago > lowTolerancia && regFatEnergia[j].UrlJsonContext.valor_pago < highTolerancia) {
                                objFatEnergia.status = 'Pago OK';
                                isValid = true;
                            } else {
                                objFatEnergia.status = 'Valor Pago Incorrecto';
                                isValid = true;
                            }
                        }
                    }
                } else {
                    if (!isValid && regFatEnergia.length - 1 == j) {
                        objPagFaturas.resultado_processamento = 'Factura no Encontrada';
                    }
                }

                //* !onergy_save
                // onergy.log('COL-Facturas: ' + JSON.stringify(regFatEnergia[j].UrlJsonContext.numero_da_nota_fiscal + ' ' + objFatEnergia.status));
                let onergySaveData = {
                    fdtid: fdtidFaturasEnergia,
                    assid: data.assid,
                    usrid: data.usrid,
                    data: JSON.stringify(objFatEnergia),
                    id: regFatEnergia[j].ID,
                };
                let saveFacturas = /*await*/ onergy_save(onergySaveData);
            }
        }

        //* !onergy_save
        // onergy.log('COL-Pagos: ' + JSON.stringify(regPagFaturas[i].UrlJsonContext.numero_documento_comprobatorio + ' ' + objPagFaturas.resultado_processamento));
        let onergySaveData = {
            fdtid: fdtidPagamentoFaturas,
            assid: data.assid,
            usrid: data.usrid,
            data: JSON.stringify(objPagFaturas),
            id: regPagFaturas[i].ID,
        };
        let savePagos = /*await*/ onergy_save(onergySaveData);
    }

    //* !SetObjectResponse
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
    var obj = {
        cond: cond,
        json: JSON.stringify(json),
        WaitingWebHook: WaitingWebHook,
    };
    return obj;
}
