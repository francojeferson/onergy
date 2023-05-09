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
let jsuser = require('../onergy/onergy-utils');
let onergy = require('../onergy/onergy-client');
let utils = require('../onergy/onergy-utils');
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

const passthruReadOnlyID = 'acb34798-0a36-424f-9f0e-619238120d33';
// const sitiosID = 'e43b9fe0-6752-446d-8495-0b4fdd7a70b4';
const informacionesDeLaCuentaID = '1e6d6595-083f-4bb8-b82c-e9054e9dc8f3';
const sujetoPasivoID = '78352af1-70b2-43a0-ad2a-084cdcf2eacf';
const informacionesTecnicasDelSitioID = '5ea06f19-d11a-4d61-b4ff-c74610e933cd';
const clienteSitioID = 'a727ac73-7e04-46a3-adb1-1fb06cdfbb34';
const consumoTelemedidasID = '40e7f11b-8a6c-4190-b004-80196324c2a9';
const constanteID = 'efb11b9d-58d7-45fb-a8cd-d0ffbc707d0f';
const passthruCalculoID = 'a8594cca-5f2c-4bcd-b2be-92b5e03d57f3';

async function init(json) {
    const data = JSON.parse(json);

    //========== LOG =============//
    if (data?.onergyLog?.log_fluxo) {
        onergy.log("PASSTHRU - Motor de Calculo");
    }
    //============================//

    let result = {};
    let log = [];

    try {
        for (let s in data.pstr_ids_faturas_selecionadas) {
            //========== FATURA =============//
            let objFatReadOnly = await getOnergyItem(passthruReadOnlyID, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, gerarFiltro('_id', data.pstr_ids_faturas_selecionadas[s]));
            let assetNumber = objFatReadOnly[0].UrlJsonContext.asset_number;
            let numeroFactura = objFatReadOnly[0].UrlJsonContext.numero_da_nota_fiscal;
            let consumoFactura = objFatReadOnly[0].UrlJsonContext.consumo_kwh;
            let alumbradoFactura = objFatReadOnly[0].UrlJsonContext.taxa_de_iluminacao;
            let cnacFactura = objFatReadOnly[0].UrlJsonContext.total_cnac;
            let tarifaFactura = objFatReadOnly[0].UrlJsonContext.valor_kwh;
            let contribucionFactura = objFatReadOnly[0].UrlJsonContext.energia_de_contribuicao;
            let energiaFactura = objFatReadOnly[0].UrlJsonContext.valor_energia;
            let totalFactura = objFatReadOnly[0].UrlJsonContext.valor_total_informado;
            //============================//

            //========== DADOS MESTRES =============//
            // sitios
            // let objSitios = await getOnergyItem(sitiosID, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, gerarFiltro('asset_number', assetNumber));

            // clientes del sitio
            let objCDS = await getOnergyItem(clienteSitioID, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, gerarFiltro('asset_number', assetNumber));
            let codigoCliente = objCDS[0].UrlJsonContext.clsit__codigo_do_sitio_do_cliente;
            let portafolioCliente = objCDS[0].UrlJsonContext.PCSPCS_portafolio_cliente__clsit__portifolio_cliente;

            // informaciones de la cuenta
            let objIDC = await getOnergyItem(informacionesDeLaCuentaID, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, gerarFiltro('asset_number', assetNumber));
            let tipoAlumbrado = objIDC[0].UrlJsonContext.tipo_cobr_tipos_cobrancas__tipo_de_cobranca;
            let clasifPassthru = objIDC[0].UrlJsonContext.CPTclassificacao_passthru__prcs__clasificacion_passthru;
            let sujetoPasivo = objIDC[0].UrlJsonContext.suj_pa_sujeito__prcs__sujeito_passivo_alumbrado_publico;

            // sujeto pasivo
            let objSujetoPasivo = await getOnergyItem(sujetoPasivoID, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, gerarFiltro('sujeito', sujetoPasivo));
            let valorSujetoPasivo = objSujetoPasivo[0].UrlJsonContext.valor;

            // informaciones tecnicas del sitio
            let objITS = await getOnergyItem(informacionesTecnicasDelSitioID, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, gerarFiltro('asset_number', assetNumber));
            let qtdProvisionales = objITS[0].UrlJsonContext.qtd_provisionales;

            // carga consumo telemedidas
            let objConsumoSugerido = await getOnergyItem(consumoTelemedidasID, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, gerarFiltro('asset_number_TELEMEDIDA', assetNumber));
            let consumoSugerido = objConsumoSugerido[0].UrlJsonContext.CONT_consumo_sugerido_kwh;

            // tabla auxiliar constante
            let objConstContribucion = await getOnergyItem(constanteID, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, gerarFiltro('nome_interno', 'porcentagem_contribuicao'));
            let constanteContribucion = objConstContribucion[0].UrlJsonContext.valor;
            let objConstCnac = await getOnergyItem(constanteID, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, gerarFiltro('nome_interno', 'porcentagem_cnac'));
            let constanteCnac = objConstCnac[0].UrlJsonContext.valor;
            //============================//

            //========== FILTRO =============//
            let reembolsoTotalFactura = ['VMLA', 'Occasio Reintegro', 'DAS'];
            let isReembolsoTotalFactura = reembolsoTotalFactura.some(i => portafolioCliente.includes(i));
            //============================//

            //========== PASSTHRU =============//
            // factura valor neto
            // mla-bts: energia + contribucion == valor neto
            let passthru__valor_neto = await calcFacturaValorNeto(energiaFactura, contribucionFactura);

            // tarifa energia
            // mla-bts: tarifa energia == tarifa energia
            let passthru__tarifa_energia = await calcTarifaEnergia(energiaFactura, consumoFactura);

            // reembolso energia
            // mla-bts: tarifa energia * consumo sugerido == reembolso energia
            let passthru__reembolso_energia = await calcReembolsoEnergia(passthru__tarifa_energia, consumoSugerido);

            // reembolso contribucion
            // mla-bts: (contribucion factura * consumo sugerido) / consumo factura == reembolso contribucion
            let passthru__reembolso_contribucion = await calcReembolsoContribucion(contribucionFactura, consumoSugerido, consumoFactura);

            // reembolso alumbrado
            // alumbrado * sujeto pasivo == reembolso alumbrado
            // dependendo da qtd provisionales, reduz valor sujeto pasivo
            let passthru__reembolso_alumbrado_publico = await calcReembolsoAlumbrado(sujetoPasivo, valorSujetoPasivo, qtdProvisionales, alumbradoFactura);

            // reembolso cnac
            // se portafolio cliente == occasio operador,
            // ( cnac * consumo sugerido ) / consumo kwh == reembolso cnac
            // (cnac - cnac tigo) == cnac atc
            // senão, cnac * constante cnac == reembolso cnac
            let passthru__reembolso_cnac = await calcReembolsoCnac(cnacFactura, consumoFactura, consumoSugerido, portafolioCliente, constanteCnac);

            // total reembolso
            // reembolso energia + reembolso contribucion + reembolso alumbrado publico + reembolso cnac == total reembolso
            let passthru__total_reembolso = await calcTotalReembolso(passthru__reembolso_energia, passthru__reembolso_contribucion, passthru__reembolso_alumbrado_publico, passthru__reembolso_cnac);

            // costo atc
            // total factura - total reembolso == costo atc
            let passthru__costo_atc = await calcCostoAtc(totalFactura, passthru__total_reembolso);
            //============================//

            let postInfo = {
                "pstr_asset_number": assetNumber,
                "pstr_numero_de_factura": numeroFactura,
                "pstr_alumbrado_factura": Number(alumbradoFactura),
                "pstr_cnac_factura": Number(cnacFactura),
                "pstr_contribucion_factura": Number(contribucionFactura),
                "pstr_consumo_factura": Number(consumoFactura),
                "pstr_tarifa_factura": Number(tarifaFactura),
                "pstr_energia_factura": Number(energiaFactura),
                "pstr_total_factura": Number(totalFactura),

                "pstr_codigo_cliente": codigoCliente,
                "pstr_portifolio": portafolioCliente,
                "pstr_tipo_alumbrado": tipoAlumbrado,
                "pstr_tipologia": clasifPassthru,
                "pstr_sujeto_pasivo": sujetoPasivo,
                "pstr_valor_sujeto_pasivo": Number(valorSujetoPasivo),
                "pstr_provisionales": Number(qtdProvisionales),
                "pstr_consumo_sugerido": isReembolsoTotalFactura ? Number(consumoFactura) : Number(consumoSugerido),
                "pstr_constante_contribucion": Number(constanteContribucion),
                "pstr_constante_cnac": Number(constanteCnac),

                "passthru__valor_neto": isReembolsoTotalFactura ? 0 : Number(passthru__valor_neto),
                "passthru__tarifa_energia": isReembolsoTotalFactura ? Number(tarifaFactura) : Number(passthru__tarifa_energia),
                "passthru__reembolso_energia": isReembolsoTotalFactura ? 0 : Number(passthru__reembolso_energia),
                "passthru__reembolso_contribucion": isReembolsoTotalFactura ? 0 : Number(passthru__reembolso_contribucion),
                "passthru__reembolso_alumbrado_publico": isReembolsoTotalFactura ? Number(alumbradoFactura) : Number(passthru__reembolso_alumbrado_publico),
                "passthru__reembolso_cnac": isReembolsoTotalFactura ? 0 : Number(passthru__reembolso_cnac),
                "passthru__total_reembolso": isReembolsoTotalFactura ? Number(totalFactura) : Number(passthru__total_reembolso),
                "passthru__costo_atc": isReembolsoTotalFactura ? 0 : Number(passthru__costo_atc),
                "ID_ONE_REF": data.onergy_js_ctx_ORIGINAL.fedid
            };

            // debugger;
            await sendItemToOnergy(passthruCalculoID, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, postInfo);
        }
        result.status = 'FINALIZADO';
        result.log = log.length > 0 ? log.join('\n') : '';
        return SetObjectResponse(true, result, false);
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

        let logErro = [];
        logErro.push('** ERROR **');
        logErro.push(`Message: ${erro.message}`);
        logErro.push(`Stack: ${erro.stack}`);
        result.log = logErro.join('\n');
        result.status = 'ERROR';
        return SetObjectResponse(true, result, false);
    }

    //TODO: verificar filtro de portafolio cliente
    //TODO: no cobro
    //TODO: promedio total reembolso

}
function initBefore(json) {
    //return true;
}
function initDelete(json) {
    //return true;
}
function SetObjectResponse(cond, json, WaitingWebHook) {
    if (WaitingWebHook === undefined)
        WaitingWebHook = false;

    var obj = {
        'cond': cond,
        'json': JSON.stringify(json),
        'WaitingWebHook': WaitingWebHook,
    };
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

const gerarFiltro = (fielNameP, valueP) => {
    return JSON.stringify([{ FielName: fielNameP, Type: `${typeof valueP == 'number' ? 'Numeric' : 'string'}`, FixedType: `${typeof valueP == 'number' ? 'Numeric' : 'string'}`, Value1: valueP }]);
};

async function sendItemToOnergy(templateid, assid, usrid, data, fedid, ukField) {
    let onergySaveData = {
        fdtid: templateid,
        assid: assid,
        usrid: usrid,
        data: JSON.stringify(data)
    };

    if (fedid !== undefined && fedid !== '') {
        onergySaveData.id = fedid;
    }
    if (ukField !== undefined && ukField !== '') {
        onergySaveData.ukField = ukField;
    }

    return await onergy_save(onergySaveData);
}

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

const calcFacturaValorNeto = async (energiaFactura, contribucionFactura) => {
    // total factura - contribucion - alumbrado - cnac == valor neto
    // let totalFatura = formatNumber(objFatReadOnly.UrlJsonContext.valor_total_informado);
    // let totalContribucion = formatNumber(objFatReadOnly.UrlJsonContext.energia_de_contribuicao);
    // let totalAlumbrado = formatNumber(objFatReadOnly.UrlJsonContext.taxa_de_iluminacao);
    // let totalCnac = formatNumber(objFatReadOnly.UrlJsonContext.total_cnac);

    // mla-bts: energia + contribucion == valor neto
    let passthru__valor_neto = formatNumber(energiaFactura) + formatNumber(contribucionFactura);
    return passthru__valor_neto;
};

const calcTarifaEnergia = async (energiaFactura, consumoFactura) => {
    // valor neto / consumo kwh == tarifa energia
    // let tarifaEnergia = (Number(passthru__valor_neto / consumoFactura) > 0) ? Number((passthru__valor_neto / consumoFactura)) : 0;

    // mla-bts: tarifa energia == tarifa energia
    let tarifaEnergia = energiaFactura / consumoFactura;
    return tarifaEnergia;
};

const calcReembolsoEnergia = async (passthru__tarifa_energia, consumoSugerido) => {
    // tarifa energia * consumo noc == reembolso energia
    // let tarifaEnergia = await calcTarifaEnergia(energiaFactura, consumoFactura);

    // mla-bts: tarifa energia * consumo sugerido == reembolso energia
    let reembolsoEnergia = formatNumber(passthru__tarifa_energia * consumoSugerido);
    return reembolsoEnergia;
};

const calcReembolsoContribucion = async (contribucionFactura, consumoSugerido, consumoFactura) => {
    // reembolso energia * constante contribucion == reembolso contribucion
    // let reembolsoEnergia = await calcReembolsoEnergia(objFatReadOnly, objConsumoSugerido);
    // let constanteContribucion = formatNumber(objConstContribucion.UrlJsonContext.valor);

    // mla-bts: (contribucion factura * consumo sugerido) / consumo factura == reembolso contribucion
    let reembolsoContribucion = formatNumber((contribucionFactura * consumoSugerido) / consumoFactura);
    return reembolsoContribucion;
};

const calcReembolsoAlumbrado = async (sujetoPasivo, valorSujetoPasivo, qtdProvisionales, alumbradoFactura) => {
    // let totalAlumbrado = formatNumber(objFatReadOnly.UrlJsonContext.taxa_de_iluminacao);
    // let qtdProvisionales = formatNumber(objITS.UrlJsonContext.quantidade_provisoria);

    // alumbrado * sujeto pasivo == reembolso alumbrado
    // dependendo de qtd provisional, reduz sujeto pasivo
    let calcSujetoPasivo, reembolsoAlumbradoPublico;
    if (sujetoPasivo == 'TIGO') {
        calcSujetoPasivo = formatNumber(valorSujetoPasivo) / (formatNumber(qtdProvisionales) + 1);
        reembolsoAlumbradoPublico = formatNumber(alumbradoFactura * (calcSujetoPasivo / 100));
    } else if (sujetoPasivo == 'TIGO-ATC 50%-50%') {
        calcSujetoPasivo = formatNumber(valorSujetoPasivo) / (formatNumber(qtdProvisionales) + 2);
        reembolsoAlumbradoPublico = formatNumber(alumbradoFactura * (calcSujetoPasivo / 100));
    } else {
        calcSujetoPasivo = formatNumber(valorSujetoPasivo);
        reembolsoAlumbradoPublico = formatNumber(alumbradoFactura * (calcSujetoPasivo / 100));
    }
    return reembolsoAlumbradoPublico;
};

const calcReembolsoCnac = async (cnacFactura, consumoFactura, consumoSugerido, portafolioCliente, constanteCnac) => {
    // let totalCnac = formatNumber(objFatReadOnly.UrlJsonContext.total_cnac);
    // let consumoKwh = formatNumber(objFatReadOnly.UrlJsonContext.consumo_kwh);
    // let portafolioAtc = objSitios.UrlJsonContext.tppf_tipo_portifolio;

    // se portafolio cliente == occasio operador,
    // ( cnac * consumo ami ) / consumo kwh == cnac tigo
    // (cnac - cnac tigo) == cnac atc
    // senão, cnac * constante cnac == reembolso cnac
    let cnacTigo, cnacAtc, reembolsoCnac;
    if (portafolioCliente == 'OCCASIO') {
        // let consumoAmi = objConsumoSugerido.UrlJsonContext.CONT_consumo_sugerido_kwh;

        cnacTigo = (cnacFactura * consumoSugerido) / consumoFactura;
        cnacAtc = (cnacFactura - cnacTigo);
        reembolsoCnac = formatNumber(cnacTigo);
    } else {
        // let constanteCnac = formatNumber(objConstCnac.UrlJsonContext.valor);

        reembolsoCnac = formatNumber(cnacFactura * (constanteCnac / 100));
    }
    return reembolsoCnac;
};

const calcTotalReembolso = async (passthru__reembolso_energia, passthru__reembolso_contribucion, passthru__reembolso_alumbrado_publico, passthru__reembolso_cnac) => {
    // let reembolsoEnergia = await calcReembolsoEnergia(objFatReadOnly, objConsumoSugerido);
    // let reembolsoContribucion = await calcReembolsoContribucion(contribucionFactura, objConstContribucion);
    // let reembolsoAlumbradoPublico = await calcReembolsoAlumbrado(objFatReadOnly, objITS, objSujetoPasivo);
    // let reembolsoCnac = await calcReembolsoCnac(objFatReadOnly, objSitios, objConsumoSugerido, objConstCnac);

    // reembolso energia + reembolso contribucion + reembolso alumbrado publico + reembolso cnac == total reembolso
    let totalReembolso = formatNumber(passthru__reembolso_energia + passthru__reembolso_contribucion + passthru__reembolso_alumbrado_publico + passthru__reembolso_cnac);
    return totalReembolso;
};

const calcCostoAtc = async (totalFactura, passthru__total_reembolso) => {
    // let totalFatura = formatNumber(objFatReadOnly.UrlJsonContext.valor_total_informado);
    // let totalReembolso = await calcTotalReembolso(passthru__reembolso_energia, passthru__reembolso_contribucion, passthru__reembolso_alumbrado_publico, passthru__reembolso_cnac);

    // total factura - total reembolso == costo atc
    let costoAtc = formatNumber(totalFactura - passthru__total_reembolso);
    return costoAtc;
};

//====================================================================================================
const jsonInput = {
    "facturas_disponibles": null,
    "facturas_seleccionadas": null,
    "facturas_seleccionadas_readonly": " ",
    "pstr_archivos_passthru": " ",
    "pstr_registro_salvo": "sim",
    "pstr_status_processo": "ENVIADO A PROCESO",
    "pstr_ids_faturas_selecionadas": [
        "924eebaf-7590-495d-be6c-3a2717a45723",
        "1d6bf4b9-77b4-4466-bd85-4f417b27f745",
        "e61fa546-b69e-46c2-a8d9-0fa715acf18f",
        "02a40ddc-e4f6-45e9-86c0-8eae6c9fd46f",
        "718c4945-8e3c-460a-86d0-0b6046c1498a",
        "d1fc746d-0718-4b40-8524-8ad02f61a6b3",
        "38fa07e0-9942-4bbb-a687-ce0c31792ae1",
        "ca44a147-b21c-1dcb-f6a4-b4ebd4e77251",
        "43e0c415-15d2-3d6c-5a31-0a0f8e033dca",
        "5333a925-e576-0fd0-c5d5-ff6ae0250a9f",
        "b7859557-c411-c5f7-9a1d-8fd4a3f49ea3",
        "714fd66a-c0a9-903a-68ba-242ebf567151",
        "080e8fb3-768f-4461-a873-83bb6f5cd49c",
        "06a149ec-31ae-91b7-6f17-1b28697e56df",
        "5a7b362e-cd2e-4c9f-9ce1-5193b4c2ca3f",
        "d4ca566f-322b-494b-b19d-9b7ddbb8476f",
        "10735f2a-9af8-46de-b262-89b16f81b440",
        "55bda27e-1d8b-4904-a610-1682cc313e53",
        "f3bf4be2-8d22-4740-a350-e8f23f8dbcdf",
        "ae21d05c-31e3-431d-acc0-243fd85028b1",
        "6b4a8cce-3ba4-4e3c-a49b-cbe716fcdd16",
        "c4ac4424-6949-4982-8ef5-59e5641bd555",
        "9f948806-83d3-47f1-98ff-852fda206226",
        "0d4f1913-dc13-420f-bbc3-f8c4fce35cfa",
        "d757b031-29be-423a-8851-9cb01afeb5dd",
        "84e1a547-f5d6-42f6-b61b-971ed65cf959",
        "2d331c82-32f2-4df1-b43e-642e7d07cc95",
        "ae80c602-8879-4869-9aa3-55103582be62",
        "df2b1b10-8024-4590-b851-dd705da0e936",
        "6de7aae5-7d8b-4777-a903-464620ed381c",
        "d851cff2-bfa5-4c2e-bf8e-122e4f08cf3c",
        "992f25bc-f858-452d-a2cd-10ec18c21873",
        "084b81a5-6e88-49d9-b9ff-f197a15d6e2f",
        "6d0337a9-594c-4e5d-a045-a09507910d87",
        "83e07598-7e08-4b4f-95f8-fecf3a3a9b20",
        "b9db32c3-04cf-4313-b580-fab0859dc55d",
        "d88dd9fe-f740-41ec-9245-3edac6c8dc48",
        "db1172ce-4341-423f-8785-b05d8877d3a2",
        "dd3354aa-3e31-4417-9f2a-dac7c5c5734d",
        "0a5102a8-64d7-48ae-8033-bb9e93087a00",
        "3414bdcd-99dd-447a-9e29-cb95cfe1927f",
        "a8ddcbaa-06f1-4d0a-9ff7-83737ae10be9",
        "6c605ce4-46ce-4d15-bba2-d671de3f1a8d",
        "bcb08ac6-5c6b-4371-9542-3a879adb67a8",
        "8bc765de-e5bb-47aa-8920-469076700d2d",
        "622398f4-61f8-4adc-bbc1-1bc368b5ee86",
        "c66a34cf-8f7f-dd01-89e7-86e8fcb86fb6",
        "06538f98-987f-4052-95c4-3a4e30af287a",
        "19b836d3-457e-4a19-85dd-dd4ee257175d",
        "52c29859-5742-5078-10eb-5a75bc629690"
    ],
    "onergy_js_ctx_ORIGINAL": {
        "assid": "67c0b77d-abae-4c48-ba4b-6c8faf27e14a",
        "fedid": "41c773e2-0df4-555c-22ea-540392c65ede",
        "fdtid": "06456424-a022-46a3-93b9-67e65eb31726",
        "usrid": "1ec86197-d331-483a-b325-62cc26433ea5",
        "insertDt": "2023-05-07T22:10:43.274Z",
        "updateDt": "2023-05-07T22:10:43.274Z",
        "cur_userid": "1ec86197-d331-483a-b325-62cc26433ea5",
        "email": "adm@atc.com.br",
        "user_name": "ADM ATC",
        "onergy_rolid": "",
        "praid": "72690bfe-1f2e-42b9-b2c1-306aaa4010e8",
        "pcvid": "21911848-bca7-4c44-8eaf-98f9f211ec3c",
        "prcid": "3c17d734-8235-914f-9382-75e79ec29b16",
        "timezone": null,
        "timezone_value": "-03:00",
        "pubNubHook": null
    },
    "oneTemplateTitle": "Motor Calculo",
    "onergyLog": {
        "log_fluxo": true
    },
    "ass_id": "67c0b77d-abae-4c48-ba4b-6c8faf27e14a",
    "assid": "67c0b77d-abae-4c48-ba4b-6c8faf27e14a",
    "email": "adm@atc.com.br",
    "fdtid": "212fa4a8-2628-4159-a3eb-5b45cdc0c20a",
    "fedid": "d6e2cd89-68fc-41a3-8f00-b927528347bb",
    "onergy_rolid": "",
    "timezone": null,
    "usrid": "1ec86197-d331-483a-b325-62cc26433ea5",
    "onergy_js_ctx": {
        "assid": "67c0b77d-abae-4c48-ba4b-6c8faf27e14a",
        "fedid": "d6e2cd89-68fc-41a3-8f00-b927528347bb",
        "fdtid": "212fa4a8-2628-4159-a3eb-5b45cdc0c20a",
        "usrid": "1ec86197-d331-483a-b325-62cc26433ea5",
        "insertDt": "2023-05-07T22:10:45.729Z",
        "updateDt": "2023-05-07T22:10:46.067Z",
        "cur_userid": "1ec86197-d331-483a-b325-62cc26433ea5",
        "email": "adm@atc.com.br",
        "user_name": "ADM ATC",
        "onergy_rolid": "",
        "praid": "43e08fee-d37c-4547-96e2-199b560d38ee",
        "pcvid": "21911848-bca7-4c44-8eaf-98f9f211ec3c",
        "prcid": "3c17d734-8235-914f-9382-75e79ec29b16",
        "timezone": null,
        "timezone_value": "-03:00",
        "pubNubHook": null
    }
};

init(JSON.stringify(jsonInput));
