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
    return new Date().toLocaleString();
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
function onergy_updatemany(data) {}
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

async function sendItemToOnergy(templateid, usrid, assid, data, ukField) {
    let onergySaveData = {
        fdtid: templateid,
        assid: assid,
        usrid: usrid,
        data: JSON.stringify(data),
    };
    if (ukField !== undefined && ukField !== '') {
        onergySaveData.ukField = ukField;
        onergySaveData.checkTemplateDuplicate = true;
    }
    return await onergy_save(onergySaveData);
}

const fdtMunicipios = '1caa74e7-7b4d-467b-b7d7-7354e6951549';
async function getIBGEIDbyNome(data, cidade, estado) {
    if (!cidade || !estado) {
        return null;
    }
    let strFiltroLei = JSON.stringify([
        { FielName: 'municipio_nome', Type: 'string', Value1: cidade },
        { FielName: 'estado_uf', Type: 'string', Value1: estado },
    ]);
    let dataconfig = await getOnergyItem(fdtMunicipios, data.assid, data.usrid, strFiltroLei);
    if (dataconfig !== null && dataconfig.length > 0) {
        return dataconfig[0].UrlJsonContext.municipio_ibge;
    } else return null;
}

const fdtCadGeral_ResponsavelCnpj = '3fdc8147-82f3-494c-af19-6afae5dc2d76';
async function GetRespCNPJ(data, dest_cnpj) {
    if (dest_cnpj !== null && dest_cnpj.toString().trim() !== '') {
        let cnpj = dest_cnpj.substring(0, 8);
        let result = await onergy_get({
            fdtid: fdtCadGeral_ResponsavelCnpj,
            assid: data.ass_id,
            usrid: data.usrid,
            filter: JSON.stringify([
                {
                    FielName: 'cnpj',
                    Type: 'string',
                    Value1: cnpj,
                },
            ]),
        });
        if (result !== null && result !== '') {
            let datar = JSON.parse(result);
            if (datar !== null && datar.length > 0) {
                if (datar[0].UrlJsonContext.onergyteam_id !== null) return datar[0].UrlJsonContext.onergyteam_id;
            }
        }
    }
    return '';
}

const fdtTestDev_EntradaRetencao = '1c858846-0cf3-43dd-8efe-0f1970d84885';
async function init(json) {
    let data = JSON.parse(json);
    //* cria registro de retencao
    if (data.tipo === 'NFSE' && !data.id_retencao_ref) {
        let idequipevisao = await GetRespCNPJ(data, data.dest_cnpj);
        if (idequipevisao === null || idequipevisao === '') {
            idequipevisao = await GetRespCNPJ(data, data.cnpj);
        }
        if (data.munPrestador !== data.codIBGEMunicipioNota) data.munPrestador = data.codIBGEMunicipioNota;
        if (data.docsia !== undefined) {
            if (data.docsia.msg_internal_error === '') {
                data.codServico = data.docsia.response.extractions.codigo_servico;
                data.munPrestador = await getIBGEIDbyNome(
                    data,
                    data.docsia.response.extractions.abrasf_ps_endereco_municipio,
                    data.docsia.response.extractions.abrasf_ps_endereco_uf
                );
                data.munTomador = await getIBGEIDbyNome(
                    data,
                    data.docsia.response.extractions.abrasf_decl_ps_inf_tomador_endereco_municipio,
                    data.docsia.response.extractions.abrasf_decl_ps_inf_tomador_endereco_uf
                );
                data.codIBGEMunicipioNota = data.munPrestador;
            }
        }
        let dataRetencao = {
            doc_original: data.doc_original,
            idfk: data.fedid,
            cnpj: data.cnpj,
            razaoSocial: data.razaoSocial,
            valor: data.valorNFe,
            valorNFe: data.valorNFe,
            numeroNf: data.numeroNf,
            chaveNfe: data.chaveNfe,
            codServico: data.codServico,
            munTomador: data.munTomador,
            munPrestador: data.munPrestador,
            codIBGEMunicipioNota: data.codIBGEMunicipioNota,
            ISSRetido: data.ISSRetido,
            prestadorCEP: data.prestadorCEP,
            grpidResp: idequipevisao,
        };
        let id_retencao_ref = await sendItemToOnergy(fdtTestDev_EntradaRetencao, data.usrid, data.assid, dataRetencao, 'chaveNfe');
        data.id_retencao_ref = id_retencao_ref;
    }

    //?return SetObjectResponse(true, data, true);
    return true;
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
