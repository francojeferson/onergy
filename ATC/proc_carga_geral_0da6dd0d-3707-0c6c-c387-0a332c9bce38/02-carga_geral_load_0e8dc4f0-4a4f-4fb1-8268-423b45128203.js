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
 * Executar automático quando em processo: Não
 * Atividade de longa duração: Não
 * Esconder Menu: Não
 * Condicional: nenhum
 * Aprovação: nenhum
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
    let idTabExcel = data.load_index_id_do_card;
    let idIndiceCarga = '9a6e262f-e463-4c5d-9d8b-0fd8343b2f02';
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

            //*se não existir conteúdo na planilha, gera erro
            if (ctxExcel.length > 0) {
                // //*status:inicio
                // dataHoje = new Date();
                // time = gerarDataHora(dataHoje, -5); //?Bogota
                // status_desc = `Cargando ${ctxExcel.length} registros de ${tabExcel}`;
                // statusPost.push(`${time}, ${status_desc}`);
                // await postStatus(status_desc, statusPost, data);
                // statusPost = statusPost.concat('\n');

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
                        } else {
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
                    statusPost.push(`${time}, ${status_desc}`);
                    await postStatus(status_desc, statusPost, data);
                    statusPost = statusPost.concat('\n');

                    //*consulta campos(itens) de cada grid(aba)
                    let getTabExcel = await getOnergyItem(idTabExcel, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);

                    //*para cada linha do array de post, verifica se existe registro no grid destino
                    for (let y in arrPost) {
                        let objPost = arrPost[y];
                        objPost.onergyteam_equipe = objPost.equipe;
                        objPost.onergyteam_id = objPost.id_equipe_txt;
                        delete objPost.id_equipe_txt;

                        //*aba:categorias
                        if (tabExcel == 'categorias') {
                            //*item:categorias
                            let isCategorias = getTabExcel.filter((j) => j.UrlJsonContext.categorias == objPost.categorias);
                            if (isCategorias.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.categorias = objPost.categorias;
                            }

                            let result = await gravarRegistro('categorias', objPost.categorias, idTabExcel, objPost, data);
                        }

                        //*aba:departamento
                        if (tabExcel == 'departamento') {
                            //*item:departamento
                            let isDepartamento = getTabExcel.filter((j) => j.UrlJsonContext.uf == objPost.departamento);
                            if (isDepartamento.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.uf = objPost.departamento;
                                objPost.estado = objPost.departamento_sigla;
                                delete objPost.departamento_sigla;
                                delete objPost.departamento;
                            }

                            let result = await gravarRegistro('uf', objPost.uf, idTabExcel, objPost, data);
                        }

                        //*aba:municipio
                        if (tabExcel == 'municipio') {
                            //*pesq.ref:departamento
                            let idDepartamento = '132b8394-2193-4d83-a399-08f4cde70873';
                            let getDepartamento = await getOnergyItem(idDepartamento, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
                            let isDepartamento = getDepartamento.filter((j) => j.UrlJsonContext.uf == objPost.departamento);
                            if (isDepartamento.length == 0) {
                                status_desc = `ERROR: no hay "${objPost.departamento}" registrado para ${tabExcel} de "${objPost.municipio}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                await postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }
                            //*item:municipio, departamento
                            let isMunicipio = getTabExcel.filter((j) => j.UrlJsonContext.municipio == objPost.municipio);
                            if (isMunicipio.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.loca_uf_uf = isDepartamento.length > 0 ? isDepartamento[0].UrlJsonContext.uf : '';
                                objPost.loca_uf_id = isDepartamento.length > 0 ? isDepartamento[0].ID : '';
                                objPost.municipio = objPost.municipio;
                                delete objPost.departamento;
                            }

                            let result = await gravarRegistro('municipio', objPost.municipio, idTabExcel, objPost, data);
                        }

                        //*aba:compania_atc
                        if (tabExcel == 'compania_atc') {
                            //*item:compania_atc
                            let isCompaniaATC = getTabExcel.filter((j) => j.UrlJsonContext.site == objPost.compania_atc);
                            if (isCompaniaATC.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.site = objPost.compania_atc;
                                delete objPost.compania_atc;
                            }

                            let result = await gravarRegistro('site', objPost.site, idTabExcel, objPost, data);
                        }

                        //*aba:suscriptor
                        if (tabExcel == 'suscriptor') {
                            //*item:suscriptor
                            let isSuscriptor = getTabExcel.filter((j) => j.UrlJsonContext.sus__suscriptor == objPost.suscriptor);
                            if (isSuscriptor.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.sus__suscriptor = objPost.suscriptor;
                                delete objPost.suscriptor;
                            }

                            let result = await gravarRegistro('suscriptor', objPost.sus__suscriptor, idTabExcel, objPost, data);
                        }

                        //*aba:forma_pago
                        if (tabExcel == 'forma_pago') {
                            //*item:forma_pago
                            let isFormaPago = getTabExcel.filter((j) => j.UrlJsonContext.formas_de_pagamentos == objPost.forma_pago);
                            if (isFormaPago.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.formas_de_pagamentos = objPost.forma_pago;
                                delete objPost.forma_pago;
                            }

                            let result = await gravarRegistro('formas_de_pagamentos', objPost.formas_de_pagamentos, idTabExcel, objPost, data);
                        }

                        //*aba:frecuencia_pago
                        if (tabExcel == 'frecuencia_pago') {
                            //*item:frecuencia_pago
                            let isFrequencia = getTabExcel.filter((j) => j.UrlJsonContext.frequencia == objPost.frecuencia_pago);
                            if (isFrequencia.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.frequencia = objPost.frecuencia_pago;
                                delete objPost.frecuencia_pago;
                            }
                            //*item:frecuencia_meses
                            let isFrequenciaMeses = getTabExcel.filter((j) => j.UrlJsonContext.frequencia_em_meses == objPost.frecuencia_meses);
                            if (isFrequenciaMeses.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.frequencia_em_meses = objPost.frecuencia_meses;
                                delete objPost.frecuencia_meses;
                            }

                            let result = await gravarRegistro('frequencia', objPost.frequencia_em_meses, idTabExcel, objPost, data);
                        }

                        //*aba:lecturas
                        if (tabExcel == 'lecturas') {
                            //*item:herramientas
                            let isLecturas = getTabExcel.filter((j) => j.UrlJsonContext.LCT_ferramentas == objPost.herramientas);
                            if (isLecturas.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.LCT_ferramentas = objPost.herramientas;
                                delete objPost.herramientas;
                            }

                            let result = await gravarRegistro('LCT_ferramentas', objPost.LCT_ferramentas, idTabExcel, objPost, data);
                        }

                        //*aba:motogenerador
                        if (tabExcel == 'motogenerador') {
                            //*item:motogenerador
                            let isMotogenerador = getTabExcel.filter((j) => j.UrlJsonContext.ger_gerador == objPost.motogenerador);
                            if (isMotogenerador.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.ger_gerador = objPost.motogenerador;
                                delete objPost.motogenerador;
                            }

                            let result = await gravarRegistro('ger_gerador', objPost.ger_gerador, idTabExcel, objPost, data);
                        }

                        //*aba:tablero_independiente
                        if (tabExcel == 'tablero_independiente') {
                            //*item:tablero_independiente
                            let isTableroIndependiente = getTabExcel.filter(
                                (j) => j.UrlJsonContext.dir_diretoria_independente == objPost.tablero_independiente
                            );
                            if (isTableroIndependiente.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.dir_diretoria_independente = objPost.tablero_independiente;
                                delete objPost.tablero_independiente;
                            }

                            let result = await gravarRegistro('dir_diretoria_independente', objPost.dir_diretoria_independente, idTabExcel, objPost, data);
                        }

                        //*aba:barter
                        if (tabExcel == 'barter') {
                            //*item:barter
                            let isBarter = getTabExcel.filter((j) => j.UrlJsonContext.esc_escambo == objPost.barter);
                            if (isBarter.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.esc_escambo = objPost.barter;
                                delete objPost.barter;
                            }

                            let result = await gravarRegistro('esc_escambo', objPost.esc_escambo, idTabExcel, objPost, data);
                        }

                        //*aba:provisional
                        if (tabExcel == 'provisional') {
                            //*item:provisional
                            let isProvisional = getTabExcel.filter((j) => j.UrlJsonContext.pro_provisorio == objPost.provisional);
                            if (isProvisional.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.pro_provisorio = objPost.provisional;
                                delete objPost.provisional;
                            }

                            let result = await gravarRegistro('pro_provisorio', objPost.pro_provisorio, idTabExcel, objPost, data);
                        }

                        //*aba:portafolio_atc
                        if (tabExcel == 'portafolio_atc') {
                            //*item:portafolio_atc
                            let isPortafolioATC = getTabExcel.filter((j) => j.UrlJsonContext.tipo_portifolio == objPost.portafolio_atc);
                            if (isPortafolioATC.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.tipo_portifolio = objPost.portafolio_atc;
                                delete objPost.portafolio_atc;
                            }

                            let result = await gravarRegistro('tipo_portifolio', objPost.tipo_portifolio, idTabExcel, objPost, data);
                        }

                        //*aba:regional_atc
                        if (tabExcel == 'regional_atc') {
                            //*item:regional_atc
                            let isRegionalATC = getTabExcel.filter((j) => j.UrlJsonContext.regional == objPost.regional_atc);
                            if (isRegionalATC.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.regional = objPost.regional_atc;
                                delete objPost.regional_atc;
                            }

                            let result = await gravarRegistro('regional', objPost.regional, idTabExcel, objPost, data);
                        }

                        //*aba:servicios
                        if (tabExcel == 'servicios') {
                            //*item:servicios
                            let isServicios = getTabExcel.filter((j) => j.UrlJsonContext.servicos == objPost.servicios);
                            if (isServicios.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.servicos = objPost.servicios;
                                delete objPost.servicios;
                            }

                            let result = await gravarRegistro('servicos', objPost.servicos, idTabExcel, objPost, data);
                        }

                        //*aba:estado_cuenta
                        if (tabExcel == 'estado_cuenta') {
                            //*item:estado_cuenta
                            let isEstadoCuenta = getTabExcel.filter((j) => j.UrlJsonContext.status_conta == objPost.estado_cuenta);
                            if (isEstadoCuenta.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.status_conta = objPost.estado_cuenta;
                                delete objPost.estado_cuenta;
                            }

                            let result = await gravarRegistro('status_conta', objPost.status_conta, idTabExcel, objPost, data);
                        }

                        //*aba:estado_sitio
                        if (tabExcel == 'estado_sitio') {
                            //*item:estado_sitio
                            let isEstadoSitio = getTabExcel.filter((j) => j.UrlJsonContext.status == objPost.estado_sitio);
                            if (isEstadoSitio.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.status = objPost.estado_sitio;
                                delete objPost.estado_sitio;
                            }

                            let result = await gravarRegistro('status', objPost.status, idTabExcel, objPost, data);
                        }

                        //*aba:sujeto_pasivo
                        if (tabExcel == 'sujeto_pasivo') {
                            //*item:sujeto_pasivo
                            let isSujetoPasivo = getTabExcel.filter((j) => j.UrlJsonContext.sujeito == objPost.sujeto_pasivo);
                            if (isSujetoPasivo.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.sujeito = objPost.sujeto_pasivo;
                                delete objPost.sujeto_pasivo;
                            }

                            let result = await gravarRegistro('sujeito', objPost.sujeito, idTabExcel, objPost, data);
                        }

                        //*aba:tipo_cobro
                        if (tabExcel == 'tipo_cobro') {
                            //*item:tipo_cobro
                            let isTipoCobro = getTabExcel.filter((j) => j.UrlJsonContext.tipos_cobrancas == objPost.tipo_cobro);
                            if (isTipoCobro.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.tipos_cobrancas = objPost.tipo_cobro;
                                delete objPost.tipo_cobro;
                            }

                            let result = await gravarRegistro('tipos_cobrancas', objPost.tipos_cobrancas, idTabExcel, objPost, data);
                        }

                        //*aba:tipo_tercero
                        if (tabExcel == 'tipo_tercero') {
                            //*item:tipo_tercero
                            let isTipoTercero = getTabExcel.filter((j) => j.UrlJsonContext.tipo_de_terceiro == objPost.tipo_tercero);
                            if (isTipoTercero.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.tipo_de_terceiro = objPost.tipo_tercero;
                                delete objPost.tipo_tercero;
                            }

                            let result = await gravarRegistro('tipo_de_terceiro', objPost.tipo_de_terceiro, idTabExcel, objPost, data);
                        }

                        //*aba:tipo_acceso
                        if (tabExcel == 'tipo_acceso') {
                            //*item:tipo_acceso
                            let isTipoAcesso = getTabExcel.filter((j) => j.UrlJsonContext.tipo_de_acesso == objPost.tipo_acceso);
                            if (isTipoAcesso.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.tipo_de_acesso = objPost.tipo_acceso;
                                delete objPost.tipo_acceso;
                            }

                            let result = await gravarRegistro('tipo_de_acesso', objPost.tipo_de_acesso, idTabExcel, objPost, data);
                        }

                        //*aba:tipo_cuenta
                        if (tabExcel == 'tipo_cuenta') {
                            //*item:tipo_cuenta
                            let isTipoCuenta = getTabExcel.filter((j) => j.UrlJsonContext.TC_tipo_de_conta == objPost.tipo_cuenta);
                            if (isTipoCuenta.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.TC_tipo_de_conta = objPost.tipo_cuenta;
                                delete objPost.tipo_cuenta;
                            }

                            let result = await gravarRegistro('TC_tipo_de_conta', objPost.TC_tipo_de_conta, idTabExcel, objPost, data);
                        }

                        //*aba:estrato
                        if (tabExcel == 'estrato') {
                            //*item:estrato
                            let isEstrato = getTabExcel.filter((j) => j.UrlJsonContext.LST_estrato == objPost.estrato);
                            if (isEstrato.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.LST_estrato = objPost.estrato;
                                delete objPost.estrato;
                            }

                            let result = await gravarRegistro('LST_estrato', objPost.LST_estrato, idTabExcel, objPost, data);
                        }

                        //*aba:nivel_tension
                        if (tabExcel == 'nivel_tension') {
                            //*item:nivel_tension
                            let isNivelTension = getTabExcel.filter((j) => j.UrlJsonContext.NVT_nivel == objPost.nivel_tension);
                            if (isNivelTension.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.NVT_nivel = objPost.nivel_tension;
                                delete objPost.nivel_tension;
                            }

                            let result = await gravarRegistro('NVT_nivel', objPost.NVT_nivel, idTabExcel, objPost, data);
                        }

                        //*aba:clasificacion_passthru
                        if (tabExcel == 'clasificacion_passthru') {
                            //*item:clasificacion_passthru
                            let isClasificacionPassthru = getTabExcel.filter((j) => j.UrlJsonContext.classificacao_passthru == objPost.clasificacion_passthru);
                            if (isClasificacionPassthru.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.classificacao_passthru = objPost.clasificacion_passthru;
                                delete objPost.clasificacion_passthru;
                            }
                            //*lst.susp:tiene_passthru
                            objPost.tiene_passthru = objPost.tiene_passthru == 'SI' ? 'si' : 'no';
                            let isTienePassthru = getTabExcel.filter((j) => j.UrlJsonContext.CPT_tem_passthru == objPost.tiene_passthru);
                            if (isTienePassthru.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.CPT_tem_passthru = objPost.tiene_passthru;
                                objPost.CPT_tem_passthru_desc = objPost.tiene_passthru == 'si' ? 'Si' : 'No';
                                delete objPost.tiene_passthru;
                            }

                            let result = await gravarRegistro('classificacao_passthru', objPost.CPT_tem_passthru, idTabExcel, objPost, data);
                        }

                        //*aba:proveedores
                        if (tabExcel == 'proveedores') {
                            //*item:nit_proveedor
                            let isNITProveedor = getTabExcel.filter((j) => j.UrlJsonContext.nit_provedor == objPost.nit_proveedor);
                            if (isNITProveedor.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.nit_provedor = objPost.nit_proveedor.toString();
                                delete objPost.nit_proveedor;
                            }
                            //*item:nombre_proveedor
                            let isNombreProveedor = getTabExcel.filter((j) => j.UrlJsonContext.nome_provedor == objPost.nombre_proveedor);
                            if (isNombreProveedor.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.nome_provedor = objPost.nombre_proveedor;
                                delete objPost.nombre_proveedor;
                            }
                            //*item:nit_beneficiario
                            let isNITBeneficiario = getTabExcel.filter((j) => j.UrlJsonContext.nit_beneficiario == objPost.nit_beneficiario);
                            if (isNITBeneficiario.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.nit_beneficiario = objPost.nit_beneficiario.toString();
                            }
                            //*item:nombre_beneficiario
                            let isNombreBeneficiario = getTabExcel.filter((j) => j.UrlJsonContext.beneficiario == objPost.nombre_beneficiario);
                            if (isNombreBeneficiario.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.beneficiario = objPost.nombre_beneficiario;
                                delete objPost.nombre_beneficiario;
                            }
                            //*pesq.ref:tipo_tercero
                            let idTipoTercero = '70110b99-aa96-4e25-b1b2-177484668700';
                            let getTipoTercero = await getOnergyItem(idTipoTercero, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
                            let isTipoTercero = getTipoTercero.filter((j) => j.UrlJsonContext.tipo_de_terceiro == objPost.tipo_tercero);
                            if (isTipoTercero.length == 0) {
                                status_desc = `ERROR: no hay "${objPost.tipo_tercero}" registrado para ${tabExcel} de "${objPost.nit_proveedor}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                await postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }
                            //*item:tipo_tercero
                            let isPrvdTipoTercero = getTabExcel.filter((j) => j.UrlJsonContext.tp3o_tipo_de_terceiro == objPost.tipo_tercero);
                            if (isPrvdTipoTercero.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.tp3o_tipo_de_terceiro = isTipoTercero.length > 0 ? isTipoTercero[0].UrlJsonContext.tipo_de_terceiro : '';
                                objPost.tp3o_id = isTipoTercero.length > 0 ? isTipoTercero[0].ID : '';
                                delete objPost.tipo_tercero;
                            }
                            //*item:nombre_comercial
                            let isNombreComercial = getTabExcel.filter((j) => j.UrlJsonContext.nome_comercial == objPost.nombre_comercial);
                            if (isNombreComercial.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.nome_comercial = objPost.nombre_comercial;
                                delete objPost.nombre_comercial;
                            }
                            //*lst.susp:tiene_cuenta_padre
                            objPost.tiene_cuenta_padre = objPost.tiene_cuenta_padre == 'SI' ? 'sim' : 'nao';
                            let isTieneCuentaPadre = getTabExcel.filter((j) => j.UrlJsonContext.prvd__tem_conta_pai == objPost.tiene_cuenta_padre);
                            if (isTieneCuentaPadre.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.prvd__tem_conta_pai = objPost.tiene_cuenta_padre;
                                objPost.prvd__tem_conta_pai_desc = objPost.tiene_cuenta_padre == 'sim' ? 'Sim' : 'Não';
                                delete objPost.tiene_cuenta_padre;
                            }
                            //*pesq.ref:tipo_acceso
                            let idTipoAcceso = '62e9a129-73b5-4819-9c16-f1d4bdababde';
                            let getTipoAcceso = await getOnergyItem(idTipoAcceso, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
                            let isTipoAcceso = getTipoAcceso.filter((j) => j.UrlJsonContext.tipo_de_acesso == objPost.tipo_acceso);
                            if (isTipoAcceso.length == 0) {
                                status_desc = `ERROR: no hay "${objPost.tipo_acceso}" registrado para ${tabExcel} de "${objPost.nit_proveedor}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                await postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }
                            //*item:tipo_acceso
                            let isPrvdTipoAcceso = getTabExcel.filter((j) => j.UrlJsonContext.tp_acces_tipo_de_acesso == objPost.tipo_acceso);
                            if (isPrvdTipoAcceso.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.tp_acces_tipo_de_acesso = isTipoAcceso.length > 0 ? isTipoAcceso[0].UrlJsonContext.tipo_de_acesso : '';
                                objPost.tp_acces_id = isTipoAcceso.length > 0 ? isTipoAcceso[0].ID : '';
                                delete objPost.tipo_acceso;
                            }
                            //*item:apodo_proveedor
                            let isApodoProveedor = getTabExcel.filter((j) => j.UrlJsonContext.apelido_provedor == objPost.apodo_proveedor);
                            if (isApodoProveedor.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.apelido_provedor = objPost.apodo_proveedor;
                                delete objPost.apodo_proveedor;
                            }
                            //*item:link_web
                            let isLinkWeb = getTabExcel.filter((j) => j.UrlJsonContext.link_web == objPost.link_web);
                            if (isLinkWeb.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.link_web = objPost.link_web;
                            }
                            //*item:usuario
                            let isUsuario = getTabExcel.filter((j) => j.UrlJsonContext.usuario == objPost.usuario);
                            if (isUsuario.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.usuario = objPost.usuario;
                            }
                            //*item:contrasena
                            let isContrasena = getTabExcel.filter((j) => j.UrlJsonContext.senha == objPost.contrasena);
                            if (isContrasena.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.senha = objPost.contrasena;
                                delete objPost.contrasena;
                            }

                            let result = await gravarRegistro('nit_provedor', objPost.nit_provedor, idTabExcel, objPost, data);
                        }

                        //*aba:sitios
                        if (tabExcel == 'sitios') {
                            objPost.modificado_por = data.email;
                            objPost.modificado_em = data.data;
                            //*item:asset_number
                            let isAssetNumber = getTabExcel.filter((j) => j.UrlJsonContext.asset_number == objPost.asset_number);
                            if (isAssetNumber.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.asset_number = objPost.asset_number.toString();
                            }
                            //*item:profit_cost_center
                            let isProfitCostCenter = getTabExcel.filter((j) => j.UrlJsonContext.profit_cost_center == objPost.profit_cost_center);
                            if (isProfitCostCenter.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.profit_cost_center = objPost.profit_cost_center.toString();
                            }
                            //*item:nombre_sitio
                            let isNombreSitio = getTabExcel.filter((j) => j.UrlJsonContext.site_name == objPost.nombre_sitio);
                            if (isNombreSitio.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.site_name = objPost.nombre_sitio;
                                delete objPost.nombre_sitio;
                            }
                            //*pesq.ref:compania_atc
                            let idCompaniaATC = '8803f10a-9c32-4c4f-8bd6-8e959ed24277';
                            let getCompaniaATC = await getOnergyItem(idCompaniaATC, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
                            let isCompaniaATC = getCompaniaATC.filter((j) => j.UrlJsonContext.site == objPost.compania_atc);
                            if (isCompaniaATC.length == 0) {
                                status_desc = `ERROR: no hay "${objPost.compania_atc}" registrado para ${tabExcel} de "${objPost.asset_number}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                await postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }
                            //*item:compania_atc
                            let isSitCompaniaATC = getTabExcel.filter((j) => j.UrlJsonContext.emp_atc_site__empresa_atc == objPost.compania_atc);
                            if (isSitCompaniaATC.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.emp_atc_site__empresa_atc = isCompaniaATC.length > 0 ? isCompaniaATC[0].UrlJsonContext.site : '';
                                objPost.emp_atc_empresa_atc_id = isCompaniaATC.length > 0 ? isCompaniaATC[0].ID : '';
                                objPost.emp_atc_site = isCompaniaATC.length > 0 ? isCompaniaATC[0].UrlJsonContext.site : '';
                                delete objPost.compania_atc;
                            }
                            //*pesq.ref:municipio
                            let idMunicipio = 'a95b4721-fc79-445c-b964-14a4ccbf1d7b';
                            let getMunicipio = await getOnergyItem(idMunicipio, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
                            let isMunicipio = getMunicipio.filter((j) => j.UrlJsonContext.municipio == objPost.municipio);
                            if (isMunicipio.length == 0) {
                                status_desc = `ERROR: no hay "${objPost.municipio}" registrado para ${tabExcel} de "${objPost.asset_number}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                await postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }
                            //*item:municipio, departamento
                            let isSitMunicipio = getTabExcel.filter((j) => j.UrlJsonContext.loca_cida_municipio == objPost.municipio);
                            if (isSitMunicipio.length == 0 || data.em_caso_de_duplicidade == '1') {
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
                                objPost.codigo_ancora = objPost.codigo_anchor.toString();
                                delete objPost.codigo_anchor;
                            }
                            //*item:direccion
                            let isDireccion = getTabExcel.filter((j) => j.UrlJsonContext.logradouro == objPost.direccion);
                            if (isDireccion.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.logradouro = objPost.direccion;
                                delete objPost.direccion;
                            }
                            //*pesq.ref:estado_sitio
                            let idEstadoSitio = 'f0ee1dd9-bb48-4aef-9f77-43e357870a31';
                            let getEstadoSitio = await getOnergyItem(idEstadoSitio, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
                            let isEstadoSitio = getEstadoSitio.filter((j) => j.UrlJsonContext.status == objPost.estado_sitio);
                            if (isEstadoSitio.length == 0) {
                                status_desc = `ERROR: no hay "${objPost.municipio}" registrado para ${tabExcel} de "${objPost.asset_number}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                await postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }
                            //*item:estado_sitio
                            let isSitEstadoSitio = getTabExcel.filter((j) => j.UrlJsonContext.STAstatus__status_do_site == objPost.estado_sitio);
                            if (isSitEstadoSitio.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.sta_site_status__status_do_site = isEstadoSitio.length > 0 ? isEstadoSitio[0].UrlJsonContext.status : '';
                                objPost.sta_site_status_do_site_id = isEstadoSitio.length > 0 ? isEstadoSitio[0].ID : '';
                                objPost.sta_site_status = isEstadoSitio.length > 0 ? isEstadoSitio[0].UrlJsonContext.status : '';
                                delete objPost.estado_sitio;
                            }
                            //*pesq.ref:portafolio_atc
                            let idPortafolioATC = '18615527-c678-4f1c-87e0-d7a9735d0c6e';
                            let getPortafolioATC = await getOnergyItem(idPortafolioATC, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
                            let isPortafolioATC = getPortafolioATC.filter((j) => j.UrlJsonContext.tipo_portifolio == objPost.portafolio_atc);
                            if (isPortafolioATC.length == 0) {
                                status_desc = `ERROR: no hay "${objPost.portafolio_atc}" registrado para ${tabExcel} de "${objPost.asset_number}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                await postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }
                            //*item:portafolio_atc
                            let isSitPortafolioATC = getTabExcel.filter((j) => j.UrlJsonContext.tppf_tipo_portifolio__portfolio == objPost.portafolio_atc);
                            if (isSitPortafolioATC.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.tppf_tipo_portifolio__portfolio = isPortafolioATC.length > 0 ? isPortafolioATC[0].UrlJsonContext.tipo_portifolio : '';
                                objPost.tppf_tipo_portifolio = isPortafolioATC.length > 0 ? isPortafolioATC[0].UrlJsonContext.tipo_portifolio : '';
                                objPost.tppf_portfolio_id = isPortafolioATC.length > 0 ? isPortafolioATC[0].ID : '';
                                delete objPost.portafolio_atc;
                            }
                            //*pesq.ref:regional_atc
                            let idRegionalATC = '74d8a818-46a7-4d56-8a18-2369bdd00589';
                            let getRegionalATC = await getOnergyItem(idRegionalATC, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
                            let isRegionalATC = getRegionalATC.filter((j) => j.UrlJsonContext.regional == objPost.regional_atc);
                            if (isRegionalATC.length == 0) {
                                status_desc = `ERROR: no hay "${objPost.regional_atc}" registrado para ${tabExcel} de "${objPost.asset_number}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                await postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }
                            //*item:regional_atc
                            let isSitRegionalATC = getTabExcel.filter((j) => j.UrlJsonContext.regio_regional__regiao_atc == objPost.regional_atc);
                            if (isSitRegionalATC.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.regio_regional__regiao_atc = isRegionalATC.length > 0 ? isRegionalATC[0].UrlJsonContext.regional : '';
                                objPost.regio_regional = isRegionalATC.length > 0 ? isRegionalATC[0].UrlJsonContext.regional : '';
                                objPost.regio_regional_regiao_atc_id = isRegionalATC.length > 0 ? isRegionalATC[0].ID : '';
                                objPost.regio_regiao_atc_id = isRegionalATC.length > 0 ? isRegionalATC[0].ID : '';
                                delete objPost.regional_atc;
                            }

                            let result = await gravarRegistro('asset_number', objPost.asset_number, idTabExcel, objPost, data);
                        }

                        //*aba:informacion_cuenta
                        if (tabExcel == 'informacion_cuenta') {
                            //*id_one_ref:sitios
                            let paiGrid = 'e43b9fe0-6752-446d-8495-0b4fdd7a70b4';
                            let strFiltro = gerarFiltro('asset_number', objPost.asset_number.toString());
                            let paiRegistro = await getOnergyItem(paiGrid, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, strFiltro);
                            //*item:profit_cost_center
                            let isProfitCostCenter = getTabExcel.filter((j) => j.UrlJsonContext.profit_cost_center == objPost.profit_cost_center);
                            if (isProfitCostCenter.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.profit_cost_center = objPost.profit_cost_center.toString();
                            }
                            //*item:portafolio_atc
                            let isPortafolioATC = getTabExcel.filter((j) => j.UrlJsonContext.tppf_tipo_portifolio__portfolio == objPost.portafolio_atc);
                            if (isPortafolioATC.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.tppf_tipo_portifolio__portfolio = objPost.portafolio_atc;
                                delete objPost.portafolio_atc;
                            }
                            //*item:asset_number
                            let isAssetNumber = getTabExcel.filter((j) => j.UrlJsonContext.asset_number_IDC == objPost.asset_number);
                            if (isAssetNumber.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.ID_ONE_REF = paiRegistro.length > 0 ? paiRegistro[0].ID : '';
                                objPost.asset_number_IDC = objPost.asset_number.toString();
                                objPost.asset_number = objPost.asset_number.toString();
                            }
                            //*item:nombre_sitio
                            let isNombreSitio = getTabExcel.filter((j) => j.UrlJsonContext.site_name == objPost.nombre_sitio);
                            if (isNombreSitio.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.site_name = objPost.nombre_sitio;
                                delete objPost.nombre_sitio;
                            }
                            //*item:compania_atc
                            let isCompaniaATC = getTabExcel.filter((j) => j.UrlJsonContext.emp_atc_site == objPost.compania_atc);
                            if (isCompaniaATC.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.emp_atc_site = objPost.compania_atc;
                                delete objPost.compania_atc;
                            }
                            //*item:cuenta_interna_nic
                            let isCuentaInternaNIC = getTabExcel.filter((j) => j.UrlJsonContext.conta_interna_nic == objPost.cuenta_interna_nic);
                            if (isCuentaInternaNIC.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.conta_interna_nic = objPost.cuenta_interna_nic.toString();
                                delete objPost.cuenta_interna_nic;
                            }
                            //*item:cuenta_padre
                            let isCuentaPadre = getTabExcel.filter((j) => j.UrlJsonContext.prcs__conta_pai == objPost.cuenta_padre);
                            if (isCuentaPadre.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.prcs__conta_pai = objPost.cuenta_padre.toString();
                                delete objPost.cuenta_padre;
                            }
                            //*pesq.ref:tipo_cuenta
                            let idTipoCuenta = '84ca5970-7a49-4192-a2c8-030031503a1a';
                            let getTipoCuenta = await getOnergyItem(idTipoCuenta, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
                            let isTipoCuenta = getTipoCuenta.filter((j) => j.UrlJsonContext.TC_tipo_de_conta == objPost.tipo_cuenta);
                            if (isTipoCuenta.length == 0) {
                                status_desc = `ERROR: no hay "${objPost.tipo_cuenta}" registrado para ${tabExcel} de "${objPost.asset_number}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                await postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }
                            //*item:tipo_cuenta
                            let isIdlcTipoCuenta = getTabExcel.filter((j) => j.UrlJsonContext.TCTC_tipo_de_conta__prcs__tipo_de_conta == objPost.tipo_cuenta);
                            if (isIdlcTipoCuenta.length == 0 || data.em_caso_de_duplicidade == '1') {
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
                                objPost.numero_do_medidor = objPost.numero_medidor;
                                delete objPost.numero_medidor;
                            }
                            //*pesq.ref:suscriptor
                            let idSuscriptor = '51a217b1-1d0a-47c7-b31c-46880c1ca5ad';
                            let getSuscriptor = await getOnergyItem(idSuscriptor, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
                            let isSuscriptor = getSuscriptor.filter((j) => j.UrlJsonContext.sus__suscriptor == objPost.suscriptor);
                            if (isSuscriptor.length == 0) {
                                status_desc = `ERROR: no hay "${objPost.suscriptor}" registrado para ${tabExcel} de "${objPost.asset_number}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                await postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }
                            //*item:suscriptor
                            let isIdlcSuscriptor = getTabExcel.filter((j) => j.UrlJsonContext.sus_sus__suscriptor__prcs__assinante_atc == objPost.suscriptor);
                            if (isIdlcSuscriptor.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.sus_sus__suscriptor__prcs__assinante_atc =
                                    isSuscriptor.length > 0 ? isSuscriptor[0].UrlJsonContext.sus__suscriptor : '';
                                objPost.sus_prcs__assinante_atc_id = isSuscriptor.length > 0 ? isSuscriptor[0].ID : '';
                                delete objPost.suscriptor;
                            }
                            //*pesq.ref:estado_cuenta
                            let idEstadoCuenta = '4963d2c6-2b94-4c37-bffb-87c0dc296587';
                            let getEstadoCuenta = await getOnergyItem(idEstadoCuenta, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
                            let isEstadoCuenta = getEstadoCuenta.filter((j) => j.UrlJsonContext.status_conta == objPost.estado_cuenta);
                            if (isEstadoCuenta.length == 0) {
                                status_desc = `ERROR: no hay "${objPost.estado_cuenta}" registrado para ${tabExcel} de "${objPost.asset_number}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                await postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }
                            //*item:estado_cuenta
                            let isIdlcEstadoCuenta = getTabExcel.filter((j) => j.UrlJsonContext.sta_cont_status_conta == objPost.estado_cuenta);
                            if (isIdlcEstadoCuenta.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.sta_cont_status_conta = isEstadoCuenta.length > 0 ? isEstadoCuenta[0].UrlJsonContext.status_conta : '';
                                objPost.sta_cont_id = isEstadoCuenta.length > 0 ? isEstadoCuenta[0].ID : '';
                                delete objPost.estado_cuenta;
                            }
                            //*pesq.ref:nombre_proveedor
                            let idProveedores = '4783ca0b-357d-42ab-a5c8-3328ee315f86';
                            let getProveedores = await getOnergyItem(idProveedores, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
                            let isProveedores = getProveedores.filter((j) => j.UrlJsonContext.nome_provedor == objPost.nombre_proveedor);
                            if (isProveedores.length == 0) {
                                status_desc = `ERROR: no hay "${objPost.nombre_proveedor}" registrado para ${tabExcel} de "${objPost.asset_number}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                await postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }
                            //*item:nombre_proveedor, nombre_comercial, nit_proveedor, nit_beneficiario, nombre_beneficiario, apodo_proveedor, link_web, usuario, contrasena
                            let isIdlcProveedores = getTabExcel.filter((j) => j.UrlJsonContext.prvd_nome_provedor == objPost.nombre_proveedor);
                            if (isIdlcProveedores.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.prvd_nome_provedor = isProveedores.length > 0 ? isProveedores[0].UrlJsonContext.nome_provedor : '';
                                objPost.prvd_id = isProveedores.length > 0 ? isProveedores[0].ID : '';
                                objPost.nome_provedor_id_cache = isProveedores.length > 0 ? isProveedores[0].ID : '';
                                objPost.prvd_nome_comercial = isProveedores.length > 0 ? isProveedores[0].UrlJsonContext.nome_comercial : '';
                                objPost.prvd_nit_provedor = isProveedores.length > 0 ? isProveedores[0].UrlJsonContext.nit_provedor : '';
                                objPost.prvd_nit_beneficiario = isProveedores.length > 0 ? isProveedores[0].UrlJsonContext.nit_beneficiario : '';
                                objPost.prvd_beneficiario = isProveedores.length > 0 ? isProveedores[0].UrlJsonContext.beneficiario : '';
                                objPost.prvd_apelido_provedor = isProveedores.length > 0 ? isProveedores[0].UrlJsonContext.apelido_provedor : '';
                                objPost.prvd_link_web = isProveedores.length > 0 ? isProveedores[0].UrlJsonContext.link_web : '';
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
                            //*pesq.ref:servicios
                            let idServicios = '8e284e84-b8f9-45c1-abe2-991555441ea2';
                            let getServicios = await getOnergyItem(idServicios, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
                            let isServicios = getServicios.filter((j) => j.UrlJsonContext.servicos == objPost.servicios);
                            if (isServicios.length == 0) {
                                status_desc = `ERROR: no hay "${objPost.servicios}" registrado para ${tabExcel} de "${objPost.asset_number}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                await postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }
                            //*item:servicios
                            let isIdlcServicios = getTabExcel.filter((j) => j.UrlJsonContext.SERVservicos__servico == objPost.servicios);
                            if (isIdlcServicios.length == 0 || data.em_caso_de_duplicidade == '1') {
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
                            //*pesq.ref:sujeto_pasivo
                            let idSujetoPasivo = '78352af1-70b2-43a0-ad2a-084cdcf2eacf';
                            let getSujetoPasivo = await getOnergyItem(idSujetoPasivo, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
                            let isSujetoPasivo = getSujetoPasivo.filter((j) => j.UrlJsonContext.sujeito == objPost.sujeto_pasivo);
                            if (isSujetoPasivo.length == 0) {
                                status_desc = `ERROR: no hay "${objPost.sujeto_pasivo}" registrado para ${tabExcel} de "${objPost.asset_number}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                await postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }
                            //*item:sujeto_pasivo
                            let isIdlcSujetoPasivo = getTabExcel.filter(
                                (j) => j.UrlJsonContext.suj_pa_sujeito__prcs__sujeito_passivo_alumbrado_publico == objPost.sujeto_pasivo
                            );
                            if (isIdlcSujetoPasivo.length == 0 || data.em_caso_de_duplicidade == '1') {
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
                                objPost.prcs__acuerdo_resolucion_alumbrado_publico = objPost.acuerdo_resolucion;
                                delete objPost.acuerdo_resolucion;
                            }
                            //*pesq.ref:tipo_cobro
                            let idTipoCobro = '22538843-147f-4d41-9534-20a6d674f4b6';
                            let getTipoCobro = await getOnergyItem(idTipoCobro, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
                            let isTipoCobro = getTipoCobro.filter((j) => j.UrlJsonContext.tipos_cobrancas == objPost.tipo_cobro);
                            if (isTipoCobro.length == 0) {
                                status_desc = `ERROR: no hay "${objPost.tipo_cobro}" registrado para ${tabExcel} de "${objPost.asset_number}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                await postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }
                            //*item:tipo_cobro
                            let isIdlcTipoCobro = getTabExcel.filter((j) => j.UrlJsonContext.tipo_cobr_tipos_cobrancas__tipo_de_cobranca == objPost.tipo_cobro);
                            if (isIdlcTipoCobro.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.tipo_cobr_tipos_cobrancas__tipo_de_cobranca =
                                    isTipoCobro.length > 0 ? isTipoCobro[0].UrlJsonContext.tipos_cobrancas : '';
                                objPost.tipo_cobr_tipo_de_cobranca_id = isTipoCobro.length > 0 ? isTipoCobro[0].ID : '';
                                delete objPost.tipo_cobro;
                            }
                            //*item:dia_de_pago
                            let isDiaDePago = getTabExcel.filter((j) => j.UrlJsonContext.prcs__dia_de_pagamento == objPost.dia_de_pago);
                            if (isDiaDePago.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.prcs__dia_de_pagamento = objPost.dia_de_pago;
                                delete objPost.dia_de_pago;
                                delete objPost.fecha_pago_abril;
                                delete objPost.fecha_pago_mayo;
                                delete objPost.fecha_pago_junio;
                                delete objPost.d1;
                                delete objPost.d2;
                                delete objPost.d3;
                            }
                            //*pesq.ref:frecuencia_pago
                            let idFrecuenciaPago = '2d4edce3-7131-413a-98e5-35d328daef7f';
                            let getFrecuenciaPago = await getOnergyItem(idFrecuenciaPago, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
                            let isFrecuenciaPago = getFrecuenciaPago.filter((j) => j.UrlJsonContext.frequencia == objPost.frecuencia_pago);
                            if (isFrecuenciaPago.length == 0) {
                                status_desc = `ERROR: no hay "${objPost.frecuencia_pago}" registrado para ${tabExcel} de "${objPost.asset_number}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                await postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }
                            //*item:frecuencia_pago
                            let isIdlcFrecuenciaPago = getTabExcel.filter(
                                (j) => j.UrlJsonContext.fre_pag_frequencia__frequencia_de_pagamento == objPost.frecuencia_pago
                            );
                            if (isIdlcFrecuenciaPago.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.fre_pag_frequencia__frequencia_de_pagamento =
                                    isFrecuenciaPago.length > 0 ? isFrecuenciaPago[0].UrlJsonContext.frequencia : '';
                                objPost.fre_pag_frequencia_de_pagamento_id = isFrecuenciaPago.length > 0 ? isFrecuenciaPago[0].ID : '';
                                delete objPost.frecuencia_pago;
                            }
                            //*pesq.ref:forma_pago
                            let idFormaPago = '0e8a4463-28db-474f-926b-39fa1bd0c9bc';
                            let getFormaPago = await getOnergyItem(idFormaPago, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
                            let isFormaPago = getFormaPago.filter((j) => j.UrlJsonContext.formas_de_pagamentos == objPost.forma_pago);
                            if (isFormaPago.length == 0) {
                                status_desc = `ERROR: no hay "${objPost.forma_pago}" registrado para ${tabExcel} de "${objPost.asset_number}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                await postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }
                            //*item:forma_pago
                            let isIdlcFormaPago = getTabExcel.filter(
                                (j) => j.UrlJsonContext.for_pag_formas_de_pagamentos__forma_de_pagamento == objPost.forma_pago
                            );
                            if (isIdlcFormaPago.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.for_pag_formas_de_pagamentos__forma_de_pagamento =
                                    isFormaPago.length > 0 ? isFormaPago[0].UrlJsonContext.formas_de_pagamentos : '';
                                objPost.for_pag_forma_de_pagamento_id = isFormaPago.length > 0 ? isFormaPago[0].ID : '';
                                delete objPost.forma_pago;
                            }
                            //*pesq.ref:clasificacion_passthru
                            let idClasificacionPassthru = 'ad62c737-2abc-4c71-a572-e11933114ed8';
                            let getClasificacionPassthru = await getOnergyItem(
                                idClasificacionPassthru,
                                data.onergy_js_ctx.assid,
                                data.onergy_js_ctx.usrid,
                                null
                            );
                            let isClasificacionPassthru = getClasificacionPassthru.filter(
                                (j) => j.UrlJsonContext.classificacao_passthru == objPost.clasificacion_passthru
                            );
                            if (isClasificacionPassthru.length == 0) {
                                status_desc = `ERROR: no hay "${objPost.clasificacion_passthru}" registrado para ${tabExcel} de "${objPost.asset_number}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                await postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }
                            //*item:clasificacion_passthru
                            let isIdlcClasificacionPassthru = getTabExcel.filter(
                                (j) => j.UrlJsonContext.CPTclassificacao_passthru__prcs__clasificacion_passthru == objPost.clasificacion_passthru
                            );
                            if (isIdlcClasificacionPassthru.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.CPTclassificacao_passthru__prcs__clasificacion_passthru =
                                    isClasificacionPassthru.length > 0 ? isClasificacionPassthru[0].UrlJsonContext.classificacao_passthru : '';
                                objPost.CPTprcs__clasificacion_passthru_id = isClasificacionPassthru.length > 0 ? isClasificacionPassthru[0].ID : '';
                                delete objPost.clasificacion_passthru;
                            }
                            //*pesq.ref:estado_captura_cuenta
                            let idEstadoCapturaCuenta = '3c2d0727-6359-4c71-9409-465759462854';
                            let getEstadoCapturaCuenta = await getOnergyItem(idEstadoCapturaCuenta, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
                            let isEstadoCapturaCuenta = getEstadoCapturaCuenta.filter(
                                (j) => j.UrlJsonContext.ECCU_estado_da_captura_da_conta == objPost.estado_captura_cuenta
                            );
                            if (isEstadoCapturaCuenta.length == 0) {
                                status_desc = `ERROR: no hay "${objPost.estado_captura_cuenta}" registrado para ${tabExcel} de "${objPost.asset_number}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                await postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }
                            //*item:estado_captura_cuenta
                            let isIdlcEstadoCapturaCuenta = getTabExcel.filter(
                                (j) => j.UrlJsonContext.ECCUECCU_estado_da_captura_da_conta__status_de_capturapago == objPost.estado_captura_cuenta
                            );
                            if (isIdlcEstadoCapturaCuenta.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.ECCUECCU_estado_da_captura_da_conta__status_de_capturapago =
                                    isEstadoCapturaCuenta.length > 0 ? isEstadoCapturaCuenta[0].UrlJsonContext.ECCU_estado_da_captura_da_conta : '';
                                objPost.ECCUstatus_de_capturapago_id = isEstadoCapturaCuenta.length > 0 ? isEstadoCapturaCuenta[0].ID : '';
                                delete objPost.estado_captura_cuenta;
                            }
                            //*item:proxima_captura
                            let isProximaCaptura = getTabExcel.filter((j) => j.UrlJsonContext.prcs__proxima_captura == objPost.proxima_captura);
                            if (isProximaCaptura.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.prcs__proxima_captura = objPost.proxima_captura;
                                delete objPost.proxima_captura;
                            }
                            //*item:proximo_pago_oportuno
                            let isProximoPagoOportuno = getTabExcel.filter((j) => j.UrlJsonContext.prcs__proximo_pagamento == objPost.proximo_pago_oportuno);
                            if (isProximoPagoOportuno.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.prcs__proximo_pagamento = objPost.proximo_pago_oportuno;
                                delete objPost.proximo_pago_oportuno;
                            }

                            let result = await gravarRegistro('asset_number', objPost.asset_number, idTabExcel, objPost, data);
                        }

                        //*aba:informacion_tecnica
                        if (tabExcel == 'informacion_tecnica') {
                            //*id_one_ref:sitios
                            let paiGrid = 'e43b9fe0-6752-446d-8495-0b4fdd7a70b4';
                            let strFiltro = gerarFiltro('asset_number', objPost.asset_number.toString());
                            let paiRegistro = await getOnergyItem(paiGrid, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, strFiltro);
                            //*pesq.ref:categorias
                            let idCategorias = '55ec978d-7dbe-4a6f-8cb4-536b53361d54';
                            let getCategorias = await getOnergyItem(idCategorias, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
                            let isCategorias = getCategorias.filter((j) => j.UrlJsonContext.categorias == objPost.categorias);
                            if (isCategorias.length == 0) {
                                status_desc = `ERROR: no hay "${objPost.categorias}" registrado para ${tabExcel} de "${objPost.asset_number}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                await postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }
                            //*item:categorias
                            let isItdsCategorias = getTabExcel.filter((j) => j.UrlJsonContext.ctgr_categorias__categoria == objPost.categorias);
                            if (isItdsCategorias.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.ctgr_categorias__categoria = isCategorias.length > 0 ? isCategorias[0].UrlJsonContext.categorias : '';
                                objPost.ctgr_categoria_id = isCategorias.length > 0 ? isCategorias[0].ID : '';
                                delete objPost.categorias;
                            }
                            //*pesq.ref:estrato
                            let idEstrato = '34f26407-6afe-41c8-8420-7dbcd4f1aed4';
                            let getEstrato = await getOnergyItem(idEstrato, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
                            let isEstrato = getEstrato.filter((j) => j.UrlJsonContext.LST_estrato == objPost.estrato);
                            if (isEstrato.length == 0) {
                                status_desc = `ERROR: no hay "${objPost.estrato}" registrado para ${tabExcel} de "${objPost.asset_number}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                await postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }
                            //*item:estrato
                            let isItdsEstrato = getTabExcel.filter((j) => j.UrlJsonContext.LSTLST_estrato__ITDS_estrato == objPost.estrato);
                            if (isItdsEstrato.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.LSTLST_estrato__ITDS_estrato = isEstrato.length > 0 ? isEstrato[0].UrlJsonContext.LST_estrato : '';
                                objPost.LSTITDS_estrato_id = isEstrato.length > 0 ? isEstrato[0].ID : '';
                                delete objPost.estrato;
                            }
                            //*pesq.ref:nivel_tension
                            let idNivelTension = '4056b8c5-29c0-47ff-b5b1-cfc3c7f39018';
                            let getNivelTension = await getOnergyItem(idNivelTension, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
                            let isNivelTension = getNivelTension.filter((j) => j.UrlJsonContext.NVT_nivel == objPost.nivel_tension);
                            if (isNivelTension.length == 0) {
                                status_desc = `ERROR: no hay "${objPost.nivel_tension}" registrado para ${tabExcel} de "${objPost.asset_number}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                await postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }
                            //*item:nivel_tension
                            let isItdsNivelTension = getTabExcel.filter((j) => j.UrlJsonContext.NVTNVT_nivel__ITDS_nivel_de_tensao == objPost.nivel_tension);
                            if (isItdsNivelTension.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.NVTNVT_nivel__ITDS_nivel_de_tensao = isNivelTension.length > 0 ? isNivelTension[0].UrlJsonContext.NVT_nivel : '';
                                objPost.NVTITDS_nivel_de_tensao_id = isNivelTension.length > 0 ? isNivelTension[0].ID : '';
                                delete objPost.nivel_tension;
                            }
                            //*pesq.ref:lecturas
                            let idLecturas = '0d3b6287-8f3a-4ad7-acdd-e1c60426f73f';
                            let getLecturas = await getOnergyItem(idLecturas, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
                            let isLecturas = getLecturas.filter((j) => j.UrlJsonContext.LCT_ferramentas == objPost.lectura_atc);
                            if (isLecturas.length == 0) {
                                status_desc = `ERROR: no hay "${objPost.lectura_atc}" registrado para ${tabExcel} de "${objPost.asset_number}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                await postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }
                            //*item:lecturas
                            let isItdsLecturas = getTabExcel.filter((j) => j.UrlJsonContext.LCTLCT_ferramentas__ITDS_lecturas == objPost.lectura_atc);
                            if (isItdsLecturas.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.LCTLCT_ferramentas__ITDS_lecturas = isLecturas.length > 0 ? isLecturas[0].UrlJsonContext.LCT_ferramentas : '';
                                objPost.LCTITDS_lecturas_id = isLecturas.length > 0 ? isLecturas[0].ID : '';
                                delete objPost.lectura_atc;
                            }
                            //*item:asset_number
                            let isAssetNumber = getTabExcel.filter((j) => j.UrlJsonContext.asset_number == objPost.asset_number);
                            if (isAssetNumber.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.ID_ONE_REF = paiRegistro.length > 0 ? paiRegistro[0].ID : '';
                                objPost.asset_number = objPost.asset_number.toString();
                            }
                            //*item:nombre_sitio
                            let isNombreSitio = getTabExcel.filter((j) => j.UrlJsonContext.site_name == objPost.nombre_sitio);
                            if (isNombreSitio.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.site_name = objPost.nombre_sitio;
                                delete objPost.nombre_sitio;
                            }
                            //*item:direccion
                            let isDireccion = getTabExcel.filter((j) => j.UrlJsonContext.logradouro == objPost.direccion);
                            if (isDireccion.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.logradouro = objPost.direccion;
                                delete objPost.direccion;
                            }
                            //*item:municipio, departamento
                            let isMunicipio = getTabExcel.filter((j) => j.UrlJsonContext.loca_cida_municipio == objPost.municipio);
                            if (isMunicipio.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.loca_cida_municipio = objPost.municipio;
                                objPost.loca_cida_loca_uf_uf = objPost.departamento;
                                delete objPost.municipio;
                                delete objPost.departamento;
                            }
                            //*item:estado_sitio
                            let isStatusSite = getTabExcel.filter((j) => j.UrlJsonContext.sta_site_status == objPost.estado_sitio);
                            if (isStatusSite.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.sta_site_status = objPost.estado_sitio;
                                delete objPost.estado_sitio;
                            }
                            //*item:compania_atc
                            let isCompaniaATC = getTabExcel.filter((j) => j.UrlJsonContext.emp_atc_site == objPost.compania_atc);
                            if (isCompaniaATC.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.emp_atc_site = objPost.compania_atc;
                                delete objPost.compania_atc;
                            }
                            //*pesq.ref:motogenerador
                            let idMotogenerador = '066e2afa-0169-4e5f-a7fb-79131aafe8c7';
                            let getMotogenerador = await getOnergyItem(idMotogenerador, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
                            let isMotogenerador = getMotogenerador.filter((j) => j.UrlJsonContext.ger_gerador == objPost.motogenerador);
                            if (isMotogenerador.length == 0) {
                                status_desc = `ERROR: no hay "${objPost.motogenerador}" registrado para ${tabExcel} de "${objPost.asset_number}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                await postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }
                            //*item:motogenerador
                            let isItdsMotogenerador = getTabExcel.filter((j) => j.UrlJsonContext.gerger_gerador__gerador == objPost.motogenerador);
                            if (isItdsMotogenerador.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.gerger_gerador__gerador = isMotogenerador.length > 0 ? isMotogenerador[0].UrlJsonContext.ger_gerador : '';
                                objPost.gergerador_id = isMotogenerador.length > 0 ? isMotogenerador[0].ID : '';
                                delete objPost.motogenerador;
                            }
                            //*pesq.ref:tablero_independiente
                            let idTableroIndependiente = 'dbaf278d-8fed-4611-be82-ecd9b69806c0';
                            let getTableroIndependiente = await getOnergyItem(idTableroIndependiente, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
                            let isTableroIndependiente = getTableroIndependiente.filter(
                                (j) => j.UrlJsonContext.dir_diretoria_independente == objPost.tablero_independiente
                            );
                            if (isTableroIndependiente.length == 0) {
                                status_desc = `ERROR: no hay "${objPost.tablero_independiente}" registrado para ${tabExcel} de "${objPost.asset_number}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                await postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }
                            //*item:tablero_independiente
                            let isItdsTableroIndependiente = getTabExcel.filter(
                                (j) => j.UrlJsonContext.dirdir_diretoria_independente__diretoria_independente == objPost.tablero_independiente
                            );
                            if (isItdsTableroIndependiente.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.dirdir_diretoria_independente__diretoria_independente =
                                    isTableroIndependiente.length > 0 ? isTableroIndependiente[0].UrlJsonContext.dir_diretoria_independente : '';
                                objPost.dirdiretoria_independente_id = isTableroIndependiente.length > 0 ? isTableroIndependiente[0].ID : '';
                                delete objPost.tablero_independiente;
                            }
                            //*pesq.ref:barter
                            let idBarter = '13dad727-2325-4e9d-85a3-c8ff09e053c7';
                            let getBarter = await getOnergyItem(idBarter, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
                            let isBarter = getBarter.filter((j) => j.UrlJsonContext.esc_escambo == objPost.barter);
                            if (isBarter.length == 0) {
                                status_desc = `ERROR: no hay "${objPost.barter}" registrado para ${tabExcel} de "${objPost.asset_number}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                await postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }
                            //*item:barter
                            let isItdsBarter = getTabExcel.filter((j) => j.UrlJsonContext.escesc_escambo__escambo == objPost.barter);
                            if (isItdsBarter.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.escesc_escambo__escambo = isBarter.length > 0 ? isBarter[0].UrlJsonContext.esc_escambo : '';
                                objPost.escescambo_id = isBarter.length > 0 ? isBarter[0].ID : '';
                                delete objPost.barter;
                            }
                            //*pesq.ref:provisional
                            let idProvisional = 'fb6543b9-28a4-4e49-8f4b-2af6557a7cd8';
                            let getProvisional = await getOnergyItem(idProvisional, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
                            let isProvisional = getProvisional.filter((j) => j.UrlJsonContext.pro_provisorio == objPost.provisional);
                            if (isProvisional.length == 0) {
                                status_desc = `ERROR: no hay "${objPost.provisional}" registrado para ${tabExcel} de "${objPost.asset_number}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                await postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }
                            //*item:provisional
                            let isItdsProvisional = getTabExcel.filter((j) => j.UrlJsonContext.propro_provisorio__provisorio == objPost.provisional);
                            if (isItdsProvisional.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.propro_provisorio__provisorio = isProvisional.length > 0 ? isProvisional[0].UrlJsonContext.pro_provisorio : '';
                                objPost.proprovisorio_id = isProvisional.length > 0 ? isProvisional[0].ID : '';
                                delete objPost.provisional;
                            }
                            //*item:cantidad_provisionales
                            let isCantidadProvisionales = getTabExcel.filter((j) => j.UrlJsonContext.quantidade_provisoria == objPost.cantidad_provisionales);
                            if (isCantidadProvisionales.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.quantidade_provisoria = objPost.cantidad_provisionales;
                                delete objPost.cantidad_provisionales;
                            }

                            let result = await gravarRegistro('asset_number', objPost.asset_number, idTabExcel, objPost, data);
                        }

                        //*aba:clientes_sitio
                        if (tabExcel == 'clientes_sitio') {
                            //*id_one_ref:sitios
                            let paiGrid = 'e43b9fe0-6752-446d-8495-0b4fdd7a70b4';
                            let strFiltro = gerarFiltro('asset_number', objPost.asset_number.toString());
                            let paiRegistro = await getOnergyItem(paiGrid, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, strFiltro);
                            //*pesq.ref:nit_cliente
                            let idClientes = '0694dd6e-299a-4b46-b8fd-5e08da24f72d';
                            let getClientes = await getOnergyItem(idClientes, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
                            let isClientes = getClientes.filter((j) => j.UrlJsonContext.COLC_nit_cliente == objPost.nit_cliente);
                            if (isClientes.length == 0) {
                                status_desc = `ERROR: no hay "${objPost.nit_cliente}" registrado para ${tabExcel} de "${objPost.nit_cliente}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                await postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }
                            //*item:nit_cliente, nombre_cliente, codigo_cliente
                            let isNITCliente = getTabExcel.filter((j) => j.UrlJsonContext.COLCCOLC_nit_cliente == objPost.nit_cliente);
                            if (isNITCliente.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.ID_ONE_REF = paiRegistro.length > 0 ? paiRegistro[0].ID : '';
                                objPost.COLCCOLC_nit_cliente = isClientes.length > 0 ? isClientes[0].UrlJsonContext.COLC_nit_cliente : '';
                                objPost.COLCclsit__nit_cliente_id = isClientes.length > 0 ? isClientes[0].ID : '';
                                objPost.COLCCOLC_nome_cliente__clsit__nit_cliente = isClientes.length > 0 ? isClientes[0].UrlJsonContext.COLC_nome_cliente : '';
                                objPost.COLCCOLC_codigo_cliente = isClientes.length > 0 ? isClientes[0].UrlJsonContext.COLC_codigo_cliente : '';
                                delete objPost.nombre_cliente;
                                delete objPost.nit_cliente;
                                delete objPost.codigo_cliente;
                            }
                            //*item:codigo_sitio_cliente
                            let isCodigoSitioCliente = getTabExcel.filter(
                                (j) => j.UrlJsonContext.clsit__codigo_do_sitio_do_cliente == objPost.codigo_sitio_cliente
                            );
                            if (isCodigoSitioCliente.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.clsit__codigo_do_sitio_do_cliente = objPost.codigo_sitio_cliente;
                                delete objPost.codigo_sitio_cliente;
                            }
                            //*pesq.ref:nombre_regional
                            let idRegionalClientes = 'b45777ee-f5f3-429c-9fd7-9ee4578b0b63';
                            let getRegionalClientes = await getOnergyItem(idRegionalClientes, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
                            let isRegionalClientes = getRegionalClientes.filter((j) => j.UrlJsonContext.RCS_nome_regional == objPost.nombre_regional);
                            if (isRegionalClientes.length == 0) {
                                status_desc = `ERROR: no hay "${objPost.nombre_regional}" registrado para ${tabExcel} de "${objPost.nit_cliente}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                await postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }
                            //*item:nombre_regional
                            let isNombreRegional = getTabExcel.filter(
                                (j) => j.UrlJsonContext.RCSRCS_nome_regional__clsit__regional_do_cliente == objPost.nombre_regional
                            );
                            if (isNombreRegional.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.RCSRCS_nome_regional__clsit__regional_do_cliente =
                                    isRegionalClientes.length > 0 ? isRegionalClientes[0].UrlJsonContext.RCS_nome_regional : '';
                                objPost.RCSclsit__regional_do_cliente_id = isRegionalClientes.length > 0 ? isRegionalClientes[0].ID : '';
                                delete objPost.nombre_regional;
                            }
                            //*pesq.ref:portafolio_cliente
                            let idPortafolioCliente = 'b36cf260-c691-4d36-9339-137041e6fb63';
                            let getPortafolioCliente = await getOnergyItem(idPortafolioCliente, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
                            let isPortafolioCliente = getPortafolioCliente.filter((j) => j.UrlJsonContext.PCS_portafolio_cliente == objPost.portafolio_cliente);
                            if (isPortafolioCliente.length == 0) {
                                status_desc = `ERROR: no hay "${objPost.portafolio_cliente}" registrado para ${tabExcel} de "${objPost.nit_cliente}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                await postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }
                            //*item:portafolio_cliente
                            let isPcsPortafolioCliente = getTabExcel.filter(
                                (j) => j.UrlJsonContext.PCSPCS_portafolio_cliente__clsit__portifolio_cliente == objPost.portafolio_cliente
                            );
                            if (isPcsPortafolioCliente.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.PCSPCS_portafolio_cliente__clsit__portifolio_cliente =
                                    isPortafolioCliente.length > 0 ? isPortafolioCliente[0].UrlJsonContext.PCS_portafolio_cliente : '';
                                objPost.PCSclsit__portifolio_cliente_id = isPortafolioCliente.length > 0 ? isPortafolioCliente[0].ID : '';
                                delete objPost.portafolio_cliente;
                            }
                            //*item:portafolio_atc
                            let isPortafolioATC = getTabExcel.filter((j) => j.UrlJsonContext.tppf_tipo_portifolio == objPost.portafolio_atc);
                            if (isPortafolioATC.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.tppf_tipo_portifolio = objPost.portafolio_atc;
                                delete objPost.portafolio_atc;
                            }
                            //*item:asset_number
                            let isAssetNumber = getTabExcel.filter((j) => j.UrlJsonContext.asset_number == objPost.asset_number);
                            if (isAssetNumber.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.asset_number = objPost.asset_number.toString();
                            }
                            //*item:profit_cost_center
                            let isProfitCostCenter = getTabExcel.filter((j) => j.UrlJsonContext.profit_cost_center == objPost.profit_cost_center);
                            if (isProfitCostCenter.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.profit_cost_center = objPost.profit_cost_center.toString();
                            }
                            //*item:nombre_sitio
                            let isNombreSitio = getTabExcel.filter((j) => j.UrlJsonContext.site_name == objPost.nombre_sitio);
                            if (isNombreSitio.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.site_name = objPost.nombre_sitio;
                                delete objPost.nombre_sitio;
                            }
                            //*item:compania_atc
                            let isCompaniaATC = getTabExcel.filter((j) => j.UrlJsonContext.emp_atc_site == objPost.compania_atc);
                            if (isCompaniaATC.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.emp_atc_site = objPost.compania_atc;
                                delete objPost.compania_atc;
                            }
                            //*item:municipio
                            let isMunicipio = getTabExcel.filter((j) => j.UrlJsonContext.loca_cida_municipio == objPost.municipio);
                            if (isMunicipio.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.loca_cida_municipio = objPost.municipio;
                                delete objPost.municipio;
                            }
                            //*item:departamento
                            let isDepartamento = getTabExcel.filter((j) => j.UrlJsonContext.loca_cida_loca_uf_uf == objPost.departamento);
                            if (isDepartamento.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.loca_cida_loca_uf_uf = objPost.departamento;
                                delete objPost.departamento;
                            }
                            //*item:regional_atc
                            let isRegionalATC = getTabExcel.filter((j) => j.UrlJsonContext.regio_regional == objPost.regional_atc);
                            if (isRegionalATC.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.regio_regional = objPost.regional_atc;
                                delete objPost.regional_atc;
                            }

                            let result = await gravarRegistro('asset_number', objPost.asset_number, idTabExcel, objPost, data);
                        }

                        //*aba:clientes
                        if (tabExcel == 'clientes') {
                            //*item:nit_cliente
                            let isNITCliente = getTabExcel.filter((j) => j.UrlJsonContext.COLC_nit_cliente == objPost.nit_cliente);
                            if (isNITCliente.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.COLC_nit_cliente = objPost.nit_cliente.toString();
                                delete objPost.nit_cliente;
                            }
                            //*item:nombre_cliente
                            let isNombreCliente = getTabExcel.filter((j) => j.UrlJsonContext.COLC_nome_cliente == objPost.nombre_cliente);
                            if (isNombreCliente.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.COLC_nome_cliente = objPost.nombre_cliente;
                                delete objPost.nombre_cliente;
                            }
                            //*item:nombre_oficial
                            let isNombreOficial = getTabExcel.filter((j) => j.UrlJsonContext.COLC_nome_oficial == objPost.nombre_oficial);
                            if (isNombreOficial.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.COLC_nome_oficial = objPost.nombre_oficial;
                                delete objPost.nombre_oficial;
                            }
                            //*item:direccion
                            let isDireccion = getTabExcel.filter((j) => j.UrlJsonContext.COLC_endereco == objPost.direccion);
                            if (isDireccion.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.COLC_endereco = objPost.direccion;
                                delete objPost.direccion;
                            }
                            //*pesq.ref:municipio
                            let idMunicipio = 'a95b4721-fc79-445c-b964-14a4ccbf1d7b';
                            let getMunicipio = await getOnergyItem(idMunicipio, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
                            let isMunicipio = getMunicipio.filter((j) => j.UrlJsonContext.municipio == objPost.municipio);
                            if (isMunicipio.length == 0) {
                                status_desc = `ERROR: no hay "${objPost.municipio}" registrado para ${tabExcel} de "${objPost.nit_cliente}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                await postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }
                            //*item:municipio, departamento
                            let isColcMunicipio = getTabExcel.filter((j) => j.UrlJsonContext.loca_cida_municipio__COLC_cidade == objPost.municipio);
                            if (isColcMunicipio.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.loca_cida_municipio__COLC_cidade = isMunicipio.length > 0 ? isMunicipio[0].UrlJsonContext.municipio : '';
                                objPost.loca_cida_COLC_cidade_id = isMunicipio.length > 0 ? isMunicipio[0].ID : '';
                                objPost.loca_cida_loca_uf_uf = isMunicipio.length > 0 ? isMunicipio[0].UrlJsonContext.loca_uf_uf : '';
                                delete objPost.municipio;
                                delete objPost.departamento;
                            }

                            let result = await gravarRegistro('COLC_nit_cliente', objPost.COLC_nit_cliente, idTabExcel, objPost, data);
                        }

                        //*aba:regional_clientes
                        if (tabExcel == 'regional_clientes') {
                            //*id_one_ref:clientes
                            let paiGrid = '0694dd6e-299a-4b46-b8fd-5e08da24f72d';
                            let strFiltro = gerarFiltro('COLC_nit_cliente', objPost.nit_cliente.toString());
                            let paiRegistro = await getOnergyItem(paiGrid, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, strFiltro);
                            //*item:nit_cliente
                            let isNITCliente = getTabExcel.filter((j) => j.UrlJsonContext.RCS_nit_cliente == objPost.nit_cliente);
                            if (isNITCliente.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.ID_ONE_REF = paiRegistro.length > 0 ? paiRegistro[0].ID : '';
                                objPost.RCS_nit_cliente = objPost.nit_cliente.toString();
                                delete objPost.nit_cliente;
                            }
                            //*item:nombre_regional
                            let isNombreRegional = getTabExcel.filter((j) => j.UrlJsonContext.RCS_nome_regional == objPost.nombre_regional);
                            if (isNombreRegional.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.RCS_nome_regional = objPost.nombre_regional;
                                delete objPost.nombre_regional;
                            }

                            let result = await gravarRegistro('RCS_nome_regional', objPost.RCS_nome_regional, idTabExcel, objPost, data);
                        }

                        //*aba:contactos_clientes
                        if (tabExcel == 'contactos_clientes') {
                            //*id_one_ref:clientes
                            let paiGrid = '0694dd6e-299a-4b46-b8fd-5e08da24f72d';
                            let strFiltro = gerarFiltro('COLC_nit_cliente', objPost.nit_cliente.toString());
                            let paiRegistro = await getOnergyItem(paiGrid, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, strFiltro);
                            //*item:nit_cliente
                            let isNITCliente = getTabExcel.filter((j) => j.UrlJsonContext.CCS_nit_cliente == objPost.nit_cliente);
                            if (isNITCliente.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.ID_ONE_REF = paiRegistro.length > 0 ? paiRegistro[0].ID : '';
                                objPost.CCS_nit_cliente = objPost.nit_cliente.toString();
                                delete objPost.nit_cliente;
                            }
                            //*pesq.ref:regional_clientes
                            let idRegionalClientes = 'b45777ee-f5f3-429c-9fd7-9ee4578b0b63';
                            let getRegionalClientes = await getOnergyItem(idRegionalClientes, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
                            let isRegionalClientes = getRegionalClientes.filter((j) => j.UrlJsonContext.RCS_nome_regional == objPost.nombre_regional);
                            if (isRegionalClientes.length == 0) {
                                status_desc = `ERROR: no hay "${objPost.nombre_regional}" registrado para ${tabExcel} de "${objPost.nit_cliente}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                await postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }
                            //*item:nombre_regional
                            let isRcsRegionalClientes = getTabExcel.filter(
                                (j) => j.UrlJsonContext.RCSRCS_nome_regional__CCS_nombre_regional == objPost.nombre_regional
                            );
                            if (isRcsRegionalClientes.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.RCSRCS_nome_regional__CCS_nombre_regional =
                                    isRegionalClientes.length > 0 ? isRegionalClientes[0].UrlJsonContext.RCS_nome_regional : '';
                                objPost.RCSCCS_nombre_regional_id = isRegionalClientes.length > 0 ? isRegionalClientes[0].ID : '';
                                delete objPost.nombre_regional;
                            }
                            //*item:nombre_contacto
                            let isNombreContacto = getTabExcel.filter((j) => j.UrlJsonContext.CCS_nombre_contacto == objPost.nombre_contacto);
                            if (isNombreContacto.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.CCS_nombre_contacto = objPost.nombre_contacto;
                                delete objPost.nombre_contacto;
                            }
                            //*item:telefono_celular
                            let isTelefonoCelular = getTabExcel.filter((j) => j.UrlJsonContext.CCS_telefono_celular == objPost.telefono_celular);
                            if (isTelefonoCelular.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.CCS_telefono_celular = objPost.telefono_celular.toString();
                                delete objPost.telefono_celular;
                            }
                            //*item:telefono_fijo
                            let isTelefonoFijo = getTabExcel.filter((j) => j.UrlJsonContext.CCS_telefono_fijo == objPost.telefono_fijo);
                            if (isTelefonoFijo.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.CCS_telefono_fijo = objPost.telefono_fijo.toString();
                                delete objPost.telefono_fijo;
                            }
                            //*item:correo_electronico
                            let isCorreoElectronico = getTabExcel.filter((j) => j.UrlJsonContext.CCS_correo_eletronico == objPost.correo_electronico);
                            if (isCorreoElectronico.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.CCS_correo_eletronico = objPost.correo_electronico.toString();
                                delete objPost.correo_electronico;
                            }

                            let result = await gravarRegistro(
                                'RCSRCS_nome_regional__CCS_nombre_regional',
                                objPost.RCSRCS_nome_regional__CCS_nombre_regional,
                                idTabExcel,
                                objPost,
                                data
                            );
                        }

                        //*aba:portafolio_clientes
                        if (tabExcel == 'portafolio_clientes') {
                            //*id_one_ref:clientes
                            let paiGrid = '0694dd6e-299a-4b46-b8fd-5e08da24f72d';
                            let strFiltro = gerarFiltro('COLC_nit_cliente', objPost.nit_cliente.toString());
                            let paiRegistro = await getOnergyItem(paiGrid, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, strFiltro);
                            //*item:nit_cliente
                            let isNITCliente = getTabExcel.filter((j) => j.UrlJsonContext.PCS_nit_cliente == objPost.nit_cliente);
                            if (isNITCliente.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.ID_ONE_REF = paiRegistro.length > 0 ? paiRegistro[0].ID : '';
                                objPost.PCS_nit_cliente = objPost.nit_cliente.toString();
                                delete objPost.nit_cliente;
                            }
                            //*item:portafolio_cliente
                            let isPortafolioCliente = getTabExcel.filter((j) => j.UrlJsonContext.PCS_portafolio_cliente == objPost.portafolio_cliente);
                            if (isPortafolioCliente.length == 0 || data.em_caso_de_duplicidade == '1') {
                                objPost.PCS_portafolio_cliente = objPost.portafolio_cliente;
                                delete objPost.portafolio_cliente;
                            }

                            let result = await gravarRegistro('PCS_portafolio_cliente', objPost.PCS_portafolio_cliente, idTabExcel, objPost, data);
                        }
                    }
                } else {
                    //*status:erro
                    dataHoje = new Date();
                    time = gerarDataHora(dataHoje, -5); //?Bogota
                    status_desc = `ERROR: los datos de ${tabExcel} no fueron procesados`;
                    statusPost.push(`${time}, ${status_desc}`);
                    await postStatus(status_desc, statusPost, data);
                    statusPost = statusPost.concat('\n');
                    return false;
                }
            } else {
                //*status:erro
                dataHoje = new Date();
                time = gerarDataHora(dataHoje, -5); //?Bogota
                status_desc = `ERROR: no se encontraron datos en ${tabExcel}`;
                statusPost.push(`${time}, ${status_desc}`);
                await postStatus(status_desc, statusPost, data);
                statusPost = statusPost.concat('\n');
                return false;
            }
        } else {
            //*status:erro
            dataHoje = new Date();
            time = gerarDataHora(dataHoje, -5); //?Bogota
            status_desc = `ERROR: No hay registros en ${nomePlanilha}`;
            statusPost.push(`${time}, ${status_desc}`);
            await postStatus(status_desc, statusPost, data);
            statusPost = statusPost.concat('\n');
            return false;
        }
    } else {
        //*status:erro
        dataHoje = new Date();
        time = gerarDataHora(dataHoje, -5); //?Bogota
        status_desc = `ERROR: El índice carga ${cargaIndiceNome} no coincide con ${tabExcel}`;
        statusPost.push(`${time}, ${status_desc}`);
        await postStatus(status_desc, statusPost, data);
        statusPost = statusPost.concat('\n');
        return false;
    }

    //*status:done
    dataHoje = new Date();
    time = gerarDataHora(dataHoje, -5); //?Bogota
    status_desc = `Carga de ${tabExcel} finalizada`;
    statusPost.push(`${time}, ${status_desc}`);
    await postStatus(status_desc, statusPost, data);
    statusPost = statusPost.concat('\n');

    // return true;
    return SetObjectResponse(true, data, true);
}
function initBefore(json) {
    //return true;
}
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
        onergySaveData.checkTemplateDuplicate = checkTemplateDuplicate;
    }
    if (addCfgViewGroup != undefined && addCfgViewGroup.length > 0) {
        onergySaveData.addCfgViewGroup = addCfgViewGroup;
    }
    return await onergy_save(onergySaveData);
}
async function postStatus(status_desc, statusPost, data) {
    let postInfo = {
        processamento: status_desc,
        horas: data.time,
        processo: statusPost,
    };
    onergy.log(`JFS ~ postStatus ~ postInfo: ${JSON.stringify(postInfo)}`);
    //*consulta id do status
    let idCargaGeral = '181c67a8-e7a9-4c9a-9ea1-ca4719c0e23f';
    let getCargaGeral = await getOnergyItem(idCargaGeral, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, '', data.id_upload_planilha);
    //*envia update para registro de carga
    let result = await sendItemToOnergy(
        idCargaGeral,
        data.onergy_js_ctx.usrid,
        data.onergy_js_ctx.assid,
        postInfo,
        data.id_upload_planilha,
        '',
        true,
        false,
        false
    );
    return result;
}
async function gravarRegistro(fielNameQ, valueQ, idTabExcel, objPost, data) {
    //*consulta registro
    let filItem = gerarFiltro(fielNameQ, valueQ);
    let getItem = await getOnergyItem(idTabExcel, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, filItem);
    if (getItem.length > 0) {
        //*se houver registro, atualizar
        let postInfo = {
            UrlJsonContext: objPost,
        };
        let result = await onergy_updatemany({
            fdtid: idTabExcel,
            assid: data.onergy_js_ctx.assid,
            usrid: data.onergy_js_ctx.usrid,
            id: getItem[0].ID,
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
/**MET_PADRAO =====================================================================================
 */
let json = {
    processo: '',
    horas: '',
    dataDate: '2022-11-10T03:38:07Z',
    data: '2022-11-10 00:38:07',
    load_index_equipe: 'COL',
    load_index_id_equipe: '',
    load_index_id_do_card: '1e6d6595-083f-4bb8-b82c-e9054e9dc8f3',
    planilha: [
        {
            Url: 'https://onebackupservices.blob.core.windows.net/67c0b77d-abae-4c48-ba4b-6c8faf27e14a/tablas_maestras_v6.xlsxf4bbbf0c-983b-4295-882f-411c401980ee.xlsx?sv=2018-03-28&sr=b&sig=NwP5cLGNOGT1hlY9SXf64vUyHgBp6HtsCUYvflFTzaI%3D&se=2023-05-29T03%3A37%3A59Z&sp=r',
            UrlAzure:
                'https://onebackupservices.blob.core.windows.net/67c0b77d-abae-4c48-ba4b-6c8faf27e14a/tablas_maestras_v6.xlsxf4bbbf0c-983b-4295-882f-411c401980ee.xlsx?sv=2018-03-28&sr=b&sig=NwP5cLGNOGT1hlY9SXf64vUyHgBp6HtsCUYvflFTzaI%3D&se=2023-05-29T03%3A37%3A59Z&sp=r',
            Name: 'tablas_maestras_v6.xlsx',
        },
    ],
    load_index_tab_excel: 'informacion_cuenta',
    load_index_id: '1a86654a-fda1-413f-9b84-1ab4c46918b0',
    em_caso_de_duplicidade: '1',
    processamento: 'Carga de informacion_cuenta iniciada',
    time: '0:37',
    em_caso_de_duplicidade_desc: 'Sobrescribir',
    oneTemplateTitle: '',
    ass_id: '67c0b77d-abae-4c48-ba4b-6c8faf27e14a',
    assid: '67c0b77d-abae-4c48-ba4b-6c8faf27e14a',
    fedid: '22b40d7c-a3d6-41cb-bc34-b164a38f5d4f',
    fdtid: '0e8dc4f0-4a4f-4fb1-8268-423b45128203',
    usrid: '0c44d4fc-d654-405b-9b8f-7fea162948b5',
    email: 'admin-colombia@atc.com.co',
    onergy_rolid: 'e4d0298c-245e-454a-89d4-8f27aef8645b',
    timezone: null,
    onergy_js_ctx: {
        assid: '67c0b77d-abae-4c48-ba4b-6c8faf27e14a',
        fedid: '22b40d7c-a3d6-41cb-bc34-b164a38f5d4f',
        fdtid: '0e8dc4f0-4a4f-4fb1-8268-423b45128203',
        usrid: '0c44d4fc-d654-405b-9b8f-7fea162948b5',
        insertDt: '2022-11-10T03:38:09.217Z',
        updateDt: '2022-11-10T03:38:09.217Z',
        cur_userid: '0c44d4fc-d654-405b-9b8f-7fea162948b5',
        email: 'admin-colombia@atc.com.co',
        user_name: 'Administrador Colômbia',
        onergy_rolid: 'e4d0298c-245e-454a-89d4-8f27aef8645b',
        praid: 'ce09b372-e6a6-4651-af55-b6426d4ecfde',
        pcvid: 'a79bb7e7-634e-4502-9eb4-a069a58ecd82',
        prcid: '0da6dd0d-3707-0c6c-c387-0a332c9bce38',
        timezone: null,
        timezone_value: '-03:00',
        pubNubHook: null,
    },
    id_upload_planilha: '2033c5c0-0427-33b2-4a0e-1c42a0e8902b',
};

init(JSON.stringify(json));
