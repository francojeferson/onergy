/******************** ENV_NODE ********************
 ******************** NAO_MEXA ********************
 */
// eslint-disable-next-line no-unused-vars
const { date } = require('assert-plus');
// eslint-disable-next-line no-unused-vars
const { formatDate } = require('tough-cookie');
// eslint-disable-next-line no-unused-vars
const { log } = require('console');
// eslint-disable-next-line no-unused-vars
const { memory } = require('console');
// eslint-disable-next-line no-unused-vars
const { resolve } = require('path');
// eslint-disable-next-line no-unused-vars
const { type } = require('os');
// eslint-disable-next-line no-unused-vars
const axios = require('axios');
// eslint-disable-next-line no-unused-vars
const fs = require('fs');
// eslint-disable-next-line no-unused-vars
const jsuser = require('../../onergy/onergy-utils');
const onergy = require('../../onergy/onergy-client');
// eslint-disable-next-line no-unused-vars
const utils = require('../../onergy/onergy-utils');
// eslint-disable-next-line no-unused-vars
async function ajax(args) {
    return await onergy.ajax(args);
}
// eslint-disable-next-line no-unused-vars
async function ajaxPost(args) {
    return await onergy.ajaxPost(args);
}
// eslint-disable-next-line no-unused-vars
async function hashMd5(args) {
    return await onergy.hashMd5(args);
}
// eslint-disable-next-line no-unused-vars
async function increment(args) {
    return await onergy.increment(args);
}
// eslint-disable-next-line no-unused-vars
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
// eslint-disable-next-line no-unused-vars
async function ReadTextPdf(args) {
    return await onergy.ReadTextPdf(args);
}
// eslint-disable-next-line no-unused-vars
async function sendmail(args) {
    return await onergy.sendmail(args);
}
// eslint-disable-next-line no-unused-vars
async function onergy_sendto(args) {
    let r = await onergy.onergy_sendto(args);
    return JSON.stringify(r);
}
async function onergy_updatemany(args) {
    args.executeAction = false;
    return await onergy.onergy_save(args);
}
// eslint-disable-next-line no-unused-vars
function failureCallback(error) {
    console.log('It failed with ' + error);
}
// eslint-disable-next-line no-unused-vars
function get_usr_tmz_dt_now(data) {
    return data;
}
// eslint-disable-next-line no-unused-vars
function replaceAll(content, needle, replacement) {
    return content.split(needle).join(replacement);
}
// eslint-disable-next-line no-unused-vars
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
async function init(json) {
    let data = JSON.parse(json);
    onergy.log(`JFS ~ carga_geral_load ~ init: ${JSON.stringify(data)}`);

    //*cloud:onergy == UTC+0, node:test == UTC-3
    let dataHoje = new Date();
    let time = gerarDataHora(dataHoje, -5); //?Bogota
    let arrPost = [];
    let statusPost = [];
    let status_desc;

    //*upload planilha
    let strArrExcel = await ReadExcelToJson({
        url: data.planilha[0].UrlAzure,
    });
    let dataExcel = JSON.parse(strArrExcel);

    //*pesq.ref:indice_carga
    const idIndiceCarga = '9a6e262f-e463-4c5d-9d8b-0fd8343b2f02';
    let idTabExcel = data.load_index_id_do_card;
    let strFiltro = gerarFiltro('id_do_card', idTabExcel);
    let getTabExcel = await getOnergyItem(idIndiceCarga, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, strFiltro);

    //*se tab excel não existir em carga indice, gera erro
    let tabExcel = data.load_index_tab_excel;
    let cargaIndiceNome = getTabExcel[0].UrlJsonContext.tab_excel;
    if (cargaIndiceNome == tabExcel) {
        let nomePlanilha = data.planilha[0].Name;

        //*se não existir dados na planilha, gera erro
        if (dataExcel != null) {
            let ctxExcel = dataExcel[tabExcel];
            ctxExcel = removeDuplicados(ctxExcel, tabExcel);

            //*se não existir conteúdo na planilha, gera erro
            if (ctxExcel.length > 0) {
                //*para cada linha da planilha (exceto cabeçalho) gera objeto
                for (let x in ctxExcel) {
                    let objLine = {
                        nomePlanilhaCarga: nomePlanilha,
                    };

                    //*para cada coluna da planilha gera propriedade
                    let val = ctxExcel[x];
                    for (let y in val) {
                        let prop = y;
                        let value = val[y];

                        //*se prop possuir tag, remove tag e manipula value
                        if (prop.includes('{{int}}' || '{{INT}}')) {
                            value = parseInt(value);
                            prop = prop.replace('{{int}}', '').replace('{{INT}}', '');
                        } else if (prop.includes('{{float}}' || '{{FLOAT}}')) {
                            value = parseFloat(value);
                            prop = prop.replace('{{float}}', '').replace('{{FLOAT}}', '');
                        }

                        //*se valor for string, remove espaços em branco
                        if (typeof value == 'string') {
                            value = value.trim();
                        }
                        objLine[prop] = value;
                    }
                    arrPost.push(objLine);
                }

                //*se não existir dados no array de post, gera erro
                if (arrPost.length > 0) {
                    //*status:processo
                    dataHoje = new Date();
                    time = gerarDataHora(dataHoje, -5); //?Bogota
                    status_desc = `Procesando ${arrPost.length} registros de ${tabExcel}`;
                    statusPost.push(`${time}, ${status_desc} \n`);
                    await postStatus(status_desc, statusPost, data);

                    //*consulta campos(itens) de cada grid(aba)
                    let getTabExcel = await getOnergyItem(idTabExcel, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);

                    //*para cada linha do array de post, verifica se existe registro no grid destino
                    //*update: grava pesquisa no array de cache para evitar repetição de pesquisa
                    //*update: por motivos de performance, pesquisa em cache antes do for loop
                    let arrCache = [];

                    const idDepartamento = '132b8394-2193-4d83-a399-08f4cde70873';
                    if (tabExcel == 'municipio') {
                        //*cache:departamento
                        let getDepartamento = await getOnergyItem(idDepartamento, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
                        arrCache.push({ id: idDepartamento, data: getDepartamento });
                        onergy.log('JFS ~ cache:departamento');
                    }

                    const idTipoTercero = '70110b99-aa96-4e25-b1b2-177484668700';
                    const idTipoAcceso = '62e9a129-73b5-4819-9c16-f1d4bdababde';
                    if (tabExcel == 'proveedores') {
                        //*cache:tipo_tercero
                        let getTipoTercero = await getOnergyItem(idTipoTercero, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
                        arrCache.push({ id: idTipoTercero, data: getTipoTercero });
                        onergy.log('JFS ~ cache:tipo_tercero');

                        //*cache:tipo_acceso
                        let getTipoAcceso = await getOnergyItem(idTipoAcceso, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
                        arrCache.push({ id: idTipoAcceso, data: getTipoAcceso });
                        onergy.log('JFS ~ cache:tipo_acceso');
                    }

                    const idSitios = 'e43b9fe0-6752-446d-8495-0b4fdd7a70b4';
                    const idCompaniaATC = '8803f10a-9c32-4c4f-8bd6-8e959ed24277';
                    const idMunicipio = 'a95b4721-fc79-445c-b964-14a4ccbf1d7b';
                    const idEstadoSitio = 'f0ee1dd9-bb48-4aef-9f77-43e357870a31';
                    const idPortafolioATC = '18615527-c678-4f1c-87e0-d7a9735d0c6e';
                    const idRegionalATC = '74d8a818-46a7-4d56-8a18-2369bdd00589';
                    if (tabExcel == 'sitios') {
                        //*cache:compania_atc
                        let getCompaniaATC = await getOnergyItem(idCompaniaATC, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
                        arrCache.push({ id: idCompaniaATC, data: getCompaniaATC });
                        onergy.log('JFS ~ cache:compania_atc');

                        //*cache:municipio
                        let getMunicipio = await getOnergyItem(idMunicipio, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
                        arrCache.push({ id: idMunicipio, data: getMunicipio });
                        onergy.log('JFS ~ cache:municipio');

                        //*cache:estado_sitio
                        let getEstadoSitio = await getOnergyItem(idEstadoSitio, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
                        arrCache.push({ id: idEstadoSitio, data: getEstadoSitio });
                        onergy.log('JFS ~ cache:estado_sitio');

                        //*cache:portafolio_atc
                        let getPortafolioATC = await getOnergyItem(idPortafolioATC, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
                        arrCache.push({ id: idPortafolioATC, data: getPortafolioATC });
                        onergy.log('JFS ~ cache:portafolio_atc');

                        //*cache:regional_atc
                        let getRegionalATC = await getOnergyItem(idRegionalATC, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
                        arrCache.push({ id: idRegionalATC, data: getRegionalATC });
                        onergy.log('JFS ~ cache:regional_atc');
                    }

                    const idTipoCuenta = '84ca5970-7a49-4192-a2c8-030031503a1a';
                    const idSuscriptor = '51a217b1-1d0a-47c7-b31c-46880c1ca5ad';
                    const idEstadoCuenta = '4963d2c6-2b94-4c37-bffb-87c0dc296587';
                    const idProveedores = '4783ca0b-357d-42ab-a5c8-3328ee315f86';
                    const idServicios = '8e284e84-b8f9-45c1-abe2-991555441ea2';
                    const idSujetoPasivo = '78352af1-70b2-43a0-ad2a-084cdcf2eacf';
                    const idTipoCobro = '22538843-147f-4d41-9534-20a6d674f4b6';
                    const idFrecuenciaPago = '2d4edce3-7131-413a-98e5-35d328daef7f';
                    const idFormaPago = '0e8a4463-28db-474f-926b-39fa1bd0c9bc';
                    const idClasificacionPassthru = 'ad62c737-2abc-4c71-a572-e11933114ed8';
                    const idEstadoCapturaCuenta = '3c2d0727-6359-4c71-9409-465759462854';
                    if (tabExcel == 'informacion_cuenta') {
                        //*cache:tipo_cuenta
                        let getTipoCuenta = await getOnergyItem(idTipoCuenta, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
                        arrCache.push({ id: idTipoCuenta, data: getTipoCuenta });
                        onergy.log('JFS ~ cache:tipo_cuenta');

                        //*cache:suscriptor
                        let getSuscriptor = await getOnergyItem(idSuscriptor, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
                        arrCache.push({ id: idSuscriptor, data: getSuscriptor });
                        onergy.log('JFS ~ cache:suscriptor');

                        //*cache:estado_cuenta
                        let getEstadoCuenta = await getOnergyItem(idEstadoCuenta, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
                        arrCache.push({ id: idEstadoCuenta, data: getEstadoCuenta });
                        onergy.log('JFS ~ cache:estado_cuenta');

                        //*cache:proveedores
                        let getProveedores = await getOnergyItem(idProveedores, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
                        arrCache.push({ id: idProveedores, data: getProveedores });
                        onergy.log('JFS ~ cache:proveedores');

                        //*cache:servicios
                        let getServicios = await getOnergyItem(idServicios, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
                        arrCache.push({ id: idServicios, data: getServicios });
                        onergy.log('JFS ~ cache:servicios');

                        //*cache:sujeto_pasivo
                        let getSujetoPasivo = await getOnergyItem(idSujetoPasivo, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
                        arrCache.push({ id: idSujetoPasivo, data: getSujetoPasivo });
                        onergy.log('JFS ~ cache:sujeto_pasivo');

                        //*cache:tipo_cobro
                        let getTipoCobro = await getOnergyItem(idTipoCobro, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
                        arrCache.push({ id: idTipoCobro, data: getTipoCobro });
                        onergy.log('JFS ~ cache:tipo_cobro');

                        //*cache:frecuencia_pago
                        let getFrecuenciaPago = await getOnergyItem(idFrecuenciaPago, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
                        arrCache.push({ id: idFrecuenciaPago, data: getFrecuenciaPago });
                        onergy.log('JFS ~ cache:frecuencia_pago');

                        //*cache:forma_pago
                        let getFormaPago = await getOnergyItem(idFormaPago, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
                        arrCache.push({ id: idFormaPago, data: getFormaPago });
                        onergy.log('JFS ~ cache:forma_pago');

                        //*cache:clasificacion_passthru
                        let getClasificacionPassthru = await getOnergyItem(idClasificacionPassthru, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
                        arrCache.push({ id: idClasificacionPassthru, data: getClasificacionPassthru });
                        onergy.log('JFS ~ cache:clasificacion_passthru');

                        //*cache:estado_captura_cuenta
                        let getEstadoCapturaCuenta = await getOnergyItem(idEstadoCapturaCuenta, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
                        arrCache.push({ id: idEstadoCapturaCuenta, data: getEstadoCapturaCuenta });
                        onergy.log('JFS ~ cache:estado_captura_cuenta');
                    }

                    const idCategorias = '55ec978d-7dbe-4a6f-8cb4-536b53361d54';
                    const idEstrato = '34f26407-6afe-41c8-8420-7dbcd4f1aed4';
                    const idNivelTension = '4056b8c5-29c0-47ff-b5b1-cfc3c7f39018';
                    const idLecturas = '0d3b6287-8f3a-4ad7-acdd-e1c60426f73f';
                    const idMotogenerador = '066e2afa-0169-4e5f-a7fb-79131aafe8c7';
                    const idTableroIndependiente = 'dbaf278d-8fed-4611-be82-ecd9b69806c0';
                    const idBarter = '13dad727-2325-4e9d-85a3-c8ff09e053c7';
                    const idProvisional = 'fb6543b9-28a4-4e49-8f4b-2af6557a7cd8';
                    if (tabExcel == 'informacion_tecnica') {
                        //*cache:categorias
                        let getCategorias = await getOnergyItem(idCategorias, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
                        arrCache.push({ id: idCategorias, data: getCategorias });
                        onergy.log('JFS ~ cache:categorias');

                        //*cache:estrato
                        let getEstrato = await getOnergyItem(idEstrato, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
                        arrCache.push({ id: idEstrato, data: getEstrato });
                        onergy.log('JFS ~ cache:estrato');

                        //*cache:nivel_tension
                        let getNivelTension = await getOnergyItem(idNivelTension, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
                        arrCache.push({ id: idNivelTension, data: getNivelTension });
                        onergy.log('JFS ~ cache:nivel_tension');

                        //*cache:lecturas
                        let getLecturas = await getOnergyItem(idLecturas, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
                        arrCache.push({ id: idLecturas, data: getLecturas });
                        onergy.log('JFS ~ cache:lecturas');

                        //*cache:motogenerador
                        let getMotogenerador = await getOnergyItem(idMotogenerador, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
                        arrCache.push({ id: idMotogenerador, data: getMotogenerador });
                        onergy.log('JFS ~ cache:motogenerador');

                        //*cache:tablero_independiente
                        let getTableroIndependiente = await getOnergyItem(idTableroIndependiente, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
                        arrCache.push({ id: idTableroIndependiente, data: getTableroIndependiente });
                        onergy.log('JFS ~ cache:tablero_independiente');

                        //*cache:barter
                        let getBarter = await getOnergyItem(idBarter, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
                        arrCache.push({ id: idBarter, data: getBarter });
                        onergy.log('JFS ~ cache:barter');

                        //*cache:provisional
                        let getProvisional = await getOnergyItem(idProvisional, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
                        arrCache.push({ id: idProvisional, data: getProvisional });
                        onergy.log('JFS ~ cache:provisional');
                    }

                    const idClientes = '0694dd6e-299a-4b46-b8fd-5e08da24f72d';
                    const idRegionalClientes = 'b45777ee-f5f3-429c-9fd7-9ee4578b0b63';
                    const idPortafolioCliente = 'b36cf260-c691-4d36-9339-137041e6fb63';
                    if (tabExcel == 'clientes_sitio') {
                        //*cache:nit_cliente
                        let getClientes = await getOnergyItem(idClientes, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
                        arrCache.push({ id: idClientes, data: getClientes });
                        onergy.log('JFS ~ cache:nit_cliente');

                        //*cache:nombre_regional
                        let getRegionalClientes = await getOnergyItem(idRegionalClientes, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
                        arrCache.push({ id: idRegionalClientes, data: getRegionalClientes });
                        onergy.log('JFS ~ cache:nombre_regional');

                        //*cache:portafolio_cliente
                        let getPortafolioCliente = await getOnergyItem(idPortafolioCliente, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
                        arrCache.push({ id: idPortafolioCliente, data: getPortafolioCliente });
                        onergy.log('JFS ~ cache:portafolio_cliente');

                        //*cache:municipio
                        let getMunicipio = await getOnergyItem(idMunicipio, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
                        arrCache.push({ id: idMunicipio, data: getMunicipio });
                        onergy.log('JFS ~ cache:municipio');
                    }

                    if (tabExcel == 'contactos_clientes') {
                        //*cache:regional_clientes
                        let getRegionalClientes = await getOnergyItem(idRegionalClientes, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
                        arrCache.push({ id: idRegionalClientes, data: getRegionalClientes });
                        onergy.log('JFS ~ cache:regional_clientes');
                    }

                    let fielNameQ = '';
                    let valueQ = '';
                    for (let y in arrPost) {
                        let objPost = arrPost[y];
                        objPost.onergyteam_equipe = objPost.equipe;
                        objPost.onergyteam_id = objPost.id_equipe_txt;
                        delete objPost.id_equipe_txt;

                        //*aba:categorias
                        if (tabExcel == 'categorias') {
                            fielNameQ = getKey(tabExcel);
                            valueQ = objPost.categorias;

                            //*item:categorias
                            let isCategorias = getTabExcel.filter((j) => j.UrlJsonContext.categorias == objPost.categorias);
                            if (isCategorias.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:categorias
                                objPost.categorias;
                            }
                        }

                        //*aba:departamento
                        if (tabExcel == 'departamento') {
                            fielNameQ = getKey(tabExcel);
                            valueQ = objPost.uf;

                            //*item:departamento
                            let isDepartamento = getTabExcel.filter((j) => j.UrlJsonContext.uf == objPost.departamento);
                            if (isDepartamento.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:departamento
                                objPost.uf = objPost.departamento;
                                objPost.estado = objPost.departamento_sigla;
                                delete objPost.departamento_sigla;
                                delete objPost.departamento;
                            }
                        }

                        //*aba:municipio
                        if (tabExcel == 'municipio') {
                            fielNameQ = getKey(tabExcel);
                            valueQ = objPost.municipio;

                            //*item:municipio
                            let isMunicipio = getTabExcel.filter((j) => j.UrlJsonContext.municipio == objPost.municipio);
                            if (isMunicipio.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*pesq.ref:departamento
                                let cacheDepartamento = arrCache.filter((j) => j.id == idDepartamento);
                                let isDepartamento = cacheDepartamento[0].data.filter((j) => j.UrlJsonContext.uf == objPost.departamento);
                                if (isDepartamento.length == 0) {
                                    //*err:departamento
                                    status_desc = `ERROR: no hay Departamento "${objPost.departamento}" registrado para ${tabExcel} en Municipio "${objPost.municipio}"`;
                                    statusPost.push(`${time}, ${status_desc} \n`);
                                    await postStatus(status_desc, statusPost, data);
                                    return false;
                                }
                                //*obj:municipio
                                objPost.loca_uf_uf = isDepartamento.length > 0 ? isDepartamento[0].UrlJsonContext.uf : '';
                                objPost.loca_uf_id = isDepartamento.length > 0 ? isDepartamento[0].ID : '';
                                objPost.municipio;
                                delete objPost.departamento;
                            }
                        }

                        //*aba:compania_atc
                        if (tabExcel == 'compania_atc') {
                            fielNameQ = getKey(tabExcel);
                            valueQ = objPost.site;

                            //*item:compania_atc
                            let isCompaniaATC = getTabExcel.filter((j) => j.UrlJsonContext.site == objPost.compania_atc);
                            if (isCompaniaATC.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:compania_atc
                                objPost.site = objPost.compania_atc;
                                delete objPost.compania_atc;
                            }
                        }

                        //*aba:suscriptor
                        if (tabExcel == 'suscriptor') {
                            fielNameQ = getKey(tabExcel);
                            valueQ = objPost.sus__suscriptor;

                            //*item:suscriptor
                            let isSuscriptor = getTabExcel.filter((j) => j.UrlJsonContext.sus__suscriptor == objPost.suscriptor);
                            if (isSuscriptor.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:suscriptor
                                objPost.sus__suscriptor = objPost.suscriptor;
                                delete objPost.suscriptor;
                            }
                        }

                        //*aba:forma_pago
                        if (tabExcel == 'forma_pago') {
                            fielNameQ = getKey(tabExcel);
                            valueQ = objPost.formas_de_pagamentos;

                            //*item:forma_pago
                            let isFormaPago = getTabExcel.filter((j) => j.UrlJsonContext.formas_de_pagamentos == objPost.forma_pago);
                            if (isFormaPago.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:forma_pago
                                objPost.formas_de_pagamentos = objPost.forma_pago;
                                delete objPost.forma_pago;
                            }
                        }

                        //*aba:frecuencia_pago
                        if (tabExcel == 'frecuencia_pago') {
                            fielNameQ = getKey(tabExcel);
                            valueQ = objPost.frequencia_em_meses;

                            //*item:frecuencia_pago
                            let isFrequencia = getTabExcel.filter((j) => j.UrlJsonContext.frequencia == objPost.frecuencia_pago);
                            if (isFrequencia.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:frecuencia_pago
                                objPost.frequencia = objPost.frecuencia_pago;
                                delete objPost.frecuencia_pago;
                            }

                            //*item:frecuencia_meses
                            let isFrequenciaMeses = getTabExcel.filter((j) => j.UrlJsonContext.frequencia_em_meses == objPost.frecuencia_meses);
                            if (isFrequenciaMeses.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:frecuencia_meses
                                objPost.frequencia_em_meses = objPost.frecuencia_meses;
                                delete objPost.frecuencia_meses;
                            }
                        }

                        //*aba:lecturas
                        if (tabExcel == 'lecturas') {
                            fielNameQ = getKey(tabExcel);
                            valueQ = objPost.LCT_ferramentas;

                            //*item:herramientas
                            let isLecturas = getTabExcel.filter((j) => j.UrlJsonContext.LCT_ferramentas == objPost.herramientas);
                            if (isLecturas.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:herramientas
                                objPost.LCT_ferramentas = objPost.herramientas;
                                delete objPost.herramientas;
                            }
                        }

                        //*aba:motogenerador
                        if (tabExcel == 'motogenerador') {
                            fielNameQ = getKey(tabExcel);
                            valueQ = objPost.ger_gerador;

                            //*item:motogenerador
                            let isMotogenerador = getTabExcel.filter((j) => j.UrlJsonContext.ger_gerador == objPost.motogenerador);
                            if (isMotogenerador.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:motogenerador
                                objPost.ger_gerador = objPost.motogenerador;
                                delete objPost.motogenerador;
                            }
                        }

                        //*aba:tablero_independiente
                        if (tabExcel == 'tablero_independiente') {
                            fielNameQ = getKey(tabExcel);
                            valueQ = objPost.dir_diretoria_independente;

                            //*item:tablero_independiente
                            let isTableroIndependiente = getTabExcel.filter(
                                (j) => j.UrlJsonContext.dir_diretoria_independente == objPost.tablero_independiente
                            );
                            if (isTableroIndependiente.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:tablero_independiente
                                objPost.dir_diretoria_independente = objPost.tablero_independiente;
                                delete objPost.tablero_independiente;
                            }
                        }

                        //*aba:barter
                        if (tabExcel == 'barter') {
                            fielNameQ = getKey(tabExcel);
                            valueQ = objPost.esc_escambo;

                            //*item:barter
                            let isBarter = getTabExcel.filter((j) => j.UrlJsonContext.esc_escambo == objPost.barter);
                            if (isBarter.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:barter
                                objPost.esc_escambo = objPost.barter;
                                delete objPost.barter;
                            }
                        }

                        //*aba:provisional
                        if (tabExcel == 'provisional') {
                            fielNameQ = getKey(tabExcel);
                            valueQ = objPost.pro_provisorio;

                            //*item:provisional
                            let isProvisional = getTabExcel.filter((j) => j.UrlJsonContext.pro_provisorio == objPost.provisional);
                            if (isProvisional.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:provisional
                                objPost.pro_provisorio = objPost.provisional;
                                delete objPost.provisional;
                            }
                        }

                        //*aba:portafolio_atc
                        if (tabExcel == 'portafolio_atc') {
                            fielNameQ = getKey(tabExcel);
                            valueQ = objPost.tipo_portifolio;

                            //*item:portafolio_atc
                            let isPortafolioATC = getTabExcel.filter((j) => j.UrlJsonContext.tipo_portifolio == objPost.portafolio_atc);
                            if (isPortafolioATC.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:portafolio_atc
                                objPost.tipo_portifolio = objPost.portafolio_atc;
                                delete objPost.portafolio_atc;
                            }
                        }

                        //*aba:regional_atc
                        if (tabExcel == 'regional_atc') {
                            fielNameQ = getKey(tabExcel);
                            valueQ = objPost.regional;

                            //*item:regional_atc
                            let isRegionalATC = getTabExcel.filter((j) => j.UrlJsonContext.regional == objPost.regional_atc);
                            if (isRegionalATC.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:regional_atc
                                objPost.regional = objPost.regional_atc;
                                delete objPost.regional_atc;
                            }
                        }

                        //*aba:servicios
                        if (tabExcel == 'servicios') {
                            fielNameQ = getKey(tabExcel);
                            valueQ = objPost.servicos;

                            //*item:servicios
                            let isServicios = getTabExcel.filter((j) => j.UrlJsonContext.servicos == objPost.servicios);
                            if (isServicios.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:servicios
                                objPost.servicos = objPost.servicios;
                                delete objPost.servicios;
                            }
                        }

                        //*aba:estado_cuenta
                        if (tabExcel == 'estado_cuenta') {
                            fielNameQ = getKey(tabExcel);
                            valueQ = objPost.status_conta;

                            //*item:estado_cuenta
                            let isEstadoCuenta = getTabExcel.filter((j) => j.UrlJsonContext.status_conta == objPost.estado_cuenta);
                            if (isEstadoCuenta.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:estado_cuenta
                                objPost.status_conta = objPost.estado_cuenta;
                                delete objPost.estado_cuenta;
                            }
                        }

                        //*aba:estado_sitio
                        if (tabExcel == 'estado_sitio') {
                            fielNameQ = getKey(tabExcel);
                            valueQ = objPost.status;

                            //*item:estado_sitio
                            let isEstadoSitio = getTabExcel.filter((j) => j.UrlJsonContext.status == objPost.estado_sitio);
                            if (isEstadoSitio.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:estado_sitio
                                objPost.status = objPost.estado_sitio;
                                delete objPost.estado_sitio;
                            }
                        }

                        //*aba:sujeto_pasivo
                        if (tabExcel == 'sujeto_pasivo') {
                            fielNameQ = getKey(tabExcel);
                            valueQ = objPost.sujeito;

                            //*item:sujeto_pasivo
                            let isSujetoPasivo = getTabExcel.filter((j) => j.UrlJsonContext.sujeito == objPost.sujeto_pasivo);
                            if (isSujetoPasivo.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:sujeto_pasivo
                                objPost.sujeito = objPost.sujeto_pasivo;
                                delete objPost.sujeto_pasivo;
                            }
                        }

                        //*aba:tipo_cobro
                        if (tabExcel == 'tipo_cobro') {
                            fielNameQ = getKey(tabExcel);
                            valueQ = objPost.tipos_cobrancas;

                            //*item:tipo_cobro
                            let isTipoCobro = getTabExcel.filter((j) => j.UrlJsonContext.tipos_cobrancas == objPost.tipo_cobro);
                            if (isTipoCobro.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:tipo_cobro
                                objPost.tipos_cobrancas = objPost.tipo_cobro;
                                delete objPost.tipo_cobro;
                            }
                        }

                        //*aba:tipo_tercero
                        if (tabExcel == 'tipo_tercero') {
                            fielNameQ = getKey(tabExcel);
                            valueQ = objPost.tipo_de_terceiro;

                            //*item:tipo_tercero
                            let isTipoTercero = getTabExcel.filter((j) => j.UrlJsonContext.tipo_de_terceiro == objPost.tipo_tercero);
                            if (isTipoTercero.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:tipo_tercero
                                objPost.tipo_de_terceiro = objPost.tipo_tercero;
                                delete objPost.tipo_tercero;
                            }
                        }

                        //*aba:tipo_acceso
                        if (tabExcel == 'tipo_acceso') {
                            fielNameQ = getKey(tabExcel);
                            valueQ = objPost.tipo_de_acesso;

                            //*item:tipo_acceso
                            let isTipoAcesso = getTabExcel.filter((j) => j.UrlJsonContext.tipo_de_acesso == objPost.tipo_acceso);
                            if (isTipoAcesso.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:tipo_acceso
                                objPost.tipo_de_acesso = objPost.tipo_acceso;
                                delete objPost.tipo_acceso;
                            }
                        }

                        //*aba:tipo_cuenta
                        if (tabExcel == 'tipo_cuenta') {
                            fielNameQ = getKey(tabExcel);
                            valueQ = objPost.TC_tipo_de_conta;

                            //*item:tipo_cuenta
                            let isTipoCuenta = getTabExcel.filter((j) => j.UrlJsonContext.TC_tipo_de_conta == objPost.tipo_cuenta);
                            if (isTipoCuenta.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:tipo_cuenta
                                objPost.TC_tipo_de_conta = objPost.tipo_cuenta;
                                delete objPost.tipo_cuenta;
                            }
                        }

                        //*aba:estrato
                        if (tabExcel == 'estrato') {
                            fielNameQ = getKey(tabExcel);
                            valueQ = objPost.LST_estrato;

                            //*item:estrato
                            let isEstrato = getTabExcel.filter((j) => j.UrlJsonContext.LST_estrato == objPost.estrato);
                            if (isEstrato.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:estrato
                                objPost.LST_estrato = objPost.estrato;
                                delete objPost.estrato;
                            }
                        }

                        //*aba:nivel_tension
                        if (tabExcel == 'nivel_tension') {
                            fielNameQ = getKey(tabExcel);
                            valueQ = objPost.NVT_nivel;

                            //*item:nivel_tension
                            let isNivelTension = getTabExcel.filter((j) => j.UrlJsonContext.NVT_nivel == objPost.nivel_tension);
                            if (isNivelTension.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:nivel_tension
                                objPost.NVT_nivel = objPost.nivel_tension;
                                delete objPost.nivel_tension;
                            }
                        }

                        //*aba:clasificacion_passthru
                        if (tabExcel == 'clasificacion_passthru') {
                            fielNameQ = getKey(tabExcel);
                            valueQ = objPost.CPT_tem_passthru;

                            //*item:clasificacion_passthru
                            let isClasificacionPassthru = getTabExcel.filter((j) => j.UrlJsonContext.classificacao_passthru == objPost.clasificacion_passthru);
                            if (isClasificacionPassthru.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:clasificacion_passthru
                                objPost.classificacao_passthru = objPost.clasificacion_passthru;
                                delete objPost.clasificacion_passthru;
                            }

                            //*lst.susp:tiene_passthru
                            objPost.tiene_passthru = objPost.tiene_passthru == 'SI' ? 'si' : 'no';
                            let isTienePassthru = getTabExcel.filter((j) => j.UrlJsonContext.CPT_tem_passthru == objPost.tiene_passthru);
                            if (isTienePassthru.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:tiene_passthru
                                objPost.CPT_tem_passthru = objPost.tiene_passthru;
                                objPost.CPT_tem_passthru_desc = objPost.tiene_passthru == 'si' ? 'Si' : 'No';
                                delete objPost.tiene_passthru;
                            }
                        }

                        //*aba:proveedores
                        if (tabExcel == 'proveedores') {
                            fielNameQ = getKey(tabExcel);
                            valueQ = objPost.nit_provedor;

                            //*item:nit_proveedor
                            let isNITProveedor = getTabExcel.filter((j) => j.UrlJsonContext.nit_provedor == objPost.nit_proveedor);
                            if (isNITProveedor.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:nit_proveedor
                                objPost.nit_provedor = objPost.nit_proveedor.toString();
                                delete objPost.nit_proveedor;
                            }

                            //*item:nombre_proveedor
                            let isNombreProveedor = getTabExcel.filter((j) => j.UrlJsonContext.nome_provedor == objPost.nombre_proveedor);
                            if (isNombreProveedor.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:nombre_proveedor
                                objPost.nome_provedor = objPost.nombre_proveedor;
                                delete objPost.nombre_proveedor;
                            }

                            //*item:nit_beneficiario
                            let isNITBeneficiario = getTabExcel.filter((j) => j.UrlJsonContext.nit_beneficiario == objPost.nit_beneficiario);
                            if (isNITBeneficiario.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:nit_beneficiario
                                objPost.nit_beneficiario = objPost.nit_beneficiario.toString();
                            }

                            //*item:nombre_beneficiario
                            let isNombreBeneficiario = getTabExcel.filter((j) => j.UrlJsonContext.beneficiario == objPost.nombre_beneficiario);
                            if (isNombreBeneficiario.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:nombre_beneficiario
                                objPost.beneficiario = objPost.nombre_beneficiario;
                                delete objPost.nombre_beneficiario;
                            }

                            //*item:tipo_tercero
                            let isPrvdTipoTercero = getTabExcel.filter((j) => j.UrlJsonContext.tp3o_tipo_de_terceiro == objPost.tipo_tercero);
                            if (isPrvdTipoTercero.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*pesq.ref:tipo_tercero
                                let cacheTipoTercero = arrCache.filter((j) => j.id == idTipoTercero);
                                let isTipoTercero = cacheTipoTercero[0].data.filter((j) => j.UrlJsonContext.tipo_de_terceiro == objPost.tipo_tercero);
                                if (isTipoTercero.length == 0) {
                                    //*err:tipo_tercero
                                    status_desc = `ERROR: no hay Tipo Tercero "${objPost.tipo_tercero}" registrado para ${tabExcel} en NIT Proveedor "${objPost.nit_proveedor}"`;
                                    statusPost.push(`${time}, ${status_desc} \n`);
                                    await postStatus(status_desc, statusPost, data);
                                    return false;
                                }
                                //*obj:tipo_tercero
                                objPost.tp3o_tipo_de_terceiro = isTipoTercero.length > 0 ? isTipoTercero[0].UrlJsonContext.tipo_de_terceiro : '';
                                objPost.tp3o_id = isTipoTercero.length > 0 ? isTipoTercero[0].ID : '';
                                delete objPost.tipo_tercero;
                            }

                            //*item:nombre_comercial
                            let isNombreComercial = getTabExcel.filter((j) => j.UrlJsonContext.nome_comercial == objPost.nombre_comercial);
                            if (isNombreComercial.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:nombre_comercial
                                objPost.nome_comercial = objPost.nombre_comercial;
                                delete objPost.nombre_comercial;
                            }

                            //*lst.susp:tiene_cuenta_padre
                            objPost.tiene_cuenta_padre = objPost.tiene_cuenta_padre == 'SI' ? 'sim' : 'nao';
                            let isTieneCuentaPadre = getTabExcel.filter((j) => j.UrlJsonContext.prvd__tem_conta_pai == objPost.tiene_cuenta_padre);
                            if (isTieneCuentaPadre.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:tiene_cuenta_padre
                                objPost.prvd__tem_conta_pai = objPost.tiene_cuenta_padre;
                                objPost.prvd__tem_conta_pai_desc = objPost.tiene_cuenta_padre == 'sim' ? 'Sim' : 'Não';
                                delete objPost.tiene_cuenta_padre;
                            }

                            //*item:tipo_acceso
                            let isPrvdTipoAcceso = getTabExcel.filter((j) => j.UrlJsonContext.tp_acces_tipo_de_acesso == objPost.tipo_acceso);
                            if (isPrvdTipoAcceso.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*pesq.ref:tipo_acceso
                                let cacheTipoAcceso = arrCache.filter((j) => j.id == idTipoAcceso);
                                let isTipoAcceso = cacheTipoAcceso[0].data.filter((j) => j.UrlJsonContext.tipo_de_acesso == objPost.tipo_acceso);
                                if (isTipoAcceso.length == 0) {
                                    //*err:tipo_acceso
                                    status_desc = `ERROR: no hay Tipo Acceso "${objPost.tipo_acceso}" registrado para ${tabExcel} en NIT Proveedor "${objPost.nit_proveedor}"`;
                                    statusPost.push(`${time}, ${status_desc} \n`);
                                    await postStatus(status_desc, statusPost, data);
                                    return false;
                                }
                                //*obj:tipo_acceso
                                objPost.tp_acces_tipo_de_acesso = isTipoAcceso.length > 0 ? isTipoAcceso[0].UrlJsonContext.tipo_de_acesso : '';
                                objPost.tp_acces_id = isTipoAcceso.length > 0 ? isTipoAcceso[0].ID : '';
                                delete objPost.tipo_acceso;
                            }

                            //*item:apodo_proveedor
                            let isApodoProveedor = getTabExcel.filter((j) => j.UrlJsonContext.apelido_provedor == objPost.apodo_proveedor);
                            if (isApodoProveedor.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:apodo_proveedor
                                objPost.apelido_provedor = objPost.apodo_proveedor;
                                delete objPost.apodo_proveedor;
                            }

                            //*item:link_web
                            let isLinkWeb = getTabExcel.filter((j) => j.UrlJsonContext.link_web == objPost.link_web);
                            if (isLinkWeb.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:link_web
                                objPost.link_web;
                            }

                            //*item:usuario
                            let isUsuario = getTabExcel.filter((j) => j.UrlJsonContext.usuario == objPost.usuario);
                            if (isUsuario.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:usuario
                                objPost.usuario;
                            }

                            //*item:contrasena
                            let isContrasena = getTabExcel.filter((j) => j.UrlJsonContext.senha == objPost.contrasena);
                            if (isContrasena.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:contrasena
                                objPost.senha = objPost.contrasena;
                                delete objPost.contrasena;
                            }
                        }

                        //*aba:sitios
                        if (tabExcel == 'sitios') {
                            fielNameQ = getKey(tabExcel);
                            valueQ = objPost.asset_number;
                            objPost.modificado_por = data.email;
                            objPost.modificado_em = data.data;
                            objPost.registro_salvo = 'sim';

                            //*item:asset_number
                            let isAssetNumber = getTabExcel.filter((j) => j.UrlJsonContext.asset_number == objPost.asset_number);
                            if (isAssetNumber.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:asset_number
                                objPost.asset_number = objPost.asset_number.toString();
                            }

                            //*item:profit_cost_center
                            let isProfitCostCenter = getTabExcel.filter((j) => j.UrlJsonContext.profit_cost_center == objPost.profit_cost_center);
                            if (isProfitCostCenter.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:profit_cost_center
                                objPost.profit_cost_center = objPost.profit_cost_center.toString();
                            }

                            //*item:nombre_sitio
                            let isNombreSitio = getTabExcel.filter((j) => j.UrlJsonContext.site_name == objPost.nombre_sitio);
                            if (isNombreSitio.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:nombre_sitio
                                objPost.site_name = objPost.nombre_sitio;
                                delete objPost.nombre_sitio;
                            }

                            //*item:compania_atc
                            let isSitCompaniaATC = getTabExcel.filter((j) => j.UrlJsonContext.emp_atc_site__empresa_atc == objPost.compania_atc);
                            if (isSitCompaniaATC.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*pesq.ref:compania_atc
                                let cacheCompaniaATC = arrCache.filter((j) => j.id == idCompaniaATC);
                                let isCompaniaATC = cacheCompaniaATC[0].data.filter((j) => j.UrlJsonContext.site == objPost.compania_atc);
                                if (isCompaniaATC.length == 0) {
                                    //*err:compania_atc
                                    status_desc = `ERROR: no hay Compañia ATC "${objPost.compania_atc}" registrado para ${tabExcel} en Asset Number "${objPost.asset_number}"`;
                                    statusPost.push(`${time}, ${status_desc} \n`);
                                    await postStatus(status_desc, statusPost, data);
                                    return false;
                                }
                                //*obj:compania_atc
                                objPost.emp_atc_site__empresa_atc = isCompaniaATC.length > 0 ? isCompaniaATC[0].UrlJsonContext.site : '';
                                objPost.emp_atc_empresa_atc_id = isCompaniaATC.length > 0 ? isCompaniaATC[0].ID : '';
                                objPost.emp_atc_site = isCompaniaATC.length > 0 ? isCompaniaATC[0].UrlJsonContext.site : '';
                                delete objPost.compania_atc;
                            }

                            //*item:municipio
                            let isSitMunicipio = getTabExcel.filter((j) => j.UrlJsonContext.loca_cida_municipio == objPost.municipio);
                            if (isSitMunicipio.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*pesq.ref:municipio
                                let cacheMunicipio = arrCache.filter((j) => j.id == idMunicipio);
                                let isMunicipio = cacheMunicipio[0].data.filter((j) => j.UrlJsonContext.municipio == objPost.municipio);
                                if (isMunicipio.length == 0) {
                                    //*err:municipio
                                    status_desc = `ERROR: no hay Municipio "${objPost.municipio}" registrado para ${tabExcel} en Asset Number "${objPost.asset_number}"`;
                                    statusPost.push(`${time}, ${status_desc} \n`);
                                    await postStatus(status_desc, statusPost, data);
                                    return false;
                                }
                                //*obj:municipio
                                objPost.loca_cida_municipio = isMunicipio.length > 0 ? isMunicipio[0].UrlJsonContext.municipio : '';
                                objPost.loca_cida_id = isMunicipio.length > 0 ? isMunicipio[0].ID : '';
                                objPost.loca_cida_loca_uf_uf = isMunicipio.length > 0 ? isMunicipio[0].UrlJsonContext.loca_uf_uf : '';
                                objPost.loca_cida_loca_uf_id = isMunicipio.length > 0 ? isMunicipio[0].UrlJsonContext.loca_uf_id : '';
                                delete objPost.municipio;
                                delete objPost.departamento;
                            }

                            //*item:codigo_anchor
                            let isCodigoAnchor = getTabExcel.filter((j) => j.UrlJsonContext.codigo_ancora == objPost.codigo_anchor);
                            if (isCodigoAnchor.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:codigo_anchor
                                objPost.codigo_ancora = objPost.codigo_anchor.toString();
                                delete objPost.codigo_anchor;
                            }

                            //*item:direccion
                            let isDireccion = getTabExcel.filter((j) => j.UrlJsonContext.logradouro == objPost.direccion);
                            if (isDireccion.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:direccion
                                objPost.logradouro = objPost.direccion;
                                delete objPost.direccion;
                            }

                            //*item:estado_sitio
                            let isSitEstadoSitio = getTabExcel.filter((j) => j.UrlJsonContext.STAstatus__status_do_site == objPost.estado_sitio);
                            if (isSitEstadoSitio.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*pesq.ref:estado_sitio
                                let cacheEstadoSitio = arrCache.filter((j) => j.id == idEstadoSitio);
                                let isEstadoSitio = cacheEstadoSitio[0].data.filter((j) => j.UrlJsonContext.status == objPost.estado_sitio);
                                if (isEstadoSitio.length == 0) {
                                    //*err:estado_sitio
                                    status_desc = `ERROR: no hay Municipio "${objPost.municipio}" registrado para ${tabExcel} en Asset Number "${objPost.asset_number}"`;
                                    statusPost.push(`${time}, ${status_desc} \n`);
                                    await postStatus(status_desc, statusPost, data);
                                    return false;
                                }
                                //*obj:estado_sitio
                                objPost.sta_site_status__status_do_site = isEstadoSitio.length > 0 ? isEstadoSitio[0].UrlJsonContext.status : '';
                                objPost.sta_site_status_do_site_id = isEstadoSitio.length > 0 ? isEstadoSitio[0].ID : '';
                                objPost.sta_site_status = isEstadoSitio.length > 0 ? isEstadoSitio[0].UrlJsonContext.status : '';
                                delete objPost.estado_sitio;
                            }

                            //*item:portafolio_atc
                            let isSitPortafolioATC = getTabExcel.filter((j) => j.UrlJsonContext.tppf_tipo_portifolio__portfolio == objPost.portafolio_atc);
                            if (isSitPortafolioATC.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*pesq.ref:portafolio_atc
                                let cachePortafolioATC = arrCache.filter((j) => j.id == idPortafolioATC);
                                let isPortafolioATC = cachePortafolioATC[0].data.filter((j) => j.UrlJsonContext.tipo_portifolio == objPost.portafolio_atc);
                                if (isPortafolioATC.length == 0) {
                                    //*err:portafolio_atc
                                    status_desc = `ERROR: no hay Portafolio ATC "${objPost.portafolio_atc}" registrado para ${tabExcel} en Asset Number "${objPost.asset_number}"`;
                                    statusPost.push(`${time}, ${status_desc} \n`);
                                    await postStatus(status_desc, statusPost, data);
                                    return false;
                                }
                                //*obj:portafolio_atc
                                objPost.tppf_tipo_portifolio__portfolio = isPortafolioATC.length > 0 ? isPortafolioATC[0].UrlJsonContext.tipo_portifolio : '';
                                objPost.tppf_tipo_portifolio = isPortafolioATC.length > 0 ? isPortafolioATC[0].UrlJsonContext.tipo_portifolio : '';
                                objPost.tppf_portfolio_id = isPortafolioATC.length > 0 ? isPortafolioATC[0].ID : '';
                                delete objPost.portafolio_atc;
                            }

                            //*item:regional_atc
                            let isSitRegionalATC = getTabExcel.filter((j) => j.UrlJsonContext.regio_regional__regiao_atc == objPost.regional_atc);
                            if (isSitRegionalATC.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*pesq.ref:regional_atc
                                let cacheRegionalATC = arrCache.filter((j) => j.id == idRegionalATC);
                                let isRegionalATC = cacheRegionalATC[0].data.filter((j) => j.UrlJsonContext.regional == objPost.regional_atc);
                                if (isRegionalATC.length == 0) {
                                    //*err:regional_atc
                                    status_desc = `ERROR: no hay Regional ATC "${objPost.regional_atc}" registrado para ${tabExcel} en Asset Number "${objPost.asset_number}"`;
                                    statusPost.push(`${time}, ${status_desc} \n`);
                                    await postStatus(status_desc, statusPost, data);
                                    return false;
                                }
                                //*obj:regional_atc
                                objPost.regio_regional__regiao_atc = isRegionalATC.length > 0 ? isRegionalATC[0].UrlJsonContext.regional : '';
                                objPost.regio_regional = isRegionalATC.length > 0 ? isRegionalATC[0].UrlJsonContext.regional : '';
                                objPost.regio_regional_regiao_atc_id = isRegionalATC.length > 0 ? isRegionalATC[0].ID : '';
                                objPost.regio_regiao_atc_id = isRegionalATC.length > 0 ? isRegionalATC[0].ID : '';
                                delete objPost.regional_atc;
                            }
                        }

                        //*aba:informacion_cuenta
                        if (tabExcel == 'informacion_cuenta') {
                            fielNameQ = getKey(tabExcel);
                            valueQ = objPost.cuenta_interna_nic;
                            objPost.registro_salvo_ = 'sim';

                            //*id_one_ref:sitios
                            let strFiltro = gerarFiltro('asset_number', objPost.asset_number.toString());
                            let paiRegistro = await getOnergyItem(idSitios, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, strFiltro);

                            //*item:profit_cost_center
                            let isProfitCostCenter = getTabExcel.filter((j) => j.UrlJsonContext.profit_cost_center == objPost.profit_cost_center);
                            if (isProfitCostCenter.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:profit_cost_center
                                objPost.profit_cost_center = objPost.profit_cost_center.toString();
                            }

                            //*item:portafolio_atc
                            let isPortafolioATC = getTabExcel.filter((j) => j.UrlJsonContext.tppf_tipo_portifolio__portfolio == objPost.portafolio_atc);
                            if (isPortafolioATC.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:portafolio_atc
                                objPost.tppf_tipo_portifolio__portfolio = objPost.portafolio_atc;
                                delete objPost.portafolio_atc;
                            }

                            //*item:asset_number
                            let isAssetNumber = getTabExcel.filter((j) => j.UrlJsonContext.asset_number_IDC == objPost.asset_number);
                            if (isAssetNumber.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:asset_number
                                objPost.ID_ONE_REF = paiRegistro.length > 0 ? paiRegistro[0].ID : '';
                                objPost.asset_number_IDC = objPost.asset_number.toString();
                                objPost.asset_number = objPost.asset_number.toString();
                            }

                            //*item:nombre_sitio
                            let isNombreSitio = getTabExcel.filter((j) => j.UrlJsonContext.site_name == objPost.nombre_sitio);
                            if (isNombreSitio.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:nombre_sitio
                                objPost.site_name = objPost.nombre_sitio;
                                delete objPost.nombre_sitio;
                            }

                            //*item:compania_atc
                            let isCompaniaATC = getTabExcel.filter((j) => j.UrlJsonContext.emp_atc_site == objPost.compania_atc);
                            if (isCompaniaATC.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:compania_atc
                                objPost.emp_atc_site = objPost.compania_atc;
                                delete objPost.compania_atc;
                            }

                            //*item:cuenta_interna_nic
                            let isCuentaInternaNIC = getTabExcel.filter((j) => j.UrlJsonContext.conta_interna_nic == objPost.cuenta_interna_nic);
                            if (isCuentaInternaNIC.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:cuenta_interna_nic
                                objPost.conta_interna_nic = objPost.cuenta_interna_nic.toString();
                                delete objPost.cuenta_interna_nic;
                            }

                            //*item:cuenta_padre
                            let isCuentaPadre = getTabExcel.filter((j) => j.UrlJsonContext.prcs__conta_pai == objPost.cuenta_padre);
                            if (isCuentaPadre.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:cuenta_padre
                                objPost.prcs__conta_pai = objPost.cuenta_padre.toString();
                                delete objPost.cuenta_padre;
                            }

                            //*item:tipo_cuenta
                            let isIdlcTipoCuenta = getTabExcel.filter((j) => j.UrlJsonContext.TCTC_tipo_de_conta__prcs__tipo_de_conta == objPost.tipo_cuenta);
                            if (isIdlcTipoCuenta.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*pesq.ref:tipo_cuenta
                                let cacheTipoCuenta = arrCache.filter((j) => j.id == idTipoCuenta);
                                let isTipoCuenta = cacheTipoCuenta[0].data.filter((j) => j.UrlJsonContext.TC_tipo_de_conta == objPost.tipo_cuenta);
                                if (isTipoCuenta.length == 0) {
                                    //*err:tipo_cuenta
                                    status_desc = `ERROR: no hay Tipo Cuenta "${objPost.tipo_cuenta}" registrado para ${tabExcel} en Asset Number "${objPost.asset_number}"`;
                                    statusPost.push(`${time}, ${status_desc} \n`);
                                    await postStatus(status_desc, statusPost, data);
                                    return false;
                                }
                                //*obj:tipo_cuenta
                                objPost.TCTC_tipo_de_conta__prcs__tipo_de_conta =
                                    isTipoCuenta.length > 0 ? isTipoCuenta[0].UrlJsonContext.TC_tipo_de_conta : '';
                                objPost.TCprcs__tipo_de_conta_id = isTipoCuenta.length > 0 ? isTipoCuenta[0].ID : '';
                                objPost.TCTC_tipo_de_conta__TC_tipo_de_conta_valor =
                                    isTipoCuenta.length > 0 ? isTipoCuenta[0].UrlJsonContext.TC_tipo_de_conta : '';
                                objPost.prcs__tipo_de_conta_cache = isTipoCuenta.length > 0 ? isTipoCuenta[0].ID : '';
                                delete objPost.tipo_cuenta;
                            }

                            //*item:numero_medidor
                            let isNumeroMedidor = getTabExcel.filter((j) => j.UrlJsonContext.numero_do_medidor == objPost.numero_medidor);
                            if (isNumeroMedidor.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:numero_medidor
                                objPost.numero_do_medidor = objPost.numero_medidor;
                                delete objPost.numero_medidor;
                            }

                            //*item:suscriptor
                            let isIdlcSuscriptor = getTabExcel.filter((j) => j.UrlJsonContext.sus_sus__suscriptor__prcs__assinante_atc == objPost.suscriptor);
                            if (isIdlcSuscriptor.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*pesq.ref:suscriptor
                                let cacheSuscriptor = arrCache.filter((j) => j.id == idSuscriptor);
                                let isSuscriptor = cacheSuscriptor[0].data.filter((j) => j.UrlJsonContext.sus__suscriptor == objPost.suscriptor);
                                if (isSuscriptor.length == 0) {
                                    //*err:suscriptor
                                    status_desc = `ERROR: no hay Suscriptor "${objPost.suscriptor}" registrado para ${tabExcel} en Asset Number "${objPost.asset_number}"`;
                                    statusPost.push(`${time}, ${status_desc} \n`);
                                    await postStatus(status_desc, statusPost, data);
                                    return false;
                                }
                                //*obj:suscriptor
                                objPost.sus_sus__suscriptor__prcs__assinante_atc =
                                    isSuscriptor.length > 0 ? isSuscriptor[0].UrlJsonContext.sus__suscriptor : '';
                                objPost.sus_prcs__assinante_atc_id = isSuscriptor.length > 0 ? isSuscriptor[0].ID : '';
                                delete objPost.suscriptor;
                            }

                            //*item:estado_cuenta
                            let isIdlcEstadoCuenta = getTabExcel.filter((j) => j.UrlJsonContext.sta_cont_status_conta == objPost.estado_cuenta);
                            if (isIdlcEstadoCuenta.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*pesq.ref:estado_cuenta
                                let cacheEstadoCuenta = arrCache.filter((j) => j.id == idEstadoCuenta);
                                let isEstadoCuenta = cacheEstadoCuenta[0].data.filter((j) => j.UrlJsonContext.status_conta == objPost.estado_cuenta);
                                if (isEstadoCuenta.length == 0) {
                                    //*err:estado_cuenta
                                    status_desc = `ERROR: no hay Estado Cuenta "${objPost.estado_cuenta}" registrado para ${tabExcel} en Asset Number "${objPost.asset_number}"`;
                                    statusPost.push(`${time}, ${status_desc} \n`);
                                    await postStatus(status_desc, statusPost, data);
                                    return false;
                                }
                                //*obj:estado_cuenta
                                objPost.sta_cont_status_conta = isEstadoCuenta.length > 0 ? isEstadoCuenta[0].UrlJsonContext.status_conta : '';
                                objPost.sta_cont_id = isEstadoCuenta.length > 0 ? isEstadoCuenta[0].ID : '';
                                delete objPost.estado_cuenta;
                            }

                            //*item:proveedores
                            let isIdlcProveedores = getTabExcel.filter((j) => j.UrlJsonContext.prvd_nome_provedor == objPost.nombre_proveedor);
                            if (isIdlcProveedores.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*pesq.ref:proveedores
                                let cacheProveedores = arrCache.filter((j) => j.id == idProveedores);
                                let isProveedores = cacheProveedores[0].data.filter((j) => j.UrlJsonContext.nome_provedor == objPost.nombre_proveedor);
                                if (isProveedores.length == 0) {
                                    //*err:proveedores
                                    status_desc = `ERROR: no hay Nombre Proveedor "${objPost.nombre_proveedor}" registrado para ${tabExcel} en Asset Number "${objPost.asset_number}"`;
                                    statusPost.push(`${time}, ${status_desc} \n`);
                                    await postStatus(status_desc, statusPost, data);
                                    return false;
                                }
                                //*obj:proveedores
                                objPost.prvd_nome_provedor = isProveedores.length > 0 ? isProveedores[0].UrlJsonContext.nome_provedor : '';
                                objPost.prvd_id = isProveedores.length > 0 ? isProveedores[0].ID : '';
                                objPost.nome_provedor_id_cache = isProveedores.length > 0 ? isProveedores[0].ID : '';
                                objPost.prvd_nome_comercial = isProveedores.length > 0 ? isProveedores[0].UrlJsonContext.nome_comercial : '';
                                objPost.prvd_nit_provedor = isProveedores.length > 0 ? isProveedores[0].UrlJsonContext.nit_provedor : '';
                                objPost.prvd_nit_beneficiario = isProveedores.length > 0 ? isProveedores[0].UrlJsonContext.nit_beneficiario : '';
                                objPost.prvd_beneficiario = isProveedores.length > 0 ? isProveedores[0].UrlJsonContext.beneficiario : '';
                                objPost.prvd_apelido_provedor = isProveedores.length > 0 ? isProveedores[0].UrlJsonContext.apelido_provedor : '';
                                objPost.prvd_link_web = isProveedores.length > 0 ? isProveedores[0].UrlJsonContext.link_web : '';
                                objPost.tp_acces_tipo_de_acesso__tp_acces_tipo_de_acesso =
                                    isProveedores.length > 0 ? isProveedores[0].UrlJsonContext.tp_acces_tipo_de_acesso : '';
                                objPost.tp_acces_tp_acces_tipo_de_acesso_id = isProveedores.length > 0 ? isProveedores[0].UrlJsonContext.tp_acces_id : '';
                                objPost.prvd_usuario = isProveedores.length > 0 ? isProveedores[0].UrlJsonContext.usuario : '';
                                objPost.prvd_senha = isProveedores.length > 0 ? isProveedores[0].UrlJsonContext.senha : '';
                                delete objPost.nombre_proveedor;
                                delete objPost.nit_proveedor;
                                delete objPost.nit_beneficiario;
                                delete objPost.beneficiario;
                                delete objPost.apodo_proveedor;
                                delete objPost.link_web;
                                delete objPost.usuario;
                                delete objPost.contrasena;
                            }

                            //*item:servicios
                            let isIdlcServicios = getTabExcel.filter((j) => j.UrlJsonContext.SERVservicos__servico == objPost.servicios);
                            if (isIdlcServicios.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*pesq.ref:servicios
                                let cacheServicios = arrCache.filter((j) => j.id == idServicios);
                                let isServicios = cacheServicios[0].data.filter((j) => j.UrlJsonContext.servicos == objPost.servicios);
                                if (isServicios.length == 0) {
                                    //*err:servicios
                                    status_desc = `ERROR: no hay Servicios "${objPost.servicios}" registrado para ${tabExcel} en Asset Number "${objPost.asset_number}"`;
                                    statusPost.push(`${time}, ${status_desc} \n`);
                                    await postStatus(status_desc, statusPost, data);
                                    return false;
                                }
                                //*obj:servicios
                                let arr00 = [];
                                let objArr00 = isServicios.length > 0 ? isServicios[0].UrlJsonContext.servicos : '';
                                arr00.push(objArr00);
                                objPost.SERVservicos__servico = arr00;
                                let arr01 = [];
                                let objArr01 = isServicios.length > 0 ? isServicios[0].ID : '';
                                arr01.push(objArr01);
                                objPost.SERVservico_id = arr01;
                                delete objPost.servicios;
                            }

                            //*item:sujeto_pasivo
                            let isIdlcSujetoPasivo = getTabExcel.filter(
                                (j) => j.UrlJsonContext.suj_pa_sujeito__prcs__sujeito_passivo_alumbrado_publico == objPost.sujeto_pasivo
                            );
                            if (isIdlcSujetoPasivo.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*pesq.ref:sujeto_pasivo
                                let cacheSujetoPasivo = arrCache.filter((j) => j.id == idSujetoPasivo);
                                let isSujetoPasivo = cacheSujetoPasivo[0].data.filter((j) => j.UrlJsonContext.sujeito == objPost.sujeto_pasivo);
                                if (isSujetoPasivo.length == 0) {
                                    //*err:sujeto_pasivo
                                    status_desc = `ERROR: no hay Sujeto Pasivo "${objPost.sujeto_pasivo}" registrado para ${tabExcel} en Asset Number "${objPost.asset_number}"`;
                                    statusPost.push(`${time}, ${status_desc} \n`);
                                    await postStatus(status_desc, statusPost, data);
                                    return false;
                                }
                                //*obj:sujeto_pasivo
                                objPost.suj_pa_sujeito__prcs__sujeito_passivo_alumbrado_publico =
                                    isSujetoPasivo.length > 0 ? isSujetoPasivo[0].UrlJsonContext.sujeito : '';
                                objPost.suj_pa_prcs__sujeito_passivo_alumbrado_publico_id = isSujetoPasivo.length > 0 ? isSujetoPasivo[0].ID : '';
                                delete objPost.sujeto_pasivo;
                            }

                            //*item:acuerdo_resolucion
                            let isAcuerdoResolucion = getTabExcel.filter(
                                (j) => j.UrlJsonContext.prcs__acuerdo_resolucion_alumbrado_publico == objPost.acuerdo_resolucion
                            );
                            if (isAcuerdoResolucion.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:acuerdo_resolucion
                                objPost.prcs__acuerdo_resolucion_alumbrado_publico = objPost.acuerdo_resolucion;
                                delete objPost.acuerdo_resolucion;
                            }

                            //*item:tipo_cobro
                            let isIdlcTipoCobro = getTabExcel.filter((j) => j.UrlJsonContext.tipo_cobr_tipos_cobrancas__tipo_de_cobranca == objPost.tipo_cobro);
                            if (isIdlcTipoCobro.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*pesq.ref:tipo_cobro
                                let cacheTipoCobro = arrCache.filter((j) => j.id == idTipoCobro);
                                let isTipoCobro = cacheTipoCobro[0].data.filter((j) => j.UrlJsonContext.tipos_cobrancas == objPost.tipo_cobro);
                                if (isTipoCobro.length == 0) {
                                    //*err:tipo_cobro
                                    status_desc = `ERROR: no hay Tipo Cobro "${objPost.tipo_cobro}" registrado para ${tabExcel} en Asset Number "${objPost.asset_number}"`;
                                    statusPost.push(`${time}, ${status_desc} \n`);
                                    await postStatus(status_desc, statusPost, data);
                                    return false;
                                }
                                //*obj:tipo_cobro
                                objPost.tipo_cobr_tipos_cobrancas__tipo_de_cobranca =
                                    isTipoCobro.length > 0 ? isTipoCobro[0].UrlJsonContext.tipos_cobrancas : '';
                                objPost.tipo_cobr_tipo_de_cobranca_id = isTipoCobro.length > 0 ? isTipoCobro[0].ID : '';
                                delete objPost.tipo_cobro;
                            }

                            //*item:dia_de_pago
                            let isDiaDePago = getTabExcel.filter((j) => j.UrlJsonContext.prcs__dia_de_pagamento == objPost.dia_de_pago);
                            if (isDiaDePago.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.prcs__dia_de_pagamento = objPost.dia_de_pago > 0 ? objPost.dia_de_pago : '';
                                delete objPost.dia_de_pago;
                            }

                            //*item:frecuencia_pago
                            let isIdlcFrecuenciaPago = getTabExcel.filter(
                                (j) => j.UrlJsonContext.fre_pag_frequencia__frequencia_de_pagamento == objPost.frecuencia_pago
                            );
                            if (isIdlcFrecuenciaPago.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*pesq.ref:frecuencia_pago
                                let cacheFrecuenciaPago = arrCache.filter((j) => j.id == idFrecuenciaPago);
                                let isFrecuenciaPago = cacheFrecuenciaPago[0].data.filter((j) => j.UrlJsonContext.frequencia == objPost.frecuencia_pago);
                                if (isFrecuenciaPago.length == 0) {
                                    //*err:frecuencia_pago
                                    status_desc = `ERROR: no hay Frecuencia Pago "${objPost.frecuencia_pago}" registrado para ${tabExcel} en Asset Number "${objPost.asset_number}"`;
                                    statusPost.push(`${time}, ${status_desc} \n`);
                                    await postStatus(status_desc, statusPost, data);
                                    return false;
                                }
                                //*obj:frecuencia_pago
                                objPost.fre_pag_frequencia__frequencia_de_pagamento =
                                    isFrecuenciaPago.length > 0 ? isFrecuenciaPago[0].UrlJsonContext.frequencia : '';
                                objPost.fre_pag_frequencia_de_pagamento_id = isFrecuenciaPago.length > 0 ? isFrecuenciaPago[0].ID : '';
                                delete objPost.frecuencia_pago;
                            }

                            //*item:forma_pago
                            let isIdlcFormaPago = getTabExcel.filter(
                                (j) => j.UrlJsonContext.for_pag_formas_de_pagamentos__forma_de_pagamento == objPost.forma_pago
                            );
                            if (isIdlcFormaPago.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*pesq.ref:forma_pago
                                let cacheFormaPago = arrCache.filter((j) => j.id == idFormaPago);
                                let isFormaPago = cacheFormaPago[0].data.filter((j) => j.UrlJsonContext.formas_de_pagamentos == objPost.forma_pago);
                                if (isFormaPago.length == 0) {
                                    //*err:forma_pago
                                    status_desc = `ERROR: no hay Forma Pago "${objPost.forma_pago}" registrado para ${tabExcel} en Asset Number "${objPost.asset_number}"`;
                                    statusPost.push(`${time}, ${status_desc} \n`);
                                    await postStatus(status_desc, statusPost, data);
                                    return false;
                                }
                                //*obj:forma_pago
                                objPost.for_pag_formas_de_pagamentos__forma_de_pagamento =
                                    isFormaPago.length > 0 ? isFormaPago[0].UrlJsonContext.formas_de_pagamentos : '';
                                objPost.for_pag_forma_de_pagamento_id = isFormaPago.length > 0 ? isFormaPago[0].ID : '';
                                delete objPost.forma_pago;
                            }

                            //*item:clasificacion_passthru
                            let isIdlcClasificacionPassthru = getTabExcel.filter(
                                (j) => j.UrlJsonContext.CPTclassificacao_passthru__prcs__clasificacion_passthru == objPost.clasificacion_passthru
                            );
                            if (isIdlcClasificacionPassthru.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*pesq.ref:clasificacion_passthru
                                let cacheClasificacionPassthru = arrCache.filter((j) => j.id == idClasificacionPassthru);
                                let isClasificacionPassthru = cacheClasificacionPassthru[0].data.filter(
                                    (j) => j.UrlJsonContext.classificacao_passthru == objPost.clasificacion_passthru
                                );
                                if (isClasificacionPassthru.length == 0) {
                                    //*err:clasificacion_passthru
                                    status_desc = `ERROR: no hay Clasificacion Passthru "${objPost.clasificacion_passthru}" registrado para ${tabExcel} en Asset Number "${objPost.asset_number}"`;
                                    statusPost.push(`${time}, ${status_desc} \n`);
                                    await postStatus(status_desc, statusPost, data);
                                    return false;
                                }
                                //*obj:clasificacion_passthru
                                objPost.CPTclassificacao_passthru__prcs__clasificacion_passthru =
                                    isClasificacionPassthru.length > 0 ? isClasificacionPassthru[0].UrlJsonContext.classificacao_passthru : '';
                                objPost.CPTprcs__clasificacion_passthru_id = isClasificacionPassthru.length > 0 ? isClasificacionPassthru[0].ID : '';
                                delete objPost.clasificacion_passthru;
                            }

                            //*item:estado_captura_cuenta
                            let isIdlcEstadoCapturaCuenta = getTabExcel.filter(
                                (j) => j.UrlJsonContext.ECCUECCU_estado_da_captura_da_conta__status_de_capturapago == objPost.estado_captura_cuenta
                            );
                            if (isIdlcEstadoCapturaCuenta.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*pesq.ref:estado_captura_cuenta
                                let cacheEstadoCapturaCuenta = arrCache.filter((j) => j.id == idEstadoCapturaCuenta);
                                let isEstadoCapturaCuenta = cacheEstadoCapturaCuenta[0].data.filter(
                                    (j) => j.UrlJsonContext.ECCU_estado_da_captura_da_conta == objPost.estado_captura_cuenta
                                );
                                if (isEstadoCapturaCuenta.length == 0) {
                                    //*err:estado_captura_cuenta
                                    status_desc = `ERROR: no hay Estado Captura Cuenta "${objPost.estado_captura_cuenta}" registrado para ${tabExcel} en Asset Number "${objPost.asset_number}"`;
                                    statusPost.push(`${time}, ${status_desc} \n`);
                                    await postStatus(status_desc, statusPost, data);
                                    return false;
                                }
                                //*obj:estado_captura_cuenta
                                objPost.ECCUECCU_estado_da_captura_da_conta__status_de_capturapago =
                                    isEstadoCapturaCuenta.length > 0 ? isEstadoCapturaCuenta[0].UrlJsonContext.ECCU_estado_da_captura_da_conta : '';
                                objPost.ECCUstatus_de_capturapago_id = isEstadoCapturaCuenta.length > 0 ? isEstadoCapturaCuenta[0].ID : '';
                                delete objPost.estado_captura_cuenta;
                            }

                            //*item:proxima_captura
                            let dataProximaCaptura = objPost.proxima_captura.split('T')[0];
                            let isProximaCaptura = getTabExcel.filter((j) => j.UrlJsonContext.prcs__proxima_captura == dataProximaCaptura);
                            if (isProximaCaptura.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:proxima_captura
                                objPost.prcs__proxima_captura = dataProximaCaptura;
                                delete objPost.proxima_captura;
                            }

                            //*item:proximo_pago_oportuno
                            let dataProximoPagoOportuno = objPost.proximo_pago_oportuno.split('T')[0];
                            let isProximoPagoOportuno = getTabExcel.filter((j) => j.UrlJsonContext.data_proximo_pagamento == dataProximoPagoOportuno);
                            if (isProximoPagoOportuno.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:proximo_pago_oportuno
                                objPost.data_proximo_pagamento = dataProximoPagoOportuno;
                                delete objPost.proximo_pago_oportuno;
                            }
                        }

                        //*aba:informacion_tecnica
                        if (tabExcel == 'informacion_tecnica') {
                            fielNameQ = getKey(tabExcel);
                            valueQ = objPost.asset_number;

                            //*id_one_ref:sitios
                            let strFiltro = gerarFiltro('asset_number', objPost.asset_number.toString());
                            let paiRegistro = await getOnergyItem(idSitios, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, strFiltro);

                            //*item:categorias
                            let isItdsCategorias = getTabExcel.filter((j) => j.UrlJsonContext.ctgr_categorias__categoria == objPost.categorias);
                            if (isItdsCategorias.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*pesq.ref:categorias
                                let cacheCategorias = arrCache.filter((j) => j.id == idCategorias);
                                let isCategorias = cacheCategorias[0].data.filter((j) => j.UrlJsonContext.categorias == objPost.categorias);
                                if (isCategorias.length == 0) {
                                    //*err:categorias
                                    status_desc = `ERROR: no hay Categorias "${objPost.categorias}" registrado para ${tabExcel} en Asset Number "${objPost.asset_number}"`;
                                    statusPost.push(`${time}, ${status_desc} \n`);
                                    await postStatus(status_desc, statusPost, data);
                                    return false;
                                }
                                //*obj:categorias
                                objPost.ctgr_categorias__categoria = isCategorias.length > 0 ? isCategorias[0].UrlJsonContext.categorias : '';
                                objPost.ctgr_categoria_id = isCategorias.length > 0 ? isCategorias[0].ID : '';
                                delete objPost.categorias;
                            }

                            //*item:estrato
                            let isItdsEstrato = getTabExcel.filter((j) => j.UrlJsonContext.LSTLST_estrato__ITDS_estrato == objPost.estrato);
                            if (isItdsEstrato.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*pesq.ref:estrato
                                let cacheEstrato = arrCache.filter((j) => j.id == idEstrato);
                                let isEstrato = cacheEstrato[0].data.filter((j) => j.UrlJsonContext.LST_estrato == objPost.estrato);
                                if (isEstrato.length == 0) {
                                    //*err:estrato
                                    status_desc = `ERROR: no hay Estrato "${objPost.estrato}" registrado para ${tabExcel} en Asset Number "${objPost.asset_number}"`;
                                    statusPost.push(`${time}, ${status_desc} \n`);
                                    await postStatus(status_desc, statusPost, data);
                                    return false;
                                }
                                //*obj:estrato
                                objPost.LSTLST_estrato__ITDS_estrato = isEstrato.length > 0 ? isEstrato[0].UrlJsonContext.LST_estrato : '';
                                objPost.LSTITDS_estrato_id = isEstrato.length > 0 ? isEstrato[0].ID : '';
                                delete objPost.estrato;
                            }

                            //*item:nivel_tension
                            let isItdsNivelTension = getTabExcel.filter((j) => j.UrlJsonContext.NVTNVT_nivel__ITDS_nivel_de_tensao == objPost.nivel_tension);
                            if (isItdsNivelTension.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*pesq.ref:nivel_tension
                                let cacheNivelTension = arrCache.filter((j) => j.id == idNivelTension);
                                let isNivelTension = cacheNivelTension[0].data.filter((j) => j.UrlJsonContext.NVT_nivel == objPost.nivel_tension);
                                if (isNivelTension.length == 0) {
                                    //*err:nivel_tension
                                    status_desc = `ERROR: no hay Nivel Tension "${objPost.nivel_tension}" registrado para ${tabExcel} en Asset Number "${objPost.asset_number}"`;
                                    statusPost.push(`${time}, ${status_desc} \n`);
                                    await postStatus(status_desc, statusPost, data);
                                    return false;
                                }
                                //*obj:nivel_tension
                                objPost.NVTNVT_nivel__ITDS_nivel_de_tensao = isNivelTension.length > 0 ? isNivelTension[0].UrlJsonContext.NVT_nivel : '';
                                objPost.NVTITDS_nivel_de_tensao_id = isNivelTension.length > 0 ? isNivelTension[0].ID : '';
                                delete objPost.nivel_tension;
                            }

                            //*item:lecturas
                            let isItdsLecturas = getTabExcel.filter((j) => j.UrlJsonContext.LCTLCT_ferramentas__ITDS_lecturas == objPost.lectura_atc);
                            if (isItdsLecturas.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*pesq.ref:lecturas
                                let cacheLecturas = arrCache.filter((j) => j.id == idLecturas);
                                let isLecturas = cacheLecturas[0].data.filter((j) => j.UrlJsonContext.LCT_ferramentas == objPost.lectura_atc);
                                if (isLecturas.length == 0) {
                                    //*err:lecturas
                                    status_desc = `ERROR: no hay Lectura ATC "${objPost.lectura_atc}" registrado para ${tabExcel} en Asset Number "${objPost.asset_number}"`;
                                    statusPost.push(`${time}, ${status_desc} \n`);
                                    await postStatus(status_desc, statusPost, data);
                                    return false;
                                }
                                //*obj:lecturas
                                objPost.LCTLCT_ferramentas__ITDS_lecturas = isLecturas.length > 0 ? isLecturas[0].UrlJsonContext.LCT_ferramentas : '';
                                objPost.LCTITDS_lecturas_id = isLecturas.length > 0 ? isLecturas[0].ID : '';
                                delete objPost.lectura_atc;
                            }

                            //*item:asset_number
                            let isAssetNumber = getTabExcel.filter((j) => j.UrlJsonContext.asset_number == objPost.asset_number);
                            if (isAssetNumber.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:asset_number
                                objPost.ID_ONE_REF = paiRegistro.length > 0 ? paiRegistro[0].ID : '';
                                objPost.asset_number = objPost.asset_number.toString();
                            }

                            //*item:nombre_sitio
                            let isNombreSitio = getTabExcel.filter((j) => j.UrlJsonContext.site_name == objPost.nombre_sitio);
                            if (isNombreSitio.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:nombre_sitio
                                objPost.site_name = objPost.nombre_sitio;
                                delete objPost.nombre_sitio;
                            }

                            //*item:direccion
                            let isDireccion = getTabExcel.filter((j) => j.UrlJsonContext.logradouro == objPost.direccion);
                            if (isDireccion.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:direccion
                                objPost.logradouro = objPost.direccion;
                                delete objPost.direccion;
                            }

                            //*item:municipio
                            let isMunicipio = getTabExcel.filter((j) => j.UrlJsonContext.loca_cida_municipio == objPost.municipio);
                            if (isMunicipio.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:municipio
                                objPost.loca_cida_municipio = objPost.municipio;
                                objPost.loca_cida_loca_uf_uf = objPost.departamento;
                                delete objPost.municipio;
                                delete objPost.departamento;
                            }

                            //*item:estado_sitio
                            let isStatusSite = getTabExcel.filter((j) => j.UrlJsonContext.sta_site_status == objPost.estado_sitio);
                            if (isStatusSite.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:estado_sitio
                                objPost.sta_site_status = objPost.estado_sitio;
                                delete objPost.estado_sitio;
                            }

                            //*item:compania_atc
                            let isCompaniaATC = getTabExcel.filter((j) => j.UrlJsonContext.emp_atc_site == objPost.compania_atc);
                            if (isCompaniaATC.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:compania_atc
                                objPost.emp_atc_site = objPost.compania_atc;
                                delete objPost.compania_atc;
                            }

                            //*item:motogenerador
                            let isItdsMotogenerador = getTabExcel.filter((j) => j.UrlJsonContext.gerger_gerador__gerador == objPost.motogenerador);
                            if (isItdsMotogenerador.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*pesq.ref:motogenerador
                                let cacheMotogenerador = arrCache.filter((j) => j.id == idMotogenerador);
                                let isMotogenerador = cacheMotogenerador[0].data.filter((j) => j.UrlJsonContext.ger_gerador == objPost.motogenerador);
                                if (isMotogenerador.length == 0) {
                                    //*err:motogenerador
                                    status_desc = `ERROR: no hay Motogenerador "${objPost.motogenerador}" registrado para ${tabExcel} en Asset Number "${objPost.asset_number}"`;
                                    statusPost.push(`${time}, ${status_desc} \n`);
                                    await postStatus(status_desc, statusPost, data);
                                    return false;
                                }
                                //*obj:motogenerador
                                objPost.gerger_gerador__gerador = isMotogenerador.length > 0 ? isMotogenerador[0].UrlJsonContext.ger_gerador : '';
                                objPost.gergerador_id = isMotogenerador.length > 0 ? isMotogenerador[0].ID : '';
                                delete objPost.motogenerador;
                            }

                            //*item:tablero_independiente
                            let isItdsTableroIndependiente = getTabExcel.filter(
                                (j) => j.UrlJsonContext.dirdir_diretoria_independente__diretoria_independente == objPost.tablero_independiente
                            );
                            if (isItdsTableroIndependiente.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*pesq.ref:tablero_independiente
                                let cacheTableroIndependiente = arrCache.filter((j) => j.id == idTableroIndependiente);
                                let isTableroIndependiente = cacheTableroIndependiente[0].data.filter(
                                    (j) => j.UrlJsonContext.dir_diretoria_independente == objPost.tablero_independiente
                                );
                                if (isTableroIndependiente.length == 0) {
                                    //*err:tablero_independiente
                                    status_desc = `ERROR: no hay Tablero Independiente "${objPost.tablero_independiente}" registrado para ${tabExcel} en Asset Number "${objPost.asset_number}"`;
                                    statusPost.push(`${time}, ${status_desc} \n`);
                                    await postStatus(status_desc, statusPost, data);
                                    return false;
                                }
                                //*obj:tablero_independiente
                                objPost.dirdir_diretoria_independente__diretoria_independente =
                                    isTableroIndependiente.length > 0 ? isTableroIndependiente[0].UrlJsonContext.dir_diretoria_independente : '';
                                objPost.dirdiretoria_independente_id = isTableroIndependiente.length > 0 ? isTableroIndependiente[0].ID : '';
                                delete objPost.tablero_independiente;
                            }

                            //*item:barter
                            let isItdsBarter = getTabExcel.filter((j) => j.UrlJsonContext.escesc_escambo__escambo == objPost.barter);
                            if (isItdsBarter.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*pesq.ref:barter
                                let cacheBarter = arrCache.filter((j) => j.id == idBarter);
                                let isBarter = cacheBarter[0].data.filter((j) => j.UrlJsonContext.esc_escambo == objPost.barter);
                                if (isBarter.length == 0) {
                                    //*err:barter
                                    status_desc = `ERROR: no hay Barter "${objPost.barter}" registrado para ${tabExcel} en Asset Number "${objPost.asset_number}"`;
                                    statusPost.push(`${time}, ${status_desc} \n`);
                                    await postStatus(status_desc, statusPost, data);
                                    return false;
                                }
                                //*obj:barter
                                objPost.escesc_escambo__escambo = isBarter.length > 0 ? isBarter[0].UrlJsonContext.esc_escambo : '';
                                objPost.escescambo_id = isBarter.length > 0 ? isBarter[0].ID : '';
                                delete objPost.barter;
                            }

                            //*item:provisional
                            let isItdsProvisional = getTabExcel.filter((j) => j.UrlJsonContext.propro_provisorio__provisorio == objPost.provisional);
                            if (isItdsProvisional.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*pesq.ref:provisional
                                let cacheProvisional = arrCache.filter((j) => j.id == idProvisional);
                                let isProvisional = cacheProvisional[0].data.filter((j) => j.UrlJsonContext.pro_provisorio == objPost.provisional);
                                if (isProvisional.length == 0) {
                                    //*err:provisional
                                    status_desc = `ERROR: no hay Provisional "${objPost.provisional}" registrado para ${tabExcel} en Asset Number "${objPost.asset_number}"`;
                                    statusPost.push(`${time}, ${status_desc} \n`);
                                    await postStatus(status_desc, statusPost, data);
                                    return false;
                                }
                                //*obj:provisional
                                objPost.propro_provisorio__provisorio = isProvisional.length > 0 ? isProvisional[0].UrlJsonContext.pro_provisorio : '';
                                objPost.proprovisorio_id = isProvisional.length > 0 ? isProvisional[0].ID : '';
                                delete objPost.provisional;
                            }

                            //*item:cantidad_provisionales
                            let isCantidadProvisionales = getTabExcel.filter((j) => j.UrlJsonContext.quantidade_provisoria == objPost.cantidad_provisionales);
                            if (isCantidadProvisionales.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:cantidad_provisionales
                                objPost.quantidade_provisoria = objPost.cantidad_provisionales;
                                delete objPost.cantidad_provisionales;
                            }
                        }

                        //*aba:clientes_sitio
                        if (tabExcel == 'clientes_sitio') {
                            fielNameQ = getKey(tabExcel);
                            valueQ = objPost.asset_number;

                            //*id_one_ref:sitios
                            let strFiltro = gerarFiltro('asset_number', objPost.asset_number.toString());
                            let paiRegistro = await getOnergyItem(idSitios, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, strFiltro);

                            //*item:nit_cliente
                            let isNITCliente = getTabExcel.filter((j) => j.UrlJsonContext.COLCCOLC_nit_cliente == objPost.nit_cliente);
                            if (isNITCliente.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*pesq.ref:nit_cliente
                                let cacheClientes = arrCache.filter((j) => j.id == idClientes);
                                let isClientes = cacheClientes[0].data.filter((j) => j.UrlJsonContext.COLC_nit_cliente == objPost.nit_cliente);
                                if (isClientes.length == 0) {
                                    //*err:nit_cliente
                                    status_desc = `ERROR: no hay NIT Cliente "${objPost.nit_cliente}" registrado para ${tabExcel} en NIT Cliente "${objPost.nit_cliente}"`;
                                    statusPost.push(`${time}, ${status_desc} \n`);
                                    await postStatus(status_desc, statusPost, data);
                                    return false;
                                }
                                //*obj:nit_cliente
                                objPost.ID_ONE_REF = paiRegistro.length > 0 ? paiRegistro[0].ID : '';
                                objPost.COLCCOLC_nit_cliente = isClientes.length > 0 ? isClientes[0].UrlJsonContext.COLC_nit_cliente : '';
                                objPost.COLCclsit__nit_cliente_id = isClientes.length > 0 ? isClientes[0].ID : '';
                                objPost.COLCCOLC_nome_cliente__clsit__nit_cliente = isClientes.length > 0 ? isClientes[0].UrlJsonContext.COLC_nome_cliente : '';
                                delete objPost.nombre_cliente;
                                delete objPost.nit_cliente;
                            }

                            //*item:codigo_sitio_cliente
                            let isCodigoSitioCliente = getTabExcel.filter(
                                (j) => j.UrlJsonContext.clsit__codigo_do_sitio_do_cliente == objPost.codigo_sitio_cliente
                            );
                            if (isCodigoSitioCliente.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:codigo_sitio_cliente
                                objPost.clsit__codigo_do_sitio_do_cliente = objPost.codigo_sitio_cliente;
                                delete objPost.codigo_sitio_cliente;
                            }

                            //*item:nombre_regional
                            let isNombreRegional = getTabExcel.filter(
                                (j) => j.UrlJsonContext.RCSRCS_nome_regional__clsit__regional_do_cliente == objPost.nombre_regional
                            );
                            if (isNombreRegional.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*pesq.ref:nombre_regional
                                let cacheRegionalClientes = arrCache.filter((j) => j.id == idRegionalClientes);
                                let isRegionalClientes = cacheRegionalClientes[0].data.filter(
                                    (j) => j.UrlJsonContext.RCS_nome_regional == objPost.nombre_regional
                                );
                                if (isRegionalClientes.length == 0) {
                                    //*err:nombre_regional
                                    status_desc = `ERROR: no hay Nombre Regional "${objPost.nombre_regional}" registrado para ${tabExcel} en NIT Cliente "${objPost.nit_cliente}"`;
                                    statusPost.push(`${time}, ${status_desc} \n`);
                                    await postStatus(status_desc, statusPost, data);
                                    return false;
                                }
                                //*obj:nombre_regional
                                objPost.RCSRCS_nome_regional__clsit__regional_do_cliente =
                                    isRegionalClientes.length > 0 ? isRegionalClientes[0].UrlJsonContext.RCS_nome_regional : '';
                                objPost.RCSclsit__regional_do_cliente_id = isRegionalClientes.length > 0 ? isRegionalClientes[0].ID : '';
                                delete objPost.nombre_regional;
                            }

                            //*item:portafolio_cliente
                            let isPcsPortafolioCliente = getTabExcel.filter(
                                (j) => j.UrlJsonContext.PCSPCS_portafolio_cliente__clsit__portifolio_cliente == objPost.portafolio_cliente
                            );
                            if (isPcsPortafolioCliente.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*pesq.ref:portafolio_cliente
                                let cachePortafolioCliente = arrCache.filter((j) => j.id == idPortafolioCliente);
                                let isPortafolioCliente = cachePortafolioCliente[0].data.filter(
                                    (j) => j.UrlJsonContext.PCS_portafolio_cliente == objPost.portafolio_cliente
                                );
                                if (isPortafolioCliente.length == 0) {
                                    //*err:portafolio_cliente
                                    status_desc = `ERROR: no hay Portafolio Cliente "${objPost.portafolio_cliente}" registrado para ${tabExcel} en NIT Cliente "${objPost.nit_cliente}"`;
                                    statusPost.push(`${time}, ${status_desc} \n`);
                                    await postStatus(status_desc, statusPost, data);
                                    return false;
                                }
                                //*obj:portafolio_cliente
                                objPost.PCSPCS_portafolio_cliente__clsit__portifolio_cliente =
                                    isPortafolioCliente.length > 0 ? isPortafolioCliente[0].UrlJsonContext.PCS_portafolio_cliente : '';
                                objPost.PCSclsit__portifolio_cliente_id = isPortafolioCliente.length > 0 ? isPortafolioCliente[0].ID : '';
                                delete objPost.portafolio_cliente;
                            }

                            //*item:portafolio_atc
                            let isPortafolioATC = getTabExcel.filter((j) => j.UrlJsonContext.tppf_tipo_portifolio == objPost.portafolio_atc);
                            if (isPortafolioATC.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:portafolio_atc
                                objPost.tppf_tipo_portifolio = objPost.portafolio_atc;
                                delete objPost.portafolio_atc;
                            }

                            //*item:asset_number
                            let isAssetNumber = getTabExcel.filter((j) => j.UrlJsonContext.asset_number == objPost.asset_number);
                            if (isAssetNumber.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:asset_number
                                objPost.asset_number = objPost.asset_number.toString();
                            }

                            //*item:profit_cost_center
                            let isProfitCostCenter = getTabExcel.filter((j) => j.UrlJsonContext.profit_cost_center == objPost.profit_cost_center);
                            if (isProfitCostCenter.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:profit_cost_center
                                objPost.profit_cost_center = objPost.profit_cost_center.toString();
                            }

                            //*item:nombre_sitio
                            let isNombreSitio = getTabExcel.filter((j) => j.UrlJsonContext.site_name == objPost.nombre_sitio);
                            if (isNombreSitio.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:nombre_sitio
                                objPost.site_name = objPost.nombre_sitio;
                                delete objPost.nombre_sitio;
                            }

                            //*item:compania_atc
                            let isCompaniaATC = getTabExcel.filter((j) => j.UrlJsonContext.emp_atc_site == objPost.compania_atc);
                            if (isCompaniaATC.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:compania_atc
                                objPost.emp_atc_site = objPost.compania_atc;
                                delete objPost.compania_atc;
                            }

                            //*item:municipio
                            let isMunicipio = getTabExcel.filter((j) => j.UrlJsonContext.loca_cida_municipio == objPost.municipio);
                            if (isMunicipio.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:municipio
                                objPost.loca_cida_municipio = objPost.municipio;
                                delete objPost.municipio;
                            }

                            //*item:departamento
                            let isDepartamento = getTabExcel.filter((j) => j.UrlJsonContext.loca_cida_loca_uf_uf == objPost.departamento);
                            if (isDepartamento.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:departamento
                                objPost.loca_cida_loca_uf_uf = objPost.departamento;
                                delete objPost.departamento;
                            }

                            //*item:regional_atc
                            let isRegionalATC = getTabExcel.filter((j) => j.UrlJsonContext.regio_regional == objPost.regional_atc);
                            if (isRegionalATC.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:regional_atc
                                objPost.regio_regional = objPost.regional_atc;
                                delete objPost.regional_atc;
                            }
                        }

                        //*aba:clientes
                        if (tabExcel == 'clientes') {
                            fielNameQ = getKey(tabExcel);
                            valueQ = objPost.COLC_nit_cliente;

                            //*item:nit_cliente
                            let isNITCliente = getTabExcel.filter((j) => j.UrlJsonContext.COLC_nit_cliente == objPost.nit_cliente);
                            if (isNITCliente.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:nit_cliente
                                objPost.COLC_nit_cliente = objPost.nit_cliente.toString();
                                delete objPost.nit_cliente;
                            }

                            //*item:nombre_cliente
                            let isNombreCliente = getTabExcel.filter((j) => j.UrlJsonContext.COLC_nome_cliente == objPost.nombre_cliente);
                            if (isNombreCliente.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:nombre_cliente
                                objPost.COLC_nome_cliente = objPost.nombre_cliente;
                                delete objPost.nombre_cliente;
                            }

                            //*item:nombre_oficial
                            let isNombreOficial = getTabExcel.filter((j) => j.UrlJsonContext.COLC_nome_oficial == objPost.nombre_oficial);
                            if (isNombreOficial.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:nombre_oficial
                                objPost.COLC_nome_oficial = objPost.nombre_oficial;
                                delete objPost.nombre_oficial;
                            }

                            //*item:direccion
                            let isDireccion = getTabExcel.filter((j) => j.UrlJsonContext.COLC_endereco == objPost.direccion);
                            if (isDireccion.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:direccion
                                objPost.COLC_endereco = objPost.direccion;
                                delete objPost.direccion;
                            }

                            //*item:municipio
                            let isColcMunicipio = getTabExcel.filter((j) => j.UrlJsonContext.loca_cida_municipio__COLC_cidade == objPost.municipio);
                            if (isColcMunicipio.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*pesq.ref:municipio
                                let cacheMunicipio = arrCache.filter((j) => j.id == idMunicipio);
                                let isMunicipio = cacheMunicipio[0].data.filter((j) => j.UrlJsonContext.municipio == objPost.municipio);
                                if (isMunicipio.length == 0) {
                                    //*err:municipio
                                    status_desc = `ERROR: no hay Municipio "${objPost.municipio}" registrado para ${tabExcel} en NIT Cliente "${objPost.nit_cliente}"`;
                                    statusPost.push(`${time}, ${status_desc} \n`);
                                    await postStatus(status_desc, statusPost, data);
                                    return false;
                                }
                                //*obj:municipio
                                objPost.loca_cida_municipio__COLC_cidade = isMunicipio.length > 0 ? isMunicipio[0].UrlJsonContext.municipio : '';
                                objPost.loca_cida_COLC_cidade_id = isMunicipio.length > 0 ? isMunicipio[0].ID : '';
                                objPost.loca_cida_loca_uf_uf = isMunicipio.length > 0 ? isMunicipio[0].UrlJsonContext.loca_uf_uf : '';
                                delete objPost.municipio;
                                delete objPost.departamento;
                            }
                        }

                        //*aba:regional_clientes
                        if (tabExcel == 'regional_clientes') {
                            fielNameQ = getKey(tabExcel);
                            valueQ = objPost.RCS_nome_regional;

                            //*id_one_ref:clientes
                            let strFiltro = gerarFiltro('COLC_nit_cliente', objPost.nit_cliente.toString());
                            let paiRegistro = await getOnergyItem(idClientes, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, strFiltro);

                            //*item:nit_cliente
                            let isNITCliente = getTabExcel.filter((j) => j.UrlJsonContext.RCS_nit_cliente == objPost.nit_cliente);
                            if (isNITCliente.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:nit_cliente
                                objPost.ID_ONE_REF = paiRegistro.length > 0 ? paiRegistro[0].ID : '';
                                objPost.RCS_nit_cliente = objPost.nit_cliente.toString();
                                delete objPost.nit_cliente;
                            }

                            //*item:nombre_regional
                            let isNombreRegional = getTabExcel.filter((j) => j.UrlJsonContext.RCS_nome_regional == objPost.nombre_regional);
                            if (isNombreRegional.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:nombre_regional
                                objPost.RCS_nome_regional = objPost.nombre_regional;
                                delete objPost.nombre_regional;
                            }
                        }

                        //*aba:contactos_clientes
                        if (tabExcel == 'contactos_clientes') {
                            fielNameQ = getKey(tabExcel);
                            valueQ = objPost.RCSRCS_nome_regional__CCS_nombre_regional;

                            //*id_one_ref:clientes
                            let strFiltro = gerarFiltro('COLC_nit_cliente', objPost.nit_cliente.toString());
                            let paiRegistro = await getOnergyItem(idClientes, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, strFiltro);

                            //*item:nit_cliente
                            let isNITCliente = getTabExcel.filter((j) => j.UrlJsonContext.CCS_nit_cliente == objPost.nit_cliente);
                            if (isNITCliente.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:nit_cliente
                                objPost.ID_ONE_REF = paiRegistro.length > 0 ? paiRegistro[0].ID : '';
                                objPost.CCS_nit_cliente = objPost.nit_cliente.toString();
                                delete objPost.nit_cliente;
                            }

                            //*item:nombre_regional
                            let isRcsRegionalClientes = getTabExcel.filter(
                                (j) => j.UrlJsonContext.RCSRCS_nome_regional__CCS_nombre_regional == objPost.nombre_regional
                            );
                            if (isRcsRegionalClientes.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*pesq.ref:regional_clientes
                                let cacheRegionalClientes = arrCache.filter((j) => j.id == idRegionalClientes);
                                let isRegionalClientes = cacheRegionalClientes[0].data.filter(
                                    (j) => j.UrlJsonContext.RCS_nome_regional == objPost.nombre_regional
                                );
                                if (isRegionalClientes.length == 0) {
                                    //*err:regional_clientes
                                    status_desc = `ERROR: no hay Nombre Regional "${objPost.nombre_regional}" registrado para ${tabExcel} en NIT Cliente "${objPost.nit_cliente}"`;
                                    statusPost.push(`${time}, ${status_desc} \n`);
                                    await postStatus(status_desc, statusPost, data);
                                    return false;
                                }
                                //*obj:nombre_regional
                                objPost.RCSRCS_nome_regional__CCS_nombre_regional =
                                    isRegionalClientes.length > 0 ? isRegionalClientes[0].UrlJsonContext.RCS_nome_regional : '';
                                objPost.RCSCCS_nombre_regional_id = isRegionalClientes.length > 0 ? isRegionalClientes[0].ID : '';
                                delete objPost.nombre_regional;
                            }

                            //*item:nombre_contacto
                            let isNombreContacto = getTabExcel.filter((j) => j.UrlJsonContext.CCS_nombre_contacto == objPost.nombre_contacto);
                            if (isNombreContacto.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:nombre_contacto
                                objPost.CCS_nombre_contacto = objPost.nombre_contacto;
                                delete objPost.nombre_contacto;
                            }

                            //*item:telefono_celular
                            let isTelefonoCelular = getTabExcel.filter((j) => j.UrlJsonContext.CCS_telefono_celular == objPost.telefono_celular);
                            if (isTelefonoCelular.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:telefono_celular
                                objPost.CCS_telefono_celular = objPost.telefono_celular.toString();
                                delete objPost.telefono_celular;
                            }

                            //*item:telefono_fijo
                            let isTelefonoFijo = getTabExcel.filter((j) => j.UrlJsonContext.CCS_telefono_fijo == objPost.telefono_fijo);
                            if (isTelefonoFijo.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:telefono_fijo
                                objPost.CCS_telefono_fijo = objPost.telefono_fijo.toString();
                                delete objPost.telefono_fijo;
                            }

                            //*item:correo_electronico
                            let isCorreoElectronico = getTabExcel.filter((j) => j.UrlJsonContext.CCS_correo_eletronico == objPost.correo_electronico);
                            if (isCorreoElectronico.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:correo_electronico
                                objPost.CCS_correo_eletronico = objPost.correo_electronico.toString();
                                delete objPost.correo_electronico;
                            }
                        }

                        //*aba:portafolio_clientes
                        if (tabExcel == 'portafolio_clientes') {
                            fielNameQ = getKey(tabExcel);
                            valueQ = objPost.PCS_portafolio_cliente;

                            //*id_one_ref:clientes
                            let strFiltro = gerarFiltro('COLC_nit_cliente', objPost.nit_cliente.toString());
                            let paiRegistro = await getOnergyItem(idClientes, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, strFiltro);

                            //*item:nit_cliente
                            let isNITCliente = getTabExcel.filter((j) => j.UrlJsonContext.PCS_nit_cliente == objPost.nit_cliente);
                            if (isNITCliente.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:nit_cliente
                                objPost.ID_ONE_REF = paiRegistro.length > 0 ? paiRegistro[0].ID : '';
                                objPost.PCS_nit_cliente = objPost.nit_cliente.toString();
                                delete objPost.nit_cliente;
                            }

                            //*item:portafolio_cliente
                            let isPortafolioCliente = getTabExcel.filter((j) => j.UrlJsonContext.PCS_portafolio_cliente == objPost.portafolio_cliente);
                            if (isPortafolioCliente.length == 0 || data.em_caso_de_duplicidade == '1') {
                                //*obj:portafolio_cliente
                                objPost.PCS_portafolio_cliente = objPost.portafolio_cliente;
                                delete objPost.portafolio_cliente;
                            }
                        }

                        //*save
                        let update = false;
                        let id = '';
                        let r = getTabExcel.find((x) => x['UrlJsonContext'][fielNameQ] == valueQ);
                        update = r ? true : false;
                        if (update) id = r.ID;
                        await gravarRegistro(idTabExcel, objPost, data, update, id);

                        //*postSave
                        dataHoje = new Date();
                        time = gerarDataHora(dataHoje, -5); //?Bogota
                        status_desc = `OK: ${tabExcel} - ${getKey(tabExcel, true)} - ${JSON.stringify(valueQ)}`;
                        statusPost.push(`${time}, ${status_desc} \n`);
                        await postStatus(status_desc, statusPost, data);
                    }

                    //*limpar cache
                    arrCache.length = 0;
                } else {
                    //*err:arrPost.length > 0
                    dataHoje = new Date();
                    time = gerarDataHora(dataHoje, -5); //?Bogota
                    status_desc = `ERROR: los datos de ${tabExcel} no fueron procesados`;
                    statusPost.push(`${time}, ${status_desc} \n`);
                    await postStatus(status_desc, statusPost, data);
                    return false;
                }
            } else {
                //*err:ctxExcel.length > 0
                dataHoje = new Date();
                time = gerarDataHora(dataHoje, -5); //?Bogota
                status_desc = `ERROR: no se encontraron datos en ${tabExcel}`;
                statusPost.push(`${time}, ${status_desc} \n`);
                await postStatus(status_desc, statusPost, data);
                return false;
            }
        } else {
            //*err:dataExcel != null
            dataHoje = new Date();
            time = gerarDataHora(dataHoje, -5); //?Bogota
            status_desc = `ERROR: No hay registros en ${nomePlanilha}`;
            statusPost.push(`${time}, ${status_desc} \n`);
            await postStatus(status_desc, statusPost, data);
            return false;
        }
    } else {
        //*err:cargaIndiceNome == tabExcel
        dataHoje = new Date();
        time = gerarDataHora(dataHoje, -5); //?Bogota
        status_desc = `ERROR: El índice carga ${cargaIndiceNome} no coincide con ${tabExcel}`;
        statusPost.push(`${time}, ${status_desc} \n`);
        await postStatus(status_desc, statusPost, data);
        return false;
    }

    //*status:done
    dataHoje = new Date();
    time = gerarDataHora(dataHoje, -5); //?Bogota
    status_desc = `Carga de ${tabExcel} finalizada`;
    statusPost.push(`${time}, ${status_desc} \n`);
    await postStatus(status_desc, statusPost, data);

    // return true;
    return SetObjectResponse(true, data, true);
}

// eslint-disable-next-line no-unused-vars
function initBefore(json) {
    //return true;
}

// eslint-disable-next-line no-unused-vars
function initDelete(json) {
    //return true;
}

function SetObjectResponse(cond, json, WaitingWebHook) {
    if (WaitingWebHook == undefined) WaitingWebHook = false;
    let obj = {
        cond: cond,
        json: JSON.stringify(json),
        WaitingWebHook: WaitingWebHook,
    };
    return obj;
}

async function getOnergyItem(fdtid, assid, usrid, filtro, fedid) {
    let keepSearching = true;
    let skip = 0;
    let take = 500;
    let result = [];
    while (keepSearching) {
        let onergyGetObj = {
            fdtid: fdtid,
            assid: assid,
            usrid: usrid,
            filter: filtro,
            skip: skip,
            take: take,
        };
        if (fedid) {
            onergyGetObj.fedid = fedid;
        }
        let strPageResp = await onergy_get(onergyGetObj);
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

async function postStatus(status_desc, statusPost, data) {
    const idCargaGeral = '181c67a8-e7a9-4c9a-9ea1-ca4719c0e23f';

    //*envia update para registro de carga
    let postInfo = {
        processamento: status_desc,
        horas: data.time,
        processo: statusPost,
    };
    onergy.log(`JFS ~ postInfo: ${JSON.stringify(postInfo.processamento)}`);

    //!node:test (return true)
    // return true;
    let valueQ = data.id_upload_planilha;
    let result = await gravarRegistro(idCargaGeral, postInfo, data, true, valueQ);
    return result;
}

async function gravarRegistro(idTabExcel, objPost, data, update, id) {
    //*se houver registro, atualizar
    if (update) {
        let postInfo = {
            UrlJsonContext: objPost,
        };
        let result = await onergy_updatemany({
            fdtid: idTabExcel,
            assid: data.onergy_js_ctx.assid,
            usrid: data.onergy_js_ctx.usrid,
            id: id,
            data: JSON.stringify(postInfo),
        });
        return result;
    } else {
        //*se não houver registro, criar
        let result = await onergy_save({
            fdtid: idTabExcel,
            usrid: data.onergy_js_ctx.usrid,
            assid: data.onergy_js_ctx.assid,
            data: JSON.stringify(objPost),
        });
        return result;
    }
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
    let horaTimezone24h = horaTimezone > 24 ? horaTimezone - 24 : horaTimezone;
    horaTimezone24h = horaTimezone24h < 0 ? horaTimezone24h + 24 : horaTimezone24h;
    let horaTimezoneFormat = JSON.stringify(horaTimezone24h).padStart(2, '0') + ':' + arrayHora[1].padStart(2, '0') + ':' + arrayHora[2].padStart(2, '0');
    return dataHojeFormatada + ' ' + horaTimezoneFormat;
}

function removeDuplicados(ctxExcel, tabExcel) {
    let key = getKey(tabExcel, true);
    return ctxExcel.filter((v, i, a) => a.findIndex((v2) => v2[key] === v[key]) === i);
}

function getKey(tabExcel, isRemoveDuplicados) {
    let key = '';
    let key_es = '';
    if (tabExcel == 'categorias') {
        key = 'categorias';
        key_es = 'categorias';
    }
    if (tabExcel == 'departamento') {
        key = 'uf';
        key_es = 'departamento';
    }
    if (tabExcel == 'municipio') {
        key = 'municipio';
        key_es = 'municipio';
    }
    if (tabExcel == 'compania_atc') {
        key = 'site';
        key_es = 'compania_atc';
    }
    if (tabExcel == 'suscriptor') {
        key = 'suscriptor';
        key_es = 'suscriptor';
    }
    if (tabExcel == 'forma_pago') {
        key = 'formas_de_pagamentos';
        key_es = 'forma_pago';
    }
    if (tabExcel == 'frecuencia_pago') {
        key = 'frequencia';
        key_es = 'frecuencia_pago';
    }
    if (tabExcel == 'lecturas') {
        key = 'LCT_ferramentas';
        key_es = 'herramientas';
    }
    if (tabExcel == 'motogenerador') {
        key = 'ger_gerador';
        key_es = 'motogenerador';
    }
    if (tabExcel == 'tablero_independiente') {
        key = 'dir_diretoria_independente';
        key_es = 'tablero_independiente';
    }
    if (tabExcel == 'barter') {
        key = 'esc_escambo';
        key_es = 'barter';
    }
    if (tabExcel == 'provisional') {
        key = 'pro_provisorio';
        key_es = 'provisional';
    }
    if (tabExcel == 'portafolio_atc') {
        key = 'tipo_portifolio';
        key_es = 'portafolio_atc';
    }
    if (tabExcel == 'regional_atc') {
        key = 'regional';
        key_es = 'regional_atc';
    }
    if (tabExcel == 'servicios') {
        key = 'servicos';
        key_es = 'servicios';
    }
    if (tabExcel == 'estado_cuenta') {
        key = 'status_conta';
        key_es = 'estado_cuenta';
    }
    if (tabExcel == 'estado_sitio') {
        key = 'status';
        key_es = 'estado_sitio';
    }
    if (tabExcel == 'sujeto_pasivo') {
        key = 'sujeito';
        key_es = 'sujeto_pasivo';
    }
    if (tabExcel == 'tipo_cobro') {
        key = 'tipos_cobrancas';
        key_es = 'tipo_cobro';
    }
    if (tabExcel == 'tipo_tercero') {
        key = 'tipo_de_terceiro';
        key_es = 'tipo_tercero';
    }
    if (tabExcel == 'tipo_acceso') {
        key = 'tipo_de_acesso';
        key_es = 'tipo_acceso';
    }
    if (tabExcel == 'tipo_cuenta') {
        key = 'TC_tipo_de_conta';
        key_es = 'tipo_cuenta';
    }
    if (tabExcel == 'estrato') {
        key = 'LST_estrato';
        key_es = 'estrato';
    }
    if (tabExcel == 'nivel_tension') {
        key = 'NVT_nivel';
        key_es = 'nivel_tension';
    }
    if (tabExcel == 'clasificacion_passthru') {
        key = 'classificacao_passthru';
        key_es = 'clasificacion_passthru';
    }
    if (tabExcel == 'proveedores') {
        key = 'nit_provedor';
        key_es = 'nit_proveedor';
    }
    if (tabExcel == 'sitios') {
        key = 'asset_number';
        key_es = 'asset_number';
    }
    if (tabExcel == 'informacion_cuenta') {
        key = 'conta_interna_nic';
        key_es = 'cuenta_interna_nic';
    }
    if (tabExcel == 'informacion_tecnica') {
        key = 'asset_number';
        key_es = 'asset_number';
    }
    if (tabExcel == 'clientes_sitio') {
        key = 'asset_number';
        key_es = 'asset_number';
    }
    if (tabExcel == 'clientes') {
        key = 'COLC_nit_cliente';
        key_es = 'nit_cliente';
    }
    if (tabExcel == 'regional_clientes') {
        key = 'RCS_nome_regional';
        key_es = 'nombre_regional';
    }
    if (tabExcel == 'contactos_clientes') {
        key = 'RCSRCS_nome_regional__CCS_nombre_regional';
        key_es = 'nit_cliente';
    }
    if (tabExcel == 'portafolio_clientes') {
        key = 'PCS_portafolio_cliente';
        key_es = 'portafolio_cliente';
    }
    if (isRemoveDuplicados) {
        return key_es;
    } else {
        return key;
    }
}
/******************** MET_PADRAO ********************
 ******************** JSON_INIT ********************
 */
// eslint-disable-next-line no-unused-vars
const json_homol = {
    processo: '',
    horas: '',
    dataDate: '2023-01-17T12:00:05Z',
    data: '2023-01-17 09:00:05',
    load_index_equipe: 'COL',
    load_index_id_equipe: '',
    load_index_id_do_card: '1e6d6595-083f-4bb8-b82c-e9054e9dc8f3',
    planilha: [
        {
            Url: 'https://onebackupservices.blob.core.windows.net/67c0b77d-abae-4c48-ba4b-6c8faf27e14a/tablas_maestras_produccion_v4.xlsx08392f75-231f-4231-9cc5-15610a2f362f.xlsx?sv=2018-03-28&sr=b&sig=Cp9dtxHc287k%2BR2u1c%2FkyjCgAMhgZiKVQg2SEcaNL50%3D&se=2023-08-05T11%3A59%3A53Z&sp=r',
            UrlAzure:
                'https://onebackupservices.blob.core.windows.net/67c0b77d-abae-4c48-ba4b-6c8faf27e14a/tablas_maestras_produccion_v4.xlsx08392f75-231f-4231-9cc5-15610a2f362f.xlsx?sv=2018-03-28&sr=b&sig=Cp9dtxHc287k%2BR2u1c%2FkyjCgAMhgZiKVQg2SEcaNL50%3D&se=2023-08-05T11%3A59%3A53Z&sp=r',
            Name: 'tablas_maestras_produccion_v4.xlsx',
        },
    ],
    load_index_tab_excel: 'informacion_cuenta',
    load_index_id: '1a86654a-fda1-413f-9b84-1ab4c46918b0',
    em_caso_de_duplicidade: '1',
    processamento: 'Carga de informacion_cuenta iniciada',
    time: '8:59',
    em_caso_de_duplicidade_desc: 'Sobrescribir',
    oneTemplateTitle: '',
    ass_id: '67c0b77d-abae-4c48-ba4b-6c8faf27e14a',
    assid: '67c0b77d-abae-4c48-ba4b-6c8faf27e14a',
    fedid: '3a9a3c1a-119f-4577-8e03-25cb496f94d1',
    fdtid: '0e8dc4f0-4a4f-4fb1-8268-423b45128203',
    usrid: '1ec86197-d331-483a-b325-62cc26433ea5',
    email: 'adm@atc.com.br',
    onergy_rolid: '',
    timezone: null,
    onergy_js_ctx: {
        assid: '67c0b77d-abae-4c48-ba4b-6c8faf27e14a',
        fedid: '3a9a3c1a-119f-4577-8e03-25cb496f94d1',
        fdtid: '0e8dc4f0-4a4f-4fb1-8268-423b45128203',
        usrid: '1ec86197-d331-483a-b325-62cc26433ea5',
        insertDt: '2023-01-17T12:00:04.939Z',
        updateDt: '2023-01-17T12:00:04.939Z',
        cur_userid: '1ec86197-d331-483a-b325-62cc26433ea5',
        email: 'adm@atc.com.br',
        user_name: 'ADM ATC',
        onergy_rolid: '',
        praid: 'd03ac164-46fa-4590-ab1c-af048bc2b562',
        pcvid: 'b5a97f81-7636-4bc5-88e7-3f2ce426d9f8',
        prcid: '0da6dd0d-3707-0c6c-c387-0a332c9bce38',
        timezone: null,
        timezone_value: '-03:00',
        pubNubHook: null,
    },
    id_upload_planilha: '45e87872-ba5b-bb7a-1678-d925e7a38b51',
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
init(JSON.stringify(json_prod));
