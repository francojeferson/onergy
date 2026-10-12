/**ENV_NODE** =====================================================================================
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
    onergy.log(`JFS ~ archivos ~ init ~ data: ${JSON.stringify(data)}`);

    let result = {};
    let log = [];

    /*
    onergy.log(JSON.stringify({
        "type": "Message",
        "origem": "Carga Sheet1 de Tesoreria:Archivos:init",
        "data": data
    }));
    */

    try {
        await atualizaRegistros(data, [`${data.onergy_js_ctx.fdtid}/${data.onergy_js_ctx.fedid}`], { status: 'PROCESANDO' });

        let strArrExcel = await ReadExcelToJson({
            url: data.CPDT_carregar_arquivo_da_tesouraria[0].UrlAzure,
        });
        dataExcel = JSON.parse(strArrExcel);

        let resultValidarExcel = validarExcel(dataExcel);
        if (resultValidarExcel.status == 'NOK') {
            result.log = resultValidarExcel.message;
            result.status = 'FINALIZADO';
            return SetObjectResponse(false, result, false);
        }

        for (let s in dataExcel.Sheet1) {
            let resultValidacaoValores = validarValores(s, dataExcel.Sheet1[s]);
            if (resultValidacaoValores.status == 'NOK') {
                log.push(resultValidacaoValores.message);
                continue;
            }

            let filtroFaturaIndividuais = JSON.stringify([
                { FielName: 'nit_provedor', Type: 'string', FixedType: 'string', Value1: dataExcel.Sheet1[s]['Tax Payer ID'].toString() },
                { FielName: 'numero_da_nota_fiscal', Type: 'string', FixedType: 'string', Value1: dataExcel.Sheet1[s]['Invoice Number'].toString() },
                { FielName: 'tipo_de_conta', Type: 'string', FixedType: 'string', Value1: 'I' },
            ]);
            let faturaFilha = await getOnergyItem(faturaFilhasID, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, filtroFaturaIndividuais);

            let filtroFaturaPadres = JSON.stringify([
                { FielName: 'nit_provedor', Type: 'string', FixedType: 'string', Value1: dataExcel.Sheet1[s]['Tax Payer ID'].toString() },
                { FielName: 'numero_da_nota_fiscal', Type: 'string', FixedType: 'string', Value1: dataExcel.Sheet1[s]['Invoice Number'].toString() },
                { FielName: 'tipo_de_conta', Type: 'string', FixedType: 'string', Value1: ['P', 'PH'] },
            ]);
            let faturaPai = await getOnergyItem(faturasPaiID, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, filtroFaturaPadres);

            let FATURAS = faturaFilha.concat(faturaPai);

            if (FATURAS.length == 0) {
                let messageLog = [];
                messageLog.push(`Linea ${Number(s) + 2}:`);
                messageLog.push(
                    `    Factura con NIT Proveedor: ${dataExcel.Sheet1[s]['Tax Payer ID']} y Número de Factura: ${dataExcel.Sheet1[s]['Invoice Number']} no encontrada.`
                );
                log.push(messageLog.join('\n'));
                continue;
            }

            let FATURA = FATURAS.find((VALUE) => VALUE.UrlJsonContext.ESTLstatus__legalizacao_do_status != 'DUPLICADA');
            if (!FATURA) {
                let messageLog = [];
                messageLog.push(`Linha ${Number(s) + 2}:`);
                messageLog.push(
                    `    Factura con NIT Proveedor: ${dataExcel.Sheet1[s]['Tax Payer ID']} y Número de Factura: ${dataExcel.Sheet1[s]['Invoice Number']} no encontrada.`
                );
                log.push(messageLog.join('\n'));
                continue;
            }

            const LINHA = dataExcel.Sheet1[s];
            let faturaPostInfo = {
                valor_pago: LINHA['Amount Paid'] ? LINHA['Amount Paid'] : 0,
                data_de_pagamento: LINHA['Check Date'] ? LINHA['Check Date'] : '',
                data_de_pagamentoDate: LINHA['Check Date'] ? LINHA['Check Date'] : '',
                data_programada: LINHA['Due Date'] ? LINHA['Due Date'] : '',
                data_programadaDate: LINHA['Due Date'] ? LINHA['Due Date'] : '',
            };

            if (LINHA['Check Status'] == 'AVOIDED') {
                faturaPostInfo.ESTPstatus__status_pagamento = 'ERROR PAGO';
                faturaPostInfo.ESTPstatus_pagamento_id = '5ba8e811-9e5b-b6fe-725d-d17b1e43275d';
                await atualizaRegistros(data, [`${FATURA.templateid}/${FATURA.ID}`], faturaPostInfo);
                continue;
            }

            if (!LINHA['Amount Paid'] && LINHA['Due Date']) {
                await atualizaRegistros(data, [`${FATURA.templateid}/${FATURA.ID}`], faturaPostInfo);
                continue;
            }

            let faturaPagoParcial = FATURA.UrlJsonContext.CDE__valor_a_pagar_parcial;
            if (faturaPagoParcial && faturaPagoParcial > 0) {
                if (faturaPagoParcial == LINHA['Amount Paid']) {
                    faturaPostInfo.ESTPstatus__status_pagamento = 'PAGADO PARCIAL';
                    faturaPostInfo.ESTPstatus_pagamento_id = '38c15739-16d7-ae80-9090-27847a763ec7';
                } else {
                    faturaPostInfo.ESTPstatus__status_pagamento = 'ERROR PAGO';
                    faturaPostInfo.ESTPstatus_pagamento_id = '5ba8e811-9e5b-b6fe-725d-d17b1e43275d';
                }
            } else {
                if (FATURA.UrlJsonContext.valor_total_informado == LINHA['Amount Paid']) {
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
                origem: 'Carga Sheet1 de Tesoreria:Carga Sheet1 de Tesoreria:init',
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

function initBefore(json) {
    //return true;
}

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
    if (!linha['Tax Payer ID']) {
        result.push('   NIT Proveedor inválido.');
    }

    if (!linha['Invoice Number']) {
        result.push('    Número Factura inválido.');
    }

    let estadoPago = linha['Check Status'];
    if (!estadoPago || (estadoPago != 'NEGOTIABLE' && estadoPago != 'AVOIDED')) {
        result.push('    Estado Pago inválido.');
    }

    if (linha['Amount Paid']) {
        if (!Number(linha['Amount Paid']) && Number(linha['Amount Paid']) != 0) {
            result.push('    Valor Pago inválido.');
        }
    }

    if (linha['Check Date']) {
        let dataPago = new Date(linha['Check Date']);
        if (dataPago == 'Invalid Date') {
            result.push('    Fecha Pago inválido.');
        }
    }

    if (linha['Due Date']) {
        let dataProgramada = new Date(linha['Due Date']);
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

    if (!dataExcel.hasOwnProperty('Sheet1')) {
        result.push('TAB Sheet1 no encontrada.');
    } else if (dataExcel.Sheet1.length == 0) {
        result.push('Planilla Excel sin valores.');
    } else {
        if (!excel.Sheet1[0].hasOwnProperty('Tax Payer ID')) {
            result.push("Columna 'Tax Payer ID' no encontrada.");
        }
        if (!excel.Sheet1[0].hasOwnProperty('Invoice Number')) {
            result.push("Columna 'Invoice Number' no encontrada.");
        }
        if (!excel.Sheet1[0].hasOwnProperty('Check Status')) {
            result.push("Columna 'Check Status' no encontrada.");
        }
        if (!excel.Sheet1[0].hasOwnProperty('Amount Paid')) {
            result.push("Columna 'Amount Paid' no encontrada.");
        }
        if (!excel.Sheet1[0].hasOwnProperty('Check Date')) {
            result.push("Columna 'Check Date' no encontrada.");
        }
        if (!excel.Sheet1[0].hasOwnProperty('Due Date')) {
            result.push("Columna 'Due Date' no encontrada.");
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
    hora_da_carga: '06:58',
    CPDT_carregar_arquivo_da_tesouraria: [
        {
            Url: 'https://onebackupservices.blob.core.windows.net/67c0b77d-abae-4c48-ba4b-6c8faf27e14a/DEBITOS ENERO BANCO COLPATRIA REPORTE 1.xlsxfb6457e7-0747-48af-825a-490ce88dad10.xlsx?sv=2018-03-28&sr=b&sig=kjJC71SPgsgTOsrOZSNhysIxUyOmfcdE4eLlrmRhWuQ%3D&se=2023-08-05T09%3A58%3A37Z&sp=r',
            UrlAzure:
                'https://onebackupservices.blob.core.windows.net/67c0b77d-abae-4c48-ba4b-6c8faf27e14a/DEBITOS ENERO BANCO COLPATRIA REPORTE 1.xlsxfb6457e7-0747-48af-825a-490ce88dad10.xlsx?sv=2018-03-28&sr=b&sig=kjJC71SPgsgTOsrOZSNhysIxUyOmfcdE4eLlrmRhWuQ%3D&se=2023-08-05T09%3A58%3A37Z&sp=r',
            Name: 'DEBITOS ENERO BANCO COLPATRIA REPORTE 1.xlsx',
        },
    ],
    oneTemplateTitle: 'Archivos - PA',
    aquivo: [
        {
            Url: 'https://onebackupservices.blob.core.windows.net/67c0b77d-abae-4c48-ba4b-6c8faf27e14a/DEBITOS ENERO BANCO COLPATRIA REPORTE 1.xlsxfb6457e7-0747-48af-825a-490ce88dad10.xlsx?sv=2018-03-28&sr=b&sig=kjJC71SPgsgTOsrOZSNhysIxUyOmfcdE4eLlrmRhWuQ%3D&se=2023-08-05T09%3A58%3A37Z&sp=r',
            UrlAzure:
                'https://onebackupservices.blob.core.windows.net/67c0b77d-abae-4c48-ba4b-6c8faf27e14a/DEBITOS ENERO BANCO COLPATRIA REPORTE 1.xlsxfb6457e7-0747-48af-825a-490ce88dad10.xlsx?sv=2018-03-28&sr=b&sig=kjJC71SPgsgTOsrOZSNhysIxUyOmfcdE4eLlrmRhWuQ%3D&se=2023-08-05T09%3A58%3A37Z&sp=r',
            Name: 'DEBITOS ENERO BANCO COLPATRIA REPORTE 1.xlsx',
        },
    ],
    data_de_upload: '2023-01-17 06:58:49',
    data_de_uploadDate: '2023-01-17T09:58:49Z',
    status: 'PROCESANDO',
    ass_id: '67c0b77d-abae-4c48-ba4b-6c8faf27e14a',
    assid: '67c0b77d-abae-4c48-ba4b-6c8faf27e14a',
    email: 'adm@atc.com.br',
    fdtid: 'e966c904-9be6-4028-b0e1-b83164b1bde0',
    fedid: 'fa58f65f-10ea-70c3-bc85-87107cb8ab8a',
    onergy_rolid: '',
    timezone: null,
    usrid: '1ec86197-d331-483a-b325-62cc26433ea5',
    onergy_js_ctx: {
        assid: '67c0b77d-abae-4c48-ba4b-6c8faf27e14a',
        fedid: 'fa58f65f-10ea-70c3-bc85-87107cb8ab8a',
        fdtid: 'e966c904-9be6-4028-b0e1-b83164b1bde0',
        usrid: '1ec86197-d331-483a-b325-62cc26433ea5',
        insertDt: '2023-01-17T09:58:47.163Z',
        updateDt: '2023-01-17T09:58:49.545Z',
        cur_userid: '1ec86197-d331-483a-b325-62cc26433ea5',
        email: 'adm@atc.com.br',
        user_name: 'ADM ATC',
        onergy_rolid: '',
        praid: '9da26490-35a3-4997-b477-e66f4444f0a4',
        pcvid: '33a7a5ea-7a1c-472b-a9b0-35a6d7cc0e6a',
        prcid: '28868fc3-4629-cfb3-636e-fc12fb0eeb20',
        timezone: null,
        timezone_value: '-03:00',
        pubNubHook: null,
    },
};
init(JSON.stringify(json));
