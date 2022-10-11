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
    const data = JSON.parse(json);
    onergy.log('JFS - init Finalizado Processo de Retenção: ' + JSON.stringify(data.chaveNfe));
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
    let obj = {
        cond: cond,
        json: JSON.stringify(json),
        WaitingWebHook: WaitingWebHook,
    };
    return obj;
}

//!METODOS PADRAO ===
const jsonCpf = {
    chaveNfe: '07882930000165_20220523_331219__28060172891',
    cnpj: '28060172891',
    razaoSocial: 'ARMANDO CLAPIS 13.RI CNPJ:4557293/0001-46',
    numeroNf: '331219',
    dest_cnpj: '07882930000165',
    razao_social_tomador: 'MITRE REALTY EMPREENDIMENTOS E PARTICIPACOES S.A.',
    valorNFe: 63.69,
    urlpdf: 'https://taxapi.onetech.com.br/api/nfse/7a42f7a1-6705-3d21-b0b0-1b676c981856/pdf?id=628cf18fe9abde2bf420658a',
    dtEmissaoNfDate: '2022-05-23 14:12:15',
    dtEmissaoNf: '2022-05-23 11:12:15',
    dtEntradaDate: '2022-05-24 17:54:07',
    dtEntrada: '2022-05-24 14:54:07',
    tipo: 'NFSE',
    conteudo:
        'Emissão de certidão(ões) de imóvel(is) inscrito(s) no 13º Oficial de Registro de Imóveis da Capital, conforme pedido protocolado sob o número 731074.\n\n Oficial..............R$      38,17\n Estado...............R$      10,85\n IPESP................R$       7,43\n Registro Civil ......R$       2,01\n Tribunal de Justiça..R$       2,62\n Prefeitura...........R$       0,78\n Ministério Público...R$       1,83\n Total................R$      63,69\n\nDeduções da base de cálculo nos termos do disposto no art. 14-A da Lei Municipal nº 13.701, de 24/12/2003, e em conformidade com a sentença proferida pelo MM Juízo da 1ª Vara da Fazenda Pública em Mandado de Segurança de São Paulo, Processo nº 053.09.16575-9.',
    urlxml: 'https://taxfystorage.blob.core.windows.net/nfse/WSSaoPaulo/32790ced-5ec5-4a6c-a05c-d30c47c9260f/07882930000165/2022/05/24/628cf18fe9abde2bf420658a.xml?sv=2015-07-08&sr=b&sig=L0TnPT2sIxMPhhKKgwblSQtLLp0vAkYwXxCwWveGYuc%3D&se=2022-12-10T14%3A54%3A07Z&sp=r',
    codServico: '3877',
    munPrestador: 3550308,
    munTomador: 3550308,
    codIBGEMunicipioNota: 3550308,
    municipioPrestacao: '',
    nomeMunicipioPrestacao: '',
    ISSRetido: false,
    prestadorCEP: 1435001,
    po: '',
    dtCancelamento: null,
    descricao_de_servico: '',
    txOrigemNota: 'Web Service',
    txValorBaseCalculo: 63.69,
    txValorLiquidoNfse: 63.69,
    txVlIrrf: 0,
    txVlCsll: 0,
    txVlCofins: 0,
    txVlPis: 0,
    txValorIss: 0.77,
    txVlInss: 0,
    txVlDeducoes: 24.74,
    txISSAliq: 0.02,
    txValorTotalRecebido: 0,
    txSerieNFse: null,
    txRpsNumero: '333442',
    txRpsSerie: 'REG',
    txPrestEndereco: 'SAO GABRIEL',
    txPrestEndTipoLogradouro: 'AV',
    txPrestEndNumero: '00201',
    txPrestEndComplemento: 'SALAS 101 A 110',
    txPrestEndBairro: 'JARDIM PAULISTA',
    txPrestEndUf: 'SP',
    txPrestEndCodMunicipio: 3550308,
    txPrestEndNomeMunicipio: 'São Paulo',
    txPrestEndCep: 1435001,
    txPrestEndTelefone: null,
    txPrestEndEmail: 'contasapagar@13registro.com.br',
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
    txCodigoVerificacao: 'VXLSJWEM',
    txTomadEndComplemento: 'ANDAR 5',
    txNrNfseSubst: null,
    txIdlegado: null,
    oneTemplateTitle: '',
    ass_id: 'a278fa91-cf28-4e29-8410-f2bf89a02d93',
    assid: 'a278fa91-cf28-4e29-8410-f2bf89a02d93',
    fedid: 'b12d1339-b69c-4347-802c-1f1750596883',
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
    habilitar_btn_validar_registro_desc: 'Não',
    campo_condicao_pagamento: ' ',
    dtUploadDate: '2022-07-26 18:56:32',
    dtUpload: '2022-07-26 15:56:32',
    upload_data_hora: '26/07/2022 15:56:32',
    responsavel_upload: 'INTEGRAÇÃO',
    selectFinalid: 'Não',
    env: 'CLI',
    necessario_validar_documentos: false,
    aliquota_porcentagem: 2,
    MIMPmun_issdesc:
        'Serviços de registros públicos, cartorários e notariais, exceto autenticação de documentos, reconhecimento de firmas e prestação de informações por qualquer forma ou meio quando o interessado dispensar a certidão correspondente.',
    MIMPlc_cod: '21.01',
    MIMPcodServico_id: '8b1b48f1-1706-4ea2-b9d7-fb4b758fd963',
    MIMPmun_isscod__codServico: '3877',
    po_extraido: null,
    cnpjRaizEmit: '28060172',
    cnpjRaizDest: '07882930',
    prestacao_servicos: 'Não',
    competencia: '05/2022',
    LDOC_documento__tipo_documento: 'NFS-e',
    LDOC_tipo_documento_id: 'e2804a2a-8ed0-355a-9f3a-f3225f867bec',
    id_save_inbox: 'e196a930-01ab-4f40-bf80-417ed36fb80d',
    id_template_inbox: '254907b2-d9fe-4c4c-bc5e-6c4aec3d5bed',
    doc_original: 'f08ed5e9-67ad-4f94-9622-78b63bfccd69',
    id_retencao_ref: 'dd030dfe-a17a-4c5a-ba89-96cc2cfb1eb2',
    cadastro_no_cpom: 'Cadastrado no CEPOM',
    codigo_da_lei_complementar: '21.01-Serviços de registros públicos, cartorários e notariais',
    iss_bitrib: 0,
    simples_nacional: 'Não Optante',
    tot_impostos: null,
    tot_liq: null,
    valor_cofins: null,
    valor_csll: null,
    valor_inss: null,
    valor_irrf: null,
    valor_iss: 0,
    valor_iss_bitrib: 0,
    valor_pispasep: null,
};

const jsonCnpj = {
    chaveNfe: '07882930000165_20220523_1310__42792144000178',
    cnpj: '42792144000178',
    razaoSocial: 'M MENDES LAVANDERIA LTDA',
    numeroNf: '1310',
    dest_cnpj: '07882930000165',
    razao_social_tomador: 'MITRE REALTY EMPREENDIMENTOS E PARTICIPACOES S.A.',
    valorNFe: 651,
    urlpdf: 'https://taxapi.onetech.com.br/api/nfse/7a42f7a1-6705-3d21-b0b0-1b676c981856/pdf?id=628cf183e9abde2bf42064c6',
    dtEmissaoNfDate: '2022-05-23 13:53:19',
    dtEmissaoNf: '2022-05-23 10:53:19',
    dtEntradaDate: '2022-05-24 17:53:56',
    dtEntrada: '2022-05-24 14:53:56',
    tipo: 'NFSE',
    conteudo: 'CONTRATO MITRE Nº 22056\n\nSERVIÇOS DE LAVANDERIA : TICKETS ABAIXO \n\nTICKET 30928\nTICKET 30895\nTICKET 30800\nTICKET 30694',
    urlxml: 'https://taxfystorage.blob.core.windows.net/nfse/WSSaoPaulo/32790ced-5ec5-4a6c-a05c-d30c47c9260f/07882930000165/2022/05/24/628cf183e9abde2bf42064c6.xml?sv=2015-07-08&sr=b&sig=k2yJVvY0BoXRs6EUobJorbw7n8Beu5p9rkWW2wMrJZo%3D&se=2022-12-10T14%3A53%3A56Z&sp=r',
    codServico: '7617',
    munPrestador: 3550308,
    munTomador: 3550308,
    codIBGEMunicipioNota: 3550308,
    municipioPrestacao: '',
    nomeMunicipioPrestacao: '',
    ISSRetido: false,
    prestadorCEP: 1422004,
    po: '',
    dtCancelamento: null,
    descricao_de_servico: '',
    txOrigemNota: 'Web Service',
    txValorBaseCalculo: 651,
    txValorLiquidoNfse: 651,
    txVlIrrf: 0,
    txVlCsll: 0,
    txVlCofins: 0,
    txVlPis: 0,
    txValorIss: 0,
    txVlInss: 0,
    txVlDeducoes: 0,
    txISSAliq: 0,
    txValorTotalRecebido: 0,
    txSerieNFse: null,
    txRpsNumero: null,
    txRpsSerie: null,
    txPrestEndereco: 'FRANCA',
    txPrestEndTipoLogradouro: 'AL',
    txPrestEndNumero: '1348',
    txPrestEndComplemento: null,
    txPrestEndBairro: 'JARDIM PAULISTA',
    txPrestEndUf: 'SP',
    txPrestEndCodMunicipio: 3550308,
    txPrestEndNomeMunicipio: 'São Paulo',
    txPrestEndCep: 1422004,
    txPrestEndTelefone: null,
    txPrestEndEmail: 'jardins.alamedafranca@drycleanusa.com.br',
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
    txCodigoVerificacao: 'HLD3KGPX',
    txTomadEndComplemento: 'ANDAR 5',
    txNrNfseSubst: null,
    txIdlegado: null,
    oneTemplateTitle: '',
    ass_id: 'a278fa91-cf28-4e29-8410-f2bf89a02d93',
    assid: 'a278fa91-cf28-4e29-8410-f2bf89a02d93',
    fedid: '5d570337-9d2e-4916-acd1-6e91cbc78806',
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
    dtUploadDate: '2022-05-24 14:54:48',
    dtUpload: '2022-05-24 11:54:48',
    upload_data_hora: '24/05/2022 11:54:48',
    responsavel_upload: 'INTEGRAÇÃO',
    selectFinalid: 'Não',
    env: 'CLI',
    necessario_validar_documentos: false,
    aliquota_porcentagem: 0,
    MIMPmun_issdesc: 'Tinturaria e lavanderia.',
    MIMPlc_cod: '14.10',
    MIMPcodServico_id: '99e7238d-3fdf-45cd-b96f-de3d0e7c62bf',
    MIMPmun_isscod__codServico: '7617',
    po_extraido: null,
    cnpjRaizEmit: '42792144',
    cnpjRaizDest: '07882930',
    prestacao_servicos: 'Não',
    competencia: '05/2022',
    LDOC_documento__tipo_documento: 'NFS-e',
    LDOC_tipo_documento_id: 'e2804a2a-8ed0-355a-9f3a-f3225f867bec',
    id_save_inbox: '28719d8c-83d2-4826-9127-d580a5599701',
    id_template_inbox: '254907b2-d9fe-4c4c-bc5e-6c4aec3d5bed',
    doc_original: '1643dd07-1b80-4b16-bc19-695b532ce004',
    id_retencao_ref: '8c1a24ad-d93c-4daf-8976-933c6521ca6c',
    anexos: [
        {
            Name: 'Simples.html',
            UrlAzure:
                'https://onebackupservices.blob.core.windows.net/a278fa91-cf28-4e29-8410-f2bf89a02d93/70024289-1dd5-4f1b-a334-2d109eb8cc29.html?sv=2018-03-28&sr=b&sig=rwkxXTq%2FQDDkudzEi%2FYK%2BR9Z6DifCC%2FjcxygC2pAU%2Fo%3D&se=2022-12-10T14%3A55%3A34Z&sp=r',
            Url: 'https://onebackupservices.blob.core.windows.net/a278fa91-cf28-4e29-8410-f2bf89a02d93/70024289-1dd5-4f1b-a334-2d109eb8cc29.html?sv=2018-03-28&sr=b&sig=rwkxXTq%2FQDDkudzEi%2FYK%2BR9Z6DifCC%2FjcxygC2pAU%2Fo%3D&se=2022-12-10T14%3A55%3A34Z&sp=r',
        },
    ],
    codigo_da_lei_complementar: '14.10-Tinturaria e lavanderia',
    iss_bitrib: 0,
    simples_nacional: 'Optante',
    tot_impostos: 0,
    tot_liq: 651,
    valor_cofins: 0,
    valor_csll: 0,
    valor_inss: null,
    valor_iss: 0,
    valor_iss_bitrib: 0,
    valor_pispasep: 0,
};

init(JSON.stringify(jsonCnpj));
