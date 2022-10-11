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
function onergy_updatemany(data) {
    return data;
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
        if (pageResp != null && pageResp.length > 0) {
            keepSearching = pageResp.length == take;
            result = result.concat(pageResp);
        } else {
            keepSearching = false;
        }
    }
    return result;
}

async function sendItemToOnergy(templateid, usrid, assid, data, fedid, ukField) {
    let onergySaveData = {
        fdtid: templateid,
        assid: assid,
        usrid: usrid,
        data: JSON.stringify(data),
    };
    if (fedid != undefined && fedid != '') {
        onergySaveData.id = fedid;
    }
    if (ukField != undefined && ukField != '') {
        onergySaveData.ukField = ukField;
    }
    return await onergy_save(onergySaveData);
}

function getInfoUsrEditReg(data) {
    data.usuario_alteracao = data.onergy_js_ctx.user_name;
    data.usuario_alteracao_id = data.onergy_js_ctx.usrid;
    data.data_alteracao = get_usr_tmz_dt_now({
        assid: data.assid,
        usrid: data.usrid,
    });
}

// Ele vai verificar se o pedido em "Relacionar Pedidos" foi excluido, se for ele irá excluir as validações com o mesmo número de pedido
function VerificaPedidoApagado(data) {
    let filterSearchDuplicate = JSON.stringify([{ FielName: 'ID_ONE_REF', Type: 'string', FixedType: 'string', Value1: data.fedid }]);

    let strBuscDuplicate = getOnergyItem('ed86f53c-c07e-4d66-a71e-add5be02de91', data.assid, data.usrid, filterSearchDuplicate);
    if (strBuscDuplicate != null && strBuscDuplicate.length > 0) {
        for (let duplicate in strBuscDuplicate) {
            let pedidcosData = strBuscDuplicate[duplicate].UrlJsonContext;

            let filterPedidos = JSON.stringify([
                { FielName: 'HDR_SEGMENT1', Type: 'string', FixedType: 'string', Value1: pedidcosData.ped_ref },
                { FielName: '_id', Type: 'string', FixedType: 'string', Value1: data.pedidos_relacionados },
            ]);

            let buscaPedidos = getOnergyItem('38923436-0277-42da-a534-890708524ec8', data.assid, data.usrid, filterPedidos);
            if (buscaPedidos == 0) {
                let postInfoDelet = {
                    UrlJsonContext: {
                        id_user_resp_delet: data.usrid,
                    },
                    BlockCount: 1,
                };

                onergy_updatemany({
                    fdtid: 'ed86f53c-c07e-4d66-a71e-add5be02de91',
                    assid: data.assid,
                    usrid: data.usrid,
                    data: JSON.stringify(postInfoDelet),
                    id: strBuscDuplicate[duplicate].ID,
                    isMultiUpdate: true,
                });
            }
        }
    }

    let filterPedidos2 = JSON.stringify([{ FielName: '_id', Type: 'string', FixedType: 'string', Value1: data.pedidos_relacionados }]);

    let buscaPedidos2 = getOnergyItem('38923436-0277-42da-a534-890708524ec8', data.assid, data.usrid, filterPedidos2);

    if (buscaPedidos2.length == 0) {
        data.status = 'Pendente Pedido';
        data.status_desc = 'Pendente Pedido';
    } else if (buscaPedidos2.length > 0) {
        data.status = 'Executando Validações';
        data.status_desc = 'Executando Validações';
    }

    return data;
}
function init(json) {
    let data = JSON.parse(json);
    let WaitingWebHook = true;
    let cond = true;
    let liberarBtnAprov = false;
    let pedidosSelecionados = data.pedidos_relacionados;
    data = VerificaPedidoApagado(data);
    if (pedidosSelecionados.length > 0) {
        for (let i in data.pedidos_relacionados) {
            let strFiltroPed = JSON.stringify([{ FielName: '_id', Type: 'string', FixedType: 'string', Value1: data.pedidos_relacionados[i] }]);
            let pedidosCtx = getOnergyItem('af5cf9ee-6a7e-46de-85de-1b6e6f470508', data.assid, data.usrid, strFiltroPed);
            let dataProcessoRelacao = {
                doc_original: data.doc_original,
                idfk: data.fedid,
                tipo: data.tipo,
                data_id_inbox: data.fedid,
                ERP_erp_type: data.ERP_erp_type,
                id_template_inbox: data.fdtid,
                habilitar_validacao_comercial: data.habilitar_validacao_comercial,
                habilitar_validacao_fiscal: data.habilitar_validacao_fiscal_taxfy_link,
                id_ref_validacoesComercial: data.id_ref_validacoesComercial,
                inbox_automatico: data.inbox_automatico,
                forma_integracao: data.forma_integracao,
                cnpj_destinatario: data.dest_cnpj,
                po: pedidosCtx[0].UrlJsonContext.HDR_SEGMENT1,
            };
            let id_relation_pedido = sendItemToOnergy('c97be184-ca7a-4c6f-9f2c-8d015a2d5e64', data.usrid, data.assid, dataProcessoRelacao, null, 'idfk');
            data.id_relation_pedido = id_relation_pedido;
        }
    }
    // pegar informações do usr que acabou de editar o registro (caso isso ja nao tenha sido feito no formulario)
    if (!data.usuario_alteracao && data.validacao_usuario == '1') {
        getInfoUsrEditReg(data);
    }
    // se registro nao for configurado para ter validação comercial, logo o validComercialCheck = true
    if (data.habilitar_validacao_comercial != 'Sim') {
        data.validComercialCheck = 'sucesso';
    }
    // se registro nao for configurado para ter validação fiscal, logo o validFiscalCheck = true
    if (data.habilitar_validacao_fiscal_taxfy_link != 'Sim') {
        data.validFiscalCheck = 'sucesso';
    }
    // mudar o caminho que o registro vai seguir no processo
    if (data.habilitar_workflow_aprovacao == 'Não') {
        cond = false;
    } else if (data.habilitar_workflow_aprovacao == 'Sim') {
        cond = true;
    }
    // esse if sera usado para nao deitar o usr aprovar registros que ele nao pode aprovar usando o botao do grid. Foi necessario tratar desse jeito pq esse botao pode aparecer quando for selecionado mais de um registro no grid
    if (
        data.inbox_automatico == 'nao' &&
        data.validComercialCheck != 'erro' &&
        data.validFiscalCheck != 'erro' &&
        data.habilitar_btn_validar_registro == 'Sim'
    ) {
        liberarBtnAprov = true;
    }
    if (
        (data.validComercialCheck == 'sucesso' && data.validFiscalCheck == 'sucesso' && data.inbox_automatico == 'sim') ||
        data.autorizar_liberacao_com_erros === 'Autorizado' ||
        (data.validacao_usuario == '1' && liberarBtnAprov)
    ) {
        WaitingWebHook = false;
    }
    //?return SetObjectResponse(cond, data, WaitingWebHook);
    return true;
}
function initBefore(json) {
    return true;
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

init(JSON.stringify(json));
