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
    // onergy.log(`JFS: function(postStatus) sendItem=>postInfo: ${JSON.stringify(postInfo)}`);
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
function gerarData() {
    let dataAtual = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    let dia = dataAtual.getDate();
    let mes = dataAtual.getMonth() + 1;
    let ano = dataAtual.getFullYear();
    let hora = dataAtual.getHours();
    let minuto = dataAtual.getMinutes();
    let segundo = dataAtual.getSeconds();
    let strData = `${dia}/${mes}/${ano} ${hora}:${minuto}:${segundo}`;
    return strData;
}
/*async*/ function init(json) {
    let data = JSON.parse(json);
    let time = gerarData();
    let arrayPost = [];
    let statusPost = [];
    let qtdReg = 0;
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
                statusPost.push(`${time}, ${status_desc}\n`);
                /*await*/ postStatus(status_desc, statusPost, data);

                //*em cada conteúdo, cria objeto com nome da planilha e anexa ao array de post
                for (let x in ctxExcel) {
                    let objLine = {
                        nomePlanilhaCarga: nomePlanilha,
                    };

                    //*em cada coluna, verifica tipo e reatribui valor para objeto
                    for (let n in fielName) {
                        let name = fielName[n];
                        let val = ctxExcel[x];

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

                        if (typeof val[name] == 'string') {
                            objLine[name] = val[name].trim();
                        } else {
                            objLine[name] = val[name];
                        }
                    }
                    arrayPost.push(objLine);
                }
            } else {
                status_desc = `No hay contenido en ${tabExcel}`;
                statusPost.push(`${time}, ${status_desc}\n`);
                /*await*/ postStatus(status_desc, statusPost, data);
                return false;
            }

            //*se não existir dados no array de post, gera erro
            if (arrayPost.length > 0) {
                qtdReg = arrayPost.length;

                //*status:processando
                status_desc = `Manejando ${qtdReg} registros de ${tabExcel}`;
                statusPost.push(`${time}, ${status_desc}\n`);
                /*await*/ postStatus(status_desc, statusPost, data);

                //*em cada objeto do array de post, verifica duplicidade e posta
                let gridDestino = /*await*/ getOnergyItem(tabExcelID, data.assid, data.usrid, null);
                for (let y in arrayPost) {
                    //*aba:categorias
                    if (tabExcel == 'categorias') {
                        let duplicadorCategoria = gridDestino.filter((j) => j.UrlJsonContext.categorias == arrayPost[y].categorias);
                        if (duplicadorCategoria.length == 0 || data.em_caso_de_duplicidade == '1') {
                            arrayPost[y].categorias = arrayPost[y].categorias;
                        }
                    }

                    //*aba:departamento
                    if (tabExcel == 'departamento') {
                        let duplicadorUf = gridDestino.filter((j) => j.UrlJsonContext.uf == arrayPost[y].departamento_sigla);
                        if (duplicadorUf.length == 0 || data.em_caso_de_duplicidade == '1') {
                            arrayPost[y].uf = arrayPost[y].departamento_sigla;
                            arrayPost[y].estado = arrayPost[y].departamento;
                        }
                    }

                    //*aba:municipio
                    if (tabExcel == 'municipio') {
                        //*pesq.ref:uf
                        let ufGrid = '132b8394-2193-4d83-a399-08f4cde70873';
                        let registroUf = /*await*/ getOnergyItem(ufGrid, data.assid, data.usrid, null);
                        let retornoUf = registroUf.filter((j) => j.UrlJsonContext.uf == arrayPost[y].departamento);
                        if (!retornoUf) {
                            status_desc = `ERROR: no hay "${arrayPost[y].departamento}" registrado para ${tabExcel} de "${arrayPost[y].municipio}"`;
                            statusPost.push(`${time}, ${status_desc}\n`);
                            /*await*/ postStatus(status_desc, statusPost, data);
                            return false;
                        }
                        let duplicadorCidade = gridDestino.filter((j) => j.UrlJsonContext.municipio == arrayPost[y].municipio);
                        if (duplicadorCidade.length == 0 || data.em_caso_de_duplicidade == '1') {
                            arrayPost[y].loca_uf_uf = retornoUf[0] ? retornoUf[0].UrlJsonContext.uf : '';
                            arrayPost[y].loca_uf_id = retornoUf[0] ? retornoUf[0].ID : '';
                            arrayPost[y].municipio = arrayPost[y].municipio;
                        }

                        //!node:test (unhide log and hide postArray)
                        // onergy.log(`JFS: aba:municipio sendItem=>arrayPost[y]: ${JSON.stringify(arrayPost[y])}`);
                        let postArray = /*await*/ sendItemToOnergy(tabExcelID, data.usrid, data.assid, arrayPost[y], '', 'municipio', true, false, false);
                    }

                    //*aba:compania_atc
                    if (tabExcel == 'compania_atc') {
                        let duplicadorEmpresa = gridDestino.filter((j) => j.UrlJsonContext.site == arrayPost[y].compania_atc);
                        if (duplicadorEmpresa.length == 0 || data.em_caso_de_duplicidade == '1') {
                            arrayPost[y].site = arrayPost[y].compania_atc;
                        }
                    }

                    //*aba:formas_pagos
                    if (tabExcel == 'formas_pagos') {
                        let duplicadorFormaPagamento = gridDestino.filter((j) => j.UrlJsonContext.formas_de_pagamentos == arrayPost[y].formas_pagos);
                        if (duplicadorFormaPagamento.length == 0 || data.em_caso_de_duplicidade == '1') {
                            arrayPost[y].formas_de_pagamentos = arrayPost[y].formas_pagos;
                        }
                    }

                    //*aba:frecuencia_pagos
                    if (tabExcel == 'frecuencia_pagos') {
                        let duplicadorFrequencia = gridDestino.filter((j) => j.UrlJsonContext.frequencia == arrayPost[y].frecuencia_pagos);
                        if (duplicadorFrequencia.length == 0 || data.em_caso_de_duplicidade == '1') {
                            arrayPost[y].frequencia = arrayPost[y].frecuencia_pagos;
                        }
                    }

                    //*aba:lecturas
                    if (tabExcel == 'lecturas') {
                        let duplicadorLectura = gridDestino.filter((j) => j.UrlJsonContext.LCT_ferramentas == arrayPost[y].herramientas);
                        if (duplicadorLectura.length == 0 || data.em_caso_de_duplicidade == '1') {
                            arrayPost[y].LCT_ferramentas = arrayPost[y].herramientas;
                        }
                    }

                    //*aba:portafolio_atc
                    if (tabExcel == 'portafolio_atc') {
                        let duplicadorPortifolio = gridDestino.filter((j) => j.UrlJsonContext.tipo_portifolio == arrayPost[y].portafolio_atc);
                        if (duplicadorPortifolio.length == 0 || data.em_caso_de_duplicidade == '1') {
                            arrayPost[y].tipo_portifolio = arrayPost[y].portafolio_atc;
                        }
                    }

                    //*aba:regional
                    if (tabExcel == 'regional') {
                        let duplicadorRegional = gridDestino.filter((j) => j.UrlJsonContext.regional == arrayPost[y].regional_atc);
                        if (duplicadorRegional.length == 0 || data.em_caso_de_duplicidade == '1') {
                            arrayPost[y].regional = arrayPost[y].regional_atc;
                        }
                    }

                    //*aba:servicios
                    if (tabExcel == 'servicios') {
                        let duplicadorServico = gridDestino.filter((j) => j.UrlJsonContext.servicos == arrayPost[y].servicios);
                        if (duplicadorServico.length == 0 || data.em_caso_de_duplicidade == '1') {
                            arrayPost[y].servicos = arrayPost[y].servicios;
                        }
                    }

                    //*aba:estado_cuenta
                    if (tabExcel == 'estado_cuenta') {
                        let duplicadorEstadoCuenta = gridDestino.filter((j) => j.UrlJsonContext.status_conta == arrayPost[y].estado_cuenta);
                        if (duplicadorEstadoCuenta.length == 0 || data.em_caso_de_duplicidade == '1') {
                            arrayPost[y].status_conta = arrayPost[y].estado_cuenta;
                        }
                    }

                    //*aba:estado_sitio
                    if (tabExcel == 'estado_sitio') {
                        let duplicadorEstadoSitio = gridDestino.filter((j) => j.UrlJsonContext.status == arrayPost[y].estado_sitio);
                        if (duplicadorEstadoSitio.length == 0 || data.em_caso_de_duplicidade == '1') {
                            arrayPost[y].status = arrayPost[y].estado_sitio;
                        }
                    }

                    //*aba:sujeto_pasivo
                    if (tabExcel == 'sujeto_pasivo') {
                        let duplicadorSujetoPasivo = gridDestino.filter((j) => j.UrlJsonContext.sujeito == arrayPost[y].sujeto_pasivo);
                        if (duplicadorSujetoPasivo.length == 0 || data.em_caso_de_duplicidade == '1') {
                            arrayPost[y].sujeito = arrayPost[y].sujeto_pasivo;
                        }
                    }

                    //*aba:tipo_cobro
                    if (tabExcel == 'tipo_cobro') {
                        let duplicadorTipoCobro = gridDestino.filter((j) => j.UrlJsonContext.tipos_cobrancas == arrayPost[y].tipo_cobro);
                        if (duplicadorTipoCobro.length == 0 || data.em_caso_de_duplicidade == '1') {
                            arrayPost[y].tipos_cobrancas = arrayPost[y].tipo_cobro;
                        }
                    }

                    //*aba:tipo_tercero
                    if (tabExcel == 'tipo_tercero') {
                        let duplicadorTipoTercero = gridDestino.filter((j) => j.UrlJsonContext.tipo_de_terceiro == arrayPost[y].tipo_tercero);
                        if (duplicadorTipoTercero.length == 0 || data.em_caso_de_duplicidade == '1') {
                            arrayPost[y].tipo_de_terceiro = arrayPost[y].tipo_tercero;
                        }
                    }

                    //*aba:tipo_acceso
                    if (tabExcel == 'tipo_acceso') {
                        let duplicadorTipoAcesso = gridDestino.filter((j) => j.UrlJsonContext.tipo_de_acesso == arrayPost[y].tipo_acceso);
                        if (duplicadorTipoAcesso.length == 0 || data.em_caso_de_duplicidade == '1') {
                            arrayPost[y].tipo_de_acesso = arrayPost[y].tipo_acceso;
                        }
                    }

                    //*aba:tipo_cuenta
                    if (tabExcel == 'tipo_cuenta') {
                        let duplicadorTipoCuenta = gridDestino.filter((j) => j.UrlJsonContext.TC_tipo_de_conta == arrayPost[y].tipo_cuenta);
                        if (duplicadorTipoCuenta.length == 0 || data.em_caso_de_duplicidade == '1') {
                            arrayPost[y].TC_tipo_de_conta = arrayPost[y].tipo_cuenta;
                        }
                    }

                    //*aba:estado_legalizacion
                    if (tabExcel == 'estado_legalizacion') {
                        let duplicadorEstadoLegalizacao = gridDestino.filter((j) => j.UrlJsonContext.status == arrayPost[y].estado_legalizacion);
                        if (duplicadorEstadoLegalizacao.length == 0 || data.em_caso_de_duplicidade == '1') {
                            arrayPost[y].status = arrayPost[y].estado_legalizacion;
                        }
                    }

                    //*aba:medidores_sitio
                    if (tabExcel == 'medidores_sitio') {
                        let duplicadorAssetNumber = gridDestino.filter((j) => j.UrlJsonContext.asset_number == arrayPost[y].asset_number);
                        if (duplicadorAssetNumber.length == 0 || data.em_caso_de_duplicidade == '1') {
                            arrayPost[y].asset_number = arrayPost[y].asset_number;
                        }
                        let duplicadorContaInternaNIC = gridDestino.filter((j) => j.UrlJsonContext.conta_interna_nic == arrayPost[y].cuenta_interna_nic);
                        if (duplicadorContaInternaNIC.length == 0 || data.em_caso_de_duplicidade == '1') {
                            arrayPost[y].conta_interna_nic = arrayPost[y].cuenta_interna_nic;
                        }
                        let duplicadorMedidoresSitio = gridDestino.filter((j) => j.UrlJsonContext.numero_do_medidor == arrayPost[y].numero_medidor);
                        if (duplicadorMedidoresSitio.length == 0 || data.em_caso_de_duplicidade == '1') {
                            arrayPost[y].numero_do_medidor = arrayPost[y].numero_medidor;
                        }
                    }

                    //*aba:proveedores
                    if (tabExcel == 'proveedores') {
                        let duplicadorNITProvedor = gridDestino.filter((j) => j.UrlJsonContext.nit_provedor == arrayPost[y].nit_proveedor);
                        if (duplicadorNITProvedor.length == 0 || data.em_caso_de_duplicidade == '1') {
                            arrayPost[y].nit_provedor = arrayPost[y].nit_proveedor;
                        }
                        let duplicadorNomeProvedor = gridDestino.filter((j) => j.UrlJsonContext.nome_provedor == arrayPost[y].nombre_proveedor);
                        if (duplicadorNomeProvedor.length == 0 || data.em_caso_de_duplicidade == '1') {
                            arrayPost[y].nome_provedor = arrayPost[y].nombre_proveedor;
                        }
                        let duplicadorNITBeneficiario = gridDestino.filter((j) => j.UrlJsonContext.nit_beneficiario == arrayPost[y].nit_beneficiario);
                        if (duplicadorNITBeneficiario.length == 0 || data.em_caso_de_duplicidade == '1') {
                            arrayPost[y].nit_beneficiario = arrayPost[y].nit_beneficiario;
                        }
                        let duplicadorNomeBeneficiario = gridDestino.filter((j) => j.UrlJsonContext.beneficiario == arrayPost[y].nombre_beneficiario);
                        if (duplicadorNomeBeneficiario.length == 0 || data.em_caso_de_duplicidade == '1') {
                            arrayPost[y].beneficiario = arrayPost[y].nombre_beneficiario;
                        }
                        //*pesq.ref:tipo_tercero
                        let tipoTerceiroGrid = '70110b99-aa96-4e25-b1b2-177484668700';
                        let registroTipoTerceiro = /*await*/ getOnergyItem(tipoTerceiroGrid, data.assid, data.usrid, null);
                        let retornoTipoTerceiro = registroTipoTerceiro.filter((j) => j.UrlJsonContext.tipo_de_terceiro == arrayPost[y].tipo_tercero);
                        if (!retornoTipoTerceiro) {
                            status_desc = `ERROR: no hay "${arrayPost[y].tipo_tercero}" registrado para ${tabExcel} de "${arrayPost[y].nit_proveedor}"`;
                            statusPost.push(`${time}, ${status_desc}\n`);
                            /*await*/ postStatus(status_desc, statusPost, data);
                            return false;
                        }
                        let duplicadorTipoTerceiro = gridDestino.filter((j) => j.UrlJsonContext.tp3o_tipo_de_terceiro == arrayPost[y].tipo_tercero);
                        if (duplicadorTipoTerceiro.length == 0 || data.em_caso_de_duplicidade == '1') {
                            arrayPost[y].tp3o_tipo_de_terceiro = retornoTipoTerceiro[0] ? retornoTipoTerceiro[0].UrlJsonContext.tipo_de_terceiro : '';
                            arrayPost[y].tp3o_id = retornoTipoTerceiro[0] ? retornoTipoTerceiro[0].ID : '';
                        }
                        let duplicadorNomeComercial = gridDestino.filter((j) => j.UrlJsonContext.nome_comercial == arrayPost[y].nombre_comercial);
                        if (duplicadorNomeComercial.length == 0 || data.em_caso_de_duplicidade == '1') {
                            arrayPost[y].nome_comercial = arrayPost[y].nombre_comercial;
                        }
                        let duplicadorTemContaPai = gridDestino.filter((j) => j.UrlJsonContext.prvd__tem_conta_pai == arrayPost[y].tiene_cuenta_padre);
                        if (duplicadorTemContaPai.length == 0 || data.em_caso_de_duplicidade == '1') {
                            arrayPost[y].prvd__tem_conta_pai = arrayPost[y].tiene_cuenta_padre;
                        }
                        let duplicadorDiaVencimento = gridDestino.filter((j) => j.UrlJsonContext.dia_de_vencimento == arrayPost[y].dia_de_pago);
                        if (duplicadorDiaVencimento.length == 0 || data.em_caso_de_duplicidade == '1') {
                            arrayPost[y].dia_de_vencimento = arrayPost[y].dia_de_pago;
                        }
                        //*pesq.ref:tipo_acceso
                        let tipoAcessoGrid = '62e9a129-73b5-4819-9c16-f1d4bdababde';
                        let registroTipoAcesso = /*await*/ getOnergyItem(tipoAcessoGrid, data.assid, data.usrid, null);
                        let retornoTipoAcesso = registroTipoAcesso.filter((j) => j.UrlJsonContext.tipo_de_acesso == arrayPost[y].tipo_acceso);
                        if (!retornoTipoAcesso) {
                            status_desc = `ERROR: no hay "${arrayPost[y].tipo_acceso}" registrado para ${tabExcel} de "${arrayPost[y].nit_proveedor}"`;
                            statusPost.push(`${time}, ${status_desc}\n`);
                            /*await*/ postStatus(status_desc, statusPost, data);
                            return false;
                        }
                        let duplicadorTipoAcesso = gridDestino.filter((j) => j.UrlJsonContext.tp_acces_tipo_de_acesso == arrayPost[y].tipo_acceso);
                        if (duplicadorTipoAcesso.length == 0 || data.em_caso_de_duplicidade == '1') {
                            arrayPost[y].tp_acces_tipo_de_acesso = retornoTipoAcesso[0] ? retornoTipoAcesso[0].UrlJsonContext.tipo_de_acesso : '';
                            arrayPost[y].tp_acces_id = retornoTipoAcesso[0] ? retornoTipoAcesso[0].ID : '';
                        }

                        //!node:test (unhide.log and hide postArray)
                        // onergy.log(`JFS: aba:proveedores sendItem=>arrayPost[y]: ${JSON.stringify(arrayPost[y])}`);
                        let postArray = /*await*/ sendItemToOnergy(tabExcelID, data.usrid, data.assid, arrayPost[y], '', 'nit_provedor', true, false, false);
                    }

                    //*aba:sitios
                    if (tabExcel == 'sitios') {
                        let duplicadorAssetNumber = gridDestino.filter((j) => j.UrlJsonContext.asset_number == arrayPost[y].asset_number);
                        if (duplicadorAssetNumber.length == 0 || data.em_caso_de_duplicidade == '1') {
                            arrayPost[y].asset_number = arrayPost[y].asset_number;
                        }
                        let duplicadorProfitCostCenter = gridDestino.filter((j) => j.UrlJsonContext.profit_cost_center == arrayPost[y].profit_cost_center);
                        if (duplicadorProfitCostCenter.length == 0 || data.em_caso_de_duplicidade == '1') {
                            arrayPost[y].profit_cost_center = arrayPost[y].profit_cost_center;
                        }
                        let duplicadorNomeSitio = gridDestino.filter((j) => j.UrlJsonContext.site_name == arrayPost[y].nombre_sitio);
                        if (duplicadorNomeSitio.length == 0 || data.em_caso_de_duplicidade == '1') {
                            arrayPost[y].site_name = arrayPost[y].nombre_sitio;
                        }
                        //*pesq.ref:site
                        let empresaATCGrid = '8803f10a-9c32-4c4f-8bd6-8e959ed24277';
                        let registroEmpresaATC = /*await*/ getOnergyItem(empresaATCGrid, data.assid, data.usrid, null);
                        let retornoEmpresaATC = registroEmpresaATC.filter((j) => j.UrlJsonContext.site == arrayPost[y].compania_atc);
                        if (!retornoEmpresaATC) {
                            status_desc = `ERROR: no hay "${arrayPost[y].compania_atc}" registrado para ${tabExcel} de "${arrayPost[y].asset_number}"`;
                            statusPost.push(`${time}, ${status_desc}\n`);
                            /*await*/ postStatus(status_desc, statusPost, data);
                            return false;
                        }
                        let duplicadorEmpresaATC = gridDestino.filter((j) => j.UrlJsonContext.emp_atc_site__empresa_atc == arrayPost[y].compania_atc);
                        if (duplicadorEmpresaATC.length == 0 || data.em_caso_de_duplicidade == '1') {
                            arrayPost[y].emp_atc_site__empresa_atc = retornoEmpresaATC[0] ? retornoEmpresaATC[0].UrlJsonContext.site : '';
                            arrayPost[y].emp_atc_empresa_atc_id = retornoEmpresaATC[0] ? retornoEmpresaATC[0].ID : '';
                        }
                        //*pesq.ref:municipio
                        let MunicipioGrid = 'a95b4721-fc79-445c-b964-14a4ccbf1d7b';
                        let registroMunicipio = /*await*/ getOnergyItem(MunicipioGrid, data.assid, data.usrid, null);
                        let retornoMunicipio = registroMunicipio.filter((j) => j.UrlJsonContext.municipio == arrayPost[y].municipio);
                        if (!retornoMunicipio) {
                            status_desc = `ERROR: no hay "${arrayPost[y].municipio}" registrado para ${tabExcel} de "${arrayPost[y].asset_number}"`;
                            statusPost.push(`${time}, ${status_desc}\n`);
                            /*await*/ postStatus(status_desc, statusPost, data);
                            return false;
                        }
                        let duplicadorMunicipio = gridDestino.filter((j) => j.UrlJsonContext.loca_cida_municipio == arrayPost[y].municipio);
                        if (duplicadorMunicipio.length == 0 || data.em_caso_de_duplicidade == '1') {
                            arrayPost[y].loca_cida_municipio = retornoEmpresaATC[0] ? retornoEmpresaATC[0].UrlJsonContext.site : '';
                            arrayPost[y].loca_cida_id = retornoEmpresaATC[0] ? retornoEmpresaATC[0].ID : '';
                            arrayPost[y].loca_cida_loca_uf_sigla_estado__uf = retornoEmpresaATC[0] ? retornoEmpresaATC[0].UrlJsonContext.uf : '';
                            arrayPost[y].loca_uf_id = retornoEmpresaATC[0] ? retornoEmpresaATC[0].UrlJsonContext.uf_id : '';
                        }
                        let duplicadorCodigoAncora = gridDestino.filter((j) => j.UrlJsonContext.codigo_ancora == arrayPost[y].codigo_anchor);
                        if (duplicadorCodigoAncora.length == 0 || data.em_caso_de_duplicidade == '1') {
                            arrayPost[y].codigo_ancora = arrayPost[y].codigo_anchor;
                        }
                        let duplicadorLogradouro = gridDestino.filter((j) => j.UrlJsonContext.logradouro == arrayPost[y].direccion);
                        if (duplicadorLogradouro.length == 0 || data.em_caso_de_duplicidade == '1') {
                            arrayPost[y].logradouro = arrayPost[y].direccion;
                        }
                        //*pesq.ref:status
                        let StatusSiteGrid = 'f0ee1dd9-bb48-4aef-9f77-43e357870a31';
                        let registroStatusSite = /*await*/ getOnergyItem(StatusSiteGrid, data.assid, data.usrid, null);
                        let retornoStatusSite = registroStatusSite.filter((j) => j.UrlJsonContext.status == arrayPost[y].estado_sitio);
                        if (!retornoStatusSite) {
                            status_desc = `ERROR: no hay "${arrayPost[y].municipio}" registrado para ${tabExcel} de "${arrayPost[y].asset_number}"`;
                            statusPost.push(`${time}, ${status_desc}\n`);
                            /*await*/ postStatus(status_desc, statusPost, data);
                            return false;
                        }
                        let duplicadorStatusSite = gridDestino.filter((j) => j.UrlJsonContext.STAstatus__status_do_site == arrayPost[y].estado_sitio);
                        if (duplicadorStatusSite.length == 0 || data.em_caso_de_duplicidade == '1') {
                            arrayPost[y].STAstatus__status_do_site = retornoStatusSite[0] ? retornoStatusSite[0].UrlJsonContext.status : '';
                            arrayPost[y].STAstatus_do_site_id = retornoStatusSite[0] ? retornoStatusSite[0].ID : '';
                        }
                        //*pesq.ref:tipo_portifolio
                        let portfolioGrid = '18615527-c678-4f1c-87e0-d7a9735d0c6e';
                        let registroPortfolio = /*await*/ getOnergyItem(portfolioGrid, data.assid, data.usrid, null);
                        let retornoPortfolio = registroPortfolio.filter((j) => j.UrlJsonContext.tipo_portifolio == arrayPost[y].portafolio_atc);
                        if (!retornoPortfolio) {
                            status_desc = `ERROR: no hay "${arrayPost[y].portafolio_atc}" registrado para ${tabExcel} de "${arrayPost[y].asset_number}"`;
                            statusPost.push(`${time}, ${status_desc}\n`);
                            /*await*/ postStatus(status_desc, statusPost, data);
                            return false;
                        }
                        let duplicadorPortfolio = gridDestino.filter((j) => j.UrlJsonContext.tppf_tipo_portifolio__portfolio == arrayPost[y].portafolio_atc);
                        if (duplicadorPortfolio.length == 0 || data.em_caso_de_duplicidade == '1') {
                            arrayPost[y].tppf_tipo_portifolio__portfolio = retornoPortfolio[0] ? retornoPortfolio[0].UrlJsonContext.tipo_portifolio : '';
                            arrayPost[y].tppf_portfolio_id = retornoPortfolio[0] ? retornoPortfolio[0].ID : '';
                        }
                        //*pesq.ref:regional
                        let regiaoATCGrid = '74d8a818-46a7-4d56-8a18-2369bdd00589';
                        let registroRegiaoATC = /*await*/ getOnergyItem(regiaoATCGrid, data.assid, data.usrid, null);
                        let retornoRegiaoATC = registroRegiaoATC.filter((j) => j.UrlJsonContext.regional == arrayPost[y].regional_atc);
                        if (!retornoRegiaoATC) {
                            status_desc = `ERROR: no hay "${arrayPost[y].regional_atc}" registrado para ${tabExcel} de "${arrayPost[y].asset_number}"`;
                            statusPost.push(`${time}, ${status_desc}\n`);
                            /*await*/ postStatus(status_desc, statusPost, data);
                            return false;
                        }
                        let duplicadorRegiaoATC = gridDestino.filter((j) => j.UrlJsonContext.regio_regional__regiao_atc == arrayPost[y].regional_atc);
                        if (duplicadorRegiaoATC.length == 0 || data.em_caso_de_duplicidade == '1') {
                            arrayPost[y].regio_regional__regiao_atc = retornoRegiaoATC[0] ? retornoRegiaoATC[0].UrlJsonContext.regional : '';
                            arrayPost[y].regio_regiao_atc_id = retornoRegiaoATC[0] ? retornoRegiaoATC[0].ID : '';
                        }

                        //!node:test (unhide.log and hide sendItemToOnergy)
                        // onergy.log(`JFS: aba:sitios sendItem=>arrayPost[y]: ${JSON.stringify(arrayPost[y])}`);
                        let postArray = /*await*/ sendItemToOnergy(tabExcelID, data.usrid, data.assid, arrayPost[y], '', 'asset_number', true, false, false);
                    }

                    //*aba:informacion_cuenta
                    if (tabExcel == 'informacion_cuenta') {
                        let duplicadorProfitCostCenter = gridDestino.filter((j) => j.UrlJsonContext.profit_cost_center == arrayPost[y].profit_cost_center);
                        if (duplicadorProfitCostCenter.length == 0 || data.em_caso_de_duplicidade == '1') {
                            arrayPost[y].profit_cost_center = arrayPost[y].profit_cost_center;
                        }
                        let duplicadorAssetNumber = gridDestino.filter((j) => j.UrlJsonContext.asset_number_IDC == arrayPost[y].asset_number);
                        if (duplicadorAssetNumber.length == 0 || data.em_caso_de_duplicidade == '1') {
                            arrayPost[y].asset_number_IDC = arrayPost[y].asset_number;
                        }
                        let duplicadorNomeSitio = gridDestino.filter((j) => j.UrlJsonContext.site_name == arrayPost[y].nombre_sitio);
                        if (duplicadorNomeSitio.length == 0 || data.em_caso_de_duplicidade == '1') {
                            arrayPost[y].site_name = arrayPost[y].nombre_sitio;
                        }
                        let duplicadorEmpresaATC = gridDestino.filter((j) => j.UrlJsonContext.emp_atc_site == arrayPost[y].compania_atc);
                        if (duplicadorEmpresaATC.length == 0 || data.em_caso_de_duplicidade == '1') {
                            arrayPost[y].emp_atc_site = arrayPost[y].compania_atc;
                        }
                        let duplicadorContaInternaNIC = gridDestino.filter((j) => j.UrlJsonContext.conta_interna_nic == arrayPost[y].cuenta_interna_nic);
                        if (duplicadorContaInternaNIC.length == 0 || data.em_caso_de_duplicidade == '1') {
                            arrayPost[y].conta_interna_nic = arrayPost[y].cuenta_interna_nic;
                        }
                        let duplicadorContaPai = gridDestino.filter((j) => j.UrlJsonContext.prcs__conta_pai == arrayPost[y].cuenta_padre);
                        if (duplicadorContaPai.length == 0 || data.em_caso_de_duplicidade == '1') {
                            arrayPost[y].prcs__conta_pai = arrayPost[y].cuenta_padre;
                        }
                        //*pesq.ref:TC_tipo_de_conta
                        let tipoContaGrid = '84ca5970-7a49-4192-a2c8-030031503a1a';
                        let registroTipoConta = /*await*/ getOnergyItem(tipoContaGrid, data.assid, data.usrid, null);
                        let retornoTipoConta = registroTipoConta.filter((j) => j.UrlJsonContext.TC_tipo_de_conta == arrayPost[y].tipo_cuenta);
                        if (!retornoTipoConta) {
                            status_desc = `ERROR: no hay "${arrayPost[y].tipo_cuenta}" registrado para ${tabExcel} de "${arrayPost[y].asset_number}"`;
                            statusPost.push(`${time}, ${status_desc}\n`);
                            /*await*/ postStatus(status_desc, statusPost, data);
                            return false;
                        }
                        let duplicadorTipoConta = gridDestino.filter(
                            (j) => j.UrlJsonContext.TCTC_tipo_de_conta__prcs__tipo_de_conta == arrayPost[y].tipo_cuenta
                        );
                        if (duplicadorTipoConta.length == 0 || data.em_caso_de_duplicidade == '1') {
                            arrayPost[y].TCTC_tipo_de_conta__prcs__tipo_de_conta = retornoTipoConta[0]
                                ? retornoTipoConta[0].UrlJsonContext.TC_tipo_de_conta
                                : '';
                            arrayPost[y].TC_tipo_de_conta_id = retornoTipoConta[0] ? retornoTipoConta[0].ID : '';
                        }
                        let duplicadorNumeroMedidor = gridDestino.filter((j) => j.UrlJsonContext.numero_do_medidor == arrayPost[y].numero_medidor);
                        if (duplicadorNumeroMedidor.length == 0 || data.em_caso_de_duplicidade == '1') {
                            arrayPost[y].numero_do_medidor = arrayPost[y].numero_medidor;
                        }
                        //*pesq.ref:site
                        let empresaATCGrid = '8803f10a-9c32-4c4f-8bd6-8e959ed24277';
                        let registroEmpresaATC = /*await*/ getOnergyItem(empresaATCGrid, data.assid, data.usrid, null);
                        let retornoEmpresaATC = registroEmpresaATC.filter((j) => j.UrlJsonContext.site == arrayPost[y].suscriptor);
                        if (!retornoEmpresaATC) {
                            status_desc = `ERROR: no hay "${arrayPost[y].suscriptor}" registrado para ${tabExcel} de "${arrayPost[y].asset_number}"`;
                            statusPost.push(`${time}, ${status_desc}\n`);
                            /*await*/ postStatus(status_desc, statusPost, data);
                            return false;
                        }
                        let duplicadorAssinanteATC = gridDestino.filter((j) => j.UrlJsonContext.emp_atc_site__prcs__assinante_atc == arrayPost[y].suscriptor);
                        if (duplicadorAssinanteATC.length == 0 || data.em_caso_de_duplicidade == '1') {
                            arrayPost[y].emp_atc_site__prcs__assinante_atc = retornoEmpresaATC[0] ? retornoEmpresaATC[0].UrlJsonContext.site : '';
                            arrayPost[y].emp_atc_assinante_atc_id = retornoEmpresaATC[0] ? retornoEmpresaATC[0].ID : '';
                        }
                        //*pesq.ref:status_conta
                        let statusContaGrid = '4963d2c6-2b94-4c37-bffb-87c0dc296587';
                        let registroStatusConta = /*await*/ getOnergyItem(statusContaGrid, data.assid, data.usrid, null);
                        let retornoStatusConta = registroStatusConta.filter((j) => j.UrlJsonContext.status_conta == arrayPost[y].estado_cuenta);
                        if (!retornoStatusConta) {
                            status_desc = `ERROR: no hay "${arrayPost[y].estado_cuenta}" registrado para ${tabExcel} de "${arrayPost[y].asset_number}"`;
                            statusPost.push(`${time}, ${status_desc}\n`);
                            /*await*/ postStatus(status_desc, statusPost, data);
                            return false;
                        }
                        let duplicadorStatusConta = gridDestino.filter((j) => j.UrlJsonContext.sta_cont_status_conta == arrayPost[y].estado_cuenta);
                        if (duplicadorStatusConta.length == 0 || data.em_caso_de_duplicidade == '1') {
                            arrayPost[y].sta_cont_status_conta = retornoStatusConta[0] ? retornoStatusConta[0].UrlJsonContext.status_conta : '';
                            arrayPost[y].sta_cont_status_conta_id = retornoStatusConta[0] ? retornoStatusConta[0].ID : '';
                        }
                        //*pesq.ref:nome_provedor
                        let provedoresGrid = '4783ca0b-357d-42ab-a5c8-3328ee315f86';
                        let registroProvedores = /*await*/ getOnergyItem(provedoresGrid, data.assid, data.usrid, null);
                        let retornoProvedores = registroProvedores.filter((j) => j.UrlJsonContext.nome_provedor == arrayPost[y].nombre_proveedor);
                        if (!retornoProvedores) {
                            status_desc = `ERROR: no hay "${arrayPost[y].nombre_proveedor}" registrado para ${tabExcel} de "${arrayPost[y].asset_number}"`;
                            statusPost.push(`${time}, ${status_desc}\n`);
                            /*await*/ postStatus(status_desc, statusPost, data);
                            return false;
                        }
                        let duplicadorProvedores = gridDestino.filter((j) => j.UrlJsonContext.prvd_nome_provedor == arrayPost[y].nombre_proveedor);
                        if (duplicadorProvedores.length == 0 || data.em_caso_de_duplicidade == '1') {
                            arrayPost[y].prvd_nome_provedor = retornoProvedores[0] ? retornoProvedores[0].UrlJsonContext.nome_provedor : '';
                            arrayPost[y].prvd_nome_provedor_id = retornoProvedores[0] ? retornoProvedores[0].ID : '';
                            arrayPost[y].prvd_nome_comercial = retornoProvedores[0] ? retornoProvedores[0].UrlJsonContext.nome_comercial : '';
                            arrayPost[y].prvd_nit_provedor = retornoProvedores[0] ? retornoProvedores[0].nit_provedor : '';
                            arrayPost[y].prvd_nit_beneficiario = retornoProvedores[0] ? retornoProvedores[0].UrlJsonContext.nit_beneficiario : '';
                            arrayPost[y].prvd_beneficiario = retornoProvedores[0] ? retornoProvedores[0].beneficiario : '';
                            arrayPost[y].prvd_dia_de_vencimento = retornoProvedores[0] ? retornoProvedores[0].UrlJsonContext.dia_de_vencimento : '';
                            arrayPost[y].prvd_link_web = retornoProvedores[0] ? retornoProvedores[0].UrlJsonContext.link_web : '';
                            arrayPost[y].prvd_usuario = retornoProvedores[0] ? retornoProvedores[0].UrlJsonContext.usuario : '';
                            arrayPost[y].prvd_senha = retornoProvedores[0] ? retornoProvedores[0].UrlJsonContext.senha : '';
                        }
                        //*pesq.ref:servicos
                        let servicosGrid = '8e284e84-b8f9-45c1-abe2-991555441ea2';
                        let registroServicos = /*await*/ getOnergyItem(servicosGrid, data.assid, data.usrid, null);
                        let retornoServicos = registroServicos.filter((j) => j.UrlJsonContext.servicos == arrayPost[y].servicios);
                        if (!retornoServicos) {
                            status_desc = `ERROR: no hay "${arrayPost[y].servicios}" registrado para ${tabExcel} de "${arrayPost[y].asset_number}"`;
                            statusPost.push(`${time}, ${status_desc}\n`);
                            /*await*/ postStatus(status_desc, statusPost, data);
                            return false;
                        }
                        let duplicadorServicos = gridDestino.filter((j) => j.UrlJsonContext.serv_servicos__servico == arrayPost[y].servicios);
                        if (duplicadorServicos.length == 0 || data.em_caso_de_duplicidade == '1') {
                            arrayPost[y].serv_servicos__servico = retornoServicos[0] ? retornoServicos[0].UrlJsonContext.servicos : '';
                            arrayPost[y].serv_servicos_id = retornoServicos[0] ? retornoServicos[0].ID : '';
                        }
                        //*pesq.ref:sujeito
                        let sujeitoPassivoGrid = '78352af1-70b2-43a0-ad2a-084cdcf2eacf';
                        let registroSujeitoPassivo = /*await*/ getOnergyItem(sujeitoPassivoGrid, data.assid, data.usrid, null);
                        let retornoSujeitoPassivo = registroSujeitoPassivo.filter((j) => j.UrlJsonContext.sujeito == arrayPost[y].sujeto_pasivo);
                        if (!retornoSujeitoPassivo) {
                            status_desc = `ERROR: no hay "${arrayPost[y].sujeto_pasivo}" registrado para ${tabExcel} de "${arrayPost[y].asset_number}"`;
                            statusPost.push(`${time}, ${status_desc}\n`);
                            /*await*/ postStatus(status_desc, statusPost, data);
                            return false;
                        }
                        let duplicadorSujeitoPassivo = gridDestino.filter(
                            (j) => j.UrlJsonContext.suj_pa_sujeito__prcs__sujeito_passivo_alumbrado_publico == arrayPost[y].sujeto_pasivo
                        );
                        if (duplicadorSujeitoPassivo.length == 0 || data.em_caso_de_duplicidade == '1') {
                            arrayPost[y].suj_pa_sujeito__prcs__sujeito_passivo_alumbrado_publico = retornoSujeitoPassivo[0]
                                ? retornoSujeitoPassivo[0].UrlJsonContext.sujeito
                                : '';
                            arrayPost[y].suj_pa_sujeito_id = retornoSujeitoPassivo[0] ? retornoSujeitoPassivo[0].ID : '';
                        }
                        let duplicadorAcordoResolucao = gridDestino.filter(
                            (j) => j.UrlJsonContext.prcs__acuerdo_resolucion_alumbrado_publico == arrayPost[y].acuerdo_resolucion
                        );
                        if (duplicadorAcordoResolucao.length == 0 || data.em_caso_de_duplicidade == '1') {
                            arrayPost[y].prcs__acuerdo_resolucion_alumbrado_publico = arrayPost[y].acuerdo_resolucion;
                        }
                        //*pesq.ref:tipos_cobrancas
                        let tipoCobrancaGrid = '22538843-147f-4d41-9534-20a6d674f4b6';
                        let registroTipoCobranca = /*await*/ getOnergyItem(tipoCobrancaGrid, data.assid, data.usrid, null);
                        let retornoTipoCobranca = registroTipoCobranca.filter((j) => j.UrlJsonContext.tipos_cobrancas == arrayPost[y].tipo_cobro);
                        if (!retornoTipoCobranca) {
                            status_desc = `ERROR: no hay "${arrayPost[y].tipo_cobro}" registrado para ${tabExcel} de "${arrayPost[y].asset_number}"`;
                            statusPost.push(`${time}, ${status_desc}\n`);
                            /*await*/ postStatus(status_desc, statusPost, data);
                            return false;
                        }
                        let duplicadorTipoCobranca = gridDestino.filter(
                            (j) => j.UrlJsonContext.tipo_cobr_tipos_cobrancas__prcs__tipo_cobro_alumbrado_publico == arrayPost[y].tipo_cobro
                        );
                        if (duplicadorTipoCobranca.length == 0 || data.em_caso_de_duplicidade == '1') {
                            arrayPost[y].tipo_cobr_tipos_cobrancas__prcs__tipo_cobro_alumbrado_publico = retornoTipoCobranca[0]
                                ? retornoTipoCobranca[0].UrlJsonContext.tipos_cobrancas
                                : '';
                            arrayPost[y].tipo_cobr_tipos_cobrancas_id = retornoTipoCobranca[0] ? retornoTipoCobranca[0].ID : '';
                        }
                        let duplicadorMediaValorTotal = gridDestino.filter((j) => j.UrlJsonContext.prcs__media_valor_total == arrayPost[y].media_valor_total);
                        if (duplicadorMediaValorTotal.length == 0 || data.em_caso_de_duplicidade == '1') {
                            arrayPost[y].prcs__media_valor_total = arrayPost[y].media_valor_total;
                        }
                        let duplicadorMediaValorEnergia = gridDestino.filter(
                            (j) => j.UrlJsonContext.prcs__media_valor_energia == arrayPost[y].media_valor_energia
                        );
                        if (duplicadorMediaValorEnergia.length == 0 || data.em_caso_de_duplicidade == '1') {
                            arrayPost[y].prcs__media_valor_energia = arrayPost[y].media_valor_energia;
                        }
                        let duplicadorMediaValorIluminacao = gridDestino.filter(
                            (j) => j.UrlJsonContext.prcs__media_valor_iluminacao == arrayPost[y].media_valor_alumbrado
                        );
                        if (duplicadorMediaValorIluminacao.length == 0 || data.em_caso_de_duplicidade == '1') {
                            arrayPost[y].prcs__media_valor_iluminacao = arrayPost[y].media_valor_alumbrado;
                        }
                        let duplicadorDiaPagamento = gridDestino.filter((j) => j.UrlJsonContext.prcs__dia_de_pagamento == arrayPost[y].dia_de_pago);
                        if (duplicadorDiaPagamento.length == 0 || data.em_caso_de_duplicidade == '1') {
                            arrayPost[y].prcs__dia_de_pagamento = arrayPost[y].dia_de_pago;
                        }
                        //*pesq.ref:frequencia
                        let frequenciaPagamentoGrid = '2d4edce3-7131-413a-98e5-35d328daef7f';
                        let registroFrequenciaPagamento = /*await*/ getOnergyItem(frequenciaPagamentoGrid, data.assid, data.usrid, null);
                        let retornoFrequenciaPagamento = registroFrequenciaPagamento.filter((j) => j.UrlJsonContext.frequencia == arrayPost[y].frecuencia_pago);
                        if (!retornoFrequenciaPagamento) {
                            status_desc = `ERROR: no hay "${arrayPost[y].frecuencia_pago}" registrado para ${tabExcel} de "${arrayPost[y].asset_number}"`;
                            statusPost.push(`${time}, ${status_desc}\n`);
                            /*await*/ postStatus(status_desc, statusPost, data);
                            return false;
                        }
                        let duplicadorFrequenciaPagamento = gridDestino.filter(
                            (j) => j.UrlJsonContext.fre_pag_frequencia__frequencia_de_pagamento == arrayPost[y].frecuencia_pago
                        );
                        if (duplicadorFrequenciaPagamento.length == 0 || data.em_caso_de_duplicidade == '1') {
                            arrayPost[y].fre_pag_frequencia__frequencia_de_pagamento = retornoFrequenciaPagamento[0]
                                ? retornoFrequenciaPagamento[0].UrlJsonContext.frequencia
                                : '';
                            arrayPost[y].fre_pag_frequencia_id = retornoFrequenciaPagamento[0] ? retornoFrequenciaPagamento[0].ID : '';
                        }
                        //*pesq.ref:formas_de_pagamentos
                        let formaPagamentoGrid = '0e8a4463-28db-474f-926b-39fa1bd0c9bc';
                        let registroFormaPagamento = /*await*/ getOnergyItem(formaPagamentoGrid, data.assid, data.usrid, null);
                        let retornoFormaPagamento = registroFormaPagamento.filter((j) => j.UrlJsonContext.formas_de_pagamentos == arrayPost[y].forma_pago);
                        if (!retornoFormaPagamento) {
                            status_desc = `ERROR: no hay "${arrayPost[y].forma_pago}" registrado para ${tabExcel} de "${arrayPost[y].asset_number}"`;
                            statusPost.push(`${time}, ${status_desc}\n`);
                            /*await*/ postStatus(status_desc, statusPost, data);
                            return false;
                        }
                        let duplicadorFormaPagamento = gridDestino.filter(
                            (j) => j.UrlJsonContext.for_pag_formas_de_pagamentos__forma_de_pagamento == arrayPost[y].forma_pago
                        );
                        if (duplicadorFormaPagamento.length == 0 || data.em_caso_de_duplicidade == '1') {
                            arrayPost[y].for_pag_formas_de_pagamentos__forma_de_pagamento = retornoFormaPagamento[0]
                                ? retornoFormaPagamento[0].UrlJsonContext.formas_de_pagamentos
                                : '';
                            arrayPost[y].for_pag_formas_de_pagamentos_id = retornoFormaPagamento[0] ? retornoFormaPagamento[0].ID : '';
                        }
                        //*pesq.ref:classificacao_passthru
                        let classificacaoPassthruGrid = 'ad62c737-2abc-4c71-a572-e11933114ed8';
                        let registroClassificacaoPassthru = /*await*/ getOnergyItem(classificacaoPassthruGrid, data.assid, data.usrid, null);
                        let retornoClassificacaoPassthru = registroClassificacaoPassthru.filter(
                            (j) => j.UrlJsonContext.classificacao_passthru == arrayPost[y].clasificacion_passthru
                        );
                        if (!retornoClassificacaoPassthru) {
                            status_desc = `ERROR: no hay "${arrayPost[y].clasificacion_passthru}" registrado para ${tabExcel} de "${arrayPost[y].asset_number}"`;
                            statusPost.push(`${time}, ${status_desc}\n`);
                            /*await*/ postStatus(status_desc, statusPost, data);
                            return false;
                        }
                        let duplicadorClassificacaoPassthru = gridDestino.filter(
                            (j) => j.UrlJsonContext.CPTclassificacao_passthru__prcs__clasificacion_passthru == arrayPost[y].clasificacion_passthru
                        );
                        if (duplicadorClassificacaoPassthru.length == 0 || data.em_caso_de_duplicidade == '1') {
                            arrayPost[y].CPTclassificacao_passthru__prcs__clasificacion_passthru = retornoClassificacaoPassthru[0]
                                ? retornoClassificacaoPassthru[0].UrlJsonContext.classificacao_passthru
                                : '';
                            arrayPost[y].CPTclassificacao_passthru_id = retornoClassificacaoPassthru[0] ? retornoClassificacaoPassthru[0].ID : '';
                        }
                        let duplicadorUltimaCaptura = gridDestino.filter((j) => j.UrlJsonContext.prcs__ultima_captura == arrayPost[y].ultima_captura);
                        if (duplicadorUltimaCaptura.length == 0 || data.em_caso_de_duplicidade == '1') {
                            arrayPost[y].prcs__ultima_captura = arrayPost[y].ultima_captura;
                        }
                        //*pesq.ref:ECCU_estado_da_captura_da_conta
                        let statusCapturaContaGrid = '3c2d0727-6359-4c71-9409-465759462854';
                        let registroStatusCapturaConta = /*await*/ getOnergyItem(statusCapturaContaGrid, data.assid, data.usrid, null);
                        let retornoStatusCapturaConta = registroStatusCapturaConta.filter(
                            (j) => j.UrlJsonContext.ECCU_estado_da_captura_da_conta == arrayPost[y].estado_captura_cuenta
                        );
                        if (!retornoStatusCapturaConta) {
                            status_desc = `ERROR: no hay "${arrayPost[y].estado_captura_cuenta}" registrado para ${tabExcel} de "${arrayPost[y].asset_number}"`;
                            statusPost.push(`${time}, ${status_desc}\n`);
                            /*await*/ postStatus(status_desc, statusPost, data);
                            return false;
                        }
                        let duplicadorStatusCapturaConta = gridDestino.filter(
                            (j) => j.UrlJsonContext.ECCUECCU_estado_da_captura_da_conta__status_de_capturapago == arrayPost[y].estado_captura_cuenta
                        );
                        if (duplicadorStatusCapturaConta.length == 0 || data.em_caso_de_duplicidade == '1') {
                            arrayPost[y].ECCUECCU_estado_da_captura_da_conta__status_de_capturapago = retornoStatusCapturaConta[0]
                                ? retornoStatusCapturaConta[0].UrlJsonContext.ECCU_estado_da_captura_da_conta
                                : '';
                            arrayPost[y].ECCU_estado_da_captura_da_conta_id = retornoStatusCapturaConta[0] ? retornoStatusCapturaConta[0].ID : '';
                        }
                        let duplicadorProximaCaptura = gridDestino.filter((j) => j.UrlJsonContext.prcs__proxima_captura == arrayPost[y].fecha_prox_captura);
                        if (duplicadorProximaCaptura.length == 0 || data.em_caso_de_duplicidade == '1') {
                            arrayPost[y].prcs__proxima_captura = arrayPost[y].fecha_prox_captura;
                        }
                        let duplicadorProximoPagoOportuno = gridDestino.filter(
                            (j) => j.UrlJsonContext.prcs__proximo_pagamento == arrayPost[y].fecha_prox_pago_oportuno
                        );
                        if (duplicadorProximoPagoOportuno.length == 0 || data.em_caso_de_duplicidade == '1') {
                            arrayPost[y].prcs__proximo_pagamento = arrayPost[y].fecha_prox_pago_oportuno;
                        }

                        //!node:test (unhide log and hide sendItemToOnergy)
                        // onergy.log(`JFS: aba:informacion_cuenta sendItem=>arrayPost[y]: ${JSON.stringify(arrayPost[y])}`);
                        let postArray = /*await*/ sendItemToOnergy(tabExcelID, data.usrid, data.assid, arrayPost[y], '', 'asset_number', true, false, false);
                    }
                    //*aba:informacion_tecnica
                    //*aba:clientes_sitio
                    //*aba:clientes
                    //*aba:regional_clientes
                    //*aba:contactos_clientes
                    //*aba:portafolio_clientes
                }

                //*status:post
                status_desc = `Inserindo ${qtdReg} registros de ${tabExcel} en Onergy`;
                statusPost.push(`${time}, ${status_desc}\n`);
                /*await*/ postStatus(status_desc, statusPost, data);

                //!node:test (unhide log and hide InsertManyOnergy)
                // onergy.log(`JFS: if(arrayPost) insertMany=>arrayPost: ${JSON.stringify(arrayPost)}`);
                let postArray = /*await*/ onergy.InsertManyOnergy(arrayPost, tabExcelID, data.usrid);
            } else {
                status_desc = `ERROR: los datos de ${tabExcel} no fueron procesados`;
                statusPost.push(`${time}, ${status_desc}\n`);
                /*await*/ postStatus(status_desc, statusPost, data);
                return false;
            }
        } else {
            status_desc = `ERROR: No hay registros en ${nomePlanilha}`;
            statusPost.push(`${time}, ${status_desc}\n`);
            /*await*/ postStatus(status_desc, statusPost, data);
            return false;
        }
    } else {
        status_desc = `ERROR: El índice carga ${cargaIndiceNome} no coincide con ${tabExcel}`;
        statusPost.push(`${time}, ${status_desc}\n`);
        /*await*/ postStatus(status_desc, statusPost, data);
        return false;
    }

    //*status:done
    status_desc = `Carga de ${tabExcel} finalizada`;
    statusPost.push(`${time}, ${status_desc}\n`);
    /*await*/ postStatus(status_desc, statusPost, data);

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
    processo: '',
    horas: '',
    dataDate: '2022-10-14 12:16:35',
    data: '2022-10-14 09:16:35',
    load_index_equipe: 'COL',
    load_index_id_do_card: '4783ca0b-357d-42ab-a5c8-3328ee315f86',
    planilha: [
        {
            Url: 'https://onebackupservices.blob.core.windows.net/67c0b77d-abae-4c48-ba4b-6c8faf27e14a/tablas_maestras.xlsx4b12dafd-9c82-4468-9afd-06e7d52b36b1.xlsx?sv=2018-03-28&sr=b&sig=scJjiPFXueWUl0BzYfEyOwHyIdnFnn5mJgJNchzxiIQ%3D&se=2023-05-02T12%3A16%3A18Z&sp=r',
            UrlAzure:
                'https://onebackupservices.blob.core.windows.net/67c0b77d-abae-4c48-ba4b-6c8faf27e14a/tablas_maestras.xlsx4b12dafd-9c82-4468-9afd-06e7d52b36b1.xlsx?sv=2018-03-28&sr=b&sig=scJjiPFXueWUl0BzYfEyOwHyIdnFnn5mJgJNchzxiIQ%3D&se=2023-05-02T12%3A16%3A18Z&sp=r',
            Name: 'tablas_maestras.xlsx',
        },
    ],
    load_index_tab_excel: 'proveedores',
    load_index_id: '5198a52a-7275-4e04-b582-02fe6f53825d',
    em_caso_de_duplicidade: '1',
    load__status_processamento: 'Procesando proveedores',
    processamento: '',
    time: '9:16',
    em_caso_de_duplicidade_desc: 'Sobrescribir',
    oneTemplateTitle: '',
    ass_id: '67c0b77d-abae-4c48-ba4b-6c8faf27e14a',
    assid: '67c0b77d-abae-4c48-ba4b-6c8faf27e14a',
    email: 'admin-colombia@atc.com.co',
    fdtid: '181c67a8-e7a9-4c9a-9ea1-ca4719c0e23f',
    fedid: 'f0eca2ac-b608-f357-0f78-28d9b92f077a',
    id_upload_planilha: 'f0eca2ac-b608-f357-0f78-28d9b92f077a',
    onergy_rolid: 'e4d0298c-245e-454a-89d4-8f27aef8645b',
    timezone: null,
    usrid: '0c44d4fc-d654-405b-9b8f-7fea162948b5',
};

init(JSON.stringify(json));
