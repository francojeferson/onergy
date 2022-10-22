/**ENV_NODE**
 * node:test (find and replace)
 * async /**
 * await /**
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
async function onergy_updatemany(data) {
    return data;
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
/**CLI_SCRIPT**
 * Executar automático quando em processo: Não
 * Atividade de longa duração: Não
 * Esconder Menu: Sim
 * Condicional: nenhum
 * Aprovação: nenhum
 */
async function getOnergyItem(fdtid, assid, usrid, filtro) {
    let keepSearching = true;
    let skip = 0;
    let take = 500;
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
}
async function sendItemToOnergy(templateid, usrid, assid, data, fedid, ukField, checkTemplateDuplicate, addCfgViewGroup, execAction) {
    let onergySaveData = {
        fdtid: templateid,
        assid: assid,
        usrid: usrid,
        data: JSON.stringify(data),
        //executeAction: false
    };
    if (!execAction) {
        onergySaveData.executeAction = false;
    }
    if (fedid != undefined && fedid != '') {
        onergySaveData.id = fedid;
    }
    if (ukField != undefined && ukField != '') {
        onergySaveData.ukField = ukField;
        onergySaveData.blockDuplicate = true;
    }
    if (checkTemplateDuplicate != undefined && checkTemplateDuplicate != '') {
        onergySaveData.checkTemplateDuplicate = true;
    }
    if (addCfgViewGroup != undefined && addCfgViewGroup.length > 0) {
        onergySaveData.addCfgViewGroup = addCfgViewGroup;
    }
    return await onergy_save(onergySaveData);
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
function gerarDataHora(dataHoje, utc) {
    let dataHojeFormat = dataHoje.getFullYear() + '-' + (dataHoje.getMonth() + 1) + '-' + dataHoje.getDate();
    let arrayData = dataHojeFormat.split('-');
    let dataHojeFormatada = arrayData[2].padStart(2, '0') + '/' + arrayData[1].padStart(2, '0') + '/' + arrayData[0];
    let horaFormat = dataHoje.getHours() + ':' + dataHoje.getMinutes() + ':' + dataHoje.getSeconds();
    let arrayHora = horaFormat.split(':');
    let horaTimezone = parseInt(arrayHora[0]) + utc;
    let horaTimezoneFormat = JSON.stringify(horaTimezone).padStart(2, '0') + ':' + arrayHora[1].padStart(2, '0') + ':' + arrayHora[2].padStart(2, '0');
    return dataHojeFormatada + ' ' + horaTimezoneFormat;
}
async function init(json) {
    let data = JSON.parse(json);
    let arrPost = [];

    //*pesq.ref:constantes
    let idConstantes = 'efb11b9d-58d7-45fb-a8cd-d0ffbc707d0f';
    let getConstantes = await getOnergyItem(idConstantes, data.assid, data.usrid, null);
    let isAlertaCaptura = getConstantes.filter((j) => j.UrlJsonContext.nome_interno == 'dias_alerta_captura');
    let isBuscaCaptura = getConstantes.filter((j) => j.UrlJsonContext.nome_interno == 'dias_antes_captura');
    let isLimiteAjustamiento = getConstantes.filter((j) => j.UrlJsonContext.nome_interno == 'limite_ajuste');

    //*pesq.ref:estado_cuenta
    let idEstadoCuenta = '4963d2c6-2b94-4c37-bffb-87c0dc296587';
    let getEstadoCuenta = await getOnergyItem(idEstadoCuenta, data.assid, data.usrid, null);
    let isEstadoCuenta = getEstadoCuenta.filter((j) => j.UrlJsonContext.status_conta != 'INACTIVO');

    //*aba:informacion_cuenta(pai:sitios)
    let idInformacionCuenta = '21672360-869c-4c29-8cf8-2bafa8530923';
    let strEstadoCuenta = isEstadoCuenta.filter((j) => j.UrlJsonContext.status_conta == data.sta_cont_status_conta)[0].UrlJsonContext.status_conta;
    let ftrEstadoCuenta = gerarFiltro('sta_cont_status_conta', strEstadoCuenta);
    let getInformacionCuenta = await getOnergyItem(idInformacionCuenta, data.assid, data.usrid, ftrEstadoCuenta);
    if (getInformacionCuenta.length > 0) {
        for (let i in getInformacionCuenta) {
            let objPost = getInformacionCuenta[i].UrlJsonContext;

            //*pesq.ref:tipo_cuenta
            let idTipoCuenta = '84ca5970-7a49-4192-a2c8-030031503a1a';
            let getTipoCuenta = await getOnergyItem(idTipoCuenta, data.assid, data.usrid, null);
            let isTipoCuenta = getTipoCuenta.filter((j) => j.UrlJsonContext.TC_tipo_de_conta == objPost.TCTC_tipo_de_conta__prcs__tipo_de_conta);

            //*tipo_cuenta == Padre, PadreHibrido, Individual
            if (
                isTipoCuenta.length > 0 &&
                (objPost.TCTC_tipo_de_conta__prcs__tipo_de_conta == 'P' ||
                    objPost.TCTC_tipo_de_conta__prcs__tipo_de_conta == 'PH' ||
                    objPost.TCTC_tipo_de_conta__prcs__tipo_de_conta == 'I')
            ) {
                let isFrecuenciaPago = objPost.fre_pag_frequencia__frequencia_de_pagamento;

                //*frecuencia_pago == MENSUAL
                if (isFrecuenciaPago == 'MENSUAL') {
                    //*pesq.ref:estado_captura_cuenta
                    let idEstadoCapturaCuenta = '3c2d0727-6359-4c71-9409-465759462854';
                    let getEstadoCapturaCuenta = await getOnergyItem(idEstadoCapturaCuenta, data.assid, data.usrid, null);
                    let isEstadoCapturaCuenta = getEstadoCapturaCuenta.filter(
                        (j) => j.UrlJsonContext.ECCU_estado_da_captura_da_conta == objPost.ECCUECCU_estado_da_captura_da_conta__status_de_capturapago
                    );

                    //*estado_captura_cuenta == EN ESPERA
                    if (isEstadoCapturaCuenta == 'EN ESPERA') {
                        let isProximoPago = objPost.prcs__proximo_pagamento;
                        let isProximaCaptura = objPost.prcs__proxima_captura;
                        let isDiaDePago = objPost.prcs__dia_de_pagamento;
                        debugger;
                    }
                }
            }
        }
    } else {
        onergy.log(`JFS: getInformacionCuenta: Estado de Cuenta ${strEstadoCuenta} no encontrado para Información de la Cuenta ${data.asset_number}`);
        return;
    }

    //pra que serve
    //tantos códigos
    //se a vida
    //não é programada
    //e as melhores coisas
    //não tem lógica
    //return true;
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

    let obj = {
        cond: cond,
        json: JSON.stringify(json),
        WaitingWebHook: WaitingWebHook,
    };
    return obj;
}
/**STD_METHODS**
 */
let json = {
    nomePlanilhaCarga: 'tablas_maestras_v4.xlsx',
    equipe: 'COL',
    tppf_tipo_portifolio__portfolio: 'TIGO VMLA COLLOS',
    asset_number: '196502',
    profit_cost_center: '196502-WT1',
    portafolio_atc: 'TIGO VMLA COLLOS',
    emp_atc_site: 'ATC SITIOS DE COLOMBIA S.A.S',
    conta_interna_nic: '1117502',
    prcs__conta_pai: 'NO',
    TCTC_tipo_de_conta__prcs__tipo_de_conta: 'I',
    numero_do_medidor: 'jfs-numero-medidor-2042',
    emp_atc_site__prcs__assinante_atc: 'ATC SITIOS DE COLOMBIA S.A.S',
    sta_cont_status_conta: 'ACTIVA',
    prvd_nome_provedor: 'CARIBESOL DE LA COSTA SAS. ESP -  AIR-E',
    nombre_comercial: 'AIR E SAS ESP',
    nombre_beneficiario: 'AIR E SAS ESP',
    suj_pa_sujeito__prcs__sujeito_passivo_alumbrado_publico: 'ATC',
    prcs__acuerdo_resolucion_alumbrado_publico: 'jfs-acuerdo-resolucion-2042',
    tipo_cobr_tipos_cobrancas__tipo_de_cobranca: 'VARIABLE',
    prcs__dia_de_pagamento: 16,
    ECCUstatus_de_capturapago_id: '4e105a9a-86fe-8811-f04b-50da183cfa8f',
    CPTprcs__clasificacion_passthru_id: '935a0db5-02b9-41f6-8c64-500152f912fd',
    for_pag_forma_de_pagamento_id: '89781b6e-d9d7-40bd-b88f-168b727e3e26',
    fre_pag_frequencia_de_pagamento_id: '519cec38-38b9-45db-b8a6-9f52259d93b4',
    fre_pag_frequencia__frequencia_de_pagamento: 'MENSUAL',
    for_pag_formas_de_pagamentos__forma_de_pagamento: 'PSE',
    CPTclassificacao_passthru__prcs__clasificacion_passthru: 'VMLA',
    ECCUECCU_estado_da_captura_da_conta__status_de_capturapago: 'EN ESPERA',
    prcs__proxima_captura: '2022-10-21 00:00:00',
    prcs__proximo_pagamento: '2022-10-21 00:00:00',
    tipo_cobr_tipo_de_cobranca_id: 'a10cbcaa-b0f2-4515-81b6-4ea900a11301',
    suj_pa_prcs__sujeito_passivo_alumbrado_publico_id: 'e801fa1d-4892-4a6a-8b67-73fa662a6395',
    tipo_acceso: 'DIRECTO',
    SERVservico_id: 'dccfc5ec-05a4-4547-b026-aed00d8c2440',
    SERVservicos__servico: 'ENERGIA',
    onergyteam_equipe: 'COL',
    onergyteam_id: '084942ee-dd72-45f7-b044-6a47395bf6cc',
    ID_ONE_REF: 'fe3f71c2-2e8a-4d8a-8384-0c854252084d',
    asset_number_IDC: '196502',
    site_name: 'Juan REY A 2013',
    TCprcs__tipo_de_conta_id: '918ee6ff-a9ca-c76d-90a8-c0538d111d2b',
    TCTC_tipo_de_conta__TC_tipo_de_conta_valor: 'I',
    prcs__tipo_de_conta_cache: '918ee6ff-a9ca-c76d-90a8-c0538d111d2b',
    emp_atc_prcs__assinante_atc_id: '87b272d2-54c1-4c09-a6cf-187c51adcec9',
    sta_cont_id: '93a8ad28-42a9-44b2-9787-ba0df7650b0b',
    prvd_id: '95611535-dfa3-4736-8f90-14713e51b7f8',
    nome_provedor_id_cache: '95611535-dfa3-4736-8f90-14713e51b7f8',
    prvd_nome_comercial: 'AIR E SAS ESP',
    prvd_nit_provedor: 901380930,
    prvd_nit_beneficiario: 901380930,
    prvd_beneficiario: 'AIR E SAS ESP',
    prvd_apelido_provedor: 'CARIBESOL',
    prvd_link_web: 'https://caribesol.facture.co/Consulta#/List',
    prvd_usuario: 'PIDE DOS VECES EL NÚMERO DE CUENTA',
    prvd_senha: 'N/A',
    oneTemplateTitle: '',
};
let idATC = {
    assid: '67c0b77d-abae-4c48-ba4b-6c8faf27e14a',
    usrid: '0c44d4fc-d654-405b-9b8f-7fea162948b5',
};
json = Object.assign(json, idATC);
init(JSON.stringify(json));
