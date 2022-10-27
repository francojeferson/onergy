// 1. Objetivo del proceso:

// Verificar que la/as Facturas de cada Cuenta correspondientes al período fueron capturadas por los diversos medios de obtención de Facturas (RPA, upload de PDF, Manual, Email - verificar)

// 2. Breve Descripción:

// El proceso será programado para ejecución diaria (horario a combinar) de forma automática. Este proceso no requiere intervención del usuario.

// IMPORTANTE: Esta definición asume como premisa que durante el proceso de carga de una factura (cualquiera que sea el medio de carga) el Estado de Captura de la Cuenta se actualizará al valor "CAPTURADO" y se actualizará la fecha de Última Captura por este proceso de carga..

// El proceso buscará todos los registros de Informaciones de la Cuenta y para cada uno de ellos se comprobará inicialmente el Estado de Captura de la Cuenta.

// Dependiendo del Estado de la Cuenta, la fecha de ejecución del proceso (Hoy) y la fecha de Próximo Pago Oportuno (PPO) el sistema emitirá  información de  Atraso o Alerta si el valor del campo Estado de Captura no es "CAPTURADO" en las cercanías de la fecha de PPO.

// El dia después del Pago Oportuno, el sistema recalcula los valores de los campos Próximo Pago Oportuno (PPO) y Próxima Captura (PC) considerando la Frecuencia de Pago de la Cuenta.

// IMPORTANTE: El proceso se centra  únicamente en la captura de Facturas Cuenta. No comprueba el importe de las facturas, es decir, no comprueba si una factura corresponde al período exactamente posterior de la anterior o si tiene un intervalo de período entre las facturas.

// 3. Diagrama del Proceso

// ATC/proc_captura_facturas_cuenta_0a17be9c-1247-2f1e-b91c-15740976f2c5/c4848211-9ea7-47c5-8902-fe221e870e6a.png

// 4. Componentes del Proceso:

// 4.1 Schedule

// El proceso se ejecuta una vez al día. Preferiblemente por la noche.

// Barrerá todos los registros de Informaciones de la Cuenta. La Secuencia de Lectura será:

// Cuentas Padre y Padres Híbridas

// Cuentas Hijas e Hija Híbridas

// Cuentas Individuales

// 4.2. Consulta de Estado y Cambio de Campo Captura de la Cuenta

// La consulta Captura de la Cuenta State se realiza para cada registro independientemente del Tipo de Cuenta

// Los únicos valores posibles del campo Captura state de la Cuenta son:

// EN ESPERA

// ATRASADA

// ALERTA

// CAPTURADA

// 4.3. Descripción del proceso

// 4.3.1 Verifica Data de Próximo Pago Oportuno

// Si Próximo Pago Oportuno + 1 = Hoy, entonces continua aqui si no salta para el próximo paso 4.3.2

// A) Calcula  Proximo Pago Oportuno

// Para Cuentas del Tipo: P, PH o I

// Próximo Pago Oportuno = Próximo Pago Oportuno (actual) + Frecuencia

// Para Cuentas de Tipo: H o HH

// copiar PPO de su Padre

// B ) Próxima Captura

// Para Cuentas del Tipo: P, PH o I

// Próxima Captura = Próximo Pago Oportuno - Atraso

// Para Cuentas de Tipo: H o HH

// copiar Próxima Captura de su Padre

// C) Parámetros

// Atraso = Constante del Sistema (tabla Constantes)

// Alerta = Constante del Sistema (tabla Constantes)

// 4.3.2 Viene del paso 4.3.1 en el caso que Próximo Pago Oportuno +1 <> Hoy

// Si ABA IDC - Estado de Captura = CAPTURDA, próximo registro

// Si no continua abajo

// Si Hoy > Próximo Pago Oportuno - (Constante-Atraso) , entonces ABA IDC Estado de Captura = ATRASO

// Si no, próximo registro

// Si Hoy > Próximo Pago Oportuno - (Constante-Alerta) , entonces ABA IDC Estado de Captura = ALERTA

// Si no, próximo registro

// 4.4 Continua el proceso hasta el último registro de ABA Informaciones de la Cuenta

// 5. Consideraciones para el proceso de carga masiva de Informaciones de la Cuenta

// El valor predeterminado para el campo Estado de captura es igual a "EN ESPERA"

// El valor predeterminado para el campo Próximo Pago Oportuno es igual a (Dia de Pagamento + Mes Actual del Sistema + Año Actual)

/**ENV_NODE**
 * node:test (find and replace)
 * /*async*/ /**
 * /*await*/ /**
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
/*async*/ function ajax(args) {
    return /*await*/ onergy.ajax(args);
}
/*async*/ function ajaxPost(args) {
    return /*await*/ onergy.ajaxPost(args);
}
/*async*/ function hashMd5(args) {
    return /*await*/ onergy.hashMd5(args);
}
/*async*/ function increment(args) {
    return /*await*/ onergy.increment(args);
}
/*async*/ function onergy_countdocs(args) {
    return /*await*/ onergy.onergy_countdocs(args);
}
/*async*/ function onergy_get(args) {
    let r = /*await*/ onergy.onergy_get(args);
    return JSON.stringify(r);
}
/*async*/ function onergy_save(args) {
    return /*await*/ onergy.onergy_save(args);
}
/*async*/ function ReadExcelToJson(args) {
    return /*await*/ onergy.ReadExcelToJson(args);
}
/*async*/ function ReadTextPdf(args) {
    return /*await*/ onergy.ReadTextPdf(args);
}
/*async*/ function sendmail(args) {
    return /*await*/ onergy.sendmail(args);
}
/*async*/ function onergy_sendto(args) {
    let r = /*await*/ onergy.onergy_sendto(args);
    return JSON.stringify(r);
}
/*async*/ function onergy_updatemany(data) {
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
/*async*/ function getOnergyItem(fdtid, assid, usrid, filtro) {
    let keepSearching = true;
    let skip = 0;
    let take = 500;
    let result = [];
    while (keepSearching) {
        let strPageResp = /*await*/ onergy_get({
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
/*async*/ function sendItemToOnergy(templateid, usrid, assid, data, fedid, ukField, checkTemplateDuplicate, addCfgViewGroup, execAction) {
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
    return /*await*/ onergy_save(onergySaveData);
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
function gerarData(dataHoje) {
    let dataHojeFormat = dataHoje.getFullYear() + '-' + (dataHoje.getMonth() + 1) + '-' + dataHoje.getDate();
    let arrayData = dataHojeFormat.split('-');
    let dataHojeFormatada = arrayData[0] + '-' + arrayData[1].padStart(2, '0') + '-' + arrayData[2].padStart(2, '0');
    return dataHojeFormatada;
}
/*async*/ function init(json) {
    let data = JSON.parse(json);

    //*pesq.ref:constantes
    let idConstantes = 'efb11b9d-58d7-45fb-a8cd-d0ffbc707d0f';
    let getConstantes = /*await*/ getOnergyItem(idConstantes, data.assid, data.usrid, null);
    let isConstAlertaCaptura = getConstantes.filter((j) => j.UrlJsonContext.nome_interno == 'dias_alerta_captura');
    let isConstBuscaCaptura = getConstantes.filter((j) => j.UrlJsonContext.nome_interno == 'dias_antes_captura');
    let isConstDiaCorte = getConstantes.filter((j) => j.UrlJsonContext.nome_interno == 'dia_corte');

    //*pesq.ref:estado_cuenta
    let idEstadoCuenta = '4963d2c6-2b94-4c37-bffb-87c0dc296587';
    let getEstadoCuenta = /*await*/ getOnergyItem(idEstadoCuenta, data.assid, data.usrid, null);
    let isEstadoCuenta = getEstadoCuenta.filter((j) => j.UrlJsonContext.status_conta != 'INACTIVO');

    //*aba:informacion_cuenta(pai:sitios)
    let idInformacionCuenta = '1e6d6595-083f-4bb8-b82c-e9054e9dc8f3';
    let getInformacionCuenta = /*await*/ getOnergyItem(idInformacionCuenta, data.assid, data.usrid, null);
    let isInformacionCuenta = getInformacionCuenta.filter((j) => j.UrlJsonContext.sta_cont_status_conta == isEstadoCuenta[(0, 1, 2)].UrlJsonContext.status_conta);
    if (isInformacionCuenta.length > 0) {
        for (let i in isInformacionCuenta) {
            let objPost = isInformacionCuenta[i].UrlJsonContext;

            //*pesq.ref:tipo_cuenta
            let idTipoCuenta = '84ca5970-7a49-4192-a2c8-030031503a1a';
            let getTipoCuenta = /*await*/ getOnergyItem(idTipoCuenta, data.assid, data.usrid, null);
            let isTipoCuenta = getTipoCuenta.filter((j) => j.UrlJsonContext.TC_tipo_de_conta == objPost.TCTC_tipo_de_conta__prcs__tipo_de_conta);

            //*tipo_cuenta == P || PH || I, calcula ProximoPago e ProximaCaptura
            //*else, copia ProximoPago e ProximaCaptura de P para H || HH
            if (
                isTipoCuenta.length > 0 &&
                (objPost.TCTC_tipo_de_conta__prcs__tipo_de_conta == 'P' || objPost.TCTC_tipo_de_conta__prcs__tipo_de_conta == 'PH' || objPost.TCTC_tipo_de_conta__prcs__tipo_de_conta == 'I')
            ) {
                //*pesq.ref:frecuencia_pago
                let idFrecuenciaPago = '2d4edce3-7131-413a-98e5-35d328daef7f';
                let getFrecuenciaPago = /*await*/ getOnergyItem(idFrecuenciaPago, data.assid, data.usrid, null);
                let isFrecuenciaPago = getFrecuenciaPago.filter((j) => j.UrlJsonContext.frequencia == objPost.fre_pag_frequencia__frequencia_de_pagamento);

                //*frecuencia_pago
                if (isFrecuenciaPago.length > 0) {
                    //*pesq.ref:estado_captura_cuenta
                    let idEstadoCapturaCuenta = '3c2d0727-6359-4c71-9409-465759462854';
                    let getEstadoCapturaCuenta = /*await*/ getOnergyItem(idEstadoCapturaCuenta, data.assid, data.usrid, null);
                    let isEstadoCapturaCuenta = getEstadoCapturaCuenta.filter(
                        (j) => j.UrlJsonContext.ECCU_estado_da_captura_da_conta == objPost.ECCUECCU_estado_da_captura_da_conta__status_de_capturapago
                    );

                    //*estado_captura_cuenta
                    if (isEstadoCapturaCuenta.length > 0) {
                        let hoje = new Date();

                        //*DiaDePago
                        let isDiaDePago = objPost.prcs__dia_de_pagamento;
                        let strDiaDePago = JSON.stringify(isDiaDePago);
                        let hojeDiaDePago = gerarData(hoje);
                        let newDiaDePago = hojeDiaDePago.slice(0, -2) + strDiaDePago;
                        let setDiaDePago = new Date(newDiaDePago + ' 00:00:00');

                        //*ProximoPago
                        let isProximoPago = objPost.prcs__proximo_pagamento;
                        let validProximoPago = isProximoPago.includes(' 00:00:00') ? isProximoPago : isProximoPago + ' 00:00:00';
                        let setProximoPago = new Date(validProximoPago);

                        //*se ProximoPago <= ontem, calcula novo ProximoPago e ProximaCaptura
                        let isHoje = new Date(hoje);
                        let ontem = new Date(isHoje.setDate(isHoje.getDate() - 1));
                        if (setProximoPago.getTime() <= ontem.getTime()) {
                            //*calcula ProximoPago
                            let valFrecuenciaPago = isFrecuenciaPago[0].UrlJsonContext.frequencia_em_meses;
                            let thisProximoPago = setProximoPago;
                            let newProximoPago = new Date(thisProximoPago.setMonth(thisProximoPago.getMonth() + valFrecuenciaPago));
                            let ajustProximoPago = new Date(newProximoPago.setDate(setDiaDePago.getDate()));

                            //*calcula ProximaCaptura
                            let valConstBuscaCaptura = JSON.parse(isConstBuscaCaptura[0].UrlJsonContext.valor);
                            let isProximaCaptura = new Date(ajustProximoPago);
                            let newProximaCaptura = new Date(isProximaCaptura.setDate(isProximaCaptura.getDate() - valConstBuscaCaptura));

                            //*estado_captura_cuenta == EN ESPERA
                            let newEstadoCapturaCuenta = objPost.ECCUECCU_estado_da_captura_da_conta__status_de_capturapago;
                            newEstadoCapturaCuenta = 'EN ESPERA';

                            //*envia resultado
                            objPost.prcs__proximo_pagamento = gerarData(ajustProximoPago);
                            objPost.prcs__proxima_captura = gerarData(newProximaCaptura);
                            objPost.ECCUECCU_estado_da_captura_da_conta__status_de_capturapago = newEstadoCapturaCuenta;

                            //!node:test(unhide log and hide resultPost)
                            // onergy.log(
                            //     `[JFS] asset_number: ${objPost.asset_number} - proximo_pago: ${objPost.prcs__proximo_pagamento} - proxima_captura: ${objPost.prcs__proxima_captura} - estado_captura_cuenta: ${objPost.ECCUECCU_estado_da_captura_da_conta__status_de_capturapago}`
                            // );
                            let resultPost = /*await*/ sendItemToOnergy(idInformacionCuenta, data.usrid, data.assid, objPost, '', 'asset_number', true, false, false);
                        } else if (objPost.ECCUECCU_estado_da_captura_da_conta__status_de_capturapago == 'CAPTURADA') {
                            //*else if, estado_captura_cuenta == CAPTURADA
                            //!node:test(unhide log)
                            // onergy.log(
                            //     `[JFS] asset_number: ${objPost.asset_number} - estado_captura_cuenta: ${objPost.ECCUECCU_estado_da_captura_da_conta__status_de_capturapago}`
                            // );
                            continue;
                        } else {
                            //*else, check hoje > (ProximoPago - constAtraso)
                            let valConstDiaCorte = JSON.parse(isConstDiaCorte[0].UrlJsonContext.valor);
                            let thisProximoPago = setProximoPago;
                            let atrasoProximoPago = new Date(thisProximoPago.setDate(thisProximoPago.getDate() - valConstDiaCorte));
                            //!node:test(unhide log)
                            // onergy.log(`[JFS] asset_number: ${objPost.asset_number} - hoje: ${hoje} - atrasoProximoPago: ${atrasoProximoPago}`);

                            //*hoje > (ProximoPago - constAtraso)
                            if (hoje.getTime() > atrasoProximoPago.getTime()) {
                                //*estado_captura_cuenta == ATRASADA
                                let newEstadoCapturaCuenta = objPost.ECCUECCU_estado_da_captura_da_conta__status_de_capturapago;
                                newEstadoCapturaCuenta = 'ATRASADA';

                                //*envia resultado
                                objPost.ECCUECCU_estado_da_captura_da_conta__status_de_capturapago = newEstadoCapturaCuenta;
                                //!node:test(unhide log and hide resultPost)
                                // onergy.log(
                                //     `[JFS] asset_number: ${objPost.asset_number} - estado_captura_cuenta: ${objPost.ECCUECCU_estado_da_captura_da_conta__status_de_capturapago}`
                                // );
                                let resultPost = /*await*/ sendItemToOnergy(idInformacionCuenta, data.usrid, data.assid, objPost, '', 'asset_number', true, false, false);

                                //*check hoje >= (ProximoPago - constAlerta)
                                let valConstAlerta = JSON.parse(isConstAlertaCaptura[0].UrlJsonContext.valor);
                                let thisProximoPago = setProximoPago;
                                let alertaProximoPago = new Date(thisProximoPago.setDate(thisProximoPago.getDate() - valConstAlerta));
                                //!node:test(unhide log)
                                // onergy.log(`[JFS] asset_number: ${objPost.asset_number} - hoje: ${hoje} - alertaProximoPago: ${alertaProximoPago}`);

                                //*hoje >= (ProximoPago - constAlerta)
                                if (hoje.getTime() > alertaProximoPago.getTime()) {
                                    //*estado_captura_cuenta == ALERTA
                                    let newEstadoCapturaCuenta = objPost.ECCUECCU_estado_da_captura_da_conta__status_de_capturapago;
                                    newEstadoCapturaCuenta = 'ALERTA';

                                    //*envia resultado
                                    objPost.ECCUECCU_estado_da_captura_da_conta__status_de_capturapago = newEstadoCapturaCuenta;
                                    //!node:test(unhide log and hide resultPost)
                                    // onergy.log(
                                    //     `[JFS] asset_number: ${objPost.asset_number} - estado_captura_cuenta: ${objPost.ECCUECCU_estado_da_captura_da_conta__status_de_capturapago}`
                                    // );
                                    let resultPost = /*await*/ sendItemToOnergy(idInformacionCuenta, data.usrid, data.assid, objPost, '', 'asset_number', true, false, false);
                                }
                            }
                        }
                    }
                }
            } else if (isTipoCuenta.length > 0 && (objPost.TCTC_tipo_de_conta__prcs__tipo_de_conta == 'H' || objPost.TCTC_tipo_de_conta__prcs__tipo_de_conta == 'HH')) {
                //*else, copia ProximoPago e ProximaCaptura de P para H || HH
                let isCuentaPadre = objPost.prcs__conta_pai;
                let strInformacionCuenta = isInformacionCuenta.filter((j) => j.UrlJsonContext.conta_interna_nic == isCuentaPadre);

                if (strInformacionCuenta.length > 0) {
                    //*envia resultado
                    objPost.prcs__proximo_pagamento = strInformacionCuenta[0].UrlJsonContext.prcs__proximo_pagamento;
                    objPost.prcs__proxima_captura = strInformacionCuenta[0].UrlJsonContext.prcs__proxima_captura;
                    objPost.ECCUECCU_estado_da_captura_da_conta__status_de_capturapago = strInformacionCuenta[0].UrlJsonContext.ECCUECCU_estado_da_captura_da_conta__status_de_capturapago;

                    //!node:test(unhide log and hide resultPost)
                    // onergy.log(
                    //     `[JFS] asset_number: ${objPost.asset_number} cuenta_padre: ${objPost.prcs__conta_pai} - proximo_pago: ${objPost.prcs__proximo_pagamento} - proxima_captura: ${objPost.prcs__proxima_captura} - estado_captura_cuenta: ${objPost.ECCUECCU_estado_da_captura_da_conta__status_de_capturapago}`
                    // );
                    let resultPost = /*await*/ sendItemToOnergy(idInformacionCuenta, data.usrid, data.assid, objPost, '', 'asset_number', true, false, false);
                } else {
                    onergy.log(`[JFS] asset_number: ${objPost.asset_number} - Cuenta Padre no encontrada`);
                }
            } else {
                onergy.log(`[JFS] asset_number: ${objPost.asset_number} - Tipo de Cuenta no encontrada`);
            }
        }
    } else {
        onergy.log(`[JFS] getInformacionCuenta: Estado de Cuenta ${strEstadoCuenta} no encontrado para Información de la Cuenta ${data.asset_number}`);
    }

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
    faturas: null,
    prcs__ocultar_campo: 'sim',
    profit_cost_center: '102030-WTI',
    tppf_tipo_portifolio__portfolio: 'ATC',
    idc_pode_apagar: 'sim',
    registro_salvo_: 'sim',
    equipe: '',
    asset_number_IDC: '102030',
    asset_number: '102030',
    site_name: '[JFS]Nombre del Sitio: Teste',
    emp_atc_site: 'ATC SITIOS DE COLOMBIA S.A.S',
    conta_interna_nic: '122436',
    prcs__conta_pai: '112233',
    prcs__tipo_de_conta_cache: '3c495728-28fd-7d69-860c-dbe5ed3d7e4d',
    TCTC_tipo_de_conta__prcs__tipo_de_conta: 'H',
    TCprcs__tipo_de_conta_id: '3c495728-28fd-7d69-860c-dbe5ed3d7e4d',
    TCTC_tipo_de_conta__TC_tipo_de_conta_valor: 'H',
    numero_do_medidor: '',
    emp_atc_site__prcs__assinante_atc: 'ATC SITIOS DE COLOMBIA S.A.S',
    emp_atc_prcs__assinante_atc_id: '87b272d2-54c1-4c09-a6cf-187c51adcec9',
    sta_cont_status_conta: 'ACTIVA',
    sta_cont_id: '93a8ad28-42a9-44b2-9787-ba0df7650b0b',
    prvd_apelido_provedor: '',
    ESPACO: ' ',
    nome_provedor_id_cache: '6c591850-98ea-476a-828e-b855d420d9b9',
    prvd_nome_provedor: 'CARIBEMAR DE LA COSTA SAS. ESP -AFINIA',
    prvd_id: '6c591850-98ea-476a-828e-b855d420d9b9',
    prvd_nome_comercial: 'CARIBEMAR DE LA COSTA SAS ESP',
    prvd_nit_provedor: '901380949',
    prvd_nit_beneficiario: '901380949',
    prvd_beneficiario: 'CARIBEMAR DE LA COSTA SAS ESP',
    SERVservicos__servico: '',
    SERVservico_id: '',
    suj_pa_sujeito__prcs__sujeito_passivo_alumbrado_publico: '',
    suj_pa_prcs__sujeito_passivo_alumbrado_publico_id: '',
    prcs__acuerdo_resolucion_alumbrado_publico: '',
    tipo_cobr_tipos_cobrancas__tipo_de_cobranca: '',
    tipo_cobr_tipo_de_cobranca_id: '',
    prcs__media_valor_total: 0,
    prcs__media_valor_energia: 0,
    prcs__media_valor_iluminacao: 0,
    prcs__dia_de_pagamento: 16,
    fre_pag_frequencia__frequencia_de_pagamento: 'MENSUAL',
    fre_pag_frequencia_de_pagamento_id: '519cec38-38b9-45db-b8a6-9f52259d93b4',
    for_pag_formas_de_pagamentos__forma_de_pagamento: '',
    for_pag_forma_de_pagamento_id: '',
    CPTclassificacao_passthru__prcs__clasificacion_passthru: '',
    CPTprcs__clasificacion_passthru_id: '',
    prcs__ultima_captura: null,
    ECCUECCU_estado_da_captura_da_conta__status_de_capturapago: '',
    ECCUstatus_de_capturapago_id: '',
    prcs__proxima_captura: null,
    prcs__proximo_pagamento: null,
    prvd_usuario: '',
    prvd_senha: '',
    prvd_link_web: '',
    pode_apagar: 'nao',
    ID_ONE_REF: '7099f693-bf73-f767-ea7d-b2e19a4da873',
    oneTemplateTitle: 'COL- Informaciones de la Cuenta',
};
let idATC = {
    assid: '67c0b77d-abae-4c48-ba4b-6c8faf27e14a',
    usrid: '0c44d4fc-d654-405b-9b8f-7fea162948b5',
};
json = Object.assign(json, idATC);
init(JSON.stringify(json));
