/**NODE_ENV ===
 */
let { date } = require('assert-plus');
let { formatDate } = require('tough-cookie');
let { log, debug } = require('console');
let { memory } = require('console');
let { resolve } = require('path');
let { type } = require('os');
let axios = require('axios');
let fs = require('fs');
let jsuser = require('../../onergy/onergy-utils');
let onergy = require('../../onergy/onergy-client');
let utils = require('../../onergy/onergy-utils');
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
async function onergy_updatemany(data) {
    return data;
}
function successCallback(result) {
    console.log('It succeeded with ' + result);
}

/*
=============================   SCRIPT    =============================
*/

const informacionesDeLaCuentaID = '1e6d6595-083f-4bb8-b82c-e9054e9dc8f3';
const sujetoPasivoID = '78352af1-70b2-43a0-ad2a-084cdcf2eacf';
const informacionesTecnicasDelSitioID = '5ea06f19-d11a-4d61-b4ff-c74610e933cd';
const clienteSitioID = 'a727ac73-7e04-46a3-adb1-1fb06cdfbb34';
const consumoTelemedidasID = '40e7f11b-8a6c-4190-b004-80196324c2a9';
const constanteID = 'efb11b9d-58d7-45fb-a8cd-d0ffbc707d0f';
const passthruCalculoID = 'a8594cca-5f2c-4bcd-b2be-92b5e03d57f3';
const faturasSelecionadasID = "f4041cad-9968-413f-af5b-6affebe99953";

async function init(json) {
    const data = JSON.parse(json);

    //========== LOG =============//
    if (data?.onergyLog?.log_fluxo) {
        onergy.log("PASSTHRU - Criar Linhas Cálculo");
    }
    if (data?.onergyLog?.logData?.criar_linhas_calculo) {
        onergy.log(JSON.stringify({
            type: 'Message',
            origem: 'Passthru:Criar Linhas Cálculo:init',
            data: data,
        }));
    }
    //============================//

    try {

        let arrayCalculos = [];

        let objFatReadOnly_all = await getOnergyItem(faturasSelecionadasID, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, gerarFiltro('faturas_selecionadas_passthru', data.onergy_js_ctx_ORIGINAL.fedid));
        await atualizaFatura(data, { "pstr_ids_faturas_selecionadas": objFatReadOnly_all.map(VALUE => VALUE.ID) });

        let objCDS_all = await getOnergyItem(clienteSitioID, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
        let objIDC_all = await getOnergyItem(informacionesDeLaCuentaID, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
        let objSujetoPasivo_all = await getOnergyItem(sujetoPasivoID, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
        let objITS_all = await getOnergyItem(informacionesTecnicasDelSitioID, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
        let objConstContribucion_all = await getOnergyItem(constanteID, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
        let objConstCnac_all = await getOnergyItem(constanteID, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);

        objFatReadOnly_all = objFatReadOnly_all.map(VALUE => {
            let faturaSelecionada = VALUE;
            let finalCobro = faturaSelecionada?.UrlJsonContext?.data_fim_pagamento;
            let periodoCobro = faturaSelecionada?.UrlJsonContext?.referencia__competencia;
            faturaSelecionada.UrlJsonContext.periodoCobroFactura = `${periodoCobro} ${new Date(finalCobro).getFullYear()}`;
            return faturaSelecionada;
        });

        const mesesEsp = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        let objFatReadOnly_ordenado = objFatReadOnly_all.map(VALUE => {
            let dateSplit = VALUE.UrlJsonContext.periodoCobroFactura.split(" ");
            return {
                'id': VALUE.ID,
                'numberMonth': new Date(`${dateSplit[1]}-${mesesEsp.indexOf(dateSplit[0]) + 1}-01 00:00:00`).getTime()
            };
        }).sort((a, b) => b.numberMonth - a.numberMonth).map(VALUE1 => {
            return objFatReadOnly_all.find(VALUE2 => VALUE2.ID == VALUE1.id);
        });
        objFatReadOnly_all = objFatReadOnly_ordenado;

        for (let FATURA of objFatReadOnly_all) {
            //========== FATURA =============//
            let objFatReadOnly = [FATURA];
            let assetNumber = objFatReadOnly[0]?.UrlJsonContext?.asset_number;
            let profitCostCenter = objFatReadOnly[0]?.UrlJsonContext?.profit_cost_center;
            let inicioCobro = objFatReadOnly[0]?.UrlJsonContext?.data_inicio_pagamento;
            let finalCobro = objFatReadOnly[0]?.UrlJsonContext?.data_fim_pagamento;
            let periodoCobroFactura = objFatReadOnly[0]?.UrlJsonContext?.periodoCobroFactura;
            let mesProceso = objFatReadOnly[0]?.UrlJsonContext?.CDE__mes_processo;
            let numeroFactura = objFatReadOnly[0]?.UrlJsonContext?.numero_da_nota_fiscal;
            let consumoFactura = formatNumber(objFatReadOnly[0]?.UrlJsonContext?.consumo_kwh);
            let tarifaFactura = formatNumber(objFatReadOnly[0]?.UrlJsonContext?.valor_kwh);
            let totalFactura = formatNumber(objFatReadOnly[0]?.UrlJsonContext?.valor_total_informado);
            let energiaFactura = formatNumber(objFatReadOnly[0]?.UrlJsonContext?.valor_energia);
            let contribucionFactura = formatNumber(objFatReadOnly[0]?.UrlJsonContext?.energia_de_contribuicao);
            let alumbradoFactura = formatNumber(objFatReadOnly[0]?.UrlJsonContext?.taxa_de_iluminacao);
            let compensacionEnergiaFactura = formatNumber(objFatReadOnly[0]?.UrlJsonContext?.compensacao_de_energia);
            let reliquidacionesFactura = formatNumber(objFatReadOnly[0]?.UrlJsonContext?.reliquidacoes);
            let otrosEnergiasFactura = formatNumber(objFatReadOnly[0]?.UrlJsonContext?.outras_energias);
            let ajusteFactura = formatNumber(objFatReadOnly[0]?.UrlJsonContext?.reajuste);
            let cnacFactura = formatNumber(objFatReadOnly[0]?.UrlJsonContext?.total_cnac);
            let aseoFactura = formatNumber(objFatReadOnly[0]?.UrlJsonContext?.agua_e_esgoto);
            let vigilanciaFactura = formatNumber(objFatReadOnly[0]?.UrlJsonContext?.imposto_de_vigilancia);
            let interesesMoraFactura = formatNumber(objFatReadOnly[0]?.UrlJsonContext?.juros_de_mora);
            let financiacionFactura = formatNumber(objFatReadOnly[0]?.UrlJsonContext?.financiamentos);
            let reconexionFactura = formatNumber(objFatReadOnly[0]?.UrlJsonContext?.reconexao);
            let tarifaConexionFactura = formatNumber(objFatReadOnly[0]?.UrlJsonContext?.taxa_de_conexao);
            let alquilerContadoresFactura = formatNumber(objFatReadOnly[0]?.UrlJsonContext?.aluguel_do_medidor);
            let ivaFactura = formatNumber(objFatReadOnly[0]?.UrlJsonContext?.iva);
            //============================//

            //========== DADOS MESTRES =============//

            // clientes del sitio
            let objCDS = objCDS_all.filter(VALUE => VALUE.UrlJsonContext.asset_number == assetNumber);
            let regionalATC = objCDS[0]?.UrlJsonContext?.regio_regional;
            let regionalCliente = objCDS[0]?.UrlJsonContext?.RCSRCS_nome_regional__clsit__regional_do_cliente;
            let codigoCliente = objCDS[0]?.UrlJsonContext?.clsit__codigo_do_sitio_do_cliente;
            let portafolioCliente = objCDS[0]?.UrlJsonContext?.PCSPCS_portafolio_cliente__clsit__portifolio_cliente;

            // informaciones de la cuenta
            let objIDC = objIDC_all.filter(VALUE => VALUE.UrlJsonContext.asset_number == assetNumber);
            let siteName = objIDC[0]?.UrlJsonContext?.site_name;
            let tipoAlumbrado = objIDC[0]?.UrlJsonContext?.tipo_cobr_tipos_cobrancas__tipo_de_cobranca;
            let clasifPassthru = objIDC[0]?.UrlJsonContext?.CPTclassificacao_passthru__prcs__clasificacion_passthru;
            let sujetoPasivo = objIDC[0]?.UrlJsonContext?.suj_pa_sujeito__prcs__sujeito_passivo_alumbrado_publico;

            // sujeto pasivo
            let objSujetoPasivo = objSujetoPasivo_all.filter(VALUE => VALUE.UrlJsonContext.sujeito == sujetoPasivo);
            let valorSujetoPasivo = formatNumber(objSujetoPasivo[0]?.UrlJsonContext?.valor);

            // informaciones tecnicas del sitio
            let objITS = objITS_all.filter(VALUE => VALUE.UrlJsonContext.asset_number == assetNumber);
            let qtdProvisionales = formatNumber(objITS[0]?.UrlJsonContext?.qtd_provisionales);

            // carga consumo telemedidas
            let count = arrayCalculos.filter(VALUE => VALUE.pstr_asset_number == assetNumber).length;

            if (count > 0) {
                let dateSplit = mesProceso.split(' ');
                let numberMonth = new Date(`${dateSplit[1]}-${mesesEsp.indexOf(dateSplit[0]) + 1}-01 00:00:00`);
                numberMonth.setMonth(numberMonth.getMonth() - count);
                let newMonth = mesesEsp[numberMonth.getMonth()];
                let newYear = numberMonth.getFullYear();
                mesProceso = `${newMonth} ${newYear}`;
            }

            let filtroTelemedida = JSON.stringify([
                { FielName: 'asset_number_TELEMEDIDA', Type: 'string', FixedType: 'string', Value1: assetNumber },
                { FielName: 'CONT_periodo_facturas', Type: 'string', FixedType: 'string', Value1: mesProceso },
            ]);
            let objConsumoSugerido = await getOnergyItem(consumoTelemedidasID, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, filtroTelemedida);
            let consumoSugerido = formatNumber(objConsumoSugerido[0]?.UrlJsonContext?.CONT_consumo_sugerido_kwh);

            // tabla auxiliar constante
            let objConstContribucion = objConstContribucion_all.filter(VALUE => VALUE.UrlJsonContext.nome_interno == 'porcentagem_contribuicao');
            let constanteContribucion = formatNumber(objConstContribucion[0]?.UrlJsonContext?.valor);
            let objConstCnac = objConstCnac_all.filter(VALUE => VALUE.UrlJsonContext.nome_interno == 'porcentagem_cnac');
            let constanteCnac = formatNumber(objConstCnac[0]?.UrlJsonContext?.valor);
            //============================//

            //========== FILTRO =============//
            let reembolsoTotalFactura = ['VMLA', 'OCCASIO REINTEGRO'];
            let isReembolsoTotalFactura = reembolsoTotalFactura.some(i => clasifPassthru.includes(i));

            let noCobroFactura = ['Desmantelado', 'Otros Operadores', 'DAS', 'SIN INFORMACIÓN', 'Equipos Apagados', 'Sin Equipos sin Consumo'];
            let isNoCobroFactura = noCobroFactura.some(i => clasifPassthru.includes(i));
            //============================//

            arrayCalculos.push({
                "pstr_asset_number": assetNumber,
                "pstr_profit_cost_center": profitCostCenter,
                "pstr_nombre_sitio": siteName,
                "pstr_regional_atc": regionalATC,
                "pstr_regional_cliente": regionalCliente,
                "pstr_inicio_cobro": inicioCobro,
                "pstr_final_cobro": finalCobro,
                "pstr_periodo_cobro": periodoCobroFactura,
                "pstr_mes_proceso": mesProceso,
                "pstr_numero_de_factura": numeroFactura,
                "pstr_consumo_factura": parseFloat(consumoFactura.toFixed(0)),
                "pstr_tarifa_factura": parseFloat(tarifaFactura.toFixed(3)),
                "pstr_total_factura": parseFloat(totalFactura.toFixed(0)),
                "pstr_energia_factura": parseFloat(energiaFactura.toFixed(0)),
                "pstr_contribucion_factura": parseFloat(contribucionFactura.toFixed(0)),
                "pstr_alumbrado_factura": parseFloat(alumbradoFactura.toFixed(0)),
                "pstr_compensacion_energia_factura": parseFloat(compensacionEnergiaFactura.toFixed(0)),
                "pstr_reliquidaciones_factura": parseFloat(reliquidacionesFactura.toFixed(0)),
                "pstr_otros_energias_factura": parseFloat(otrosEnergiasFactura.toFixed(0)),
                "pstr_ajuste_factura": parseFloat(ajusteFactura.toFixed(0)),
                "pstr_cnac_factura": parseFloat(cnacFactura.toFixed(0)),
                "pstr_aseo_factura": parseFloat(aseoFactura.toFixed(0)),
                "pstr_vigilancia_factura": parseFloat(vigilanciaFactura.toFixed(0)),
                "pstr_intereses_mora_factura": parseFloat(interesesMoraFactura.toFixed(0)),
                "pstr_financiacion_factura": parseFloat(financiacionFactura.toFixed(0)),
                "pstr_reconexion_factura": parseFloat(reconexionFactura.toFixed(0)),
                "pstr_tarifa_conexion_factura": parseFloat(tarifaConexionFactura.toFixed(0)),
                "pstr_alquiler_contadores_factura": parseFloat(alquilerContadoresFactura.toFixed(0)),
                "pstr_iva_factura": parseFloat(ivaFactura.toFixed(0)),

                "pstr_codigo_cliente": codigoCliente,
                "pstr_portifolio": portafolioCliente,
                "pstr_tipo_alumbrado": tipoAlumbrado,
                "pstr_tipologia": clasifPassthru,
                "pstr_sujeto_pasivo": sujetoPasivo,
                "pstr_valor_sujeto_pasivo": parseFloat(valorSujetoPasivo.toFixed(0)),
                "pstr_provisionales": parseFloat(qtdProvisionales.toFixed(0)),
                "pstr_consumo_sugerido": isNoCobroFactura ? 0 : isReembolsoTotalFactura ? parseFloat(consumoFactura.toFixed(0)) : parseFloat(consumoSugerido.toFixed(0)),
                "pstr_constante_contribucion": parseFloat(constanteContribucion.toFixed(0)),
                "pstr_constante_cnac": parseFloat(constanteCnac.toFixed(0)),
                "ID_ONE_REF": data.onergy_js_ctx_ORIGINAL.fedid
            });
        }

        await onergy.InsertManyOnergy(arrayCalculos, passthruCalculoID, data.onergy_js_ctx.usrid);

        return SetObjectResponse(false, null, false);
    } catch (erro) {
        onergy.log(
            JSON.stringify({
                type: 'Erro',
                origem: 'Passthru:Motor Calculo Passthru:init',
                stack: erro.stack,
                message: erro.message,
                data: data,
            })
        );
        return SetObjectResponse(true, null, false), true;
    }
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
        'cond': cond,
        'WaitingWebHook': WaitingWebHook,
    };
    if (json && Object.keys(json).length > 0) {
        obj.json = JSON.stringify(json);
    }
    if (fimProcesso) {
        obj.onergy_prc_id = "3c17d734-8235-914f-9382-75e79ec29b16"; // Passthru
        obj.onergy_new_prc_id_fdtid = "659303b2-00bb-4d97-b9e3-83a5d56c450b"; // Fim
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

const formatNumber = (value) => {
    if (typeof value === 'undefined') {
        return 0;
    }
    const number = Number(value);
    if (isNaN(number)) {
        return 0;
    } else {
        return Math.floor(number);
    }
};

const atualizaFatura = async (data, postInfo) => {
    await onergy_updatemany({
        fdtid: data.onergy_js_ctx_ORIGINAL.fdtid,
        assid: data.onergy_js_ctx.assid,
        usrid: data.onergy_js_ctx.usrid,
        id: data.onergy_js_ctx_ORIGINAL.fedid,
        data: JSON.stringify({
            "UrlJsonContext": postInfo
        })
    });
};

//====================================================================================================
const jsonInput = {
    "facturas_disponibles": null,
    "facturas_seleccionadas": null,
    "facturas_seleccionadas_readonly": " ",
    "pstr_archivos_passthru": " ",
    "pstr_registro_salvo": "sim",
    "pstr_sequecial_passthru": "PASS202300043",
    "pstr_usuario_de_criacao": "ADM ATC",
    "data_de_criacao_pstrDate": "2023-06-07T02:38:05Z",
    "data_de_criacao_pstr": "2023-06-06 23:38:05",
    "pstr_hora_criacao": "23:38",
    "pstr_status_processo": "ENVIADO A PROCESO",
    "pstr_ids_faturas_selecionadas": "",
    "onergy_js_ctx_ORIGINAL": {
        "assid": "67c0b77d-abae-4c48-ba4b-6c8faf27e14a",
        "fedid": "4766954d-e014-d201-c391-b6725d269f16",
        "fdtid": "06456424-a022-46a3-93b9-67e65eb31726",
        "usrid": "1ec86197-d331-483a-b325-62cc26433ea5",
        "insertDt": "2023-06-07T02:38:02.217Z",
        "updateDt": "2023-06-07T02:38:02.217Z",
        "cur_userid": "1ec86197-d331-483a-b325-62cc26433ea5",
        "email": "adm@atc.com.br",
        "user_name": "ADM ATC",
        "onergy_rolid": "",
        "praid": "0dff4551-ad98-4572-8284-3bc21aea8ae2",
        "pcvid": "8def3add-4292-4905-800a-19201b073f1f",
        "prcid": "3c17d734-8235-914f-9382-75e79ec29b16",
        "timezone": null,
        "timezone_value": "-03:00",
        "pubNubHook": null
    },
    "oneTemplateTitle": "Criar Linhas Cálculo",
    "onergyLog": {
        "log_fluxo": true,
        "logData": {
            "criar_linhas_calculo": true,
            "motor_calculo": true,
            "criacao_de_excel": true
        }
    },
    "ass_id": "67c0b77d-abae-4c48-ba4b-6c8faf27e14a",
    "assid": "67c0b77d-abae-4c48-ba4b-6c8faf27e14a",
    "email": "adm@atc.com.br",
    "fdtid": "21af8d42-ac4a-4d84-bce9-740192048fb4",
    "fedid": "080ff1f3-a51e-4de5-872b-e2bb61afa6c4",
    "onergy_rolid": "",
    "timezone": null,
    "usrid": "1ec86197-d331-483a-b325-62cc26433ea5",
    "onergy_js_ctx": {
        "assid": "67c0b77d-abae-4c48-ba4b-6c8faf27e14a",
        "fedid": "080ff1f3-a51e-4de5-872b-e2bb61afa6c4",
        "fdtid": "21af8d42-ac4a-4d84-bce9-740192048fb4",
        "usrid": "1ec86197-d331-483a-b325-62cc26433ea5",
        "insertDt": "2023-06-07T02:38:03.86Z",
        "updateDt": "2023-06-07T02:38:05.323Z",
        "cur_userid": "1ec86197-d331-483a-b325-62cc26433ea5",
        "email": "adm@atc.com.br",
        "user_name": "ADM ATC",
        "onergy_rolid": "",
        "praid": "69919469-bb8c-494c-bcbc-3a1cc0ee0f92",
        "pcvid": "8def3add-4292-4905-800a-19201b073f1f",
        "prcid": "3c17d734-8235-914f-9382-75e79ec29b16",
        "timezone": null,
        "timezone_value": "-03:00",
        "pubNubHook": null
    }
};

init(JSON.stringify(jsonInput));
