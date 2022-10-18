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
 * Esconder Menu: Não
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
async function postStatus(status_desc, statusPost, data) {
    let postInfo = {
        processamento: status_desc,
        horas: data.time,
        processo: statusPost,
    };
    //!node:test (unhide log + return)
    // onergy.log(`JFS: postStatus:postInfo sendItem=>postInfo: ${JSON.stringify(postInfo)}`);
    // return true;

    //*consulta id do status e envia update para card de carga
    let cargaGeralID = '181c67a8-e7a9-4c9a-9ea1-ca4719c0e23f';
    let strFiltro = gerarFiltro('_id', data.id_upload_planilha);
    let strResult = await getOnergyItem(cargaGeralID, data.assid, data.usrid, strFiltro);

    let postResult = await sendItemToOnergy(cargaGeralID, data.usrid, data.assid, postInfo, data.id_upload_planilha, '', true, false, false);
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
    let horaTimezoneFormat = JSON.stringify(horaTimezone).padStart(2, '0') + ':' + arrayHora[1].padStart(2, '0');
    return dataHojeFormatada + ' ' + horaTimezoneFormat;
}
async function init(json) {
    let data = JSON.parse(json);

    //*cloud:onergy segue UTC+0, node:test segue UTC-3
    let dataHoje = new Date();
    let time = gerarDataHora(dataHoje, -5); //?Bogota
    let arrayPost = [];
    let statusPost = [];
    let status_desc;

    //*pesq.ref:indice_carga
    let tabExcelID = data.load_index_id_do_card;
    let indiceCargaID = '9a6e262f-e463-4c5d-9d8b-0fd8343b2f02';
    let cardID = await getOnergyItem(indiceCargaID, data.assid, data.usrid, gerarFiltro('id_do_card', tabExcelID));

    //*upload planilha
    let strArrExcel = await ReadExcelToJson({
        url: data.planilha[0].UrlAzure,
    });
    let dataExcel = JSON.parse(strArrExcel);

    //*se tab excel não existir em carga indice, gera erro
    let tabExcel = data.load_index_tab_excel;
    let cargaIndiceNome = cardID[0].UrlJsonContext.tab_excel;
    if (cargaIndiceNome == tabExcel) {
        let nomePlanilha = data.planilha[0].Name;

        //*se não existir dados na planilha, gera erro
        if (dataExcel != null) {
            let ctxExcel = dataExcel[tabExcel];

            //*se não existir conteúdo na planilha, gera erro
            if (ctxExcel.length > 0) {
                let arrayObj = ctxExcel[0];
                let fielName = Object.keys(arrayObj);

                //*status:iniciando
                status_desc = `Cargando ${ctxExcel.length} registros de ${tabExcel}`;
                statusPost.push(`${time}, ${status_desc}`);
                await postStatus(status_desc, statusPost, data);
                statusPost = statusPost.concat('\n');

                //*para cada linha da planilha (exceto cabeçalho) gera objeto
                for (let x in ctxExcel) {
                    let objLine = {
                        nomePlanilhaCarga: nomePlanilha,
                    };

                    //*para cada coluna da planilha gera propriedade
                    for (let n in fielName) {
                        let name = fielName[n];
                        let val = ctxExcel[x];

                        //*se coluna contiver etiqueta, trata valor de acordo com tipo
                        if (name.includes('{{int}}' || '{{INT}}')) {
                            name = name.replace('{{int}}', '');
                            name = name.replace('{{INT}}', '');
                            val[name] = parseInt(val[name]);
                        } else if (name.includes('{{float}}' || '{{FLOAT}}')) {
                            name = name.replace('{{float}}', '');
                            name = name.replace('{{FLOAT}}', '');
                            val[name] = parseFloat(val[name]);
                        } else if (name.includes('{{date}}' || '{{DATE}}')) {
                            name = name.replace('{{date}}', '');
                            name = name.replace('{{DATE}}', '');
                            val[name] = new Date(val[name]);
                        } else if (name.includes('{{bool}}' || '{{BOOL}}')) {
                            name = name.replace('{{bool}}', '');
                            name = name.replace('{{BOOL}}', '');
                            val[name] = val[name] == 'true' ? true : false;
                        }

                        //*se valor for string, remove espaços em branco
                        if (typeof val[name] == 'string') {
                            objLine[name] = val[name].trim();
                        } else {
                            objLine[name] = val[name];
                        }
                    }
                    arrayPost.push(objLine);
                }

                //*se não existir dados no array de post, gera erro
                if (arrayPost.length > 0) {
                    let gridDestino = await getOnergyItem(tabExcelID, data.assid, data.usrid, null);

                    //*status:processando
                    status_desc = `Manejando ${arrayPost.length} registros de ${tabExcel}`;
                    statusPost.push(`${time}, ${status_desc}`);
                    await postStatus(status_desc, statusPost, data);
                    statusPost = statusPost.concat('\n');

                    //*para cada linha do array de post, verifica se existe registro no grid destino
                    for (let y in arrayPost) {
                        let objPost = arrayPost[y];
                        objPost.onergyteam_equipe = objPost.equipe;
                        objPost.onergyteam_id = objPost.id_equipe_txt;
                        delete objPost.id_equipe_txt;

                        //*aba:categorias
                        if (tabExcel == 'categorias') {
                            let isCategorias = gridDestino.filter((j) => j.UrlJsonContext.categorias == objPost.categorias);
                            if (!isCategorias || data.em_caso_de_duplicidade == '1') {
                                objPost.categorias = objPost.categorias;
                            }

                            //!node:test (unhide log and hide sendItem)
                            // onergy.log(`JFS: aba:categorias sendItem=>objPost: ${JSON.stringify(objPost)}`);
                            await sendItemToOnergy(tabExcelID, data.usrid, data.assid, objPost, '', 'categorias', true, false, false);
                        }

                        //*aba:departamento
                        if (tabExcel == 'departamento') {
                            let isDepartamento = gridDestino.filter((j) => j.UrlJsonContext.uf == objPost.departamento_sigla);
                            if (!isDepartamento || data.em_caso_de_duplicidade == '1') {
                                objPost.uf = objPost.departamento_sigla;
                                objPost.estado = objPost.departamento;
                                delete objPost.departamento_sigla;
                                delete objPost.departamento;
                            }

                            //!node:test (unhide log and hide sendItem)
                            // onergy.log(`JFS: aba:departamento sendItem=>objPost: ${JSON.stringify(objPost)}`);
                            await sendItemToOnergy(tabExcelID, data.usrid, data.assid, objPost, '', 'uf', true, false, false);
                        }

                        //*aba:municipio
                        if (tabExcel == 'municipio') {
                            //*pesq.ref:departamento
                            let idDepartamento = '132b8394-2193-4d83-a399-08f4cde70873';
                            let getDepartamento = await getOnergyItem(idDepartamento, data.assid, data.usrid, null);
                            let isDepartamento = getDepartamento.filter((j) => j.UrlJsonContext.uf == objPost.departamento);
                            if (!isDepartamento) {
                                status_desc = `ERROR: no hay "${objPost.departamento}" registrado para ${tabExcel} de "${objPost.municipio}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                await postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }

                            let isMunicipio = gridDestino.filter((j) => j.UrlJsonContext.municipio == objPost.municipio);
                            if (!isMunicipio || data.em_caso_de_duplicidade == '1') {
                                objPost.loca_uf_uf = isDepartamento.length > 0 ? isDepartamento[0].UrlJsonContext.uf : '';
                                objPost.loca_uf_id = isDepartamento.length > 0 ? isDepartamento[0].ID : '';
                                objPost.municipio = objPost.municipio;
                                delete objPost.departamento;
                            }

                            //!node:test (unhide log and hide sendItem)
                            // onergy.log(`JFS: aba:municipio sendItem=>objPost: ${JSON.stringify(objPost)}`);
                            await sendItemToOnergy(tabExcelID, data.usrid, data.assid, objPost, '', 'municipio', true, false, false);
                        }

                        //*aba:compania_atc
                        if (tabExcel == 'compania_atc') {
                            let isCompaniaATC = gridDestino.filter((j) => j.UrlJsonContext.site == objPost.compania_atc);
                            if (!isCompaniaATC || data.em_caso_de_duplicidade == '1') {
                                objPost.site = objPost.compania_atc;
                                delete objPost.compania_atc;
                            }

                            //!node:test (unhide.log and hide sendItem)
                            // onergy.log(`JFS: aba:compania_atc sendItem=>objPost: ${JSON.stringify(objPost)}`);
                            await sendItemToOnergy(tabExcelID, data.usrid, data.assid, objPost, '', 'site', true, false, false);
                        }

                        //*aba:forma_pago
                        if (tabExcel == 'forma_pago') {
                            let isFormaPago = gridDestino.filter((j) => j.UrlJsonContext.formas_de_pagamentos == objPost.forma_pago);
                            if (!isFormaPago || data.em_caso_de_duplicidade == '1') {
                                objPost.formas_de_pagamentos = objPost.forma_pago;
                                delete objPost.forma_pago;
                            }

                            //!node:test (unhide.log and hide sendItem)
                            // onergy.log(`JFS: aba:forma_pago sendItem=>objPost: ${JSON.stringify(objPost)}`);
                            await sendItemToOnergy(tabExcelID, data.usrid, data.assid, objPost, '', 'formas_de_pagamentos', true, false, false);
                        }

                        //*aba:frecuencia_pago
                        if (tabExcel == 'frecuencia_pago') {
                            let isFrequencia = gridDestino.filter((j) => j.UrlJsonContext.frequencia == objPost.frecuencia_pago);
                            if (!isFrequencia || data.em_caso_de_duplicidade == '1') {
                                objPost.frequencia = objPost.frecuencia_pago;
                                delete objPost.frecuencia_pago;
                            }

                            let isFrequenciaMeses = gridDestino.filter((j) => j.UrlJsonContext.frequencia_em_meses == objPost.frecuencia_meses);
                            if (!isFrequenciaMeses || data.em_caso_de_duplicidade == '1') {
                                objPost.frequencia_em_meses = objPost.frecuencia_meses;
                                delete objPost.frecuencia_meses;
                            }

                            //!node:test (unhide.log and hide sendItem)
                            // onergy.log(`JFS: aba:frecuencia_pago sendItem=>objPost: ${JSON.stringify(objPost)}`);
                            await sendItemToOnergy(tabExcelID, data.usrid, data.assid, objPost, '', 'frequencia', true, false, false);
                        }

                        //*aba:lecturas
                        if (tabExcel == 'lecturas') {
                            let isLecturas = gridDestino.filter((j) => j.UrlJsonContext.LCT_ferramentas == objPost.herramientas);
                            if (!isLecturas || data.em_caso_de_duplicidade == '1') {
                                objPost.LCT_ferramentas = objPost.herramientas;
                                delete objPost.herramientas;
                            }

                            //!node:test (unhide.log and hide sendItem)
                            // onergy.log(`JFS: aba:lecturas sendItem=>objPost: ${JSON.stringify(objPost)}`);
                            await sendItemToOnergy(tabExcelID, data.usrid, data.assid, objPost, '', 'LCT_ferramentas', true, false, false);
                        }

                        //*aba:portafolio_atc
                        if (tabExcel == 'portafolio_atc') {
                            let isPortafolioATC = gridDestino.filter((j) => j.UrlJsonContext.tipo_portifolio == objPost.portafolio_atc);
                            if (!isPortafolioATC || data.em_caso_de_duplicidade == '1') {
                                objPost.tipo_portifolio = objPost.portafolio_atc;
                                delete objPost.portafolio_atc;
                            }

                            //!node:test (unhide.log and hide sendItem)
                            // onergy.log(`JFS: aba:portafolio_atc sendItem=>objPost: ${JSON.stringify(objPost)}`);
                            await sendItemToOnergy(tabExcelID, data.usrid, data.assid, objPost, '', 'tipo_portifolio', true, false, false);
                        }

                        //*aba:regional_atc
                        if (tabExcel == 'regional_atc') {
                            let isRegionalATC = gridDestino.filter((j) => j.UrlJsonContext.regional == objPost.regional_atc);
                            if (!isRegionalATC || data.em_caso_de_duplicidade == '1') {
                                objPost.regional = objPost.regional_atc;
                                delete objPost.regional_atc;
                            }

                            //!node:test (unhide.log and hide sendItem)
                            // onergy.log(`JFS: aba:regional_atc sendItem=>objPost: ${JSON.stringify(objPost)}`);
                            await sendItemToOnergy(tabExcelID, data.usrid, data.assid, objPost, '', 'regional', true, false, false);
                        }

                        //*aba:servicios
                        if (tabExcel == 'servicios') {
                            let isServicios = gridDestino.filter((j) => j.UrlJsonContext.servicos == objPost.servicios);
                            if (!isServicios || data.em_caso_de_duplicidade == '1') {
                                objPost.servicos = objPost.servicios;
                                delete objPost.servicios;
                            }

                            //!node:test (unhide.log and hide sendItem)
                            // onergy.log(`JFS: aba:servicios sendItem=>objPost: ${JSON.stringify(objPost)}`);
                            await sendItemToOnergy(tabExcelID, data.usrid, data.assid, objPost, '', 'servicos', true, false, false);
                        }

                        //*aba:estado_cuenta
                        if (tabExcel == 'estado_cuenta') {
                            let isEstadoCuenta = gridDestino.filter((j) => j.UrlJsonContext.status_conta == objPost.estado_cuenta);
                            if (!isEstadoCuenta || data.em_caso_de_duplicidade == '1') {
                                objPost.status_conta = objPost.estado_cuenta;
                                delete objPost.estado_cuenta;
                            }

                            //!node:test (unhide.log and hide sendItem)
                            // onergy.log(`JFS: aba:estado_cuenta sendItem=>objPost: ${JSON.stringify(objPost)}`);
                            await sendItemToOnergy(tabExcelID, data.usrid, data.assid, objPost, '', 'status_conta', true, false, false);
                        }

                        //*aba:estado_sitio
                        if (tabExcel == 'estado_sitio') {
                            let isEstadoSitio = gridDestino.filter((j) => j.UrlJsonContext.status == objPost.estado_sitio);
                            if (!isEstadoSitio || data.em_caso_de_duplicidade == '1') {
                                objPost.status = objPost.estado_sitio;
                                delete objPost.estado_sitio;
                            }

                            //!node:test (unhide.log and hide sendItem)
                            // onergy.log(`JFS: aba:estado_sitio sendItem=>objPost: ${JSON.stringify(objPost)}`);
                            await sendItemToOnergy(tabExcelID, data.usrid, data.assid, objPost, '', 'status', true, false, false);
                        }

                        //*aba:sujeto_pasivo
                        if (tabExcel == 'sujeto_pasivo') {
                            let isSujetoPasivo = gridDestino.filter((j) => j.UrlJsonContext.sujeito == objPost.sujeto_pasivo);
                            if (!isSujetoPasivo || data.em_caso_de_duplicidade == '1') {
                                objPost.sujeito = objPost.sujeto_pasivo;
                                delete objPost.sujeto_pasivo;
                            }

                            //!node:test (unhide.log and hide sendItem)
                            // onergy.log(`JFS: aba:sujeto_pasivo sendItem=>objPost: ${JSON.stringify(objPost)}`);
                            await sendItemToOnergy(tabExcelID, data.usrid, data.assid, objPost, '', 'sujeito', true, false, false);
                        }

                        //*aba:tipo_cobro
                        if (tabExcel == 'tipo_cobro') {
                            let isTipoCobro = gridDestino.filter((j) => j.UrlJsonContext.tipos_cobrancas == objPost.tipo_cobro);
                            if (!isTipoCobro || data.em_caso_de_duplicidade == '1') {
                                objPost.tipos_cobrancas = objPost.tipo_cobro;
                                delete objPost.tipo_cobro;
                            }

                            //!node:test (unhide.log and hide sendItem)
                            // onergy.log(`JFS: aba:tipo_cobro sendItem=>objPost: ${JSON.stringify(objPost)}`);
                            await sendItemToOnergy(tabExcelID, data.usrid, data.assid, objPost, '', 'tipos_cobrancas', true, false, false);
                        }

                        //*aba:tipo_tercero
                        if (tabExcel == 'tipo_tercero') {
                            let isTipoTercero = gridDestino.filter((j) => j.UrlJsonContext.tipo_de_terceiro == objPost.tipo_tercero);
                            if (!isTipoTercero || data.em_caso_de_duplicidade == '1') {
                                objPost.tipo_de_terceiro = objPost.tipo_tercero;
                                delete objPost.tipo_tercero;
                            }

                            //!node:test (unhide.log and hide sendItem)
                            // onergy.log(`JFS: aba:tipo_tercero sendItem=>objPost: ${JSON.stringify(objPost)}`);
                            await sendItemToOnergy(tabExcelID, data.usrid, data.assid, objPost, '', 'tipo_de_terceiro', true, false, false);
                        }

                        //*aba:tipo_acceso
                        if (tabExcel == 'tipo_acceso') {
                            let isTipoAcesso = gridDestino.filter((j) => j.UrlJsonContext.tipo_de_acesso == objPost.tipo_acceso);
                            if (!isTipoAcesso || data.em_caso_de_duplicidade == '1') {
                                objPost.tipo_de_acesso = objPost.tipo_acceso;
                                delete objPost.tipo_acceso;
                            }

                            //!node:test (unhide.log and hide sendItem)
                            // onergy.log(`JFS: aba:tipo_acceso sendItem=>objPost: ${JSON.stringify(objPost)}`);
                            await sendItemToOnergy(tabExcelID, data.usrid, data.assid, objPost, '', 'tipo_de_acesso', true, false, false);
                        }

                        //*aba:tipo_cuenta
                        if (tabExcel == 'tipo_cuenta') {
                            let isTipoCuenta = gridDestino.filter((j) => j.UrlJsonContext.TC_tipo_de_conta == objPost.tipo_cuenta);
                            if (!isTipoCuenta || data.em_caso_de_duplicidade == '1') {
                                objPost.TC_tipo_de_conta = objPost.tipo_cuenta;
                                delete objPost.tipo_cuenta;
                            }

                            //!node:test (unhide.log and hide sendItem)
                            // onergy.log(`JFS: aba:tipo_cuenta sendItem=>objPost: ${JSON.stringify(objPost)}`);
                            await sendItemToOnergy(tabExcelID, data.usrid, data.assid, objPost, '', 'TC_tipo_de_conta', true, false, false);
                        }

                        //*aba:proveedores
                        if (tabExcel == 'proveedores') {
                            let isNITProveedor = gridDestino.filter((j) => j.UrlJsonContext.nit_provedor == objPost.nit_proveedor);
                            if (!isNITProveedor || data.em_caso_de_duplicidade == '1') {
                                objPost.nit_provedor = objPost.nit_proveedor;
                                delete objPost.nit_proveedor;
                            }

                            let isNombreProveedor = gridDestino.filter((j) => j.UrlJsonContext.nome_provedor == objPost.nombre_proveedor);
                            if (!isNombreProveedor || data.em_caso_de_duplicidade == '1') {
                                objPost.nome_provedor = objPost.nombre_proveedor;
                                delete objPost.nombre_proveedor;
                            }

                            let isNITBeneficiario = gridDestino.filter((j) => j.UrlJsonContext.nit_beneficiario == objPost.nit_beneficiario);
                            if (!isNITBeneficiario || data.em_caso_de_duplicidade == '1') {
                                objPost.nit_beneficiario = objPost.nit_beneficiario;
                            }

                            let isNombreBeneficiario = gridDestino.filter((j) => j.UrlJsonContext.beneficiario == objPost.nombre_beneficiario);
                            if (!isNombreBeneficiario || data.em_caso_de_duplicidade == '1') {
                                objPost.beneficiario = objPost.nombre_beneficiario;
                                delete objPost.nombre_beneficiario;
                            }

                            //*pesq.ref:tipo_tercero
                            let idTipoTercero = '70110b99-aa96-4e25-b1b2-177484668700';
                            let getTipoTercero = await getOnergyItem(idTipoTercero, data.assid, data.usrid, null);
                            let isTipoTercero = getTipoTercero.filter((j) => j.UrlJsonContext.tipo_de_terceiro == objPost.tipo_tercero);
                            if (!isTipoTercero) {
                                status_desc = `ERROR: no hay "${objPost.tipo_tercero}" registrado para ${tabExcel} de "${objPost.nit_proveedor}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                await postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }

                            let isPrvdTipoTercero = gridDestino.filter((j) => j.UrlJsonContext.tp3o_tipo_de_terceiro == objPost.tipo_tercero);
                            if (!isPrvdTipoTercero || data.em_caso_de_duplicidade == '1') {
                                objPost.tp3o_tipo_de_terceiro = isTipoTercero.length > 0 ? isTipoTercero[0].UrlJsonContext.tipo_de_terceiro : '';
                                objPost.tp3o_id = isTipoTercero.length > 0 ? isTipoTercero[0].ID : '';
                                delete objPost.tipo_tercero;
                            }

                            let isNombreComercial = gridDestino.filter((j) => j.UrlJsonContext.nome_comercial == objPost.nombre_comercial);
                            if (!isNombreComercial || data.em_caso_de_duplicidade == '1') {
                                objPost.nome_comercial = objPost.nombre_comercial;
                                delete objPost.nombre_comercial;
                            }

                            //*lst.susp:tiene_cuenta_padre
                            objPost.tiene_cuenta_padre = objPost.tiene_cuenta_padre == 'SI' ? 'sim' : 'nao';
                            let isTieneCuentaPadre = gridDestino.filter((j) => j.UrlJsonContext.prvd__tem_conta_pai == objPost.tiene_cuenta_padre);
                            if (!isTieneCuentaPadre || data.em_caso_de_duplicidade == '1') {
                                objPost.prvd__tem_conta_pai = objPost.tiene_cuenta_padre;
                                objPost.prvd__tem_conta_pai_desc = objPost.tiene_cuenta_padre == 'sim' ? 'Sim' : 'Não';
                                delete objPost.tiene_cuenta_padre;
                            }

                            //*pesq.ref:tipo_acceso
                            let idTipoAcceso = '62e9a129-73b5-4819-9c16-f1d4bdababde';
                            let getTipoAcceso = await getOnergyItem(idTipoAcceso, data.assid, data.usrid, null);
                            let isTipoAcceso = getTipoAcceso.filter((j) => j.UrlJsonContext.tipo_de_acesso == objPost.tipo_acceso);
                            if (!isTipoAcceso) {
                                status_desc = `ERROR: no hay "${objPost.tipo_acceso}" registrado para ${tabExcel} de "${objPost.nit_proveedor}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                await postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }

                            let isPrvdTipoAcceso = gridDestino.filter((j) => j.UrlJsonContext.tp_acces_tipo_de_acesso == objPost.tipo_acceso);
                            if (!isPrvdTipoAcceso || data.em_caso_de_duplicidade == '1') {
                                objPost.tp_acces_tipo_de_acesso = isTipoAcceso.length > 0 ? isTipoAcceso[0].UrlJsonContext.tipo_de_acesso : '';
                                objPost.tp_acces_id = isTipoAcceso.length > 0 ? isTipoAcceso[0].ID : '';
                                delete objPost.tipo_acceso;
                            }

                            let isApodoProveedor = gridDestino.filter((j) => j.UrlJsonContext.apelido_provedor == objPost.apodo_proveedor);
                            if (!isApodoProveedor || data.em_caso_de_duplicidade == '1') {
                                objPost.apelido_provedor = objPost.apodo_proveedor;
                                delete objPost.apodo_proveedor;
                            }

                            let isLinkWeb = gridDestino.filter((j) => j.UrlJsonContext.link_web == objPost.link_web);
                            if (!isLinkWeb || data.em_caso_de_duplicidade == '1') {
                                objPost.link_web = objPost.link_web;
                            }

                            let isUsuario = gridDestino.filter((j) => j.UrlJsonContext.usuario == objPost.usuario);
                            if (!isUsuario || data.em_caso_de_duplicidade == '1') {
                                objPost.usuario = objPost.usuario;
                            }

                            let isContrasena = gridDestino.filter((j) => j.UrlJsonContext.senha == objPost.contrasena);
                            if (!isContrasena || data.em_caso_de_duplicidade == '1') {
                                objPost.senha = objPost.contrasena;
                                delete objPost.contrasena;
                            }

                            //!node:test (unhide.log and hide sendItem)
                            // onergy.log(`JFS: aba:proveedores sendItem=>objPost: ${JSON.stringify(objPost)}`);
                            await sendItemToOnergy(tabExcelID, data.usrid, data.assid, objPost, '', 'nit_provedor', true, false, false);
                        }

                        //*aba:estrato
                        if (tabExcel == 'estrato') {
                            let isEstrato = gridDestino.filter((j) => j.UrlJsonContext.LST_estrato == objPost.estrato);
                            if (!isEstrato || data.em_caso_de_duplicidade == '1') {
                                objPost.LST_estrato = objPost.estrato;
                                delete objPost.estrato;
                            }

                            //!node:test (unhide log and hide sendItem)
                            // onergy.log(`JFS: aba:estrato sendItem=>objPost: ${JSON.stringify(objPost)}`);
                            await sendItemToOnergy(tabExcelID, data.usrid, data.assid, objPost, '', 'LST_estrato', true, false, false);
                        }

                        //*aba:nivel_tension
                        if (tabExcel == 'nivel_tension') {
                            let isNivelTension = gridDestino.filter((j) => j.UrlJsonContext.NVT_nivel == objPost.nivel_tension);
                            if (!isNivelTension || data.em_caso_de_duplicidade == '1') {
                                objPost.NVT_nivel = objPost.nivel_tension;
                                delete objPost.nivel_tension;
                            }

                            //!node:test (unhide log and hide sendItem)
                            // onergy.log(`JFS: aba:nivel_tension sendItem=>objPost: ${JSON.stringify(objPost)}`);
                            await sendItemToOnergy(tabExcelID, data.usrid, data.assid, objPost, '', 'NVT_nivel', true, false, false);
                        }

                        //*aba:clientes
                        if (tabExcel == 'clientes') {
                            let isNITCliente = gridDestino.filter((j) => j.UrlJsonContext.COLC_nit_cliente == objPost.nit_cliente);
                            if (!isNITCliente || data.em_caso_de_duplicidade == '1') {
                                objPost.COLC_nit_cliente = objPost.nit_cliente;
                                delete objPost.nit_cliente;
                            }

                            let isNombreCliente = gridDestino.filter((j) => j.UrlJsonContext.COLC_nome_cliente == objPost.nombre_cliente);
                            if (!isNombreCliente || data.em_caso_de_duplicidade == '1') {
                                objPost.COLC_nome_cliente = objPost.nombre_cliente;
                                delete objPost.nombre_cliente;
                            }

                            let isNombreOficial = gridDestino.filter((j) => j.UrlJsonContext.COLC_nome_oficial == objPost.nombre_oficial);
                            if (!isNombreOficial || data.em_caso_de_duplicidade == '1') {
                                objPost.COLC_nome_oficial = objPost.nombre_oficial;
                                delete objPost.nombre_oficial;
                            }

                            let isCodigoCliente = gridDestino.filter((j) => j.UrlJsonContext.COLC_codigo_cliente == objPost.codigo_cliente);
                            if (!isCodigoCliente || data.em_caso_de_duplicidade == '1') {
                                objPost.COLC_codigo_cliente = objPost.codigo_cliente;
                                delete objPost.codigo_cliente;
                            }

                            let isDireccion = gridDestino.filter((j) => j.UrlJsonContext.COLC_endereco == objPost.direccion);
                            if (!isDireccion || data.em_caso_de_duplicidade == '1') {
                                objPost.COLC_endereco = objPost.direccion;
                                delete objPost.direccion;
                            }

                            //*pesq.ref:municipio
                            let idMunicipio = 'a95b4721-fc79-445c-b964-14a4ccbf1d7b';
                            let getMunicipio = await getOnergyItem(idMunicipio, data.assid, data.usrid, null);
                            let isMunicipio = getMunicipio.filter((j) => j.UrlJsonContext.municipio == objPost.municipio);
                            if (!isMunicipio) {
                                status_desc = `ERROR: no hay "${objPost.municipio}" registrado para ${tabExcel} de "${objPost.nit_cliente}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                await postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }

                            let isColcMunicipio = gridDestino.filter((j) => j.UrlJsonContext.loca_cida_municipio__COLC_cidade == objPost.municipio);
                            if (!isColcMunicipio || data.em_caso_de_duplicidade == '1') {
                                objPost.loca_cida_municipio__COLC_cidade = isMunicipio.length > 0 ? isMunicipio[0].UrlJsonContext.municipio : '';
                                objPost.loca_cida_COLC_cidade_id = isMunicipio.length > 0 ? isMunicipio[0].ID : '';
                                objPost.loca_cida_loca_uf_uf = isMunicipio.length > 0 ? isMunicipio[0].UrlJsonContext.loca_uf_uf : '';
                                delete objPost.municipio;
                                delete objPost.departamento;
                            }

                            //!node:test (unhide log and hide sendItem)
                            // onergy.log(`JFS: aba:clientes sendItem=>objPost: ${JSON.stringify(objPost)}`);
                            await sendItemToOnergy(tabExcelID, data.usrid, data.assid, objPost, '', 'COLC_nit_cliente', true, false, false);
                        }

                        //*aba:regional_clientes
                        if (tabExcel == 'regional_clientes') {
                            //*id_one_ref:clientes
                            let paiGrid = '0694dd6e-299a-4b46-b8fd-5e08da24f72d';
                            let paiFiltro = gerarFiltro('COLC_nit_cliente', objPost.nit_cliente);
                            let paiRegistro = await getOnergyItem(paiGrid, data.assid, data.usrid, paiFiltro);

                            let isNITCliente = gridDestino.filter((j) => j.UrlJsonContext.RCS_nit_cliente == objPost.nit_cliente);
                            if (!isNITCliente || data.em_caso_de_duplicidade == '1') {
                                objPost.ID_ONE_REF = paiRegistro.length > 0 ? paiRegistro[0].ID : '';
                                objPost.RCS_nit_cliente = objPost.nit_cliente;
                                delete objPost.nit_cliente;
                            }

                            let isNombreRegional = gridDestino.filter((j) => j.UrlJsonContext.RCS_nome_regional == objPost.nombre_regional);
                            if (!isNombreRegional || data.em_caso_de_duplicidade == '1') {
                                objPost.RCS_nome_regional = objPost.nombre_regional;
                                delete objPost.nombre_regional;
                            }

                            //!node:test (unhide log and hide sendItem)
                            // onergy.log(`JFS: aba:contactos_clientes sendItem=>objPost: ${JSON.stringify(objPost)}`);
                            await sendItemToOnergy(tabExcelID, data.usrid, data.assid, objPost, '', 'RCS_nit_cliente', true, false, false);
                        }

                        //*aba:contactos_clientes
                        if (tabExcel == 'contactos_clientes') {
                            //*id_one_ref:clientes
                            let paiGrid = '0694dd6e-299a-4b46-b8fd-5e08da24f72d';
                            let paiFiltro = gerarFiltro('COLC_nit_cliente', objPost.nit_cliente);
                            let paiRegistro = await getOnergyItem(paiGrid, data.assid, data.usrid, paiFiltro);

                            let isNITCliente = gridDestino.filter((j) => j.UrlJsonContext.CCS_nit_cliente == objPost.nit_cliente);
                            if (!isNITCliente || data.em_caso_de_duplicidade == '1') {
                                objPost.ID_ONE_REF = paiRegistro.length > 0 ? paiRegistro[0].ID : '';
                                objPost.CCS_nit_cliente = objPost.nit_cliente;
                                delete objPost.nit_cliente;
                            }

                            //*pesq.ref:regional_clientes
                            let idRegionalClientes = 'b45777ee-f5f3-429c-9fd7-9ee4578b0b63';
                            let getRegionalClientes = await getOnergyItem(idRegionalClientes, data.assid, data.usrid, null);
                            let isRegionalClientes = getRegionalClientes.filter((j) => j.UrlJsonContext.RCS_nome_regional == objPost.nombre_regional);
                            if (!isRegionalClientes) {
                                status_desc = `ERROR: no hay "${objPost.nombre_regional}" registrado para ${tabExcel} de "${objPost.nit_cliente}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                await postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }

                            let isRcsRegionalClientes = gridDestino.filter(
                                (j) => j.UrlJsonContext.RCSRCS_nome_regional__CCS_nombre_regional == objPost.nombre_regional
                            );
                            if (!isRcsRegionalClientes || data.em_caso_de_duplicidade == '1') {
                                objPost.RCSRCS_nome_regional__CCS_nombre_regional =
                                    isRegionalClientes.length > 0 ? isRegionalClientes[0].UrlJsonContext.RCS_nome_regional : '';
                                objPost.RCSCCS_nombre_regional_id = isRegionalClientes.length > 0 ? isRegionalClientes[0].ID : '';
                                delete objPost.nombre_regional;
                            }

                            let isNombreContacto = gridDestino.filter((j) => j.UrlJsonContext.CCS_nombre_contacto == objPost.nombre_contacto);
                            if (!isNombreContacto || data.em_caso_de_duplicidade == '1') {
                                objPost.CCS_nombre_contacto = objPost.nombre_contacto;
                                delete objPost.nombre_contacto;
                            }

                            let isTelefonoCelular = gridDestino.filter((j) => j.UrlJsonContext.CCS_telefono_celular == objPost.telefono_celular);
                            if (!isTelefonoCelular || data.em_caso_de_duplicidade == '1') {
                                objPost.CCS_telefono_celular = objPost.telefono_celular;
                                delete objPost.telefono_celular;
                            }

                            let isTelefonoFijo = gridDestino.filter((j) => j.UrlJsonContext.CCS_telefono_fijo == objPost.telefono_fijo);
                            if (!isTelefonoFijo || data.em_caso_de_duplicidade == '1') {
                                objPost.CCS_telefono_fijo = objPost.telefono_fijo;
                                delete objPost.telefono_fijo;
                            }

                            let isCorreoEletronico = gridDestino.filter((j) => j.UrlJsonContext.CCS_correo_electronico == objPost.correo_electronico);
                            if (!isCorreoEletronico || data.em_caso_de_duplicidade == '1') {
                                objPost.CCS_correo_electronico = objPost.correo_electronico;
                                delete objPost.correo_electronico;
                            }

                            //!node:test (unhide log and hide sendItem)
                            // onergy.log(`JFS: aba:contactos_clientes sendItem=>objPost: ${JSON.stringify(objPost)}`);
                            await sendItemToOnergy(tabExcelID, data.usrid, data.assid, objPost, '', 'CCS_nit_cliente', true, false, false);
                        }

                        //*aba:portafolio_clientes
                        if (tabExcel == 'portafolio_clientes') {
                            //*id_one_ref:clientes
                            let paiGrid = '0694dd6e-299a-4b46-b8fd-5e08da24f72d';
                            let paiFiltro = gerarFiltro('COLC_nit_cliente', objPost.nit_cliente);
                            let paiRegistro = await getOnergyItem(paiGrid, data.assid, data.usrid, paiFiltro);

                            let isNITCliente = gridDestino.filter((j) => j.UrlJsonContext.PCS_nit_cliente == objPost.nit_cliente);
                            if (!isNITCliente || data.em_caso_de_duplicidade == '1') {
                                objPost.ID_ONE_REF = paiRegistro.length > 0 ? paiRegistro[0].ID : '';
                                objPost.PCS_nit_cliente = objPost.nit_cliente;
                                delete objPost.nit_cliente;
                            }

                            let isPortafolioCliente = gridDestino.filter((j) => j.UrlJsonContext.PCS_portafolio_cliente == objPost.portafolio_cliente);
                            if (!isPortafolioCliente || data.em_caso_de_duplicidade == '1') {
                                objPost.PCS_portafolio_cliente = objPost.portafolio_cliente;
                                delete objPost.portafolio_cliente;
                            }

                            //!node:test (unhide log and hide sendItem)
                            // onergy.log(`JFS: aba:portafolio_clientes sendItem=>objPost: ${JSON.stringify(objPost)}`);
                            await sendItemToOnergy(tabExcelID, data.usrid, data.assid, objPost, '', 'PCS_nit_cliente', true, false, false);
                        }

                        //*aba:sitios
                        //TODO revisar jsons
                        if (tabExcel == 'sitios') {
                            let duplicadorAssetNumber = gridDestino.filter((j) => j.UrlJsonContext.asset_number == arrayPost[y].asset_number);
                            if (!duplicadorAssetNumber || data.em_caso_de_duplicidade == '1') {
                                arrayPost[y].asset_number = arrayPost[y].asset_number;
                            }
                            let duplicadorProfitCostCenter = gridDestino.filter((j) => j.UrlJsonContext.profit_cost_center == arrayPost[y].profit_cost_center);
                            if (!duplicadorProfitCostCenter || data.em_caso_de_duplicidade == '1') {
                                arrayPost[y].profit_cost_center = arrayPost[y].profit_cost_center;
                            }
                            let duplicadorNomeSitio = gridDestino.filter((j) => j.UrlJsonContext.site_name == arrayPost[y].nombre_sitio);
                            if (!duplicadorNomeSitio || data.em_caso_de_duplicidade == '1') {
                                arrayPost[y].site_name = arrayPost[y].nombre_sitio;
                            }

                            //*pesq.ref:compania_atc
                            let empresaATCGrid = '8803f10a-9c32-4c4f-8bd6-8e959ed24277';
                            let registroEmpresaATC = await getOnergyItem(empresaATCGrid, data.assid, data.usrid, null);
                            let retornoEmpresaATC = registroEmpresaATC.filter((j) => j.UrlJsonContext.site == arrayPost[y].compania_atc);
                            if (!retornoEmpresaATC) {
                                status_desc = `ERROR: no hay "${arrayPost[y].compania_atc}" registrado para ${tabExcel} de "${arrayPost[y].asset_number}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                await postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }
                            let duplicadorEmpresaATC = gridDestino.filter((j) => j.UrlJsonContext.emp_atc_site__empresa_atc == arrayPost[y].compania_atc);
                            if (!duplicadorEmpresaATC || data.em_caso_de_duplicidade == '1') {
                                arrayPost[y].emp_atc_site__empresa_atc = retornoEmpresaATC[0] ? retornoEmpresaATC[0].UrlJsonContext.site : '';
                                arrayPost[y].emp_atc_empresa_atc_id = retornoEmpresaATC[0] ? retornoEmpresaATC[0].ID : '';
                            }

                            //*pesq.ref:municipio
                            let MunicipioGrid = 'a95b4721-fc79-445c-b964-14a4ccbf1d7b';
                            let registroMunicipio = await getOnergyItem(MunicipioGrid, data.assid, data.usrid, null);
                            let retornoMunicipio = registroMunicipio.filter((j) => j.UrlJsonContext.municipio == arrayPost[y].municipio);
                            if (!retornoMunicipio) {
                                status_desc = `ERROR: no hay "${arrayPost[y].municipio}" registrado para ${tabExcel} de "${arrayPost[y].asset_number}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                await postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }
                            let duplicadorMunicipio = gridDestino.filter((j) => j.UrlJsonContext.loca_cida_municipio == arrayPost[y].municipio);
                            if (!duplicadorMunicipio || data.em_caso_de_duplicidade == '1') {
                                arrayPost[y].loca_cida_municipio = retornoMunicipio[0] ? retornoMunicipio[0].UrlJsonContext.municipio : '';
                                arrayPost[y].loca_cida_id = retornoMunicipio[0] ? retornoMunicipio[0].ID : '';
                                arrayPost[y].loca_uf_uf = retornoMunicipio[0] ? retornoMunicipio[0].UrlJsonContext.uf : '';
                                arrayPost[y].loca_uf_id = retornoMunicipio[0] ? retornoMunicipio[0].UrlJsonContext.uf_id : '';
                            }

                            let duplicadorCodigoAncora = gridDestino.filter((j) => j.UrlJsonContext.codigo_ancora == arrayPost[y].codigo_anchor);
                            if (!duplicadorCodigoAncora || data.em_caso_de_duplicidade == '1') {
                                arrayPost[y].codigo_ancora = arrayPost[y].codigo_anchor;
                            }
                            let duplicadorLogradouro = gridDestino.filter((j) => j.UrlJsonContext.logradouro == arrayPost[y].direccion);
                            if (!duplicadorLogradouro || data.em_caso_de_duplicidade == '1') {
                                arrayPost[y].logradouro = arrayPost[y].direccion;
                            }

                            //*pesq.ref:estado_sitio
                            let StatusSiteGrid = 'f0ee1dd9-bb48-4aef-9f77-43e357870a31';
                            let registroStatusSite = await getOnergyItem(StatusSiteGrid, data.assid, data.usrid, null);
                            let retornoStatusSite = registroStatusSite.filter((j) => j.UrlJsonContext.status == arrayPost[y].estado_sitio);
                            if (!retornoStatusSite) {
                                status_desc = `ERROR: no hay "${arrayPost[y].municipio}" registrado para ${tabExcel} de "${arrayPost[y].asset_number}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                await postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }
                            let duplicadorStatusSite = gridDestino.filter((j) => j.UrlJsonContext.STAstatus__status_do_site == arrayPost[y].estado_sitio);
                            if (!duplicadorStatusSite || data.em_caso_de_duplicidade == '1') {
                                arrayPost[y].sta_site_status__status_do_site = retornoStatusSite[0] ? retornoStatusSite[0].UrlJsonContext.status : '';
                                arrayPost[y].sta_site_status_do_site_id = retornoStatusSite[0] ? retornoStatusSite[0].ID : '';
                            }

                            //*pesq.ref:portafolio_atc
                            let portfolioGrid = '18615527-c678-4f1c-87e0-d7a9735d0c6e';
                            let registroPortfolio = await getOnergyItem(portfolioGrid, data.assid, data.usrid, null);
                            let retornoPortfolio = registroPortfolio.filter((j) => j.UrlJsonContext.tipo_portifolio == arrayPost[y].portafolio_atc);
                            if (!retornoPortfolio) {
                                status_desc = `ERROR: no hay "${arrayPost[y].portafolio_atc}" registrado para ${tabExcel} de "${arrayPost[y].asset_number}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                await postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }
                            let duplicadorPortfolio = gridDestino.filter(
                                (j) => j.UrlJsonContext.tppf_tipo_portifolio__portfolio == arrayPost[y].portafolio_atc
                            );
                            if (!duplicadorPortfolio || data.em_caso_de_duplicidade == '1') {
                                arrayPost[y].tppf_tipo_portifolio__portfolio = retornoPortfolio[0] ? retornoPortfolio[0].UrlJsonContext.tipo_portifolio : '';
                                arrayPost[y].tppf_portfolio_id = retornoPortfolio[0] ? retornoPortfolio[0].ID : '';
                            }

                            //*pesq.ref:regional_atc
                            let regiaoATCGrid = '74d8a818-46a7-4d56-8a18-2369bdd00589';
                            let registroRegiaoATC = await getOnergyItem(regiaoATCGrid, data.assid, data.usrid, null);
                            let retornoRegiaoATC = registroRegiaoATC.filter((j) => j.UrlJsonContext.regional == arrayPost[y].regional_atc);
                            if (!retornoRegiaoATC) {
                                status_desc = `ERROR: no hay "${arrayPost[y].regional_atc}" registrado para ${tabExcel} de "${arrayPost[y].asset_number}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                await postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }
                            let duplicadorRegiaoATC = gridDestino.filter((j) => j.UrlJsonContext.regio_regional__regiao_atc == arrayPost[y].regional_atc);
                            if (!duplicadorRegiaoATC || data.em_caso_de_duplicidade == '1') {
                                arrayPost[y].regio_regional__regiao_atc = retornoRegiaoATC[0] ? retornoRegiaoATC[0].UrlJsonContext.regional : '';
                                arrayPost[y].regio_regiao_atc_id = retornoRegiaoATC[0] ? retornoRegiaoATC[0].ID : '';
                            }

                            let postArray = arrayPost[y];
                            //!node:test (unhide.log and hide sendItem)
                            // onergy.log(`JFS: aba:sitios sendItem=>postArray: ${JSON.stringify(postArray)}`);
                            await sendItemToOnergy(tabExcelID, data.usrid, data.assid, postArray, '', 'asset_number', true, false, false);
                        }

                        //*aba:informacion_cuenta
                        if (tabExcel == 'informacion_cuenta') {
                            let duplicadorProfitCostCenter = gridDestino.filter((j) => j.UrlJsonContext.profit_cost_center == arrayPost[y].profit_cost_center);
                            if (!duplicadorProfitCostCenter || data.em_caso_de_duplicidade == '1') {
                                arrayPost[y].profit_cost_center = arrayPost[y].profit_cost_center;
                            }

                            let duplicadorPortfolioATC = gridDestino.filter(
                                (j) => j.UrlJsonContext.tppf_tipo_portifolio__portfolio == arrayPost[y].portfolio_atc
                            );
                            if (!duplicadorPortfolioATC || data.em_caso_de_duplicidade == '1') {
                                arrayPost[y].tppf_tipo_portifolio__portfolio = arrayPost[y].portfolio_atc;
                                delete arrayPost[y].portfolio_atc;
                            }

                            let duplicadorAssetNumber = gridDestino.filter((j) => j.UrlJsonContext.asset_number_IDC == arrayPost[y].asset_number);
                            if (!duplicadorAssetNumber || data.em_caso_de_duplicidade == '1') {
                                arrayPost[y].asset_number_IDC = arrayPost[y].asset_number;
                                arrayPost[y].asset_number = arrayPost[y].asset_number;
                            }

                            let duplicadorNomeSitio = gridDestino.filter((j) => j.UrlJsonContext.site_name == arrayPost[y].nombre_sitio);
                            if (!duplicadorNomeSitio || data.em_caso_de_duplicidade == '1') {
                                arrayPost[y].site_name = arrayPost[y].nombre_sitio;
                                delete arrayPost[y].nombre_sitio;
                            }

                            let duplicadorEmpresaATC = gridDestino.filter((j) => j.UrlJsonContext.emp_atc_site == arrayPost[y].compania_atc);
                            if (!duplicadorEmpresaATC || data.em_caso_de_duplicidade == '1') {
                                arrayPost[y].emp_atc_site = arrayPost[y].compania_atc;
                                delete arrayPost[y].compania_atc;
                            }

                            let duplicadorContaInternaNIC = gridDestino.filter((j) => j.UrlJsonContext.conta_interna_nic == arrayPost[y].cuenta_interna_nic);
                            if (!duplicadorContaInternaNIC || data.em_caso_de_duplicidade == '1') {
                                arrayPost[y].conta_interna_nic = arrayPost[y].cuenta_interna_nic;
                                delete arrayPost[y].cuenta_interna_nic;
                            }

                            let duplicadorContaPai = gridDestino.filter((j) => j.UrlJsonContext.prcs__conta_pai == arrayPost[y].cuenta_padre);
                            if (!duplicadorContaPai || data.em_caso_de_duplicidade == '1') {
                                arrayPost[y].prcs__conta_pai = arrayPost[y].cuenta_padre;
                                delete arrayPost[y].cuenta_padre;
                            }

                            //*pesq.ref:tipo_cuenta
                            let tipoContaGrid = '84ca5970-7a49-4192-a2c8-030031503a1a';
                            let registroTipoConta = await getOnergyItem(tipoContaGrid, data.assid, data.usrid, null);
                            let retornoTipoConta = registroTipoConta.filter((j) => j.UrlJsonContext.TC_tipo_de_conta == arrayPost[y].tipo_cuenta);
                            if (!retornoTipoConta) {
                                status_desc = `ERROR: no hay "${arrayPost[y].tipo_cuenta}" registrado para ${tabExcel} de "${arrayPost[y].asset_number}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                await postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }

                            let duplicadorTipoConta = gridDestino.filter(
                                (j) => j.UrlJsonContext.TCTC_tipo_de_conta__prcs__tipo_de_conta == arrayPost[y].tipo_cuenta
                            );
                            if (!duplicadorTipoConta || data.em_caso_de_duplicidade == '1') {
                                arrayPost[y].TCTC_tipo_de_conta__prcs__tipo_de_conta = retornoTipoConta[0]
                                    ? retornoTipoConta[0].UrlJsonContext.TC_tipo_de_conta
                                    : '';
                                arrayPost[y].TCprcs__tipo_de_conta_id = retornoTipoConta[0] ? retornoTipoConta[0].ID : '';
                                arrayPost[y].TCTC_tipo_de_conta__TC_tipo_de_conta_valor = retornoTipoConta[0]
                                    ? retornoTipoConta[0].UrlJsonContext.TC_tipo_de_conta
                                    : '';
                                arrayPost[y].prcs__tipo_de_conta_cache = retornoTipoConta[0] ? retornoTipoConta[0].ID : '';
                                delete arrayPost[y].tipo_cuenta;
                            }

                            let duplicadorNumeroMedidor = gridDestino.filter((j) => j.UrlJsonContext.numero_do_medidor == arrayPost[y].numero_medidor);
                            if (!duplicadorNumeroMedidor || data.em_caso_de_duplicidade == '1') {
                                arrayPost[y].numero_do_medidor = arrayPost[y].numero_medidor;
                                delete arrayPost[y].numero_medidor;
                            }

                            //*pesq.ref:suscriptor
                            let empresaATCGrid = '8803f10a-9c32-4c4f-8bd6-8e959ed24277';
                            let registroEmpresaATC = await getOnergyItem(empresaATCGrid, data.assid, data.usrid, null);
                            let retornoEmpresaATC = registroEmpresaATC.filter((j) => j.UrlJsonContext.site == arrayPost[y].suscriptor);
                            if (!retornoEmpresaATC) {
                                status_desc = `ERROR: no hay "${arrayPost[y].suscriptor}" registrado para ${tabExcel} de "${arrayPost[y].asset_number}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                await postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }

                            let duplicadorSuscriptor = gridDestino.filter((j) => j.UrlJsonContext.emp_atc_site__prcs__assinante_atc == arrayPost[y].suscriptor);
                            if (!duplicadorSuscriptor || data.em_caso_de_duplicidade == '1') {
                                arrayPost[y].emp_atc_site__prcs__assinante_atc = retornoEmpresaATC[0] ? retornoEmpresaATC[0].UrlJsonContext.site : '';
                                arrayPost[y].emp_atc_prcs__assinante_atc_id = retornoEmpresaATC[0] ? retornoEmpresaATC[0].ID : '';
                                delete arrayPost[y].suscriptor;
                            }

                            //*pesq.ref:estado_cuenta
                            let statusContaGrid = '4963d2c6-2b94-4c37-bffb-87c0dc296587';
                            let registroStatusConta = await getOnergyItem(statusContaGrid, data.assid, data.usrid, null);
                            let retornoStatusConta = registroStatusConta.filter((j) => j.UrlJsonContext.status_conta == arrayPost[y].estado_cuenta);
                            if (!retornoStatusConta) {
                                status_desc = `ERROR: no hay "${arrayPost[y].estado_cuenta}" registrado para ${tabExcel} de "${arrayPost[y].asset_number}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                await postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }

                            let duplicadorStatusConta = gridDestino.filter((j) => j.UrlJsonContext.sta_cont_status_conta == arrayPost[y].estado_cuenta);
                            if (!duplicadorStatusConta || data.em_caso_de_duplicidade == '1') {
                                arrayPost[y].sta_cont_status_conta = retornoStatusConta[0] ? retornoStatusConta[0].UrlJsonContext.status_conta : '';
                                arrayPost[y].sta_cont_id = retornoStatusConta[0] ? retornoStatusConta[0].ID : '';
                            }

                            //*pesq.ref:nombre_proveedor
                            let provedoresGrid = '4783ca0b-357d-42ab-a5c8-3328ee315f86';
                            let registroProvedores = await getOnergyItem(provedoresGrid, data.assid, data.usrid, null);
                            let retornoProvedores = registroProvedores.filter((j) => j.UrlJsonContext.nome_provedor == arrayPost[y].nombre_proveedor);
                            if (!retornoProvedores) {
                                status_desc = `ERROR: no hay "${arrayPost[y].nombre_proveedor}" registrado para ${tabExcel} de "${arrayPost[y].asset_number}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                await postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }

                            let duplicadorProvedores = gridDestino.filter((j) => j.UrlJsonContext.prvd_nome_provedor == arrayPost[y].nombre_proveedor);
                            if (!duplicadorProvedores || data.em_caso_de_duplicidade == '1') {
                                arrayPost[y].prvd_nome_provedor = retornoProvedores[0] ? retornoProvedores[0].UrlJsonContext.nome_provedor : '';
                                arrayPost[y].prvd_id = retornoProvedores[0] ? retornoProvedores[0].ID : '';
                                arrayPost[y].nome_provedor_id_cache = retornoProvedores[0] ? retornoProvedores[0].ID : '';
                                arrayPost[y].prvd_nome_comercial = retornoProvedores[0] ? retornoProvedores[0].UrlJsonContext.nome_comercial : '';
                                arrayPost[y].prvd_nit_provedor = retornoProvedores[0] ? retornoProvedores[0].nit_provedor : '';
                                arrayPost[y].prvd_nit_beneficiario = retornoProvedores[0] ? retornoProvedores[0].UrlJsonContext.nit_beneficiario : '';
                                arrayPost[y].prvd_beneficiario = retornoProvedores[0] ? retornoProvedores[0].beneficiario : '';
                                arrayPost[y].prvd_apelido_provedor = retornoProvedores[0] ? retornoProvedores[0].UrlJsonContext.apelido_provedor : '';
                                arrayPost[y].prvd_link_web = retornoProvedores[0] ? retornoProvedores[0].UrlJsonContext.link_web : '';
                                arrayPost[y].prvd_usuario = retornoProvedores[0] ? retornoProvedores[0].UrlJsonContext.usuario : '';
                                arrayPost[y].prvd_senha = retornoProvedores[0] ? retornoProvedores[0].UrlJsonContext.senha : '';
                                delete arrayPost[y].nombre_proveedor;
                            }

                            //*pesq.ref:servicios
                            let servicosGrid = '8e284e84-b8f9-45c1-abe2-991555441ea2';
                            let registroServicos = await getOnergyItem(servicosGrid, data.assid, data.usrid, null);
                            let retornoServicos = registroServicos.filter((j) => j.UrlJsonContext.servicos == arrayPost[y].servicios);
                            if (!retornoServicos) {
                                status_desc = `ERROR: no hay "${arrayPost[y].servicios}" registrado para ${tabExcel} de "${arrayPost[y].asset_number}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                await postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }

                            let duplicadorServicos = gridDestino.filter((j) => j.UrlJsonContext.SERVservicos__servico == arrayPost[y].servicios);
                            if (!duplicadorServicos || data.em_caso_de_duplicidade == '1') {
                                arrayPost[y].SERVservicos__servico = retornoServicos[0] ? retornoServicos[0].UrlJsonContext.servicos : '';
                                arrayPost[y].SERVservico_id = retornoServicos[0] ? retornoServicos[0].ID : '';
                                delete arrayPost[y].servicios;
                            }

                            //*pesq.ref:sujeto_pasivo
                            let sujeitoPassivoGrid = '78352af1-70b2-43a0-ad2a-084cdcf2eacf';
                            let registroSujeitoPassivo = await getOnergyItem(sujeitoPassivoGrid, data.assid, data.usrid, null);
                            let retornoSujeitoPassivo = registroSujeitoPassivo.filter((j) => j.UrlJsonContext.sujeito == arrayPost[y].sujeto_pasivo);
                            if (!retornoSujeitoPassivo) {
                                status_desc = `ERROR: no hay "${arrayPost[y].sujeto_pasivo}" registrado para ${tabExcel} de "${arrayPost[y].asset_number}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                await postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }

                            let duplicadorSujeitoPassivo = gridDestino.filter(
                                (j) => j.UrlJsonContext.suj_pa_sujeito__prcs__sujeito_passivo_alumbrado_publico == arrayPost[y].sujeto_pasivo
                            );

                            if (!duplicadorSujeitoPassivo || data.em_caso_de_duplicidade == '1') {
                                arrayPost[y].suj_pa_sujeito__prcs__sujeito_passivo_alumbrado_publico = retornoSujeitoPassivo[0]
                                    ? retornoSujeitoPassivo[0].UrlJsonContext.sujeito
                                    : '';
                                arrayPost[y].suj_pa_prcs__sujeito_passivo_alumbrado_publico_id = retornoSujeitoPassivo[0] ? retornoSujeitoPassivo[0].ID : '';
                                delete arrayPost[y].sujeto_pasivo;
                            }

                            let duplicadorAcordoResolucao = gridDestino.filter(
                                (j) => j.UrlJsonContext.prcs__acuerdo_resolucion_alumbrado_publico == arrayPost[y].acuerdo_resolucion
                            );
                            if (!duplicadorAcordoResolucao || data.em_caso_de_duplicidade == '1') {
                                arrayPost[y].prcs__acuerdo_resolucion_alumbrado_publico = arrayPost[y].acuerdo_resolucion;
                                delete arrayPost[y].acuerdo_resolucion;
                            }

                            //*pesq.ref:tipo_cobro
                            let tipoCobrancaGrid = '22538843-147f-4d41-9534-20a6d674f4b6';
                            let registroTipoCobranca = await getOnergyItem(tipoCobrancaGrid, data.assid, data.usrid, null);
                            let retornoTipoCobranca = registroTipoCobranca.filter((j) => j.UrlJsonContext.tipos_cobrancas == arrayPost[y].tipo_cobro);
                            if (!retornoTipoCobranca) {
                                status_desc = `ERROR: no hay "${arrayPost[y].tipo_cobro}" registrado para ${tabExcel} de "${arrayPost[y].asset_number}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                await postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }

                            let duplicadorTipoCobranca = gridDestino.filter(
                                (j) => j.UrlJsonContext.tipo_cobr_tipos_cobrancas__tipo_de_cobranca == arrayPost[y].tipo_cobro
                            );
                            if (!duplicadorTipoCobranca || data.em_caso_de_duplicidade == '1') {
                                arrayPost[y].tipo_cobr_tipos_cobrancas__tipo_de_cobranca = retornoTipoCobranca[0]
                                    ? retornoTipoCobranca[0].UrlJsonContext.tipos_cobrancas
                                    : '';
                                arrayPost[y].tipo_cobr_tipo_de_cobranca_id = retornoTipoCobranca[0] ? retornoTipoCobranca[0].ID : '';
                                delete arrayPost[y].tipo_cobro;
                            }

                            let duplicadorDiaPagamento = gridDestino.filter((j) => j.UrlJsonContext.prcs__dia_de_pagamento == arrayPost[y].dia_de_pago);
                            if (!duplicadorDiaPagamento || data.em_caso_de_duplicidade == '1') {
                                arrayPost[y].prcs__dia_de_pagamento = arrayPost[y].dia_de_pago;
                                delete arrayPost[y].dia_de_pago;
                            }

                            //*pesq.ref:frecuencia_pago
                            let frequenciaPagamentoGrid = '2d4edce3-7131-413a-98e5-35d328daef7f';
                            let registroFrequenciaPagamento = await getOnergyItem(frequenciaPagamentoGrid, data.assid, data.usrid, null);
                            let retornoFrequenciaPagamento = registroFrequenciaPagamento.filter(
                                (j) => j.UrlJsonContext.frequencia == arrayPost[y].frecuencia_pago
                            );
                            if (!retornoFrequenciaPagamento) {
                                status_desc = `ERROR: no hay "${arrayPost[y].frecuencia_pago}" registrado para ${tabExcel} de "${arrayPost[y].asset_number}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                await postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }

                            let duplicadorFrequenciaPagamento = gridDestino.filter(
                                (j) => j.UrlJsonContext.fre_pag_frequencia__frequencia_de_pagamento == arrayPost[y].frecuencia_pago
                            );
                            if (!duplicadorFrequenciaPagamento || data.em_caso_de_duplicidade == '1') {
                                arrayPost[y].fre_pag_frequencia__frequencia_de_pagamento = retornoFrequenciaPagamento[0]
                                    ? retornoFrequenciaPagamento[0].UrlJsonContext.frequencia
                                    : '';
                                arrayPost[y].fre_pag_frequencia_de_pagamento_id = retornoFrequenciaPagamento[0] ? retornoFrequenciaPagamento[0].ID : '';
                                delete arrayPost[y].frecuencia_pago;
                            }

                            //*pesq.ref:forma_pago
                            let formaPagamentoGrid = '0e8a4463-28db-474f-926b-39fa1bd0c9bc';
                            let registroFormaPagamento = await getOnergyItem(formaPagamentoGrid, data.assid, data.usrid, null);
                            let retornoFormaPagamento = registroFormaPagamento.filter((j) => j.UrlJsonContext.formas_de_pagamentos == arrayPost[y].forma_pago);
                            if (!retornoFormaPagamento) {
                                status_desc = `ERROR: no hay "${arrayPost[y].forma_pago}" registrado para ${tabExcel} de "${arrayPost[y].asset_number}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                await postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }

                            let duplicadorFormaPagamento = gridDestino.filter(
                                (j) => j.UrlJsonContext.for_pag_formas_de_pagamentos__forma_de_pagamento == arrayPost[y].forma_pago
                            );
                            if (!duplicadorFormaPagamento || data.em_caso_de_duplicidade == '1') {
                                arrayPost[y].for_pag_formas_de_pagamentos__forma_de_pagamento = retornoFormaPagamento[0]
                                    ? retornoFormaPagamento[0].UrlJsonContext.formas_de_pagamentos
                                    : '';
                                arrayPost[y].for_pag_forma_de_pagamento_id = retornoFormaPagamento[0] ? retornoFormaPagamento[0].ID : '';
                                delete arrayPost[y].forma_pago;
                            }

                            //*pesq.ref:clasificacion_passthru
                            let classificacaoPassthruGrid = 'ad62c737-2abc-4c71-a572-e11933114ed8';
                            let registroClassificacaoPassthru = await getOnergyItem(classificacaoPassthruGrid, data.assid, data.usrid, null);
                            let retornoClassificacaoPassthru = registroClassificacaoPassthru.filter(
                                (j) => j.UrlJsonContext.classificacao_passthru == arrayPost[y].clasificacion_passthru
                            );
                            if (!retornoClassificacaoPassthru) {
                                status_desc = `ERROR: no hay "${arrayPost[y].clasificacion_passthru}" registrado para ${tabExcel} de "${arrayPost[y].asset_number}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                await postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }

                            let duplicadorClassificacaoPassthru = gridDestino.filter(
                                (j) => j.UrlJsonContext.CPTclassificacao_passthru__prcs__clasificacion_passthru == arrayPost[y].clasificacion_passthru
                            );
                            if (!duplicadorClassificacaoPassthru || data.em_caso_de_duplicidade == '1') {
                                arrayPost[y].CPTclassificacao_passthru__prcs__clasificacion_passthru = retornoClassificacaoPassthru[0]
                                    ? retornoClassificacaoPassthru[0].UrlJsonContext.classificacao_passthru
                                    : '';
                                arrayPost[y].CPTprcs__clasificacion_passthru_id = retornoClassificacaoPassthru[0] ? retornoClassificacaoPassthru[0].ID : '';
                                delete arrayPost[y].clasificacion_passthru;
                            }

                            let postArray = arrayPost[y];
                            //!node:test (unhide log and hide sendItem)
                            // onergy.log(`JFS: aba:informacion_cuenta sendItem=>postArray: ${JSON.stringify(postArray)}`);
                            await sendItemToOnergy(tabExcelID, data.usrid, data.assid, postArray, '', 'asset_number', true, false, false);

                            //TODO to fazendo a carga de um grid filho
                            //TODO minha carga nao sabe o ID_ONE_REF do grid pai
                            //TODO como referenciar o grid filho ao grid pai?
                        }

                        //*aba:informacion_tecnica
                        if (tabExcel == 'informacion_tecnica') {
                            //*id_one_ref:sitios
                            let paiGrid = 'e43b9fe0-6752-446d-8495-0b4fdd7a70b4';
                            let paiFiltro = gerarFiltro('asset_number', objPost.asset_number);
                            let paiRegistro = await getOnergyItem(paiGrid, data.assid, data.usrid, paiFiltro);

                            //*pesq.ref:categorias
                            let idCategorias = '55ec978d-7dbe-4a6f-8cb4-536b53361d54';
                            let getCategorias = await getOnergyItem(idCategorias, data.assid, data.usrid, null);
                            let isCategorias = getCategorias.filter((j) => j.UrlJsonContext.categorias == objPost.categorias);
                            if (!isCategorias) {
                                status_desc = `ERROR: no hay "${objPost.categorias}" registrado para ${tabExcel} de "${objPost.asset_number}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                await postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }

                            let isItdsCategorias = gridDestino.filter((j) => j.UrlJsonContext.ctgr_categorias__categoria == objPost.categorias);
                            if (!isItdsCategorias || data.em_caso_de_duplicidade == '1') {
                                objPost.ctgr_categorias__categoria = isCategorias.length > 0 ? isCategorias[0].UrlJsonContext.categorias : '';
                                objPost.ctgr_categoria_id = isCategorias.length > 0 ? isCategorias[0].ID : '';
                                delete objPost.categorias;
                            }

                            //*pesq.ref:estrato
                            let idEstrato = '34f26407-6afe-41c8-8420-7dbcd4f1aed4';
                            let getEstrato = await getOnergyItem(idEstrato, data.assid, data.usrid, null);
                            let isEstrato = getEstrato.filter((j) => j.UrlJsonContext.LST_estrato == objPost.estrato);
                            if (!isEstrato) {
                                status_desc = `ERROR: no hay "${objPost.estrato}" registrado para ${tabExcel} de "${objPost.asset_number}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                await postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }

                            let isItdsEstrato = gridDestino.filter((j) => j.UrlJsonContext.LSTLST_estrato__ITDS_estrato == objPost.estrato);
                            if (!isItdsEstrato || data.em_caso_de_duplicidade == '1') {
                                objPost.LSTLST_estrato__ITDS_estrato = isEstrato.length > 0 ? isEstrato[0].UrlJsonContext.LST_estrato : '';
                                objPost.LSTITDS_estrato_id = isEstrato.length > 0 ? isEstrato[0].ID : '';
                                delete objPost.estrato;
                            }

                            //*pesq.ref:nivel_tension
                            let idNivelTension = '4056b8c5-29c0-47ff-b5b1-cfc3c7f39018';
                            let getNivelTension = await getOnergyItem(idNivelTension, data.assid, data.usrid, null);
                            let isNivelTension = getNivelTension.filter((j) => j.UrlJsonContext.NVT_nivel == objPost.nivel_tension);
                            if (!isNivelTension) {
                                status_desc = `ERROR: no hay "${objPost.nivel_tension}" registrado para ${tabExcel} de "${objPost.asset_number}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                await postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }

                            let isItdsNivelTension = gridDestino.filter((j) => j.UrlJsonContext.NVTNVT_nivel__ITDS_nivel_de_tensao == objPost.nivel_tension);
                            if (!isItdsNivelTension || data.em_caso_de_duplicidade == '1') {
                                objPost.NVTNVT_nivel__ITDS_nivel_de_tensao = isNivelTension.length > 0 ? isNivelTension[0].UrlJsonContext.NVT_nivel : '';
                                objPost.NVTITDS_nivel_de_tensao_id = isNivelTension.length > 0 ? isNivelTension[0].ID : '';
                                delete objPost.nivel_tension;
                            }

                            //*pesq.ref:lecturas
                            let idLecturas = '0d3b6287-8f3a-4ad7-acdd-e1c60426f73f';
                            let getLecturas = await getOnergyItem(idLecturas, data.assid, data.usrid, null);
                            let isLecturas = getLecturas.filter((j) => j.UrlJsonContext.LCT_ferramentas == objPost.lectura_atc);
                            if (!isLecturas) {
                                status_desc = `ERROR: no hay "${objPost.lectura_atc}" registrado para ${tabExcel} de "${objPost.asset_number}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                await postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }

                            let isItdsLecturas = gridDestino.filter((j) => j.UrlJsonContext.LCTLCT_ferramentas__ITDS_lecturas == objPost.lectura_atc);
                            if (!isItdsLecturas || data.em_caso_de_duplicidade == '1') {
                                objPost.LCTLCT_ferramentas__ITDS_lecturas = isLecturas.length > 0 ? isLecturas[0].UrlJsonContext.LCT_ferramentas : '';
                                objPost.LCTITDS_lecturas_id = isLecturas.length > 0 ? isLecturas[0].ID : '';
                                delete objPost.lectura_atc;
                            }

                            let isAssetNumber = gridDestino.filter((j) => j.UrlJsonContext.asset_number == objPost.asset_number);
                            if (!isAssetNumber || data.em_caso_de_duplicidade == '1') {
                                objPost.ID_ONE_REF = paiRegistro.length > 0 ? paiRegistro[0].ID : '';
                                objPost.asset_number = objPost.asset_number;
                            }

                            let isNombreSitio = gridDestino.filter((j) => j.UrlJsonContext.site_name == objPost.nombre_sitio);
                            if (!isNombreSitio || data.em_caso_de_duplicidade == '1') {
                                objPost.site_name = objPost.nombre_sitio;
                                delete objPost.nombre_sitio;
                            }

                            let isDireccion = gridDestino.filter((j) => j.UrlJsonContext.logradouro == objPost.direccion);
                            if (!isDireccion || data.em_caso_de_duplicidade == '1') {
                                objPost.logradouro = objPost.direccion;
                                delete objPost.direccion;
                            }

                            let isMunicipio = gridDestino.filter((j) => j.UrlJsonContext.loca_cida_municipio == objPost.municipio);
                            if (!isMunicipio || data.em_caso_de_duplicidade == '1') {
                                objPost.loca_cida_municipio = objPost.municipio;
                                objPost.loca_cida_loca_uf_uf = objPost.departamento;
                                delete objPost.municipio;
                                delete objPost.departamento;
                            }

                            let isStatusSite = gridDestino.filter((j) => j.UrlJsonContext.sta_site_status == objPost.estado_sitio);
                            if (!isStatusSite || data.em_caso_de_duplicidade == '1') {
                                objPost.sta_site_status = objPost.estado_sitio;
                                delete objPost.estado_sitio;
                            }

                            let isCompaniaATC = gridDestino.filter((j) => j.UrlJsonContext.emp_atc_site == objPost.compania_atc);
                            if (!isCompaniaATC || data.em_caso_de_duplicidade == '1') {
                                objPost.emp_atc_site = objPost.compania_atc;
                                delete objPost.compania_atc;
                            }

                            //*btn.check:motogenerador
                            objPost.motogenerador = objPost.motogenerador == 'SI' ? '1' : '';
                            let arr00 = [];
                            arr00.push(objPost.motogenerador);
                            let isMotogenerador = gridDestino.filter((j) => j.UrlJsonContext.gerador == arr00);
                            if (!isMotogenerador || data.em_caso_de_duplicidade == '1') {
                                objPost.gerador = arr00;
                                objPost.gerador_desc = objPost.motogenerador == '1' ? 'Sim' : 'Não';
                                delete objPost.motogenerador;
                            }

                            //*btn.check:tablero_independiente
                            objPost.tablero_independiente = objPost.tablero_independiente == 'SI' ? '1' : '';
                            let arr01 = [];
                            arr01.push(objPost.tablero_independiente);
                            let isTableroIndependiente = gridDestino.filter((j) => j.UrlJsonContext.diretoria_independente == arr01);
                            if (!isTableroIndependiente || data.em_caso_de_duplicidade == '1') {
                                objPost.diretoria_independente = arr01;
                                objPost.diretoria_independente_desc = objPost.tablero_independiente == '1' ? 'Sim' : 'Não';
                                delete objPost.tablero_independiente;
                            }

                            //*btn.check:barter
                            objPost.barter = objPost.barter == 'SI' ? '1' : '';
                            let arr02 = [];
                            arr02.push(objPost.barter);
                            let isBarter = gridDestino.filter((j) => j.UrlJsonContext.escambo == arr02);
                            if (!isBarter || data.em_caso_de_duplicidade == '1') {
                                objPost.escambo = arr02;
                                objPost.escambo_desc = objPost.barter == '1' ? 'Sim' : 'Não';
                                delete objPost.barter;
                            }

                            //*btn.check:provisional
                            objPost.provisional = objPost.provisional == 'SI' ? '1' : '';
                            let arr03 = [];
                            arr03.push(objPost.provisional);
                            let isProvisional = gridDestino.filter((j) => j.UrlJsonContext.provisorio == arr03);
                            if (!isProvisional || data.em_caso_de_duplicidade == '1') {
                                objPost.provisorio = arr03;
                                objPost.provisorio_desc = objPost.provisional == '1' ? 'Sim' : 'Não';
                                delete objPost.provisional;
                            }

                            let isCantidadProvisionales = gridDestino.filter((j) => j.UrlJsonContext.quantidade_provisoria == objPost.cantidad_provisionales);
                            if (!isCantidadProvisionales || data.em_caso_de_duplicidade == '1') {
                                objPost.quantidade_provisoria = objPost.cantidad_provisionales;
                                delete objPost.cantidad_provisionales;
                            }

                            //!node:test (unhide log and hide sendItem)
                            // onergy.log(`JFS: aba:informacion_tecnica sendItem=>objPost: ${JSON.stringify(objPost)}`);
                            await sendItemToOnergy(tabExcelID, data.usrid, data.assid, objPost, '', 'asset_number', true, false, false);
                        }

                        //*aba:clientes_sitio
                        if (tabExcel == 'clientes_sitio') {
                            //*id_one_ref:clientes
                            let paiGrid = '0694dd6e-299a-4b46-b8fd-5e08da24f72d';
                            let paiFiltro = gerarFiltro('COLC_nit_cliente', objPost.nit_cliente);
                            let paiRegistro = await getOnergyItem(paiGrid, data.assid, data.usrid, paiFiltro);

                            //*pesq.ref:nit_cliente
                            let idClientes = '0694dd6e-299a-4b46-b8fd-5e08da24f72d';
                            let getClientes = await getOnergyItem(idClientes, data.assid, data.usrid, null);
                            let isClientes = getClientes.filter((j) => j.UrlJsonContext.COLC_nit_cliente == objPost.nit_cliente);
                            if (!isClientes) {
                                status_desc = `ERROR: no hay "${objPost.nit_cliente}" registrado para ${tabExcel} de "${objPost.nit_cliente}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                await postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }

                            let isNITCliente = gridDestino.filter((j) => j.UrlJsonContext.COLCCOLC_nit_cliente == objPost.nit_cliente);
                            if (!isNITCliente || data.em_caso_de_duplicidade == '1') {
                                objPost.ID_ONE_REF = paiRegistro.length > 0 ? paiRegistro[0].ID : '';
                                objPost.COLCCOLC_nit_cliente = isClientes.length > 0 ? isClientes[0].UrlJsonContext.COLC_nit_cliente : '';
                                objPost.COLCclsit__nit_cliente_id = isClientes.length > 0 ? isClientes[0].ID : '';
                                objPost.COLCCOLC_nome_cliente__clsit__nit_cliente = isClientes.length > 0 ? isClientes[0].UrlJsonContext.COLC_nome_cliente : '';
                                objPost.COLCCOLC_codigo_cliente = isClientes.length > 0 ? isClientes[0].UrlJsonContext.COLC_codigo_cliente : '';
                                delete objPost.nombre_cliente;
                                delete objPost.nit_cliente;
                                delete objPost.codigo_cliente;
                            }

                            let isCodigoSitioCliente = gridDestino.filter(
                                (j) => j.UrlJsonContext.clsit__codigo_do_sitio_do_cliente == objPost.codigo_sitio_cliente
                            );
                            if (!isCodigoSitioCliente || data.em_caso_de_duplicidade == '1') {
                                objPost.clsit__codigo_do_sitio_do_cliente = objPost.codigo_sitio_cliente;
                                delete objPost.codigo_sitio_cliente;
                            }

                            //*pesq.ref:nombre_regional
                            let idRegionalClientes = 'b45777ee-f5f3-429c-9fd7-9ee4578b0b63';
                            let getRegionalClientes = await getOnergyItem(idRegionalClientes, data.assid, data.usrid, null);
                            let isRegionalClientes = getRegionalClientes.filter((j) => j.UrlJsonContext.RCS_nome_regional == objPost.nombre_regional);
                            if (!isRegionalClientes) {
                                status_desc = `ERROR: no hay "${objPost.nombre_regional}" registrado para ${tabExcel} de "${objPost.nit_cliente}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                await postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }

                            let isNombreRegional = gridDestino.filter(
                                (j) => j.UrlJsonContext.RCSRCS_nome_regional__clsit__regional_do_cliente == objPost.nombre_regional
                            );
                            if (!isNombreRegional || data.em_caso_de_duplicidade == '1') {
                                objPost.RCSRCS_nome_regional__clsit__regional_do_cliente =
                                    isRegionalClientes.length > 0 ? isRegionalClientes[0].UrlJsonContext.RCS_nome_regional : '';
                                objPost.RCSclsit__regional_do_cliente_id = isRegionalClientes.length > 0 ? isRegionalClientes[0].ID : '';
                                delete objPost.nombre_regional;
                            }

                            //*pesq.ref:portafolio_cliente
                            let idPortafolioCliente = 'b36cf260-c691-4d36-9339-137041e6fb63';
                            let getPortafolioCliente = await getOnergyItem(idPortafolioCliente, data.assid, data.usrid, null);
                            let isPortafolioCliente = getPortafolioCliente.filter((j) => j.UrlJsonContext.PCS_portafolio_cliente == objPost.portafolio_cliente);
                            if (!isPortafolioCliente) {
                                status_desc = `ERROR: no hay "${objPost.portafolio_cliente}" registrado para ${tabExcel} de "${objPost.nit_cliente}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                await postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }

                            let isPcsPortafolioCliente = gridDestino.filter(
                                (j) => j.UrlJsonContext.PCSPCS_portafolio_cliente__clsit__portifolio_cliente == objPost.portafolio_cliente
                            );
                            if (!isPcsPortafolioCliente || data.em_caso_de_duplicidade == '1') {
                                objPost.PCSPCS_portafolio_cliente__clsit__portifolio_cliente = isRegionalClientes[0]
                                    ? isRegionalClientes[0].UrlJsonContext.PCS_portafolio_cliente
                                    : '';
                                objPost.PCSclsit__portifolio_cliente_id = isRegionalClientes[0] ? isRegionalClientes[0].ID : '';
                                delete objPost.portafolio_cliente;
                            }

                            let isPortafolioATC = gridDestino.filter((j) => j.UrlJsonContext.tppf_tipo_portifolio == objPost.portafolio_atc);
                            if (!isPortafolioATC || data.em_caso_de_duplicidade == '1') {
                                objPost.tppf_tipo_portifolio = objPost.portafolio_atc;
                                delete objPost.portafolio_atc;
                            }

                            let isAssetNumber = gridDestino.filter((j) => j.UrlJsonContext.asset_number == objPost.asset_number);
                            if (!isAssetNumber || data.em_caso_de_duplicidade == '1') {
                                objPost.asset_number = objPost.asset_number;
                            }

                            let isProfitCostCenter = gridDestino.filter((j) => j.UrlJsonContext.profit_cost_center == objPost.profit_cost_center);
                            if (!isProfitCostCenter || data.em_caso_de_duplicidade == '1') {
                                objPost.profit_cost_center = objPost.profit_cost_center;
                            }

                            let isNombreSitio = gridDestino.filter((j) => j.UrlJsonContext.site_name == objPost.nombre_sitio);
                            if (!isNombreSitio || data.em_caso_de_duplicidade == '1') {
                                objPost.site_name = objPost.nombre_sitio;
                                delete objPost.nombre_sitio;
                            }

                            let isCompaniaATC = gridDestino.filter((j) => j.UrlJsonContext.emp_atc_site == objPost.compania_atc);
                            if (!isCompaniaATC || data.em_caso_de_duplicidade == '1') {
                                objPost.emp_atc_site = objPost.compania_atc;
                                delete objPost.compania_atc;
                            }

                            let isMunicipio = gridDestino.filter((j) => j.UrlJsonContext.loca_cida_municipio == objPost.municipio);
                            if (!isMunicipio || data.em_caso_de_duplicidade == '1') {
                                objPost.loca_cida_municipio = objPost.municipio;
                                delete objPost.municipio;
                            }

                            let isDepartamento = gridDestino.filter((j) => j.UrlJsonContext.loca_cida_loca_uf_uf == objPost.departamento);
                            if (!isDepartamento || data.em_caso_de_duplicidade == '1') {
                                objPost.loca_cida_loca_uf_uf = objPost.departamento;
                                delete objPost.departamento;
                            }

                            let isRegionalATC = gridDestino.filter((j) => j.UrlJsonContext.regio_regional == objPost.regional_atc);
                            if (!isRegionalATC || data.em_caso_de_duplicidade == '1') {
                                objPost.regio_regional = objPost.regional_atc;
                                delete objPost.regional_atc;
                            }

                            //!node:test (unhide log and hide sendItem)
                            // onergy.log(`JFS: aba:clientes_sitio sendItem=>objPost: ${JSON.stringify(objPost)}`);
                            await sendItemToOnergy(tabExcelID, data.usrid, data.assid, objPost, '', 'COLCCOLC_nit_cliente', true, false, false);
                        }

                        //*aba:clasificacion_passthru
                        if (tabExcel == 'clasificacion_passthru') {
                            let isClasificacionPassthru = gridDestino.filter((j) => j.UrlJsonContext.classificacao_passthru == objPost.clasificacion_passthru);
                            if (!isClasificacionPassthru || data.em_caso_de_duplicidade == '1') {
                                objPost.classificacao_passthru = objPost.clasificacion_passthru;
                                delete objPost.clasificacion_passthru;
                            }

                            //*lst.susp:tiene_passthru
                            objPost.tiene_passthru = objPost.tiene_passthru == 'SI' ? 'sim' : 'nao';
                            let isTienePassthru = gridDestino.filter((j) => j.UrlJsonContext.CPT_tem_passthru == objPost.tiene_passthru);
                            if (!isTienePassthru || data.em_caso_de_duplicidade == '1') {
                                objPost.CPT_tem_passthru = objPost.tiene_passthru;
                                objPost.CPT_tem_passthru_desc = objPost.tiene_passthru == 'sim' ? 'Sim' : 'Não';
                                delete objPost.tiene_passthru;
                            }

                            //!node:test (unhide log and hide sendItem)
                            // onergy.log(`JFS: aba:clasificacion_passthru sendItem=>objPost: ${JSON.stringify(objPost)}`);
                            await sendItemToOnergy(tabExcelID, data.usrid, data.assid, objPost, '', 'classificacao_passthru', true, false, false);
                        }
                    }
                } else {
                    status_desc = `ERROR: los datos de ${tabExcel} no fueron procesados`;
                    statusPost.push(`${time}, ${status_desc}`);
                    await postStatus(status_desc, statusPost, data);
                    statusPost = statusPost.concat('\n');
                    return false;
                }
            } else {
                status_desc = `ERROR: no se encontraron datos en ${tabExcel}`;
                statusPost.push(`${time}, ${status_desc}`);
                await postStatus(status_desc, statusPost, data);
                statusPost = statusPost.concat('\n');
                return false;
            }
        } else {
            status_desc = `ERROR: No hay registros en ${nomePlanilha}`;
            statusPost.push(`${time}, ${status_desc}`);
            await postStatus(status_desc, statusPost, data);
            statusPost = statusPost.concat('\n');
            return false;
        }
    } else {
        status_desc = `ERROR: El índice carga ${cargaIndiceNome} no coincide con ${tabExcel}`;
        statusPost.push(`${time}, ${status_desc}`);
        await postStatus(status_desc, statusPost, data);
        statusPost = statusPost.concat('\n');
        return false;
    }

    //*status:done
    status_desc = `Carga de ${tabExcel} finalizada`;
    statusPost.push(`${time}, ${status_desc}`);
    await postStatus(status_desc, statusPost, data);
    statusPost = statusPost.concat('\n');

    //!node:test (unhide return)
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
/**STD_METHODS**
 */
let json = {
    processo: [
        '18/10/2022 13:34:49, Cargando 49 registros de portafolio_clientes',
        '\n',
        '18/10/2022 13:34:49, Manejando 49 registros de portafolio_clientes',
        '\n',
        '18/10/2022 13:34:49, Carga de portafolio_clientes finalizada',
        '\n',
    ],
    horas: '15:34',
    dataDate: '2022-10-18 18:34:48',
    data: '2022-10-18 15:34:48',
    load_index_equipe: 'COL',
    load_index_id_do_card: 'b36cf260-c691-4d36-9339-137041e6fb63',
    planilha: [
        {
            Url: 'https://onebackupservices.blob.core.windows.net/67c0b77d-abae-4c48-ba4b-6c8faf27e14a/tablas_maestras_v3.xlsxdb8b5885-d630-4bcf-b233-52e244585601.xlsx?sv=2018-03-28&sr=b&sig=8%2BieC9CliINgb8me%2Fj1uTTMfL8PAmCe0%2FQdKasgM2oY%3D&se=2023-05-06T18%3A34%3A34Z&sp=r',
            UrlAzure:
                'https://onebackupservices.blob.core.windows.net/67c0b77d-abae-4c48-ba4b-6c8faf27e14a/tablas_maestras_v3.xlsxdb8b5885-d630-4bcf-b233-52e244585601.xlsx?sv=2018-03-28&sr=b&sig=8%2BieC9CliINgb8me%2Fj1uTTMfL8PAmCe0%2FQdKasgM2oY%3D&se=2023-05-06T18%3A34%3A34Z&sp=r',
            Name: 'tablas_maestras_v3.xlsx',
        },
    ],
    load_index_tab_excel: 'portafolio_clientes',
    load_index_id: 'b2fc48e3-c530-96b2-a64a-432f0a399dd8',
    em_caso_de_duplicidade: '1',
    processamento: 'Carga de portafolio_clientes finalizada',
    time: '15:34',
    em_caso_de_duplicidade_desc: 'Sobrescribir',
    oneTemplateTitle: 'Carga Geral',
    ass_id: '67c0b77d-abae-4c48-ba4b-6c8faf27e14a',
    assid: '67c0b77d-abae-4c48-ba4b-6c8faf27e14a',
    email: 'admin-colombia@atc.com.co',
    fdtid: '181c67a8-e7a9-4c9a-9ea1-ca4719c0e23f',
    fedid: 'cade2a10-4632-2cc7-1579-c2171455a8a8',
    id_upload_planilha: 'cade2a10-4632-2cc7-1579-c2171455a8a8',
    onergy_rolid: 'e4d0298c-245e-454a-89d4-8f27aef8645b',
    timezone: null,
    usrid: '0c44d4fc-d654-405b-9b8f-7fea162948b5',
};
init(JSON.stringify(json));
