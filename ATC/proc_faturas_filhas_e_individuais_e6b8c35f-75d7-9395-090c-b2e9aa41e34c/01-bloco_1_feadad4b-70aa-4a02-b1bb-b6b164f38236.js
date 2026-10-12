/**ENV_NODE** =====================================================================================
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
/*
Verificar validad para procesar la Cuenta / Factura

Poblar los campos de la Factura que son originados por:

 estratificaión en DocsIA (ejecutado poe DocsIA)

los que son heredados de Informaciones de la Cuenta y

de Menu Sitios
*/

let sitiosID = 'e43b9fe0-6752-446d-8495-0b4fdd7a70b4';
let clientesSitioID = '30da777d-952c-4a5a-9c18-128b69e55893';
let informacoesTecnicasID = '5ea06f19-d11a-4d61-b4ff-c74610e933cd';
let informacoesDaContaID = '1e6d6595-083f-4bb8-b82c-e9054e9dc8f3';
let contantesID = 'efb11b9d-58d7-45fb-a8cd-d0ffbc707d0f';
let FaturasFilhasIndividuaisID = '11bb183c-d30d-4ed9-af2d-286b2dcb1a89';

async function init(json) {
    let data = JSON.parse(json);
    onergy.log(`JFS ~ bloco_1 ~ init: ${JSON.stringify(data)}`);
    let result = {};

    //========== LOG =============//
    if (data.onergyLog && data.onergyLog.log_bloco_01) {
        onergy.log(
            JSON.stringify({
                type: 'Message',
                origem: 'Processo Fatura:Bloco 1:init',
                data: data,
            })
        );
    } else if (data.onergyLog && data.onergyLog.log_fluxo) {
        onergy.log('FILHA - BLOCO 1');
    }
    //============================//

    try {
        //Informacoes da Conta Não encontrado.
        if (!data.conta_interna_nic || !data.nit_provedor) {
            result.ESTLlegalizacao_do_status_id = 'ac99d4d1-71ef-8afd-48d4-2d645f782a94';
            result.ESTLstatus__legalizacao_do_status = 'ERROR CUENTA';
            result.ESTPstatus__status_pagamento = 'NO PAGAR';
            result.ESTPstatus_pagamento_id = 'd76355ca-7f15-0dcb-4414-3cfb6e062d2d';
            await atualizaFatura(data, result);
            return SetObjectResponse(false, null, false, true);
        }

        let filtroProvedorContaInterna = JSON.stringify([
            { FielName: 'conta_interna_nic', Type: 'string', FixedType: 'string', Value1: data.conta_interna_nic },
            { FielName: 'prvd_nit_provedor', Type: 'string', FixedType: 'string', Value1: data.nit_provedor },
        ]);
        let informacoesDaConta = await getOnergyItem(informacoesDaContaID, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, filtroProvedorContaInterna);

        //Informacoes da Conta Não encontrado.
        if (informacoesDaConta.length == 0) {
            result.ESTLlegalizacao_do_status_id = 'ac99d4d1-71ef-8afd-48d4-2d645f782a94';
            result.ESTLstatus__legalizacao_do_status = 'ERROR CUENTA';
            result.ESTPstatus__status_pagamento = 'NO PAGAR';
            result.ESTPstatus_pagamento_id = 'd76355ca-7f15-0dcb-4414-3cfb6e062d2d';
            await atualizaFatura(data, result);
            return SetObjectResponse(false, null, false, true);
        }
        // Informacoes da Conta Inativo
        else if (informacoesDaConta[0].UrlJsonContext.sta_cont_status_conta == 'INACTIVO') {
            //Deleta Fatura
            await onergy_updatemany({
                fdtid: data.onergy_js_ctx_ORIGINAL.fdtid,
                assid: data.onergy_js_ctx.assid,
                usrid: data.onergy_js_ctx.usrid,
                id: data.onergy_js_ctx_ORIGINAL.fedid,
                data: JSON.stringify({
                    BlockCount: 1,
                }),
            });
            return SetObjectResponse(false, null, false, true);
        }
        //Informacoes da Conta Encontrado e ativo.
        else {
            //Definição Mês Processo.
            if (!data.CDE__mes_processo) {
                //============================= Validacao =============================//
                // let datavencimentoValido = true;
                // if (!data.data_vencimento) {
                //     datavencimentoValido = false;
                // } else {
                //     let DateDataVencimento = new Date(zerarHora(data.data_vencimento));
                //     if (DateDataVencimento == "Invalid Date") {
                //         datavencimentoValido = false;
                //     } else if (DateDataVencimento.getTime() < new Date(zerarHora(utils.GetUserDtNow("yyyy-MM-dd HH:mm:ss"))).getTime()) {
                //         datavencimentoValido = false;
                //     }
                // }

                // if (!datavencimentoValido) {
                //     result.ESTLlegalizacao_do_status_id = "ac99d4d1-71ef-8afd-48d4-2d645f782a94";
                //     result.ESTLstatus__legalizacao_do_status = "ERROR CUENTA";
                //     result.ESTPstatus__status_pagamento = "NO PAGAR";
                //     result.ESTPstatus_pagamento_id = "d76355ca-7f15-0dcb-4414-3cfb6e062d2d";

                //     await atualizaFatura(data, result);
                //     return SetObjectResponse(false, null, false, true);
                // }

                //************************* PALIATIVO *************************//
                let data001 = new Date(zerarHora(data.data_vencimento));
                let datavencimentoValido = true;
                if (!data.data_vencimento) {
                    datavencimentoValido = false;
                } else {
                    if (data001.getTime() < new Date(zerarHora(utils.GetUserDtNow('yyyy-MM-dd HH:mm:ss'))).getTime()) {
                        result.data_vencimento = utils.GetUserDtNow('yyyy-MM-dd HH:mm:ss');
                    }
                }
                //*************************************************************//

                if (!datavencimentoValido) {
                    result.ESTLlegalizacao_do_status_id = 'ac99d4d1-71ef-8afd-48d4-2d645f782a94';
                    result.ESTLstatus__legalizacao_do_status = 'ERROR CUENTA';
                    result.ESTPstatus__status_pagamento = 'NO PAGAR';
                    result.ESTPstatus_pagamento_id = 'd76355ca-7f15-0dcb-4414-3cfb6e062d2d';

                    await atualizaFatura(data, result);
                    return SetObjectResponse(false, null, false, true);
                }
                //=====================================================================//

                let filtroDIaCorte = gerarFiltro('nome_interno', 'dia_corte');
                let diaCorteObj = await getOnergyItem(contantesID, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, filtroDIaCorte);
                let diaCorte = diaCorteObj.length > 0 ? (Number(diaCorteObj[0].UrlJsonContext.valor) ? Number(diaCorteObj[0].UrlJsonContext.valor) : 25) : 25;

                let DateDataVencimento = new Date(zerarHora(data.data_vencimento));
                const mesesEsp = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
                if (DateDataVencimento.getDate() >= diaCorte) {
                    DateDataVencimento.setMonth(DateDataVencimento.getMonth() + 1);
                }
                result.CDE__mes_processo = `${mesesEsp[DateDataVencimento.getMonth()]} ${DateDataVencimento.getFullYear()}`;
            }

            //Pesquisa-referencia: Sitios.
            let sitiosFiltro = gerarFiltro('asset_number', informacoesDaConta[0].UrlJsonContext.asset_number);
            let sitiosRegistro = await getOnergyItem(sitiosID, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, sitiosFiltro);
            if (sitiosRegistro.length > 0) {
                result.regio_regional__CDE__regiao_atc = sitiosRegistro[0].UrlJsonContext.regio_regional__regiao_atc;
                result.regio_CDE__regiao_atc_id = sitiosRegistro[0].UrlJsonContext.regio_regional_regiao_atc_id;
                result.CDE__codigo_ancora = sitiosRegistro[0].UrlJsonContext.codigo_ancora;
            }

            //Pesquisa-referencia: Clientes Sitio.
            let clientesSitioFiltro = gerarFiltro('asset_number', informacoesDaConta[0].UrlJsonContext.asset_number);
            let clientesSitioRegistro = await getOnergyItem(clientesSitioID, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, clientesSitioFiltro);
            if (clientesSitioRegistro.length > 0) {
                result.PCSPCS_portafolio_cliente__CDE__portfolio_cliente = clientesSitioRegistro[0].UrlJsonContext.PCSPCS_portafolio_cliente__clsit__portifolio_cliente;
                result.PCSCDE__portfolio_cliente_id = clientesSitioRegistro[0].UrlJsonContext.PCSclsit__portifolio_cliente_id;
            }

            //Pesquisa-referencia: ITS.
            let informacoesTecnicasFiltro = gerarFiltro('asset_number', informacoesDaConta[0].UrlJsonContext.asset_number);
            let informacoesTecnicasRegistro = await getOnergyItem(informacoesTecnicasID, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, informacoesTecnicasFiltro);
            if (informacoesTecnicasRegistro.length > 0) {
                result.ctgr_categorias__CDE__categoria = informacoesTecnicasRegistro[0].UrlJsonContext.ctgr_categorias__categoria;
                result.ctgr_CDE__categoria_id = informacoesTecnicasRegistro[0].UrlJsonContext.ctgr_categoria_id;
                result.LSTLST_estrato__CDE__estrato = informacoesTecnicasRegistro[0].UrlJsonContext.LSTLST_estrato__ITDS_estrato;
                result.LSTCDE__estrato_id = informacoesTecnicasRegistro[0].UrlJsonContext.LSTITDS_estrato_id;
                result.NVTNVT_nivel__CDE__nivel_de_tensao = informacoesTecnicasRegistro[0].UrlJsonContext.NVTNVT_nivel__ITDS_nivel_de_tensao;
                result.NVTCDE__nivel_de_tensao_id = informacoesTecnicasRegistro[0].UrlJsonContext.NVTITDS_nivel_de_tensao_id;
            }

            //Pesquisa-referencia: IDC.
            let informacoesDaContaFiltro = gerarFiltro('asset_number', informacoesDaConta[0].UrlJsonContext.asset_number);
            let informacoesDaContaRegistro = await getOnergyItem(informacoesDaContaID, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, informacoesDaContaFiltro);
            if (informacoesDaContaRegistro.length > 0) {
                result.tipo_cobr_tipos_cobrancas__CDE__tipo_de_cobranca = informacoesDaContaRegistro[0].UrlJsonContext.tipo_cobr_tipos_cobrancas__tipo_de_cobranca;
                result.tipo_cobr_CDE__tipo_de_cobranca_id = informacoesDaContaRegistro[0].UrlJsonContext.tipo_cobr_tipo_de_cobranca_id;
                result.CDE__acuerdo_resolucion_alumbrado_publico = informacoesDaContaRegistro[0].UrlJsonContext.acuerdo_resolucion_alumbrado_publico;
                result.CDE__acuerdo_resolucion_alumbrado_publico = informacoesDaContaRegistro[0].UrlJsonContext.prcs__acuerdo_resolucion_alumbrado_publico
                    ? informacoesDaContaRegistro[0].UrlJsonContext.prcs__acuerdo_resolucion_alumbrado_publico
                    : '';
            }

            //População dos campos de IDC.
            result.conta_pai = informacoesDaConta[0].UrlJsonContext.prcs__conta_pai;
            result.tipo_de_conta = informacoesDaConta[0].UrlJsonContext.TCTC_tipo_de_conta__prcs__tipo_de_conta;
            result.asset_number = informacoesDaConta[0].UrlJsonContext.asset_number_IDC;
            result.nome_do_site = informacoesDaConta[0].UrlJsonContext.site_name;
            result.beneficiario = informacoesDaConta[0].UrlJsonContext.prvd_beneficiario;
            result.nit_beneficiario = informacoesDaConta[0].UrlJsonContext.prvd_nit_beneficiario;
            result.portifolio_atc = informacoesDaConta[0].UrlJsonContext.tppf_tipo_portifolio__portfolio;
            result.profit_cost_center = informacoesDaConta[0].UrlJsonContext.profit_cost_center;
            result.nome_do_provedor = informacoesDaConta[0].UrlJsonContext.prvd_nome_comercial;
            result.forma_de_pagamento = informacoesDaConta[0].UrlJsonContext.for_pag_formas_de_pagamentos__forma_de_pagamento;
            result.classificacao_passthru = informacoesDaConta[0].UrlJsonContext.CPTclassificacao_passthru__prcs__clasificacion_passthru;
            result.frequencia_de_pagamento = informacoesDaConta[0].UrlJsonContext.fre_pag_frequencia__frequencia_de_pagamento;
            result.servicos =
                informacoesDaConta[0].UrlJsonContext.SERVservicos__servico && informacoesDaConta[0].UrlJsonContext.SERVservicos__servico.length > 0
                    ? informacoesDaConta[0].UrlJsonContext.SERVservicos__servico.join(',')
                    : '';
            result.assinante = informacoesDaConta[0].UrlJsonContext.sus_sus__suscriptor__prcs__assinante_atc;
            result.media_iluminacao = informacoesDaConta[0].UrlJsonContext.prcs__media_valor_iluminacao;
            result.media_de_energia = informacoesDaConta[0].UrlJsonContext.prcs__media_valor_energia;
            result.media_valor_total = informacoesDaConta[0].UrlJsonContext.prcs__media_valor_total;
        }

        if (!data.data_ultima_captura && (result.tipo_de_conta == 'I' || result.tipo_de_conta == 'H')) {
            result.data_ultima_captura = utils.GetUserDtNow('yyyy-MM-dd HH:mm:ss');
            result.data_ultima_capturaDate = utils.GetUserDtNow('yyyy-MM-dd HH:mm:ss');
        }

        //Atualiza Fatura Original
        await atualizaFatura(data, result);

        /*
            Derivação para o processo de Padres.
            Somente Faturas com útima captura vazias e tipo de conta P,PH e HH
        */
        if (!data.enviado_para_processo_pai && (result.tipo_de_conta == 'P' || result.tipo_de_conta == 'PH' || result.tipo_de_conta == 'HH')) {
            result.enviado_para_processo_pai = 'sim';
            await sendItemToOnergy(FaturasFilhasIndividuaisID, data.onergy_js_ctx.usrid, data.onergy_js_ctx.assid, result, data.onergy_js_ctx_ORIGINAL.fedid);
            return SetObjectResponse(false, null, false, true);
        }

        //Atualiza Aba IDC
        await onergy_updatemany({
            fdtid: informacoesDaConta[0].templateid,
            assid: data.onergy_js_ctx.assid,
            usrid: data.onergy_js_ctx.usrid,
            id: informacoesDaConta[0].ID,
            data: JSON.stringify({
                UrlJsonContext: {
                    ECCUECCU_estado_da_captura_da_conta__status_de_capturapago: 'CAPTURADA',
                    ECCUstatus_de_capturapago_id: '1b25804c-d211-da82-1eb1-97623e099129',
                    data_ultima_captura: utils.GetUserDtNow('yyyy-MM-dd HH:mm:ss'),
                    data_ultima_capturaDate: utils.GetUserDtNow('yyyy-MM-dd HH:mm:ss'),
                },
            }),
        });
    } catch (err) {
        onergy.log(
            JSON.stringify({
                type: 'Erro',
                origem: 'Processo Fatura:Bloco 1:init',
                stack: err.stack,
                message: err.message,
                data: data,
            })
        );
        return SetObjectResponse(false, null, false, true);
    }
    return SetObjectResponse(false, result, false, false);
}

function initBefore(json) {
    //return true;
}

function initDelete(json) {
    //return true;
}

function SetObjectResponse(cond, json, WaitingWebHook, fimProcesso) {
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
    if (fimProcesso) {
        obj.json = JSON.stringify({
            fluxo: {
                bloco_01: false,
                bloco_02: false,
                bloco_03: false,
                bloco_04: false,
                bloco_05: false,
            },
        });
    }
    return obj;
}

const getOnergyItem = async (fdtid, assid, usrid, filtro) => {
    let keepSearching = true;
    let skip = 0;
    take = 100;
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
};

const gerarFiltro = (fielNameP, valueP) => {
    return JSON.stringify([{ FielName: fielNameP, Type: `${typeof valueP == 'number' ? 'Numeric' : 'string'}`, FixedType: `${typeof valueP == 'number' ? 'Numeric' : 'string'}`, Value1: valueP }]);
};

const sendItemToOnergy = async (templateid, usrid, assid, data, fedid) => {
    let onergySaveData = {
        fdtid: templateid,
        assid: assid,
        usrid: usrid,
        data: JSON.stringify(data),
    };
    if (fedid) {
        onergySaveData.id = fedid;
    }
    return await onergy_save(onergySaveData);
};

const zerarHora = (data) => {
    if (!data) {
        return '';
    }
    let imputData = new Date(data);
    imputData.setHours(00);
    imputData.setMinutes(00);
    imputData.setSeconds(00);
    imputData.setMilliseconds(00);
    return imputData;
};

const atualizaFatura = async (data, postInfo) => {
    await onergy_updatemany({
        fdtid: data.onergy_js_ctx_ORIGINAL.fdtid,
        assid: data.onergy_js_ctx.assid,
        usrid: data.onergy_js_ctx.usrid,
        id: data.onergy_js_ctx_ORIGINAL.fedid,
        data: JSON.stringify({
            UrlJsonContext: postInfo,
        }),
    });
};
/**MET_PADRAO =====================================================================================
 */
let json = {
    status_doc: 'Documento Reconocido',
    anexo_nf: [
        {
            Url: 'https://onebackupservices.blob.core.windows.net/67c0b77d-abae-4c48-ba4b-6c8faf27e14a/Fatura.pdfe0e6ab39-37a0-47b6-b758-88f088badf6f.pdf?sv=2018-03-28&sr=b&sig=8OQeKYtEFICPN5%2BROAJkZMnYqpsc4qrOCNZVOQEDUx4%3D&se=2023-06-11T13%3A06%3A01Z&sp=r',
            UrlAzure:
                'https://onebackupservices.blob.core.windows.net/67c0b77d-abae-4c48-ba4b-6c8faf27e14a/Fatura.pdfe0e6ab39-37a0-47b6-b758-88f088badf6f.pdf?sv=2018-03-28&sr=b&sig=8OQeKYtEFICPN5%2BROAJkZMnYqpsc4qrOCNZVOQEDUx4%3D&se=2023-06-11T13%3A06%3A01Z&sp=r',
            Name: 'Fatura.pdf',
        },
    ],
    requisicao_compra: '',
    po_extraido: '',
    doc_complementar: '',
    responsavel_upload: 'Administrador Colômbia',
    dtUploadDate: '2022-11-23T13:06:13Z',
    dtUpload: '2022-11-23 10:06:13',
    porcess_log: true,
    status_doc_desc: 'Documento Reconocido',
    from_lote: '',
    from_lote_desc: '',
    from_lote_id: '',
    reqiddocsia: 'us-east-1_k7iBbPRnU/62741a86b738fc6aea83f031/12ebcc15a422d0996395a273fa8b7404.pdf',
    docsia: {
        request_id: 'us-east-1_k7iBbPRnU/62741a86b738fc6aea83f031/12ebcc15a422d0996395a273fa8b7404.pdf',
        response: {
            prediction_class: 'financeiro-contas-energia-colombia',
            prediction_prob: 0.9494486322911727,
            extractions: {
                id: 'us-east-1_k7iBbPRnU/62741a86b738fc6aea83f031/12ebcc15a422d0996395a273fa8b7404.pdf',
                client_id: '62741a86b738fc6aea83f031',
                filename: '1016118.pdfdd830298-ecaa-4ce3-a30c-829718a29821.pdf',
                filesize: 61779,
                tipo_arquivo: 'pdf',
                url_file: 'https://s3-sa-east-1.amazonaws.com/docsia-input/us-east-1_k7iBbPRnU/62741a86b738fc6aea83f031/12ebcc15a422d0996395a273fa8b7404.pdf',
                url_image: 'https://s3-sa-east-1.amazonaws.com/docsia-images-jpegs/us-east-1_k7iBbPRnU/62741a86b738fc6aea83f031/12ebcc15a422d0996395a273fa8b7404.jpg',
                url_text: 'https://s3-sa-east-1.amazonaws.com/docsia-text-txts/us-east-1_k7iBbPRnU/62741a86b738fc6aea83f031/12ebcc15a422d0996395a273fa8b7404.txt',
                url_thumb: 'https://s3-sa-east-1.amazonaws.com/docsia-images-jpegs/us-east-1_k7iBbPRnU/62741a86b738fc6aea83f031/12ebcc15a422d0996395a273fa8b7404.jpg',
                category: '0//Financeiro|1//Contas|2//Energia|3//Colombia',
                class: 'financeiro-contas-energia-colombia',
                confidence_class: 0.9494486322911727,
                ocr_original_text:
                    'Vati Primeros,después de ti VATIA S.A.E.S.P NIT.817.001.892-1 Cliente:ATC SITIOS DE COLOMBIA SAS Código Interno:1016118 Referencia de Pago:375194 Ver Factura en siguiente hoja NumRot 2.0 Version:Factura20/FVcx20220928.ps Factura No .: 4353906 Fecha de Vencimiento:14/10/2022 Valor a Pagar:$ 4,127,560.00 ( 415 ) 7709998008588 ( 8020 ) 375194 ( 3900 ) 0004127560 ( 96 ) 20221014 ',
                is_review: false,
                tenant_id: '62741a86b738fc6aea83f031',
                suscriptor: 'ATC SITIOS DE COLOMBIA SAS',
                fecha_vencimiento: '2022-10-14T00:00:00Z',
                total_factura: 4127560,
                numero_cuenta: '1016118',
                numero_factura: '4353906',
                fecha_expedicion: '2022-10-14T00:00:00Z',
                id_prestador_servicio_publico: '8170018921',
                valor_energia: 2742963.01,
                alumbrado_publico: 418000,
                tarifa: 762.37,
                consumo_kwh: 3751,
                numero_medidor: '1033893',
                contribuicion: 548592.75,
                fecha_inicial_cobro: '2022-08-27T00:00:00Z',
                fecha_final_cobro: '2022-09-27T00:00:00Z',
                ajustamiento: 4,
                vigilancia: 418000,
                last_update: '2022-11-22T19:29:56.666Z',
                _version_: 1750225803455496192,
            },
        },
        errors: [],
        internal_error: 0,
        msg_internal_error: '',
    },
    objParametrosDocsIA: {
        classificador: 'Factura Energia',
        campo_nr: '1016118',
        campo_codigo_verificacao: '',
        campo_data_emissao: '2022-10-14T00:00:00Z',
        campo_pedido: '',
        campo_mes_referente: '',
        campo_codigo_servico: '',
        campo_descricao_cod_servico: '',
        campo_origem_nota: null,
        campo_rps_n: '4353906',
        campo_rps_serie: '',
        campo_municipio_prestacao_servico: '',
        campo__numero_inscricao_obra: '',
        campo_outros_texto: '',
        campo_discriminacao_servico: '',
        campo_data_vencimento: '2022-10-14T00:00:00Z',
        campo_data_inicio_pagamento: '2022-08-27T00:00:00Z',
        campo_data_fim_pagamento: '2022-09-27T00:00:00Z',
        campo_codigo_barras: '',
        campo_protocolo: '',
        campo_carteira: '',
        campo_ag_conta: '',
        campo_banco: '',
        campo_numero_apolice: '',
        campo_numero_instalacao: '1033893',
        campo_numero_cliente: '',
        campo_rgi: '',
        campo_cond_pagamento: '',
        campo_razao_social_prestador: null,
        campo_cnpj_prestador: '8170018921',
        campo_prestador_inscricao_municipal: '',
        campo_prestador_inscricao_estadual: '',
        campo_prestador_tipo_logradouro: '',
        campo_prestador_logradouro: '',
        campo_prestador_numero_endereco: '',
        campo_prestador_complemento_endereco: '',
        campo_prestador_bairro: '',
        campo_prestador_cep: '',
        campo_prestador_cidade: '',
        campo_prestador_uf: '',
        campo_prestador_telefone: '',
        campo_prestador_email: '',
        campo_razao_social_tomador: 'ATC SITIOS DE COLOMBIA SAS',
        campo_cnpj_tomador: '',
        campo_tomador_inscricao_municipal: '',
        campo_tomador_inscricao_estadual: '',
        campo_tomador_tipo_logradouro: '',
        campo_tomador_logradouro: '',
        campo_tomador_numero_endereco: '',
        campo_tomador_complemento_endereco: '',
        campo_tomador_bairro: '',
        campo_tomador_cep: '',
        campo_tomador_cidade: '',
        campo_tomador_uf: '',
        campo_tomador_email: '',
        campo_tomador_telefone: '',
        campo_pcc: '',
        campo_irrf: '',
        campo_iss: null,
        campo_iss_retido: '',
        campo_valor_iss: 548592.75,
        campo_inss: '',
        campo_pis: '',
        campo_cofins: '',
        campo_csll: '',
        campo_iss_bitributacao: null,
        campo_icms: '',
        campo_aliquota: null,
        campo_valor_aprox_dos_tributosfonte: 418000,
        campo_valor_total_impostos: '',
        campo_taxa_de_iluminacao: 418000,
        campo_agua_e_esgoto: null,
        campo_tarifa: 4,
        campo_moeda: '',
        campo_base_calculo: '',
        campo_credito: '',
        campo_valor: 2742963.01,
        campo_valor_total_recebido: 4127560,
        campo_consumo_kwh: 3751,
        campo_valor_kwh: 762.37,
    },
    assinante: 'ATC SITIOS DE COLOMBIA SAS',
    classificador: 'Factura Energia',
    consumo_kwh: 3751,
    conta_interna_nic: '1016118',
    data_emissaoDate: '2022-10-14T03:00:00Z',
    data_emissao: '2022-10-14 00:00:00',
    data_fim_pagamentoDate: '2022-09-27T03:00:00Z',
    data_fim_pagamento: '2022-09-27 00:00:00',
    data_inicio_pagamentoDate: '2022-08-27T03:00:00Z',
    data_inicio_pagamento: '2022-08-27 00:00:00',
    data_vencimentoDate: '2022-10-14T03:00:00Z',
    data_vencimento: '2022-10-14 00:00:00',
    energia_de_contribuicao: 548592.75,
    fatura: [
        {
            Url: 'https://onebackupservices.blob.core.windows.net/67c0b77d-abae-4c48-ba4b-6c8faf27e14a/Fatura.pdfe0e6ab39-37a0-47b6-b758-88f088badf6f.pdf?sv=2018-03-28&sr=b&sig=8OQeKYtEFICPN5%2BROAJkZMnYqpsc4qrOCNZVOQEDUx4%3D&se=2023-06-11T13%3A06%3A01Z&sp=r',
            UrlAzure:
                'https://onebackupservices.blob.core.windows.net/67c0b77d-abae-4c48-ba4b-6c8faf27e14a/Fatura.pdfe0e6ab39-37a0-47b6-b758-88f088badf6f.pdf?sv=2018-03-28&sr=b&sig=8OQeKYtEFICPN5%2BROAJkZMnYqpsc4qrOCNZVOQEDUx4%3D&se=2023-06-11T13%3A06%3A01Z&sp=r',
            Name: 'Fatura.pdf',
        },
    ],
    imposto_de_vigilancia: 418000,
    nit_provedor: '817001892',
    numero_da_nota_fiscal: '4353906',
    numero_do_medidor: '1033893',
    reajuste: 4,
    taxa_de_iluminacao: 418000,
    tipo_de_fonte: 'Administrador Colômbia',
    valor_energia: 2742963.01,
    valor_kwh: 762.37,
    valor_total_informado: 4127560,
    onergy_js_ctx_ORIGINAL: {
        assid: '67c0b77d-abae-4c48-ba4b-6c8faf27e14a',
        fedid: '5e6d581b-7359-65db-4cbe-ac848fcc5b96',
        fdtid: '11bb183c-d30d-4ed9-af2d-286b2dcb1a89',
        usrid: '0c44d4fc-d654-405b-9b8f-7fea162948b5',
        insertDt: '2022-11-23T13:06:03.44Z',
        updateDt: '2022-11-23T13:06:26.755Z',
        cur_userid: '0c44d4fc-d654-405b-9b8f-7fea162948b5',
        email: 'admin-colombia@atc.com.co',
        user_name: 'Administrador Colômbia',
        onergy_rolid: 'e4d0298c-245e-454a-89d4-8f27aef8645b',
        praid: 'e4143d3a-f77c-45f3-b0fc-7e670174b99a',
        pcvid: '866503c7-f017-4fd7-aedd-efeb523d3413',
        prcid: '47746698-21d8-1384-eb51-ddbda4718b3d',
        timezone: null,
        timezone_value: '-03:00',
        pubNubHook: null,
    },
    oneTemplateTitle: 'Bloco 1',
    fluxo: { bloco_01: true, bloco_02: true, bloco_03: true, bloco_04: true, bloco_05: true },
    onergyLog: { log_fluxo: true, log_bloco_01: false, log_bloco_02: false, log_bloco_03: false, log_bloco_04: false, log_bloco_05: false },
    ass_id: '67c0b77d-abae-4c48-ba4b-6c8faf27e14a',
    assid: '67c0b77d-abae-4c48-ba4b-6c8faf27e14a',
    email: 'admin-colombia@atc.com.co',
    fdtid: 'feadad4b-70aa-4a02-b1bb-b6b164f38236',
    fedid: '5d4f89cb-d11b-4d73-8a7f-b8e50b22136f',
    onergy_rolid: 'e4d0298c-245e-454a-89d4-8f27aef8645b',
    timezone: null,
    usrid: '0c44d4fc-d654-405b-9b8f-7fea162948b5',
    onergy_js_ctx: {
        assid: '67c0b77d-abae-4c48-ba4b-6c8faf27e14a',
        fedid: '5d4f89cb-d11b-4d73-8a7f-b8e50b22136f',
        fdtid: 'feadad4b-70aa-4a02-b1bb-b6b164f38236',
        usrid: '0c44d4fc-d654-405b-9b8f-7fea162948b5',
        insertDt: '2022-11-23T13:06:27.536Z',
        updateDt: '2022-11-23T13:06:32.767Z',
        cur_userid: '0c44d4fc-d654-405b-9b8f-7fea162948b5',
        email: 'admin-colombia@atc.com.co',
        user_name: 'Administrador Colômbia',
        onergy_rolid: 'e4d0298c-245e-454a-89d4-8f27aef8645b',
        praid: '7f834ecf-4d7e-432b-8c8e-484f8d188835',
        pcvid: '38c732c5-30fb-455f-b17f-35f48df743e6',
        prcid: 'e6b8c35f-75d7-9395-090c-b2e9aa41e34c',
        timezone: null,
        timezone_value: '-03:00',
        pubNubHook: null,
    },
};

init(JSON.stringify(json));
