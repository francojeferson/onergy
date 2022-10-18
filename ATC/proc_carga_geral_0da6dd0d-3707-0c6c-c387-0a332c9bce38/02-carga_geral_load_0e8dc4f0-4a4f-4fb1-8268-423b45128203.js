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
 * Esconder Menu: Não
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
/*async*/ function postStatus(status_desc, statusPost, data) {
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
    let strResult = /*await*/ getOnergyItem(cargaGeralID, data.assid, data.usrid, strFiltro);

    let postResult = /*await*/ sendItemToOnergy(cargaGeralID, data.usrid, data.assid, postInfo, data.id_upload_planilha, '', true, false, false);
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
/*async*/ function init(json) {
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
    let cardID = /*await*/ getOnergyItem(indiceCargaID, data.assid, data.usrid, gerarFiltro('id_do_card', tabExcelID));

    //*upload planilha
    let strArrExcel = /*await*/ ReadExcelToJson({
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
                /*await*/ postStatus(status_desc, statusPost, data);
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
                    let gridDestino = /*await*/ getOnergyItem(tabExcelID, data.assid, data.usrid, null);

                    //*status:processando
                    status_desc = `Manejando ${arrayPost.length} registros de ${tabExcel}`;
                    statusPost.push(`${time}, ${status_desc}`);
                    /*await*/ postStatus(status_desc, statusPost, data);
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
                            /*await*/ sendItemToOnergy(tabExcelID, data.usrid, data.assid, objPost, '', 'categorias', true, false, false);
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
                            /*await*/ sendItemToOnergy(tabExcelID, data.usrid, data.assid, objPost, '', 'uf', true, false, false);
                        }

                        //*aba:municipio
                        if (tabExcel == 'municipio') {
                            //*pesq.ref:departamento
                            let idDepartamento = '132b8394-2193-4d83-a399-08f4cde70873';
                            let getDepartamento = /*await*/ getOnergyItem(idDepartamento, data.assid, data.usrid, null);
                            let isDepartamento = getDepartamento.filter((j) => j.UrlJsonContext.uf == objPost.departamento);
                            if (!isDepartamento) {
                                status_desc = `ERROR: no hay "${objPost.departamento}" registrado para ${tabExcel} de "${objPost.municipio}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                /*await*/ postStatus(status_desc, statusPost, data);
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
                            /*await*/ sendItemToOnergy(tabExcelID, data.usrid, data.assid, objPost, '', 'municipio', true, false, false);
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
                            /*await*/ sendItemToOnergy(tabExcelID, data.usrid, data.assid, objPost, '', 'site', true, false, false);
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
                            /*await*/ sendItemToOnergy(tabExcelID, data.usrid, data.assid, objPost, '', 'formas_de_pagamentos', true, false, false);
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
                            /*await*/ sendItemToOnergy(tabExcelID, data.usrid, data.assid, objPost, '', 'frequencia', true, false, false);
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
                            /*await*/ sendItemToOnergy(tabExcelID, data.usrid, data.assid, objPost, '', 'LCT_ferramentas', true, false, false);
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
                            /*await*/ sendItemToOnergy(tabExcelID, data.usrid, data.assid, objPost, '', 'tipo_portifolio', true, false, false);
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
                            /*await*/ sendItemToOnergy(tabExcelID, data.usrid, data.assid, objPost, '', 'regional', true, false, false);
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
                            /*await*/ sendItemToOnergy(tabExcelID, data.usrid, data.assid, objPost, '', 'servicos', true, false, false);
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
                            /*await*/ sendItemToOnergy(tabExcelID, data.usrid, data.assid, objPost, '', 'status_conta', true, false, false);
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
                            /*await*/ sendItemToOnergy(tabExcelID, data.usrid, data.assid, objPost, '', 'status', true, false, false);
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
                            /*await*/ sendItemToOnergy(tabExcelID, data.usrid, data.assid, objPost, '', 'sujeito', true, false, false);
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
                            /*await*/ sendItemToOnergy(tabExcelID, data.usrid, data.assid, objPost, '', 'tipos_cobrancas', true, false, false);
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
                            /*await*/ sendItemToOnergy(tabExcelID, data.usrid, data.assid, objPost, '', 'tipo_de_terceiro', true, false, false);
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
                            /*await*/ sendItemToOnergy(tabExcelID, data.usrid, data.assid, objPost, '', 'tipo_de_acesso', true, false, false);
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
                            /*await*/ sendItemToOnergy(tabExcelID, data.usrid, data.assid, objPost, '', 'TC_tipo_de_conta', true, false, false);
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
                            let getTipoTercero = /*await*/ getOnergyItem(idTipoTercero, data.assid, data.usrid, null);
                            let isTipoTercero = getTipoTercero.filter((j) => j.UrlJsonContext.tipo_de_terceiro == objPost.tipo_tercero);
                            if (!isTipoTercero) {
                                status_desc = `ERROR: no hay "${objPost.tipo_tercero}" registrado para ${tabExcel} de "${objPost.nit_proveedor}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                /*await*/ postStatus(status_desc, statusPost, data);
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
                            let getTipoAcceso = /*await*/ getOnergyItem(idTipoAcceso, data.assid, data.usrid, null);
                            let isTipoAcceso = getTipoAcceso.filter((j) => j.UrlJsonContext.tipo_de_acesso == objPost.tipo_acceso);
                            if (!isTipoAcceso) {
                                status_desc = `ERROR: no hay "${objPost.tipo_acceso}" registrado para ${tabExcel} de "${objPost.nit_proveedor}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                /*await*/ postStatus(status_desc, statusPost, data);
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
                            /*await*/ sendItemToOnergy(tabExcelID, data.usrid, data.assid, objPost, '', 'nit_provedor', true, false, false);
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
                            /*await*/ sendItemToOnergy(tabExcelID, data.usrid, data.assid, objPost, '', 'LST_estrato', true, false, false);
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
                            /*await*/ sendItemToOnergy(tabExcelID, data.usrid, data.assid, objPost, '', 'NVT_nivel', true, false, false);
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
                            let getMunicipio = /*await*/ getOnergyItem(idMunicipio, data.assid, data.usrid, null);
                            let isMunicipio = getMunicipio.filter((j) => j.UrlJsonContext.municipio == objPost.municipio);
                            if (!isMunicipio) {
                                status_desc = `ERROR: no hay "${objPost.municipio}" registrado para ${tabExcel} de "${objPost.nit_cliente}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                /*await*/ postStatus(status_desc, statusPost, data);
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
                            /*await*/ sendItemToOnergy(tabExcelID, data.usrid, data.assid, objPost, '', 'COLC_nit_cliente', true, false, false);
                        }

                        //*aba:regional_clientes
                        if (tabExcel == 'regional_clientes') {
                            //*id_one_ref:clientes
                            let paiGrid = '0694dd6e-299a-4b46-b8fd-5e08da24f72d';
                            let paiFiltro = gerarFiltro('COLC_nit_cliente', objPost.nit_cliente);
                            let paiRegistro = /*await*/ getOnergyItem(paiGrid, data.assid, data.usrid, paiFiltro);

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
                            /*await*/ sendItemToOnergy(tabExcelID, data.usrid, data.assid, objPost, '', 'RCS_nit_cliente', true, false, false);
                        }

                        //*aba:contactos_clientes
                        if (tabExcel == 'contactos_clientes') {
                            //*id_one_ref:clientes
                            let paiGrid = '0694dd6e-299a-4b46-b8fd-5e08da24f72d';
                            let paiFiltro = gerarFiltro('COLC_nit_cliente', objPost.nit_cliente);
                            let paiRegistro = /*await*/ getOnergyItem(paiGrid, data.assid, data.usrid, paiFiltro);

                            let isNITCliente = gridDestino.filter((j) => j.UrlJsonContext.CCS_nit_cliente == objPost.nit_cliente);
                            if (!isNITCliente || data.em_caso_de_duplicidade == '1') {
                                objPost.ID_ONE_REF = paiRegistro.length > 0 ? paiRegistro[0].ID : '';
                                objPost.CCS_nit_cliente = objPost.nit_cliente;
                                delete objPost.nit_cliente;
                            }

                            //*pesq.ref:regional_clientes
                            let idRegionalClientes = 'b45777ee-f5f3-429c-9fd7-9ee4578b0b63';
                            let getRegionalClientes = /*await*/ getOnergyItem(idRegionalClientes, data.assid, data.usrid, null);
                            let isRegionalClientes = getRegionalClientes.filter((j) => j.UrlJsonContext.RCS_nome_regional == objPost.nombre_regional);
                            if (!isRegionalClientes) {
                                status_desc = `ERROR: no hay "${objPost.nombre_regional}" registrado para ${tabExcel} de "${objPost.nit_cliente}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                /*await*/ postStatus(status_desc, statusPost, data);
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
                            /*await*/ sendItemToOnergy(tabExcelID, data.usrid, data.assid, objPost, '', 'CCS_nit_cliente', true, false, false);
                        }

                        //*aba:portafolio_clientes
                        if (tabExcel == 'portafolio_clientes') {
                            //*id_one_ref:clientes
                            let paiGrid = '0694dd6e-299a-4b46-b8fd-5e08da24f72d';
                            let paiFiltro = gerarFiltro('COLC_nit_cliente', objPost.nit_cliente);
                            let paiRegistro = /*await*/ getOnergyItem(paiGrid, data.assid, data.usrid, paiFiltro);

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
                            /*await*/ sendItemToOnergy(tabExcelID, data.usrid, data.assid, objPost, '', 'PCS_nit_cliente', true, false, false);
                        }

                        //*aba:sitios
                        if (tabExcel == 'sitios') {
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

                            //*pesq.ref:compania_atc
                            let idCompaniaATC = '8803f10a-9c32-4c4f-8bd6-8e959ed24277';
                            let getCompaniaATC = /*await*/ getOnergyItem(idCompaniaATC, data.assid, data.usrid, null);
                            let isCompaniaATC = getCompaniaATC.filter((j) => j.UrlJsonContext.site == objPost.compania_atc);
                            if (!isCompaniaATC) {
                                status_desc = `ERROR: no hay "${objPost.compania_atc}" registrado para ${tabExcel} de "${objPost.asset_number}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                /*await*/ postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }

                            let isSitCompaniaATC = gridDestino.filter((j) => j.UrlJsonContext.emp_atc_site__empresa_atc == objPost.compania_atc);
                            if (!isSitCompaniaATC || data.em_caso_de_duplicidade == '1') {
                                objPost.emp_atc_site__empresa_atc = isCompaniaATC.length > 0 ? isCompaniaATC[0].UrlJsonContext.site : '';
                                objPost.emp_atc_empresa_atc_id = isCompaniaATC.length > 0 ? isCompaniaATC[0].ID : '';
                                objPost.emp_atc_site = isCompaniaATC.length > 0 ? isCompaniaATC[0].UrlJsonContext.site : '';
                                delete objPost.compania_atc;
                            }

                            //*pesq.ref:municipio
                            let idMunicipio = 'a95b4721-fc79-445c-b964-14a4ccbf1d7b';
                            let getMunicipio = /*await*/ getOnergyItem(idMunicipio, data.assid, data.usrid, null);
                            let isMunicipio = getMunicipio.filter((j) => j.UrlJsonContext.municipio == objPost.municipio);
                            if (!isMunicipio) {
                                status_desc = `ERROR: no hay "${objPost.municipio}" registrado para ${tabExcel} de "${objPost.asset_number}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                /*await*/ postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }

                            let isSitMunicipio = gridDestino.filter((j) => j.UrlJsonContext.loca_cida_municipio == objPost.municipio);
                            if (!isSitMunicipio || data.em_caso_de_duplicidade == '1') {
                                objPost.loca_cida_municipio = isMunicipio.length > 0 ? isMunicipio[0].UrlJsonContext.municipio : '';
                                objPost.loca_cida_id = isMunicipio.length > 0 ? isMunicipio[0].ID : '';
                                objPost.loca_uf_uf = isMunicipio.length > 0 ? isMunicipio[0].UrlJsonContext.uf : '';
                                objPost.loca_uf_id = isMunicipio.length > 0 ? isMunicipio[0].UrlJsonContext.uf_id : '';
                                delete objPost.municipio;
                                delete objPost.departamento;
                            }

                            let isCodigoAnchor = gridDestino.filter((j) => j.UrlJsonContext.codigo_ancora == objPost.codigo_anchor);
                            if (!isCodigoAnchor || data.em_caso_de_duplicidade == '1') {
                                objPost.codigo_ancora = objPost.codigo_anchor;
                                delete objPost.codigo_anchor;
                            }

                            let isDireccion = gridDestino.filter((j) => j.UrlJsonContext.logradouro == objPost.direccion);
                            if (!isDireccion || data.em_caso_de_duplicidade == '1') {
                                objPost.logradouro = objPost.direccion;
                                delete objPost.direccion;
                            }

                            //*pesq.ref:estado_sitio
                            let idEstadoSitio = 'f0ee1dd9-bb48-4aef-9f77-43e357870a31';
                            let getEstadoSitio = /*await*/ getOnergyItem(idEstadoSitio, data.assid, data.usrid, null);
                            let isEstadoSitio = getEstadoSitio.filter((j) => j.UrlJsonContext.status == objPost.estado_sitio);
                            if (!isEstadoSitio) {
                                status_desc = `ERROR: no hay "${objPost.municipio}" registrado para ${tabExcel} de "${objPost.asset_number}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                /*await*/ postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }

                            let isSitEstadoSitio = gridDestino.filter((j) => j.UrlJsonContext.STAstatus__status_do_site == objPost.estado_sitio);
                            if (!isSitEstadoSitio || data.em_caso_de_duplicidade == '1') {
                                objPost.sta_site_status__status_do_site = isEstadoSitio.length > 0 ? isEstadoSitio[0].UrlJsonContext.status : '';
                                objPost.sta_site_status_do_site_id = isEstadoSitio.length > 0 ? isEstadoSitio[0].ID : '';
                                objPost.sta_site_status = isEstadoSitio.length > 0 ? isEstadoSitio[0].UrlJsonContext.status : '';
                                delete objPost.estado_sitio;
                            }

                            //*pesq.ref:portafolio_atc
                            let idPortafolioATC = '18615527-c678-4f1c-87e0-d7a9735d0c6e';
                            let getPortafolioATC = /*await*/ getOnergyItem(idPortafolioATC, data.assid, data.usrid, null);
                            let isPortafolioATC = getPortafolioATC.filter((j) => j.UrlJsonContext.tipo_portifolio == objPost.portafolio_atc);
                            if (!isPortafolioATC) {
                                status_desc = `ERROR: no hay "${objPost.portafolio_atc}" registrado para ${tabExcel} de "${objPost.asset_number}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                /*await*/ postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }

                            let isSitPortafolioATC = gridDestino.filter((j) => j.UrlJsonContext.tppf_tipo_portifolio__portfolio == objPost.portafolio_atc);
                            if (!isSitPortafolioATC || data.em_caso_de_duplicidade == '1') {
                                objPost.tppf_tipo_portifolio__portfolio = isPortafolioATC.length > 0 ? isPortafolioATC[0].UrlJsonContext.tipo_portifolio : '';
                                objPost.tppf_tipo_portifolio_portfolio_id = isPortafolioATC.length > 0 ? isPortafolioATC[0].ID : '';
                                objPost.tppf_portfolio_id = isPortafolioATC.length > 0 ? isPortafolioATC[0].ID : '';
                                delete objPost.portafolio_atc;
                            }

                            //*pesq.ref:regional_atc
                            let idRegionalATC = '74d8a818-46a7-4d56-8a18-2369bdd00589';
                            let getRegionalATC = /*await*/ getOnergyItem(idRegionalATC, data.assid, data.usrid, null);
                            let isRegionalATC = getRegionalATC.filter((j) => j.UrlJsonContext.regional == objPost.regional_atc);
                            if (!isRegionalATC) {
                                status_desc = `ERROR: no hay "${objPost.regional_atc}" registrado para ${tabExcel} de "${objPost.asset_number}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                /*await*/ postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }

                            let isSitRegionalATC = gridDestino.filter((j) => j.UrlJsonContext.regio_regional__regiao_atc == objPost.regional_atc);
                            if (!isSitRegionalATC || data.em_caso_de_duplicidade == '1') {
                                objPost.regio_regional__regiao_atc = isRegionalATC.length > 0 ? isRegionalATC[0].UrlJsonContext.regional : '';
                                objPost.regio_regional_regiao_atc_id = isRegionalATC.length > 0 ? isRegionalATC[0].ID : '';
                                objPost.regio_regiao_atc_id = isRegionalATC.length > 0 ? isRegionalATC[0].ID : '';
                            }

                            //!node:test (unhide.log and hide sendItem)
                            // onergy.log(`JFS: aba:sitios sendItem=>objPost: ${JSON.stringify(objPost)}`);
                            /*await*/ sendItemToOnergy(tabExcelID, data.usrid, data.assid, objPost, '', 'asset_number', true, false, false);
                        }

                        //*aba:informacion_cuenta
                        if (tabExcel == 'informacion_cuenta') {
                            //*id_one_ref:sitios
                            let paiGrid = 'e43b9fe0-6752-446d-8495-0b4fdd7a70b4';
                            let paiFiltro = gerarFiltro('asset_number', objPost.asset_number);
                            let paiRegistro = /*await*/ getOnergyItem(paiGrid, data.assid, data.usrid, paiFiltro);

                            let isProfitCostCenter = gridDestino.filter((j) => j.UrlJsonContext.profit_cost_center == objPost.profit_cost_center);
                            if (!isProfitCostCenter || data.em_caso_de_duplicidade == '1') {
                                objPost.profit_cost_center = objPost.profit_cost_center;
                            }

                            let isPortafolioATC = gridDestino.filter((j) => j.UrlJsonContext.tppf_tipo_portifolio__portfolio == objPost.portafolio_atc);
                            if (!isPortafolioATC || data.em_caso_de_duplicidade == '1') {
                                objPost.tppf_tipo_portifolio__portfolio = objPost.portafolio_atc;
                                delete objPost.portfolio_atc;
                            }

                            let isAssetNumber = gridDestino.filter((j) => j.UrlJsonContext.asset_number_IDC == objPost.asset_number);
                            if (!isAssetNumber || data.em_caso_de_duplicidade == '1') {
                                objPost.ID_ONE_REF = paiRegistro.length > 0 ? paiRegistro[0].ID : '';
                                objPost.asset_number_IDC = objPost.asset_number;
                                objPost.asset_number = objPost.asset_number;
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

                            let isCuentaInternaNIC = gridDestino.filter((j) => j.UrlJsonContext.conta_interna_nic == objPost.cuenta_interna_nic);
                            if (!isCuentaInternaNIC || data.em_caso_de_duplicidade == '1') {
                                objPost.conta_interna_nic = objPost.cuenta_interna_nic;
                                delete objPost.cuenta_interna_nic;
                            }

                            let isCuentaPadre = gridDestino.filter((j) => j.UrlJsonContext.prcs__conta_pai == objPost.cuenta_padre);
                            if (!isCuentaPadre || data.em_caso_de_duplicidade == '1') {
                                objPost.prcs__conta_pai = objPost.cuenta_padre;
                                delete objPost.cuenta_padre;
                            }

                            //*pesq.ref:tipo_cuenta
                            let idTipoCuenta = '84ca5970-7a49-4192-a2c8-030031503a1a';
                            let getTipoCuenta = /*await*/ getOnergyItem(idTipoCuenta, data.assid, data.usrid, null);
                            let isTipoCuenta = getTipoCuenta.filter((j) => j.UrlJsonContext.TC_tipo_de_conta == objPost.tipo_cuenta);
                            if (!isTipoCuenta) {
                                status_desc = `ERROR: no hay "${objPost.tipo_cuenta}" registrado para ${tabExcel} de "${objPost.asset_number}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                /*await*/ postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }

                            let isIdlcTipoCuenta = gridDestino.filter((j) => j.UrlJsonContext.TCTC_tipo_de_conta__prcs__tipo_de_conta == objPost.tipo_cuenta);
                            if (!isIdlcTipoCuenta || data.em_caso_de_duplicidade == '1') {
                                objPost.TCTC_tipo_de_conta__prcs__tipo_de_conta =
                                    isTipoCuenta.length > 0 ? isTipoCuenta[0].UrlJsonContext.TC_tipo_de_conta : '';
                                objPost.TCprcs__tipo_de_conta_id = isTipoCuenta.length > 0 ? isTipoCuenta[0].ID : '';
                                objPost.TCTC_tipo_de_conta__TC_tipo_de_conta_valor =
                                    isTipoCuenta.length > 0 ? isTipoCuenta[0].UrlJsonContext.TC_tipo_de_conta : '';
                                objPost.prcs__tipo_de_conta_cache = isTipoCuenta.length > 0 ? isTipoCuenta[0].ID : '';
                                delete objPost.tipo_cuenta;
                            }

                            let isNumeroMedidor = gridDestino.filter((j) => j.UrlJsonContext.numero_do_medidor == objPost.numero_medidor);
                            if (!isNumeroMedidor || data.em_caso_de_duplicidade == '1') {
                                objPost.numero_do_medidor = objPost.numero_medidor;
                                delete objPost.numero_medidor;
                            }

                            //*pesq.ref:suscriptor
                            let idCompaniaATC = '8803f10a-9c32-4c4f-8bd6-8e959ed24277';
                            let getCompaniaATC = /*await*/ getOnergyItem(idCompaniaATC, data.assid, data.usrid, null);
                            let isSuscriptor = getCompaniaATC.filter((j) => j.UrlJsonContext.site == objPost.suscriptor);
                            if (!isSuscriptor) {
                                status_desc = `ERROR: no hay "${objPost.suscriptor}" registrado para ${tabExcel} de "${objPost.asset_number}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                /*await*/ postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }

                            let isIdlcSuscriptor = gridDestino.filter((j) => j.UrlJsonContext.emp_atc_site__prcs__assinante_atc == objPost.suscriptor);
                            if (!isIdlcSuscriptor || data.em_caso_de_duplicidade == '1') {
                                objPost.emp_atc_site__prcs__assinante_atc = isSuscriptor.length > 0 ? isSuscriptor[0].UrlJsonContext.site : '';
                                objPost.emp_atc_prcs__assinante_atc_id = isSuscriptor.length > 0 ? isSuscriptor[0].ID : '';
                                delete objPost.suscriptor;
                            }

                            //*pesq.ref:estado_cuenta
                            let idEstadoCuenta = '4963d2c6-2b94-4c37-bffb-87c0dc296587';
                            let getEstadoCuenta = /*await*/ getOnergyItem(idEstadoCuenta, data.assid, data.usrid, null);
                            let isEstadoCuenta = getEstadoCuenta.filter((j) => j.UrlJsonContext.status_conta == objPost.estado_cuenta);
                            if (!isEstadoCuenta) {
                                status_desc = `ERROR: no hay "${objPost.estado_cuenta}" registrado para ${tabExcel} de "${objPost.asset_number}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                /*await*/ postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }

                            let isIdlcEstadoCuenta = gridDestino.filter((j) => j.UrlJsonContext.sta_cont_status_conta == objPost.estado_cuenta);
                            if (!isIdlcEstadoCuenta || data.em_caso_de_duplicidade == '1') {
                                objPost.sta_cont_status_conta = idEstadoCuenta[0] ? idEstadoCuenta[0].UrlJsonContext.status_conta : '';
                                objPost.sta_cont_id = idEstadoCuenta[0] ? idEstadoCuenta[0].ID : '';
                                delete objPost.estado_cuenta;
                            }

                            //*pesq.ref:nombre_proveedor
                            let idProveedores = '4783ca0b-357d-42ab-a5c8-3328ee315f86';
                            let getProveedores = /*await*/ getOnergyItem(idProveedores, data.assid, data.usrid, null);
                            let isProveedores = getProveedores.filter((j) => j.UrlJsonContext.nome_provedor == objPost.nombre_proveedor);
                            if (!isProveedores) {
                                status_desc = `ERROR: no hay "${objPost.nombre_proveedor}" registrado para ${tabExcel} de "${objPost.asset_number}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                /*await*/ postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }

                            let isIdlcProveedores = gridDestino.filter((j) => j.UrlJsonContext.prvd_nome_provedor == objPost.nombre_proveedor);
                            if (!isIdlcProveedores || data.em_caso_de_duplicidade == '1') {
                                objPost.prvd_nome_provedor = isProveedores.length > 0 ? isProveedores[0].UrlJsonContext.nome_provedor : '';
                                objPost.prvd_id = isProveedores.length > 0 ? isProveedores[0].ID : '';
                                objPost.nome_provedor_id_cache = isProveedores.length > 0 ? isProveedores[0].ID : '';
                                objPost.prvd_nome_comercial = isProveedores.length > 0 ? isProveedores[0].UrlJsonContext.nome_comercial : '';
                                objPost.prvd_nit_provedor = isProveedores.length > 0 ? isProveedores[0].nit_provedor : '';
                                objPost.prvd_nit_beneficiario = isProveedores.length > 0 ? isProveedores[0].UrlJsonContext.nit_beneficiario : '';
                                objPost.prvd_beneficiario = isProveedores.length > 0 ? isProveedores[0].beneficiario : '';
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
                            let getServicios = /*await*/ getOnergyItem(idServicios, data.assid, data.usrid, null);
                            let isServicios = getServicios.filter((j) => j.UrlJsonContext.servicos == objPost.servicios);
                            if (!isServicios) {
                                status_desc = `ERROR: no hay "${objPost.servicios}" registrado para ${tabExcel} de "${objPost.asset_number}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                /*await*/ postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }

                            let isIdlcServicios = gridDestino.filter((j) => j.UrlJsonContext.SERVservicos__servico == objPost.servicios);
                            if (!isIdlcServicios || data.em_caso_de_duplicidade == '1') {
                                objPost.SERVservicos__servico = isServicios.length > 0 ? isServicios[0].UrlJsonContext.servicos : '';
                                objPost.SERVservico_id = isServicios.length > 0 ? isServicios[0].ID : '';
                                delete objPost.servicios;
                            }

                            //*pesq.ref:sujeto_pasivo
                            let idSujetoPasivo = '78352af1-70b2-43a0-ad2a-084cdcf2eacf';
                            let getSujetoPasivo = /*await*/ getOnergyItem(idSujetoPasivo, data.assid, data.usrid, null);
                            let isSujetoPasivo = getSujetoPasivo.filter((j) => j.UrlJsonContext.sujeito == objPost.sujeto_pasivo);
                            if (!isSujetoPasivo) {
                                status_desc = `ERROR: no hay "${objPost.sujeto_pasivo}" registrado para ${tabExcel} de "${objPost.asset_number}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                /*await*/ postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }

                            let isIdlcSujetoPasivo = gridDestino.filter(
                                (j) => j.UrlJsonContext.suj_pa_sujeito__prcs__sujeito_passivo_alumbrado_publico == objPost.sujeto_pasivo
                            );

                            if (!isIdlcSujetoPasivo || data.em_caso_de_duplicidade == '1') {
                                objPost.suj_pa_sujeito__prcs__sujeito_passivo_alumbrado_publico =
                                    isSujetoPasivo.length > 0 ? isSujetoPasivo[0].UrlJsonContext.sujeito : '';
                                objPost.suj_pa_prcs__sujeito_passivo_alumbrado_publico_id = isSujetoPasivo.length > 0 ? isSujetoPasivo[0].ID : '';
                                delete objPost.sujeto_pasivo;
                            }

                            let isAcuerdoResolucion = gridDestino.filter(
                                (j) => j.UrlJsonContext.prcs__acuerdo_resolucion_alumbrado_publico == objPost.acuerdo_resolucion
                            );
                            if (!isAcuerdoResolucion || data.em_caso_de_duplicidade == '1') {
                                objPost.prcs__acuerdo_resolucion_alumbrado_publico = objPost.acuerdo_resolucion;
                                delete objPost.acuerdo_resolucion;
                            }

                            //*pesq.ref:tipo_cobro
                            let idTipoCobro = '22538843-147f-4d41-9534-20a6d674f4b6';
                            let getTipoCobro = /*await*/ getOnergyItem(idTipoCobro, data.assid, data.usrid, null);
                            let isTipoCobro = getTipoCobro.filter((j) => j.UrlJsonContext.tipos_cobrancas == objPost.tipo_cobro);
                            if (!isTipoCobro) {
                                status_desc = `ERROR: no hay "${objPost.tipo_cobro}" registrado para ${tabExcel} de "${objPost.asset_number}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                /*await*/ postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }

                            let isIdlcTipoCobro = gridDestino.filter((j) => j.UrlJsonContext.tipo_cobr_tipos_cobrancas__tipo_de_cobranca == objPost.tipo_cobro);
                            if (!isIdlcTipoCobro || data.em_caso_de_duplicidade == '1') {
                                objPost.tipo_cobr_tipos_cobrancas__tipo_de_cobranca = isTipoCobro[0] ? isTipoCobro[0].UrlJsonContext.tipos_cobrancas : '';
                                objPost.tipo_cobr_tipo_de_cobranca_id = isTipoCobro[0] ? isTipoCobro[0].ID : '';
                                delete objPost.tipo_cobro;
                            }

                            let isDiaDePago = gridDestino.filter((j) => j.UrlJsonContext.prcs__dia_de_pagamento == objPost.dia_de_pago);
                            if (!isDiaDePago || data.em_caso_de_duplicidade == '1') {
                                objPost.prcs__dia_de_pagamento = objPost.dia_de_pago;
                                delete objPost.dia_de_pago;
                            }

                            //*pesq.ref:frecuencia_pago
                            let idFrecuenciaPago = '2d4edce3-7131-413a-98e5-35d328daef7f';
                            let getFrecuenciaPago = /*await*/ getOnergyItem(idFrecuenciaPago, data.assid, data.usrid, null);
                            let isFrecuenciaPago = getFrecuenciaPago.filter((j) => j.UrlJsonContext.frequencia == objPost.frecuencia_pago);
                            if (!isFrecuenciaPago) {
                                status_desc = `ERROR: no hay "${objPost.frecuencia_pago}" registrado para ${tabExcel} de "${objPost.asset_number}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                /*await*/ postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }

                            let isIdlcFrecuenciaPago = gridDestino.filter(
                                (j) => j.UrlJsonContext.fre_pag_frequencia__frequencia_de_pagamento == objPost.frecuencia_pago
                            );
                            if (!isIdlcFrecuenciaPago || data.em_caso_de_duplicidade == '1') {
                                objPost.fre_pag_frequencia__frequencia_de_pagamento = isFrecuenciaPago[0] ? isFrecuenciaPago[0].UrlJsonContext.frequencia : '';
                                objPost.fre_pag_frequencia_de_pagamento_id = isFrecuenciaPago[0] ? isFrecuenciaPago[0].ID : '';
                                delete objPost.frecuencia_pago;
                            }

                            //*pesq.ref:forma_pago
                            let idFormaPago = '0e8a4463-28db-474f-926b-39fa1bd0c9bc';
                            let getFormaPago = /*await*/ getOnergyItem(idFormaPago, data.assid, data.usrid, null);
                            let isFormaPago = getFormaPago.filter((j) => j.UrlJsonContext.formas_de_pagamentos == objPost.forma_pago);
                            if (!isFormaPago) {
                                status_desc = `ERROR: no hay "${objPost.forma_pago}" registrado para ${tabExcel} de "${objPost.asset_number}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                /*await*/ postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }

                            let isIdlcFormaPago = gridDestino.filter(
                                (j) => j.UrlJsonContext.for_pag_formas_de_pagamentos__forma_de_pagamento == objPost.forma_pago
                            );
                            if (!isIdlcFormaPago || data.em_caso_de_duplicidade == '1') {
                                objPost.for_pag_formas_de_pagamentos__forma_de_pagamento = isFormaPago[0]
                                    ? isFormaPago[0].UrlJsonContext.formas_de_pagamentos
                                    : '';
                                objPost.for_pag_forma_de_pagamento_id = isFormaPago[0] ? isFormaPago[0].ID : '';
                                delete objPost.forma_pago;
                            }

                            //*pesq.ref:clasificacion_passthru
                            let idClasificacionPassthru = 'ad62c737-2abc-4c71-a572-e11933114ed8';
                            let getClasificacionPassthru = /*await*/ getOnergyItem(idClasificacionPassthru, data.assid, data.usrid, null);
                            let isClasificacionPassthru = getClasificacionPassthru.filter(
                                (j) => j.UrlJsonContext.classificacao_passthru == objPost.clasificacion_passthru
                            );
                            if (!isClasificacionPassthru) {
                                status_desc = `ERROR: no hay "${objPost.clasificacion_passthru}" registrado para ${tabExcel} de "${objPost.asset_number}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                /*await*/ postStatus(status_desc, statusPost, data);
                                statusPost = statusPost.concat('\n');
                                return false;
                            }

                            let isIdlcClasificacionPassthru = gridDestino.filter(
                                (j) => j.UrlJsonContext.CPTclassificacao_passthru__prcs__clasificacion_passthru == objPost.clasificacion_passthru
                            );
                            if (!isIdlcClasificacionPassthru || data.em_caso_de_duplicidade == '1') {
                                objPost.CPTclassificacao_passthru__prcs__clasificacion_passthru = isClasificacionPassthru[0]
                                    ? isClasificacionPassthru[0].UrlJsonContext.classificacao_passthru
                                    : '';
                                objPost.CPTprcs__clasificacion_passthru_id = isClasificacionPassthru[0] ? isClasificacionPassthru[0].ID : '';
                                delete objPost.clasificacion_passthru;
                            }

                            //!node:test (unhide log and hide sendItem)
                            // onergy.log(`JFS: aba:informacion_cuenta sendItem=>objPost: ${JSON.stringify(objPost)}`);
                            /*await*/ sendItemToOnergy(tabExcelID, data.usrid, data.assid, objPost, '', 'asset_number', true, false, false);
                        }

                        //*aba:informacion_tecnica
                        if (tabExcel == 'informacion_tecnica') {
                            //*id_one_ref:sitios
                            let paiGrid = 'e43b9fe0-6752-446d-8495-0b4fdd7a70b4';
                            let paiFiltro = gerarFiltro('asset_number', objPost.asset_number);
                            let paiRegistro = /*await*/ getOnergyItem(paiGrid, data.assid, data.usrid, paiFiltro);

                            //*pesq.ref:categorias
                            let idCategorias = '55ec978d-7dbe-4a6f-8cb4-536b53361d54';
                            let getCategorias = /*await*/ getOnergyItem(idCategorias, data.assid, data.usrid, null);
                            let isCategorias = getCategorias.filter((j) => j.UrlJsonContext.categorias == objPost.categorias);
                            if (!isCategorias) {
                                status_desc = `ERROR: no hay "${objPost.categorias}" registrado para ${tabExcel} de "${objPost.asset_number}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                /*await*/ postStatus(status_desc, statusPost, data);
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
                            let getEstrato = /*await*/ getOnergyItem(idEstrato, data.assid, data.usrid, null);
                            let isEstrato = getEstrato.filter((j) => j.UrlJsonContext.LST_estrato == objPost.estrato);
                            if (!isEstrato) {
                                status_desc = `ERROR: no hay "${objPost.estrato}" registrado para ${tabExcel} de "${objPost.asset_number}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                /*await*/ postStatus(status_desc, statusPost, data);
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
                            let getNivelTension = /*await*/ getOnergyItem(idNivelTension, data.assid, data.usrid, null);
                            let isNivelTension = getNivelTension.filter((j) => j.UrlJsonContext.NVT_nivel == objPost.nivel_tension);
                            if (!isNivelTension) {
                                status_desc = `ERROR: no hay "${objPost.nivel_tension}" registrado para ${tabExcel} de "${objPost.asset_number}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                /*await*/ postStatus(status_desc, statusPost, data);
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
                            let getLecturas = /*await*/ getOnergyItem(idLecturas, data.assid, data.usrid, null);
                            let isLecturas = getLecturas.filter((j) => j.UrlJsonContext.LCT_ferramentas == objPost.lectura_atc);
                            if (!isLecturas) {
                                status_desc = `ERROR: no hay "${objPost.lectura_atc}" registrado para ${tabExcel} de "${objPost.asset_number}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                /*await*/ postStatus(status_desc, statusPost, data);
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
                            /*await*/ sendItemToOnergy(tabExcelID, data.usrid, data.assid, objPost, '', 'asset_number', true, false, false);
                        }

                        //*aba:clientes_sitio
                        if (tabExcel == 'clientes_sitio') {
                            //*id_one_ref:clientes
                            let paiGrid = '0694dd6e-299a-4b46-b8fd-5e08da24f72d';
                            let paiFiltro = gerarFiltro('COLC_nit_cliente', objPost.nit_cliente);
                            let paiRegistro = /*await*/ getOnergyItem(paiGrid, data.assid, data.usrid, paiFiltro);

                            //*pesq.ref:nit_cliente
                            let idClientes = '0694dd6e-299a-4b46-b8fd-5e08da24f72d';
                            let getClientes = /*await*/ getOnergyItem(idClientes, data.assid, data.usrid, null);
                            let isClientes = getClientes.filter((j) => j.UrlJsonContext.COLC_nit_cliente == objPost.nit_cliente);
                            if (!isClientes) {
                                status_desc = `ERROR: no hay "${objPost.nit_cliente}" registrado para ${tabExcel} de "${objPost.nit_cliente}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                /*await*/ postStatus(status_desc, statusPost, data);
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
                            let getRegionalClientes = /*await*/ getOnergyItem(idRegionalClientes, data.assid, data.usrid, null);
                            let isRegionalClientes = getRegionalClientes.filter((j) => j.UrlJsonContext.RCS_nome_regional == objPost.nombre_regional);
                            if (!isRegionalClientes) {
                                status_desc = `ERROR: no hay "${objPost.nombre_regional}" registrado para ${tabExcel} de "${objPost.nit_cliente}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                /*await*/ postStatus(status_desc, statusPost, data);
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
                            let getPortafolioCliente = /*await*/ getOnergyItem(idPortafolioCliente, data.assid, data.usrid, null);
                            let isPortafolioCliente = getPortafolioCliente.filter((j) => j.UrlJsonContext.PCS_portafolio_cliente == objPost.portafolio_cliente);
                            if (!isPortafolioCliente) {
                                status_desc = `ERROR: no hay "${objPost.portafolio_cliente}" registrado para ${tabExcel} de "${objPost.nit_cliente}"`;
                                statusPost.push(`${time}, ${status_desc}`);
                                /*await*/ postStatus(status_desc, statusPost, data);
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
                            /*await*/ sendItemToOnergy(tabExcelID, data.usrid, data.assid, objPost, '', 'COLCCOLC_nit_cliente', true, false, false);
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
                            /*await*/ sendItemToOnergy(tabExcelID, data.usrid, data.assid, objPost, '', 'classificacao_passthru', true, false, false);
                        }
                    }
                } else {
                    status_desc = `ERROR: los datos de ${tabExcel} no fueron procesados`;
                    statusPost.push(`${time}, ${status_desc}`);
                    /*await*/ postStatus(status_desc, statusPost, data);
                    statusPost = statusPost.concat('\n');
                    return false;
                }
            } else {
                status_desc = `ERROR: no se encontraron datos en ${tabExcel}`;
                statusPost.push(`${time}, ${status_desc}`);
                /*await*/ postStatus(status_desc, statusPost, data);
                statusPost = statusPost.concat('\n');
                return false;
            }
        } else {
            status_desc = `ERROR: No hay registros en ${nomePlanilha}`;
            statusPost.push(`${time}, ${status_desc}`);
            /*await*/ postStatus(status_desc, statusPost, data);
            statusPost = statusPost.concat('\n');
            return false;
        }
    } else {
        status_desc = `ERROR: El índice carga ${cargaIndiceNome} no coincide con ${tabExcel}`;
        statusPost.push(`${time}, ${status_desc}`);
        /*await*/ postStatus(status_desc, statusPost, data);
        statusPost = statusPost.concat('\n');
        return false;
    }

    //*status:done
    status_desc = `Carga de ${tabExcel} finalizada`;
    statusPost.push(`${time}, ${status_desc}`);
    /*await*/ postStatus(status_desc, statusPost, data);
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
