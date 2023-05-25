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

const passthruCalculoID = 'a8594cca-5f2c-4bcd-b2be-92b5e03d57f3';

async function init(json) {
    let data = JSON.parse(json);

    //========== LOG =============//
    if (data?.onergyLog?.log_fluxo) {
        onergy.log("PASSTHRU - Motor de Calculo");
    }
    if (data?.onergyLog?.logData?.motor_calculo) {
        onergy.log(JSON.stringify({
            type: 'Message',
            origem: 'Passthru:Motor de Calculo:init',
            data: data,
        }));
    }
    //============================//
    try {
        let filtroLinhasCalculo = gerarFiltro("ID_ONE_REF", data.onergy_js_ctx_ORIGINAL.fedid);
        let linhasCalculo = await getOnergyItem(passthruCalculoID, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, filtroLinhasCalculo);

        /* Calcula todas as linhas */
        for (let index in linhasCalculo) {
            linhasCalculo[index] = await calcularLinha(linhasCalculo[index]);
        }

        /* Recalcula somante as faturas MLA/ST/SM", "BTS - MLA/ST/CM  */
        let faturas_STSM = linhasCalculo.filter(VALUE => ["BTS - MLA/ST/SM"].includes(VALUE.UrlJsonContext.pstr_tipologia));
        let faturas_STCM = linhasCalculo.filter(VALUE => ["BTS - MLA/ST/CM"].includes(VALUE.UrlJsonContext.pstr_tipologia));

        if (faturas_STSM.length > 0 || faturas_STCM.length > 0) {
            linhasCalculo = removeGroupFromArray(linhasCalculo, faturas_STSM);
            linhasCalculo = removeGroupFromArray(linhasCalculo, faturas_STCM);

            let valorMedioReembolsoEnergia = (() => {
                let faturas_CTSM = linhasCalculo.filter(VALUE => ["BTS - MLA/CT/SM"].includes(VALUE.UrlJsonContext.pstr_tipologia));
                let faturas_CTCM = linhasCalculo.filter(VALUE => ["BTS - MLA/CT/CM"].includes(VALUE.UrlJsonContext.pstr_tipologia));

                let valorTotalReembolso_CTSM = faturas_CTSM.map(VALUE => VALUE.UrlJsonContext.passthru__reembolso_energia).reduce((previousValue, currentValue) => Number(previousValue) + Number(currentValue));
                let valorTotalReembolso_CTCM = faturas_CTCM.map(VALUE => VALUE.UrlJsonContext.passthru__reembolso_energia).reduce((previousValue, currentValue) => Number(previousValue) + Number(currentValue));

                return {
                    "media_CTSM": (faturas_CTSM.length > 0 && valorTotalReembolso_CTSM) ? Number((valorTotalReembolso_CTSM / faturas_CTSM.length).toFixed(2)) : 0,
                    "media_CTCM": (faturas_CTCM.length > 0 && valorTotalReembolso_CTCM) ? Number((valorTotalReembolso_CTCM / faturas_CTCM.length).toFixed(2)) : 0,
                };
            })();
            for (let index in faturas_STSM) {
                faturas_STSM[index] = await calcularLinha(faturas_STSM[index], valorMedioReembolsoEnergia.media_CTSM);
            }
            for (let index in faturas_STCM) {
                faturas_STCM[index] = await calcularLinha(faturas_STCM[index], valorMedioReembolsoEnergia.media_CTCM);
            }
        }

        /* Agrupa os dois lotes */
        linhasCalculo = linhasCalculo.concat(faturas_STSM);
        linhasCalculo = linhasCalculo.concat(faturas_STCM);

        /* Atualiza as linhas */
        for (let LINHA of linhasCalculo) {
            await onergy_updatemany({
                "fdtid": LINHA.templateid,
                "assid": data.onergy_js_ctx.assid,
                "usrid": data.onergy_js_ctx.usrid,
                "id": LINHA.ID,
                "data": JSON.stringify({ "UrlJsonContext": LINHA.UrlJsonContext })
            });
        }

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
        return SetObjectResponse(false, null, false, true);
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

const removeGroupFromArray = (array, group) => {
    let finalArray = [];
    for (const ITEM_ARRAY of array) {
        let item = group.find(ITEM => ITEM.ID == ITEM_ARRAY.ID);
        if (!item) {
            finalArray.push(ITEM_ARRAY);
        }
    }
    return finalArray;
};

const calcularLinha = async (LINHA, reembolsoPromedio) => {
    const linhaContext = LINHA.UrlJsonContext;
    //========== PASSTHRU =============//
    // factura valor neto
    // mla-bts: energia + contribucion == valor neto
    let passthru__valor_neto = await calcFacturaValorNeto(linhaContext.pstr_energia_factura, linhaContext.pstr_contribucion_factura);

    // tarifa energia
    // mla-bts: tarifa energia == tarifa energia
    let passthru__tarifa_energia = await calcTarifaEnergia(linhaContext.pstr_energia_factura, linhaContext.pstr_consumo_factura);

    // reembolso energia
    // mla-bts: tarifa energia * consumo sugerido == reembolso energia
    let passthru__reembolso_energia = await calcReembolsoEnergia(passthru__tarifa_energia, linhaContext.pstr_consumo_sugerido);

    //Reembolso Promedio
    let passthru__reembolso_promedio = reembolsoPromedio ?? 0;

    // reembolso contribucion
    // mla-bts: (contribucion factura * consumo sugerido) / consumo factura == reembolso contribucion
    let passthru__reembolso_contribucion = await calcReembolsoContribucion(linhaContext.pstr_contribucion_factura, linhaContext.pstr_consumo_sugerido, linhaContext.pstr_consumo_factura);

    // reembolso alumbrado
    // alumbrado * sujeto pasivo == reembolso alumbrado
    // dependendo da qtd provisionales, reduz valor sujeto pasivo
    let passthru__reembolso_alumbrado_publico = await calcReembolsoAlumbrado(linhaContext.pstr_sujeto_pasivo, linhaContext.pstr_valor_sujeto_pasivo, linhaContext.pstr_provisionales, linhaContext.pstr_alumbrado_factura);

    // alumbrado assumido atc
    // alumbrado factura - reembolso alumbrado == alumbrado assumido
    let passthru__alumbrado_asumido_atc = await calcAlumbradoAsumidoAtc(linhaContext.pstr_alumbrado_factura, passthru__reembolso_alumbrado_publico);

    // reembolso cnac
    // se tipologia cliente == occasio operador,
    // ( cnac * consumo sugerido ) / consumo kwh == reembolso cnac
    // (cnac - cnac tigo) == cnac atc
    // senão, cnac * constante cnac == reembolso cnac
    let passthru__reembolso_cnac = await calcReembolsoCnac(linhaContext.pstr_cnac_factura, linhaContext.pstr_consumo_factura, linhaContext.pstr_consumo_sugerido, linhaContext.pstr_tipologia, linhaContext.pstr_constante_cnac);

    // total reembolso
    // reembolso energia + reembolso contribucion + reembolso alumbrado publico + reembolso cnac == total reembolso
    let passthru__total_reembolso = await calcTotalReembolso(passthru__reembolso_energia, passthru__reembolso_contribucion, passthru__reembolso_alumbrado_publico, passthru__reembolso_cnac);

    // total energia contribucion cnac
    let passthru__total_energ_contrib_cnac = await calcTotalEnergContribCnac(passthru__reembolso_energia, passthru__reembolso_contribucion, passthru__reembolso_cnac);

    // costo atc
    // total factura - total reembolso == costo atc
    let passthru__costo_atc = await calcCostoAtc(linhaContext.pstr_total_factura, passthru__total_reembolso);
    //============================//

    //========== FILTRO =============//
    let reembolsoTotalFactura = ['VMLA', 'OCCASIO REINTEGRO'];
    let isReembolsoTotalFactura = reembolsoTotalFactura.some(i => clasifPassthru.includes(i));

    let noCobroFactura = ['Desmantelado', 'Otros Operadores', 'DAS', 'SIN INFORMACIÓN', 'Equipos Apagados', 'Sin Equipos sin Consumo'];
    let isNoCobroFactura = noCobroFactura.some(i => clasifPassthru.includes(i));
    //============================//

    LINHA.UrlJsonContext = {
        ...linhaContext,
        "passthru__valor_neto": isNoCobroFactura || isReembolsoTotalFactura ? 0 : parseFloat(passthru__valor_neto.toFixed(0)),
        "passthru__tarifa_energia": isNoCobroFactura || isReembolsoTotalFactura ? parseFloat(linhaContext.pstr_tarifa_factura.toFixed(3)) : parseFloat(passthru__tarifa_energia.toFixed(3)),
        "passthru__reembolso_energia": isNoCobroFactura || isReembolsoTotalFactura ? 0 : parseFloat(passthru__reembolso_energia.toFixed(0)),
        "passthru__reembolso_contribucion": isNoCobroFactura || isReembolsoTotalFactura ? 0 : parseFloat(passthru__reembolso_contribucion.toFixed(0)),
        "passthru__reembolso_alumbrado_publico": isNoCobroFactura ? 0 : isReembolsoTotalFactura ? parseFloat(linhaContext.pstr_alumbrado_factura.toFixed(0)) : parseFloat(passthru__reembolso_alumbrado_publico.toFixed(0)),
        "passthru__alumbrado_asumido_atc": isNoCobroFactura || isReembolsoTotalFactura ? 0 : parseFloat(passthru__alumbrado_asumido_atc.toFixed(0)),
        "passthru__reembolso_cnac": isNoCobroFactura || isReembolsoTotalFactura ? 0 : parseFloat(passthru__reembolso_cnac.toFixed(0)),
        "passthru__total_reembolso": isNoCobroFactura ? 0 : isReembolsoTotalFactura ? parseFloat(linhaContext.pstr_total_factura.toFixed(0)) : parseFloat(passthru__total_reembolso.toFixed(0)),
        "passthru__total_energ_contrib_cnac": isNoCobroFactura ? 0 : isReembolsoTotalFactura ? parseFloat((linhaContext.pstr_energia_factura + linhaContext.pstr_contribucion_factura + linhaContext.pstr_cnac_factura).toFixed(0)) : parseFloat(passthru__total_energ_contrib_cnac.toFixed(0)),
        "passthru__costo_atc": isNoCobroFactura || isReembolsoTotalFactura ? 0 : parseFloat(passthru__costo_atc.toFixed(0)),
        "passthru__reembolso_promedio": isNoCobroFactura || isReembolsoTotalFactura ? 0 : passthru__reembolso_promedio
    };

    return LINHA;
};

const calcFacturaValorNeto = async (energiaFactura, contribucionFactura) => {
    // total factura - contribucion - alumbrado - cnac == valor neto
    // let totalFatura = formatNumber(objFatReadOnly.UrlJsonContext.valor_total_informado);
    // let totalContribucion = formatNumber(objFatReadOnly.UrlJsonContext.energia_de_contribuicao);
    // let totalAlumbrado = formatNumber(objFatReadOnly.UrlJsonContext.taxa_de_iluminacao);
    // let totalCnac = formatNumber(objFatReadOnly.UrlJsonContext.total_cnac);

    // mla-bts: energia + contribucion == valor neto
    let passthru__valor_neto = energiaFactura + contribucionFactura;
    return passthru__valor_neto;
};

const calcTarifaEnergia = async (energiaFactura, consumoFactura) => {
    // valor neto / consumo kwh == tarifa energia
    // let tarifaEnergia = (Number(passthru__valor_neto / consumoFactura) > 0) ? Number((passthru__valor_neto / consumoFactura)) : 0;

    // mla-bts: tarifa energia == tarifa energia
    let tarifaEnergia = energiaFactura / consumoFactura;
    return (tarifaEnergia > 0) ? tarifaEnergia : 0;
};

const calcReembolsoEnergia = async (passthru__tarifa_energia, consumoSugerido) => {
    // tarifa energia * consumo noc == reembolso energia
    // let tarifaEnergia = await calcTarifaEnergia(energiaFactura, consumoFactura);

    // mla-bts: tarifa energia * consumo sugerido == reembolso energia
    let reembolsoEnergia = passthru__tarifa_energia * consumoSugerido;
    return reembolsoEnergia;
};

const calcReembolsoContribucion = async (contribucionFactura, consumoSugerido, consumoFactura) => {
    // reembolso energia * constante contribucion == reembolso contribucion
    // let reembolsoEnergia = await calcReembolsoEnergia(objFatReadOnly, objConsumoSugerido);
    // let constanteContribucion = formatNumber(objConstContribucion.UrlJsonContext.valor);

    // mla-bts: (contribucion factura * consumo sugerido) / consumo factura == reembolso contribucion
    let reembolsoContribucion = (contribucionFactura * consumoSugerido) / consumoFactura;
    return (reembolsoContribucion > 0) ? reembolsoContribucion : 0;
};

const calcReembolsoAlumbrado = async (sujetoPasivo, valorSujetoPasivo, qtdProvisionales, alumbradoFactura) => {
    // let totalAlumbrado = formatNumber(objFatReadOnly.UrlJsonContext.taxa_de_iluminacao);
    // let qtdProvisionales = formatNumber(objITS.UrlJsonContext.quantidade_provisoria);

    // alumbrado * sujeto pasivo == reembolso alumbrado
    // dependendo de qtd provisional, reduz sujeto pasivo
    let calcSujetoPasivo, reembolsoAlumbradoPublico;
    if (sujetoPasivo == 'TIGO') {
        calcSujetoPasivo = valorSujetoPasivo / (qtdProvisionales + 1);
        reembolsoAlumbradoPublico = alumbradoFactura * (calcSujetoPasivo / 100);
    } else if (sujetoPasivo == 'TIGO-ATC 50%-50%') {
        calcSujetoPasivo = valorSujetoPasivo / (qtdProvisionales + 2);
        reembolsoAlumbradoPublico = alumbradoFactura * (calcSujetoPasivo / 100);
    } else {
        calcSujetoPasivo = valorSujetoPasivo;
        reembolsoAlumbradoPublico = alumbradoFactura * (calcSujetoPasivo / 100);
    }
    return (reembolsoAlumbradoPublico > 0) ? reembolsoAlumbradoPublico : 0;
};

const calcAlumbradoAsumidoAtc = async (alumbradoFactura, reembolsoAlumbradoPublico) => {
    // mla-bts: alumbrado factura - reembolso alumbrado == alumbrado asumido atc
    let passthru__alumbrado_asumido_atc = (alumbradoFactura - reembolsoAlumbradoPublico);
    return passthru__alumbrado_asumido_atc;
};

const calcReembolsoCnac = async (cnacFactura, consumoFactura, consumoSugerido, tipologiaCliente, constanteCnac) => {
    // se tipologia cliente == occasio operador,
    // ( cnac * consumo ami ) / consumo kwh == cnac tigo
    // (cnac - cnac tigo) == cnac atc
    // senão, cnac * constante cnac == reembolso cnac
    let cnacTigo, reembolsoCnac;
    if (tipologiaCliente == 'OCCASIO POR OPERADOR') {
        // let consumoAmi = objConsumoSugerido.UrlJsonContext.CONT_consumo_sugerido_kwh;

        cnacTigo = (cnacFactura * consumoSugerido) / consumoFactura;
        reembolsoCnac = cnacTigo;
    } else {
        // let constanteCnac = formatNumber(objConstCnac.UrlJsonContext.valor);

        reembolsoCnac = cnacFactura * (constanteCnac / 100);
    }
    return (reembolsoCnac > 0) ? reembolsoCnac : 0;
};

const calcTotalReembolso = async (passthru__reembolso_energia, passthru__reembolso_contribucion, passthru__reembolso_alumbrado_publico, passthru__reembolso_cnac) => {
    // let reembolsoEnergia = await calcReembolsoEnergia(objFatReadOnly, objConsumoSugerido);
    // let reembolsoContribucion = await calcReembolsoContribucion(contribucionFactura, objConstContribucion);
    // let reembolsoAlumbradoPublico = await calcReembolsoAlumbrado(objFatReadOnly, objITS, objSujetoPasivo);
    // let reembolsoCnac = await calcReembolsoCnac(objFatReadOnly, objSitios, objConsumoSugerido, objConstCnac);

    // reembolso energia + reembolso contribucion + reembolso alumbrado publico + reembolso cnac == total reembolso
    let totalReembolso = passthru__reembolso_energia + passthru__reembolso_contribucion + passthru__reembolso_alumbrado_publico + passthru__reembolso_cnac;
    return totalReembolso;
};

const calcTotalEnergContribCnac = async (passthru__reembolso_energia, passthru__reembolso_contribucion, passthru__reembolso_cnac) => {
    let totalEnergContribCnac = passthru__reembolso_energia + passthru__reembolso_contribucion + passthru__reembolso_cnac;
    return totalEnergContribCnac;
};

const calcCostoAtc = async (totalFactura, passthru__total_reembolso) => {
    // let totalFatura = formatNumber(objFatReadOnly.UrlJsonContext.valor_total_informado);
    // let totalReembolso = await calcTotalReembolso(passthru__reembolso_energia, passthru__reembolso_contribucion, passthru__reembolso_alumbrado_publico, passthru__reembolso_cnac);

    // total factura - total reembolso == costo atc
    let costoAtc = totalFactura - passthru__total_reembolso;
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
        "52c29859-5742-5078-10eb-5a75bc629690",
        "cc1874b5-9883-4d38-a1c4-e4b65b89ed02",
        "92837fe8-555e-6c12-0c2d-f9dd9ea89cfa",
        "6e6b87a4-25f2-c42f-0f27-7de2a8e17a63",
        "569a6789-3b80-46e6-bd56-e869f6db2f67",
        "65933812-cd57-0306-b5c7-9b5885259bad",
        "3c6eae52-38f1-4070-b37e-0580f0328def",
        "db6439e7-a137-455e-ab60-e5599bbbcf6a",
        "cc08bbd1-a882-f7cc-74a7-80f6dc092619",
        "785e032f-7d63-4c97-b952-090d12ff47e2",
        "35d6721c-f954-4e63-9d78-746432129871",
        "1110a60f-95c6-4eea-9e70-207749be024d",
        "9253a102-10e3-4baa-9b82-3552c0a595ee",
        "7b205dbf-16fd-4678-a573-6482a5b8b071",
        "9c57a113-78e8-458f-8a2c-dc9b321f4bfa",
        "450690cb-9b48-49a9-a412-1888e8e3cf32",
        "5606c49a-0a45-4899-a026-f9d2d883473b",
        "0c7799df-18ba-4edb-8183-a2e02add5b7a",
        "25d088a8-7d3d-e62a-e7c8-642b7e88e553",
        "60584e50-47f2-bf9f-b8fe-9fd92221e1de",
        "3c26ae33-8921-78b9-656d-86d8c572623e",
        "3f50bbe2-bad3-9798-b3ec-321704e842f4",
        "4fdce4e8-5961-f152-c8c8-8cb949c356d9",
        "3494084a-d47c-64e0-2f86-166c77863684",
        "7724b92b-6e63-f373-3f25-f640813df3e2",
        "3869887e-f60f-f3eb-0bca-c38db0753943",
        "71de7f09-002e-1ff6-caf8-44d562b0fe75",
        "5168a48f-91ae-29d3-34f0-e64dfcf536c3",
        "52978938-54a8-a49c-ebfd-e217c9c0a57d",
        "b601162a-09ad-4a1b-a128-8ef2b21079ce",
        "ab5736f1-04d2-46d7-a8d9-4cf6061be1c8",
        "bc0107c7-0e4e-4af2-bcc4-ac76bcf71a0b",
        "70df680a-de62-44f9-a43a-80bc9565345d",
        "f5d41cdf-49f0-47d2-a925-852eec24a7f0",
        "92f7c05f-fedb-48be-8de5-ae63e6f37bf1",
        "2cd56994-c1e4-4dc8-9c10-9670f042a27b",
        "bbf07b84-cc7c-44fb-b9c6-568ad3279069",
        "bde797b2-614a-4c8b-b073-151ed932ccf9",
        "67d77068-731c-4817-b421-d4564da84e84",
        "e06cadd1-546a-4614-9756-fb7b1d6ac7ab",
        "20cb0e39-cf9c-4240-9931-35c3601dd1c8",
        "6bf9a466-6f7c-4a57-81b6-36eb7b7bf220",
        "12e8f423-87fe-4ab9-b28e-afaaaca59b20",
        "b0027fd7-c4fb-4983-aedb-82a02cdc7f81",
        "2470197c-ed81-456a-87a7-6a50ce6dde3d",
        "7576607c-7355-47ae-905b-cff0dc901639",
        "8f23882e-2374-46ac-8202-d2a58141c3e7",
        "37013873-9dd5-4a4f-bd08-0475f5611016",
        "1c1d14f7-87d9-49bd-a501-c32f733e1280",
        "ccb210f0-5723-40f6-89e8-7e4b99effe70",
        "fe63774f-b670-41dc-bb17-61fcf72ad2fe",
        "3bdfbaae-f36f-4897-a812-4280508e8d8f",
        "3d798b91-e81e-4773-90bb-fabffc73f47f",
        "985c82a7-b2e0-4ffc-a984-e23608652333",
        "0ee31991-a474-4d0e-8123-0703d827d6c3",
        "175c7d51-2630-465e-a1d1-8e87f3fa215f",
        "14652e41-678c-4eea-ae1d-99799e89d4ff",
        "11fc80f3-2e4b-4bdb-8a7a-06598f36c456",
        "cbf495cc-836e-4a12-a15b-e349ba91c3dc",
        "936e6eef-eabd-423b-b86a-0e0f671c744c",
        "228051f2-b4d4-493c-aae1-52f53ac53130",
        "2f46e43a-a627-47a7-a6f3-5ddfa30739e6",
        "880b4955-3510-4c37-acbf-bbad680988db",
        "d66ab71c-f1bd-4b69-9f3a-6e59171d4119",
        "ce5de5df-2bf3-45bd-a517-abf172db038f",
        "2452aae1-5777-4c31-87ac-46dcc6e1eea8",
        "e63e79e4-0ae9-4a85-b9a9-05a8d630314c",
        "4c4fb72e-18ae-419a-8801-384ef4e2d865",
        "02be2ebe-1376-4ad4-9c0c-cddf24043fa0",
        "acb54c46-a6b8-4c0a-9f65-4fb98307d3b6",
        "8b90bd95-fd89-4bde-a731-619489a406b6",
        "f83a4082-21da-4cfc-b56d-8f3e0a0ae053",
        "5e5a4053-9e82-4434-b021-b05b398e308b",
        "2c110add-09e8-4c27-806c-0fbfc6f15cfe",
        "c6fbf5d0-0e88-4f1f-98f9-e931e8bbca4d",
        "c871bca7-e161-4cda-a28d-d1684e775c18",
        "a7b8c929-6e53-48c0-8a1b-ba364e2023fd",
        "d9ec94bf-856c-432d-9ffa-f9802c81485f",
        "cf54e5ee-f67a-47d8-bf60-a90e872f7d07",
        "217ab6e0-490d-4fc3-9407-96369f3193a6",
        "367e883f-cba5-455e-b49d-325f0a791d06",
        "e9157e7f-5a62-4279-80fe-81e27b6bc947",
        "04e57b34-10f7-3b2d-9833-e7fdf9809d9b",
        "e1651c0f-0133-443b-866b-c2c81eec8a3d",
        "77899125-d0cc-419b-b0c0-5daf59be26dc",
        "92290984-7c65-40a8-8e59-b3fa75018417",
        "85ecc261-c82d-4ccd-a18d-f3e38101d7df",
        "7a485c25-5820-4df6-a5cb-ecb807c697be",
        "c71f6e7c-cf5f-4f7a-8257-07baeb4faee3",
        "e46a8c5e-881a-49b3-aa2f-15c21e70ce54",
        "3a7ad53d-f92a-4900-b7fc-d4b6dc41c14f",
        "65ffbee7-8304-4911-a9b6-3033b7c697a5",
        "692a1b37-3510-412f-a2f6-310baa3ab7d7",
        "d01127e7-e17f-4975-ae23-e3d5d4a3c9a7",
        "ec200fb5-fb68-4d30-b322-544b7aefa82f",
        "b2a7f807-ed08-45a2-9ee1-4a1ce9c3299b",
        "eb813729-7313-461e-97d6-c67227021d03",
        "318e2966-2520-4af8-8cab-27501747934a",
        "813baac5-64a6-4f21-90e8-a8e5d4f3d4f8",
        "44936a66-e960-476c-aadc-b8ab8ff89b5f",
        "8c96a686-eb0f-e1e2-f390-910892eebc36",
        "fb34efd5-2c9d-42e4-bb91-9aac59c91a10",
        "e071e52d-8ff1-423f-8693-82862fab19f5",
        "b304eca4-b38b-47cd-9c2d-a45a222873af",
        "f6341252-794b-4ad1-af0d-4aec06d97d77",
        "6842d9a8-362d-40ea-baf6-fc8e7fcfdf69",
        "41d1b1c4-874d-4fa3-a9bb-1c8448272b43",
        "51f1431b-6b11-4c04-bdfe-24ca76a423b1",
        "322d926a-2594-49da-9feb-d90a0b7e056b",
        "a8adccb2-d58b-4c05-8ecc-07e38160f1f7",
        "ca198c5c-3d43-44f4-8a5b-748855a9d122",
        "bb105300-459e-4acc-b613-36bfca7c3553",
        "50a84f96-e882-45bb-9687-a4e579af5e3e",
        "a5bd2fe8-830a-4cde-ba39-c1968839656c",
        "a266b7b1-dec6-4540-b964-586aa81434cc",
        "13ab5824-2089-40fe-b9b0-d535c27aef6d",
        "38554ea0-dde0-44d5-b1e4-da960a7d856d",
        "b40c9bac-ce45-4556-ab83-f27efc4c1b7b",
        "08e1851c-0058-4419-ae0e-66ec4f747bcb",
        "7a8d529e-9d63-4a93-8d7c-272513cba98c",
        "ca4a3961-f10c-448b-ab84-4795e895ba88",
        "f1322e0e-ad7f-47c0-b04e-77937de04dfe",
        "3e3534ea-86eb-4019-aaa3-e78e4505d58c",
        "6463ab02-8202-4e59-9358-bd8fe103891c",
        "0907154c-2ecb-4b9c-94da-f533fa496e8f",
        "e079092d-ee1c-4025-bf18-d263860f640f",
        "83982d2a-4dc7-4bd0-8d81-bde2957bc363",
        "a688bbe9-aaf2-4015-a135-391221029282",
        "b3b072ee-20a3-4499-9a32-27a93f5b67a6",
        "fde1abb0-b52a-4ddc-86a6-6d9c2876835f",
        "c2446601-8b6c-455a-9528-0630db78ee5d",
        "8cd2e910-8633-40f2-8111-4a0503498492",
        "5829ed8b-6628-433e-adc6-6326423d9a46",
        "38576306-9955-4415-9d69-58acf0448c97",
        "b6564119-914c-d64b-a4e8-980bacb627b2",
        "47cc80c6-a8e4-0d2a-0544-94e6b3c88dc4",
        "c48cffa0-104d-cef1-e383-61d377ba7360",
        "0a2840c0-7bcc-4862-a76d-99f57195ccb0",
        "dcb2253e-b0be-4e9d-93f6-acd2bcd0d83d",
        "7db0b9e4-3d8c-4bbd-91a6-ba6b0a7105ee",
        "4f22e78a-060c-4b5b-85b5-422d039aa006",
        "9ae15665-90a2-4bbc-acec-7b5a9fc060f4",
        "07dfcf7f-a103-4af4-be36-9d3dd1fd5751",
        "4698cc4a-5688-463c-ab9f-26dd3374b6b4",
        "14236dad-e82a-4bd2-a7a3-b75743f4a1cb",
        "3e2cf5eb-eb92-49c0-ae66-e2f0c09a68f4",
        "5ed88d44-bd86-4ef3-9879-142721577e37",
        "5772623a-ea3e-4aad-9f9a-035076267a84",
        "b2d68ecc-980a-4b82-9c36-ad4cc87b5b92",
        "2e83e1cf-c684-4eb4-9f48-bb74ca70419c",
        "1acbb0ab-f955-4978-9f9b-cddcf5d27282"
    ],
    "onergy_js_ctx_ORIGINAL": {
        "assid": "67c0b77d-abae-4c48-ba4b-6c8faf27e14a",
        "fedid": "ab6a7ac0-990a-11ab-12fc-754a2fe5e289",
        "fdtid": "06456424-a022-46a3-93b9-67e65eb31726",
        "usrid": "1ec86197-d331-483a-b325-62cc26433ea5",
        "insertDt": "2023-05-20T22:42:40.697Z",
        "updateDt": "2023-05-20T22:42:40.697Z",
        "cur_userid": "1ec86197-d331-483a-b325-62cc26433ea5",
        "email": "adm@atc.com.br",
        "user_name": "ADM ATC",
        "onergy_rolid": "",
        "praid": "28cb4668-7940-4131-8750-abf35f6eba70",
        "pcvid": "bad0bc53-29f5-45b6-ac6f-59ce01822202",
        "prcid": "3c17d734-8235-914f-9382-75e79ec29b16",
        "timezone": null,
        "timezone_value": "-03:00",
        "pubNubHook": null
    },
    "oneTemplateTitle": "Motor Calculo",
    "onergyLog": {
        "log_fluxo": true,
        "logData": {
            "criar_linhas_calculo": true,
            "motor_calculo": true
        }
    },
    "ass_id": "67c0b77d-abae-4c48-ba4b-6c8faf27e14a",
    "assid": "67c0b77d-abae-4c48-ba4b-6c8faf27e14a",
    "email": "adm@atc.com.br",
    "fdtid": "212fa4a8-2628-4159-a3eb-5b45cdc0c20a",
    "fedid": "7411b298-6069-43d7-b509-fecc5597a22e",
    "onergy_rolid": "",
    "timezone": null,
    "usrid": "1ec86197-d331-483a-b325-62cc26433ea5",
    "onergy_js_ctx": {
        "assid": "67c0b77d-abae-4c48-ba4b-6c8faf27e14a",
        "fedid": "7411b298-6069-43d7-b509-fecc5597a22e",
        "fdtid": "212fa4a8-2628-4159-a3eb-5b45cdc0c20a",
        "usrid": "1ec86197-d331-483a-b325-62cc26433ea5",
        "insertDt": "2023-05-20T22:42:43.309Z",
        "updateDt": "2023-05-20T22:43:21.352Z",
        "cur_userid": "1ec86197-d331-483a-b325-62cc26433ea5",
        "email": "adm@atc.com.br",
        "user_name": "ADM ATC",
        "onergy_rolid": "",
        "praid": "840e52ca-a26f-405c-9fc4-6db77bac40e1",
        "pcvid": "bad0bc53-29f5-45b6-ac6f-59ce01822202",
        "prcid": "3c17d734-8235-914f-9382-75e79ec29b16",
        "timezone": null,
        "timezone_value": "-03:00",
        "pubNubHook": null
    }
};

init(JSON.stringify(jsonInput));
