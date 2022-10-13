/**NODE_ENV ===
 */
let { date } = require('assert-plus');
let { formatDate } = require('tough-cookie');
let { log } = require('console');
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
/*async*/ function ajax(args) {
    return /*await*/ onergy.ajax(args);
}
/*async*/ function ajaxPost(args) {
    return /*await*/ onergy.ajaxPost(args);
}
function failureCallback(error) {
    console.log('It failed with ' + error);
}
function get_usr_tmz_dt_now(data) {
    return data;
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
function onergy_updatemany(data) {
    return data;
}
function successCallback(result) {
    console.log('It succeeded with ' + result);
}

/**SCRIPT ===
 * Executar automático quando em processo: Não
 * Atividade de longa duração: Não
 * Esconder Menu: Não
 * Condicional: nenhum
 * Aprovação: nenhum
 */
/*async*/ function getOnergyItem(fdtid, assid, usrid, filtro) {
    let keepSearching = true;
    let skip = 0;
    take = 500;
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

/*async*/ function sendItemToOnergy(templateid, usrid, assid, data, fedid, ukField, checkTemplateDuplicate, data_a) {
    let onergySaveData = {
        fdtid: templateid,
        assid: assid,
        usrid: usrid,
        data: JSON.stringify(data),
        // executeAction: false
    };
    if (fedid != undefined && fedid != '') {
        onergySaveData.id = fedid;
    }
    if (ukField != undefined && ukField != '') {
        onergySaveData.ukField = ukField;
        if (data_a.em_caso_de_duplicidade == '1') {
            onergySaveData.blockDuplicate = false;
        } else {
            onergySaveData.blockDuplicate = true;
        }
    }
    if (checkTemplateDuplicate != undefined && checkTemplateDuplicate != '') {
        onergySaveData.checkTemplateDuplicate = true;
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

/*async*/ function postStatus(status_desc, data) {
    if (status_desc == '') {
        status_desc = 'Concluido';
    }

    let postInfo = {
        UrlJsonContext: {
            processamento: status_desc,
            // processo: data.processo,
        },
    };

    //!node:test (unhide console.log + return)
    // console.log('postStatus', postInfo.UrlJsonContext.processamento);
    // return true;
    let tabExcelID = data.load_index_id_do_card;
    let strFiltro = gerarFiltro('id_do_card', tabExcelID);
    let cargaGeralID = '181c67a8-e7a9-4c9a-9ea1-ca4719c0e23f';
    /*await*/ onergy_updatemany({
        fdtid: cargaGeralID,
        assid: data.onergy_js_ctx.assid,
        usrid: data.onergy_js_ctx.usrid,
        data: JSON.stringify(postInfo),
        filter: strFiltro,
        isMultiUpdate: false,
    });

    return true;
}

/*async*/ function init(json) {
    let data = JSON.parse(json);
    let arrayPost = [];
    let status_desc;

    let tabExcelID = data.load_index_id_do_card;
    let indiceCargaID = '9a6e262f-e463-4c5d-9d8b-0fd8343b2f02';
    let cardID = /*await*/ getOnergyItem(indiceCargaID, data.assid, data.usrid, gerarFiltro('id_do_card', tabExcelID));
    let cargaIndiceNome = cardID[0].UrlJsonContext.tab_excel;

    let strArrExcel = /*await*/ ReadExcelToJson({
        url: data.planilha[0].UrlAzure,
    });

    let dataExcel = JSON.parse(strArrExcel);
    let tabExcel = data.load_index_tab_excel;
    if (cargaIndiceNome !== tabExcel) {
        status_desc = `El índice carga ${cargaIndiceNome} no coincide con la grilla ${tabExcel}`;
        /*await*/ postStatus(status_desc, data);
        return;
    }

    if (dataExcel !== null) {
        let nomePlanilha = data.planilha[0].Name;
        let ctxExcel = dataExcel[tabExcel];

        if (ctxExcel.length > 0) {
            status_desc = `A cargar ${ctxExcel.length} registros de la grilla ${tabExcel}`;
            /*await*/ postStatus(status_desc, data);
            let arrayObj = ctxExcel[0];
            let fielName = Object.keys(arrayObj);

            for (let x in ctxExcel) {
                let objLine = {
                    nomePlanilhaCarga: nomePlanilha,
                };

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
                    } else {
                        val[name] = val[name];
                    }

                    if (typeof val[name] == 'string') {
                        objLine[name] = val[name].trim();
                    } else {
                        objLine[name] = val[name];
                    }

                    let gridDestino = /*await*/ getOnergyItem(tabExcelID, data.assid, data.usrid, null);
                    //*aba:categorias
                    if (cargaIndiceNome == 'categorias') {
                        let duplicadorCategoria = gridDestino.filter((j) => j.UrlJsonContext.categorias == objLine[name].categorias);
                        if (duplicadorCategoria.length == 0) {
                            objLine[name].categorias = objLine[name].categorias;
                        }
                    }
                    //*aba:municipio
                    if (cargaIndiceNome == 'municipio') {
                        let ufGrid = '132b8394-2193-4d83-a399-08f4cde70873';
                        let registroUf = /*await*/ getOnergyItem(ufGrid, data.assid, data.usrid, null);
                        let retornoUf = registroUf.filter((j) => j.UrlJsonContext.uf == objLine[name].departamento);
                        if (retornoUf.length == 0 || data.em_caso_de_duplicidade == '1') {
                            status_desc = `ERROR: no hay Departamento ${objLine[name].departamento} para registro ${objLine[name].municipio} de ${tabExcel}`;
                            /*await*/ postStatus(status_desc, data);
                            break;
                        }
                        let duplicadorCidade = gridDestino.filter((j) => j.UrlJsonContext.municipio == objLine[name].municipio);
                        if (duplicadorCidade.length == 0 || data.em_caso_de_duplicidade == '1') {
                            objLine[name].loca_uf_uf = retornoUf[0] ? retornoUf[0].UrlJsonContext.uf : '';
                            objLine[name].loca_uf_id = retornoUf[0] ? retornoUf[0].ID : '';
                            objLine[name].municipio = objLine[name].municipio;
                        }
                        //!node:test (unhide console.log and hide /*await*/ sendItemToOnergy)
                        // console.log(objLine[name]);
                        /*await*/ sendItemToOnergy({
                            templateid: tabExcelID,
                            usrid: data.usrid,
                            assid: data.assid,
                            data: JSON.stringify(objLine[name]),
                            fedid: null,
                            ukField: 'municipio',
                            checkTemplateDuplicate: true,
                            data_a: data,
                        });
                    }
                    //*aba:departamento
                    if (cargaIndiceNome == 'departamento') {
                        let duplicadorUf = gridDestino.filter((j) => j.UrlJsonContext.uf == objLine[name].departamento_sigla);
                        if (duplicadorUf.length == 0 || data.em_caso_de_duplicidade == '1') {
                            objLine[name].uf = objLine[name].departamento_sigla;
                            objLine[name].estado = objLine[name].departamento;
                        }
                    }
                    //*aba:compania_atc
                    if (cargaIndiceNome == 'compania_atc') {
                        let duplicadorEmpresa = gridDestino.filter((j) => j.UrlJsonContext.site == objLine[name].compania_atc);
                        if (duplicadorEmpresa.length == 0 || data.em_caso_de_duplicidade == '1') {
                            objLine[name].site = objLine[name].compania_atc;
                        }
                    }
                    //*aba:formas_pagos
                    if (cargaIndiceNome == 'formas_pagos') {
                        let duplicadorFormaPagamento = gridDestino.filter((j) => j.UrlJsonContext.formas_de_pagamentos == objLine[name].formas_pagos);
                        if (duplicadorFormaPagamento.length == 0 || data.em_caso_de_duplicidade == '1') {
                            objLine[name].formas_de_pagamentos = objLine[name].formas_pagos;
                        }
                    }
                    //*aba:frecuencia_pagos
                    if (cargaIndiceNome == 'frecuencia_pagos') {
                        let duplicadorFrequencia = gridDestino.filter((j) => j.UrlJsonContext.frequencia == objLine[name].frecuencia_pagos);
                        if (duplicadorFrequencia.length == 0 || data.em_caso_de_duplicidade == '1') {
                            objLine[name].frequencia = objLine[name].frecuencia_pagos;
                        }
                    }
                    //*aba:lecturas
                    if (cargaIndiceNome == 'lecturas') {
                        let duplicadorLectura = gridDestino.filter((j) => j.UrlJsonContext.LCT_ferramentas == objLine[name].herramientas);
                        if (duplicadorLectura.length == 0 || data.em_caso_de_duplicidade == '1') {
                            objLine[name].LCT_ferramentas = objLine[name].herramientas;
                        }
                    }
                    //*aba:portafolio_atc
                    if (cargaIndiceNome == 'portafolio_atc') {
                        let duplicadorPortifolio = gridDestino.filter((j) => j.UrlJsonContext.tipo_portifolio == objLine[name].portafolio_atc);
                        if (duplicadorPortifolio.length == 0 || data.em_caso_de_duplicidade == '1') {
                            objLine[name].tipo_portifolio = objLine[name].portafolio_atc;
                        }
                    }
                    //*aba:regional
                    if (cargaIndiceNome == 'regional') {
                        let duplicadorRegional = gridDestino.filter((j) => j.UrlJsonContext.regional == objLine[name].regional_atc);
                        if (duplicadorRegional.length == 0 || data.em_caso_de_duplicidade == '1') {
                            objLine[name].regional = objLine[name].regional_atc;
                        }
                    }
                    //*aba:servicios
                    if (cargaIndiceNome == 'servicios') {
                        let duplicadorServico = gridDestino.filter((j) => j.UrlJsonContext.servicos == objLine[name].servicios);
                        if (duplicadorServico.length == 0 || data.em_caso_de_duplicidade == '1') {
                            objLine[name].servicos = objLine[name].servicios;
                        }
                    }
                    //*aba:estado_cuenta
                    if (cargaIndiceNome == 'estado_cuenta') {
                        let duplicadorEstadoCuenta = gridDestino.filter((j) => j.UrlJsonContext.status_conta == objLine[name].estado_cuenta);
                        if (duplicadorEstadoCuenta.length == 0 || data.em_caso_de_duplicidade == '1') {
                            objLine[name].status_conta = objLine[name].estado_cuenta;
                        }
                    }
                    //*aba:estado_sitio
                    if (cargaIndiceNome == 'estado_sitio') {
                        let duplicadorEstadoSitio = gridDestino.filter((j) => j.UrlJsonContext.status == objLine[name].estado_sitio);
                        if (duplicadorEstadoSitio.length == 0 || data.em_caso_de_duplicidade == '1') {
                            objLine[name].status = objLine[name].estado_sitio;
                        }
                    }
                    //*aba:sujeto_pasivo
                    if (cargaIndiceNome == 'sujeto_pasivo') {
                        let duplicadorSujetoPasivo = gridDestino.filter((j) => j.UrlJsonContext.sujeito == objLine[name].sujeto_pasivo);
                        if (duplicadorSujetoPasivo.length == 0 || data.em_caso_de_duplicidade == '1') {
                            objLine[name].sujeito = objLine[name].sujeto_pasivo;
                        }
                    }
                    //*aba:tipo_cobro
                    if (cargaIndiceNome == 'tipo_cobro') {
                        let duplicadorTipoCobro = gridDestino.filter((j) => j.UrlJsonContext.tipos_cobrancas == objLine[name].tipo_cobro);
                        if (duplicadorTipoCobro.length == 0 || data.em_caso_de_duplicidade == '1') {
                            objLine[name].tipos_cobrancas = objLine[name].tipo_cobro;
                        }
                    }
                    //*aba:tipo_tercero
                    if (cargaIndiceNome == 'tipo_tercero') {
                        let duplicadorTipoTercero = gridDestino.filter((j) => j.UrlJsonContext.tipo_de_terceiro == objLine[name].tipo_tercero);
                        if (duplicadorTipoTercero.length == 0 || data.em_caso_de_duplicidade == '1') {
                            objLine[name].tipo_de_terceiro = objLine[name].tipo_tercero;
                        }
                    }
                    //*aba:tipo_acceso
                    if (cargaIndiceNome == 'tipo_acceso') {
                        let duplicadorTipoAcesso = gridDestino.filter((j) => j.UrlJsonContext.tipo_de_acesso == objLine[name].tipo_acceso);
                        if (duplicadorTipoAcesso.length == 0 || data.em_caso_de_duplicidade == '1') {
                            objLine[name].tipo_de_acesso = objLine[name].tipo_acceso;
                        }
                    }
                    //*aba:tipo_cuenta
                    if (cargaIndiceNome == 'tipo_cuenta') {
                        let duplicadorTipoCuenta = gridDestino.filter((j) => j.UrlJsonContext.TC_tipo_de_conta == objLine[name].tipo_cuenta);
                        if (duplicadorTipoCuenta.length == 0 || data.em_caso_de_duplicidade == '1') {
                            objLine[name].TC_tipo_de_conta = objLine[name].tipo_cuenta;
                        }
                    }
                    //*aba:estado_legalizacion
                    if (cargaIndiceNome == 'estado_legalizacion') {
                        let duplicadorEstadoLegalizacao = gridDestino.filter((j) => j.UrlJsonContext.status == objLine[name].estado_legalizacion);
                        if (duplicadorEstadoLegalizacao.length == 0 || data.em_caso_de_duplicidade == '1') {
                            objLine[name].status = objLine[name].estado_legalizacion;
                        }
                    }
                    //*aba:medidores_sitio
                    if (cargaIndiceNome == 'medidores_sitio') {
                        let duplicadorAssetNumber = gridDestino.filter((j) => j.UrlJsonContext.asset_number == objLine[name].asset_number);
                        if (duplicadorAssetNumber.length == 0 || data.em_caso_de_duplicidade == '1') {
                            objLine[name].asset_number = objLine[name].asset_number;
                        }
                        let duplicadorContaInternaNIC = gridDestino.filter((j) => j.UrlJsonContext.conta_interna_nic == objLine[name].cuenta_interna_nic);
                        if (duplicadorContaInternaNIC.length == 0 || data.em_caso_de_duplicidade == '1') {
                            objLine[name].conta_interna_nic = objLine[name].cuenta_interna_nic;
                        }
                        let duplicadorMedidoresSitio = gridDestino.filter((j) => j.UrlJsonContext.numero_do_medidor == objLine[name].numero_medidor);
                        if (duplicadorMedidoresSitio.length == 0 || data.em_caso_de_duplicidade == '1') {
                            objLine[name].numero_do_medidor = objLine[name].numero_medidor;
                        }
                    }
                    //*aba:proveedores
                    if (cargaIndiceNome == 'proveedores') {
                        let duplicadorNITProvedor = gridDestino.filter((j) => j.UrlJsonContext.nit_provedor == objLine[name].nit_proveedor);
                        if (duplicadorNITProvedor.length == 0 || data.em_caso_de_duplicidade == '1') {
                            objLine[name].nit_provedor = objLine[name].nit_proveedor;
                        }
                        let duplicadorNomeProvedor = gridDestino.filter((j) => j.UrlJsonContext.nome_provedor == objLine[name].nombre_proveedor);
                        if (duplicadorNomeProvedor.length == 0 || data.em_caso_de_duplicidade == '1') {
                            objLine[name].nome_provedor = objLine[name].nombre_proveedor;
                        }
                        let duplicadorNITBeneficiario = gridDestino.filter((j) => j.UrlJsonContext.nit_beneficiario == objLine[name].nit_beneficiario);
                        if (duplicadorNITBeneficiario.length == 0 || data.em_caso_de_duplicidade == '1') {
                            objLine[name].nit_beneficiario = objLine[name].nit_beneficiario;
                        }
                        let duplicadorNomeBeneficiario = gridDestino.filter((j) => j.UrlJsonContext.beneficiario == objLine[name].nombre_beneficiario);
                        if (duplicadorNomeBeneficiario.length == 0 || data.em_caso_de_duplicidade == '1') {
                            objLine[name].beneficiario = objLine[name].nombre_beneficiario;
                        }
                        let tipoTerceiroGrid = '70110b99-aa96-4e25-b1b2-177484668700';
                        let registroTipoTerceiro = /*await*/ getOnergyItem(tipoTerceiroGrid, data.assid, data.usrid, null);
                        let retornoTipoTerceiro = registroTipoTerceiro.filter((j) => j.UrlJsonContext.tipo_de_terceiro == objLine[name].tipo_tercero);
                        if (retornoTipoTerceiro.length == 0 || data.em_caso_de_duplicidade == '1') {
                            status_desc = `ERROR: no hay Tipo Tercero ${objLine[name].tipo_tercero} para registro ${objLine[name].nit_proveedor} de ${tabExcel}`;
                            /*await*/ postStatus(status_desc, data);
                            break;
                        }
                        let duplicadorTipoTerceiro = gridDestino.filter((j) => j.UrlJsonContext.tp3o_tipo_de_terceiro == objLine[name].tipo_tercero);
                        if (duplicadorTipoTerceiro.length == 0 || data.em_caso_de_duplicidade == '1') {
                            objLine[name].tp3o_tipo_de_terceiro = retornoTipoTerceiro[0] ? retornoTipoTerceiro[0].UrlJsonContext.tipo_de_terceiro : '';
                            objLine[name].tp3o_id = retornoTipoTerceiro[0] ? retornoTipoTerceiro[0].ID : '';
                        }
                        let duplicadorNomeComercial = gridDestino.filter((j) => j.UrlJsonContext.nome_comercial == objLine[name].nombre_comercial);
                        if (duplicadorNomeComercial.length == 0 || data.em_caso_de_duplicidade == '1') {
                            objLine[name].nome_comercial = objLine[name].nombre_comercial;
                        }
                        let duplicadorTemContaPai = gridDestino.filter((j) => j.UrlJsonContext.prvd__tem_conta_pai == objLine[name].tiene_cuenta_padre);
                        if (duplicadorTemContaPai.length == 0 || data.em_caso_de_duplicidade == '1') {
                            objLine[name].prvd__tem_conta_pai = objLine[name].tiene_cuenta_padre;
                        }
                        let duplicadorDiaVencimento = gridDestino.filter((j) => j.UrlJsonContext.dia_de_vencimento == objLine[name].dia_de_pago);
                        if (duplicadorDiaVencimento.length == 0 || data.em_caso_de_duplicidade == '1') {
                            objLine[name].dia_de_vencimento = objLine[name].dia_de_pago;
                        }
                        let tipoAcessoGrid = '62e9a129-73b5-4819-9c16-f1d4bdababde';
                        let registroTipoAcesso = /*await*/ getOnergyItem(tipoAcessoGrid, data.assid, data.usrid, null);
                        let retornoTipoAcesso = registroTipoAcesso.filter((j) => j.UrlJsonContext.tipo_de_acesso == objLine[name].tipo_acceso);
                        if (retornoTipoAcesso.length == 0 || data.em_caso_de_duplicidade == '1') {
                            status_desc = `ERROR: no hay Tipo Acceso ${objLine[name].tipo_acceso} para registro ${objLine[name].nit_proveedor} de ${tabExcel}`;
                            /*await*/ postStatus(status_desc, data);
                            break;
                        }
                        let duplicadorTipoAcesso = gridDestino.filter((j) => j.UrlJsonContext.tp_acces_tipo_de_acesso == objLine[name].tipo_acceso);
                        if (duplicadorTipoAcesso.length == 0 || data.em_caso_de_duplicidade == '1') {
                            objLine[name].tp_acces_tipo_de_acesso = retornoTipoAcesso[0] ? retornoTipoAcesso[0].UrlJsonContext.tipo_de_acesso : '';
                            objLine[name].tp_acces_id = retornoTipoAcesso[0] ? retornoTipoAcesso[0].ID : '';
                        }
                        //!node:test (unhide console.log and hide /*await*/ sendItemToOnergy)
                        // console.log(objLine[name]);
                        /*await*/ sendItemToOnergy({
                            templateid: tabExcelID,
                            usrid: data.usrid,
                            assid: data.assid,
                            data: JSON.stringify(objLine[name]),
                            fedid: null,
                            ukField: 'nit_proveedor',
                            checkTemplateDuplicate: true,
                            data_a: data,
                        });
                    }
                    //*aba:sitios
                    if (name == 'sitios') {
                        let duplicadorAssetNumber = gridDestino.filter((j) => j.UrlJsonContext.asset_number == objLine[name].asset_number);
                        if (duplicadorAssetNumber.length == 0 || data.em_caso_de_duplicidade == '1') {
                            objLine[name].asset_number = objLine[name].asset_number;
                        }
                        let duplicadorProfitCostCenter = gridDestino.filter((j) => j.UrlJsonContext.profit_cost_center == objLine[name].profit_cost_center);
                        if (duplicadorProfitCostCenter.length == 0 || data.em_caso_de_duplicidade == '1') {
                            objLine[name].profit_cost_center = objLine[name].profit_cost_center;
                        }
                        let duplicadorNomeSitio = gridDestino.filter((j) => j.UrlJsonContext.site_name == objLine[name].nombre_sitio);
                        if (duplicadorNomeSitio.length == 0 || data.em_caso_de_duplicidade == '1') {
                            objLine[name].site_name = objLine[name].nombre_sitio;
                        }
                        let empresaATCGrid = '8803f10a-9c32-4c4f-8bd6-8e959ed24277';
                        let registroEmpresaATC = /*await*/ getOnergyItem(empresaATCGrid, data.assid, data.usrid, null);
                        let retornoEmpresaATC = registroEmpresaATC.filter((j) => j.UrlJsonContext.site == objLine[name].compania_atc);
                        if (retornoEmpresaATC.length == 0 || data.em_caso_de_duplicidade == '1') {
                            status_desc = `ERROR: no hay Compañia ATC ${objLine[name].compania_atc} para registro ${objLine[name].asset_number} de ${tabExcel}`;
                            /*await*/ postStatus(status_desc, data);
                            break;
                        }
                        let duplicadorEmpresaATC = gridDestino.filter((j) => j.UrlJsonContext.emp_atc_site__empresa_atc == objLine[name].compania_atc);
                        if (duplicadorEmpresaATC.length == 0 || data.em_caso_de_duplicidade == '1') {
                            objLine[name].emp_atc_site__empresa_atc = retornoEmpresaATC[0] ? retornoEmpresaATC[0].UrlJsonContext.site : '';
                            objLine[name].emp_atc_empresa_atc_id = retornoEmpresaATC[0] ? retornoEmpresaATC[0].ID : '';
                        }
                        let MunicipioGrid = 'a95b4721-fc79-445c-b964-14a4ccbf1d7b';
                        let registroMunicipio = /*await*/ getOnergyItem(MunicipioGrid, data.assid, data.usrid, null);
                        let retornoMunicipio = registroMunicipio.filter((j) => j.UrlJsonContext.municipio == objLine[name].municipio);
                        if (retornoMunicipio.length == 0 || data.em_caso_de_duplicidade == '1') {
                            status_desc = `ERROR: no hay Municipio ${objLine[name].municipio} para registro ${objLine[name].asset_number} de ${tabExcel}`;
                            /*await*/ postStatus(status_desc, data);
                            break;
                        }
                        let duplicadorMunicipio = gridDestino.filter((j) => j.UrlJsonContext.loca_cida_municipio == objLine[name].municipio);
                        if (duplicadorMunicipio.length == 0 || data.em_caso_de_duplicidade == '1') {
                            objLine[name].loca_cida_municipio = retornoEmpresaATC[0] ? retornoEmpresaATC[0].UrlJsonContext.site : '';
                            objLine[name].loca_cida_id = retornoEmpresaATC[0] ? retornoEmpresaATC[0].ID : '';
                            objLine[name].loca_cida_loca_uf_sigla_estado__uf = retornoEmpresaATC[0] ? retornoEmpresaATC[0].UrlJsonContext.uf : '';
                            objLine[name].loca_uf_id = retornoEmpresaATC[0] ? retornoEmpresaATC[0].UrlJsonContext.uf_id : '';
                        }
                        let duplicadorCodigoAncora = gridDestino.filter((j) => j.UrlJsonContext.codigo_ancora == objLine[name].codigo_anchor);
                        if (duplicadorCodigoAncora.length == 0 || data.em_caso_de_duplicidade == '1') {
                            objLine[name].codigo_ancora = objLine[name].codigo_anchor;
                        }
                        let duplicadorLogradouro = gridDestino.filter((j) => j.UrlJsonContext.logradouro == objLine[name].direccion);
                        if (duplicadorLogradouro.length == 0 || data.em_caso_de_duplicidade == '1') {
                            objLine[name].logradouro = objLine[name].direccion;
                        }
                        let StatusSiteGrid = 'f0ee1dd9-bb48-4aef-9f77-43e357870a31';
                        let registroStatusSite = /*await*/ getOnergyItem(StatusSiteGrid, data.assid, data.usrid, null);
                        let retornoStatusSite = registroStatusSite.filter((j) => j.UrlJsonContext.status == objLine[name].estado_sitio);
                        if (retornoStatusSite.length == 0 || data.em_caso_de_duplicidade == '1') {
                            status_desc = `ERROR: no hay Estado Sitio ${objLine[name].municipio} para registro ${objLine[name].asset_number} de ${tabExcel}`;
                            /*await*/ postStatus(status_desc, data);
                            break;
                        }
                        let duplicadorStatusSite = gridDestino.filter((j) => j.UrlJsonContext.STAstatus__status_do_site == objLine[name].estado_sitio);
                        if (duplicadorStatusSite.length == 0 || data.em_caso_de_duplicidade == '1') {
                            objLine[name].STAstatus__status_do_site = retornoStatusSite[0] ? retornoStatusSite[0].UrlJsonContext.status : '';
                            objLine[name].STAstatus_do_site_id = retornoStatusSite[0] ? retornoStatusSite[0].ID : '';
                        }
                        let portfolioGrid = '18615527-c678-4f1c-87e0-d7a9735d0c6e';
                        let registroPortfolio = /*await*/ getOnergyItem(portfolioGrid, data.assid, data.usrid, null);
                        let retornoPortfolio = registroPortfolio.filter((j) => j.UrlJsonContext.tipo_portifolio == objLine[name].portafolio_atc);
                        if (retornoPortfolio.length == 0 || data.em_caso_de_duplicidade == '1') {
                            status_desc = `ERROR: no hay Portafolio ATC ${objLine[name].portafolio_atc} para registro ${objLine[name].asset_number} de ${tabExcel}`;
                            /*await*/ postStatus(status_desc, data);
                            break;
                        }
                        let duplicadorPortfolio = gridDestino.filter((j) => j.UrlJsonContext.tppf_tipo_portifolio__portfolio == objLine[name].portafolio_atc);
                        if (duplicadorPortfolio.length == 0 || data.em_caso_de_duplicidade == '1') {
                            objLine[name].tppf_tipo_portifolio__portfolio = retornoPortfolio[0] ? retornoPortfolio[0].UrlJsonContext.tipo_portifolio : '';
                            objLine[name].tppf_portfolio_id = retornoPortfolio[0] ? retornoPortfolio[0].ID : '';
                        }
                        let regiaoATCGrid = '74d8a818-46a7-4d56-8a18-2369bdd00589';
                        let registroRegiaoATC = /*await*/ getOnergyItem(regiaoATCGrid, data.assid, data.usrid, null);
                        let retornoRegiaoATC = registroRegiaoATC.filter((j) => j.UrlJsonContext.regional == objLine[name].regional_atc);
                        if (retornoRegiaoATC.length == 0 || data.em_caso_de_duplicidade == '1') {
                            status_desc = `ERROR: no hay Regional ATC ${objLine[name].regional_atc} para registro ${objLine[name].asset_number} de ${tabExcel}`;
                            /*await*/ postStatus(status_desc, data);
                            break;
                        }
                        let duplicadorRegiaoATC = gridDestino.filter((j) => j.UrlJsonContext.regio_regional__regiao_atc == objLine[name].regional_atc);
                        if (duplicadorRegiaoATC.length == 0 || data.em_caso_de_duplicidade == '1') {
                            objLine[name].regio_regional__regiao_atc = retornoRegiaoATC[0] ? retornoRegiaoATC[0].UrlJsonContext.regional : '';
                            objLine[name].regio_regiao_atc_id = retornoRegiaoATC[0] ? retornoRegiaoATC[0].ID : '';
                        }
                        //!node:test (unhide console.log and hide /*await*/ sendItemToOnergy)
                        // console.log(objLine[name]);
                        /*await*/ sendItemToOnergy({
                            templateid: tabExcelID,
                            usrid: data.usrid,
                            assid: data.assid,
                            data: JSON.stringify(objLine[name]),
                            fedid: null,
                            ukField: 'asset_number',
                            checkTemplateDuplicate: true,
                            data_a: data,
                        });
                    }
                    //*aba:informacion_cuenta
                    if (tabExcel == 'informacion_cuenta') {
                        let duplicadorProfitCostCenter = gridDestino.filter((j) => j.UrlJsonContext.profit_cost_center == objLine[name].profit_cost_center);
                        if (duplicadorProfitCostCenter.length == 0 || data.em_caso_de_duplicidade == '1') {
                            objLine[name].profit_cost_center = objLine[name].profit_cost_center;
                        }
                        let duplicadorAssetNumber = gridDestino.filter((j) => j.UrlJsonContext.asset_number_IDC == objLine[name].asset_number);
                        if (duplicadorAssetNumber.length == 0 || data.em_caso_de_duplicidade == '1') {
                            objLine[name].asset_number_IDC = objLine[name].asset_number;
                        }
                        let duplicadorNomeSitio = gridDestino.filter((j) => j.UrlJsonContext.site_name == objLine[name].nombre_sitio);
                        if (duplicadorNomeSitio.length == 0 || data.em_caso_de_duplicidade == '1') {
                            objLine[name].site_name = objLine[name].nombre_sitio;
                        }
                        let duplicadorEmpresaATC = gridDestino.filter((j) => j.UrlJsonContext.emp_atc_site == objLine[name].compania_atc);
                        if (duplicadorEmpresaATC.length == 0 || data.em_caso_de_duplicidade == '1') {
                            objLine[name].emp_atc_site = objLine[name].compania_atc;
                        }
                        let duplicadorContaInternaNIC = gridDestino.filter((j) => j.UrlJsonContext.conta_interna_nic == objLine[name].cuenta_interna_nic);
                        if (duplicadorContaInternaNIC.length == 0 || data.em_caso_de_duplicidade == '1') {
                            objLine[name].conta_interna_nic = objLine[name].cuenta_interna_nic;
                        }
                        let duplicadorContaPai = gridDestino.filter((j) => j.UrlJsonContext.prcs__conta_pai == objLine[name].cuenta_padre);
                        if (duplicadorContaPai.length == 0 || data.em_caso_de_duplicidade == '1') {
                            objLine[name].prcs__conta_pai = objLine[name].cuenta_padre;
                        }
                        let tipoContaGrid = '84ca5970-7a49-4192-a2c8-030031503a1a';
                        let registroTipoConta = /*await*/ getOnergyItem(tipoContaGrid, data.assid, data.usrid, null);
                        let retornoTipoConta = registroTipoConta.filter((j) => j.UrlJsonContext.TC_tipo_de_conta == objLine[name].tipo_cuenta);
                        if (retornoTipoConta.length == 0 || data.em_caso_de_duplicidade == '1') {
                            status_desc = `ERROR: no hay Tipo de Cuenta ${objLine[name].tipo_cuenta} para registro ${objLine[name].asset_number} de ${tabExcel}`;
                            /*await*/ postStatus(status_desc, data);
                            break;
                        }
                        let duplicadorTipoConta = gridDestino.filter(
                            (j) => j.UrlJsonContext.TCTC_tipo_de_conta__prcs__tipo_de_conta == objLine[name].tipo_cuenta
                        );
                        if (duplicadorTipoConta.length == 0 || data.em_caso_de_duplicidade == '1') {
                            objLine[name].TCTC_tipo_de_conta__prcs__tipo_de_conta = retornoTipoConta[0]
                                ? retornoTipoConta[0].UrlJsonContext.TC_tipo_de_conta
                                : '';
                            objLine[name].TC_tipo_de_conta_id = retornoTipoConta[0] ? retornoTipoConta[0].ID : '';
                        }
                        let duplicadorNumeroMedidor = gridDestino.filter((j) => j.UrlJsonContext.numero_do_medidor == objLine[name].numero_medidor);
                        if (duplicadorNumeroMedidor.length == 0 || data.em_caso_de_duplicidade == '1') {
                            objLine[name].numero_do_medidor = objLine[name].numero_medidor;
                        }
                        let empresaATCGrid = '8803f10a-9c32-4c4f-8bd6-8e959ed24277';
                        let registroEmpresaATC = /*await*/ getOnergyItem(empresaATCGrid, data.assid, data.usrid, null);
                        let retornoEmpresaATC = registroEmpresaATC.filter((j) => j.UrlJsonContext.site == objLine[name].suscriptor);
                        if (retornoEmpresaATC.length == 0 || data.em_caso_de_duplicidade == '1') {
                            status_desc = `ERROR: no hay Compañia ATC ${objLine[name].suscriptor} para registro ${objLine[name].asset_number} de ${tabExcel}`;
                            /*await*/ postStatus(status_desc, data);
                            break;
                        }
                        let duplicadorAssinanteATC = gridDestino.filter((j) => j.UrlJsonContext.emp_atc_site__prcs__assinante_atc == objLine[name].suscriptor);
                        if (duplicadorAssinanteATC.length == 0 || data.em_caso_de_duplicidade == '1') {
                            objLine[name].emp_atc_site__prcs__assinante_atc = retornoEmpresaATC[0] ? retornoEmpresaATC[0].UrlJsonContext.site : '';
                            objLine[name].emp_atc_assinante_atc_id = retornoEmpresaATC[0] ? retornoEmpresaATC[0].ID : '';
                        }
                        let statusContaGrid = '4963d2c6-2b94-4c37-bffb-87c0dc296587';
                        let registroStatusConta = /*await*/ getOnergyItem(statusContaGrid, data.assid, data.usrid, null);
                        let retornoStatusConta = registroStatusConta.filter((j) => j.UrlJsonContext.status_conta == objLine[name].estado_cuenta);
                        if (retornoStatusConta.length == 0 || data.em_caso_de_duplicidade == '1') {
                            status_desc = `ERROR: no hay Status de Cuenta ${objLine[name].estado_cuenta} para registro ${objLine[name].asset_number} de ${tabExcel}`;
                            /*await*/ postStatus(status_desc, data);
                            break;
                        }
                        let duplicadorStatusConta = gridDestino.filter((j) => j.UrlJsonContext.sta_cont_status_conta == objLine[name].estado_cuenta);
                        if (duplicadorStatusConta.length == 0 || data.em_caso_de_duplicidade == '1') {
                            objLine[name].sta_cont_status_conta = retornoStatusConta[0] ? retornoStatusConta[0].UrlJsonContext.status_conta : '';
                            objLine[name].sta_cont_status_conta_id = retornoStatusConta[0] ? retornoStatusConta[0].ID : '';
                        }
                        let provedoresGrid = '4783ca0b-357d-42ab-a5c8-3328ee315f86';
                        let registroProvedores = /*await*/ getOnergyItem(provedoresGrid, data.assid, data.usrid, null);
                        let retornoProvedores = registroProvedores.filter((j) => j.UrlJsonContext.nome_provedor == objLine[name].nombre_proveedor);
                        if (retornoProvedores.length == 0 || data.em_caso_de_duplicidade == '1') {
                            status_desc = `ERROR: no hay Proveedor ${objLine[name].nombre_proveedor} para registro ${objLine[name].asset_number} de ${tabExcel}`;
                            /*await*/ postStatus(status_desc, data);
                            break;
                        }
                        let duplicadorProvedores = gridDestino.filter((j) => j.UrlJsonContext.prvd_nome_provedor == objLine[name].nombre_proveedor);
                        if (duplicadorProvedores.length == 0 || data.em_caso_de_duplicidade == '1') {
                            objLine[name].prvd_nome_provedor = retornoProvedores[0] ? retornoProvedores[0].UrlJsonContext.nome_provedor : '';
                            objLine[name].prvd_nome_provedor_id = retornoProvedores[0] ? retornoProvedores[0].ID : '';
                            objLine[name].prvd_nome_comercial = retornoProvedores[0] ? retornoProvedores[0].UrlJsonContext.nome_comercial : '';
                            objLine[name].prvd_nit_provedor = retornoProvedores[0] ? retornoProvedores[0].nit_provedor : '';
                            objLine[name].prvd_nit_beneficiario = retornoProvedores[0] ? retornoProvedores[0].UrlJsonContext.nit_beneficiario : '';
                            objLine[name].prvd_beneficiario = retornoProvedores[0] ? retornoProvedores[0].beneficiario : '';
                            objLine[name].prvd_dia_de_vencimento = retornoProvedores[0] ? retornoProvedores[0].UrlJsonContext.dia_de_vencimento : '';
                            objLine[name].prvd_link_web = retornoProvedores[0] ? retornoProvedores[0].UrlJsonContext.link_web : '';
                            objLine[name].prvd_usuario = retornoProvedores[0] ? retornoProvedores[0].UrlJsonContext.usuario : '';
                            objLine[name].prvd_senha = retornoProvedores[0] ? retornoProvedores[0].UrlJsonContext.senha : '';
                        }
                        let servicosGrid = '8e284e84-b8f9-45c1-abe2-991555441ea2';
                        let registroServicos = /*await*/ getOnergyItem(servicosGrid, data.assid, data.usrid, null);
                        let retornoServicos = registroServicos.filter((j) => j.UrlJsonContext.servicos == objLine[name].servicios);
                        if (retornoServicos.length == 0 || data.em_caso_de_duplicidade == '1') {
                            status_desc = `ERROR: no hay Servicio ${objLine[name].servicios} para registro ${objLine[name].asset_number} de ${tabExcel}`;
                            /*await*/ postStatus(status_desc, data);
                            break;
                        }
                        let duplicadorServicos = gridDestino.filter((j) => j.UrlJsonContext.serv_servicos__servico == objLine[name].servicios);
                        if (duplicadorServicos.length == 0 || data.em_caso_de_duplicidade == '1') {
                            objLine[name].serv_servicos__servico = retornoServicos[0] ? retornoServicos[0].UrlJsonContext.servicos : '';
                            objLine[name].serv_servicos_id = retornoServicos[0] ? retornoServicos[0].ID : '';
                        }
                        let sujeitoPassivoGrid = '78352af1-70b2-43a0-ad2a-084cdcf2eacf';
                        let registroSujeitoPassivo = /*await*/ getOnergyItem(sujeitoPassivoGrid, data.assid, data.usrid, null);
                        let retornoSujeitoPassivo = registroSujeitoPassivo.filter((j) => j.UrlJsonContext.sujeito == objLine[name].sujeto_pasivo);
                        if (retornoSujeitoPassivo.length == 0 || data.em_caso_de_duplicidade == '1') {
                            status_desc = `ERROR: no hay Sujeto Pasivo ${objLine[name].sujeto_pasivo} para registro ${objLine[name].asset_number} de ${tabExcel}`;
                            /*await*/ postStatus(status_desc, data);
                            break;
                        }
                        let duplicadorSujeitoPassivo = gridDestino.filter(
                            (j) => j.UrlJsonContext.suj_pa_sujeito__prcs__sujeito_passivo_alumbrado_publico == objLine[name].sujeto_pasivo
                        );
                        if (duplicadorSujeitoPassivo.length == 0 || data.em_caso_de_duplicidade == '1') {
                            objLine[name].suj_pa_sujeito__prcs__sujeito_passivo_alumbrado_publico = retornoSujeitoPassivo[0]
                                ? retornoSujeitoPassivo[0].UrlJsonContext.sujeito
                                : '';
                            objLine[name].suj_pa_sujeito_id = retornoSujeitoPassivo[0] ? retornoSujeitoPassivo[0].ID : '';
                        }
                        let duplicadorAcordoResolucao = gridDestino.filter(
                            (j) => j.UrlJsonContext.prcs__acuerdo_resolucion_alumbrado_publico == objLine[name].acuerdo_resolucion
                        );
                        if (duplicadorAcordoResolucao.length == 0 || data.em_caso_de_duplicidade == '1') {
                            objLine[name].prcs__acuerdo_resolucion_alumbrado_publico = objLine[name].acuerdo_resolucion;
                        }
                        let tipoCobrancaGrid = '22538843-147f-4d41-9534-20a6d674f4b6';
                        let registroTipoCobranca = /*await*/ getOnergyItem(tipoCobrancaGrid, data.assid, data.usrid, null);
                        let retornoTipoCobranca = registroTipoCobranca.filter((j) => j.UrlJsonContext.tipos_cobrancas == objLine[name].tipo_cobro);
                        if (retornoTipoCobranca.length == 0 || data.em_caso_de_duplicidade == '1') {
                            status_desc = `ERROR: no hay Tipo Cobro ${objLine[name].tipo_cobro} para registro ${objLine[name].asset_number} de ${tabExcel}`;
                            /*await*/ postStatus(status_desc, data);
                            break;
                        }
                        let duplicadorTipoCobranca = gridDestino.filter(
                            (j) => j.UrlJsonContext.tipo_cobr_tipos_cobrancas__prcs__tipo_cobro_alumbrado_publico == objLine[name].tipo_cobro
                        );
                        if (duplicadorTipoCobranca.length == 0 || data.em_caso_de_duplicidade == '1') {
                            objLine[name].tipo_cobr_tipos_cobrancas__prcs__tipo_cobro_alumbrado_publico = retornoTipoCobranca[0]
                                ? retornoTipoCobranca[0].UrlJsonContext.tipos_cobrancas
                                : '';
                            objLine[name].tipo_cobr_tipos_cobrancas_id = retornoTipoCobranca[0] ? retornoTipoCobranca[0].ID : '';
                        }
                        let duplicadorMediaValorTotal = gridDestino.filter((j) => j.UrlJsonContext.prcs__media_valor_total == objLine[name].media_valor_total);
                        if (duplicadorMediaValorTotal.length == 0 || data.em_caso_de_duplicidade == '1') {
                            objLine[name].prcs__media_valor_total = objLine[name].media_valor_total;
                        }
                        let duplicadorMediaValorEnergia = gridDestino.filter(
                            (j) => j.UrlJsonContext.prcs__media_valor_energia == objLine[name].media_valor_energia
                        );
                        if (duplicadorMediaValorEnergia.length == 0 || data.em_caso_de_duplicidade == '1') {
                            objLine[name].prcs__media_valor_energia = objLine[name].media_valor_energia;
                        }
                        let duplicadorMediaValorIluminacao = gridDestino.filter(
                            (j) => j.UrlJsonContext.prcs__media_valor_iluminacao == objLine[name].media_valor_alumbrado
                        );
                        if (duplicadorMediaValorIluminacao.length == 0 || data.em_caso_de_duplicidade == '1') {
                            objLine[name].prcs__media_valor_iluminacao = objLine[name].media_valor_alumbrado;
                        }
                        let duplicadorDiaPagamento = gridDestino.filter((j) => j.UrlJsonContext.prcs__dia_de_pagamento == objLine[name].dia_de_pago);
                        if (duplicadorDiaPagamento.length == 0 || data.em_caso_de_duplicidade == '1') {
                            objLine[name].prcs__dia_de_pagamento = objLine[name].dia_de_pago;
                        }
                        let frequenciaPagamentoGrid = '2d4edce3-7131-413a-98e5-35d328daef7f';
                        let registroFrequenciaPagamento = /*await*/ getOnergyItem(frequenciaPagamentoGrid, data.assid, data.usrid, null);
                        let retornoFrequenciaPagamento = registroFrequenciaPagamento.filter(
                            (j) => j.UrlJsonContext.frequencia == objLine[name].frecuencia_pago
                        );
                        if (retornoFrequenciaPagamento.length == 0 || data.em_caso_de_duplicidade == '1') {
                            status_desc = `ERROR: no hay Frecuencia Pago ${objLine[name].frecuencia_pago} para registro ${objLine[name].asset_number} de ${tabExcel}`;
                            /*await*/ postStatus(status_desc, data);
                            break;
                        }
                        let duplicadorFrequenciaPagamento = gridDestino.filter(
                            (j) => j.UrlJsonContext.fre_pag_frequencia__frequencia_de_pagamento == objLine[name].frecuencia_pago
                        );
                        if (duplicadorFrequenciaPagamento.length == 0 || data.em_caso_de_duplicidade == '1') {
                            objLine[name].fre_pag_frequencia__frequencia_de_pagamento = retornoFrequenciaPagamento[0]
                                ? retornoFrequenciaPagamento[0].UrlJsonContext.frequencia
                                : '';
                            objLine[name].fre_pag_frequencia_id = retornoFrequenciaPagamento[0] ? retornoFrequenciaPagamento[0].ID : '';
                        }
                        let formaPagamentoGrid = '0e8a4463-28db-474f-926b-39fa1bd0c9bc';
                        let registroFormaPagamento = /*await*/ getOnergyItem(formaPagamentoGrid, data.assid, data.usrid, null);
                        let retornoFormaPagamento = registroFormaPagamento.filter((j) => j.UrlJsonContext.formas_de_pagamentos == objLine[name].forma_pago);
                        if (retornoFormaPagamento.length == 0 || data.em_caso_de_duplicidade == '1') {
                            status_desc = `ERROR: no hay Forma Pago ${objLine[name].forma_pago} para registro ${objLine[name].asset_number} de ${tabExcel}`;
                            /*await*/ postStatus(status_desc, data);
                            break;
                        }
                        let duplicadorFormaPagamento = gridDestino.filter(
                            (j) => j.UrlJsonContext.for_pag_formas_de_pagamentos__forma_de_pagamento == objLine[name].forma_pago
                        );
                        if (duplicadorFormaPagamento.length == 0 || data.em_caso_de_duplicidade == '1') {
                            objLine[name].for_pag_formas_de_pagamentos__forma_de_pagamento = retornoFormaPagamento[0]
                                ? retornoFormaPagamento[0].UrlJsonContext.formas_de_pagamentos
                                : '';
                            objLine[name].for_pag_formas_de_pagamentos_id = retornoFormaPagamento[0] ? retornoFormaPagamento[0].ID : '';
                        }
                        let classificacaoPassthruGrid = 'ad62c737-2abc-4c71-a572-e11933114ed8';
                        let registroClassificacaoPassthru = /*await*/ getOnergyItem(classificacaoPassthruGrid, data.assid, data.usrid, null);
                        let retornoClassificacaoPassthru = registroClassificacaoPassthru.filter(
                            (j) => j.UrlJsonContext.classificacao_passthru == objLine[name].clasificacion_passthru
                        );
                        if (retornoClassificacaoPassthru.length == 0 || data.em_caso_de_duplicidade == '1') {
                            status_desc = `ERROR: no hay Clasificación Passthru ${objLine[name].clasificacion_passthru} para registro ${objLine[name].asset_number} de ${tabExcel}`;
                            /*await*/ postStatus(status_desc, data);
                            break;
                        }
                        let duplicadorClassificacaoPassthru = gridDestino.filter(
                            (j) => j.UrlJsonContext.CPTclassificacao_passthru__prcs__clasificacion_passthru == objLine[name].clasificacion_passthru
                        );
                        if (duplicadorClassificacaoPassthru.length == 0 || data.em_caso_de_duplicidade == '1') {
                            objLine[name].CPTclassificacao_passthru__prcs__clasificacion_passthru = retornoClassificacaoPassthru[0]
                                ? retornoClassificacaoPassthru[0].UrlJsonContext.classificacao_passthru
                                : '';
                            objLine[name].CPTclassificacao_passthru_id = retornoClassificacaoPassthru[0] ? retornoClassificacaoPassthru[0].ID : '';
                        }
                        let duplicadorUltimaCaptura = gridDestino.filter((j) => j.UrlJsonContext.prcs__ultima_captura == objLine[name].ultima_captura);
                        if (duplicadorUltimaCaptura.length == 0 || data.em_caso_de_duplicidade == '1') {
                            objLine[name].prcs__ultima_captura = objLine[name].ultima_captura;
                        }
                        let statusCapturaContaGrid = '3c2d0727-6359-4c71-9409-465759462854';
                        let registroStatusCapturaConta = /*await*/ getOnergyItem(statusCapturaContaGrid, data.assid, data.usrid, null);
                        let retornoStatusCapturaConta = registroStatusCapturaConta.filter(
                            (j) => j.UrlJsonContext.ECCU_estado_da_captura_da_conta == objLine[name].estado_captura_cuenta
                        );
                        if (retornoStatusCapturaConta.length == 0 || data.em_caso_de_duplicidade == '1') {
                            status_desc = `ERROR: no hay Estado Captura Cuenta ${objLine[name].estado_captura_cuenta} para registro ${objLine[name].asset_number} de ${tabExcel}`;
                            /*await*/ postStatus(status_desc, data);
                            break;
                        }
                        let duplicadorStatusCapturaConta = gridDestino.filter(
                            (j) => j.UrlJsonContext.ECCUECCU_estado_da_captura_da_conta__status_de_capturapago == objLine[name].estado_captura_cuenta
                        );
                        if (duplicadorStatusCapturaConta.length == 0 || data.em_caso_de_duplicidade == '1') {
                            objLine[name].ECCUECCU_estado_da_captura_da_conta__status_de_capturapago = retornoStatusCapturaConta[0]
                                ? retornoStatusCapturaConta[0].UrlJsonContext.ECCU_estado_da_captura_da_conta
                                : '';
                            objLine[name].ECCU_estado_da_captura_da_conta_id = retornoStatusCapturaConta[0] ? retornoStatusCapturaConta[0].ID : '';
                        }
                        let duplicadorProximaCaptura = gridDestino.filter((j) => j.UrlJsonContext.prcs__proxima_captura == objLine[name].fecha_prox_captura);
                        if (duplicadorProximaCaptura.length == 0 || data.em_caso_de_duplicidade == '1') {
                            objLine[name].prcs__proxima_captura = objLine[name].fecha_prox_captura;
                        }
                        let duplicadorProximoPagoOportuno = gridDestino.filter(
                            (j) => j.UrlJsonContext.prcs__proximo_pagamento == objLine[name].fecha_prox_pago_oportuno
                        );
                        if (duplicadorProximoPagoOportuno.length == 0 || data.em_caso_de_duplicidade == '1') {
                            objLine[name].prcs__proximo_pagamento = objLine[name].fecha_prox_pago_oportuno;
                        }
                        //!node:test (unhide console.log and hide /*await*/ sendItemToOnergy)
                        // console.log(objLine[name]);
                        /*await*/ sendItemToOnergy({
                            templateid: tabExcelID,
                            usrid: data.usrid,
                            assid: data.assid,
                            data: JSON.stringify(objLine[name]),
                            fedid: null,
                            ukField: 'asset_number',
                            checkTemplateDuplicate: true,
                            data_a: data,
                        });
                    }
                    //*aba:informacion_tecnica
                    //*aba:clientes_sitio
                    //*aba:clientes
                    //*aba:regional_clientes
                    //*aba:contactos_clientes
                    //*aba:portafolio_clientes
                }
                arrayPost.push(objLine);

                status_desc = `Cargando registro ${parseInt(x) + 1} de ${ctxExcel.length} de la grilla ${tabExcel}`;
                /*await*/ postStatus(status_desc, data);
            }
            status_desc = `Cargando ${arrayPost.length} registros de la grilla ${tabExcel}`;
            /*await*/ postStatus(status_desc, data);
        } else {
            status_desc = `No hay contenido en la grilla ${tabExcel}`;
            /*await*/ postStatus(status_desc, data);
            return;
        }

        let qtdReg = 0;
        if (arrayPost.length > 0) {
            qtdReg = arrayPost.length;

            //!node:test (unhide console.dir and hide /*await*/ onergy)
            // console.dir(arrayPost);
            /*await*/ onergy.InsertManyOnergy(arrayPost, cargaIndiceID, data.onergy_js_ctx.usrid);

            status_desc = `Carga completada con éxito: ${qtdReg} registros de la grilla ${tabExcel}`;
            /*await*/ postStatus(status_desc, data);
        }
    }

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
    if (WaitingWebHook === undefined) WaitingWebHook = false;
    let obj = {
        cond: cond,
        json: JSON.stringify(json),
        WaitingWebHook: WaitingWebHook,
    };
    return obj;
}

/**METODOS PADRAO ===
 */
let json = {
    load_index_equipe: 'COL',
    load_index_id_do_card: '18615527-c678-4f1c-87e0-d7a9735d0c6e',
    planilha: [
        {
            Url: 'https://onebackupservices.blob.core.windows.net/67c0b77d-abae-4c48-ba4b-6c8faf27e14a/tablas_maestras.xlsx8dd74d34-0c31-4d85-a53d-1fa63f68e4a4.xlsx?sv=2018-03-28&sr=b&sig=g6J6Wk1VXBcVOjGXMqNCd27RC3yLxFJauSJ6AxdHTGI%3D&se=2023-04-30T23%3A30%3A30Z&sp=r',
            UrlAzure:
                'https://onebackupservices.blob.core.windows.net/67c0b77d-abae-4c48-ba4b-6c8faf27e14a/tablas_maestras.xlsx8dd74d34-0c31-4d85-a53d-1fa63f68e4a4.xlsx?sv=2018-03-28&sr=b&sig=g6J6Wk1VXBcVOjGXMqNCd27RC3yLxFJauSJ6AxdHTGI%3D&se=2023-04-30T23%3A30%3A30Z&sp=r',
            Name: 'tablas_maestras.xlsx',
        },
    ],
    load_index_tab_excel: 'portafolio_atc',
    load_index_id: '72adb5cf-cbdc-4887-bedf-0ba2239e36dc',
    em_caso_de_duplicidade: '1',
    em_caso_de_duplicidade_desc: 'Sobrescribir',
    ass_id: '67c0b77d-abae-4c48-ba4b-6c8faf27e14a',
    assid: '67c0b77d-abae-4c48-ba4b-6c8faf27e14a',
    email: 'admin-colombia@atc.com.co',
    fdtid: '181c67a8-e7a9-4c9a-9ea1-ca4719c0e23f',
    fedid: 'be530235-fdad-2222-14b8-94adf6be7b8b',
    onergy_rolid: 'e4d0298c-245e-454a-89d4-8f27aef8645b',
    timezone: null,
    usrid: '0c44d4fc-d654-405b-9b8f-7fea162948b5',
};

init(JSON.stringify(json));
