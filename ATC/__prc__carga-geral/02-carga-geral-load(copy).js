/******************** ENV_NODE ********************
 ******************** NAO_MEXA ********************
 */
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
    args.executeAction = false;
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
 * Nome Tarefa: Carga Geral - Load
 * ID: 0e8dc4f0-4a4f-4fb1-8268-423b45128203
 * Executar automático quando em processo: Não
 * Atividade de longa duração: Sim
 * Esconder Menu: Sim
 * SLA: nenhum
 * Condicional: nenhum
 * Aprovação: nenhum
 ******************** NODE_SCRIPT ********************
 */
const indiceCargaID = '9a6e262f-e463-4c5d-9d8b-0fd8343b2f02';
// let faturasPaiID = '822245f3-b0de-4f74-830b-90c8c8efee15';
// let faturaFilhasID = '11bb183c-d30d-4ed9-af2d-286b2dcb1a89';

async function init(json) {
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

    try {
        await atualizaRegistros(data, [`${data.onergy_js_ctx.fdtid}/${data.onergy_js_ctx.fedid}`], { status: 'PROCESANDO' });

        let strArrExcel = await ReadExcelToJson({
            url: data.planilha[0].UrlAzure,
        });
        dataExcel = JSON.parse(strArrExcel);

        let tabExcel = data.load_index_tab_excel;
        let resultValidarExcel = validarExcel(dataExcel, tabExcel);
        if (resultValidarExcel.status == 'NOK') {
            result.log = resultValidarExcel.message;
            result.status = 'FINALIZADO';
            return SetObjectResponse(false, result, false);
        }

        for (let s in dataExcel[tabExcel]) {
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
            let faturaFilha = await getOnergyItem(faturaFilhasID, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, filtroFaturaIndividuais);

            let filtroFaturaPadres = JSON.stringify([
                { FielName: 'nit_provedor', Type: 'string', FixedType: 'string', Value1: dataExcel['Pagos Banco'][s]['Nit'].toString() },
                { FielName: 'conta_interna_nic', Type: 'string', FixedType: 'string', Value1: dataExcel['Pagos Banco'][s]['Número Obligación'].toString() },
                { FielName: 'CDE__mes_processo', Type: 'string', FixedType: 'string', Value1: dataExcel['Pagos Banco'][s]['Mes de proceso'].toLowerCase() },
                { FielName: 'tipo_de_conta', Type: 'string', FixedType: 'string', Value1: ['P', 'PH'] },
            ]);
            let faturaPai = await getOnergyItem(faturasPaiID, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, filtroFaturaPadres);
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
            let faturaPostInfo = await construir_conteudo_e_IDs_de_Update(data, LINHA, s, FATURA);
            await atualizaRegistros(data, faturaPostInfo.idsUpdate, faturaPostInfo.content);
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

const validarExcel = (excel, tab) => {
    let result = [];

    if (!dataExcel.hasOwnProperty([tab])) {
        result.push('TAB Excel no encontrada.');
    } else if (dataExcel[tab].length == 0) {
        result.push('Planilla Excel sin valores.');
    } else {
        /**
         * TODO:
         * aqui cabe fazer validação de tabExcel
         * separadamente através de funções
         */
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
const construir_conteudo_e_IDs_de_Update = async (data, LINHA, INDEX, FATURA) => {
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

        let FATURAS_RELIQUIDADAS = await (async () => {
            if (filtroFaturareliquidadas) {
                return await getOnergyItem(faturaFilhasID, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, filtroFaturareliquidadas);
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
        let faturasFilhas = await getOnergyItem(faturaFilhasID, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, filtroFaturasFilhas);
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

const getOnergyItem = async (fdtid, assid, usrid, filtro) => {
    let strResp = await onergy_get({
        fdtid: fdtid,
        assid: assid,
        usrid: usrid,
        filter: filtro,
    });
    return JSON.parse(strResp);
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
/******************** MET_PADRAO ********************
******************** JSON_INIT ********************
*/
const json_homol = {
    processo: '',
    horas: '',
    dataDate: '2023-01-19T17:49:21Z',
    data: '2023-01-19 14:49:21',
    load_index_equipe: 'COL',
    load_index_id_equipe: '',
    load_index_id_do_card: '1e6d6595-083f-4bb8-b82c-e9054e9dc8f3',
    planilha: [
        {
            Url: 'https://onebackupservices.blob.core.windows.net/67c0b77d-abae-4c48-ba4b-6c8faf27e14a/tablas_maestras_produccion_v4.xlsx4b995509-39ae-461f-8ec8-a2735ccd6880.xlsx?sv=2018-03-28&sr=b&sig=8b6iZD1rGgFVwSJjVn4PnY5ewilcP%2By7kUqydYrIycE%3D&se=2023-08-07T17%3A49%3A06Z&sp=r',
            UrlAzure:
                'https://onebackupservices.blob.core.windows.net/67c0b77d-abae-4c48-ba4b-6c8faf27e14a/tablas_maestras_produccion_v4.xlsx4b995509-39ae-461f-8ec8-a2735ccd6880.xlsx?sv=2018-03-28&sr=b&sig=8b6iZD1rGgFVwSJjVn4PnY5ewilcP%2By7kUqydYrIycE%3D&se=2023-08-07T17%3A49%3A06Z&sp=r',
            Name: 'tablas_maestras_produccion_v4.xlsx',
        },
    ],
    load_index_tab_excel: 'informacion_cuenta',
    load_index_id: '1a86654a-fda1-413f-9b84-1ab4c46918b0',
    em_caso_de_duplicidade: '1',
    processamento: 'Carga de informacion_cuenta iniciada',
    time: '14:49',
    em_caso_de_duplicidade_desc: 'Sobrescribir',
    oneTemplateTitle: '',
    ass_id: '67c0b77d-abae-4c48-ba4b-6c8faf27e14a',
    assid: '67c0b77d-abae-4c48-ba4b-6c8faf27e14a',
    fedid: '85e3f7a3-3736-4dcf-a4ef-59cd24309a92',
    fdtid: '0e8dc4f0-4a4f-4fb1-8268-423b45128203',
    usrid: '1ec86197-d331-483a-b325-62cc26433ea5',
    email: 'adm@atc.com.br',
    onergy_rolid: '',
    timezone: null,
    onergy_js_ctx: {
        assid: '67c0b77d-abae-4c48-ba4b-6c8faf27e14a',
        fedid: '85e3f7a3-3736-4dcf-a4ef-59cd24309a92',
        fdtid: '0e8dc4f0-4a4f-4fb1-8268-423b45128203',
        usrid: '1ec86197-d331-483a-b325-62cc26433ea5',
        insertDt: '2023-01-19T17:49:21.013Z',
        updateDt: '2023-01-19T17:49:21.013Z',
        cur_userid: '1ec86197-d331-483a-b325-62cc26433ea5',
        email: 'adm@atc.com.br',
        user_name: 'ADM ATC',
        onergy_rolid: '',
        praid: '0ff0b174-0185-432b-b4f3-d3939126990a',
        pcvid: 'cd195059-980b-454c-bd2c-1cfd8270964d',
        prcid: '0da6dd0d-3707-0c6c-c387-0a332c9bce38',
        timezone: null,
        timezone_value: '-03:00',
        pubNubHook: null,
    },
    id_upload_planilha: 'c2ab04c5-e105-18f8-a078-0e0820d8c6e0',
};

const json_prod = {
    processo: '',
    horas: '',
    dataDate: '2023-01-17T17:23:53Z',
    data: '2023-01-17 14:23:53',
    load_index_equipe: 'COL',
    load_index_id_equipe: '',
    load_index_id_do_card: '1e6d6595-083f-4bb8-b82c-e9054e9dc8f3',
    planilha: [
        {
            Url: 'https://onebackupservices.blob.core.windows.net/88443605-74d6-4ea4-b426-a6c3e26aa615/tablas_maestras_produccion_v4.xlsx4bd1a131-2b3d-4b01-9bfd-d0b22028609f.xlsx?sv=2018-03-28&sr=b&sig=T%2BL40v0NnacWDC6cHmpHhWWlz7vlV3RyPRpv%2BR226hQ%3D&se=2023-08-05T17%3A23%3A41Z&sp=r',
            UrlAzure:
                'https://onebackupservices.blob.core.windows.net/88443605-74d6-4ea4-b426-a6c3e26aa615/tablas_maestras_produccion_v4.xlsx4bd1a131-2b3d-4b01-9bfd-d0b22028609f.xlsx?sv=2018-03-28&sr=b&sig=T%2BL40v0NnacWDC6cHmpHhWWlz7vlV3RyPRpv%2BR226hQ%3D&se=2023-08-05T17%3A23%3A41Z&sp=r',
            Name: 'tablas_maestras_produccion_v4.xlsx',
        },
    ],
    load_index_tab_excel: 'informacion_cuenta',
    load_index_id: '1a86654a-fda1-413f-9b84-1ab4c46918b0',
    em_caso_de_duplicidade: '1',
    processamento: 'Carga de informacion_cuenta iniciada',
    time: '14:23',
    em_caso_de_duplicidade_desc: 'Sobrescribir',
    oneTemplateTitle: '',
    ass_id: '88443605-74d6-4ea4-b426-a6c3e26aa615',
    assid: '88443605-74d6-4ea4-b426-a6c3e26aa615',
    fedid: '316ad334-d2de-4728-a390-b80b5fb8b4ee',
    fdtid: '0e8dc4f0-4a4f-4fb1-8268-423b45128203',
    usrid: '40ddc5fc-2ef7-4b78-bcc4-5e2048d22331',
    email: 'prod@atc.com.br',
    onergy_rolid: '',
    timezone: null,
    onergy_js_ctx: {
        assid: '88443605-74d6-4ea4-b426-a6c3e26aa615',
        fedid: '316ad334-d2de-4728-a390-b80b5fb8b4ee',
        fdtid: '0e8dc4f0-4a4f-4fb1-8268-423b45128203',
        usrid: '40ddc5fc-2ef7-4b78-bcc4-5e2048d22331',
        insertDt: '2023-01-17T17:23:52.303Z',
        updateDt: '2023-01-17T17:23:52.303Z',
        cur_userid: '40ddc5fc-2ef7-4b78-bcc4-5e2048d22331',
        email: 'prod@atc.com.br',
        user_name: 'prod@atc.com.br',
        onergy_rolid: '',
        praid: '42a859fa-aef7-4f6a-a7ae-ea14d7b44d28',
        pcvid: 'c336706d-fa50-431c-94ee-7f19a1dd0fdd',
        prcid: '0da6dd0d-3707-0c6c-c387-0a332c9bce38',
        timezone: null,
        timezone_value: '-03:00',
        pubNubHook: null,
    },
    id_upload_planilha: 'a34d4417-0a1d-3562-e77f-70bcbb602dc6',
};
init(JSON.stringify(json_homol));
