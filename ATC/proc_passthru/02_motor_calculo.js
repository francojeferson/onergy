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

            let valoresPromedio = (() => {
                let faturas_CTSM = linhasCalculo.filter(VALUE => ["BTS - MLA/CT/SM"].includes(VALUE.UrlJsonContext.pstr_tipologia));
                let faturas_CTCM = linhasCalculo.filter(VALUE => ["BTS - MLA/CT/CM"].includes(VALUE.UrlJsonContext.pstr_tipologia));

                let valorTotalReembolsoEnergia_CTSM = faturas_CTSM.map(VALUE => VALUE.UrlJsonContext.passthru__reembolso_energia).reduce((previousValue, currentValue) => Number(previousValue) + Number(currentValue));
                let valorTotalReembolsoEnergia_CTCM = faturas_CTCM.map(VALUE => VALUE.UrlJsonContext.passthru__reembolso_energia).reduce((previousValue, currentValue) => Number(previousValue) + Number(currentValue));

                let valorTotalReembolsoContribuicao_CTSM = faturas_CTSM.map(VALUE => VALUE.UrlJsonContext.passthru__reembolso_contribucion).reduce((previousValue, currentValue) => Number(previousValue) + Number(currentValue));
                let valorTotalReembolsoContribuicao_CTCM = faturas_CTCM.map(VALUE => VALUE.UrlJsonContext.passthru__reembolso_contribucion).reduce((previousValue, currentValue) => Number(previousValue) + Number(currentValue));

                return {
                    "medias_CTSM": {
                        "mediaEnergia": (faturas_CTSM.length > 0 && valorTotalReembolsoEnergia_CTSM) ? Number((valorTotalReembolsoEnergia_CTSM / faturas_CTSM.length).toFixed(2)) : 0,
                        "mediaContribuicao": (faturas_CTSM.length > 0 && valorTotalReembolsoContribuicao_CTSM) ? Number((valorTotalReembolsoContribuicao_CTSM / faturas_CTSM.length).toFixed(2)) : 0,
                    },
                    "media_CTCM": {
                        "mediaEnergia": (faturas_CTCM.length > 0 && valorTotalReembolsoEnergia_CTCM) ? Number((valorTotalReembolsoEnergia_CTCM / faturas_CTCM.length).toFixed(2)) : 0,
                        "mediaContribuicao": (faturas_CTCM.length > 0 && valorTotalReembolsoContribuicao_CTCM) ? Number((valorTotalReembolsoContribuicao_CTCM / faturas_CTCM.length).toFixed(2)) : 0,
                    }
                };
            })();
            for (let index in faturas_STSM) {
                faturas_STSM[index] = await calcularLinha(faturas_STSM[index], valoresPromedio.medias_CTSM);
            }
            for (let index in faturas_STCM) {
                faturas_STCM[index] = await calcularLinha(faturas_STCM[index], valoresPromedio.media_CTCM);
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

const calcularLinha = async (LINHA, objMediasPromedio) => {
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
    let passthru__reembolso_energia = await (async () => {
        if (objMediasPromedio) {
            return objMediasPromedio.mediaEnergia ?? 0;
        }
        return await calcReembolsoEnergia(passthru__tarifa_energia, linhaContext.pstr_consumo_sugerido);
    })();

    // reembolso contribucion
    // mla-bts: (contribucion factura * consumo sugerido) / consumo factura == reembolso contribucion
    let passthru__reembolso_contribucion = await (async () => {
        if (objMediasPromedio) {
            return objMediasPromedio.mediaContribuicao ?? 0;
        }
        return await calcReembolsoContribucion(linhaContext.pstr_contribucion_factura, linhaContext.pstr_consumo_sugerido, linhaContext.pstr_consumo_factura);
    })();

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
    // obs: para BTS-MLA e OCCASIO OPERADOR, excluir intereses mora
    let cnacRevisado = await calcCnacExInteresesMora(linhaContext.pstr_cnac_factura, linhaContext.pstr_aseo_factura, linhaContext.pstr_vigilancia_factura, linhaContext.pstr_intereses_mora_factura, linhaContext.pstr_financiacion_factura, linhaContext.pstr_reconexion_factura, linhaContext.pstr_tarifa_conexion_factura, linhaContext.pstr_alquiler_contadores_factura, linhaContext.pstr_iva_factura, linhaContext.pstr_tipologia);

    let passthru__reembolso_cnac = await calcReembolsoCnac(cnacRevisado, linhaContext.pstr_consumo_factura, linhaContext.pstr_consumo_sugerido, linhaContext.pstr_tipologia, linhaContext.pstr_constante_cnac, linhaContext.pstr_tipologia);

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
    let isReembolsoTotalFactura = reembolsoTotalFactura.some(i => linhaContext.pstr_tipologia.includes(i));

    let noCobroFactura = ['Desmantelado', 'Otros Operadores', 'DAS', 'SIN INFORMACIÓN', 'Equipos Apagados', 'Sin Equipos sin Consumo'];
    let isNoCobroFactura = noCobroFactura.some(i => linhaContext.pstr_tipologia.includes(i));
    //============================//

    LINHA.UrlJsonContext = {
        ...linhaContext,
        "passthru__tarifa_energia": isNoCobroFactura ? 0 : isReembolsoTotalFactura ? parseFloat(linhaContext.pstr_tarifa_factura.toFixed(3)) : parseFloat(passthru__tarifa_energia.toFixed(3)),
        "passthru__valor_neto": isNoCobroFactura || isReembolsoTotalFactura ? 0 : parseFloat(passthru__valor_neto.toFixed(0)),
        "passthru__reembolso_energia": isNoCobroFactura ? 0 : isReembolsoTotalFactura ? parseFloat(linhaContext.pstr_energia_factura.toFixed(0)) : parseFloat(passthru__reembolso_energia.toFixed(0)),
        "passthru__reembolso_contribucion": isNoCobroFactura ? 0 : isReembolsoTotalFactura ? parseFloat(linhaContext.pstr_contribucion_factura.toFixed(0)) : parseFloat(passthru__reembolso_contribucion.toFixed(0)),
        "passthru__reembolso_alumbrado_publico": isNoCobroFactura ? 0 : isReembolsoTotalFactura ? parseFloat(linhaContext.pstr_alumbrado_factura.toFixed(0)) : parseFloat(passthru__reembolso_alumbrado_publico.toFixed(0)),
        "passthru__reembolso_cnac": isNoCobroFactura ? 0 : isReembolsoTotalFactura ? parseFloat(linhaContext.pstr_cnac_factura.toFixed(0)) : parseFloat(passthru__reembolso_cnac.toFixed(0)),
        "passthru__total_reembolso": isNoCobroFactura ? 0 : isReembolsoTotalFactura ? parseFloat(linhaContext.pstr_total_factura.toFixed(0)) : parseFloat(passthru__total_reembolso.toFixed(0)),
        "passthru__total_energ_contrib_cnac": isNoCobroFactura ? 0 : isReembolsoTotalFactura ? parseFloat((linhaContext.pstr_energia_factura + linhaContext.pstr_contribucion_factura + linhaContext.pstr_cnac_factura).toFixed(0)) : parseFloat(passthru__total_energ_contrib_cnac.toFixed(0)),
        "passthru__alumbrado_asumido_atc": isNoCobroFactura || isReembolsoTotalFactura ? 0 : parseFloat(passthru__alumbrado_asumido_atc.toFixed(0)),
        "passthru__costo_atc": isNoCobroFactura || isReembolsoTotalFactura ? 0 : parseFloat(passthru__costo_atc.toFixed(0)),
    };

    return LINHA;
};

const calcFacturaValorNeto = async (energiaFactura, contribucionFactura) => {
    // mla-bts: energia + contribucion == valor neto
    let passthru__valor_neto = energiaFactura + contribucionFactura;
    return passthru__valor_neto;
};

const calcTarifaEnergia = async (energiaFactura, consumoFactura) => {
    // mla-bts: tarifa energia == tarifa energia
    let tarifaEnergia = energiaFactura / consumoFactura;
    return (tarifaEnergia > 0) ? tarifaEnergia : 0;
};

const calcReembolsoEnergia = async (passthru__tarifa_energia, consumoSugerido) => {
    // mla-bts: tarifa energia * consumo sugerido == reembolso energia
    let reembolsoEnergia = passthru__tarifa_energia * consumoSugerido;
    return reembolsoEnergia;
};

const calcReembolsoContribucion = async (contribucionFactura, consumoSugerido, consumoFactura) => {
    // mla-bts: (contribucion factura * consumo sugerido) / consumo factura == reembolso contribucion
    let reembolsoContribucion = (contribucionFactura * consumoSugerido) / consumoFactura;
    return (reembolsoContribucion > 0) ? reembolsoContribucion : 0;
};

const calcReembolsoAlumbrado = async (sujetoPasivo, valorSujetoPasivo, qtdProvisionales, alumbradoFactura) => {
    // alumbrado * sujeto pasivo == reembolso alumbrado
    // dependendo de qtd provisional, reduz sujeto pasivo
    let calcSujetoPasivo, reembolsoAlumbradoPublico;
    if (sujetoPasivo == 'TIGO') {
        calcSujetoPasivo = valorSujetoPasivo / (qtdProvisionales + 1);
        reembolsoAlumbradoPublico = alumbradoFactura * (calcSujetoPasivo / 100);
    } else if (sujetoPasivo == 'TIGO-ATC 50%-50%') {
        calcSujetoPasivo = valorSujetoPasivo / (qtdProvisionales + 1);
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

const calcCnacExInteresesMora = async (cnacFactura, aseoFactura, vigilanciaFactura, interesesMoraFactura, financiacionFactura, reconexionFactura, tarifaConexionFactura, alquilerContadoresFactura, ivaFactura, tipologiaCliente) => {
    //========== FILTRO =============//
    let cnacExInteresesMora = ['BTS - MLA/CT/CM', 'BTS - MLA/CT/SM', 'BTS - MLA/ST/CM', 'BTS - MLA/ST/SM', 'OCCASIO POR OPERADOR'];
    let iscnacExInteresesMora = cnacExInteresesMora.some(i => tipologiaCliente.includes(i));
    //============================//

    if (iscnacExInteresesMora && interesesMoraFactura > 0) {
        cnacFactura = aseoFactura + vigilanciaFactura + financiacionFactura + reconexionFactura + tarifaConexionFactura + alquilerContadoresFactura + ivaFactura;
    }
    return cnacFactura;
};

const calcReembolsoCnac = async (cnacFactura, consumoFactura, consumoSugerido, tipologiaCliente, constanteCnac) => {
    // se tipologia cliente == occasio operador,
    // ( cnac * consumo ami ) / consumo kwh == cnac tigo
    // (cnac - cnac tigo) == cnac atc
    // senão, cnac * constante cnac == reembolso cnac
    let cnacTigo, reembolsoCnac;
    if (tipologiaCliente == 'OCCASIO POR OPERADOR') {
        cnacTigo = (cnacFactura * consumoSugerido) / consumoFactura;
        reembolsoCnac = cnacTigo;
    } else {
        reembolsoCnac = cnacFactura * (constanteCnac / 100);
    }
    return (reembolsoCnac > 0) ? reembolsoCnac : 0;
};

const calcTotalReembolso = async (passthru__reembolso_energia, passthru__reembolso_contribucion, passthru__reembolso_alumbrado_publico, passthru__reembolso_cnac) => {
    // reembolso energia + reembolso contribucion + reembolso alumbrado publico + reembolso cnac == total reembolso
    let totalReembolso = passthru__reembolso_energia + passthru__reembolso_contribucion + passthru__reembolso_alumbrado_publico + passthru__reembolso_cnac;
    return totalReembolso;
};

const calcTotalEnergContribCnac = async (passthru__reembolso_energia, passthru__reembolso_contribucion, passthru__reembolso_cnac) => {
    let totalEnergContribCnac = passthru__reembolso_energia + passthru__reembolso_contribucion + passthru__reembolso_cnac;
    return totalEnergContribCnac;
};

const calcCostoAtc = async (totalFactura, passthru__total_reembolso) => {
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
    "pstr_sequecial_passthru": "PASS202300030",
    "pstr_usuario_de_criacao": "ADM ATC",
    "data_de_criacao_pstrDate": "2023-05-27T20:05:17Z",
    "data_de_criacao_pstr": "2023-05-27 17:05:17",
    "pstr_hora_criacao": "17:05",
    "pstr_status_processo": "ENVIADO A PROCESO",
    "pstr_ids_faturas_selecionadas": "",
    "onergy_js_ctx_ORIGINAL": {
        "assid": "67c0b77d-abae-4c48-ba4b-6c8faf27e14a",
        "fedid": "23bcc47f-aab1-8bb2-3cd3-71e63ff551e8",
        "fdtid": "06456424-a022-46a3-93b9-67e65eb31726",
        "usrid": "1ec86197-d331-483a-b325-62cc26433ea5",
        "insertDt": "2023-05-27T20:04:05.947Z",
        "updateDt": "2023-05-27T20:04:05.947Z",
        "cur_userid": "1ec86197-d331-483a-b325-62cc26433ea5",
        "email": "adm@atc.com.br",
        "user_name": "ADM ATC",
        "onergy_rolid": "",
        "praid": "1513e76f-a9ce-4f1f-a387-207bed950359",
        "pcvid": "d5d667c9-3937-4e95-a76f-4623f4d86768",
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
            "motor_calculo": true,
            "criacao_de_excel": true
        }
    },
    "ass_id": "67c0b77d-abae-4c48-ba4b-6c8faf27e14a",
    "assid": "67c0b77d-abae-4c48-ba4b-6c8faf27e14a",
    "email": "adm@atc.com.br",
    "fdtid": "212fa4a8-2628-4159-a3eb-5b45cdc0c20a",
    "fedid": "619eaf2b-3597-4baf-a99f-fcd2b8269e27",
    "onergy_rolid": "",
    "timezone": null,
    "usrid": "1ec86197-d331-483a-b325-62cc26433ea5",
    "onergy_js_ctx": {
        "assid": "67c0b77d-abae-4c48-ba4b-6c8faf27e14a",
        "fedid": "619eaf2b-3597-4baf-a99f-fcd2b8269e27",
        "fdtid": "212fa4a8-2628-4159-a3eb-5b45cdc0c20a",
        "usrid": "1ec86197-d331-483a-b325-62cc26433ea5",
        "insertDt": "2023-05-27T20:04:12.45Z",
        "updateDt": "2023-05-27T20:04:39.057Z",
        "cur_userid": "1ec86197-d331-483a-b325-62cc26433ea5",
        "email": "adm@atc.com.br",
        "user_name": "ADM ATC",
        "onergy_rolid": "",
        "praid": "4d14adb1-6d9a-42fe-aceb-aaa00557e72e",
        "pcvid": "d5d667c9-3937-4e95-a76f-4623f4d86768",
        "prcid": "3c17d734-8235-914f-9382-75e79ec29b16",
        "timezone": null,
        "timezone_value": "-03:00",
        "pubNubHook": null
    }
};

init(JSON.stringify(jsonInput));
