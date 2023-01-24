/**ENV_NODE** =====================================================================================
 */
// eslint-disable-next-line no-unused-vars
const { date } = require('assert-plus');
// eslint-disable-next-line no-unused-vars
const { formatDate } = require('tough-cookie');
// eslint-disable-next-line no-unused-vars
const { log, debug } = require('console');
// eslint-disable-next-line no-unused-vars
const { memory } = require('console');
// eslint-disable-next-line no-unused-vars
const { resolve } = require('path');
// eslint-disable-next-line no-unused-vars
const { type } = require('os');
// eslint-disable-next-line no-unused-vars
const axios = require('axios');
// eslint-disable-next-line no-unused-vars
const fs = require('fs');
// eslint-disable-next-line no-unused-vars
const jsuser = require('../../onergy/onergy-utils');
const onergy = require('../../onergy/onergy-client');
// eslint-disable-next-line no-unused-vars
const utils = require('../../onergy/onergy-utils');
// eslint-disable-next-line no-unused-vars
async function ajax(args) {
    return await onergy.ajax(args);
}
// eslint-disable-next-line no-unused-vars
async function ajaxPost(args) {
    return await onergy.ajaxPost(args);
}
// eslint-disable-next-line no-unused-vars
async function hashMd5(args) {
    return await onergy.hashMd5(args);
}
// eslint-disable-next-line no-unused-vars
async function increment(args) {
    return await onergy.increment(args);
}
// eslint-disable-next-line no-unused-vars
async function onergy_countdocs(args) {
    return await onergy.onergy_countdocs(args);
}
async function onergy_get(args) {
    let r = await onergy.onergy_get(args);
    return JSON.stringify(r);
}
// eslint-disable-next-line no-unused-vars
async function onergy_save(args) {
    return await onergy.onergy_save(args);
}
async function ReadExcelToJson(args) {
    return await onergy.ReadExcelToJson(args);
}
// eslint-disable-next-line no-unused-vars
async function ReadTextPdf(args) {
    return await onergy.ReadTextPdf(args);
}
// eslint-disable-next-line no-unused-vars
async function sendmail(args) {
    return await onergy.sendmail(args);
}
// eslint-disable-next-line no-unused-vars
async function onergy_sendto(args) {
    let r = await onergy.onergy_sendto(args);
    return JSON.stringify(r);
}
async function onergy_updatemany(args) {
    return await onergy.onergy_save(args);
}
// eslint-disable-next-line no-unused-vars
function failureCallback(error) {
    console.log('It failed with ' + error);
}
// eslint-disable-next-line no-unused-vars
function get_usr_tmz_dt_now(data) {
    return data;
}
// eslint-disable-next-line no-unused-vars
function replaceAll(content, needle, replacement) {
    return content.split(needle).join(replacement);
}
// eslint-disable-next-line no-unused-vars
function successCallback(result) {
    console.log('It succeeded with ' + result);
}
/**CLI_SCRIPT** ===================================================================================
 * Executar automático quando em processo: Sim
 * Atividade de longa duração: Não
 * Esconder Menu: Sim
 * Condicional: nenhum
 * Aprovação: nenhum
 */
let faturasPaiID = '822245f3-b0de-4f74-830b-90c8c8efee15';
let faturaFilhasID = '11bb183c-d30d-4ed9-af2d-286b2dcb1a89';

async function init(json) {
    let data = JSON.parse(json);
    onergy.log(`JFS ~ archivos-DA ~ init ~ data: ${JSON.stringify(data)}`);

    let result = {};
    let log = [];

    /*
    onergy.log(JSON.stringify({
        "type": "Message",
        "origem": "Carga Pagos Banco de Tesoreria:Archivos:init",
        "data": data
    }));
    */

    try {
        await atualizaRegistros(data, [`${data.onergy_js_ctx.fdtid}/${data.onergy_js_ctx.fedid}`], { status: 'PROCESANDO' });

        let strArrExcel = await ReadExcelToJson({
            url: data.CPDA_carregar_arquivo_da_tesouraria[0].UrlAzure,
        });
        dataExcel = JSON.parse(strArrExcel);

        let resultValidarExcel = validarExcel(dataExcel);
        if (resultValidarExcel.status == 'NOK') {
            result.log = resultValidarExcel.message;
            result.status = 'FINALIZADO';
            return SetObjectResponse(false, result, false);
        }

        for (let s in dataExcel['Pagos Banco']) {
            let resultValidacaoValores = validarValores(s, dataExcel['Pagos Banco'][s]);
            if (resultValidacaoValores.status == 'NOK') {
                log.push(resultValidacaoValores.message);
                continue;
            }

            let filtroFaturaIndividuais = JSON.stringify([
                { FielName: 'nit_provedor', Type: 'string', FixedType: 'string', Value1: dataExcel['Pagos Banco'][s]['Nit'].toString() },
                { FielName: 'numero_da_nota_fiscal', Type: 'string', FixedType: 'string', Value1: dataExcel['Pagos Banco'][s]['Número Obligación'].toString() },
                { FielName: 'tipo_de_conta', Type: 'string', FixedType: 'string', Value1: 'I' },
            ]);
            let faturaFilha = await getOnergyItem(faturaFilhasID, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, filtroFaturaIndividuais);

            let filtroFaturaPadres = JSON.stringify([
                { FielName: 'nit_provedor', Type: 'string', FixedType: 'string', Value1: dataExcel['Pagos Banco'][s]['Nit'].toString() },
                { FielName: 'numero_da_nota_fiscal', Type: 'string', FixedType: 'string', Value1: dataExcel['Pagos Banco'][s]['Número Obligación'].toString() },
                { FielName: 'tipo_de_conta', Type: 'string', FixedType: 'string', Value1: ['P', 'PH'] },
            ]);
            let faturaPai = await getOnergyItem(faturasPaiID, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, filtroFaturaPadres);

            let FATURAS = faturaFilha.concat(faturaPai);

            if (FATURAS.length == 0) {
                let messageLog = [];
                messageLog.push(`Linea ${Number(s) + 2}:`);
                messageLog.push(
                    `    Factura con NIT Proveedor: ${dataExcel['Pagos Banco'][s]['Nit']} y Número de Factura: ${dataExcel['Pagos Banco'][s]['Número Obligación']} no encontrada.`
                );
                log.push(messageLog.join('\n'));
                continue;
            }

            let FATURA = FATURAS.find((VALUE) => VALUE.UrlJsonContext.ESTLstatus__legalizacao_do_status != 'DUPLICADA');
            if (!FATURA) {
                let messageLog = [];
                messageLog.push(`Linha ${Number(s) + 2}:`);
                messageLog.push(
                    `    Factura con NIT Proveedor: ${dataExcel['Pagos Banco'][s]['Nit']} y Número de Factura: ${dataExcel['Pagos Banco'][s]['Número Obligación']} no encontrada.`
                );
                log.push(messageLog.join('\n'));
                continue;
            }

            const LINHA = dataExcel['Pagos Banco'][s];
            let faturaPostInfo = {
                valor_pago: LINHA['Valor Pago'] ? LINHA['Valor Pago'] : 0,
                data_de_pagamento: LINHA['Fecha Programada'] ? LINHA['Fecha Programada'] : '',
                data_de_pagamentoDate: LINHA['Fecha Programada'] ? LINHA['Fecha Programada'] : '',
                data_programada: LINHA['Fecha Pago'] ? LINHA['Fecha Pago'] : '',
                data_programadaDate: LINHA['Fecha Pago'] ? LINHA['Fecha Pago'] : '',
            };

            if (LINHA['Estado'] == '') {
                faturaPostInfo.ESTPstatus__status_pagamento = 'ERROR PAGO';
                faturaPostInfo.ESTPstatus_pagamento_id = '5ba8e811-9e5b-b6fe-725d-d17b1e43275d';
                await atualizaRegistros(data, [`${FATURA.templateid}/${FATURA.ID}`], faturaPostInfo);
                continue;
            }

            if (!LINHA['Valor Pago'] && LINHA['Fecha Pago']) {
                await atualizaRegistros(data, [`${FATURA.templateid}/${FATURA.ID}`], faturaPostInfo);
                continue;
            }

            let faturaPagoParcial = FATURA.UrlJsonContext.CDE__valor_a_pagar_parcial;
            if (faturaPagoParcial && faturaPagoParcial > 0) {
                if (faturaPagoParcial == LINHA['Valor Pago']) {
                    faturaPostInfo.ESTPstatus__status_pagamento = 'PAGADO PARCIAL';
                    faturaPostInfo.ESTPstatus_pagamento_id = '38c15739-16d7-ae80-9090-27847a763ec7';
                } else {
                    faturaPostInfo.ESTPstatus__status_pagamento = 'ERROR PAGO';
                    faturaPostInfo.ESTPstatus_pagamento_id = '5ba8e811-9e5b-b6fe-725d-d17b1e43275d';
                }
            } else {
                if (FATURA.UrlJsonContext.valor_total_informado == LINHA['Valor Pago']) {
                    faturaPostInfo.ESTPstatus__status_pagamento = 'PAGADO TOTAL';
                    faturaPostInfo.ESTPstatus_pagamento_id = 'abf883d7-f8ee-420c-ce36-3ce694233ebc';
                } else {
                    faturaPostInfo.ESTPstatus__status_pagamento = 'ERROR PAGO';
                    faturaPostInfo.ESTPstatus_pagamento_id = '5ba8e811-9e5b-b6fe-725d-d17b1e43275d';
                }
            }
            await atualizaRegistros(data, [`${FATURA.templateid}/${FATURA.ID}`], faturaPostInfo);

            if (faturaPostInfo.ESTPstatus__status_pagamento != 'ERROR PAGO') {
                if (FATURA.UrlJsonContext.ESTLstatus__legalizacao_do_status == 'RELIQUIDADA') {
                    let filtroFaturareliquidadas = JSON.stringify([{ FielName: 'id_fatura_original', Type: 'string', FixedType: 'string', Value1: FATURA.ID }]);
                    let FATURAS_RELIDADAS = await getOnergyItem(faturaFilhasID, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, filtroFaturareliquidadas);
                    if (FATURAS_RELIDADAS.length > 0) {
                        let FATURAS_RELIDADAS_IDs = FATURAS_RELIDADAS.map((VALUE) => `${faturaFilhasID}/${VALUE.ID}`);
                        await atualizaRegistros(data, FATURAS_RELIDADAS_IDs, faturaPostInfo);
                    }
                } else if (FATURA.UrlJsonContext.tipo_de_conta == 'PH') {
                    if (FATURA.UrlJsonContext.CDE__mes_processo) {
                        let filtro_HH_H = JSON.stringify([
                            { FielName: 'CDE__mes_processo', Type: 'string', FixedType: 'string', Value1: FATURA.UrlJsonContext.CDE__mes_processo },
                            { FielName: 'conta_pai', Type: 'string', FixedType: 'string', Value1: FATURA.UrlJsonContext.conta_pai },
                            { FielName: 'tipo_de_conta', Type: 'string', FixedType: 'string', Value1: ['H', 'HH'] },
                        ]);
                        let FATURAS_HH_H = await getOnergyItem(faturaFilhasID, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, filtro_HH_H);
                        if (FATURAS_HH_H.length > 0) {
                            let FATURAS_HH_H_IDS = FATURAS_HH_H.map((VALUE) => `${faturaFilhasID}/${VALUE.ID}`);
                            await atualizaRegistros(data, FATURAS_HH_H_IDS, faturaPostInfo);
                        }
                    }
                } else if (FATURA.UrlJsonContext.tipo_de_conta == 'P') {
                    if (FATURA.UrlJsonContext.CDE__mes_processo) {
                        let filtro_H = JSON.stringify([
                            { FielName: 'CDE__mes_processo', Type: 'string', FixedType: 'string', Value1: FATURA.UrlJsonContext.CDE__mes_processo },
                            { FielName: 'conta_pai', Type: 'string', FixedType: 'string', Value1: FATURA.UrlJsonContext.conta_pai },
                            { FielName: 'tipo_de_conta', Type: 'string', FixedType: 'string', Value1: ['H'] },
                        ]);
                        let FATURAS_H = await getOnergyItem(faturaFilhasID, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, filtro_H);
                        if (FATURAS_H.length > 0) {
                            let FATURAS_H_IDS = FATURAS_H.map((VALUE) => `${faturaFilhasID}/${VALUE.ID}`);
                            await atualizaRegistros(data, FATURAS_H_IDS, faturaPostInfo);
                        }
                    }
                }
            }
        }

        result.status = 'FINALIZADO';
        result.log = log.length > 0 ? log.join('\n') : '';
        return SetObjectResponse(false, result, false);
    } catch (erro) {
        onergy.log(
            JSON.stringify({
                type: 'Erro',
                origem: 'Carga Pagos Banco de Tesoreria:Carga Pagos Banco de Tesoreria:init',
                stack: erro.stack,
                message: erro.message,
                data: data,
            })
        );

        let logErro = [];
        logErro.push('** ERROR **');
        logErro.push(`Message: ${erro.message}`);
        logErro.push(`Stack: ${erro.stack}`);
        result.log = logErro.join('\n');
        result.status = 'ERROR';
        return SetObjectResponse(false, result, false);
    }
}

// eslint-disable-next-line no-unused-vars
function initBefore(json) {
    //return true;
}

// eslint-disable-next-line no-unused-vars
function initDelete(json) {
    //return true;
}

function SetObjectResponse(cond, json, WaitingWebHook) {
    if (WaitingWebHook === undefined) {
        WaitingWebHook = false;
    }

    var obj = {
        cond: cond,
        WaitingWebHook: WaitingWebHook,
    };

    if (json && Object.keys(json).length > 0) {
        obj.json = JSON.stringify(json);
    }

    return obj;
}

const getOnergyItem = async (fdtid, assid, usrid, filtro) => {
    let strResp = await onergy_get({
        fdtid: fdtid,
        assid: assid,
        usrid: usrid,
        filter: filtro,
    });
    return JSON.parse(strResp);
};

const validarValores = (index, linha) => {
    let result = [`Linea ${Number(index) + 2}:`];
    if (!linha['Nit']) {
        result.push('   NIT Proveedor inválido.');
    }

    if (!linha['Número Obligación']) {
        result.push('    Número Factura inválido.');
    }

    let estadoPago = linha['Estado'];
    if (!estadoPago || (estadoPago != 'E' && estadoPago != 'P')) {
        result.push('    Estado Pago inválido.');
    }

    if (linha['Valor Pago']) {
        if (!Number(linha['Valor Pago']) && Number(linha['Valor Pago']) != 0) {
            result.push('    Valor Pago inválido.');
        }
    }

    if (linha['Fecha Programada']) {
        let dataPago = new Date(linha['Fecha Programada']);
        if (dataPago == 'Invalid Date') {
            result.push('    Fecha Pago inválido.');
        }
    }

    if (linha['Fecha Pago']) {
        let dataProgramada = new Date(linha['Fecha Pago']);
        if (dataProgramada == 'Invalid Date') {
            result.push('    Fecha Programada inválido.');
        }
    }

    return {
        status: result.length > 1 ? 'NOK' : 'OK',
        message: result.length > 1 ? result.join('\n') : '',
    };
};

const validarExcel = (excel) => {
    let result = [];

    if (!dataExcel.hasOwnProperty(['Pagos Banco'])) {
        result.push('TAB Pagos Banco no encontrada.');
    } else if (dataExcel['Pagos Banco'].length == 0) {
        result.push('Planilla Excel sin valores.');
    } else {
        if (!excel['Pagos Banco'][0].hasOwnProperty('Nit')) {
            result.push("Columna 'Nit' no encontrada.");
        }
        if (!excel['Pagos Banco'][0].hasOwnProperty('Número Obligación')) {
            result.push("Columna 'Número Obligación' no encontrada.");
        }
        if (!excel['Pagos Banco'][0].hasOwnProperty('Estado')) {
            result.push("Columna 'Estado' no encontrada.");
        }
        if (!excel['Pagos Banco'][0].hasOwnProperty('Valor Pago')) {
            result.push("Columna 'Valor Pago' no encontrada.");
        }
        if (!excel['Pagos Banco'][0].hasOwnProperty('Fecha Programada')) {
            result.push("Columna 'Fecha Programada' no encontrada.");
        }
        if (!excel['Pagos Banco'][0].hasOwnProperty('Fecha Pago')) {
            result.push("Columna 'Fecha Pago' no encontrada.");
        }
    }
    return {
        status: result.length > 0 ? 'NOK' : 'OK',
        message: result.length > 0 ? result.join('\n') : '',
    };
};

const atualizaRegistros = async (data, IDS, postInfo) => {
    for (let ID of IDS) {
        await onergy_updatemany({
            fdtid: ID.split('/')[0],
            assid: data.onergy_js_ctx.assid,
            usrid: data.onergy_js_ctx.usrid,
            id: ID.split('/')[1],
            data: JSON.stringify({
                UrlJsonContext: postInfo,
            }),
        });
    }
};

// eslint-disable-next-line no-unused-vars
const gerarData = async (dataHoje) => {
    let dataHojeFormat = dataHoje.getFullYear() + '-' + (dataHoje.getMonth() + 1) + '-' + dataHoje.getDate();
    let arrayData = dataHojeFormat.split('-');
    let dataHojeFormatada = arrayData[0] + '-' + arrayData[1].padStart(2, '0') + '-' + arrayData[2].padStart(2, '0');
    return dataHojeFormatada;
};
/**MET_PADRAO =====================================================================================
 */
let json = {
    archivos: '',
    hora_da_carga: '06:56',
    CPDA_carregar_arquivo_da_tesouraria: [
        {
            Url: 'https://onebackupservices.blob.core.windows.net/67c0b77d-abae-4c48-ba4b-6c8faf27e14a/DEBITOS ENERO BANCO COLPATRIA REPORTE 1.xlsx2d3121d1-c812-40b4-ac60-e10d047e3d5b.xlsx?sv=2018-03-28&sr=b&sig=rUSCjeY%2FXlNahgvzJMAtJqDeozjJU6XR%2B%2FQCzmpJwNs%3D&se=2023-08-05T09%3A56%3A22Z&sp=r',
            UrlAzure:
                'https://onebackupservices.blob.core.windows.net/67c0b77d-abae-4c48-ba4b-6c8faf27e14a/DEBITOS ENERO BANCO COLPATRIA REPORTE 1.xlsx2d3121d1-c812-40b4-ac60-e10d047e3d5b.xlsx?sv=2018-03-28&sr=b&sig=rUSCjeY%2FXlNahgvzJMAtJqDeozjJU6XR%2B%2FQCzmpJwNs%3D&se=2023-08-05T09%3A56%3A22Z&sp=r',
            Name: 'DEBITOS ENERO BANCO COLPATRIA REPORTE 1.xlsx',
        },
    ],
    oneTemplateTitle: 'Archivos - DA',
    data_de_upload: '2023-01-17 06:56:52',
    data_de_uploadDate: '2023-01-17T09:56:52Z',
    status: 'PROCESANDO',
    ass_id: '67c0b77d-abae-4c48-ba4b-6c8faf27e14a',
    assid: '67c0b77d-abae-4c48-ba4b-6c8faf27e14a',
    email: 'adm@atc.com.br',
    fdtid: '93e63d10-d356-4301-8909-9bba81ba1653',
    fedid: 'ec6195d1-e7b3-b717-74b2-5aff91020d43',
    onergy_rolid: '',
    timezone: null,
    usrid: '1ec86197-d331-483a-b325-62cc26433ea5',
    onergy_js_ctx: {
        assid: '67c0b77d-abae-4c48-ba4b-6c8faf27e14a',
        fedid: 'ec6195d1-e7b3-b717-74b2-5aff91020d43',
        fdtid: '93e63d10-d356-4301-8909-9bba81ba1653',
        usrid: '1ec86197-d331-483a-b325-62cc26433ea5',
        insertDt: '2023-01-17T09:56:49.924Z',
        updateDt: '2023-01-17T09:56:52.357Z',
        cur_userid: '1ec86197-d331-483a-b325-62cc26433ea5',
        email: 'adm@atc.com.br',
        user_name: 'ADM ATC',
        onergy_rolid: '',
        praid: 'edd996d2-f463-4fbc-94af-3955d767f994',
        pcvid: 'be0b5d8d-601b-4ced-a96f-383c3f73c273',
        prcid: 'c019f8a6-6a6d-fb8f-c9ac-2ae0b69cb707',
        timezone: null,
        timezone_value: '-03:00',
        pubNubHook: null,
    },
};
init(JSON.stringify(json));
