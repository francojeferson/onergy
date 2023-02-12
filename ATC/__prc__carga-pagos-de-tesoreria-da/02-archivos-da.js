/******************** ENV_NODE ********************
 ******************** NAO_MEXA ********************
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
/******************** NODE_SCRIPT ********************
 * Nome Tarefa: Archivos - DA
 * ID: 93e63d10-d356-4301-8909-9bba81ba1653
 * Executar automático quando em processo: Sim
 * Atividade de longa duração: Não
 * Esconder Menu: Sim
 * SLA: nenhum
 * Condicional: nenhum
 * Aprovação: nenhum
 ******************** NODE_SCRIPT ********************
 */
let faturasPaiID = '822245f3-b0de-4f74-830b-90c8c8efee15';
let faturaFilhasID = '11bb183c-d30d-4ed9-af2d-286b2dcb1a89';

 /*async*/ function init(json) {
    let data = JSON.parse(json);
    let result = {};
    let log = [];

    //========== Reprocessar ==========//
    if (data.REPROCESSAR) {
        result.REPROCESSAR = false;
        result.hora_da_carga = (() => {
            let dataHoraAtualColombia = new Date(utils.GetUserDtNow("yyyy-MM-dd HH:mm:ss"));
            dataHoraAtualColombia.setHours(dataHoraAtualColombia.getHours() - 2);
            return `${dataHoraAtualColombia.getHours().toString().padStart(2, 0)}:${dataHoraAtualColombia.getMinutes().toString().padStart(2, 0)}`;
        })();
    }
    //============================================//

    /*
    onergy.log(JSON.stringify({
        "type": "Message",
        "origem": "Carga Pagos Banco de Tesoreria:Archivos:init",
        "data": data
    }));
    */

    try {
         /*await*/ atualizaRegistros(data, [`${data.onergy_js_ctx.fdtid}/${data.onergy_js_ctx.fedid}`], { status: 'PROCESANDO' });

        let strArrExcel = /*await*/ ReadExcelToJson({
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

            //============================================ Busca a Fatura ============================================//
            let filtroFaturaIndividuais = JSON.stringify([
                { FielName: 'nit_provedor', Type: 'string', FixedType: 'string', Value1: dataExcel['Pagos Banco'][s]['Nit'].toString() },
                { FielName: 'conta_interna_nic', Type: 'string', FixedType: 'string', Value1: dataExcel['Pagos Banco'][s]['Número Obligación'].toString() },
                { FielName: 'CDE__mes_processo', Type: 'string', FixedType: 'string', Value1: dataExcel['Pagos Banco'][s]['Mes de proceso'].toLowerCase() },
                { FielName: 'tipo_de_conta', Type: 'string', FixedType: 'string', Value1: 'I' },
            ]);
            let faturaFilha = /*await*/ getOnergyItem(faturaFilhasID, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, filtroFaturaIndividuais);

            let filtroFaturaPadres = JSON.stringify([
                { FielName: 'nit_provedor', Type: 'string', FixedType: 'string', Value1: dataExcel['Pagos Banco'][s]['Nit'].toString() },
                { FielName: 'conta_interna_nic', Type: 'string', FixedType: 'string', Value1: dataExcel['Pagos Banco'][s]['Número Obligación'].toString() },
                { FielName: 'CDE__mes_processo', Type: 'string', FixedType: 'string', Value1: dataExcel['Pagos Banco'][s]['Mes de proceso'].toLowerCase() },
                { FielName: 'tipo_de_conta', Type: 'string', FixedType: 'string', Value1: ['P', 'PH'] },
            ]);
            let faturaPai = /*await*/ getOnergyItem(faturasPaiID, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, filtroFaturaPadres);
            //========================================================================================================//

            /* Junta a consulta feita em Padres e Individuais */
            let FATURAS = faturaFilha.concat(faturaPai);

            //================================ Validação das Faturas Encontradas ======================================//
            /* Caso mais de uma fatura for retornada, só é interessante a com status diferente de duplicada */
            let FATURA = FATURAS.find((VALUE) => VALUE.UrlJsonContext.ESTLstatus__legalizacao_do_status != 'DUPLICADA');
            if (!FATURA) {
                let messageLog = [];
                messageLog.push(`Línea ${Number(s) + 2}:`);
                messageLog.push(`    Factura con NIT Proveedor: ${dataExcel['Pagos Banco'][s]['Nit']}, Cuenta Interna NIC: ${dataExcel['Pagos Banco'][s]['Número Obligación']} y Mes processo:${dataExcel['Pagos Banco'][s]['Mes de proceso']} no encontrada.`);
                log.push(messageLog.join('\n'));
                continue;
            }
            //========================================================================================================//

            const LINHA = dataExcel['Pagos Banco'][s];
            let faturaPostInfo = /*await*/ construir_conteudo_e_IDs_de_Update(data, LINHA, s, FATURA);
             /*await*/ atualizaRegistros(data, faturaPostInfo.idsUpdate, faturaPostInfo.content);
            faturaPostInfo.LOG ? (() => log.push(faturaPostInfo.LOG))() : "";
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

const validarValores = (index, linha) => {
    let result = [`Linea ${Number(index) + 2}:`];
    if (!linha['Nit']) {
        result.push('   NIT Proveedor inválido.');
    }

    if (!linha['Número Obligación']) {
        result.push('    Cuenta Interna NIC inválida.');
    }

    let estadoPago = linha['Estado'];
    if (!estadoPago || (estadoPago != 'E' && estadoPago != 'P')) {
        result.push('    Estado Pago inválido.');
    }

    if (!linha['Valor Pago']) {
        result.push('    Valor Pago inválido.');
    }

    if (linha['Fecha Programada']) {
        let dataPago = new Date(linha['Fecha Programada']);
        if (dataPago == 'Invalid Date') {
            result.push('    Fecha Programada inválida.');
        }
    }

    if (linha['Fecha Pago']) {
        let dataProgramada = new Date(linha['Fecha Pago']);
        if (dataProgramada == 'Invalid Date') {
            result.push('    Fecha Pago inválida.');
        }
    }

    if (!linha['Mes de proceso']) {
        result.push('    Mes de proceso inválido.');
    } else {
        const mesesEsp = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        let mesProcessoValido = (() => {
            let mesProcessoSplit = linha['Mes de proceso'].split(" ");

            if (mesProcessoSplit.length != 2) {
                return false;
            }

            if (!mesesEsp.includes(mesProcessoSplit[0].toLowerCase())) {
                return false;
            }

            if (Number(mesProcessoSplit[0]) == NaN) {
                return false
            }
            return true;
        })();

        if (!mesProcessoValido) {
            result.push('    Mes de proceso inválido.');
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

/*
    Função recebe a linha do excel e a fatura referente a linha.
    Retorno:
        LOG:string[] => Log que deve ser exibido.
        content:object => conteúdo que vai ser atualizado nas faturas.
        idsUpdate:string[] => IDs dos registros que serão atualizados com o conteúdo gerado.
            Formato -> 'templateId/fedid'
*/
const construir_conteudo_e_IDs_de_Update = /*async*/ (data, LINHA, INDEX, FATURA) => {
    let LOG = [];
    let content = {};
    let idsUpdate = [];

    /* Fatura reliquidada ou faturas geradas de reliquidação */
    /* Trecho busca as faturas geradas de reliquidação, soma seus valores e compara com o valor apontado no Excel */
    if (FATURA.UrlJsonContext.linha_de_reliquidacao || FATURA.UrlJsonContext.ESTLstatus__legalizacao_do_status == 'RELIQUIDADA') {
        let filtroFaturareliquidadas = (() => {
            if (FATURA.UrlJsonContext.ESTLstatus__legalizacao_do_status == 'RELIQUIDADA') {
                return JSON.stringify([{ FielName: 'id_fatura_original', Type: 'string', FixedType: 'string', Value1: FATURA.ID }]);
            } else if (FATURA.UrlJsonContext.id_fatura_original) {
                return JSON.stringify([{ FielName: 'id_fatura_original', Type: 'string', FixedType: 'string', Value1: FATURA.UrlJsonContext.id_fatura_original }]);
            } else {
                return null
            }
        })();

        let FATURAS_RELIQUIDADAS = /*await*/ (/*async*/ () => {
            if (filtroFaturareliquidadas) {
                return /*await*/ getOnergyItem(faturaFilhasID, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, filtroFaturareliquidadas);
            } else {
                return [];
            }
        })();

        let totalFaturaReliquidadas = (() => {
            if (!FATURAS_RELIQUIDADAS.length) { return 0 };
            let valoresDasFaturas = FATURAS_RELIQUIDADAS.map((VALUE) => {
                idsUpdate.push(`${VALUE.templateid}/${VALUE.ID}`);
                return VALUE.UrlJsonContext.valor_total_informado
            });
            return valoresDasFaturas.reduce((previousValue, currentValue) => Number(previousValue) + Number(currentValue));
        })();

        if (totalFaturaReliquidadas == LINHA['Valor Pago']) {
            content.ESTPstatus__status_pagamento = 'PAGADO TOTAL';
            content.ESTPstatus_pagamento_id = 'abf883d7-f8ee-420c-ce36-3ce694233ebc';
        } else {
            content.ESTPstatus__status_pagamento = 'ERROR PAGO';
            content.ESTPstatus_pagamento_id = '5ba8e811-9e5b-b6fe-725d-d17b1e43275d';
            LOG.push(`Línea ${Number(INDEX) + 2}:`);
            LOG.push(`    Valor Pago diferente del valor total de la facturas reliquidadas.`);
        }
    }
    /*= Faturas I, PH e P =*/
    else {
        idsUpdate.push(`${FATURA.templateid}/${FATURA.ID}`);
        let faturaPagoParcial = FATURA.UrlJsonContext.CDE__valor_a_pagar_parcial ?? 0;
        if (faturaPagoParcial > 0) {
            if (faturaPagoParcial == LINHA['Valor Pago']) {
                content.ESTPstatus__status_pagamento = 'PAGADO PARCIAL';
                content.ESTPstatus_pagamento_id = '38c15739-16d7-ae80-9090-27847a763ec7';
            } else {
                content.ESTPstatus__status_pagamento = 'ERROR PAGO';
                content.ESTPstatus_pagamento_id = '5ba8e811-9e5b-b6fe-725d-d17b1e43275d';
                LOG.push(`Línea ${Number(INDEX) + 2}:`);
                LOG.push(`    Valor Pago diferente del pago parcial de la factura.`);
            }
        } else {
            if (FATURA.UrlJsonContext.valor_total_informado == LINHA['Valor Pago']) {
                content.ESTPstatus__status_pagamento = 'PAGADO TOTAL';
                content.ESTPstatus_pagamento_id = 'abf883d7-f8ee-420c-ce36-3ce694233ebc';
            } else {
                content.ESTPstatus__status_pagamento = 'ERROR PAGO';
                content.ESTPstatus_pagamento_id = '5ba8e811-9e5b-b6fe-725d-d17b1e43275d';
                LOG.push(`Línea ${Number(INDEX) + 2}:`);
                LOG.push(`    Valor Pago diferente del valor total de la factura.`);
            }
        }
    }

    let tipoFatura = FATURA.UrlJsonContext.tipo_de_conta
    if (tipoFatura == "PH" || tipoFatura == "P") {
        let filtroFaturasFilhas = JSON.stringify([
            { FielName: 'CDE__mes_processo', Type: 'string', FixedType: 'string', Value1: FATURA.UrlJsonContext.CDE__mes_processo },
            { FielName: 'conta_pai', Type: 'string', FixedType: 'string', Value1: FATURA.UrlJsonContext.conta_pai },
            { FielName: 'tipo_de_conta', Type: 'string', FixedType: 'string', Value1: ['H', 'HH'] }
        ]);
        let faturasFilhas = /*await*/ getOnergyItem(faturaFilhasID, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, filtroFaturasFilhas);
        faturasFilhas.forEach(VALUE => idsUpdate.push(`${VALUE.templateid}/${VALUE.ID}`));
    }

    if (content.ESTPstatus__status_pagamento != 'ERROR PAGO') {
        content.valor_pago = LINHA['Valor Pago'] ?? "";
        content.data_de_pagamento = LINHA['Fecha Programada'] ?? "";
        content.data_de_pagamentoDate = LINHA['Fecha Programada'] ?? "";
        content.data_programada = LINHA['Fecha Pago'] ?? "";
        content.data_programadaDate = LINHA['Fecha Pago'] ?? "";
    }

    return {
        "LOG": LOG.length > 0 ? LOG.join("\n") : "",
        "content": content,
        "idsUpdate": idsUpdate
    };
};

const getOnergyItem = /*async*/ (fdtid, assid, usrid, filtro) => {
    let strResp = /*await*/ onergy_get({
        fdtid: fdtid,
        assid: assid,
        usrid: usrid,
        filter: filtro,
    });
    return JSON.parse(strResp);
};

const atualizaRegistros = /*async*/ (data, IDS, postInfo) => {
    for (let ID of IDS) {
         /*await*/ onergy_updatemany({
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
/******************** MET_PADRAO ********************
 ******************** JSON_INIT ********************
 */
const json = {
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
