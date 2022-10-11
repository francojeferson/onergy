//!NODE_ENV ===
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
    const r = await onergy.onergy_get(args);
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
function onergy_updatemany(data) {
    return data;
}
function successCallback(result) {
    console.log('It succeeded with ' + result);
}

//!SCRIPT ===
async function init(json) {
    let data = JSON.parse(json);
    let atividadesFdtid = data.load_index_id_do_card; // nome interno do campo no onergy forms "carga geral"
    let equipe = data.load_index_equipe; // nome interno do campo no onergy forms "carga geral"
    let ufGrid = '132b8394-2193-4d83-a399-08f4cde70873'; // id card uf
    let cidadeGrid = 'a95b4721-fc79-445c-b964-14a4ccbf1d7b'; // id card cidade
    let leituraGrid = '0d3b6287-8f3a-4ad7-acdd-e1c60426f73f'; // id card leitura
    let tipodeSiteGrid = 'fa0475d2-3ee0-4f49-aeb9-b8b52c1ecb8a'; // id card tipo de Sites
    let statusSiteGrid = 'f0ee1dd9-bb48-4aef-9f77-43e357870a31'; // id card status site
    let empresaAtcGrid = '8803f10a-9c32-4c4f-8bd6-8e959ed24277'; // id card empresa atc
    let regionalGrid = '74d8a818-46a7-4d56-8a18-2369bdd00589'; // id card regional
    let sujeitoPassivoGrid = '78352af1-70b2-43a0-ad2a-084cdcf2eacf'; // id card sujeito passivo
    let servicosGrid = '8e284e84-b8f9-45c1-abe2-991555441ea2'; // id card serviços
    let frequenciaPagamentoGrid = '2d4edce3-7131-413a-98e5-35d328daef7f'; //id card frenqucia de pagamento
    let formaPagamentoGrid = '0e8a4463-28db-474f-926b-39fa1bd0c9bc'; // id card forma de pagamento
    let tipoCobrancaGrid = '22538843-147f-4d41-9534-20a6d674f4b6'; // id do card tipo de cobrança
    let categoriaGrid = '55ec978d-7dbe-4a6f-8cb4-536b53361d54'; // id do card categoria
    let statusConferenciaGrid = 'ac1bb1a1-6f23-411d-a1f6-0db5ea248cec'; // id card status conferencia
    let statusMedidorGrid = 'ad22a620-8200-425a-acc8-c7bad38761e8'; // id card status medidor
    let statusContaGrid = '4963d2c6-2b94-4c37-bffb-87c0dc296587'; // id card status conta
    let sitesGrid = '6ba0e15e-7c5f-400c-a77f-3ce8f808a408'; // id card sites
    let concessionariaGrid = 'b599dbd5-0a74-479d-a0e8-c2a6511fcdc0'; // id card concessionaria
    let portifolioGrid = '18615527-c678-4f1c-87e0-d7a9735d0c6e'; // id do card portifolio
    let sitiosGrid = 'e43b9fe0-6752-446d-8495-0b4fdd7a70b4'; // id do card sitios
    let tipoDeServicosGrid = 'da6270f1-f6e9-47e2-a44f-45f53a91f310'; // id do card tipo de serviços
    let responsavelServicosGrid = '730a28cc-34d0-4f60-b73e-d7deb9a906b4'; // id do card responsável serviços
    let atividadeLigacaoGrid = '6c0c1ce0-56a1-4442-b063-95e1e4a0b734'; // id do card atividade ligação
    let fornecedorProvisorioGrid = '72dd40be-4c60-4aa0-84fe-582726f05a96'; // id do card forncedor provisório
    let fornecedorObraGrid = 'cd01cb36-df5c-4db1-ab12-a34e0a0201d3'; // id do card forncedor obra
    let contratanteEnergiaGrid = '6b6765a4-5887-4970-9ddf-00452f3960c3'; // id do card contratante energia
    let pmResponsavelGrid = 'f36886be-0f67-4282-b97e-02bd87526e25'; // id do card pm responsável
    let statusProcessoGrid = 'a4fbd3f2-2caa-40c5-aea9-a89e4f2b01fa'; // id do card status processo
    let ofensorGrid = 'a0f4f4fd-64a6-4db5-bf57-723048226b80'; // id do card ofensor
    let medidoresGrid = '51fc0848-279d-4fd5-86d9-4039f6240399'; // id do card pesquisa medidores
    let clienteOperadoras = '8e5ba6ba-8311-4a6c-b071-26192042a56b'; //id do card clientes operadoras
    let informacionCuenta = '21672360-869c-4c29-8cf8-2bafa8530923'; // id do card informacion cuenta
    let informacionTecnica = '4aee802e-d63d-42df-b198-d7b1a8b0b051'; // id do card informacion tecnica
    let provedorGrid = '4783ca0b-357d-42ab-a5c8-3328ee315f86'; // id do card provedor
    let cargaIndice = '9a6e262f-e463-4c5d-9d8b-0fd8343b2f02'; // id do card carga indice
    let tipoTercero = '70110b99-aa96-4e25-b1b2-177484668700'; // id do card tipo de terceiro
    let tipoAcesso = '62e9a129-73b5-4819-9c16-f1d4bdababde'; // id do card tipo de acesso

    let registroUf = await getOnergyItem(ufGrid, data.assid, data.usrid, null); // ftdid do card que é a referência do registro de UF
    let registroTipoDeSites = await getOnergyItem(tipodeSiteGrid, data.assid, data.usrid, null); // ftdid do card que é a referencia do registros de Sites
    let registroStatusSites = await getOnergyItem(statusSiteGrid, data.assid, data.usrid, null); // ftdid do card que é a referência do registro de Status Sites
    let registroConcessionaria = await getOnergyItem(concessionariaGrid, data.assid, data.usrid, null); // ftdid do card que é a referencia de registros Concessionaria
    let registroPortfolio = await getOnergyItem(portifolioGrid, data.assid, data.usrid, null); // ftdid do card que é a referencia de Registros Portifolio
    let registroMunicipio = await getOnergyItem(cidadeGrid, data.assid, data.usrid, null); // ftdid do card que é a referencia registros de Municipios
    let registrosujeitoPassivoAp = await getOnergyItem(sujeitoPassivoGrid, data.assid, data.usrid, null); // ftdid do card que é a referencia Registros de Sujeito Passivo
    let registroEmpresaAtc = await getOnergyItem(empresaAtcGrid, data.assid, data.usrid, null); // ftdid do card que é a referencia de Registros de Empresa ATC
    let registroCondado = await getOnergyItem(cidadeGrid, data.assid, data.usrid, null); //ftdid card que é referencia de regsitros cidade
    let registroStatusMedidor = await getOnergyItem(statusMedidorGrid, data.assid, data.usrid, null); //ftdid card que é referencia de regsitros status medidor
    let registroStatusConferencia = await getOnergyItem(statusConferenciaGrid, data.assid, data.usrid, null); //ftdid card que é referencia de regsitros status conferencia
    let registroClienteOpe = await getOnergyItem(clienteOperadoras, data.assid, data.usrid, null); //ftdid card que é referencia de registro cliente operadores
    let registroStatusConta = await getOnergyItem(statusContaGrid, data.assid, data.usrid, null); //ftdid card que é referencia de registro status conta
    let registroProvedor = await getOnergyItem(provedorGrid, data.assid, data.usrid, null); // ftdid do card que é a referencia de registros provedor
    let registroServicos = await getOnergyItem(servicosGrid, data.assid, data.usrid, null); // ftdid do card que é a referencia de registros serviços
    let registroFormaPagamento = await getOnergyItem(formaPagamentoGrid, data.assid, data.usrid, null); // ftdis do card que é a referencia de registro forma de pagamento
    let registroFrequenciaPag = await getOnergyItem(frequenciaPagamentoGrid, data.assid, data.usrid, null); // ftdis do card que é referencia de registros frequencia de pagamento
    let registroCategorias = await getOnergyItem(categoriaGrid, data.assid, data.usrid, null); // id do card que é referencia de registro categorias
    let registroLeitura = await getOnergyItem(leituraGrid, data.assid, data.usrid, null); // id do card que é referencia de registro leitura
    let registroCam = await getOnergyItem(sitiosGrid, data.assid, data.usrid, null); // id do card que é a referencia de registro sitios
    let registroSitios = await getOnergyItem(sitiosGrid, data.assid, data.usrid, null); // Registro do Grid Sitios
    let registrosTipoTercero = await getOnergyItem(tipoTercero, data.assid, data.usrid, null);
    let registrosTipoAcesso = await getOnergyItem(tipoAcesso, data.assid, data.usrid, null);
    let gridDestino = await getOnergyItem(atividadesFdtid, data.assid, data.usrid, null);

    let status_desc = '';
    let status_erro = '';
    let strArrExcel = await ReadExcelToJson({
        url: data.planilha[0].UrlAzure,
    });

    let dataExcel = JSON.parse(strArrExcel);
    let tabExcel = data.load_index_tab_excel;

    if (dataExcel !== null) {
        var validadorS = false;
        let number = '0';
        let mensagem = '';
        var arrSaveA = [];
        let arrayInfo = dataExcel[tabExcel]; // nome da aba na planilha forms "carga geral" aba dinâmica
        data.processo = '';
        for (let line in arrayInfo) {
            let objItem = {};
            objItem.id_upload_planilha = data.id_upload_planilha;
            objItem.equipe = arrayInfo[line].label_equipe;
            objItem.id_equipe_txt = arrayInfo[line].equipe;

            //*ABA DE UF
            if (atividadesFdtid == ufGrid) {
                if (equipe == 'BRA') {
                    let duplicadorUf = gridDestino.filter((x) => x.UrlJsonContext.uf == arrayInfo[line].uf);
                    if (duplicadorUf.length == 0) {
                        objItem.uf = arrayInfo[line].uf;
                        objItem.estado = arrayInfo[line].nome_cidade;
                        arrSaveA.push(objItem);
                    }
                } else if (equipe == 'COL') {
                    let duplicadorUf = gridDestino.filter((x) => x.UrlJsonContext.uf == arrayInfo[line].sigla_departamento);
                    if (duplicadorUf.length == 0) {
                        objItem.uf = arrayInfo[line].sigla_departamento;
                        objItem.estado = arrayInfo[line].departamento;
                        arrSaveA.push(objItem);
                    }
                }
            }
            //*ABA DE CIDADE
            if (atividadesFdtid == cidadeGrid) {
                let retornoUf = registroUf.filter((x) => x.UrlJsonContext.uf == arrayInfo[line].uf);
                if (retornoUf.length == 0) {
                    let linha = parseInt(line) + 1;
                    if (equipe == 'COL') {
                        status_erro = '** ERROR** No se encontró el Departamento ' + arrayInfo[line].uf + ' | LÍNEA: ' + String(linha + 1);
                    } else if (equipe == 'BRA') {
                        status_erro = '**ERROR** UF não encontrada ' + arrayInfo[line].uf + ' | LINHA: ' + String(linha + 1);
                    }
                    break;
                }
                let duplicadorCidade = gridDestino.filter((x) => x.UrlJsonContext.municipio == arrayInfo[line].nome_cidade);
                if (duplicadorCidade.length == 0) {
                    objItem.loca_uf_uf = retornoUf[0].UrlJsonContext.uf;
                    objItem.loca_uf_id = retornoUf[0].ID; // id da pesquisa referencia
                    objItem.municipio = arrayInfo[line].nome_cidade;
                    arrSaveA.push(objItem);
                }
            }
            //*ABA PORTIFOLIO
            if (atividadesFdtid == portifolioGrid) {
                let duplicadorPortifolio = gridDestino.filter((x) => x.UrlJsonContext.tipo_portifolio == arrayInfo[line]['tipo_portifolio']);
                if (duplicadorPortifolio.length == 0) {
                    objItem.tipo_portifolio = arrayInfo[line]['tipo_portifolio'];
                    arrSaveA.push(objItem);
                }
            }
            //*ABA DE LEITURA
            if (atividadesFdtid == leituraGrid) {
                let duplicadorFerramenta = gridDestino.filter((x) => x.UrlJsonContext.ferramentas == arrayInfo[line].ferramentas);
                if (duplicadorFerramenta.length == 0) {
                    objItem.ferramentas = arrayInfo[line].ferramentas;
                    arrSaveA.push(objItem);
                }
            }
            //*ABA DE TIPO SITE
            if (atividadesFdtid == tipodeSiteGrid) {
                let duplicadorTipoSite = gridDestino.filter((x) => x.UrlJsonContext.tipo_site == arrayInfo[line].tipo_site);
                if (duplicadorTipoSite.length == 0) {
                    objItem.tipo_site = arrayInfo[line].tipo_site;
                    arrSaveA.push(objItem);
                }
            }
            //*ABA CONCESSIONARIA
            if (atividadesFdtid == concessionariaGrid) {
                let duplicadorConcessionaria = gridDestino.filter((x) => x.UrlJsonContext.nome_concessionaria == arrayInfo[line].nome_concessionaria);
                if (duplicadorConcessionaria.length == 0) {
                    objItem.nome_concessionaria = arrayInfo[line].nome_concessionaria;
                    arrSaveA.push(objItem);
                }
            }
            //*ABA PROVEDOR
            if (atividadesFdtid == provedorGrid) {
                var retornoTipoTercero = registrosTipoTercero.filter((x) => x.UrlJsonContext.tipo_de_terceiro == arrayInfo[line]['TIPO DE TERCERO']);
                if (retornoTipoTercero.length == 0) {
                    let linha = parseInt(line) + 1;
                    if (equipe == 'COL') {
                        status_erro = '**ERRO TIPO TERCERO no encontró' + arrayInfo[line]['TIPO DE TERCERO'] + '| LINHA: ' + String(linha + 1);
                    }
                    break;
                }
                if (atividadesFdtid == provedorGrid) {
                    var retornoTipoAcesso = registrosTipoAcesso.filter((x) => x.UrlJsonContext.tipo_de_acesso == arrayInfo[line]['TIPO DE ACCESO']);
                    if (retornoTipoAcesso.length == 0) {
                        let linha = parseInt(line) + 1;
                        if (equipe == 'COL') {
                            status_erro = '**ERROR TIPO ACCESSO no encontró' + arrayInfo[line]['TIPO DE ACESSO'] + '| LINHA: ' + String(linha + 1);
                        }
                        break;
                    }
                }
                objItem.nit_provedor = JSON.stringify(arrayInfo[line]['ID Provedor']);
                objItem.nome_provedor = arrayInfo[line]['Provedor'];
                objItem.nit_beneficiario = arrayInfo[line]['Id Beneficiario'];
                objItem.beneficiario = arrayInfo[line]['Beneficiário'];
                objItem.nome_comercial = arrayInfo[line]['Nombre Comercial'];
                objItem.tp3o_tipo_de_terceiro = retornoTipoTercero[0] ? retornoTipoTercero[0].UrlJsonContext.tipo_de_terceiro : '';
                objItem.tp3o_id = retornoTipoTercero[0] ? retornoTipoTercero[0].ID : '';
                objItem.tp_acces_tipo_de_acesso = retornoTipoAcesso[0] ? retornoTipoAcesso[0].UrlJsonContext.tipo_de_acesso : '';
                objItem.tp_acces_id = retornoTipoAcesso[0] ? retornoTipoAcesso[0].UrlJsonContext.tipo_de_acesso : '';
                objItem.link_web = arrayInfo[line]['LINK WEB'];
                objItem.usuario = arrayInfo[line]['USUARIO'];
                objItem.senha = arrayInfo[line]['CONTRASENA'];
                objItem.numero_conta = arrayInfo[line]['No. CUENTA'];
                objItem.dia_de_vencimento = arrayInfo[line]['Día Vencimiento'];
                let salvarRegistro = await sendItemToOnergy(provedorGrid, data.usrid, data.assid, objItem, null, 'nit_provedor', true, data);
            }
            //*ABA STATUS SITE
            if (atividadesFdtid == statusSiteGrid) {
                let dupliadorStatus = gridDestino.filter((x) => x.UrlJsonContext.status == arrayInfo[line].status);
                if (dupliadorStatus.length == 0) {
                    objItem.status = arrayInfo[line].status;
                    arrSaveA.push(objItem);
                }
            }
            //*ABA EMPRESA ATC
            if (atividadesFdtid == empresaAtcGrid) {
                let duplicadorEmpresa = gridDestino.filter((x) => x.UrlJsonContext.site == arrayInfo[line].site);
                if (duplicadorEmpresa.length == 0) {
                    objItem.site = arrayInfo[line].tipo_site;
                    arrSaveA.push(objItem);
                }
            }
            //*ABA REGIONAL
            if (atividadesFdtid == regionalGrid) {
                let dupliadorRegional = gridDestino.filter((x) => x.UrlJsonContext.regional == arrayInfo[line].regional);
                if (dupliadorRegional.length == 0) {
                    objItem.regional = arrayInfo[line].regional;
                    arrSaveA.push(objItem);
                }
            }
            //*ABA SUJEITO PASSIVO
            if (atividadesFdtid == sujeitoPassivoGrid) {
                let duplicadorSujeito = gridDestino.filter((x) => x.UrlJsonContext.sujeito == arrayInfo[line].sujeito);
                if (duplicadorSujeito.length == 0) {
                    objItem.sujeito = arrayInfo[line].sujeito;
                    arrSaveA.push(objItem);
                }
            }
            //*ABA SERVIÇOS
            if (atividadesFdtid == servicosGrid) {
                let duplicadorServicos = gridDestino.filter((x) => x.UrlJsonContext.servicos == arrayInfo[line].servico);
                if (duplicadorServicos.length == 0) {
                    objItem.servicos = arrayInfo[line].servico;
                    arrSaveA.push(objItem);
                }
            }
            //*ABA FRENQUCIA PAGAMENTO
            if (atividadesFdtid == frequenciaPagamentoGrid) {
                let duplicadorFrequencia = gridDestino.filter((x) => x.UrlJsonContext.frequencia == arrayInfo[line].frequencia);
                if (duplicadorFrequencia.length == 0) {
                    objItem.frequencia = arrayInfo[line].frequencia;
                    arrSaveA.push(objItem);
                }
            }
            //*ABA FORMA DE PAGAMENTO
            if (atividadesFdtid == formaPagamentoGrid) {
                let duplicadorPagmentos = gridDestino.filter((x) => x.UrlJsonContext.formas_de_pagamentos == arrayInfo[line].forma_de_pago);
                if (duplicadorPagmentos.length == 0) {
                    objItem.formas_de_pagamentos = arrayInfo[line].forma_de_pago;
                    arrSaveA.push(objItem);
                }
            }
            //*ABA TIPO DE COBRANÇA
            if (atividadesFdtid == tipoCobrancaGrid) {
                let duplicadorCobranca = gridDestino.filter((x) => x.UrlJsonContext.tipos_cobrancas == arrayInfo[line].tipo_cobranca);
                if (duplicadorCobranca.length == 0) {
                    objItem.tipos_cobrancas = arrayInfo[line].tipo_cobranca;
                    arrSaveA.push(objItem);
                }
            }
            //*ABA CATEGORIA
            if (atividadesFdtid == categoriaGrid) {
                let duplicadorCategoria = gridDestino.filter((x) => x.UrlJsonContext.categorias == arrayInfo[line].categoria);
                if (duplicadorCategoria.length == 0) {
                    objItem.categorias = arrayInfo[line].categoria;
                    arrSaveA.push(objItem);
                }
            }
            //*ABA STATUS CONFERENCIA
            if (atividadesFdtid == statusConferenciaGrid) {
                let duplicadorConferencia = gridDestino.filter((x) => x.UrlJsonContext.status_conferencia == arrayInfo[line].st_conferencia);
                if (duplicadorConferencia.length == 0) {
                    objItem.status_conferencia = arrayInfo[line].st_conferencia;
                    arrSaveA.push(objItem);
                }
            }
            //*ABA STATUS MEDIDOR
            if (atividadesFdtid == statusMedidorGrid) {
                let duplicadorMedidor = gridDestino.filter((x) => x.UrlJsonContext.status_medidor == arrayInfo[line].status_medidor);
                if (duplicadorMedidor.length == 0) {
                    objItem.status_medidor = arrayInfo[line].status_medidor;
                    arrSaveA.push(objItem);
                }
            }
            //*ABA STATUS CONTA
            if (atividadesFdtid == statusContaGrid) {
                let duplicadorStausConta = gridDestino.filter((x) => x.UrlJsonContext.status_conta == arrayInfo[line].status_conta);
                if (duplicadorStausConta.length == 0) {
                    objItem.status_conta = arrayInfo[line].status_conta;
                    arrSaveA.push(objItem);
                }
            }
            //*ABA SITES
            if (atividadesFdtid == sitesGrid) {
                var retornoSites = registroTipoDeSites.filter((x) => x.UrlJsonContext.tipo_site == arrayInfo[line].tipo_de_site);
                if (retornoSites.length == 0) {
                    let linha = parseInt(line) + 1;
                    if (equipe == 'BRA') {
                        status_erro = '**ERROR** TIPO DE SITE não encontrada ' + arrayInfo[line].tipo_de_site + ' | LINHA: ' + String(linha + 1);
                    }
                    break;
                }
                if (atividadesFdtid == sitesGrid) {
                    var retornoStatusSites = registroStatusSites.filter((x) => x.UrlJsonContext.status == arrayInfo[line].status_do_site);
                    if (retornoStatusSites.length == 0) {
                        let linha = parseInt(line) + 1;
                        if (equipe == 'BRA') {
                            status_erro = '**ERRO** STATUS DO SITE não encontrado ' + arrayInfo[line].status_do_site + ' | LINHA: ' + String(linha + 1);
                        }
                        break;
                    }
                }
                if (atividadesFdtid == sitesGrid) {
                    var retornoConcessionaria = registroConcessionaria.filter((x) => x.UrlJsonContext.nome_concessionaria == arrayInfo[line].concessionaria);
                    if (retornoConcessionaria.length == 0) {
                        let linha = parseInt(line) + 1;
                        if (equipe == 'BRA') {
                            status_erro = '**ERRO** CONCESSIONÁRIA não encontrado ' + arrayInfo[line].concessionaria + ' | LINHA: ' + String(linha + 1);
                        }
                        break;
                    }
                }
                if (atividadesFdtid == sitesGrid) {
                    var retornoPortfolio = registroPortfolio.filter((x) => x.UrlJsonContext.tipo_portifolio == arrayInfo[line].portfolio);
                    if (retornoPortfolio.length == 0) {
                        let linha = parseInt(line) + 1;
                        if (equipe == 'BRA') {
                            status_erro = '**ERRO PORTIFÓLIO não encontrado ' + arrayInfo[line].tppf_tipo_portifolio__portfolio + ' | LINHA: ' + String(linha + 1);
                        }
                        break;
                    }
                }
                if (atividadesFdtid == sitesGrid) {
                    var retornoMunicipio = registroMunicipio.filter((x) => x.UrlJsonContext.municipio == arrayInfo[line].municipio);
                    if (retornoMunicipio.length == 0) {
                        let linha = parseInt(line) + 1;
                        if (equipe == 'BRA') {
                            status_erro = '**ERRO MUNICÍPIO não encontrado ' + arrayInfo[line].municipio + ' | LINHA: ' + String(linha + 1);
                        }
                        break;
                    }
                }
                let gps = arrayInfo[line].latitude + ',' + arrayInfo[line].longitude;
                objItem.asset_number = JSON.stringify(arrayInfo[line].cms); // Chave Única
                objItem.site_name = arrayInfo[line].apelido_do_Site;
                objItem.id_do_site = arrayInfo[line].Id_do_Site;
                objItem.tpst_tipo_site__tipo_de_site = retornoSites[0] ? retornoSites[0].UrlJsonContext.tipo_site : ' ';
                objItem.tpst_tipo_de_site_id = retornoSites[0] ? retornoSites[0].ID : ' '; // id da PR
                objItem.logradouro = arrayInfo[line].logradouro;
                objItem.numero = arrayInfo[line].numero;
                objItem.complemento = arrayInfo[line].complemento;
                objItem.bairro = arrayInfo[line].bairro;
                objItem.loca_cida_municipio = retornoMunicipio[0] ? retornoMunicipio[0].UrlJsonContext.municipio : ' ';
                objItem.loca_cida_id = retornoMunicipio[0] ? retornoMunicipio[0].ID : ' '; // id da PR
                objItem.loca_cida_loca_uf_uf = retornoMunicipio[0] ? retornoMunicipio[0].UrlJsonContext.loca_uf_uf : ' ';
                objItem.loca_uf_id = retornoMunicipio[0] ? retornoMunicipio[0].ID : ' '; // id da PR
                objItem.cep = arrayInfo[line].cep;
                objItem.latitude = arrayInfo[line].latitude;
                objItem.longitude = arrayInfo[line].longitude;
                objItem.gps = gps;
                objItem.cadeado = arrayInfo[line].cadeado;
                objItem.luz_de_balizamento = arrayInfo[line].luz_de_balizamento;
                objItem.STAstatus__status_do_site = retornoStatusSites[0] ? retornoStatusSites[0].UrlJsonContext.status : ' ';
                objItem.STAstatus_do_site_id = retornoStatusSites[0] ? retornoStatusSites[0].ID : ' '; // id da PR
                objItem.conc_nome_concessionaria__concessionaria = retornoConcessionaria[0] ? retornoConcessionaria[0].UrlJsonContext.nome_concessionaria : ' ';
                objItem.conc_concessionaria_id = retornoConcessionaria[0] ? retornoConcessionaria[0].ID : ' ';
                objItem.tppf_tipo_portifolio__portfolio = retornoPortfolio[0] ? retornoPortfolio[0].UrlJsonContext.tipo_portifolio : ' ';
                objItem.tppf_portfolio_id = retornoPortfolio[0] ? retornoPortfolio[0].ID : ' ';
                let salvarRegistro = await sendItemToOnergy(sitesGrid, data.usrid, data.assid, objItem, null, 'asset_number', true, data);
            }
            //*ABA SITIOS
            if (atividadesFdtid == sitiosGrid) {
                let duplicadorSitos = registroSitios.filter((x) => x.UrlJsonContext.asset_number == arrayInfo[line]['Asset Number']);
                if (duplicadorSitos.length == 0) {
                    mensagem = 'Adicionado';
                } else if (data.em_caso_de_duplicidade == '0') {
                    mensagem = 'Ignorado';
                } else {
                    mensagem = 'Sobrescrito';
                }
                number = parseInt(number);
                number += 1;
                number = number.toString();
                var retornoEmpresaAtc = registroEmpresaAtc.filter((x) => x.UrlJsonContext.site == arrayInfo[line]['Compañia ATC']);
                if (retornoEmpresaAtc.length == 0) {
                    let linha = parseInt(line) + 1;
                    if (equipe == 'COL') {
                        status_erro = '**ERROR Compañia ATC no encontró ' + arrayInfo[line]['Compañia ATC'] + ' | LINHA: ' + String(linha + 1);
                    }
                    break;
                }
                if (atividadesFdtid == sitiosGrid) {
                    var retornoCondado = registroCondado.filter((x) => x.UrlJsonContext.municipio == arrayInfo[line]['Município']);
                    if (retornoCondado.length == 0) {
                        let linha = parseInt(line) + 1;
                        if (equipe == 'COL') {
                            status_erro = '**ERROR Condado no encontró ' + arrayInfo[line]['Município'] + ' | LINHA: ' + String(linha + 1);
                        }
                        break;
                    }
                }
                if (atividadesFdtid == sitiosGrid) {
                    var retornoEstatusSitio = registroStatusSites.filter((x) => x.UrlJsonContext.status == arrayInfo[line]['Estatus del Sítio']);
                    if (retornoEstatusSitio.length == 0) {
                        let linha = parseInt(line) + 1;
                        if (equipe == 'COL') {
                            status_erro = '**ERROR Estatus del Sítio no encontró ' + arrayInfo[line]['Estatus del Sítio'] + ' | LINHA: ' + String(linha + 1);
                        }
                        break;
                    }
                }
                if (atividadesFdtid == sitiosGrid) {
                    var retornoPortafolio = registroPortfolio.filter((x) => x.UrlJsonContext.tipo_portifolio == arrayInfo[line]['Portafolio']);
                    if (retornoPortafolio.length == 0) {
                        let linha = parseInt(line) + 1;
                        if (equipe == 'COL') {
                            status_erro = '**ERROR Portafolio no encontró ' + arrayInfo[line]['Portafolio'] + ' | LINHA: ' + String(linha + 1);
                        }
                        break;
                    }
                }
                if (atividadesFdtid == sitiosGrid) {
                    var retornoSujeitoPasivoAp = registrosujeitoPassivoAp.filter((x) => x.UrlJsonContext.sujeito == arrayInfo[line]['Sujeito Pasivo/AP']);
                    if (retornoSujeitoPasivoAp.length == 0) {
                        let linha = parseInt(line) + 1;
                        if ((equipe = 'COL')) {
                            status_erro = '**ERROR Sujeto Pasivo/AP no encontró ' + arrayInfo[line]['Sujeito Pasivo/AP'] + ' | LINHA: ' + String(linha + 1);
                        }
                        break;
                    }
                }
                if (atividadesFdtid == sitiosGrid) {
                    var retornoProvedor = registroProvedor.filter((x) => x.UrlJsonContext.nome_provedor == arrayInfo[line]['Provedor']);
                    if (retornoProvedor.length == 0) {
                        let linha = parseInt(line) + 1;
                        if ((equipe = 'COL')) {
                            status_erro = '**ERROR Provedor no encontró ' + arrayInfo[line]['Provedor'] + ' | LINHA: ' + String(linha + 1);
                        }
                        break;
                    }
                }
                objItem.asset_number = arrayInfo[line]['Asset Number'] ? arrayInfo[line]['Asset Number'] : ''; // Chave Única
                objItem.site_name = arrayInfo[line].site_name ? arrayInfo[line].site_name : '';
                objItem.emp_atc_site__empresa_atc = retornoEmpresaAtc[0] ? retornoEmpresaAtc[0].UrlJsonContext.site : ' ';
                objItem.emp_atc_empresa_atc_id = retornoEmpresaAtc[0] ? retornoEmpresaAtc[0].ID : ' ';
                objItem.loca_cida_municipio = retornoCondado[0] ? retornoCondado[0].UrlJsonContext.municipio : ' ';
                objItem.loca_cida_id = retornoCondado[0] ? retornoCondado[0].ID : ' ';
                objItem.loca_cida_loca_uf_sigla_estado__uf = retornoCondado[0] ? retornoCondado[0].UrlJsonContext.loca_uf_uf : ' ';
                objItem.loca_uf_id = retornoCondado[0] ? retornoCondado[0].ID : ' ';
                objItem.STAstatus__status_do_site = retornoEstatusSitio[0] ? retornoEstatusSitio[0].UrlJsonContext.status : ' ';
                objItem.STAstatus_do_site_id = retornoEstatusSitio[0] ? retornoEstatusSitio[0].ID : ' ';
                objItem.tppf_tipo_portifolio__portfolio = retornoPortafolio[0] ? retornoPortafolio[0].UrlJsonContext.tipo_portifolio : ' ';
                objItem.tppf_portfolio_id = retornoPortafolio[0] ? retornoPortafolio[0].ID : ' ';
                objItem.SUJPAsujeito__sujeito_passivoap = retornoSujeitoPasivoAp[0] ? retornoSujeitoPasivoAp[0].UrlJsonContext.sujeito : ' ';
                objItem.SUJPAsujeito_passivoap_id = retornoSujeitoPasivoAp[0] ? retornoSujeitoPasivoAp[0].ID : ' ';
                objItem.prvd_nome_provedor = retornoProvedor[0] ? retornoProvedor[0].UrlJsonContext.nome_provedor : ' ';
                prvd_id_provedor_id = retornoProvedor[0] ? retornoProvedor[0].ID : ' ';
                objItem.logradouro = arrayInfo[line]['Direccion'] ? arrayInfo[line]['Direccion'] : '';
                objItem.profit_cost_center = arrayInfo[line]['Profit Cost Center'] ? arrayInfo[line]['Profit Cost Center'] : '';
                objItem.site_name = arrayInfo[line]['Nombre del Sitio'] ? arrayInfo[line]['Nombre del Sitio'] : '';
                if (mensagem == 'Adicionado' || mensagem == 'Sobrescrito') {
                    let salvarRegistro = await sendItemToOnergy(sitiosGrid, data.usrid, data.assid, objItem, null, 'asset_number', true, data);
                }
                let dataHoje = new Date();
                let dataHojeFormat = dataHoje.getFullYear() + '-' + (dataHoje.getMonth() + 1) + '-' + dataHoje.getDate();
                let arrayIn = dataHojeFormat.split('-');
                let dtFormat = arrayIn[2].padStart(2, '0') + '/' + arrayIn[1].padStart(2, '0') + '/' + arrayIn[0];
                let elemento = 'Adicionado';
                var idx = data.processo.indexOf(elemento);
                if (!data.processo || (mensagem == 'Sobrescrito' && validadorS == false)) {
                    validadorS = true;
                    let email = data.email ? data.email : data.onergy_js_ctx.email;
                    data.processo = 'Usuario: ' + email + ', ' + dtFormat + ', ' + data.horas + '\n' + number + ' - ' + arrayInfo[line]['Asset Number'] + ' - ' + mensagem;
                } else {
                    data.processo = data.processo + '\n' + number + ' - ' + arrayInfo[line]['Asset Number'] + ' - ' + mensagem;
                }
            }
            //*ABA TIPO DE SERVIÇOS
            if (atividadesFdtid == tipoDeServicosGrid) {
                let duplicadorTiodeServiço = gridDestino.filter((x) => x.UrlJsonContext.tipo_de_servicos == arrayInfo[line].tipo_de_servico);
                if (duplicadorTiodeServiço.length == 0 || data.em_caso_de_duplicidade == '1') {
                    objItem.tipo_de_servicos = arrayInfo[line].tipo_de_servico;
                    objItem.descricao = arrayInfo[line].descricao;
                    let salvarRegistro = await sendItemToOnergy(tipoDeServicosGrid, data.usrid, data.assid, objItem, null, 'tipo_de_servicos', true, data);
                }
            }
            //*ABA RESPONSÁVEL SERVIÇOS
            if (atividadesFdtid == responsavelServicosGrid) {
                let duplicadorResponsavel = gridDestino.filter((x) => x.UrlJsonContext.responsavel_de_servicos == arrayInfo[line].responsavel_servico);
                if (duplicadorResponsavel.length == 0) {
                    objItem.responsavel_de_servicos = arrayInfo[line].responsavel_servico;
                    arrSaveA.push(objItem);
                }
            }
            //*ABA ATIVIDADE DE LIGAÇÃO
            if (atividadesFdtid == atividadeLigacaoGrid) {
                let duplicadorAtvidade = gridDestino.filter((x) => x.UrlJsonContext.atividade_de_ligacao == arrayInfo[line].atividade_ligacao);
                if (duplicadorAtvidade.length == 0) {
                    objItem.atividade_de_ligacao = arrayInfo[line].atividade_ligacao;
                    arrSaveA.push(objItem);
                }
            }
            //*ABA FORNECEDOR PROVISÓRIO
            if (atividadesFdtid == fornecedorProvisorioGrid) {
                let duplicadorForncedor = gridDestino.filter((x) => x.UrlJsonContext.fornecedor_provisorio == arrayInfo[line].fornecedor_provisorio);
                if (duplicadorForncedor.length == 0) {
                    objItem.fornecedor_provisorio = arrayInfo[line].fornecedor_provisorio;
                    arrSaveA.push(objItem);
                }
            }
            //*ABA FORNCEDOR OBRA
            if (atividadesFdtid == fornecedorObraGrid) {
                let duplicadorObra = gridDestino.filter((x) => x.UrlJsonContext.forncedor_de_obra == arrayInfo[line].fornecedor_obra);
                if (duplicadorObra.length == 0) {
                    objItem.forncedor_de_obra = arrayInfo[line].fornecedor_obra;
                    arrSaveA.push(objItem);
                }
            }
            //*ABA CONTRATANTE ENERGIA
            if (atividadesFdtid == contratanteEnergiaGrid) {
                let duplicadorContratante = gridDestino.filter((x) => x.UrlJsonContext.contratante_de_energia == arrayInfo[line].contratante_energia);
                if (duplicadorContratante.length == 0) {
                    objItem.contratante_de_energia = arrayInfo[line].contratante_energia;
                    arrSaveA.push(objItem);
                }
            }
            //*ABA PM RESPONSÁVEL
            if (atividadesFdtid == pmResponsavelGrid) {
                let duplicadorPm = gridDestino.filter((x) => x.UrlJsonContext.pm_responsavel == arrayInfo[line].pm_responsavel);
                if (duplicadorPm.length == 0) {
                    objItem.pm_responsavel = arrayInfo[line].pm_responsavel;
                    arrSaveA.push(objItem);
                }
            }
            //*ABA STATUS PROCESSO
            if (atividadesFdtid == statusProcessoGrid) {
                let duplicadorProcesso = gridDestino.filter((x) => x.UrlJsonContext.status_do_processo == arrayInfo[line].status_processo);
                if (duplicadorProcesso.length == 0) {
                    objItem.status_do_processo = arrayInfo[line].status_processo;
                    arrSaveA.push(objItem);
                }
            }
            //*ABA OFENSOR
            if (atividadesFdtid == ofensorGrid) {
                let duplicadorOfensor = gridDestino.filter((x) => x.UrlJsonContext.ofensor == arrayInfo[line].ofensor);
                if (duplicadorOfensor.length == 0 || data.em_caso_de_duplicidade == '1') {
                    objItem.ofensor = arrayInfo[line].ofensor;
                    objItem.descricao = arrayInfo[line].descricao;
                    let salvarRegistro = await sendItemToOnergy(ofensorGrid, data.usrid, data.assid, objItem, null, 'ofensor', true, data);
                }
            }
            //*ABA MEDIDORES
            if (atividadesFdtid == medidoresGrid) {
                let newData = arrayInfo[line]['Data Ligação'];
                let dataLiga;
                if (newData !== undefined) {
                    let result = newData.replace('Z', '');
                    dataLiga = new Date(result);
                    dataLiga = dataLiga.getFullYear() + '-' + (dataLiga.getMonth() + 1).toString().padStart(2, 0) + '-' + dataLiga.getDate(null).toString().padStart(2, 0) + ' 00:00:00';
                } else {
                    dataLiga = undefined;
                }
                let newDataPro = arrayInfo[line]['Data Protocolo'];
                let dataPro;
                if (newDataPro !== undefined) {
                    let resultPro = newDataPro.replace('Z', '');
                    dataPro = new Date(resultPro);
                    dataPro = dataPro.getFullYear() + '-' + (dataPro.getMonth() + 1).toString().padStart(2, 0) + '-' + dataPro.getDate().toString().padStart(2, 0) + ' 00:00:00';
                } else {
                    dataPro = undefined;
                }
                let newDataCadas = arrayInfo[line]['Data Conf. Cadastral'];
                let dataCadas;
                if (newDataCadas !== undefined) {
                    let resultCadas = newDataCadas.replace('Z', '');
                    dataCadas = new Date(resultCadas);
                    dataCadas = dataCadas.getFullYear() + '-' + (dataCadas.getMonth() + 1).toString().padStart(2, 0) + '-' + dataCadas.getDate().toString().padStart(2, 0) + ' 00:00:00';
                } else {
                    dataCadas !== undefined;
                }
                let newDataConf = arrayInfo[line]['Data Conf. D.A.'];
                let dataConf;
                if (newDataConf !== undefined) {
                    let resultConf = newDataConf.replace('Z', '');
                    dataConf = new Date(resultConf);
                    dataConf = dataConf.getFullYear() + '-' + (dataConf.getMonth() + 1).toString().padStart(2, 0) + '-' + dataConf.getDate().toString().padStart(2, 0) + ' 00:00:00';
                } else {
                    dataConf = undefined;
                }
                let pagamento = arrayInfo[line]['Rot. Pagamento'];
                let emDa = arrayInfo[line]['Em D.A.'];
                let agrupadaBra = arrayInfo[line]['Agrupada'];
                let verifica00 = pagamento == 'TRUE' ? '1' : ' ';
                let verifica01 = emDa == 'TRUE' ? '1' : ' ';
                let verifica02 = agrupadaBra == 'TRUE' ? '1' : ' ';
                let arr00 = [];
                let arr01 = [];
                let arr02 = [];
                arr00.push(verifica00);
                arr01.push(verifica01);
                arr02.push(verifica02);
                var retornoStatusMedidor = registroStatusMedidor.filter((x) => x.UrlJsonContext.status_medidor == arrayInfo[line]['Status Medidor']);
                if (retornoStatusMedidor.length == 0) {
                    let linha = parseInt(line + 1);
                    if (equipe == 'BRA') {
                        status_erro = ' **ERROR Status Medidor não encontratado ' + arrayInfo[line]['Status Medidor'] + ' | LINHA: ' + String(linha + 1);
                    }
                    break;
                }
                if (atividadesFdtid == medidoresGrid) {
                    var retornoStatusConferencia = registroStatusConferencia.filter((x) => x.UrlJsonContext.status_conferencia == arrayInfo[line]['Status Conferência']);
                    if (retornoStatusConferencia.length == 0) {
                        let linha = parseInt(line + 1);
                        if (equipe == 'BRA') {
                            status_erro = '** ERROR Status Conferência não encontrado ' + arrayInfo[line]['Status Conferência'] + ' | LINHA: ' + String(linha + 1);
                        }
                        break;
                    }
                }
                if (atividadesFdtid == medidoresGrid) {
                    var retornoOperadores = registroClienteOpe.filter((x) => x.UrlJsonContext.nome_fantasia == arrayInfo[line]['Operadora']);
                    if (retornoOperadores.length == 0) {
                        let linha = parseInt(line + 1);
                        if (equipe == 'BRA') {
                            status_erro = '** ERROR Operados não encontrado ' + arrayInfo[line]['Operadora'] + ' | LINHA: ' + String(linha + 1);
                        }
                        break;
                    }
                }
                objItem.clie_nome_fantasia__operadora = retornoOperadores[0] ? retornoOperadores[0].UrlJsonContext.nome_fantasia : '';
                objItem.clie_codigo_cliente = retornoOperadores[0] ? retornoOperadores[0].UrlJsonContext.codigo_cliente : '';
                objItem.clie_operadora_id = retornoOperadores[0] ? retornoOperadores[0].ID : '';
                objItem.id_operadora = arrayInfo[line]['ID Operadora'] ? arrayInfo[line]['ID Operadora'] : '';
                objItem.data_protocolo = dataPro !== undefined ? dataPro : '';
                objItem.no_protocolo = arrayInfo[line]['No. Protocolo'] ? arrayInfo[line]['No. Protocolo'] : '';
                objItem.data_ligacao = dataLiga !== undefined ? dataLiga : '';
                objItem.no_medidor = arrayInfo[line]['No. Medidor'] ? arrayInfo[line]['No. Medidor'].toString() : ' '; // Chave Unica
                objItem.no_instalacao__uc = arrayInfo[line]['No. Instalação - UC'] ? arrayInfo[line]['No. Instalação - UC'] : '';
                objItem.STAMEstatus_medidor = retornoStatusMedidor[0] ? retornoStatusMedidor[0].UrlJsonContext.status_medidor : '';
                objItem.STAMEid = retornoStatusMedidor[0] ? retornoStatusMedidor[0].ID : '';
                objItem.data_conf_da = dataConf !== undefined ? dataConf : '';
                objItem.STACONFstatus_conferencia = retornoStatusConferencia[0] ? retornoStatusConferencia[0].UrlJsonContext.status_conferencia : ' ';
                objItem.STACONFid = retornoStatusConferencia[0] ? retornoStatusConferencia[0].ID : ' ';
                objItem.codigo_inc_da = arrayInfo[line]['Código Inc. D.A.'] ? arrayInfo[line]['Código Inc. D.A.'] : '';
                objItem.data_conf_cadastral = dataCadas !== undefined ? dataCadas : '';
                objItem.endereco = arrayInfo[line]['Endereço'] ? arrayInfo[line]['Endereço'] : '';
                objItem.rot_pagamento = arr00;
                objItem.em_da = arr01;
                objItem.agrupada = arr02;
                objItem.asset_number = arrayInfo[line]['CMS'].toString();
                let salvarRegistro = await sendItemToOnergy(medidoresGrid, data.usrid, data.assid, objItem, null, 'no_medidor', true, data);
            }
            //*ABA INFORMACION TECNICA
            if (atividadesFdtid == informacionTecnica) {
                let gerador = arrayInfo[line]['Motogenerador'];
                let medidorInde = arrayInfo[line]['Tablero Independente'];
                let bateria = arrayInfo[line]['Barter'];
                let provisoria = arrayInfo[line]['Provisional'];
                let verifica00 = gerador == 'SI' ? '1' : ' ';
                let verifica01 = medidorInde == 'SI' ? '1' : ' ';
                let verifica02 = bateria == 'SI' ? '1' : ' ';
                let verifica03 = provisoria == 'SI' ? '1' : ' ';
                let arr00 = [];
                let arr01 = [];
                let arr02 = [];
                let arr03 = [];
                arr00.push(verifica00);
                arr01.push(verifica01);
                arr02.push(verifica02);
                arr03.push(verifica03);
                var retornoCategoria = registroCategorias.filter((x) => x.UrlJsonContext.categorias == arrayInfo[line]['Categoria']);
                if (retornoCategoria.length == 0) {
                    let linha = parseInt(line) + 1;
                    if (equipe == 'COL') {
                        status_erro = '**ERROR Categoria no encontró ' + arrayInfo[line]['Categoria'] + ' | LINHA: ' + String(linha + 1);
                    }
                    break;
                }
                if (atividadesFdtid == informacionTecnica) {
                    var retornoLeitura = registroLeitura.filter((x) => x.UrlJsonContext.ferramentas == arrayInfo[line]['Lectura ATC']);
                    if (retornoLeitura.length == 0) {
                        let linha = parseInt(line) + 1;
                        if (equipe == 'COL') {
                            status_erro = '** ERROR Lectura ATC no encontró ' + arrayInfo[line]['Lectura ATC'] + '| LINHA ' + String(linha + 1);
                        }
                        break;
                    }
                }
                var retornoCam = registroCam.filter((x) => x.UrlJsonContext.asset_number == arrayInfo[line]['Asset Number']);
                if (retornoCam.length == 0) {
                    if (equipe == 'COL') {
                        status_erro = '**ERROR Asset Number no encontró ' + arrayInfo[line]['Asset Number'];
                    }
                } else {
                    objItem.ID_ONE_REF = retornoCam[0].ID;
                }
                objItem.asset_number = arrayInfo[line]['Asset Number'] ? arrayInfo[line]['Asset Number'] : '';
                objItem.ctgr_categorias__categoria = retornoCategoria[0] ? retornoCategoria[0].UrlJsonContext.categorias : '';
                objItem.ctgr_categoria_id = retornoCategoria[0] ? retornoCategoria[0].ID : '';
                objItem.no_medidor = arrayInfo[line]['Serial del Medidor'] ? arrayInfo[line]['Serial del Medidor'] : '';
                objItem.tensao = arrayInfo[line]['Nível de Tensión'] ? arrayInfo[line]['Nível de Tensión'] : '';
                objItem.Leituferramentas__leitura_atc = retornoLeitura[0] ? retornoLeitura[0].UrlJsonContext.ferramentas : '';
                objItem.Leituleitura_atc_id = retornoLeitura[0] ? retornoLeitura[0].ID : '';
                objItem.gerador = arr00;
                objItem.medidor_independente = arr01;
                objItem.bateria = arr02;
                objItem.provisoria = arr03;
                let salvarRegistro = await sendItemToOnergy(informacionTecnica, data.usrid, data.assid, objItem, null, 'asset_number', true, data);
            }
            //!ABA INFORMACION CUENTA
            if (atividadesFdtid == informacionCuenta) {
                let gerador = arrayInfo[line]['Motogenerador'];
                let medidorInde = arrayInfo[line]['Tablero Independente'];
                let bateria = arrayInfo[line]['Barter'];
                let provisoria = arrayInfo[line]['Provisional'];
                let verifica00 = gerador == 'SI' ? '1' : ' ';
                let verifica01 = medidorInde == 'SI' ? '1' : ' ';
                let verifica02 = bateria == 'SI' ? '1' : ' ';
                let verifica03 = provisoria == 'SI' ? '1' : ' ';
                let arr00 = [];
                let arr01 = [];
                let arr02 = [];
                let arr03 = [];
                arr00.push(verifica00);
                arr01.push(verifica01);
                arr02.push(verifica02);
                arr03.push(verifica03);
                var retornoStatusConta = registroStatusConta.filter((x) => x.UrlJsonContext.status_conta == arrayInfo[line]['Estatus de Cuenta']);
                if (retornoStatusConta.length == 0) {
                    let linha = parseInt(line) + 1;
                    if (equipe == 'COL') {
                        status_erro = '**ERROR Estatus de Cuenta no encontró ' + arrayInfo[line]['Estatus de Cuenta'] + ' | LINHA: ' + String(linha + 1);
                    }
                    break;
                }
                if (atividadesFdtid == informacionCuenta) {
                    var retornoProvedor = registroProvedor.filter((x) => x.UrlJsonContext.nome_provedor == arrayInfo[line]['Beneficiario']);
                    if (retornoProvedor.length == 0) {
                        let linha = parseInt(line) + 1;
                        if (equipe == 'COL') {
                            status_erro = '**ERROR Provedor no encontró ' + arrayInfo[line]['Beneficiario'] + '| LINHA: ' + String(linha + 1);
                        }
                        break;
                    }
                }
                if (atividadesFdtid == informacionCuenta) {
                    var retornoServicos = registroServicos.filter((x) => x.UrlJsonContext.servicos == arrayInfo[line]['Servicio']);
                    if (retornoServicos.length == 0) {
                        let linha = parent(line) + 1;
                        if (equipe == 'COL') {
                            status_erro = '**ERROR Servicio no encontró ' + arrayInfo[line]['Servicio'] + '| LINHA: ' + String(linha + 1);
                        }
                        break;
                    }
                }
                if (atividadesFdtid == informacionCuenta) {
                    var retornoFormaPagamento = registroFormaPagamento.filter((x) => x.UrlJsonContext.formas_de_pagamentos == arrayInfo[line]['Forma de Pago']);
                    if (retornoFormaPagamento.length == 0) {
                        let linha = parseInt(line) + 1;
                        if (equipe == 'COL') {
                            status_erro = '**ERROR Forma de Pago no encontró ' + arrayInfo[line]['Forma de Pago'] + '| LINHA: ' + String(linha + 1);
                        }
                        break;
                    }
                }
                if (atividadesFdtid == informacionCuenta) {
                    var retornoFrequenciaPag = registroFrequenciaPag.filter((x) => x.UrlJsonContext.frequencia == arrayInfo[line]['Frequencia de Pago']);
                    if (retornoFrequenciaPag.length == 0) {
                        let linha = parseInt(line) + 1;
                        if (equipe == 'COL') {
                            status_erro = '**ERROR Frecuencia de Pago no encontró ' + arrayInfo['Frequencia de Pago'] + '| LINHA: ' + String(linha + 1);
                        }
                        break;
                    }
                }
                // if (atividadesFdtid == informacionCuenta) {
                //     var retornoLeitura = registroLeitura.filter(x => x.UrlJsonContext.ferramentas == arrayInfo[line]['Lectura ATC']);
                //     if (retornoLeitura.length == 0) {
                //         let linha = parseInt(line) + 1;
                //         if (equipe == "COL") {
                //             status_erro = "** ERROR Lectura ATC no encontró " + arrayInfo[line]['Lectura ATC'] + "| LINHA " + String(linha + 1);
                //         }
                //         break;
                //     }
                // }
                var retornoCam = registroCam.filter((x) => x.UrlJsonContext.asset_number == arrayInfo[line]['Asset Number']);
                if (retornoCam.length == 0) {
                    let linha = parseInt(line) + 1;
                    if (equipe == 'COL') {
                        status_erro = '**ERROR Asset Number no encontró ' + arrayInfo[line]['Asset Number'] + '| LINHA: ' + String(linha + 1);
                    }
                } else {
                    objItem.ID_ONE_REF = retornoCam[0].ID;
                }
                objItem.asset_number = arrayInfo[line]['Asset Number'] ? arrayInfo[line]['Asset Number'] : '';
                objItem.profit_cost_center = arrayInfo[line]['Profit Cost Center'] ? arrayInfo[line]['Profit Cost Center'] : '';
                objItem.STACONstatus_conta = retornoStatusConta[0] ? retornoStatusConta[0].UrlJsonContext.status_conta : '';
                objItem.STACONid = retornoStatusConta[0] ? retornoStatusConta[0].ID : '';
                objItem.assinante = arrayInfo[line]['Subscriptor'] ? arrayInfo[line]['Subscriptor'] : '';
                objItem.prvd_nome_provedor__provedor = retornoProvedor[0] ? retornoProvedor[0].UrlJsonContext.nome_provedor : '';
                objItem.prvd_provedor_id = retornoProvedor[0] ? retornoProvedor[0].ID : '';
                objItem.prvd_nit_provedor = arrayInfo[line]['Beneficiario ID'] ? arrayInfo[line]['Beneficiario ID'].toString() : '';
                objItem.SERVservicos__servico = retornoServicos[0] ? retornoServicos[0].UrlJsonContext.servicos : '';
                objItem.SERVservico_id = retornoServicos[0] ? retornoServicos[0].ID : '';
                objItem.FORPAGformas_de_pagamentos__forma_de_pagamento = retornoFormaPagamento[0] ? retornoFormaPagamento[0].UrlJsonContext.formas_de_pagamentos : '';
                objItem.FORPAGforma_de_pagamento_id = retornoFormaPagamento[0] ? retornoFormaPagamento[0].ID : '';
                objItem.fre_pag_frequencia__frequencia_de_pagamento = retornoFrequenciaPag[0] ? retornoFrequenciaPag[0].UrlJsonContext.frequencia : '';
                objItem.fre_pag_frequencia_de_pagamento_id = retornoFormaPagamento[0] ? retornoFormaPagamento[0].ID : '';
                objItem.prvd_beneficiario = arrayInfo[line]['Beneficiario'] ? arrayInfo[line]['Beneficiario'] : '';
                objItem.prvd_nit_beneficiario = arrayInfo[line]['Beneficiario ID'] ? arrayInfo[line]['Beneficiario ID'].toString() : '';
                objItem.conta_interna_nic = arrayInfo[line]['Cuenta Interna (NIC)'] ? arrayInfo[line]['Cuenta Interna (NIC)'].toString() : '';
                objItem.conta_especial = arrayInfo[line]['Cuenta Especial'] ? arrayInfo[line]['Cuenta Especial'] : '';
                objItem.no_medidor = arrayInfo[line]['Serial del Medidor'] ? arrayInfo[line]['Serial del Medidor'].toString() : ''; // Chave Unica
                objItem.tensao = arrayInfo[line]['Nível de Tensión'] ? arrayInfo[line]['Nível de Tensión'] : '';
                objItem.gerador = arr00;
                objItem.medidor_independente = arr01;
                objItem.bateria = arr02;
                objItem.provisoria = arr03;
                // objItem.Leituferramentas__leitura_atc = retornoLeitura[0] ? retornoLeitura[0].UrlJsonContext.ferramentas : "";
                // let objItem1 = {
                //     asset_number: "158014",
                //     test: "test",
                //     ID_ONE_REF: "08ecf7cf-77fe-4621-ab90-2dbf02d22af1",
                // };
                let salvarRegistro = await sendItemToOnergy(informacionCuenta, data.usrid, data.assid, objItem, null, 'asset_number', true, data);
                // let onergySaveData = {
                //     fdtid: "21672360-869c-4c29-8cf8-2bafa8530923",
                //     assid: data.assid,
                //     usrid: data.usrid,
                //     data: JSON.stringify(objItem1)
                // }
                // await onergy_save(onergySaveData);
                debugger;
            }
            //*ABA CARGA ÍNDICE
            if (atividadesFdtid == cargaIndice) {
                let duplicadorCarga = gridDestino.filter((x) => x.UrlJsonContext.id_do_card == arrayInfo[line].id_card);
                if (duplicadorCarga.length == 0 || data.em_caso_de_duplicidade == '1') {
                    objItem.tab_excel = arrayInfo[line].nome_aba;
                    objItem.id_do_card = arrayInfo[line].id_card;
                    let salvarRegistro = await sendItemToOnergy(cargaIndice, data.usrid, data.assid, objItem, null, 'tab_excel', true, data);
                }
            }
        }
    }
    if (
        atividadesFdtid !== '6ba0e15e-7c5f-400c-a77f-3ce8f808a408' &&
        atividadesFdtid !== 'e43b9fe0-6752-446d-8495-0b4fdd7a70b4' &&
        atividadesFdtid !== 'da6270f1-f6e9-47e2-a44f-45f53a91f310' &&
        atividadesFdtid !== 'a0f4f4fd-64a6-4db5-bf57-723048226b80' &&
        atividadesFdtid !== '51fc0848-279d-4fd5-86d9-4039f6240399' &&
        atividadesFdtid !== '21672360-869c-4c29-8cf8-2bafa8530923' &&
        atividadesFdtid != '4783ca0b-357d-42ab-a5c8-3328ee315f86' &&
        atividadesFdtid !== '9a6e262f-e463-4c5d-9d8b-0fd8343b2f02' &&
        atividadesFdtid !== '4aee802e-d63d-42df-b198-d7b1a8b0b051'
    ) {
        if (arrSaveA !== null && arrSaveA.length > 0) {
            onergy.InsertManyOnergy(arrSaveA, atividadesFdtid, data.usrid);
        } else {
            status_desc = 'ERRO, PLANILHA INDEFINIDA ';
        }
    }
    if (status_erro == '') {
        //onergy.Log(atividadesFdtid, "ID");
        status_desc = 'Concluido';
    }
    if (status_erro !== '') {
        status_desc = status_erro;
    }
    let postInfo = {
        UrlJsonContext: {
            processamento: status_desc,
            processo: data.processo,
        },
    };

    let strFiltro = JSON.stringify([{ FielName: '_id', Type: 'string', FixedType: 'string', Value1: data.id_upload_planilha }]);

    onergy_updatemany({
        fdtid: '181c67a8-e7a9-4c9a-9ea1-ca4719c0e23f', //id do card  que recebe a planilha
        assid: data.onergy_js_ctx.assid,
        usrid: data.onergy_js_ctx.usrid,
        data: JSON.stringify(postInfo),
        filter: strFiltro,
    });

    // PADRÃO DO ONERGY
    return SetObjectResponse(true, data, true);
    // return true;
}

function initBefore(json) {
    //return true;
}

function initDelete(json) {
    //return true;
}

function sendItemToOnergy(templateid, usrid, assid, data, fedid, ukField, checkTemplateDuplicate, data_a) {
    let onergySaveData = {
        fdtid: templateid,
        assid: assid,
        usrid: usrid,
        data: JSON.stringify(data),
        //executeAction: false
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
    return onergy_save(onergySaveData);
}

function SetObjectResponse(cond, json, WaitingWebHook) {
    if (WaitingWebHook === undefined) WaitingWebHook = false;
    var obj = {
        cond: cond,
        json: JSON.stringify(json),
        WaitingWebHook: WaitingWebHook,
    };
    return obj;
}

function getOnergyItem(fdtid, assid, usrid, filtro) {
    let keepSearching = true;
    let skip = 0;
    take = 500;
    let result = [];
    while (keepSearching) {
        let strPageResp = onergy_get({
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

function init(json) {
    var data = JSON.parse(json);

    //return true;
    //return SetObjectResponse(true, data, true);
}
function initBefore(json) {
    //return true;
}
function initDelete(json) {
    //return true;
}
function SetObjectResponse(cond, json, WaitingWebHook) {
    if (WaitingWebHook === undefined) WaitingWebHook = false;

    var obj = {
        cond: cond,
        json: JSON.stringify(json),
        WaitingWebHook: WaitingWebHook,
    };
    return obj;
}

//!METODOS PADRAO ===
const json = {};
init(JSON.stringify(json));
