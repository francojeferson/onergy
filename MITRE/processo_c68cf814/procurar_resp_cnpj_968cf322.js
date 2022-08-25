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
    const r = await onergy.onergy_sendto(args);
    return JSON.stringify(r);
}
async function onergy_updatemany(args) {
    return await onergy.onergy_save(args);
}
function successCallback(result) {
    console.log('It succeeded with ' + result);
}

//!SCRIPT ===
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
        if (pageResp !== null && pageResp.length > 0) {
            keepSearching = pageResp.length === take;
            result = result.concat(pageResp);
        } else {
            keepSearching = false;
        }
    }
    return result;
}

async function sendItemToOnergy(templateid, usrid, assid, data, fedid, ukField, checkTemplateDuplicate, addCfgViewGroup) {
    let onergySaveData = {
        fdtid: templateid,
        assid: assid,
        usrid: usrid,
        data: JSON.stringify(data),
        //executeAction: false
    };
    if (fedid !== undefined && fedid !== '') {
        onergySaveData.id = fedid;
    }
    if (ukField !== undefined && ukField !== '') {
        onergySaveData.ukField = ukField;
        onergySaveData.blockDuplicate = true;
    }
    if (checkTemplateDuplicate !== undefined && checkTemplateDuplicate !== '') {
        onergySaveData.checkTemplateDuplicate = true;
    }
    if (addCfgViewGroup !== undefined && addCfgViewGroup.length > 0) {
        onergySaveData.addCfgViewGroup = addCfgViewGroup;
    }
    return await onergy_save(onergySaveData);
}

async function sendToOnergy(oldFdt, newFdt, assid, usrid, fedid) {
    let param = {
        assid: assid,
        usrid: usrid,
        fdtid: oldFdt,
        newfdtid: newFdt,
        resetFdtData: true,
        fedid: fedid,
        resetPrc: true,
    };
    await onergy_sendto(param);
}

let valid_comercial = null;
let valid_comercial_desc = null;
let valid_fiscal = null;
let valid_fiscal_desc = null;

function getJsCtx(data, foo) {
    let jsCtx = data.onergy_js_ctx`${foo}`;
    if (jsCtx === undefined) {
        jsCtx = data`${foo}`;
    }
    return jsCtx;
}

function getFilter(fielNameP, valueP) {
    const result = JSON.stringify([
        {
            FielName: fielNameP,
            Type: `${typeof valueP === 'number' ? 'Numeric' : 'string'}`,
            FixedType: `${typeof valueP === 'number' ? 'Numeric' : 'string'}`,
            Value1: valueP,
        },
    ]);
    return result;
}

const fdtConfSis_Configuracoes = 'efb11b9d-58d7-45fb-a8cd-d0ffbc707d0f';
async function getConfig(data, key) {
    //* ConfiguracoesSistemicas -> Configuracoes
    let filConfiguracoes = getFilter('chave', key);
    let itemConfiguracoes = await getOnergyItem(fdtConfSis_Configuracoes, getJsCtx(data, assid), getJsCtx(data, usrid), filConfiguracoes);
    if (itemConfiguracoes !== null && itemConfiguracoes.length > 0) {
        if (data.erp_teste) {
            return data.erp_teste;
        }
        return itemConfiguracoes[0].UrlJsonContext.valor;
    } else return null;
}

const fdtCompartliharDoctosParaValidacaoDeDuplicados = '8a7b4e11-0afb-4d61-9baf-a10f01cc1606';
async function validDupliDoc(doc) {
    let tipoDoc = doc.tipo;
    let docCancelada = false;
    let arrFiltro = [{ FielName: 'chaveNfe', Type: 'string', FixedType: 'string', Value1: doc.chaveNfe }];
    if (tipoDoc === 'NFE') {
        if (doc.cancelada) {
            docCancelada = true;
        }
    } else if (tipoDoc === 'NFSE') {
        if (doc.dtCancelamento) {
            docCancelada = true;
        }
    } else if (tipoDoc === 'CTE') {
        if (doc.cancelada) {
            docCancelada = true;
        }
    }
    if (docCancelada) {
        arrFiltro.push({
            FielName: 'nota_cancelada',
            Type: 'string',
            FixedType: 'string',
            Value1: 'Sim',
        });
    }
    let strFiltro = JSON.stringify(arrFiltro);
    let itemCompartliharDoctosParaValidacaoDeDuplicados = await getOnergyItem(
        fdtCompartliharDoctosParaValidacaoDeDuplicados,
        getJsCtx(doc, assid),
        getJsCtx(doc, usrid),
        strFiltro
    );
    let itemDocDupli = itemCompartliharDoctosParaValidacaoDeDuplicados;
    let deleteReg = false;
    if (itemDocDupli !== null && itemDocDupli.length > 0) {
        let regDupli = itemDocDupli.find((x) => x.ID !== getJsCtx(doc, fedid));

        //* se registro atual tiver
        //* mesmo ID do registro
        //* encontrado na busca:
        //* sao o mesmo registro e
        //* processo segue normalmente.
        if (!regDupli) {
            deleteReg = false;
        } else {
            //* se encontrar registro
            //* com mesma chave e
            //* possuir ID diferente
            //* do registro atual:
            //* registro atual deve ser
            //* deletado e nao duplica.
            deleteReg = true;
        }
    }

    return deleteReg;
}

const fdtCadGeral_Cfops = 'e62f45dd-2bb7-4870-a4e2-6d81176624fe';
const fdtMonitDoc_Nfe = 'fddf0752-3493-4a2c-a5b7-6a1d73d3abaf';
const fdtDocumentosDeRemessa = '65ee011b-d206-4954-9a57-564cefa07e63';
async function comparaCfop(data) {
    if (data.tipo === 'NFE') {
        let tabelaCFOP = await getOnergyItem(fdtCadGeral_Cfops, getJsCtx(data, assid), getJsCtx(data, usrid), null);
        let itensDaNota = data.conteudo.NFe.infNFe.det;
        let pedidoDireto = true;
        for (let i in itensDaNota) {
            let pedidoDepara = tabelaCFOP.find((x) => {
                return (
                    x.UrlJsonContext.codigo === itensDaNota[i].prod.CFOP &&
                    x.UrlJsonContext.tipo_remessa_desc !== undefined &&
                    x.UrlJsonContext.tipo_remessa_desc === 'Sim'
                );
            });
            if (pedidoDepara === undefined) {
                pedidoDireto = false;
                break;
            }
        }

        //* se CFOP estiver no parametro:
        //* manda nota para grid
        //* Documentos de Remessa.
        if (itensDaNota.length > 0) {
            if (pedidoDireto) {
                await sendToOnergy(fdtMonitDoc_Nfe, fdtDocumentosDeRemessa, getJsCtx(data, assid), getJsCtx(data, usrid), getJsCtx(data, fedid));
                return SetObjectResponse(true, data, true);
                //?return true;
            }
        }
    }
}

const fdtConfSis_ListaErp = '0128ff17-4ea4-4999-afdd-0f671d4df0d0';
async function getItemErp(data, key) {
    let filListaErp = getFilter('erp_type', key);
    let itemListaErp = await getOnergyItem(fdtConfSis_ListaErp, getJsCtx(data, assid), getJsCtx(data, usrid), filListaErp);
    if (itemListaErp !== null && itemListaErp.length > 0) {
        return itemListaErp[0];
    } else return null;
}

const fdtConfSis_ConfigurarValidacoes = '33e92d6e-8d4b-4c85-bb0e-c332c9948b97';
async function getConfigValid(data) {
    let sugest_escri = null;
    let sugest_escri_desc = null;
    let manisfesto = null;
    let manisfesto_desc = null;

    //* valida tipo de configuracao
    //* de validacoes que usuario
    //* deseja receber com base
    //* no tipo de doc no seu ERP.
    let strFiltroConfigValid = JSON.stringify([
        { FielName: 'LDOC_tipo_documento', Type: 'string', FixedType: 'string', Value1: data.tipo },
        { FielName: 'ERP_erp_type', Type: 'string', FixedType: 'string', Value1: data.ERP_erp_type },
    ]);
    let itemConfigurarValidacoes = await getOnergyItem(fdtConfSis_ConfigurarValidacoes, getJsCtx(data, assid), getJsCtx(data, usrid), strFiltroConfigValid);
    if (itemConfigurarValidacoes !== null && itemConfigurarValidacoes.length > 0) {
        valid_comercial = itemConfigurarValidacoes[0].UrlJsonContext.habilitar_validacao_comercial;
        valid_comercial_desc = itemConfigurarValidacoes[0].UrlJsonContext.habilitar_validacao_comercial_desc;
        valid_fiscal = itemConfigurarValidacoes[0].UrlJsonContext.habilitar_validacao_fiscal_taxfy_link;
        valid_fiscal_desc = itemConfigurarValidacoes[0].UrlJsonContext.habilitar_validacao_fiscal_taxfy_link_desc;
        sugest_escri = itemConfigurarValidacoes[0].UrlJsonContext.habilitar_sugestao_escrituracao;
        sugest_escri_desc = itemConfigurarValidacoes[0].UrlJsonContext.habilitar_sugestao_escrituracao_desc;
        manisfesto = itemConfigurarValidacoes[0].UrlJsonContext.habilitar_manifestacao;
        manisfesto_desc = itemConfigurarValidacoes[0].UrlJsonContext.habilitar_manifestacao_desc;
        data.habilitar_validacao_comercial = valid_comercial;
        data.habilitar_validacao_comercial_desc = valid_comercial_desc;
        data.forma_integracao = itemConfigurarValidacoes[0].UrlJsonContext.forma_integracao;
        data.forma_integracao_desc = itemConfigurarValidacoes[0].UrlJsonContext.forma_integracao_desc;
        data.inbox_automatico = itemConfigurarValidacoes[0].UrlJsonContext.inbox_automatico;
        data.inbox_automatico_desc = itemConfigurarValidacoes[0].UrlJsonContext.inbox_automatico_desc;
        data.habilitar_workflow_aprovacao = itemConfigurarValidacoes[0].UrlJsonContext.habilitar_workflow_aprovacao;
        data.habilitar_workflow_aprovacao_desc = itemConfigurarValidacoes[0].UrlJsonContext.habilitar_workflow_aprovacao_desc;

        //* guarda id do registro pai
        //* da tela de configuracoes
        //* para buscar mais informacoes
        //* sobre validacoes comerciais.
        if (valid_comercial === 'Sim') {
            data.id_ref_validacoesComercial = itemConfigurarValidacoes[0].ID;
        }
        data.habilitar_sugestao_escrituracao = sugest_escri;
        data.habilitar_sugestao_escrituracao_desc = sugest_escri_desc;
        data.habilitar_manifestacao = manisfesto;
        data.habilitar_manifestacao_desc = manisfesto_desc;
        if (valid_fiscal === null || valid_fiscal === ' ') {
            valid_fiscal = 'Não';
            valid_fiscal_desc = 'Não';
        }
        data.habilitar_validacao_fiscal_taxfy_link = valid_fiscal;
        data.habilitar_validacao_fiscal_taxfy_link_desc = valid_fiscal_desc;

        //* define tipo de documento
        //* com base na tela de
        //* configuracoes de validacoes
        //* para cada tipo de documento
        //* e seu ERP de tipo
        //* de documentos.
        data.CFD_LDOC_documento__tipo_documento__tipo_documento = itemConfigurarValidacoes[0].UrlJsonContext.LDOC_documento__tipo_documento;
        data.CFD_tipo_documento_id = itemConfigurarValidacoes[0].ID;
        data.habilitar_condicao_pagamento = itemConfigurarValidacoes[0].UrlJsonContext.habilitar_condicao_pagamento;
        data.habilitar_condicao_pagamento_desc = itemConfigurarValidacoes[0].UrlJsonContext.habilitar_condicao_pagamento_desc;
        data.preencher_condicao_pagamento = itemConfigurarValidacoes[0].UrlJsonContext.preencher_condicao_pagamento;
        data.preencher_condicao_pagamento_desc = itemConfigurarValidacoes[0].UrlJsonContext.preencher_condicao_pagamento_desc;
        data.habilitar_btn_validar_registro = itemConfigurarValidacoes[0].UrlJsonContext.habilitar_btn_validar_registro;
        data.habilitar_btn_validar_registro_desc = itemConfigurarValidacoes[0].UrlJsonContext.habilitar_btn_validar_registro_desc;
        if (itemConfigurarValidacoes[0].UrlJsonContext.campo_condicao_pagamento) {
            data.campo_condicao_pagamento = itemConfigurarValidacoes[0].UrlJsonContext.campo_condicao_pagamento;
        }
        return true;
    } else {
        data.habilitar_validacao_comercial = 'Não';
        data.habilitar_validacao_comercial_desc = 'Não';
        return false;
    }
}

function GetStrBrlDate(strDate) {
    let splitted = strDate.split(' ');
    let dateSplit = splitted[0].split('-');
    let finalDate = dateSplit[2] + '/' + dateSplit[1] + '/' + dateSplit[0] + ' ' + splitted[1];
    return finalDate;
}

const fdtCadMitre_Agentes = 'b40fe9aa-2c4b-40e2-bccd-ae37bd881732';
const fdtCadMitre_Filiais = 'd26eb529-f18c-41c0-9f3b-e1b28bd43127';
async function GetRespCNPJ(data, agenteCnpj, filialCnpj) {
    if (agenteCnpj !== null || filialCnpj !== null) {
        //* SOMENTE NUMEROS NA RAIZ
        let agente = agenteCnpj.replace(/\./g, '');
        let filial = filialCnpj.replace(/\./g, '');
        let Group = [];
        let equipeMaster = '81a77957-6e59-4675-a77a-f2c1c1302565'; //TODO id nao encontrado
        let equipeRH = '81993324-2905-47a2-8b45-95fd8fa8704f'; //TODO id nao encontrado
        let equipeAnalista = 'd243a2c1-d115-41f8-9df1-70a5aa0c4090'; //TODO id nao encontrado
        Group.push(equipeMaster);

        //* se CNPJ do agente for RH:
        //* atribuir usuarios que podem visualizar registro.
        let filAgentes = getFilter('cpfcnpj_agente', agente);
        let itemAgentes = await getOnergyItem(fdtCadMitre_Agentes, getJsCtx(data, assid), getJsCtx(data, usrid), filAgentes);
        if (itemAgentes.length > 0) {
            if (itemAgentes[0].UrlJsonContext.cnpj_rh === 'Sim') {
                Group.push(equipeRH);
            } else {
                Group.push(equipeAnalista);

                //* se usuario de perfil visualiza filial:
                //* atribuir para visualizacao
                let filFiliais = getFilter('cpfcnpj_filial', filial);
                let itemFiliais = await getOnergyItem(fdtCadMitre_Filiais, getJsCtx(data, assid), getJsCtx(data, usrid), filFiliais);
                if (itemFiliais.length > 0) {
                    if (
                        itemFiliais[0].UrlJsonContext.usuario_visualizadorProcesso_id &&
                        itemFiliais[0].UrlJsonContext.usuario_visualizadorProcesso_id.length > 0
                    ) {
                        Group.push(itemFiliais[0].UrlJsonContext.usuario_visualizadorProcesso_id[0]);
                    }
                }
            }
            return Group;
        }
        return [];
    }
}

//* extrai numero pedido da NFe/NFSe
function getNumPed(tipoDoc, data, arraySiglas) {
    let resp = null;
    if (tipoDoc === 'nfe' && data.conteudo) {
        let xped = data.conteudo.NFe.infNFe.det[0].prod.xPed;
        if (xped === null || xped === undefined || xped.length < 1) {
            try {
                if (data.conteudo.NFe.infNFe.infAdic.infCpl) {
                    let infCpl = data.conteudo.NFe.infNFe.infAdic.infCpl;
                    if (infCpl !== null && infCpl.length > 0) {
                        let encontrada = false;
                        let palavraFormada = '';
                        for (let i in arraySiglas) {
                            if (encontrada) {
                                break;
                            }
                            let validador = infCpl.indexOf(arraySiglas[i]);
                            if (validador >= 0) {
                                let tSigla = arraySiglas[i].length;
                                let getValor = infCpl.substring(validador);
                                resp = getValor.substring(tSigla, getValor.indexOf(' '));
                                if (resp.indexOf(';') !== -1) {
                                    resp = resp.substring(0, resp.indexOf(';'));
                                }
                                if (resp.indexOf(',') !== -1) {
                                    resp = resp.substring(0, resp.indexOf(','));
                                }
                                if (resp.indexOf(':') !== -1) {
                                    resp = resp.substring(0, resp.indexOf(':'));
                                }
                                if (resp.indexOf(']') !== -1) {
                                    resp = resp.substring(0, resp.indexOf(']'));
                                }
                                resp = resp.replace('[', '').replace(']', '');
                                resp = resp.replace(/^(0+)(\d)/g, '$2');
                                break;
                            }
                        }
                    }
                }
            } catch {}
        } else {
            let retira_zero_xped = xped.replace(/^(0+)(\d)/g, '$2');
            resp = retira_zero_xped;
        }
    } else if (tipoDoc === 'nfse' && data.conteudo) {
        let po = data.po;
        if (po === null || po === undefined || po.length < 1) {
            let conteudo = data.conteudo;
            if (conteudo !== null && conteudo.length > 0) {
                let encontrada = false;
                let palavraFormada = '';
                for (let i in arraySiglas) {
                    if (encontrada) {
                        break;
                    }
                    let validador = conteudo.indexOf(arraySiglas[i]);
                    if (validador >= 0) {
                        let tSigla = arraySiglas[i].length;
                        let getValor = conteudo.substring(validador);
                        resp = getValor.substring(tSigla, getValor.indexOf(' '));
                        if (resp.indexOf(';') !== -1) {
                            resp = resp.substring(0, resp.indexOf(';'));
                        }
                        if (resp.indexOf(',') !== -1) {
                            resp = resp.substring(0, resp.indexOf(','));
                        }
                        if (resp.indexOf(':') !== -1) {
                            resp = resp.substring(0, resp.indexOf(':'));
                        }
                        if (resp.indexOf(']') !== -1) {
                            resp = resp.substring(0, resp.indexOf(']'));
                        }
                        resp = resp.replace('[', '').replace(']', '');
                        resp = resp.replace(/^(0+)(\d)/g, '$2');
                        break;
                    }
                }
            }
        } else {
            let retira_zero_po = po.replace(/^(0+)(\d)/g, '$2');
            resp = retira_zero_po;
        }
    }
    return resp;
}

const fdtLimparConsumacaoDeDocumentoCancelado = 'c8f51853-c465-4dca-a65d-d3993a37fafe';
async function initReverseRelationship(assid, usrid, idDocCancelado, fdtId_doc) {
    let obj = {
        idDocCancelado: idDocCancelado,
        fdtId_doc: fdtId_doc,
    };
    let x = await sendItemToOnergy(fdtLimparConsumacaoDeDocumentoCancelado, getJsCtx(data, usrid), (data, assid), obj);
}

const fdtParcelas = 'f8cf2a2d-b944-4eef-bf3d-ccbf20146e19';
const fdtMegaDadosComplementaresRateio = '99128875-4971-4bd1-b0b0-49caeda45fe9';
async function criarFilhosParcelaRateio(usrid, assid, doc_original, novoDoc) {
    let filParcelasRateio = getFilter('ID_ONE_REF', doc_original);
    let parcelas = await getOnergyItem(fdtParcelas, getJsCtx(data, assid), getJsCtx(data, usrid), filParcelasRateio);
    let rateios = await getOnergyItem(fdtMegaDadosComplementaresRateio, getJsCtx(data, assid), getJsCtx(data, usrid), filParcelasRateio);
    for (let PARCELA of parcelas) {
        let postInfo = PARCELA.UrlJsonContext;
        postInfo.ID_ONE_REF = novoDoc;
        await sendItemToOnergy(fdtParcelas, getJsCtx(data, usrid), getJsCtx(data, assid), postInfo);
    }
    for (let RATEIO of rateios) {
        let postInfo = RATEIO.UrlJsonContext;
        postInfo.ID_ONE_REF = novoDoc;
        await sendItemToOnergy(fdtMegaDadosComplementaresRateio, getJsCtx(data, usrid), getJsCtx(data, assid), postInfo);
    }
}

function returnIcms(obj) {
    for (let key in obj) {
        if (obj[key] !== null && obj[key] !== '') {
            let resp = obj[key].CST;
            if (resp === null) {
                resp = obj[key].CSOSN;
            }
            return resp;
        }
    }
    return null;
}

function returnPIS(obj) {
    for (let key in obj) {
        if (obj[key] !== null && obj[key] !== '') {
            let resp = obj[key].CST;
            return resp;
        }
    }
    return null;
}

function returnIPI(obj) {
    if (obj !== null) {
        if (obj.IPINT !== null) {
            cst_ipi = obj.IPINT.CST;
        } else {
            cst_ipi = obj.IPITrib.CST;
        }
        return cst_ipi;
    }
    return null;
}

const fdtCadGeral_CstPorImpostos = '1dbd94d4-9e2b-4c9c-8b15-748d8f389dc1';
async function getInfoDescCfopCst(usrid, assid, codCst, tipoCst) {
    let fdtIdBusc = null;
    let strFiltro = null;
    let resp = null;
    if (tipoCst === 'CFOP') {
        strFiltro = JSON.stringify([{ FielName: 'codigo', Type: 'string', FixedType: 'string', Value1: codCst }]);
        fdtIdBusc = fdtCadGeral_Cfops;
    } else {
        strFiltro = JSON.stringify([
            { FielName: 'codigo', Type: 'string', FixedType: 'string', Value1: codCst },
            { FielName: 'tipos', Type: 'string', FixedType: 'string', Value1: tipoCst },
        ]);
        fdtIdBusc = fdtCadGeral_CstPorImpostos;
    }
    if (fdtIdBusc != null && strFiltro != null) {
        let resultBusc = await getOnergyItem(fdtIdBusc, getJsCtx(data, assid), getJsCtx(data, usrid), strFiltro);
        if (resultBusc != null && resultBusc.length > 0) {
            resp = resultBusc[0].UrlJsonContext.descricao;
        }
    }
    return resp;
}

//* sugestao de escrituracao automatica
const fdtNotaFiscalItens = '4d89fd6c-caa9-483a-a162-85e13af80bbd';
async function sugestEscritAuto(data, ID_ONE_REF, usrid, assid) {
    if (data.tipo === 'NFE' && ID_ONE_REF !== null && ID_ONE_REF.length > 0 && !data.cancelada) {
        let arrayItens = data.conteudo.NFe.infNFe.det;
        let arrayResp = [];
        for (let item in arrayItens) {
            let ctx = arrayItens[item].prod;
            ctx.ID_ONE_REF = ID_ONE_REF;
            let cst_icms = returnIcms(arrayItens[item].imposto.ICMS); //* pega CST || CSOSN (sempre 3 digitos)
            let cst_pis = returnPIS(arrayItens[item].imposto.PIS); //* pega raiz PIS (PISAliq || PISNT || PISOutr || PISQtde)
            let cst_ipi = returnIPI(arrayItens[item].imposto.IPI); //* pega raiz IPI (IPINT || IPITrib)
            ctx.cst_icms = cst_icms;
            ctx.cst_piscofins = cst_pis;
            ctx.cst_ipi = cst_ipi;

            //* busca descricao para campos de CST
            //* icms/pis/ipi
            ctx.descricao_saida_cst_icms = await getInfoDescCfopCst(usrid, assid, cst_icms, 'ICMS');
            ctx.descricao_saida_cst_pisconfins = await getInfoDescCfopCst(usrid, assid, cst_pis, 'PIS_COFINS');
            ctx.descricao_saida_cst_ipi = await getInfoDescCfopCst(usrid, assid, cst_ipi, 'IPI');
            ctx.descricao_saida_cfop = await getInfoDescCfopCst(usrid, assid, ctx.CFOP, 'CFOP');
            arrayResp.push(ctx);
        }
        if (arrayResp.length > 0) {
            await onergy.InsertManyOnergy(arrayResp, fdtNotaFiscalItens, usrid);
        }
    }
}

//* cria itens para serem relacionados
//* manualmente linha por linha
const fdtItensInboxNfe = '19d9ffe6-c1eb-49cd-b204-117b7852d828';
async function itensRelacionaveisLinha(data, ID_ONE_REF, usrid, assid) {
    if (data.tipo === 'NFE' && ID_ONE_REF !== null && ID_ONE_REF.length > 0 && !data.cancelada) {
        let arrayItens = data.conteudo.NFe.infNFe.det;
        let arrayResp = [];
        for (let item in arrayItens) {
            let ctxItemDoc = arrayItens[item].prod;
            let ctx = {};
            ctx.ID_ONE_REF = ID_ONE_REF;
            ctx.n_item_pedido = ctxItemDoc.nItemPed;
            ctx.cProd = ctxItemDoc.cProd;
            ctx.xProd = ctxItemDoc.xProd;
            ctx.uCom = ctxItemDoc.uCom;
            ctx.qCom = parseFloat(ctxItemDoc.qCom);
            ctx.moeda = 'BRL';
            ctx.vProd = parseFloat(ctxItemDoc.vProd);
            arrayResp.push(ctx);
        }
        if (arrayResp.length > 0) {
            await onergy.InsertManyOnergy(arrayResp, fdtItensInboxNfe, usrid);
        }
    }
}

const fdtConfSis_ListaDocumentos = '48f47868-9b48-43a0-97b1-23d8f16edb06';
async function getTipDoc(data) {
    let filListaDocumentos = getFilter('tipo_documento', data.tipo);
    let dataconfig = await getOnergyItem(fdtConfSis_ListaDocumentos, getJsCtx(data, assid), getJsCtx(data, usrid), filListaDocumentos);
    let itemDataconfig = dataconfig;
    if (itemDataconfig != null && itemDataconfig.length > 0) {
        return itemDataconfig[0];
    } else return null;
}

//* cria registro inbox
const fdtMonitDoc_Global = 'e99e21dc-5847-484e-9142-9a8cdd78e8cd';
const fdtMonitDoc_Nfse = '254907b2-d9fe-4c4c-bc5e-6c4aec3d5bed';
const fdtMonitDoc_Cte = '0cb08f3c-96e6-4f47-b67d-7817384f146e';
const fdtMonitDoc_ContaDeEnergia = '658e89ff-f5b5-4913-8490-266143cce42d';
const fdtMonitDoc_NotaDeDebitoERecibo = '8464b522-bf18-4941-8d21-37072b702636';
const fdtMonitDoc_Invoice = 'bbc33646-4f83-4ad5-96ca-bb4f47e90cdb';
const fdtMonitDoc_Fatura = '19ff5871-91be-4827-8b4a-46d0c9ed8d39';
const fdtMonitDoc_ContaTelecom = 'e635a82f-3d40-41d8-bb8d-f28c1a8fe7ae';
const fdtMonitDoc_ContaDeAgua = '4f1fbaf7-001a-453d-a05c-95ab0904167e';
const fdtMonitDoc_ContratoApolice = '52bba86b-fada-40c3-a9fa-76730ba801f5';
async function createEditRegInbox(data, tipoDoc, usrid, assid, doc_original, GrpIDLst) {
    let fdtId_save = null;
    data.oneTemplateTitle = 'Monitor de Documentos [Inbox] ' + tipoDoc;
    let cnpj_origem = '';
    let cnpj_destino = '';
    let cnpj_destinatario = '';
    let razao_social_origem = '';
    let razao_social_destino = '';
    let tipo_documento = '';
    let tipo_documento_desc = '';
    let n_nota = '';
    let serie_nf = '';
    let data_emissao = '';
    let valor = '';
    let chave = '';
    let po_extraido = data.po_extraido;
    let origem_po = '';
    let origem_po_desc = '';
    let notaCancelada = false;
    let justificativa = false;
    let dtCancelamento = null;
    let addCfgViewGroup = GrpIDLst;
    data.onergy_js_ctx = null;
    data.usrid = null;
    data.fedid = null;
    data.fdtid = null;
    data.assid = null;
    data.ass_id = null;
    data.doc_original = doc_original;
    data.onergy_js_ctx = null;
    let ukField = '';

    //* cada tipo de documento tem "de-para" diferente
    //* quando se trata de campos na tela inbox.
    if (tipoDoc === 'NFE') {
        fdtId_save = fdtMonitDoc_Nfe;
        if (!data.cancelada) {
            chave = data.conteudo.ProtNFe.infProt.chNFe;
            tipo_documento = tipoDoc;
            tipo_documento_desc = 'NF-e';
            cnpj_origem = data.conteudo.NFe.infNFe.emit.CNPJ;
            razao_social_origem = data.conteudo.NFe.infNFe.emit.xNome;
            cnpj_destino = data.conteudo.NFe.infNFe.dest.CNPJ;
            razao_social_destino = data.conteudo.NFe.infNFe.dest.xNome;
            n_nota = data.conteudo.NFe.infNFe.ide.nNF;
            serie_nf = data.conteudo.NFe.infNFe.ide.serie;
            data_emissao = data.conteudo.NFe.infNFe.ide.dEmi;
            valor = data.conteudo.NFe.infNFe.total.ICMSTot.vNF;
            po_extraido = data.po_extraido;
            origem_po = '';
            origem_po_desc = '';
            data.cnpj_emitente = cnpj_origem;
            data.razao_social_emitente = razao_social_origem;
            data.cnpj_destinatario = cnpj_destino;
            data.razao_social_destinatario = razao_social_destino;
        } else if (data.cancelada) {
            tipo_documento = tipoDoc;
            tipo_documento_desc = 'NF-e';
            chave = data.chaveNfe;
        }
        ukField = 'chave;';
        notaCancelada = data.cancelada !== null;
        if (notaCancelada) {
            //* se nota for cancelada:
            //* inbox precisa sinalizar.
            dtCancelamento = data.cancelada.dthCancelamento;
            //?dtCancelamento = dt.split('T')[0] + ' ' + dt.split('T')[1].split('.')[0];
            justificativa = data.cancelada.justificativa;
        }
    } else if (tipoDoc === 'NFSE') {
        fdtId_save = fdtMonitDoc_Nfse;
        tipo_documento = tipoDoc;
        tipo_documento_desc = 'NFS-e';
        cnpj_origem = data.cnpj;
        razao_social_origem = data.razaoSocial;
        cnpj_destino = data.dest_cnpj;
        razao_social_destino = data.razao_social_tomador;
        n_nota = data.numeroNf;
        data_emissao = data.dtEmissaoNf;
        valor = data.valorNFe;
        chave = data.chaveNfe;
        po_extraido = data.po_extraido;
        origem_po = '';
        origem_po_desc = '';
        ukField = 'chave';
        data.cnpj_prestador = cnpj_origem;
        data.razao_social_prestador = razao_social_origem;
        data.cnpj_tomador = cnpj_destino;
        data.razao_social_tomador = razao_social_destino;
        data.MIMPcodServico_id = data.MIMPcodServico_id;
        data.MIMPmun_isscod__codServico = data.MIMPmun_isscod__codServico;
        notaCancelada = data.dtCancelamento !== null;
        if (notaCancelada) {
            //* se nota cancelada:
            //* inbox precisa sinalizar.
            dtCancelamento = data.dtCancelamento;
        }

        //* busca codigo de servico
    } else if (tipoDoc === 'CTE') {
        fdtId_save = fdtMonitDoc_Cte;
        tipo_documento = tipoDoc;
        tipo_documento_desc = 'CT-e';
        cnpj_origem = data.content.CTe.InfCte.Emit.CNPJ;
        razao_social_origem = data.content.CTe.InfCte.Emit.XNome;
        cnpj_emitente = cnpj_origem;
        razao_social_emitente = razao_social_origem;
        n_nota = data.numeroNf;
        data_emissao = data.dtEmissaoNf;
        valor = data.valorNFe;
        chave = data.chaveNfe;
        if (data.content.CTe.InfCte.Ide.Toma4 !== null) {
            cnpjTomador = data.content.CTe.InfCte.Ide.Toma4.CNPJ;
            razaoSocialTomador = data.content.CTe.InfCte.Ide.Toma4.xNome;
        } else {
            if (data.content.CTe.InfCte.Ide.Toma3 !== null) {
                typeToma = data.content.CTe.InfCte.Ide.Toma3.Toma;
            }
            if (typeToma === '0') {
                //* remetente
                if (data.content.CTe.InfCte.Rem) {
                    cnpjTomador = data.content.CTe.InfCte.Rem.CNPJ;
                    razaoSocialTomador = data.content.CTe.InfCte.Rem.xNome;
                }
            } else if (typeToma === '1') {
                //* expedidor
                if (data.content.CTe.InfCte.Exped) {
                    cnpjTomador = data.content.CTe.InfCte.Exped.CNPJ;
                    razaoSocialTomador = data.content.CTe.InfCte.Exped.XNome;
                }
            } else if (typeToma === '2') {
                //* recebedor
                if (data.content.CTe.InfCte.Receb) {
                    cnpjTomador = data.content.CTe.InfCte.Receb.CNPJ;
                    razaoSocialTomador = data.content.CTe.InfCte.Receb.XNome;
                }
            } else if (typeToma === '3') {
                //* destinatario
                if (data.content.CTe.InfCte.Dest) {
                    cnpjTomador = data.content.CTe.InfCte.Dest.CNPJ;
                    razaoSocialTomador = data.content.CTe.InfCte.Dest.XNome;
                }
            }
        }
        cnpj_destino = cnpjTomador;
        razao_social_destino = razaoSocialTomador;
        data.status_processo = 'documento_recebido';
        data.status_processo_desc = 'Documento Recebido';
        data.cnpj_tomador = cnpj_destino;
        data.razao_social_tomador = razao_social_destino;
        data.cnpj_emitente = cnpj_origem;
        data.razao_social_emitente = razao_social_origem;
        if (data.content.CTe.InfCte.Rem) {
            data.cnpj_remetente = data.content.CTe.InfCte.Rem.CNPJ;
            data.razao_social_remetente = data.content.CTe.InfCte.Rem.XNome;
        }
        if (data.content.CTe.InfCte.Exped) {
            data.cnpj_expedidor = data.content.CTe.InfCte.Exped.CNPJ;
            data.razao_social_expedidor = data.content.CTe.InfCte.Exped.XNome;
        }
        if (data.content.CTe.InfCte.Receb) {
            data.cnpj_recebedor = data.content.CTe.InfCte.Receb.CNPJ;
            data.razao_social_recebedor = data.content.CTe.InfCte.Receb.XNome;
        }
        if (data.content.CTe.InfCte.Dest) {
            data.cnpj_destinatario = data.content.CTe.InfCte.Dest.CNPJ;
            data.razao_social_destinatario = data.content.CTe.InfCte.Dest.XNome;
        }
    } else if (tipoDoc === 'ENERGIA') {
        fdtId_save = fdtMonitDoc_ContaDeEnergia;
    } else if (tipoDoc === 'NOTADEBIDORECIBO') {
        fdtId_save = fdtMonitDoc_NotaDeDebitoERecibo;
    } else if (tipoDoc === 'INVOICE') {
        fdtId_save = fdtMonitDoc_Invoice;
    } else if (tipoDoc === 'FATURA') {
        fdtId_save = fdtMonitDoc_Fatura;
    } else if (tipoDoc === 'TELECOM') {
        fdtId_save = fdtMonitDoc_ContaTelecom;
    } else if (tipoDoc === 'AGUA') {
        fdtId_save = fdtMonitDoc_ContaDeAgua;
    } else if (tipoDoc === 'CONTRATO') {
        fdtId_save = fdtMonitDoc_ContratoApolice;
        data.cnpj_emitente = data.cnpj;
        data.razao_social_emitente = data.razaoSocial;
        data.cnpj_destinatario = data.dest_cnpj;
        data.razao_social_destinatario = data.razao_social_tomador;
    }
    data.fdtidDesignarLote = fdtId_save;
    data.AGT_onergyObraAreaGroupID = addCfgViewGroup;
    data.status_processo = 'documento_recebido';
    data.status_processo_desc = 'Documento Recebido';

    //* SITUACAO ONDE O DOCUMENTO ESTA CANCELADO
    //* VERIFICAR PARA TODOS DOS TIPOS DE DOCUMENTOS
    //* SE SERA NECESSARIO A TRATATIVA
    if (tipoDoc === 'NFE' || tipoDoc === 'NFSE' || tipoDoc === 'CTE') {
        if (!notaCancelada) {
            data.tipo_documento = tipo_documento;
            data.tipo_documento_desc = tipo_documento_desc;
            data.cnpj_origem = cnpj_origem;
            data.razao_social_origem = razao_social_origem;
            data.cnpj_destino = cnpj_destino;
            data.razao_social_destino = razao_social_destino;
            data.n_documento = n_nota;
            data.data_emissao = data_emissao;
            data.valor = valor;
            data.chave = chave;
            data.po_extraido = po_extraido;
            data.origem_po = origem_po;
            data.origem_po_desc = origem_po_desc;
            data.ERP_erp_type = data.ERP_erp_type;
            data.ERP_id = data.ERP_id;
            data.status = 'Pendente Pedido';
            data.status_desc = 'Pendente Pedido';
            data.serie_nf = serie_nf;
        } else {
            data.tipo_documento = tipoDoc;
            data.tipo_documento_desc = 'NF-e';
            data.chave = data.chaveNfe;
            data.status = 'Cancelado';
            data.status_desc = 'Cancelado';
            data.dtCancelamento = dtCancelamento;
            data.justificativa = justificativa;
        }
    }

    //* antes de salvar ou atualizar o Inbox do documento:
    //* validar se ja existe inbox cancelado da nota.
    //* pode acontecer da nota cancelada chegar
    //* antes da nota nao cancelada.
    //* procurar pedido com base no numero da PO
    //* NEM TODO TIPO DE DOCUMENTO TEM CHAVE
    if (data.chaveNfe) {
        let filInbox = getFilter('chave', data.chaveNfe);
        let itemInbox = await getOnergyItem(fdtId_save, getJsCtx(data, assid), getJsCtx(data, usrid), filInbox);
        let id_doc = null;

        //* se encontrada nota com mesma chave e cancelada:
        //* nota deve continuar com status de cancelada
        //* e sem referencia para nenhum pedido.
        if (itemInbox !== null && itemInbox.length > 0) {
            id_doc = itemInbox[0].ID;
            if (notaCancelada || itemInbox[0].UrlJsonContext.status === 'Cancelado') {
                let postInfo = {
                    UrlJsonContext: {
                        status: 'Cancelado',
                        status_desc: 'Cancelado',
                        dtCancelamento: dtCancelamento,
                        justificativa: justificativa,
                        pedido_id_ref: '',
                        habilitar_validacao_comercial: valid_comercial,
                        habilitar_validacao_comercial_desc: valid_comercial_desc,
                        habilitar_validacao_fiscal_taxfy_link: valid_fiscal,
                        habilitar_validacao_fiscal_taxfy_link_desc: valid_fiscal_desc,
                    },
                };
                await onergy_updatemany({
                    fdtid: fdtId_save,
                    assid: data.assid,
                    usrid: data.usrid,
                    data: JSON.stringify(postInfo),
                    filter: JSON.stringify([{ FielName: '_id', Type: 'string', FixedType: 'string', Value1: id_doc }]),
                    isMultiUpdate: false,
                });

                //* se documento for cancelado:
                //* limpar relacionamento com pedido(s).
                //* enviar documento cancelado para
                //* outro processo que vai desfazer
                //* relacionamento com pedido(s).
                await initReverseRelationship(assid, usrid, itemInbox[0].ID, fdtId_save);
                return { id: id_doc, template: fdtId_save };
            }
        }
    }
    let idx = await sendItemToOnergy(fdtId_save, usrid, assid, data, null, ukField, true, addCfgViewGroup);
    await criarFilhosParcelaRateio(usrid, assid, doc_original, idx);

    //* criar itens para sugestao de escrituracao
    await sugestEscritAuto(data, idx, usrid, assid);
    if (tipoDoc === 'NFE') {
        //* criar itens para serem relacionados
        //* linha por linha manualmente
        await itensRelacionaveisLinha(data, idx, usrid, assid);
    }
    return { id: idx, template: fdtId_save };
}

//* copia registro em consulta detalhada
const fdtConsDet_Nfe = 'efc71489-6b7b-4c94-8e2c-b9d153bf2e21';
const fdtConsDet_Nfse = '9253cd1f-f178-4129-a0e0-a7585d7f51c5';
const fdtConsDet_Cte = 'eaaefc2d-6387-4d9b-89ce-78f9a2967048';
const fdtConsDet_ContasDeEnergia = '3fb79c25-26c7-4543-96a4-9850129ebd09';
const fdtConsDet_NotaDeDebitoERecibo = 'b768c451-3633-4a5c-ab49-f5af29080dae';
const fdtConsDet_Invoice = 'bdd0f95c-2d1f-4582-9bc1-6bc41e53a23b';
const fdtConsDet_Fatura = '51702c23-b547-4ca5-834d-76dce67dd55b';
const fdtConsDet_ContasTelecom = '5984d17e-bd41-460e-81fa-fbc614b5db4b';
const fdtConsDet_ContasDeAgua = '4b5fb031-1b42-4cf8-8365-27e192121958';
const fdtConsDet_ContratoApolice = 'd950e418-0ef4-4ed9-a3aa-69cbe74f9739';
async function saveCopyDoc(copy, tipoDoc, usrid, assid, GrpIDLst) {
    copy.oneTemplateTitle = 'Consulta Detalhada ' + tipoDoc;
    let templateid = null;
    let ukField = null;
    let tipo_doc = null;
    let notaCancelada = false;
    let addCfgViewGroup = GrpIDLst;
    copy.doc_original = copy.fedid;
    copy.onergy_js_ctx = null;
    copy.usrid = null;
    copy.fedid = null;
    copy.fdtid = null;
    copy.assid = null;
    copy.ass_id = null;

    //* valida tipo de documento e manda para tela
    if (tipoDoc === 'NFE') {
        templateid = fdtConsDet_Nfe;
        ukField = 'chaveNfe';
        if (copy.cancelada) {
            let obj = {
                ProtNFe: {
                    infProt: {
                        chNFe: copy.chaveNfe,
                    },
                },
            };
            copy.conteudo = obj;
            copy.nota_cancelada = 'Sim';
            copy.nota_cancelada_desc = 'Sim';
        }
    } else if (tipoDoc === 'NFSE') {
        templateid = fdtConsDet_Nfse;
        ukField = 'chaveNfe';
    } else if (tipoDoc === 'CTE') {
        templateid = fdtConsDet_Cte;
        ukField = 'chave_cte';
    } else if (tipoDoc === 'ENERGIA') {
        templateid = fdtConsDet_ContasDeEnergia;
        ukField = 'chaveNfe';
    } else if (tipoDoc === 'NOTADEBIDORECIBO') {
        templateid = fdtConsDet_NotaDeDebitoERecibo;
        ukField = 'chaveNfe';
    } else if (tipoDoc === 'INVOICE') {
        templateid = fdtConsDet_Invoice;
        ukField = 'chaveNfe';
    } else if (tipoDoc === 'FATURA') {
        templateid = fdtConsDet_Fatura;
        ukField = 'chaveNfe';
    } else if (tipoDoc === 'TELECOM') {
        templateid = fdtConsDet_ContasTelecom;
        ukField = 'chaveNfe';
    } else if (tipoDoc === 'AGUA') {
        templateid = fdtConsDet_ContasDeAgua;
        ukField = 'chaveNfe';
    } else if (tipoDoc === 'CONTRATO') {
        templateid = fdtConsDet_ContratoApolice;
        ukField = 'chaveNfe';
    }
    let id_doc = null;
    if (templateid !== null) {
        if (copy.chaveNfe) {
            //* antes de salvar/editar documento:
            //* se ja estiver cancelado,
            //* precisa continuar cancelado.
            let strFiltro = JSON.stringify([
                { FielName: 'chaveNfe', Type: 'string', FixedType: 'string', Value1: copy.chaveNfe },
                { FielName: 'tipo', Type: 'string', FixedType: 'string', Value1: tipoDoc },
            ]);
            let buscDoc = await getOnergyItem(templateid, getJsCtx(data, assid), getJsCtx(data, usrid), strFiltro);
            if (buscDoc !== null && buscDoc.length > 0) {
                id_doc = buscDoc[0].ID;
                let notaCancelada = buscDoc[0].UrlJsonContext.nota_cancelada;

                //* NFe cancelada vem sem info de conteudo:
                //* se ja tiver nota no sistema
                //* que vai ser cancelada agora,
                //* nao podemos perder informacoes
                //* que ja temos nessa nota.
                if (tipoDoc === 'NFE' && (notaCancelada === 'Não' || notaCancelada === undefined || notaCancelada === null)) {
                    let conteudoNfe = buscDoc[0].UrlJsonContext.conteudo;
                    copy.conteudo = conteudoNfe;
                }
                if (notaCancelada === 'Sim') {
                    copy.nota_cancelada = notaCancelada;
                    copy.nota_cancelada_desc = notaCancelada;
                }
            }
        }
        //* cria copia da nota na propria tela
        //* com base no tipo de documento
        // let itemSave = {
        //     data: JSON.stringify(copy),
        //     usrid: usrid,
        //     assid: assid,
        //     fdtid: templateid,
        //     blockDuplicate: false,
        //     checkTemplateDuplicate: true,
        //     ukField: ukField,
        // };
        // if (addCfgViewGroup != null && addCfgViewGroup != '') {
        //     itemSave.addCfgViewGroup = addCfgViewGroup;
        // }
        // return onergy.SaveData(JSON.stringify(itemSave));
        return await sendItemToOnergy(templateid, usrid, assid, copy, id_doc, null, true, addCfgViewGroup);
    }
    return null;
}

//* ANTES DE SALVAR TIPO DE DOCUMENTO
//* DEVE VERIFICAR SE ONERGY
//* POSSUI CONFIGURACOES INICIAIS
//* NECESSARIAS CADASTRADAS.
//* CASO NAO TENHA, INFORMAR NO LOG
//* E NAO SALVAR DOCUMENTO.
async function initBefore(json) {
    let data = JSON.parse(json);
    data.erp_type = await getConfig(data, 'erp_type');
    if (data.erp_type === null) {
        return false;
    }

    //* ConfiguracoesSistemicas -> ListaErp
    let buscaErp = await getItemErp(data, data.erp_type);
    if (buscaErp === null || buscaErp.length === 0) {
        return false;
    }

    //* ConfiguracoesSistemicas -> ConfigurarValidacoes
    let filConfigurarValidacoes = JSON.stringify([
        { FielName: 'LDOC_tipo_documento', Type: 'string', FixedType: 'string', Value1: data.tipo },
        { FielName: 'ERP_erp_type', Type: 'string', FixedType: 'string', Value1: buscaErp[0].UrlJsonContext.erp_type },
    ]);
    let itemConfigurarValidacoes = await getOnergyItem(fdtConfSis_ConfigurarValidacoes, getJsCtx(data, assid), getJsCtx(data, usrid), filConfigurarValidacoes);
    if (itemConfigurarValidacoes === null || itemConfigurarValidacoes.length === 0) {
        return false;
    }

    return true;
}

const fdtCadGeral_ImpostosMunicipais = '2877d774-53cc-49c9-b433-3d6504142552';
const fdtCadGeral_ImpostosLeiComplementar = '7826bdf4-b58e-4155-9398-84b825cc5e4c';
const fdtCadGeral_CadastroDeClientesBpo = '9057c83f-756f-4213-ad81-eff9acdeab76';
async function init(strData) {
    let userid = '';
    let name = '';
    let usridLst = [];
    let GrpIDLst = [];
    let data = JSON.parse(strData);

    //* array para guardar
    //* eventos da nota.
    data.eventos = [];
    //* array para guardar
    //* id's de pedidos
    //* relacionados a nota.
    data.pedidos_relacionados = [];
    //* array para guardar
    //* informacoes do de-para
    //* Itens Documento X Itens Pedido
    //* necessario para integrar com ERP.
    //* ERP pede informacoes de
    //* Itens Documento e Itens Pedido
    //* depois que foi feito
    //* relacionamento
    //* (validacao comercial).
    data.itensPosValidacao = [];

    //* verificar se nota duplicada:
    //* se sim, deve ser deletada
    //* e nao duplicada.
    let deleteRegDupli = await validDupliDoc(JSON.parse(JSON.stringify(data)));
    if (deleteRegDupli) {
        return { cond: true, deleteFeed: true };
    }

    //* de-para CFOP (encapsulado)
    await comparaCfop(data);

    //* de onde vem pedido de compra
    //* conforme ERP cadastrado
    let lst_siglas = null;
    data.erp_type = await getConfig(data, 'erp_type');

    //* busca ID de regidtro ERP
    //* no cadastro de ERP
    //* com base no nome do ERP.
    if (data.erp_type !== null && data.erp_type.length > 0) {
        let buscaErp = await getItemErp(data, data.erp_type);
        if (buscaErp !== null) {
            data.ERP_erp_type = buscaErp.UrlJsonContext.erp_type;
            data.ERP_id = buscaErp.ID;
            data.lst_siglas = buscaErp.UrlJsonContext.LPO_abreviacao_po__lista_po;
        }
    }

    //* busca configuracoes
    //* de validacao do documento.
    await getConfigValid(data);
    if (!data.dtUpload) {
        data.dtUpload = get_usr_tmz_dt_now({
            assid: getJsCtx(data, assid),
            usrid: getJsCtx(data, usrid),
        });
    }
    data.upload_data_hora = GetStrBrlDate(data.dtUpload);
    if (!data.responsavel_upload) {
        data.responsavel_upload = 'INTEGRAÇÃO';
    }

    //* ADICIONA A PERMISSAO DE VISAO
    //* PARA OS USUARIOS RELACIONADOS
    //* AS RESPECTIVAS EQUIPES.
    //* RESP CNPJ PODE CONTER
    //* MAIS DE UMA EQUIPE RELACIONADA.
    //* VERIFICAR QUAL CNPJ DESTINO
    //* DEVE SER USADO.
    //* EXITEM VARIOS CAMPOS
    //* MAPEADOS PARA O TOMADOR.
    //* DEPENDE DO TIPO DE DOCUMENTO.
    GrpIDLst = await GetRespCNPJ(data, data.cnpj, data.dest_cnpj);
    data.selectFinalid = await getConfig(data, 'selectFinalid');
    if (data.selectFinalid === null) {
        data.selectFinalid = 'Não';
    }
    data.env = await getConfig(data, 'env');
    if (data.env === 'CLI') {
        data.necessario_validar_documentos = false;
    }
    if (data.tipo) {
        let lowerTipo = data.tipo.toLowerCase().trim();
        if (lowerTipo === 'nfse' || lowerTipo === 'nfs-e') {
            data.tipo = 'NFSE';

            //* CAMPO DO TAXFY: txOutrasInformacoes
            data.outras_informacoes = data.txOutrasInformacoes;
            data.aliquota_porcentagem = data.txISSAliq * 100;

            //* se for feito pelo Upload nao precisa tratar.
            if (data.docsia !== undefined) data.aliquota_porcentagem = data.txISSAliq;

            //* busca codigo servico
            //* no fdtImpostosMunicipais
            //* (2877d774-53cc-49c9-b433-3d6504142552)
            //* MIMPid
            //* MIMPlc_cod
            //* MIMPlc_desc
            //* CAMPOS GERADOS PELO TAXFY:
            //* CODSERVICO / CODIBGEMUNICIPIONOTA
            //* CAMPOS GERADOS PELO DOCSIA:
            //* CODIGO_SERVICO / CODIGO_SERVICO_DESC
            //* / CAMPO_MUNICIPIO_PRESTACAO_SERVICO
            let codMun = '';
            let codServ = '';
            if (data.codIBGEMunicipioNota !== undefined) codMun = data.codIBGEMunicipioNota;
            else if (data.campo_municipio_prestacao_servico !== undefined) codMun = data.campo_municipio_prestacao_servico;
            if (data.codServico !== undefined) codServ = data.codServico;
            else if (data.codigo_servico !== undefined) codServ = data.codigo_servico;
            if (codServ !== '' && codMun !== '') {
                const filterImpostosMuncipais = JSON.stringify([
                    {
                        FielName: 'MLOCmunicipio_ibge',
                        Type: 'string',
                        Value1: codMun,
                    },
                    {
                        FielName: 'mun_isscod',
                        Type: 'string',
                        Value1: codServ,
                    },
                ]);
                let lkpImpostosMuncipais = await getOnergyItem(
                    fdtCadGeral_ImpostosMunicipais,
                    getJsCtx(data, assid),
                    getJsCtx(data, usrid),
                    filterImpostosMuncipais
                );

                //* SE EXISTIR NO CADASTRO:
                //* INSERIR INFORMACAO CADASTRADA;
                //* SENAO, INFORMAR O QUE VIER DA NOTA.
                data.MIMPmun_issdesc = codServ + ' ' + data.codigo_servico_desc;
                if (lkpImpostosMuncipais !== null && lkpImpostosMuncipais.length > 0) {
                    data.MIMPlc_cod = lkpImpostosMuncipais[0].UrlJsonContext.MIMPlc_cod;
                    data.MIMPmun_issdesc = lkpImpostosMuncipais[0].UrlJsonContext.MIMPlc_desc;
                    data.MIMPcodServico_id = lkpImpostosMuncipais[0].UrlJsonContext.MIMPid;
                    data.MIMPmun_isscod__codServico = lkpImpostosMuncipais[0].UrlJsonContext.mun_isscod;
                } else {
                    const filLeiComplementar = getFilter('lc_cod', codServ);

                    //* LEI COMPLEMENTAR
                    let itemLeiComplementar = await getOnergyItem(
                        fdtCadGeral_ImpostosLeiComplementar,
                        getJsCtx(data, assid),
                        getJsCtx(data, usrid),
                        filLeiComplementar
                    );
                    if (itemLeiComplementar !== null && itemLeiComplementar.length > 0) {
                        data.MIMPlc_cod = itemLeiComplementar[0].UrlJsonContext.lc_cod;
                        data.MIMPmun_issdesc = itemLeiComplementar[0].UrlJsonContext.lc_desc;
                    }
                }
            }

            //* se campo "po_extraido" for branco ou nulo:
            //* buscar numero do pedido.
            if (data.po_extraido === null || data.po_extraido === undefined || data.po_extraido.length === 0) {
                let po_extraido = getNumPed(lowerTipo, data, data.lst_siglas);
                data.po_extraido = po_extraido;
            }

            //* se nota cancelada:
            //* identificar.
            let notaCancelada = data.dtCancelamento !== null;
            if (notaCancelada) {
                dtCancelamento = data.dtCancelamento;
                data.nota_cancelada = 'Sim';
                data.nota_cancelada_desc = 'Sim';
            }
        } else if (lowerTipo === 'nfe' || lowerTipo === 'nf-e') {
            data.tipo = 'NFE';

            //* se campo "po_extraido" for branco ou nulo:
            //* buscar numero do pedido.
            if ((data.po_extraido === null || data.po_extraido === undefined || data.po_extraido.length === 0) && data.conteudo !== undefined) {
                let po_extraido = getNumPed(lowerTipo, data, data.lst_siglas);
                data.po_extraido = po_extraido;
            }

            //* se nota cancelada:
            //* identificar.
            let notaCancelada = data.cancelada !== null;
            if (notaCancelada) {
                data.nota_cancelada = 'Sim';
                data.nota_cancelada_desc = 'Sim';
                data.justificativa = data.cancelada.justificativa;
                data.dtCancelamento = data.cancelada.dthCancelamento;
            }
        } else if (lowerTipo === 'cte' || lowerTipo === 'ct-e') {
            data.tipo = 'CTE';
        }
    }
    if (data.cnpj) {
        data.cnpjRaizEmit = data.cnpj.substr(0, 8);

        //* cria Empresa Parceira e associa ID na nota
        //* para efetuar pesq ref pelo campo
        //* CNPJ/RAZAOSOCIAL;
        //?CreateEmpresaParceira(data);
    }
    if (data.dest_cnpj) {
        data.cnpjRaizDest = data.dest_cnpj.substr(0, 8);
    }
    data.necessario_validar_documentos = false;
    if (data.dest_cnpj !== null && data.dest_cnpj.toString().trim() !== '' && data.env === 'BPO') {
        let filCadastroDeClientesBpo = getFilter('cnpj', data.dest_cnpj);
        let itemCadastroDeClientesBpo = await getOnergyItem(
            fdtCadGeral_CadastroDeClientesBpo,
            getJsCtx(data, ass_id),
            getJsCtx(data, usrid),
            filCadastroDeClientesBpo
        );
        data.necessario_validar_documentos = false;
        let cnpjOK = true;
        if (itemCadastroDeClientesBpo !== null && itemCadastroDeClientesBpo !== '') {
            let datar = JSON.parse(itemCadastroDeClientesBpo);
            if (datar !== null && datar.length > 0) {
                let clienteData = datar[0].UrlJsonContext;
                let necessario_validar_documentos = clienteData.necessario_validar_documentos === '1';
                let grpname = 'grp-' + clienteData.cnpj;
                let grpid = getGroupID({
                    assid: data.assid,
                    grp_name: grpname,
                });
                if (grpid && GrpIDLst.indexOf(grpid) < 0) {
                    GrpIDLst.push(grpid);
                }
                if (necessario_validar_documentos) {
                    data.necessario_validar_documentos = necessario_validar_documentos;
                }
            } else if (data.tipo === 'CTE') {
                cnpjOK = false;
            }
        } else if (data.tipo === 'CTE') {
            cnpjOK = false;
        }
        if (!cnpjOK && data.tipo === 'CTE') {
            return { cond: true, deleteFeed: true };
        }

        // let grpDestName = 'grp-' + data.dest_cnpj;
        // let grpDestID = getGroupID({
        //     assid: data.assid,
        //     grp_name: grpDestName,
        // });
        // if (grpDestID && GrpIDLst.indexOf(grpDestID) < 0) {
        //     GrpIDLst.push(grpDestID);
        // }
    }

    //* Condicoes para mudar DANFE para NFS-e
    //* (c10) cMun = 5300108
    //* (c19) IM >> Preenchido
    //* (b04) natOp >> Prestação de Serviço
    //* (i05) NCM = 00000000
    //* cfop = 6933
    data.prestacao_servicos = 'Não';
    if (data.conteudo && data.conteudo.NFe) {
        let detCMunArr = data.conteudo.NFe.infNFe.det !== null && data.conteudo.NFe.infNFe.det.length > 0;
        let cMunCond = false;
        if (detCMunArr) {
            cMunCond = data.conteudo.NFe.infNFe.emit.enderEmit.cMun === '5300108';
        }
        let IMCond = data.conteudo.NFe.infNFe.emit.IM !== null && data.conteudo.NFe.infNFe.emit.IM.toString() !== '';
        let detArr = data.conteudo.NFe.infNFe.det !== null && data.conteudo.NFe.infNFe.det.length > 0;
        let NCMCond = false;
        let CFOPCond = false;
        if (detArr) {
            NCMCond = parseInt(data.conteudo.NFe.infNFe.det[0].prod.NCM) === 0; //* converte para inteiro e verifica se igual a 0
            CFOPCond = parseInt(data.conteudo.NFe.infNFe.det[0].prod.CFOP) === 6933;
        }
        if (data.docsia === undefined && data.tipo === 'NFE' && cMunCond && IMCond && NCMCond && CFOPCond) {
            data.prestacao_servicos = 'Sim';
        }
    }
    let isCte = false;
    if (data.tipo !== undefined) {
        isCte = data.tipo.toString().toLowerCase() === 'cte';
    } else {
        if (data.CTe !== null && data.CTe !== undefined) {
            isCte = true;
            data.tipo = 'CTE';
        }
    }
    if (!data.razao_social_tomador && data.razaoSocialTomador) {
        data.razao_social_tomador = data.razaoSocialTomador;
    }
    if (!data.necessario_validar_documentos) {
        let dateObj = new Date(data.dtEmissaoNf);
        let month = dateObj.getMonth() + 1; //* months from 1-12
        let year = dateObj.getFullYear();
        //?let mes = (month - 1).toString();
        let mes = month.toString();
        mes = mes.padStart(2, '0');
        data.competencia = mes + '/' + year;
    }

    //* procura tipo de documento em cadastro no onergy
    let tipDoc = await getTipDoc(data);
    if (tipDoc != null) {
        data.LDOC_documento__tipo_documento = tipDoc.UrlJsonContext.documento;
        data.LDOC_tipo_documento_id = tipDoc.ID;
        data.LDOC_tipo_id = tipDoc.UrlJsonContext.tipo_id;
    }

    //* salva copia do documento na tela de Inbox global
    //* com mudanca de "de-para" com base no
    //* tipo de documento.
    let retorno_save_inbox = await createEditRegInbox(
        JSON.parse(JSON.stringify(data)),
        data.tipo,
        getJsCtx(data, usrid),
        getJsCtx(data, assid),
        getJsCtx(data, fedid),
        GrpIDLst
    );
    if (retorno_save_inbox.id) {
        data.id_save_inbox = retorno_save_inbox.id;
        data.id_template_inbox = retorno_save_inbox.template;
        //* salva/edita copia do documento
        //* em tela com base no tipo NFE/NFSE/CTE
        let retorno_save_doc = await saveCopyDoc(JSON.parse(JSON.stringify(data)), data.tipo, getJsCtx(data, usrid), getJsCtx(data, assid), GrpIDLst);
        if (retorno_save_doc != null) {
            data.copy_doc_id = retorno_save_doc;
            let postInfoSaveDoc = {
                UrlJsonContext: {
                    copy_doc_id: data.copy_doc_id,
                },
            };
            await onergy_updatemany({
                fdtid: fdtMonitDoc_Global,
                assid: data.assid,
                usrid: data.usrid,
                data: JSON.stringify(postInfoSaveDoc),
                filter: JSON.stringify([{ FielName: '_id', Type: 'string', FixedType: 'string', Value1: data.id_save_inbox }]),
                isMultiUpdate: false,
            });
        }
    }

    //return { cond: data.necessario_validar_documentos, json: JSON.stringify(data), UsrID: usridLst, GrpID: GrpIDLst };
    return SetObjectResponse(data.necessario_validar_documentos, data, false, usridLst, GrpIDLst);
    //?return true;
}

function SetObjectResponse(cond, json, WaitingWebHook, UsrID, GrpID) {
    let obj = {
        cond: cond,
        json: JSON.stringify(json),
        WaitingWebHook: WaitingWebHook,
    };
    if (WaitingWebHook === undefined) {
        WaitingWebHook = false;
    }
    if (UsrID !== null && UsrID.length > 0) {
        obj.UsrID = UsrID;
    }
    if (GrpID !== null && GrpID.length > 0) {
        obj.GrpID = GrpID;
    }
    return obj;
}

//!METODOS PADRAO ===
const json = {
    chaveNfe: '07882930000165_20220519_1354__11171276000159',
    cnpj: '11171276000159',
    razaoSocial: 'OITO MEIA PRODUCOES LTDA',
    numeroNf: '1354',
    dest_cnpj: '07882930000165',
    razao_social_tomador: 'MITRE REALTY EMPREENDIMENTOS E PARTICIPACOES S.A.',
    valorNFe: 394645.48,
    urlpdf: 'https://taxapi.onetech.com.br/api/nfse/7a42f7a1-6705-3d21-b0b0-1b676c981856/pdf?id=628724b7e9abde2bf42028c5',
    dtEmissaoNfDate: '2022-05-19 18:22:32',
    dtEmissaoNf: '2022-05-19 15:22:32',
    dtEntradaDate: '2022-05-20 08:18:48',
    dtEntrada: '2022-05-20 05:18:48',
    tipo: 'NFSE',
    conteudo:
        'Produção e Cenografia: Mitre - CV Escritório - Fase 1\n\n\nPEDIDO DE COMPRA/CONTRATO MITRE N°: 22171\n\n\nNão sujeito a retenção na fonte das contribuições sociais conforme IN SRF n°459/2004, artigo 1°.',
    urlxml: 'https://taxfystorage.blob.core.windows.net/nfse/WSSaoPaulo/32790ced-5ec5-4a6c-a05c-d30c47c9260f/07882930000165/2022/05/20/628724b7e9abde2bf42028c5.xml?sv=2015-07-08&sr=b&sig=z7TerATaQio0luIUj%2FL%2Bpcafvmg%2BCnfUTBWf98oGfKc%3D&se=2022-12-06T05%3A18%3A48Z&sp=r',
    codServico: '6777',
    munPrestador: 3550308,
    munTomador: 3550308,
    codIBGEMunicipioNota: 3550308,
    municipioPrestacao: '',
    nomeMunicipioPrestacao: '',
    ISSRetido: false,
    prestadorCEP: 2555000,
    po: '',
    dtCancelamento: null,
    descricao_de_servico: '',
    txOrigemNota: 'Web Service',
    txValorBaseCalculo: 394645.48,
    txValorLiquidoNfse: 394645.48,
    txVlIrrf: 0,
    txVlCsll: 0,
    txVlCofins: 0,
    txVlPis: 0,
    txValorIss: 19732.27,
    txVlInss: 0,
    txVlDeducoes: 0,
    txISSAliq: 0.05,
    txValorTotalRecebido: 0,
    txSerieNFse: null,
    txRpsNumero: null,
    txRpsSerie: null,
    txPrestEndereco: 'ALESSO BALDOVINETTI',
    txPrestEndTipoLogradouro: 'R',
    txPrestEndNumero: '378',
    txPrestEndComplemento: null,
    txPrestEndBairro: 'CASA VERDE ALTA',
    txPrestEndUf: 'SP',
    txPrestEndCodMunicipio: 3550308,
    txPrestEndNomeMunicipio: 'São Paulo',
    txPrestEndCep: 2555000,
    txPrestEndTelefone: null,
    txPrestEndEmail: 'financeiro@estudiooitomeia.com',
    txTomadEndereco: 'SANTOS',
    txTomadEndTipoLogradouro: 'AL',
    txTomadEndNumero: '700',
    txTomadEndBairro: 'CERQUEIRA CESAR',
    txTomadEndCodMunicipio: 3550308,
    txPrestEndInscEstadual: 0,
    txPrestEndInscMunicipal: 0,
    txTomadEndUf: 'SP',
    txTomadEndCep: 1418002,
    txTomadEndPaisObra: null,
    txTomadEndTelefone: null,
    txTomadEndEmail: 'contasapagar@mitrerealty.com.br',
    txTomadEndInscEstadual: 0,
    txTomadEndInscMunicipal: 34996770,
    txCodigoVerificacao: 'QSIQUA5L',
    txTomadEndComplemento: 'ANDAR 5',
    txNrNfseSubst: null,
    txIdlegado: null,
    oneTemplateTitle: '',
    ass_id: 'a278fa91-cf28-4e29-8410-f2bf89a02d93',
    assid: 'a278fa91-cf28-4e29-8410-f2bf89a02d93',
    fedid: '0bbbd63d-7e59-44c3-97e1-d7f924b4d397',
    fdtid: '9253cd1f-f178-4129-a0e0-a7585d7f51c5',
    usrid: 'a08e0ca2-0ee3-4909-81f8-1e73c5ee9901',
    email: 'adm@mitre.com.br',
    onergy_rolid: '',
    timezone: null,
    onergy_js_ctx: null,
    eventos: [],
    pedidos_relacionados: [],
    itensPosValidacao: [],
    erp_type: 'MEGA',
    ERP_erp_type: 'MEGA',
    ERP_id: '12bae88a-3e5d-5b3c-40ec-761918810323',
    lst_siglas: ['AP:', 'Pedido:'],
    habilitar_validacao_comercial: 'Não',
    habilitar_validacao_comercial_desc: 'Não',
    forma_integracao: 'ativa',
    forma_integracao_desc: 'Onergy envia os dados para outros sistemas',
    inbox_automatico: 'nao',
    inbox_automatico_desc: 'Não',
    habilitar_workflow_aprovacao: 'Sim',
    habilitar_workflow_aprovacao_desc: 'Sim',
    habilitar_sugestao_escrituracao: ' ',
    habilitar_manifestacao: ' ',
    habilitar_validacao_fiscal_taxfy_link: 'Não',
    habilitar_validacao_fiscal_taxfy_link_desc: 'Não',
    CFD_LDOC_documento__tipo_documento__tipo_documento: 'Fatura',
    CFD_tipo_documento_id: 'dadfb076-f5ed-90e0-450b-1784846ca5b1',
    habilitar_condicao_pagamento: 'Sim',
    habilitar_condicao_pagamento_desc: 'Sim',
    preencher_condicao_pagamento: 'onergy',
    preencher_condicao_pagamento_desc: 'Cadastro Onergy',
    habilitar_btn_validar_registro: 'Não',
    campo_condicao_pagamento: ' ',
    dtUploadDate: '2022-05-20 05:26:04',
    dtUpload: '2022-05-20 02:26:04',
    upload_data_hora: '20/05/2022 02:26:04',
    responsavel_upload: 'INTEGRAÇÃO',
    selectFinalid: 'Não',
    env: 'CLI',
    necessario_validar_documentos: false,
    aliquota_porcentagem: 5,
    MIMPmun_issdesc:
        'Produção, mediante ou sem encomenda prévia, de eventos, espetáculos, entrevistas, shows, ballet, danças, desfiles, bailes, teatros, óperas, concertos, recitais, festivais e congêneres.',
    MIMPlc_cod: '12.13',
    MIMPcodServico_id: 'f47c6ce7-ca4a-4388-8e4b-a08798d6e37e',
    MIMPmun_isscod__codServico: '6777',
    po_extraido: null,
    cnpjRaizEmit: '11171276',
    cnpjRaizDest: '07882930',
    prestacao_servicos: 'Não',
    competencia: '05/2022',
    LDOC_documento__tipo_documento: 'NFS-e',
    LDOC_tipo_documento_id: 'e2804a2a-8ed0-355a-9f3a-f3225f867bec',
    id_save_inbox: '8a3ed988-9ab1-474f-95bd-836107fa0e60',
    id_template_inbox: '254907b2-d9fe-4c4c-bc5e-6c4aec3d5bed',
    doc_original: '57f51a57-4d8d-41fb-b795-083e8ca91ef7',
    id_retencao_ref: '360fdb76-90ca-4084-b475-dd5e9c5c3007',
    anexos: [
        {
            Name: 'Simples.html',
            UrlAzure:
                'https://onebackupservices.blob.core.windows.net/a278fa91-cf28-4e29-8410-f2bf89a02d93/365a29f0-3658-4bac-a5e7-34e695ba94b1.html?sv=2018-03-28&sr=b&sig=aXQT9jYSy4mwFwvizHsPwtX9taTyHpp4vuceyHyIJd0%3D&se=2022-12-06T05%3A35%3A46Z&sp=r',
            Url: 'https://onebackupservices.blob.core.windows.net/a278fa91-cf28-4e29-8410-f2bf89a02d93/365a29f0-3658-4bac-a5e7-34e695ba94b1.html?sv=2018-03-28&sr=b&sig=aXQT9jYSy4mwFwvizHsPwtX9taTyHpp4vuceyHyIJd0%3D&se=2022-12-06T05%3A35%3A46Z&sp=r',
        },
    ],
    cadastro_no_cpom: 'Cadastrado no CEPOM',
    codigo_da_lei_complementar:
        '12.13-Produção, mediante ou sem encomenda prévia, de eventos, espetáculos, entrevistas, shows, ballet, danças, desfiles, bailes, teatros, óperas, concertos, recitais, festivais e congêneres',
    inss: 11,
    iss_bitrib: 0,
    simples_nacional: 'Não Optante',
    tot_impostos: null,
    tot_liq: null,
    valor_inss: 43411.002799999995,
    valor_iss: 0,
    valor_iss_bitrib: 0,
};

init(JSON.stringify(json));
