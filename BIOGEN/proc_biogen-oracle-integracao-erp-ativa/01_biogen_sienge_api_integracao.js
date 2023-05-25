/**NODE_ENV ===
 */
let { date } = require('assert-plus');
let { formatDate } = require('tough-cookie');
let { log, debug } = require('console');
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
function successCallback(result) {
    console.log('It succeeded with ' + result);
}

/*
=============================   SCRIPT    =============================
*/

async function init(json) {
    var data = JSON.parse(json);
    onergy.log(JSON.stringify({
        "Origem": "BIOGEN - SIENGE - API - INTEGRAÇÃO:init",
        "Data": data
    }));
    onergy.log('IP - documento chegou para integração no processo ativo da Biogen');
    //data.customIntegracao = {};
    //data.customIntegracao.retornoMsg = '';
    //data.customIntegracao.retornoMsg = 'TIPO DE DOCUMENTO NÃO CONFIGURADO PARA INTEGRAÇÃO: ' + data.tipo;

    let r = await integraDocumento(data);
    //onergy.log('CB callAPIsIntegracao: ' + JSON.stringify(r));

    //SUCESSO=200 DOCUMENTO INSERIDO; ATUALMENTE A API NÃO RETORNA O ID DO ITULO
    //TEREMOS QUE BUSCAR, POIS PRECISA PRA ANEXAR O ARQUIVO AO TITULO INSERIDO.
    data = {
        customIntegracao: {
            condRetornoIntegracao: true,
            retornoMsg: '',
            waitingWebHookRetornoIntegracao: true
        }
    };
    if (r.Code == 200) {
        // data = {
        //     respostaIntegracao: [{
        //         STATUS_INT: 'S', // SE PASSAR 'E' => ERRO
        //         FASE: 'RI', // SUCESSO
        //         MESSAGE: 'COMPLETO'
        //     }]
        // };
        data.customIntegracao.condRetornoIntegracao = true;
        data.customIntegracao.retornoMsg = 'SUCCESS';
        data.customIntegracao.waitingWebHookRetornoIntegracao = false;
    }
    else {
        r.clientMessage = 'Informações do titulo não encontradas';
        // data = {
        //     respostaIntegracao: [{
        //         STATUS_INT: 'E', // SE PASSAR 'E' => ERRO
        //         FASE: 'RI', // SUCESSO
        //         MESSAGE: `ERRO NO RETORNO DA INTEGRAÇÃO ${r.detail} ${r.errorDetails}`
        //     }]
        // };
        data.customIntegracao.condRetornoIntegracao = false;
        data.customIntegracao.retornoMsg = `ERROR: ${r.errorDetails}`;
        data.customIntegracao.waitingWebHookRetornoIntegracao = false;
    }

    //data.customIntegracao.condRetornoIntegracao = r.status == 200;
    //.customIntegracao.waitingWebHookRetornoIntegracao = false;
    delete data.respostaIntegracao;
    return SetObjectResponse(true, data, false);
}

function initBefore(json) {
    //return true;
}

function initDelete(json) {
    //return true;
}

async function getOnergyItem(fdtid, assid, usrid, filtro, skip, take, ID) {

    let OPTION = {
        fdtid: fdtid,
        assid: assid,
        usrid: usrid,
        filter: filtro
    };

    if (ID)
        OPTION.fedid = ID;

    var r = awaitonergy_get(OPTION);
    return JSON.parse(r);
}

function SetObjectResponse(cond, json, WaitingWebHook) {
    if (WaitingWebHook === undefined)
        WaitingWebHook = false;

    var obj = {
        'cond': cond,
        'json': JSON.stringify(json),
        'WaitingWebHook': WaitingWebHook,
    };

    if (!WaitingWebHook) {
        //RETORNO PARA O FLUXO DA INTEGRAÇÃO ERP APÓS A ATIVIDADE ATIVA.
        obj["onergy_prc_id"] = 'b45d6b8b-e386-4354-69f5-703524c30542';                  // id do processo: Integração ERP
        obj["onergy_new_prc_id_fdtid"] = 'b6d0d6b6-8e73-41da-8aab-9f8d0eec8173';        // id da tarefa: Documentos em Processamento
    }

    return obj;
}

async function sendItemToOnergy(templateid, usrid, assid, data, fedid) {
    let onergySaveData = {
        fdtid: templateid,
        assid: assid,
        usrid: usrid,
        data: JSON.stringify(data),
        executeAction: false,
    };
    if (fedid != undefined && fedid != '') {
        onergySaveData.id = fedid;
    }
    return await onergy_save(onergySaveData);
}
/**
 * @param method GET/POST/PUT/PATH
 * @param filter
 */

async function getIdNf(data) {
    // verificar o ultimo numero de integração, icrementar mais um e atualizar;
    let fdtidIntregraBiogen = "b3cc6335-f322-4863-930d-1a530059a0c8";
    let strFiltro = JSON.stringify([
        { FielName: "chave", Type: 'string', FixedType: 'string', Value1: "contador-idnf" },
    ]);
    let getIdNf = await getOnergyItem(fdtidIntregraBiogen, data.assid, data.usrid, strFiltro);

    let lastNF = getIdNf[0].UrlJsonContext.ID_NF;
    let atualNf = lastNF + 1;

    let ctxRegUsr = {
        ID_NF: atualNf,
    };
    onergy.log("IP - ATUAL IDNF: " + atualNf);
    let idRegSave = await sendItemToOnergy(fdtidIntregraBiogen, data.usrid, data.assid, ctxRegUsr, getIdNf[0].ID);

    return lastNF;
}

async function gerarObjInt(data) {

    let idNf = await getIdNf(data);

    let postInfo = {
        "id_usr_resp_int": utils.GetNewGuid(),
        "NOTA_FISCAL": [
            {
                "IR_INVOICE": [
                    {
                        "INTERFACE_INVOICE_ID": "",
                        "CHAVE_NFF_COMP": "",
                        "CREATED_BY": "",
                        "CREATION_DATE": "",
                        "DESTINATION_CITY_ID": data.conteudo.NFe.infNFe.dest.enderDest.cMun,
                        "DESTINATION_IBGE_CITY_CODE": "",
                        "DESTINATION_STATE_CODE": "",
                        "DESTINATION_STATE_ID": data.conteudo.NFe.infNFe.dest.enderDest.UF,
                        "ID_ARQUIVO": idNf.toString(),
                        "ID_DOCSYS": "",
                        "ID_NF": (idNf + 1).toString(),
                        "LAST_UPDATE_DATE": "",
                        "LAST_UPDATED_BY": "",
                        "LP_INSS_AMOUNT": "",
                        "LP_INSS_BASE_AMOUNT": "",
                        "LP_INSS_INITIAL_BASE_AMOUNT": "",
                        "LP_INSS_NET_AMOUNT": "",
                        "LP_INSS_RATE": "",
                        "SOURCE_CITY_ID": data.conteudo.NFe.infNFe.emit.enderEmit.cMun,
                        "SOURCE_IBGE_CITY_CODE": "",
                        "SOURCE_STATE_CODE": "",
                        "SOURCE_STATE_ID": data.conteudo.NFe.infNFe.emit.enderEmit.UF,
                        "STATUS_IFACE": "",
                        "ALIQUOTA_INSS_INDIVIDUAL": "",
                        "BASE_ICMS_CAPA": data.valorNFe,
                        "CHAVE_NFE": data.chaveNfe,
                        "CNPJ": data.cnpj,
                        "CODIGO_EMPRESA": "",
                        "DATA_EMISSAO": convertDate(data.dtEmissaoNfDate),//DD-Mon-YYYY
                        "DATA_GL": "",
                        "DATA_RI": "",
                        "ESPECIE": "E-014",
                        "ESTABELECIMENTO": "Brazil/INV",
                        "FORNECEDOR": data.razaoSocial,
                        "ICMS_ST_AMOUNT": data.conteudo.NFe.infNFe.total.ICMSTot.vST,
                        "ICMS_ST_BASE": data.conteudo.NFe.infNFe.total.ICMSTot.vBCST,
                        "INDICADOR_DFE": "",
                        "INSS_AMOUNT": "",
                        "INSS_BASE": "",
                        "INSS_TAX": "",
                        "IR_AMOUNT": "0.00",
                        "IR_BASE": "0.00",
                        "IR_CATEG": "",
                        "IR_TAX": "0.00",
                        "ISS_AMOUNT": "0.00",
                        "ISS_BASE": "0.00",
                        "NATUREZA_FRETE": data.conteudo.NFe.infNFe.transp.modFrete,
                        "NUM_NOTA": data.numeroNf,
                        "OBS_ADICIONAIS_COMENTARIOS": data.conteudo.NFe.infNFe.infAdic.infCpl,
                        "OUTRAS_DESPESAS": "0.00",
                        "OUTRAS_INF_DESCRICAO": "",
                        "SERIE": data.conteudo.NFe.infNFe.ide.serie,
                        "TIPO_CREDITO": "",
                        "TIPO_DOC": data.tipo,
                        "TIPO_FRETE": "",
                        "TIPO_ICMS": "",
                        "TIPO_OBSERVACAO": "",
                        "TIPO_PAGAMENTO": "",
                        "VALOR_FRETE": data.conteudo.NFe.infNFe.total.ICMSTot.vFrete,
                        "VALOR_ICMS_CAPA": data.conteudo.NFe.infNFe.total.ICMSTot.vICMS,
                        "VALOR_INSS_IND_FATURADO": "",
                        "VALOR_INSS_INDIVIDUAL": "",
                        "VALOR_IPI": data.conteudo.NFe.infNFe.total.ICMSTot.vIPI,
                        "VALOR_TOTAL": data.valorNFe,
                        "VENDOR_IR": "",
                    }
                ]
            }
        ]
    };

    postInfo.NOTA_FISCAL[0].IR_INVOICE[0].REC_INVOICE_LINES = [];

    if (data.tipo == "NFE") {
        let itens = data.conteudo.NFe.infNFe.det;
        for (let i in itens) {
            let icms = getIcms(itens[i].imposto.ICMS); // buscar em qual campo o icms esta
            let icmsSt = getIcmsSt(itens[i].imposto.ICMS); // buscar em qual campo o icmsst esta
            let pis = getPis(itens[i].imposto.PIS); // buscar em qual campo o pis esta
            let cofins = getCofins(itens[i].imposto.COFINS); // buscar em qual campo o cofins esta
            let numberLine = parseInt(itens[i].nItem); // passar a linha da nf

            let line = {
                "INTERFACE_INVOICE_LINE_ID": "",
                "N_LINHA_ARQUIVO": (numberLine + 1).toString(),
                "N_LINHA_NF": numberLine.toString(),
                "ACCOUNT_DIGIT": "",
                "ACCOUNT_NAME": "",
                "ACCOUNT_NUMBER": "",
                "ALIQUOTA_COFINS": cofins.pCOFINS,
                "ALIQUOTA_ICMS": icms.pICMS,
                "ALIQUOTA_IPI": itens[i].imposto.IPI.IPITrib.pIPI,
                "ALIQUOTA_ISS": "",
                "ALIQUOTA_PIS": pis.pPIS,
                "AWT_NAME": "",
                "BAIRRO": data.conteudo.NFe.infNFe.emit.enderEmit.xBairro,
                "BANK_NUMBER": "",
                "BASE_COFINS": cofins.vBC,
                "BASE_ICMS": icms.vBC,
                "BASE_IPI": itens[i].prod.vProd,
                "BASE_ISS": "",
                "BASE_PIS": pis.vBC,
                "BRANCH_NAME": "",
                "BRANCH_NUMBER": "",
                "BRANCH_NUMBER_COMPLEMENT": "",
                "CAMPO_CEST": itens[i].prod.CEST,
                "CATEGORIA_ATIVO": "",
                "CEP": data.conteudo.NFe.infNFe.emit.enderEmit.CEP,
                "CFOP": itens[i].prod.CFOP,
                "CIDADE": data.conteudo.NFe.infNFe.emit.enderEmit.cMun,
                "CLASSIFICACAO_FISCAL": itens[i].prod.NCM,
                "CNPJ_TERCEIRO": itens[i].prod.CNPJFab,
                "CODIGO_FORNECEDOR": data.cnpjRaizEmit,
                "CODIGO_IBGE": "",
                "COMBINACAO_CONTABIL": "01.000.000000.10101010101000001.3.0000000000.0000000000.0000000000.0000000000",
                "COMPLEMENTO": data.conteudo.NFe.infNFe.emit.enderEmit.xCpl,
                "CST_COFINS": cofins.CST,
                "CST_ICMS": icms.CST,
                "CST_IPI": itens[i].imposto.IPI.IPITrib.CST,
                "CST_PIS": pis.CST,
                "DESCONTO": itens[i].vDesc,
                "DESCRICAO": itens[i].prod.xProd,
                "DV_DOCUMENTO": data.conteudo.NFe.infNFe.ide.cDV,
                "ENDERECO": data.conteudo.NFe.infNFe.emit.enderEmit.xLgr,
                "ESTADO": data.conteudo.NFe.infNFe.emit.enderEmit.UF,
                "FILIAL_DOCUMENTO": "",
                "FORMA_IMPORTACAO": "0.00",
                "FRETE": itens[i].prod.vFrete,
                "ICMS_ST_AMOUNT": icmsSt.vICMSST,
                "ICMS_ST_AMOUNT_RECOVER": icmsSt.vICMSSTRet,
                "ICMS_ST_BASE": icmsSt.vBCSTRet,
                "IDENTIFICADOR_BEM_IMOB": "",
                "INDICADOR_TRIB_ICMS": "",
                "INDICADOR_TRIB_IPI": "",
                "INSCRICAO_ESTADUAL": data.conteudo.NFe.infNFe.emit.IE,
                "INSCRICAO_MUNICIPAL": data.conteudo.NFe.infNFe.emit.IM,
                "ITEM_CODE": itens[i].prod.cProd,
                "NATUREZA_OPERACAO": "",
                "NATUREZA_BASE_CREDITO": "",
                "NOME_FORNECEDOR": data.razaoSocial,
                "NOTA_REFERENCIADA": "",
                "NOTA_SAIDA_REFERENCIA": "",
                "NUMERO": data.conteudo.NFe.infNFe.emit.enderEmit.nro,
                "NUMERO_PO": data.po_extraido.replace(/\D+/g, ""),
                "OPERACAO_CONSUMIDOR": "",
                "OUTRAS_DESPESAS": itens[i].prod.vOutro,
                "PAIS": data.conteudo.NFe.infNFe.emit.enderEmit.cPais,
                "PERCENTUAL_MERCAD_DEVOLVIDA": "0.00",
                "PIS_PASEP_NIT": "",//itens[i].imposto.PIS.PISNT, *****ERRADO
                "PO_LINE": "1",//TODO: buscar linha do pedido consumida pelo item (pedido pode ter mais de uma linha)
                "PRECO_UNITARIO": "",
                "PRESENCA_COMPRADOR": "",
                "QUANTIDADE": itens[i].prod.vProd,
                "RAIZ_DOCUMENTO": "",
                "RECOPI_NUMBER": itens[i].prod.nRECOPI,
                "SITE_FORNECEDOR": "",
                "TIPO_CONTRIBUINTE": "",
                "TIPO_INSCRICAO": data.conteudo.NFe.infNFe.emit.CNPJ ? data.conteudo.NFe.infNFe.emit.CNPJ : data.conteudo.NFe.infNFe.emit.CPF,
                "UF_TERCEIRO": "",
                "UNIDADE": "EACH",
                "UTIL_BEM_INC_ATIVO_IMOB": "",
                "UTILIZACAO_FISCAL": "",
                "VALOR_AFRMM": "0.00",
                "VALOR_COFINS": cofins.vCOFINS,
                "VALOR_ICMS": icms.vICMS,
                "VALOR_IPI": itens[i].imposto.IPI.IPITrib.vIPI,
                "VALOR_ISS": "",
                "VALOR_PIS": pis.vPIS,
                "VIA_TRANSPORTE": ""
            };

            postInfo.NOTA_FISCAL[0].IR_INVOICE[0].REC_INVOICE_LINES.push(line);
        }
    }
    return postInfo;
}

function getCofins(cofins) {
    if (cofins.COFINSAliq != null)
        return cofins.COFINSAliq;
    else if (cofins.COFINSNT != null)
        return cofins.COFINSNT;
    else if (cofins.COFINSOutr != null)
        return cofins.COFINSOutr;
    else if (cofins.COFINSQtde != null)
        return cofins.COFINSQtde;
}

function getPis(pis) {
    if (pis.PISAliq != null)
        return pis.PISAliq;
    else if (pis.PISNT != null)
        return pis.PISNT;
    else if (pis.PISOutr != null)
        return pis.PISOutr;
    else if (pis.PISQtde != null)
        return pis.PISQtde;
}

function getIcmsSt(icmsSt) {
    if (icmsSt) {
        if (icmsSt.ICMSST != null)
            return icmsSt.ICMSST;
    }
    return icmsSt = "";
}

function getIcms(icms) {
    if (icms.ICMS00 != null)
        return icms.ICMS00;
    else if (icms.ICMS10 != null)
        return icms.ICMS10;
    else if (icms.ICMS20 != null)
        return icms.ICMS20;
    else if (icms.ICMS30 != null)
        return icms.ICMS30;
    else if (icms.ICMS40 != null)
        return icms.ICMS40;
    else if (icms.ICMS51 != null)
        return icms.ICMS51;
    else if (icms.ICMS60 != null)
        return icms.ICMS60;
    else if (icms.ICMS70 != null)
        return icms.ICMS70;
    else if (icms.ICMS90 != null)
        return icms.ICMS90;
    else if (icms.ICMSPart != null)
        return icms.ICMSPart;
    else if (icms.ICMSSN101 != null)
        return icms.ICMSSN101;
    else if (icms.ICMSSN102 != null)
        return icms.ICMSSN102;
    else if (icms.ICMSSN201 != null)
        return icms.ICMSSN201;
    else if (icms.ICMSSN202 != null)
        return icms.ICMSSN202;
    else if (icms.ICMSSN500 != null)
        return icms.ICMSSN500;
    else if (icms.ICMSSN900 != null)
        return icms.ICMSSN900;
}

async function integraDocumento(data) {
    onergy.log("IP - Entrou no integraDocumento");
    let accessToken = await geraToken(data.assid, data.usrid, data.fedid);
    let postInfo = await gerarObjInt(data);
    onergy.log("valor do retorno do token: " + accessToken.access_token);

    let url = onergy.GetSubscriptionConfig("endpoint-integration");

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: url,
        headers: {
            'Authorization': `Bearer ${accessToken.access_token}`,
            'Content-Type': 'application/json'
        },
        data: postInfo
    };

    onergy.log("IP - antes de chamar a integração do documento");

    await ajax({
        url: config.url,
        assid: data.assid,
        usrid: data.usrid,
        fedid: data.fedid,
        method: config.method,
        data: JSON.stringify(config.data),
        contentType: 'application/json',
        contentTypeCharSet: "",
        headers: JSON.stringify(config.headers),
        async: false,
        success: function (dataresult) {
            //SUCESSO
            if (dataresult == '') {
                result = {
                    status: 200,
                    clientMessage: ''
                };
            }
            else {
                result = JSON.parse(dataresult);
            }
        },
        error: function (err) {
            let objResult = {
                errorDetails: ''
            };
            try {
                result = JSON.parse(err);
                objResult.errorDetails = `detail: ${result.detail} \n errorCode: ${result['o:errorCode']} \n errorInstance: ${result['o:errorDetails'].instance} \n errorCode: ${result['o:errorDetails']['o:errorCode']} \n errorPath: ${result['o:errorDetails']['o:errorPath']} \n errorDetails: ${result['o:errorDetails'].title} \n errorType: ${result['o:errorDetails'].type} \n title: ${result.title} \n type: ${result.type} \n`;
            } catch {
                objResult.errorDetails = err;
            }
            result = objResult;
        }
    });
    //onergy.log("IP - depois de chamar: " + JSON.stringify(strRespToken));
    return result;
}

function convertDate(date) {
    //DD-MON-YYYY
    let dtConvert = new Date(date);
    let dia = (dtConvert.toString()).slice(8, 10);
    let mes = dtConvert.toString().slice(4, 7).toUpperCase();
    let retorno = dia + "-" + mes + "-" + dtConvert.getFullYear();
    return retorno;
}

async function geraToken(assid, usrid, fedid) {

    let token = onergy.GetSubscriptionConfig("token");
    let endpoint = onergy.GetSubscriptionConfig("endpoint-token");
    let garant_type = onergy.GetSubscriptionConfig("garant_type");
    let cliente_secret = onergy.GetSubscriptionConfig("cliente_secret");
    let cliente_id = onergy.GetSubscriptionConfig("cliente_id");
    let contentType = "application/x-www-form-urlencoded";

    var configPost = {
        "url": endpoint + token,
        "method": "POST",
        "timeout": 0,
        "data": {
            "grant_type": garant_type,
            "client_secret": cliente_secret,
            "client_id": cliente_id
        }
    };
    let strRespToken = "";
    await ajax({
        url: configPost.url,
        assid: assid,
        usrid: usrid,
        fedid: fedid,
        method: configPost.method,
        data: JSON.stringify(configPost.data),
        contentType: contentType,
        contentTypeCharSet: "",
        datatype: "x-www-form-urlencoded",
        headers: JSON.stringify(configPost.headers),
        async: false,
        success: function (dataresult) {
            //SUCESSO
            if (dataresult == '') {
                result = {
                    status: 200,
                    clientMessage: ''
                };
            }
            else {
                result = JSON.parse(dataresult);
            }
        },
        error: function (err) {
            result = JSON.parse(err);
        }
    });
    return result;
}

//====================================================================================================
const jsonInput = {
    "chaveNfe": "35221103746938000143550030029036091072414765",
    "cnpj": "03746938000143",
    "razaoSocial": "BRS SP SUPRIMENTOS CORPORATIVOS S/A",
    "numeroNf": "2903609",
    "dest_cnpj": "07986222000174",
    "razao_social_tomador": "BIOGEN BRASIL PRODUTOS FARMACEUTICOSLTDA",
    "valorNFe": 1516.39,
    "urlpdf": "https://gateway.taxfy.com.br/v1/api/nfe/danfe?subscription-key=4220c09ea0dd470cb3c130dbbf0863d2&cusid=be927d44-32c9-4263-b00f-bc3c674c6adb&id=6453a7016636e198167b3b67&subid=d9ad1203-b64d-dfbe-b067-17fffb495194",
    "dtEmissaoNfDate": "2022-11-05T04:40:16Z",
    "dtEmissaoNf": "2022-11-05 01:40:16",
    "dtEntradaDate": "2023-05-04T12:37:21Z",
    "dtEntrada": "2023-05-04 09:37:21",
    "tipo": "NFE",
    "conteudo": {
        "Id": "6453a7016636e198167b3b66",
        "sub_id": "d9ad1203-b64d-dfbe-b067-17fffb495194",
        "NFe": {
            "infNFe": {
                "ide": {
                    "cUF": 19,
                    "cNF": "07241476",
                    "natOp": "VENDA DE MERCADORIA ADQUIRIDA",
                    "mod": 0,
                    "serie": "3",
                    "nNF": "2903609",
                    "dhEmi": "2022-11-05T04:40:16Z",
                    "dEmi": "2022-11-05T04:40:16Z",
                    "dhSaiEnt": null,
                    "tpNF": 1,
                    "idDest": 0,
                    "cMunFG": "3548708",
                    "tpImp": 1,
                    "tpEmis": 0,
                    "cDV": "5",
                    "tpAmb": 0,
                    "finNFe": 0,
                    "indFinal": 1,
                    "indPres": 6,
                    "procEmi": 0,
                    "verProc": "NeoGrid Fiscal",
                    "dhCont": null,
                    "xJust": null,
                    "NFref": null
                },
                "emit": {
                    "CNPJ": "03746938000143",
                    "CPF": null,
                    "ItemElementName": 0,
                    "xNome": "BRS SP SUPRIMENTOS CORPORATIVOS S/A",
                    "xFant": "BRS SP SUPRIMENTOS CORPORATIVOS LTDA",
                    "enderEmit": {
                        "xLgr": "RUA JOSE MARTINS FERNANDES",
                        "nro": "601",
                        "xCpl": "(CL IMIGRANTE) GALPAO 32",
                        "xBairro": "BATISTINI",
                        "cMun": "3548708",
                        "xMun": "SAO BERNARDO DO CAMPO",
                        "UF": 25,
                        "CEP": "09843400",
                        "cPais": 0,
                        "cPaisSpecified": true,
                        "xPais": 1,
                        "xPaisSpecified": true,
                        "fone": null
                    },
                    "IE": "799061402111",
                    "IEST": null,
                    "IM": null,
                    "CNAE": null,
                    "CRT": 3
                },
                "avulsa": null,
                "dest": {
                    "CNPJ": "07986222000174",
                    "CPF": null,
                    "idEstrangeiro": null,
                    "xNome": "BIOGEN BRASIL PRODUTOS FARMACEUTICOSLTDA",
                    "enderDest": {
                        "xLgr": "R FUNCHAL",
                        "nro": "418",
                        "xCpl": "AND 7 CJ 701 E 702",
                        "xBairro": "VL OLIMPIA",
                        "cMun": "3550308",
                        "xMun": "SAO PAULO",
                        "UF": 25,
                        "CEP": "04551060",
                        "cPais": "1058",
                        "xPais": "BRASIL",
                        "fone": null
                    },
                    "indIEDest": 0,
                    "IE": "149571484118",
                    "ISUF": null,
                    "IM": null,
                    "email": "adenaide.bertezini@biogen.com"
                },
                "retirada": null,
                "entrega": null,
                "autXML": null,
                "det": [
                    {
                        "prod": {
                            "cProd": "001579",
                            "cEAN": "7897866010174",
                            "xProd": "Pasta AZ Chies LL 1017-4 Oficio Classic Azul Royal",
                            "NCM": "48203000",
                            "NVE": null,
                            "CEST": null,
                            "indEscalaSpecified": false,
                            "CNPJFab": null,
                            "cBenef": null,
                            "EXTIPI": null,
                            "CFOP": "5102",
                            "uCom": "UN",
                            "qCom": "10.00",
                            "vUnCom": "20.17",
                            "vProd": "201.70",
                            "cEANTrib": "7897866010174",
                            "uTrib": "UN",
                            "qTrib": "10.00",
                            "vUnTrib": "20.17",
                            "vFrete": null,
                            "vSeg": null,
                            "vDesc": null,
                            "vOutro": null,
                            "indTot": 1,
                            "DI": null,
                            "detExport": null,
                            "xPed": "PO 13495",
                            "nItemPed": "0",
                            "nFCI": null,
                            "rastro": null,
                            "arma": null,
                            "comb": null,
                            "med": null,
                            "nRECOPI": null,
                            "veicProd": null
                        },
                        "imposto": {
                            "vTotTrib": null,
                            "ICMS": {
                                "ICMS00": {
                                    "pFCP": null,
                                    "vFCP": null,
                                    "CST": "00",
                                    "vBC": "201.70",
                                    "modBC": "3",
                                    "vICMS": "36.31",
                                    "pICMS": "18.00",
                                    "orig": 0,
                                    "CSOSN": 0,
                                    "pCredSN": null,
                                    "pMVAST": null,
                                    "pICMSST": null,
                                    "vICMSST": null,
                                    "pRedBC": null
                                },
                                "ICMS10": null,
                                "ICMS20": null,
                                "ICMS30": null,
                                "ICMS40": null,
                                "ICMS51": null,
                                "ICMS60": null,
                                "ICMS70": null,
                                "ICMS90": null,
                                "ICMSPart": null,
                                "ICMSSN101": null,
                                "ICMSSN102": null,
                                "ICMSSN201": null,
                                "ICMSSN202": null,
                                "ICMSSN500": null,
                                "ICMSSN900": null,
                                "ICMSST": null
                            },
                            "II": null,
                            "IPI": {
                                "CNPJProd": null,
                                "cSelo": null,
                                "qSelo": null,
                                "cEnq": "999",
                                "IPINT": null,
                                "IPITrib": {
                                    "CST": "99",
                                    "pIPI": "0.00",
                                    "qUnid": null,
                                    "vBC": "0.00",
                                    "vUnid": null,
                                    "vIPI": "0.00"
                                }
                            },
                            "ISSQN": null,
                            "PIS": {
                                "PISAliq": {
                                    "pPIS": "1.65",
                                    "vPIS": "2.73",
                                    "vBC": "165.39",
                                    "CST": "01",
                                    "qBCProd": null,
                                    "vAliqProd": null
                                },
                                "PISNT": null,
                                "PISOutr": null,
                                "PISQtde": null
                            },
                            "PISST": null,
                            "COFINS": {
                                "COFINSAliq": {
                                    "CST": "01",
                                    "pCOFINS": "7.60",
                                    "vBC": "165.39",
                                    "vCOFINS": "12.57"
                                },
                                "COFINSNT": null,
                                "COFINSOutr": null,
                                "COFINSQtde": null
                            },
                            "COFINSST": null,
                            "ICMSUFDest": null
                        },
                        "impostoDevol": null,
                        "infAdProd": null,
                        "nItem": "1"
                    },
                    {
                        "prod": {
                            "cProd": "003813",
                            "cEAN": "7899381038138",
                            "xProd": "Fita Adesiva Scotch 3M 45mmX45m 5802 Hot Melt Transparente",
                            "NCM": "39191010",
                            "NVE": null,
                            "CEST": null,
                            "indEscalaSpecified": false,
                            "CNPJFab": null,
                            "cBenef": null,
                            "EXTIPI": null,
                            "CFOP": "5102",
                            "uCom": "UN",
                            "qCom": "16.00",
                            "vUnCom": "5.69",
                            "vProd": "91.04",
                            "cEANTrib": "7899381038138",
                            "uTrib": "UN",
                            "qTrib": "16.00",
                            "vUnTrib": "5.69",
                            "vFrete": null,
                            "vSeg": null,
                            "vDesc": null,
                            "vOutro": null,
                            "indTot": 1,
                            "DI": null,
                            "detExport": null,
                            "xPed": "PO 13495",
                            "nItemPed": "0",
                            "nFCI": null,
                            "rastro": null,
                            "arma": null,
                            "comb": null,
                            "med": null,
                            "nRECOPI": null,
                            "veicProd": null
                        },
                        "imposto": {
                            "vTotTrib": null,
                            "ICMS": {
                                "ICMS00": {
                                    "pFCP": null,
                                    "vFCP": null,
                                    "CST": "00",
                                    "vBC": "91.04",
                                    "modBC": "3",
                                    "vICMS": "16.39",
                                    "pICMS": "18.00",
                                    "orig": 0,
                                    "CSOSN": 0,
                                    "pCredSN": null,
                                    "pMVAST": null,
                                    "pICMSST": null,
                                    "vICMSST": null,
                                    "pRedBC": null
                                },
                                "ICMS10": null,
                                "ICMS20": null,
                                "ICMS30": null,
                                "ICMS40": null,
                                "ICMS51": null,
                                "ICMS60": null,
                                "ICMS70": null,
                                "ICMS90": null,
                                "ICMSPart": null,
                                "ICMSSN101": null,
                                "ICMSSN102": null,
                                "ICMSSN201": null,
                                "ICMSSN202": null,
                                "ICMSSN500": null,
                                "ICMSSN900": null,
                                "ICMSST": null
                            },
                            "II": null,
                            "IPI": {
                                "CNPJProd": null,
                                "cSelo": null,
                                "qSelo": null,
                                "cEnq": "999",
                                "IPINT": null,
                                "IPITrib": {
                                    "CST": "99",
                                    "pIPI": "0.00",
                                    "qUnid": null,
                                    "vBC": "0.00",
                                    "vUnid": null,
                                    "vIPI": "0.00"
                                }
                            },
                            "ISSQN": null,
                            "PIS": {
                                "PISAliq": {
                                    "pPIS": "1.65",
                                    "vPIS": "1.23",
                                    "vBC": "74.65",
                                    "CST": "01",
                                    "qBCProd": null,
                                    "vAliqProd": null
                                },
                                "PISNT": null,
                                "PISOutr": null,
                                "PISQtde": null
                            },
                            "PISST": null,
                            "COFINS": {
                                "COFINSAliq": {
                                    "CST": "01",
                                    "pCOFINS": "7.60",
                                    "vBC": "74.65",
                                    "vCOFINS": "5.67"
                                },
                                "COFINSNT": null,
                                "COFINSOutr": null,
                                "COFINSQtde": null
                            },
                            "COFINSST": null,
                            "ICMSUFDest": null
                        },
                        "impostoDevol": null,
                        "infAdProd": null,
                        "nItem": "2"
                    },
                    {
                        "prod": {
                            "cProd": "004449",
                            "cEAN": "7899381044498",
                            "xProd": "Espiral de Encadernacao Plaspiral 9mm Preto PCT 100UN",
                            "NCM": "39162000",
                            "NVE": null,
                            "CEST": null,
                            "indEscalaSpecified": false,
                            "CNPJFab": null,
                            "cBenef": null,
                            "EXTIPI": null,
                            "CFOP": "5102",
                            "uCom": "UN",
                            "qCom": "1.00",
                            "vUnCom": "16.97",
                            "vProd": "16.97",
                            "cEANTrib": "7899381044498",
                            "uTrib": "UN",
                            "qTrib": "1.00",
                            "vUnTrib": "16.97",
                            "vFrete": null,
                            "vSeg": null,
                            "vDesc": null,
                            "vOutro": null,
                            "indTot": 1,
                            "DI": null,
                            "detExport": null,
                            "xPed": "PO 13495",
                            "nItemPed": "0",
                            "nFCI": null,
                            "rastro": null,
                            "arma": null,
                            "comb": null,
                            "med": null,
                            "nRECOPI": null,
                            "veicProd": null
                        },
                        "imposto": {
                            "vTotTrib": null,
                            "ICMS": {
                                "ICMS00": {
                                    "pFCP": null,
                                    "vFCP": null,
                                    "CST": "00",
                                    "vBC": "16.97",
                                    "modBC": "3",
                                    "vICMS": "3.05",
                                    "pICMS": "18.00",
                                    "orig": 0,
                                    "CSOSN": 0,
                                    "pCredSN": null,
                                    "pMVAST": null,
                                    "pICMSST": null,
                                    "vICMSST": null,
                                    "pRedBC": null
                                },
                                "ICMS10": null,
                                "ICMS20": null,
                                "ICMS30": null,
                                "ICMS40": null,
                                "ICMS51": null,
                                "ICMS60": null,
                                "ICMS70": null,
                                "ICMS90": null,
                                "ICMSPart": null,
                                "ICMSSN101": null,
                                "ICMSSN102": null,
                                "ICMSSN201": null,
                                "ICMSSN202": null,
                                "ICMSSN500": null,
                                "ICMSSN900": null,
                                "ICMSST": null
                            },
                            "II": null,
                            "IPI": {
                                "CNPJProd": null,
                                "cSelo": null,
                                "qSelo": null,
                                "cEnq": "999",
                                "IPINT": null,
                                "IPITrib": {
                                    "CST": "99",
                                    "pIPI": "0.00",
                                    "qUnid": null,
                                    "vBC": "0.00",
                                    "vUnid": null,
                                    "vIPI": "0.00"
                                }
                            },
                            "ISSQN": null,
                            "PIS": {
                                "PISAliq": {
                                    "pPIS": "1.65",
                                    "vPIS": "0.23",
                                    "vBC": "13.92",
                                    "CST": "01",
                                    "qBCProd": null,
                                    "vAliqProd": null
                                },
                                "PISNT": null,
                                "PISOutr": null,
                                "PISQtde": null
                            },
                            "PISST": null,
                            "COFINS": {
                                "COFINSAliq": {
                                    "CST": "01",
                                    "pCOFINS": "7.60",
                                    "vBC": "13.92",
                                    "vCOFINS": "1.06"
                                },
                                "COFINSNT": null,
                                "COFINSOutr": null,
                                "COFINSQtde": null
                            },
                            "COFINSST": null,
                            "ICMSUFDest": null
                        },
                        "impostoDevol": null,
                        "infAdProd": null,
                        "nItem": "3"
                    },
                    {
                        "prod": {
                            "cProd": "004454",
                            "cEAN": "7899381044542",
                            "xProd": "Espiral de Encadernacao Plaspiral 25mm Preto PCT 48UN",
                            "NCM": "39162000",
                            "NVE": null,
                            "CEST": null,
                            "indEscalaSpecified": false,
                            "CNPJFab": null,
                            "cBenef": null,
                            "EXTIPI": null,
                            "CFOP": "5102",
                            "uCom": "UN",
                            "qCom": "1.00",
                            "vUnCom": "28.61",
                            "vProd": "28.61",
                            "cEANTrib": "7899381044542",
                            "uTrib": "UN",
                            "qTrib": "1.00",
                            "vUnTrib": "28.61",
                            "vFrete": null,
                            "vSeg": null,
                            "vDesc": null,
                            "vOutro": null,
                            "indTot": 1,
                            "DI": null,
                            "detExport": null,
                            "xPed": "PO 13495",
                            "nItemPed": "0",
                            "nFCI": null,
                            "rastro": null,
                            "arma": null,
                            "comb": null,
                            "med": null,
                            "nRECOPI": null,
                            "veicProd": null
                        },
                        "imposto": {
                            "vTotTrib": null,
                            "ICMS": {
                                "ICMS00": {
                                    "pFCP": null,
                                    "vFCP": null,
                                    "CST": "00",
                                    "vBC": "28.61",
                                    "modBC": "3",
                                    "vICMS": "5.15",
                                    "pICMS": "18.00",
                                    "orig": 0,
                                    "CSOSN": 0,
                                    "pCredSN": null,
                                    "pMVAST": null,
                                    "pICMSST": null,
                                    "vICMSST": null,
                                    "pRedBC": null
                                },
                                "ICMS10": null,
                                "ICMS20": null,
                                "ICMS30": null,
                                "ICMS40": null,
                                "ICMS51": null,
                                "ICMS60": null,
                                "ICMS70": null,
                                "ICMS90": null,
                                "ICMSPart": null,
                                "ICMSSN101": null,
                                "ICMSSN102": null,
                                "ICMSSN201": null,
                                "ICMSSN202": null,
                                "ICMSSN500": null,
                                "ICMSSN900": null,
                                "ICMSST": null
                            },
                            "II": null,
                            "IPI": {
                                "CNPJProd": null,
                                "cSelo": null,
                                "qSelo": null,
                                "cEnq": "999",
                                "IPINT": null,
                                "IPITrib": {
                                    "CST": "99",
                                    "pIPI": "0.00",
                                    "qUnid": null,
                                    "vBC": "0.00",
                                    "vUnid": null,
                                    "vIPI": "0.00"
                                }
                            },
                            "ISSQN": null,
                            "PIS": {
                                "PISAliq": {
                                    "pPIS": "1.65",
                                    "vPIS": "0.39",
                                    "vBC": "23.46",
                                    "CST": "01",
                                    "qBCProd": null,
                                    "vAliqProd": null
                                },
                                "PISNT": null,
                                "PISOutr": null,
                                "PISQtde": null
                            },
                            "PISST": null,
                            "COFINS": {
                                "COFINSAliq": {
                                    "CST": "01",
                                    "pCOFINS": "7.60",
                                    "vBC": "23.46",
                                    "vCOFINS": "1.78"
                                },
                                "COFINSNT": null,
                                "COFINSOutr": null,
                                "COFINSQtde": null
                            },
                            "COFINSST": null,
                            "ICMSUFDest": null
                        },
                        "impostoDevol": null,
                        "infAdProd": null,
                        "nItem": "4"
                    },
                    {
                        "prod": {
                            "cProd": "004731",
                            "cEAN": "7896041914160",
                            "xProd": "Etiqueta Adesiva Pimaco A4367 288,5mmx200mm PCT 100fls",
                            "NCM": "48219000",
                            "NVE": null,
                            "CEST": null,
                            "indEscalaSpecified": false,
                            "CNPJFab": null,
                            "cBenef": null,
                            "EXTIPI": null,
                            "CFOP": "5102",
                            "uCom": "UN",
                            "qCom": "2.00",
                            "vUnCom": "74.74",
                            "vProd": "149.48",
                            "cEANTrib": "7896041914160",
                            "uTrib": "UN",
                            "qTrib": "2.00",
                            "vUnTrib": "74.74",
                            "vFrete": null,
                            "vSeg": null,
                            "vDesc": null,
                            "vOutro": null,
                            "indTot": 1,
                            "DI": null,
                            "detExport": null,
                            "xPed": "PO 13495",
                            "nItemPed": "0",
                            "nFCI": null,
                            "rastro": null,
                            "arma": null,
                            "comb": null,
                            "med": null,
                            "nRECOPI": null,
                            "veicProd": null
                        },
                        "imposto": {
                            "vTotTrib": null,
                            "ICMS": {
                                "ICMS00": {
                                    "pFCP": null,
                                    "vFCP": null,
                                    "CST": "00",
                                    "vBC": "149.48",
                                    "modBC": "3",
                                    "vICMS": "26.91",
                                    "pICMS": "18.00",
                                    "orig": 0,
                                    "CSOSN": 0,
                                    "pCredSN": null,
                                    "pMVAST": null,
                                    "pICMSST": null,
                                    "vICMSST": null,
                                    "pRedBC": null
                                },
                                "ICMS10": null,
                                "ICMS20": null,
                                "ICMS30": null,
                                "ICMS40": null,
                                "ICMS51": null,
                                "ICMS60": null,
                                "ICMS70": null,
                                "ICMS90": null,
                                "ICMSPart": null,
                                "ICMSSN101": null,
                                "ICMSSN102": null,
                                "ICMSSN201": null,
                                "ICMSSN202": null,
                                "ICMSSN500": null,
                                "ICMSSN900": null,
                                "ICMSST": null
                            },
                            "II": null,
                            "IPI": {
                                "CNPJProd": null,
                                "cSelo": null,
                                "qSelo": null,
                                "cEnq": "999",
                                "IPINT": null,
                                "IPITrib": {
                                    "CST": "99",
                                    "pIPI": "0.00",
                                    "qUnid": null,
                                    "vBC": "0.00",
                                    "vUnid": null,
                                    "vIPI": "0.00"
                                }
                            },
                            "ISSQN": null,
                            "PIS": {
                                "PISAliq": {
                                    "pPIS": "1.65",
                                    "vPIS": "2.02",
                                    "vBC": "122.57",
                                    "CST": "01",
                                    "qBCProd": null,
                                    "vAliqProd": null
                                },
                                "PISNT": null,
                                "PISOutr": null,
                                "PISQtde": null
                            },
                            "PISST": null,
                            "COFINS": {
                                "COFINSAliq": {
                                    "CST": "01",
                                    "pCOFINS": "7.60",
                                    "vBC": "122.57",
                                    "vCOFINS": "9.32"
                                },
                                "COFINSNT": null,
                                "COFINSOutr": null,
                                "COFINSQtde": null
                            },
                            "COFINSST": null,
                            "ICMSUFDest": null
                        },
                        "impostoDevol": null,
                        "infAdProd": null,
                        "nItem": "5"
                    },
                    {
                        "prod": {
                            "cProd": "004752",
                            "cEAN": "7896041913019",
                            "xProd": "Etiqueta Adesiva Pimaco 6180 25,4mmx66,7mm PCT 100fls",
                            "NCM": "48219000",
                            "NVE": null,
                            "CEST": null,
                            "indEscalaSpecified": false,
                            "CNPJFab": null,
                            "cBenef": null,
                            "EXTIPI": null,
                            "CFOP": "5102",
                            "uCom": "UN",
                            "qCom": "4.00",
                            "vUnCom": "70.32",
                            "vProd": "281.28",
                            "cEANTrib": "7896041913019",
                            "uTrib": "UN",
                            "qTrib": "4.00",
                            "vUnTrib": "70.32",
                            "vFrete": null,
                            "vSeg": null,
                            "vDesc": null,
                            "vOutro": null,
                            "indTot": 1,
                            "DI": null,
                            "detExport": null,
                            "xPed": "PO 13495",
                            "nItemPed": "0",
                            "nFCI": null,
                            "rastro": null,
                            "arma": null,
                            "comb": null,
                            "med": null,
                            "nRECOPI": null,
                            "veicProd": null
                        },
                        "imposto": {
                            "vTotTrib": null,
                            "ICMS": {
                                "ICMS00": {
                                    "pFCP": null,
                                    "vFCP": null,
                                    "CST": "00",
                                    "vBC": "281.28",
                                    "modBC": "3",
                                    "vICMS": "50.63",
                                    "pICMS": "18.00",
                                    "orig": 0,
                                    "CSOSN": 0,
                                    "pCredSN": null,
                                    "pMVAST": null,
                                    "pICMSST": null,
                                    "vICMSST": null,
                                    "pRedBC": null
                                },
                                "ICMS10": null,
                                "ICMS20": null,
                                "ICMS30": null,
                                "ICMS40": null,
                                "ICMS51": null,
                                "ICMS60": null,
                                "ICMS70": null,
                                "ICMS90": null,
                                "ICMSPart": null,
                                "ICMSSN101": null,
                                "ICMSSN102": null,
                                "ICMSSN201": null,
                                "ICMSSN202": null,
                                "ICMSSN500": null,
                                "ICMSSN900": null,
                                "ICMSST": null
                            },
                            "II": null,
                            "IPI": {
                                "CNPJProd": null,
                                "cSelo": null,
                                "qSelo": null,
                                "cEnq": "999",
                                "IPINT": null,
                                "IPITrib": {
                                    "CST": "99",
                                    "pIPI": "0.00",
                                    "qUnid": null,
                                    "vBC": "0.00",
                                    "vUnid": null,
                                    "vIPI": "0.00"
                                }
                            },
                            "ISSQN": null,
                            "PIS": {
                                "PISAliq": {
                                    "pPIS": "1.65",
                                    "vPIS": "3.81",
                                    "vBC": "230.65",
                                    "CST": "01",
                                    "qBCProd": null,
                                    "vAliqProd": null
                                },
                                "PISNT": null,
                                "PISOutr": null,
                                "PISQtde": null
                            },
                            "PISST": null,
                            "COFINS": {
                                "COFINSAliq": {
                                    "CST": "01",
                                    "pCOFINS": "7.60",
                                    "vBC": "230.65",
                                    "vCOFINS": "17.53"
                                },
                                "COFINSNT": null,
                                "COFINSOutr": null,
                                "COFINSQtde": null
                            },
                            "COFINSST": null,
                            "ICMSUFDest": null
                        },
                        "impostoDevol": null,
                        "infAdProd": null,
                        "nItem": "6"
                    },
                    {
                        "prod": {
                            "cProd": "006692",
                            "cEAN": "7899381066926",
                            "xProd": "Plastico Bolha Bobina 1,30x80m bolha 10mm 30micras",
                            "NCM": "39239090",
                            "NVE": null,
                            "CEST": null,
                            "indEscalaSpecified": false,
                            "CNPJFab": null,
                            "cBenef": null,
                            "EXTIPI": null,
                            "CFOP": "5102",
                            "uCom": "un",
                            "qCom": "1.00",
                            "vUnCom": "65.04",
                            "vProd": "65.04",
                            "cEANTrib": "7899381066926",
                            "uTrib": "un",
                            "qTrib": "1.00",
                            "vUnTrib": "65.04",
                            "vFrete": null,
                            "vSeg": null,
                            "vDesc": null,
                            "vOutro": null,
                            "indTot": 1,
                            "DI": null,
                            "detExport": null,
                            "xPed": "PO 13495",
                            "nItemPed": "0",
                            "nFCI": null,
                            "rastro": null,
                            "arma": null,
                            "comb": null,
                            "med": null,
                            "nRECOPI": null,
                            "veicProd": null
                        },
                        "imposto": {
                            "vTotTrib": null,
                            "ICMS": {
                                "ICMS00": {
                                    "pFCP": null,
                                    "vFCP": null,
                                    "CST": "00",
                                    "vBC": "65.04",
                                    "modBC": "3",
                                    "vICMS": "11.71",
                                    "pICMS": "18.00",
                                    "orig": 0,
                                    "CSOSN": 0,
                                    "pCredSN": null,
                                    "pMVAST": null,
                                    "pICMSST": null,
                                    "vICMSST": null,
                                    "pRedBC": null
                                },
                                "ICMS10": null,
                                "ICMS20": null,
                                "ICMS30": null,
                                "ICMS40": null,
                                "ICMS51": null,
                                "ICMS60": null,
                                "ICMS70": null,
                                "ICMS90": null,
                                "ICMSPart": null,
                                "ICMSSN101": null,
                                "ICMSSN102": null,
                                "ICMSSN201": null,
                                "ICMSSN202": null,
                                "ICMSSN500": null,
                                "ICMSSN900": null,
                                "ICMSST": null
                            },
                            "II": null,
                            "IPI": {
                                "CNPJProd": null,
                                "cSelo": null,
                                "qSelo": null,
                                "cEnq": "999",
                                "IPINT": null,
                                "IPITrib": {
                                    "CST": "99",
                                    "pIPI": "0.00",
                                    "qUnid": null,
                                    "vBC": "0.00",
                                    "vUnid": null,
                                    "vIPI": "0.00"
                                }
                            },
                            "ISSQN": null,
                            "PIS": {
                                "PISAliq": {
                                    "pPIS": "1.65",
                                    "vPIS": "0.88",
                                    "vBC": "53.33",
                                    "CST": "01",
                                    "qBCProd": null,
                                    "vAliqProd": null
                                },
                                "PISNT": null,
                                "PISOutr": null,
                                "PISQtde": null
                            },
                            "PISST": null,
                            "COFINS": {
                                "COFINSAliq": {
                                    "CST": "01",
                                    "pCOFINS": "7.60",
                                    "vBC": "53.33",
                                    "vCOFINS": "4.05"
                                },
                                "COFINSNT": null,
                                "COFINSOutr": null,
                                "COFINSQtde": null
                            },
                            "COFINSST": null,
                            "ICMSUFDest": null
                        },
                        "impostoDevol": null,
                        "infAdProd": null,
                        "nItem": "7"
                    },
                    {
                        "prod": {
                            "cProd": "006998",
                            "cEAN": "7899381069989",
                            "xProd": "Cola em Bastao Pritt 10g",
                            "NCM": "35061090",
                            "NVE": null,
                            "CEST": null,
                            "indEscalaSpecified": false,
                            "CNPJFab": null,
                            "cBenef": null,
                            "EXTIPI": null,
                            "CFOP": "5102",
                            "uCom": "UN",
                            "qCom": "4.00",
                            "vUnCom": "5.88",
                            "vProd": "23.52",
                            "cEANTrib": "7899381069989",
                            "uTrib": "UN",
                            "qTrib": "4.00",
                            "vUnTrib": "5.88",
                            "vFrete": null,
                            "vSeg": null,
                            "vDesc": null,
                            "vOutro": null,
                            "indTot": 1,
                            "DI": null,
                            "detExport": null,
                            "xPed": "PO 13495",
                            "nItemPed": "0",
                            "nFCI": null,
                            "rastro": null,
                            "arma": null,
                            "comb": null,
                            "med": null,
                            "nRECOPI": null,
                            "veicProd": null
                        },
                        "imposto": {
                            "vTotTrib": null,
                            "ICMS": {
                                "ICMS00": {
                                    "pFCP": null,
                                    "vFCP": null,
                                    "CST": "00",
                                    "vBC": "23.52",
                                    "modBC": "3",
                                    "vICMS": "4.23",
                                    "pICMS": "18.00",
                                    "orig": 0,
                                    "CSOSN": 0,
                                    "pCredSN": null,
                                    "pMVAST": null,
                                    "pICMSST": null,
                                    "vICMSST": null,
                                    "pRedBC": null
                                },
                                "ICMS10": null,
                                "ICMS20": null,
                                "ICMS30": null,
                                "ICMS40": null,
                                "ICMS51": null,
                                "ICMS60": null,
                                "ICMS70": null,
                                "ICMS90": null,
                                "ICMSPart": null,
                                "ICMSSN101": null,
                                "ICMSSN102": null,
                                "ICMSSN201": null,
                                "ICMSSN202": null,
                                "ICMSSN500": null,
                                "ICMSSN900": null,
                                "ICMSST": null
                            },
                            "II": null,
                            "IPI": {
                                "CNPJProd": null,
                                "cSelo": null,
                                "qSelo": null,
                                "cEnq": "999",
                                "IPINT": null,
                                "IPITrib": {
                                    "CST": "99",
                                    "pIPI": "0.00",
                                    "qUnid": null,
                                    "vBC": "0.00",
                                    "vUnid": null,
                                    "vIPI": "0.00"
                                }
                            },
                            "ISSQN": null,
                            "PIS": {
                                "PISAliq": {
                                    "pPIS": "1.65",
                                    "vPIS": "0.32",
                                    "vBC": "19.29",
                                    "CST": "01",
                                    "qBCProd": null,
                                    "vAliqProd": null
                                },
                                "PISNT": null,
                                "PISOutr": null,
                                "PISQtde": null
                            },
                            "PISST": null,
                            "COFINS": {
                                "COFINSAliq": {
                                    "CST": "01",
                                    "pCOFINS": "7.60",
                                    "vBC": "19.29",
                                    "vCOFINS": "1.47"
                                },
                                "COFINSNT": null,
                                "COFINSOutr": null,
                                "COFINSQtde": null
                            },
                            "COFINSST": null,
                            "ICMSUFDest": null
                        },
                        "impostoDevol": null,
                        "infAdProd": null,
                        "nItem": "8"
                    },
                    {
                        "prod": {
                            "cProd": "007892",
                            "cEAN": "7899381078929",
                            "xProd": "Borracha Faber Castell FC Max Branca",
                            "NCM": "40169200",
                            "NVE": null,
                            "CEST": null,
                            "indEscalaSpecified": false,
                            "CNPJFab": null,
                            "cBenef": null,
                            "EXTIPI": null,
                            "CFOP": "5102",
                            "uCom": "UN",
                            "qCom": "2.00",
                            "vUnCom": "2.82",
                            "vProd": "5.64",
                            "cEANTrib": "7899381078929",
                            "uTrib": "UN",
                            "qTrib": "2.00",
                            "vUnTrib": "2.82",
                            "vFrete": null,
                            "vSeg": null,
                            "vDesc": null,
                            "vOutro": null,
                            "indTot": 1,
                            "DI": null,
                            "detExport": null,
                            "xPed": "PO 13495",
                            "nItemPed": "0",
                            "nFCI": "E6BB2239-6461-43FB-A14B-392CC25A0F5A",
                            "rastro": null,
                            "arma": null,
                            "comb": null,
                            "med": null,
                            "nRECOPI": null,
                            "veicProd": null
                        },
                        "imposto": {
                            "vTotTrib": null,
                            "ICMS": {
                                "ICMS00": {
                                    "pFCP": null,
                                    "vFCP": null,
                                    "CST": "00",
                                    "vBC": "5.64",
                                    "modBC": "3",
                                    "vICMS": "1.02",
                                    "pICMS": "18.00",
                                    "orig": 5,
                                    "CSOSN": 0,
                                    "pCredSN": null,
                                    "pMVAST": null,
                                    "pICMSST": null,
                                    "vICMSST": null,
                                    "pRedBC": null
                                },
                                "ICMS10": null,
                                "ICMS20": null,
                                "ICMS30": null,
                                "ICMS40": null,
                                "ICMS51": null,
                                "ICMS60": null,
                                "ICMS70": null,
                                "ICMS90": null,
                                "ICMSPart": null,
                                "ICMSSN101": null,
                                "ICMSSN102": null,
                                "ICMSSN201": null,
                                "ICMSSN202": null,
                                "ICMSSN500": null,
                                "ICMSSN900": null,
                                "ICMSST": null
                            },
                            "II": null,
                            "IPI": {
                                "CNPJProd": null,
                                "cSelo": null,
                                "qSelo": null,
                                "cEnq": "999",
                                "IPINT": null,
                                "IPITrib": {
                                    "CST": "99",
                                    "pIPI": "0.00",
                                    "qUnid": null,
                                    "vBC": "0.00",
                                    "vUnid": null,
                                    "vIPI": "0.00"
                                }
                            },
                            "ISSQN": null,
                            "PIS": {
                                "PISAliq": {
                                    "pPIS": "1.65",
                                    "vPIS": "0.08",
                                    "vBC": "4.62",
                                    "CST": "01",
                                    "qBCProd": null,
                                    "vAliqProd": null
                                },
                                "PISNT": null,
                                "PISOutr": null,
                                "PISQtde": null
                            },
                            "PISST": null,
                            "COFINS": {
                                "COFINSAliq": {
                                    "CST": "01",
                                    "pCOFINS": "7.60",
                                    "vBC": "4.62",
                                    "vCOFINS": "0.35"
                                },
                                "COFINSNT": null,
                                "COFINSOutr": null,
                                "COFINSQtde": null
                            },
                            "COFINSST": null,
                            "ICMSUFDest": null
                        },
                        "impostoDevol": null,
                        "infAdProd": null,
                        "nItem": "9"
                    },
                    {
                        "prod": {
                            "cProd": "035877",
                            "cEAN": "SEM GTIN",
                            "xProd": "Apontador de Lapis Plastico Faber Castell Deposito Sortido",
                            "NCM": "82141000",
                            "NVE": null,
                            "CEST": null,
                            "indEscalaSpecified": false,
                            "CNPJFab": null,
                            "cBenef": null,
                            "EXTIPI": null,
                            "CFOP": "5102",
                            "uCom": "UN",
                            "qCom": "2.00",
                            "vUnCom": "2.83",
                            "vProd": "5.66",
                            "cEANTrib": "SEM GTIN",
                            "uTrib": "UN",
                            "qTrib": "2.00",
                            "vUnTrib": "2.83",
                            "vFrete": null,
                            "vSeg": null,
                            "vDesc": null,
                            "vOutro": null,
                            "indTot": 1,
                            "DI": null,
                            "detExport": null,
                            "xPed": "PO 13495",
                            "nItemPed": "0",
                            "nFCI": null,
                            "rastro": null,
                            "arma": null,
                            "comb": null,
                            "med": null,
                            "nRECOPI": null,
                            "veicProd": null
                        },
                        "imposto": {
                            "vTotTrib": null,
                            "ICMS": {
                                "ICMS00": {
                                    "pFCP": null,
                                    "vFCP": null,
                                    "CST": "00",
                                    "vBC": "5.66",
                                    "modBC": "3",
                                    "vICMS": "1.02",
                                    "pICMS": "18.00",
                                    "orig": 0,
                                    "CSOSN": 0,
                                    "pCredSN": null,
                                    "pMVAST": null,
                                    "pICMSST": null,
                                    "vICMSST": null,
                                    "pRedBC": null
                                },
                                "ICMS10": null,
                                "ICMS20": null,
                                "ICMS30": null,
                                "ICMS40": null,
                                "ICMS51": null,
                                "ICMS60": null,
                                "ICMS70": null,
                                "ICMS90": null,
                                "ICMSPart": null,
                                "ICMSSN101": null,
                                "ICMSSN102": null,
                                "ICMSSN201": null,
                                "ICMSSN202": null,
                                "ICMSSN500": null,
                                "ICMSSN900": null,
                                "ICMSST": null
                            },
                            "II": null,
                            "IPI": {
                                "CNPJProd": null,
                                "cSelo": null,
                                "qSelo": null,
                                "cEnq": "999",
                                "IPINT": null,
                                "IPITrib": {
                                    "CST": "99",
                                    "pIPI": "0.00",
                                    "qUnid": null,
                                    "vBC": "0.00",
                                    "vUnid": null,
                                    "vIPI": "0.00"
                                }
                            },
                            "ISSQN": null,
                            "PIS": {
                                "PISAliq": {
                                    "pPIS": "1.65",
                                    "vPIS": "0.08",
                                    "vBC": "4.64",
                                    "CST": "01",
                                    "qBCProd": null,
                                    "vAliqProd": null
                                },
                                "PISNT": null,
                                "PISOutr": null,
                                "PISQtde": null
                            },
                            "PISST": null,
                            "COFINS": {
                                "COFINSAliq": {
                                    "CST": "01",
                                    "pCOFINS": "7.60",
                                    "vBC": "4.64",
                                    "vCOFINS": "0.35"
                                },
                                "COFINSNT": null,
                                "COFINSOutr": null,
                                "COFINSQtde": null
                            },
                            "COFINSST": null,
                            "ICMSUFDest": null
                        },
                        "impostoDevol": null,
                        "infAdProd": null,
                        "nItem": "10"
                    },
                    {
                        "prod": {
                            "cProd": "036563",
                            "cEAN": "SEM GTIN",
                            "xProd": "Espiral de Encadernacao Plaspiral 7mm Preto PCT 50UN",
                            "NCM": "39162000",
                            "NVE": null,
                            "CEST": null,
                            "indEscalaSpecified": false,
                            "CNPJFab": null,
                            "cBenef": null,
                            "EXTIPI": null,
                            "CFOP": "5102",
                            "uCom": "UN",
                            "qCom": "1.00",
                            "vUnCom": "7.23",
                            "vProd": "7.23",
                            "cEANTrib": "SEM GTIN",
                            "uTrib": "UN",
                            "qTrib": "1.00",
                            "vUnTrib": "7.23",
                            "vFrete": null,
                            "vSeg": null,
                            "vDesc": null,
                            "vOutro": null,
                            "indTot": 1,
                            "DI": null,
                            "detExport": null,
                            "xPed": "PO 13495",
                            "nItemPed": "0",
                            "nFCI": null,
                            "rastro": null,
                            "arma": null,
                            "comb": null,
                            "med": null,
                            "nRECOPI": null,
                            "veicProd": null
                        },
                        "imposto": {
                            "vTotTrib": null,
                            "ICMS": {
                                "ICMS00": {
                                    "pFCP": null,
                                    "vFCP": null,
                                    "CST": "00",
                                    "vBC": "7.23",
                                    "modBC": "3",
                                    "vICMS": "1.30",
                                    "pICMS": "18.00",
                                    "orig": 0,
                                    "CSOSN": 0,
                                    "pCredSN": null,
                                    "pMVAST": null,
                                    "pICMSST": null,
                                    "vICMSST": null,
                                    "pRedBC": null
                                },
                                "ICMS10": null,
                                "ICMS20": null,
                                "ICMS30": null,
                                "ICMS40": null,
                                "ICMS51": null,
                                "ICMS60": null,
                                "ICMS70": null,
                                "ICMS90": null,
                                "ICMSPart": null,
                                "ICMSSN101": null,
                                "ICMSSN102": null,
                                "ICMSSN201": null,
                                "ICMSSN202": null,
                                "ICMSSN500": null,
                                "ICMSSN900": null,
                                "ICMSST": null
                            },
                            "II": null,
                            "IPI": {
                                "CNPJProd": null,
                                "cSelo": null,
                                "qSelo": null,
                                "cEnq": "999",
                                "IPINT": null,
                                "IPITrib": {
                                    "CST": "99",
                                    "pIPI": "0.00",
                                    "qUnid": null,
                                    "vBC": "0.00",
                                    "vUnid": null,
                                    "vIPI": "0.00"
                                }
                            },
                            "ISSQN": null,
                            "PIS": {
                                "PISAliq": {
                                    "pPIS": "1.65",
                                    "vPIS": "0.10",
                                    "vBC": "5.93",
                                    "CST": "01",
                                    "qBCProd": null,
                                    "vAliqProd": null
                                },
                                "PISNT": null,
                                "PISOutr": null,
                                "PISQtde": null
                            },
                            "PISST": null,
                            "COFINS": {
                                "COFINSAliq": {
                                    "CST": "01",
                                    "pCOFINS": "7.60",
                                    "vBC": "5.93",
                                    "vCOFINS": "0.45"
                                },
                                "COFINSNT": null,
                                "COFINSOutr": null,
                                "COFINSQtde": null
                            },
                            "COFINSST": null,
                            "ICMSUFDest": null
                        },
                        "impostoDevol": null,
                        "infAdProd": null,
                        "nItem": "11"
                    },
                    {
                        "prod": {
                            "cProd": "036572",
                            "cEAN": "SEM GTIN",
                            "xProd": "Espiral de Encadernacao Plaspiral 20mm Preto PCT 50UN",
                            "NCM": "39162000",
                            "NVE": null,
                            "CEST": null,
                            "indEscalaSpecified": false,
                            "CNPJFab": null,
                            "cBenef": null,
                            "EXTIPI": null,
                            "CFOP": "5102",
                            "uCom": "UN",
                            "qCom": "1.00",
                            "vUnCom": "22.69",
                            "vProd": "22.69",
                            "cEANTrib": "SEM GTIN",
                            "uTrib": "UN",
                            "qTrib": "1.00",
                            "vUnTrib": "22.69",
                            "vFrete": null,
                            "vSeg": null,
                            "vDesc": null,
                            "vOutro": null,
                            "indTot": 1,
                            "DI": null,
                            "detExport": null,
                            "xPed": "PO 13495",
                            "nItemPed": "0",
                            "nFCI": null,
                            "rastro": null,
                            "arma": null,
                            "comb": null,
                            "med": null,
                            "nRECOPI": null,
                            "veicProd": null
                        },
                        "imposto": {
                            "vTotTrib": null,
                            "ICMS": {
                                "ICMS00": {
                                    "pFCP": null,
                                    "vFCP": null,
                                    "CST": "00",
                                    "vBC": "22.69",
                                    "modBC": "3",
                                    "vICMS": "4.08",
                                    "pICMS": "18.00",
                                    "orig": 0,
                                    "CSOSN": 0,
                                    "pCredSN": null,
                                    "pMVAST": null,
                                    "pICMSST": null,
                                    "vICMSST": null,
                                    "pRedBC": null
                                },
                                "ICMS10": null,
                                "ICMS20": null,
                                "ICMS30": null,
                                "ICMS40": null,
                                "ICMS51": null,
                                "ICMS60": null,
                                "ICMS70": null,
                                "ICMS90": null,
                                "ICMSPart": null,
                                "ICMSSN101": null,
                                "ICMSSN102": null,
                                "ICMSSN201": null,
                                "ICMSSN202": null,
                                "ICMSSN500": null,
                                "ICMSSN900": null,
                                "ICMSST": null
                            },
                            "II": null,
                            "IPI": {
                                "CNPJProd": null,
                                "cSelo": null,
                                "qSelo": null,
                                "cEnq": "999",
                                "IPINT": null,
                                "IPITrib": {
                                    "CST": "99",
                                    "pIPI": "0.00",
                                    "qUnid": null,
                                    "vBC": "0.00",
                                    "vUnid": null,
                                    "vIPI": "0.00"
                                }
                            },
                            "ISSQN": null,
                            "PIS": {
                                "PISAliq": {
                                    "pPIS": "1.65",
                                    "vPIS": "0.31",
                                    "vBC": "18.61",
                                    "CST": "01",
                                    "qBCProd": null,
                                    "vAliqProd": null
                                },
                                "PISNT": null,
                                "PISOutr": null,
                                "PISQtde": null
                            },
                            "PISST": null,
                            "COFINS": {
                                "COFINSAliq": {
                                    "CST": "01",
                                    "pCOFINS": "7.60",
                                    "vBC": "18.61",
                                    "vCOFINS": "1.41"
                                },
                                "COFINSNT": null,
                                "COFINSOutr": null,
                                "COFINSQtde": null
                            },
                            "COFINSST": null,
                            "ICMSUFDest": null
                        },
                        "impostoDevol": null,
                        "infAdProd": null,
                        "nItem": "12"
                    },
                    {
                        "prod": {
                            "cProd": "036695",
                            "cEAN": "SEM GTIN",
                            "xProd": "Fita Adesiva Scotch 3M 48mmX50m Papel Kraft 3777",
                            "NCM": "48114110",
                            "NVE": null,
                            "CEST": null,
                            "indEscalaSpecified": false,
                            "CNPJFab": null,
                            "cBenef": null,
                            "EXTIPI": null,
                            "CFOP": "5102",
                            "uCom": "UN",
                            "qCom": "1.00",
                            "vUnCom": "40.46",
                            "vProd": "40.46",
                            "cEANTrib": "SEM GTIN",
                            "uTrib": "UN",
                            "qTrib": "1.00",
                            "vUnTrib": "40.46",
                            "vFrete": null,
                            "vSeg": null,
                            "vDesc": null,
                            "vOutro": null,
                            "indTot": 1,
                            "DI": null,
                            "detExport": null,
                            "xPed": "PO 13495",
                            "nItemPed": "0",
                            "nFCI": null,
                            "rastro": null,
                            "arma": null,
                            "comb": null,
                            "med": null,
                            "nRECOPI": null,
                            "veicProd": null
                        },
                        "imposto": {
                            "vTotTrib": null,
                            "ICMS": {
                                "ICMS00": {
                                    "pFCP": null,
                                    "vFCP": null,
                                    "CST": "00",
                                    "vBC": "40.46",
                                    "modBC": "3",
                                    "vICMS": "7.28",
                                    "pICMS": "18.00",
                                    "orig": 4,
                                    "CSOSN": 0,
                                    "pCredSN": null,
                                    "pMVAST": null,
                                    "pICMSST": null,
                                    "vICMSST": null,
                                    "pRedBC": null
                                },
                                "ICMS10": null,
                                "ICMS20": null,
                                "ICMS30": null,
                                "ICMS40": null,
                                "ICMS51": null,
                                "ICMS60": null,
                                "ICMS70": null,
                                "ICMS90": null,
                                "ICMSPart": null,
                                "ICMSSN101": null,
                                "ICMSSN102": null,
                                "ICMSSN201": null,
                                "ICMSSN202": null,
                                "ICMSSN500": null,
                                "ICMSSN900": null,
                                "ICMSST": null
                            },
                            "II": null,
                            "IPI": {
                                "CNPJProd": null,
                                "cSelo": null,
                                "qSelo": null,
                                "cEnq": "999",
                                "IPINT": null,
                                "IPITrib": {
                                    "CST": "99",
                                    "pIPI": "0.00",
                                    "qUnid": null,
                                    "vBC": "0.00",
                                    "vUnid": null,
                                    "vIPI": "0.00"
                                }
                            },
                            "ISSQN": null,
                            "PIS": {
                                "PISAliq": {
                                    "pPIS": "1.65",
                                    "vPIS": "0.55",
                                    "vBC": "33.18",
                                    "CST": "01",
                                    "qBCProd": null,
                                    "vAliqProd": null
                                },
                                "PISNT": null,
                                "PISOutr": null,
                                "PISQtde": null
                            },
                            "PISST": null,
                            "COFINS": {
                                "COFINSAliq": {
                                    "CST": "01",
                                    "pCOFINS": "7.60",
                                    "vBC": "33.18",
                                    "vCOFINS": "2.52"
                                },
                                "COFINSNT": null,
                                "COFINSOutr": null,
                                "COFINSQtde": null
                            },
                            "COFINSST": null,
                            "ICMSUFDest": null
                        },
                        "impostoDevol": null,
                        "infAdProd": null,
                        "nItem": "13"
                    },
                    {
                        "prod": {
                            "cProd": "037557",
                            "cEAN": "SEM GTIN",
                            "xProd": "Saco Plastico Go Office Oficio 4 Furos 0,15m PCT 100UN",
                            "NCM": "39232110",
                            "NVE": null,
                            "CEST": null,
                            "indEscalaSpecified": false,
                            "CNPJFab": null,
                            "cBenef": null,
                            "EXTIPI": null,
                            "CFOP": "5102",
                            "uCom": "UN",
                            "qCom": "4.00",
                            "vUnCom": "38.71",
                            "vProd": "154.84",
                            "cEANTrib": "SEM GTIN",
                            "uTrib": "UN",
                            "qTrib": "4.00",
                            "vUnTrib": "38.71",
                            "vFrete": null,
                            "vSeg": null,
                            "vDesc": null,
                            "vOutro": null,
                            "indTot": 1,
                            "DI": null,
                            "detExport": null,
                            "xPed": "PO 13495",
                            "nItemPed": "0",
                            "nFCI": null,
                            "rastro": null,
                            "arma": null,
                            "comb": null,
                            "med": null,
                            "nRECOPI": null,
                            "veicProd": null
                        },
                        "imposto": {
                            "vTotTrib": null,
                            "ICMS": {
                                "ICMS00": {
                                    "pFCP": null,
                                    "vFCP": null,
                                    "CST": "00",
                                    "vBC": "154.84",
                                    "modBC": "3",
                                    "vICMS": "27.87",
                                    "pICMS": "18.00",
                                    "orig": 0,
                                    "CSOSN": 0,
                                    "pCredSN": null,
                                    "pMVAST": null,
                                    "pICMSST": null,
                                    "vICMSST": null,
                                    "pRedBC": null
                                },
                                "ICMS10": null,
                                "ICMS20": null,
                                "ICMS30": null,
                                "ICMS40": null,
                                "ICMS51": null,
                                "ICMS60": null,
                                "ICMS70": null,
                                "ICMS90": null,
                                "ICMSPart": null,
                                "ICMSSN101": null,
                                "ICMSSN102": null,
                                "ICMSSN201": null,
                                "ICMSSN202": null,
                                "ICMSSN500": null,
                                "ICMSSN900": null,
                                "ICMSST": null
                            },
                            "II": null,
                            "IPI": {
                                "CNPJProd": null,
                                "cSelo": null,
                                "qSelo": null,
                                "cEnq": "999",
                                "IPINT": null,
                                "IPITrib": {
                                    "CST": "99",
                                    "pIPI": "0.00",
                                    "qUnid": null,
                                    "vBC": "0.00",
                                    "vUnid": null,
                                    "vIPI": "0.00"
                                }
                            },
                            "ISSQN": null,
                            "PIS": {
                                "PISAliq": {
                                    "pPIS": "1.65",
                                    "vPIS": "2.10",
                                    "vBC": "126.97",
                                    "CST": "01",
                                    "qBCProd": null,
                                    "vAliqProd": null
                                },
                                "PISNT": null,
                                "PISOutr": null,
                                "PISQtde": null
                            },
                            "PISST": null,
                            "COFINS": {
                                "COFINSAliq": {
                                    "CST": "01",
                                    "pCOFINS": "7.60",
                                    "vBC": "126.97",
                                    "vCOFINS": "9.65"
                                },
                                "COFINSNT": null,
                                "COFINSOutr": null,
                                "COFINSQtde": null
                            },
                            "COFINSST": null,
                            "ICMSUFDest": null
                        },
                        "impostoDevol": null,
                        "infAdProd": null,
                        "nItem": "14"
                    },
                    {
                        "prod": {
                            "cProd": "040702",
                            "cEAN": "SEM GTIN",
                            "xProd": "Fita Rotuladora Compativel GO Tech 91331 12mm x 4m BR/PT",
                            "NCM": "96121000",
                            "NVE": null,
                            "CEST": null,
                            "indEscalaSpecified": false,
                            "CNPJFab": null,
                            "cBenef": null,
                            "EXTIPI": null,
                            "CFOP": "5102",
                            "uCom": "un",
                            "qCom": "1.00",
                            "vUnCom": "16.46",
                            "vProd": "16.46",
                            "cEANTrib": "SEM GTIN",
                            "uTrib": "un",
                            "qTrib": "1.00",
                            "vUnTrib": "16.46",
                            "vFrete": null,
                            "vSeg": null,
                            "vDesc": null,
                            "vOutro": null,
                            "indTot": 1,
                            "DI": null,
                            "detExport": null,
                            "xPed": "PO 13495",
                            "nItemPed": "0",
                            "nFCI": null,
                            "rastro": null,
                            "arma": null,
                            "comb": null,
                            "med": null,
                            "nRECOPI": null,
                            "veicProd": null
                        },
                        "imposto": {
                            "vTotTrib": null,
                            "ICMS": {
                                "ICMS00": {
                                    "pFCP": null,
                                    "vFCP": null,
                                    "CST": "00",
                                    "vBC": "18.93",
                                    "modBC": "3",
                                    "vICMS": "3.41",
                                    "pICMS": "18.00",
                                    "orig": 1,
                                    "CSOSN": 0,
                                    "pCredSN": null,
                                    "pMVAST": null,
                                    "pICMSST": null,
                                    "vICMSST": null,
                                    "pRedBC": null
                                },
                                "ICMS10": null,
                                "ICMS20": null,
                                "ICMS30": null,
                                "ICMS40": null,
                                "ICMS51": null,
                                "ICMS60": null,
                                "ICMS70": null,
                                "ICMS90": null,
                                "ICMSPart": null,
                                "ICMSSN101": null,
                                "ICMSSN102": null,
                                "ICMSSN201": null,
                                "ICMSSN202": null,
                                "ICMSSN500": null,
                                "ICMSSN900": null,
                                "ICMSST": null
                            },
                            "II": null,
                            "IPI": {
                                "CNPJProd": null,
                                "cSelo": null,
                                "qSelo": null,
                                "cEnq": "999",
                                "IPINT": null,
                                "IPITrib": {
                                    "CST": "50",
                                    "pIPI": "15.00",
                                    "qUnid": null,
                                    "vBC": "16.46",
                                    "vUnid": null,
                                    "vIPI": "2.47"
                                }
                            },
                            "ISSQN": null,
                            "PIS": {
                                "PISAliq": {
                                    "pPIS": "1.65",
                                    "vPIS": "0.22",
                                    "vBC": "13.05",
                                    "CST": "01",
                                    "qBCProd": null,
                                    "vAliqProd": null
                                },
                                "PISNT": null,
                                "PISOutr": null,
                                "PISQtde": null
                            },
                            "PISST": null,
                            "COFINS": {
                                "COFINSAliq": {
                                    "CST": "01",
                                    "pCOFINS": "7.60",
                                    "vBC": "13.05",
                                    "vCOFINS": "0.99"
                                },
                                "COFINSNT": null,
                                "COFINSOutr": null,
                                "COFINSQtde": null
                            },
                            "COFINSST": null,
                            "ICMSUFDest": null
                        },
                        "impostoDevol": null,
                        "infAdProd": null,
                        "nItem": "15"
                    },
                    {
                        "prod": {
                            "cProd": "040704",
                            "cEAN": "SEM GTIN",
                            "xProd": "Fita Rotuladora Compativel GO Tech A45013 12mm x 7m BR/PT",
                            "NCM": "96121000",
                            "NVE": null,
                            "CEST": null,
                            "indEscalaSpecified": false,
                            "CNPJFab": null,
                            "cBenef": null,
                            "EXTIPI": null,
                            "CFOP": "5102",
                            "uCom": "un",
                            "qCom": "1.00",
                            "vUnCom": "21.58",
                            "vProd": "21.58",
                            "cEANTrib": "SEM GTIN",
                            "uTrib": "un",
                            "qTrib": "1.00",
                            "vUnTrib": "21.58",
                            "vFrete": null,
                            "vSeg": null,
                            "vDesc": null,
                            "vOutro": null,
                            "indTot": 1,
                            "DI": null,
                            "detExport": null,
                            "xPed": "PO 13495",
                            "nItemPed": "0",
                            "nFCI": null,
                            "rastro": null,
                            "arma": null,
                            "comb": null,
                            "med": null,
                            "nRECOPI": null,
                            "veicProd": null
                        },
                        "imposto": {
                            "vTotTrib": null,
                            "ICMS": {
                                "ICMS00": {
                                    "pFCP": null,
                                    "vFCP": null,
                                    "CST": "00",
                                    "vBC": "24.82",
                                    "modBC": "3",
                                    "vICMS": "4.47",
                                    "pICMS": "18.00",
                                    "orig": 1,
                                    "CSOSN": 0,
                                    "pCredSN": null,
                                    "pMVAST": null,
                                    "pICMSST": null,
                                    "vICMSST": null,
                                    "pRedBC": null
                                },
                                "ICMS10": null,
                                "ICMS20": null,
                                "ICMS30": null,
                                "ICMS40": null,
                                "ICMS51": null,
                                "ICMS60": null,
                                "ICMS70": null,
                                "ICMS90": null,
                                "ICMSPart": null,
                                "ICMSSN101": null,
                                "ICMSSN102": null,
                                "ICMSSN201": null,
                                "ICMSSN202": null,
                                "ICMSSN500": null,
                                "ICMSSN900": null,
                                "ICMSST": null
                            },
                            "II": null,
                            "IPI": {
                                "CNPJProd": null,
                                "cSelo": null,
                                "qSelo": null,
                                "cEnq": "999",
                                "IPINT": null,
                                "IPITrib": {
                                    "CST": "50",
                                    "pIPI": "15.00",
                                    "qUnid": null,
                                    "vBC": "21.58",
                                    "vUnid": null,
                                    "vIPI": "3.24"
                                }
                            },
                            "ISSQN": null,
                            "PIS": {
                                "PISAliq": {
                                    "pPIS": "1.65",
                                    "vPIS": "0.28",
                                    "vBC": "17.11",
                                    "CST": "01",
                                    "qBCProd": null,
                                    "vAliqProd": null
                                },
                                "PISNT": null,
                                "PISOutr": null,
                                "PISQtde": null
                            },
                            "PISST": null,
                            "COFINS": {
                                "COFINSAliq": {
                                    "CST": "01",
                                    "pCOFINS": "7.60",
                                    "vBC": "17.11",
                                    "vCOFINS": "1.30"
                                },
                                "COFINSNT": null,
                                "COFINSOutr": null,
                                "COFINSQtde": null
                            },
                            "COFINSST": null,
                            "ICMSUFDest": null
                        },
                        "impostoDevol": null,
                        "infAdProd": null,
                        "nItem": "16"
                    },
                    {
                        "prod": {
                            "cProd": "046608",
                            "cEAN": "SEM GTIN",
                            "xProd": "Papel Report A4 75g PCT 500fls",
                            "NCM": "48025610",
                            "NVE": null,
                            "CEST": null,
                            "indEscalaSpecified": false,
                            "CNPJFab": null,
                            "cBenef": null,
                            "EXTIPI": null,
                            "CFOP": "5102",
                            "uCom": "UN",
                            "qCom": "8.00",
                            "vUnCom": "25.47",
                            "vProd": "203.76",
                            "cEANTrib": "SEM GTIN",
                            "uTrib": "UN",
                            "qTrib": "8.00",
                            "vUnTrib": "25.47",
                            "vFrete": null,
                            "vSeg": null,
                            "vDesc": null,
                            "vOutro": null,
                            "indTot": 1,
                            "DI": null,
                            "detExport": null,
                            "xPed": "PO 13495",
                            "nItemPed": "0",
                            "nFCI": null,
                            "rastro": null,
                            "arma": null,
                            "comb": null,
                            "med": null,
                            "nRECOPI": null,
                            "veicProd": null
                        },
                        "imposto": {
                            "vTotTrib": null,
                            "ICMS": {
                                "ICMS00": {
                                    "pFCP": null,
                                    "vFCP": null,
                                    "CST": "00",
                                    "vBC": "203.76",
                                    "modBC": "3",
                                    "vICMS": "36.68",
                                    "pICMS": "18.00",
                                    "orig": 0,
                                    "CSOSN": 0,
                                    "pCredSN": null,
                                    "pMVAST": null,
                                    "pICMSST": null,
                                    "vICMSST": null,
                                    "pRedBC": null
                                },
                                "ICMS10": null,
                                "ICMS20": null,
                                "ICMS30": null,
                                "ICMS40": null,
                                "ICMS51": null,
                                "ICMS60": null,
                                "ICMS70": null,
                                "ICMS90": null,
                                "ICMSPart": null,
                                "ICMSSN101": null,
                                "ICMSSN102": null,
                                "ICMSSN201": null,
                                "ICMSSN202": null,
                                "ICMSSN500": null,
                                "ICMSSN900": null,
                                "ICMSST": null
                            },
                            "II": null,
                            "IPI": {
                                "CNPJProd": null,
                                "cSelo": null,
                                "qSelo": null,
                                "cEnq": "999",
                                "IPINT": null,
                                "IPITrib": {
                                    "CST": "99",
                                    "pIPI": "0.00",
                                    "qUnid": null,
                                    "vBC": "0.00",
                                    "vUnid": null,
                                    "vIPI": "0.00"
                                }
                            },
                            "ISSQN": null,
                            "PIS": {
                                "PISAliq": {
                                    "pPIS": "1.65",
                                    "vPIS": "2.76",
                                    "vBC": "167.08",
                                    "CST": "01",
                                    "qBCProd": null,
                                    "vAliqProd": null
                                },
                                "PISNT": null,
                                "PISOutr": null,
                                "PISQtde": null
                            },
                            "PISST": null,
                            "COFINS": {
                                "COFINSAliq": {
                                    "CST": "01",
                                    "pCOFINS": "7.60",
                                    "vBC": "167.08",
                                    "vCOFINS": "12.70"
                                },
                                "COFINSNT": null,
                                "COFINSOutr": null,
                                "COFINSQtde": null
                            },
                            "COFINSST": null,
                            "ICMSUFDest": null
                        },
                        "impostoDevol": null,
                        "infAdProd": null,
                        "nItem": "17"
                    },
                    {
                        "prod": {
                            "cProd": "050673",
                            "cEAN": "7896009728020",
                            "xProd": "Pilha Alcalina Rayovac AA 20866 SM-72 4UN",
                            "NCM": "85061019",
                            "NVE": null,
                            "CEST": null,
                            "indEscalaSpecified": false,
                            "CNPJFab": null,
                            "cBenef": null,
                            "EXTIPI": null,
                            "CFOP": "5102",
                            "uCom": "PT",
                            "qCom": "12.00",
                            "vUnCom": "14.56",
                            "vProd": "174.72",
                            "cEANTrib": "7896009728020",
                            "uTrib": "PT",
                            "qTrib": "12.00",
                            "vUnTrib": "14.56",
                            "vFrete": null,
                            "vSeg": null,
                            "vDesc": null,
                            "vOutro": null,
                            "indTot": 1,
                            "DI": null,
                            "detExport": null,
                            "xPed": "PO 13495",
                            "nItemPed": "0",
                            "nFCI": null,
                            "rastro": null,
                            "arma": null,
                            "comb": null,
                            "med": null,
                            "nRECOPI": null,
                            "veicProd": null
                        },
                        "imposto": {
                            "vTotTrib": null,
                            "ICMS": {
                                "ICMS00": {
                                    "pFCP": null,
                                    "vFCP": null,
                                    "CST": "00",
                                    "vBC": "174.72",
                                    "modBC": "3",
                                    "vICMS": "31.44",
                                    "pICMS": "18.00",
                                    "orig": 2,
                                    "CSOSN": 0,
                                    "pCredSN": null,
                                    "pMVAST": null,
                                    "pICMSST": null,
                                    "vICMSST": null,
                                    "pRedBC": null
                                },
                                "ICMS10": null,
                                "ICMS20": null,
                                "ICMS30": null,
                                "ICMS40": null,
                                "ICMS51": null,
                                "ICMS60": null,
                                "ICMS70": null,
                                "ICMS90": null,
                                "ICMSPart": null,
                                "ICMSSN101": null,
                                "ICMSSN102": null,
                                "ICMSSN201": null,
                                "ICMSSN202": null,
                                "ICMSSN500": null,
                                "ICMSSN900": null,
                                "ICMSST": null
                            },
                            "II": null,
                            "IPI": {
                                "CNPJProd": null,
                                "cSelo": null,
                                "qSelo": null,
                                "cEnq": "999",
                                "IPINT": null,
                                "IPITrib": {
                                    "CST": "99",
                                    "pIPI": "0.00",
                                    "qUnid": null,
                                    "vBC": "0.00",
                                    "vUnid": null,
                                    "vIPI": "0.00"
                                }
                            },
                            "ISSQN": null,
                            "PIS": {
                                "PISAliq": {
                                    "pPIS": "1.65",
                                    "vPIS": "2.36",
                                    "vBC": "143.28",
                                    "CST": "01",
                                    "qBCProd": null,
                                    "vAliqProd": null
                                },
                                "PISNT": null,
                                "PISOutr": null,
                                "PISQtde": null
                            },
                            "PISST": null,
                            "COFINS": {
                                "COFINSAliq": {
                                    "CST": "01",
                                    "pCOFINS": "7.60",
                                    "vBC": "143.28",
                                    "vCOFINS": "10.89"
                                },
                                "COFINSNT": null,
                                "COFINSOutr": null,
                                "COFINSQtde": null
                            },
                            "COFINSST": null,
                            "ICMSUFDest": null
                        },
                        "impostoDevol": null,
                        "infAdProd": null,
                        "nItem": "18"
                    }
                ],
                "total": {
                    "ICMSTot": {
                        "vBC": "1516.39",
                        "vICMS": "272.95",
                        "vICMSDeson": "0.00",
                        "vFCPUFDest": null,
                        "vICMSUFDest": null,
                        "vICMSUFRemet": null,
                        "vFCP": "0.00",
                        "vBCST": "0.00",
                        "vST": "0.00",
                        "vFCPST": "0.00",
                        "vFCPSTRet": "0.00",
                        "vProd": "1510.68",
                        "vFrete": "0.00",
                        "vSeg": "0.00",
                        "vDesc": "0.00",
                        "vII": "0.00",
                        "vIPI": "5.71",
                        "vIPIDevol": "0.00",
                        "vPIS": "20.45",
                        "vCOFINS": "94.06",
                        "vOutro": "0.00",
                        "vNF": "1516.39",
                        "vTotTrib": null
                    },
                    "ISSQNtot": null,
                    "retTrib": null
                },
                "transp": {
                    "modFrete": 3,
                    "transporta": {
                        "Item": "03746938000143",
                        "ItemElementName": 0,
                        "xNome": "BRS SP SUPRIMENTOS CORPORATIVOS LTDA",
                        "IE": "799061402111",
                        "xEnder": "RUA JOSE MARTINS FERNANDES 601",
                        "xMun": "SAO BERNARDO DO CAMPO",
                        "UF": 25,
                        "UFSpecified": true
                    },
                    "retTransp": null,
                    "balsa": null,
                    "reboque": null,
                    "vagao": null,
                    "veicTransp": null,
                    "vol": [
                        {
                            "qVol": "8",
                            "esp": "VOL",
                            "marca": "BRS",
                            "nVol": "8",
                            "pesoL": "41.950",
                            "pesoB": "41.950",
                            "lacres": null
                        }
                    ]
                },
                "cobr": {
                    "fat": {
                        "nFat": "2903609",
                        "vOrig": "1516.39",
                        "vDesc": "0.00",
                        "vLiq": "1516.39"
                    },
                    "dup": [
                        {
                            "nDup": "001",
                            "dVenc": "2022-12-15",
                            "vDup": "1516.39"
                        }
                    ]
                },
                "pag": {
                    "detPag": [
                        {
                            "indPag": 1,
                            "indPagSpecified": true,
                            "tPag": 11,
                            "vPag": "1516.39",
                            "card": null
                        }
                    ],
                    "vTroco": null
                },
                "infAdic": {
                    "infAdFisco": null,
                    "infCpl": "[Numero do Pedido: P1-4505372-] PO 13495 - [2 - Guido Caloi ] - ENTREGAR: Avenida Guido Caloi|1935|bloco C 2 andar|Jardim Sao Luis|Sao Paulo|SP|05802140|3550308| - - [ em 04/11/2022] - - Biogen Brasil Produtos Farmaceuticos Ltda CNPJ 07986222000255 IE 142149820110 Av. Guido Caloi 1935 Bloco C 2 Piso Jd Sao Luis S Fica atribuido a BRS SP a condicao de sujeito passivo por substituicao tributaria, a que se refere o inciso VI do art. 264 do RICMS/2000. Regime Especial 485/2015.",
                    "obsCont": [
                        {
                            "xTexto": "2",
                            "xCampo": "Filial"
                        }
                    ],
                    "obsFisco": null,
                    "procRef": null
                },
                "exporta": null,
                "compra": {
                    "xNEmp": null,
                    "xPed": "PO 13495",
                    "xCont": null
                },
                "cana": null,
                "infRespTec": {
                    "CNPJ": "03553145000108",
                    "xContato": "Laisi C. H.",
                    "email": "fiscal.produto@neogrid.com",
                    "fone": "4730437600",
                    "idCSRT": null,
                    "hashCSRT": null
                },
                "versao": "4.00",
                "Id": "NFe35221103746938000143550030029036091072414765"
            },
            "infNFeSupl": null,
            "Signature": {
                "SignedInfo": {
                    "CanonicalizationMethod": {
                        "Algorithm": "http://www.w3.org/TR/2001/REC-xml-c14n-20010315"
                    },
                    "SignatureMethod": {
                        "Algorithm": "http://www.w3.org/2000/09/xmldsig#rsa-sha1"
                    },
                    "Reference": {
                        "Transforms": [
                            {
                                "XPath": null,
                                "Algorithm": 0
                            },
                            {
                                "XPath": null,
                                "Algorithm": 1
                            }
                        ],
                        "DigestMethod": {
                            "Algorithm": "http://www.w3.org/2000/09/xmldsig#sha1"
                        },
                        "DigestValue": "/wBqpDXVvac9BF7CI3rrKKoYieQ=",
                        "Id": null,
                        "URI": "#NFe35221103746938000143550030029036091072414765",
                        "Type": null
                    },
                    "Id": null
                },
                "SignatureValue": {
                    "Id": null,
                    "Value": "1CIY2QdL/JdtkzkyBMF0OWJSkFwZ6CXkKAT8a1QSu8OcdyoZrtrjg6xPxWCMXe17AwFOyXtqdSpriaLVB6y0X/j43Zwc8un07dt+5WOlc5JHsELasmRzkt1IRGn28a64tg+xQD/Rov+m3kKQvCsT0HSQHnCZFG7TgDhwPw7AYpfib5aTwQ6b2dz3YJic+JnLEB4wpTHHd+Jtrrr0kyl+xulSCsa1lulukTUzD5yLnVE4SR+KQoZ8GECh26GW1zyUMYgx9jgsg/ERjNrup02T4K6QnPMRvWa6/0Z3j8t5uTG036Khz/4VJIaORzrmzeomCcoz9YLpOlFPXzEjhDGblA=="
                },
                "KeyInfo": {
                    "X509Data": {
                        "X509Certificate": "MIIH+TCCBeGgAwIBAgIIQOVivw/bmR0wDQYJKoZIhvcNAQELBQAwdjELMAkGA1UEBhMCQlIxEzARBgNVBAoTCklDUC1CcmFzaWwxNjA0BgNVBAsTLVNlY3JldGFyaWEgZGEgUmVjZWl0YSBGZWRlcmFsIGRvIEJyYXNpbCAtIFJGQjEaMBgGA1UEAxMRQUMgU0FGRVdFQiBSRkIgdjUwHhcNMjIwMTA3MTcyNjM4WhcNMjMwMTA3MTcyNjM4WjCCAQsxCzAJBgNVBAYTAkJSMRMwEQYDVQQKEwpJQ1AtQnJhc2lsMQswCQYDVQQIEwJTUDEeMBwGA1UEBxMVU0FPIEJFUk5BUkRPIERPIENBTVBPMTYwNAYDVQQLEy1TZWNyZXRhcmlhIGRhIFJlY2VpdGEgRmVkZXJhbCBkbyBCcmFzaWwgLSBSRkIxFjAUBgNVBAsTDVJGQiBlLUNOUEogQTExFzAVBgNVBAsTDjE4OTI5OTIwMDAwMTU0MRMwEQYDVQQLEwpwcmVzZW5jaWFsMTwwOgYDVQQDEzNCUlMgU1AgU1VQUklNRU5UT1MgQ09SUE9SQVRJVk9TIExUREE6MDM3NDY5MzgwMDAxNDMwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDfZnukxEqCN2t2PRxoD4a9O/KiPGMT7sciMhnUvkeiZWGeUIuwgSkyW6eDrPSQvHEYjEmbkIe/MYOsnR7hRvz/i7beHh8/7Ku21an7O0bU1mwkBsnMN1gqMz5XSUAD5xEw5edsD6vZGNm9c6Cmt/GtJe4EZlcVPc56pIMpg5b08/NuxgueWH4RnBsS8y4UhhZfoS+AW7baAwbXJ9vwkHCIB+0ciYZ+gNFPa1pL32DKQlYO6ALPmuu9w7qm8heESfyIwNUkAFbWtTCWJM7NV/Ngi9JBoBsbefhMnvHFB9lk43bnxhyWZiOndHpUhBTeATqZSnuGKJgKnvV14DEok5n1AgMBAAGjggLyMIIC7jAfBgNVHSMEGDAWgBQpXkvVRky7/hanY8EdxCby3djzBTAOBgNVHQ8BAf8EBAMCBeAwbQYDVR0gBGYwZDBiBgZgTAECATMwWDBWBggrBgEFBQcCARZKaHR0cDovL3JlcG9zaXRvcmlvLmFjc2FmZXdlYi5jb20uYnIvYWMtc2FmZXdlYnJmYi9hYy1zYWZld2ViLXJmYi1wYy1hMS5wZGYwga4GA1UdHwSBpjCBozBPoE2gS4ZJaHR0cDovL3JlcG9zaXRvcmlvLmFjc2FmZXdlYi5jb20uYnIvYWMtc2FmZXdlYnJmYi9sY3ItYWMtc2FmZXdlYnJmYnY1LmNybDBQoE6gTIZKaHR0cDovL3JlcG9zaXRvcmlvMi5hY3NhZmV3ZWIuY29tLmJyL2FjLXNhZmV3ZWJyZmIvbGNyLWFjLXNhZmV3ZWJyZmJ2NS5jcmwwgbcGCCsGAQUFBwEBBIGqMIGnMFEGCCsGAQUFBzAChkVodHRwOi8vcmVwb3NpdG9yaW8uYWNzYWZld2ViLmNvbS5ici9hYy1zYWZld2VicmZiL2FjLXNhZmV3ZWJyZmJ2NS5wN2IwUgYIKwYBBQUHMAKGRmh0dHA6Ly9yZXBvc2l0b3JpbzIuYWNzYWZld2ViLmNvbS5ici9hYy1zYWZld2VicmZiL2FjLXNhZmV3ZWJyZmJ2NS5wN2IwgbYGA1UdEQSBrjCBq4EbQ0VTQVIuRk9MTEVAQlJTVVBQTFkuQ09NLkJSoB4GBWBMAQMCoBUTE0NFU0FSIExFQU5EUk8gRk9MTEWgGQYFYEwBAwOgEBMOMDM3NDY5MzgwMDAxNDOgOAYFYEwBAwSgLxMtMjcwODE5NzM2MzcyNTE2OTAwNDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwoBcGBWBMAQMHoA4TDDAwMDAwMDAwMDAwMDAdBgNVHSUEFjAUBggrBgEFBQcDAgYIKwYBBQUHAwQwCQYDVR0TBAIwADANBgkqhkiG9w0BAQsFAAOCAgEATtCrb6iXLKnXuSCjy6zqOee5vmTY00XkD2mJv2If6iDwHGaHgiLSFNqPD/KSOLYl503ShtNY8na0zj70OTUnEY+Gk8BdFteBMCCray8RWeJCikarOIwrOnx8r9yzKqCUANq6dZwdh2mCdoCEi47qn9k+wd3ErtL1O61NFxKr8nXihfFjd5yAfmXLSTZim4XvGGJ+Slg+h9iPHD1ri9WM12toMt2CS4F6WsyzcTRMJSUHb5pxCnBEenZBWFFb30/xrgqE2YagexVVbuHwKsqtNPMSAl46KbysmQ6h0GlsN4zuCSep+cyDQc4OLugTGmCjZ+qqAbb2Lwqfg+qHJubDcekk2NCMP28GGOU231zx6bOwiwzjJKELIIDf8Ph4gx+56VvtfFsdcKNCF39j1L74kuBxE1TdX3Mn0WEvxrFvPyTLvjk2njM4Lz0GKJtALml4KuS1/McxUnOKmbmTXuz8qmck+VS4I84mXsWaSxLDCP5S9d34H9wveUNxJpRfSUjCKNGSCJI6nS20Eo5E3bckhxHYBqPMCVbpcXps6is+UaTcEA+Pt2zkFXFXpZP3hPw2NxmlPNCHQcuh3ADa1ndTxT+cqJDJ7zz/dSD7ymjmgQR3nqUy9ark+fQpxp565SI2atrR1/rNjf0SB+CW1ifRs58qLEb9zkAz6q4qkmugVME="
                    },
                    "Id": null
                },
                "Id": null
            }
        },
        "ProtNFe": {
            "infProt": {
                "tpAmb": 0,
                "verAplic": "SP_NFE_PL009_V4",
                "chNFe": "35221103746938000143550030029036091072414765",
                "dhRecbto": "2022-11-05T04:40:22Z",
                "nProt": "135221521052894",
                "digVal": "/wBqpDXVvac9BF7CI3rrKKoYieQ=",
                "cStat": "100",
                "xMotivo": "Autorizado o uso da NF-e",
                "cMsg": null,
                "xMsg": null,
                "Id": "Id135221521052894"
            },
            "protNFe": null,
            "Signature": null,
            "versao": "4.00"
        },
        "versao": "4.00",
        "indexedES": false
    },
    "urlxml": "https://iapi.taxfy.com.br/api/Storage?subid=d9ad1203-b64d-dfbe-b067-17fffb495194&key=912A3C89C982A1522D59DD0E6F1F00CB&tipo=NFE",
    "cancelada": null,
    "dtCancelada": null,
    "oneTemplateTitle": "BIOGEN - SIENGE - API - INTEGRAÇÃO",
    "runningProcess": false,
    "CFD_tipo_documento_id": "66bed5cb-bf25-ea95-e1e2-c903dcde3186",
    "ERP_erp_type": "ORACLE",
    "ERP_id": "65f07f21-6fc2-73d8-882c-33162b4cc5e9",
    "LDOC_documento__tipo_documento": "NF-e",
    "LDOC_tipo_documento_id": "9a278ce8-7562-2009-c7fe-25309050472c",
    "LDOC_tipo_id": "efc71489-6b7b-4c94-8e2c-b9d153bf2e21",
    "ass_id": "f8387e95-c604-454b-820e-e01c8dbedfcf",
    "assid": "f8387e95-c604-454b-820e-e01c8dbedfcf",
    "campo_condicao_pagamento": " ",
    "cnpjRaizDest": "07986222",
    "cnpjRaizEmit": "03746938",
    "competencia": "11/2022",
    "copy_doc_id": "b26b0dc2-f7c9-4eb4-af08-60f7479ae527",
    "depara_codigo_produto": "Não",
    "depara_codigo_produto_desc": "Não",
    "docManifestado": "nao",
    "dtUploadDate": "2023-05-04T12:37:29Z",
    "dtUpload": "2023-05-04 09:37:29",
    "email": "dev@biogen.com.br",
    "env": "CLI",
    "enviar_monitor_documentos": "Sim",
    "enviar_monitor_documentos_desc": "Sim",
    "erp_type": "ORACLE",
    "eventos": " ",
    "fdtid": "b3cc6335-f322-4863-930d-1a530059a0c8",
    "fedid": "7abc1574-527e-4737-8f81-e19d578ffe79",
    "forma_integracao": "ativa",
    "forma_integracao_desc": "Onergy envia os dados para outros sistemas",
    "habilitar_btn_validar_registro": "Não",
    "habilitar_btn_validar_registro_desc": "Não",
    "habilitar_condicao_pagamento": "Não",
    "habilitar_condicao_pagamento_desc": "Não",
    "habilitar_manifestacao": "Não",
    "habilitar_manifestacao_desc": "Não",
    "habilitar_sugestao_escrituracao": "Não",
    "habilitar_sugestao_escrituracao_desc": "Não",
    "habilitar_validacao_comercial": "Sim",
    "habilitar_validacao_comercial_desc": "Sim",
    "habilitar_validacao_fiscal_taxfy_link": "Sim",
    "habilitar_validacao_fiscal_taxfy_link_desc": "Sim",
    "habilitar_workflow_aprovacao": "Sim",
    "habilitar_workflow_aprovacao_desc": "Sim",
    "id_ref_validacoesComercial": "66bed5cb-bf25-ea95-e1e2-c903dcde3186",
    "id_save_inbox": "99d6725d-14ab-4326-b65b-948e8e4d75a5",
    "id_template_inbox": "fddf0752-3493-4a2c-a5b7-6a1d73d3abaf",
    "inbox_automatico": "sim",
    "inbox_automatico_desc": "Sim",
    "itensPosValidacao": "dfd918eb-c0fc-4f4b-b960-d1d74fb4dfee",
    "lst_siglas": [
        "OC:",
        "AF:",
        "PO:",
        "Pedido de Compras:",
        "ORDEM DE VENDA N.:",
        "O.C."
    ],
    "necessario_validar_documentos": false,
    "onergy_rolid": "",
    "pedidos_relacionados": [
        "4bfa3d41-2c60-479b-80d8-910bc76355a8"
    ],
    "po_extraido": "PO 13495",
    "preencher_condicao_pagamento": " ",
    "prestacao_servicos": "Não",
    "relacionameno_manual_nitemped": "Não",
    "relacionameno_manual_nitemped_desc": "Não",
    "responsavel_upload": "INTEGRAÇÃO",
    "selectFinalid": " ",
    "timezone": null,
    "upload_data_hora": "04/05/2023 09:37:29",
    "usrid": "31805071-d12a-43a0-9651-9f67f9ea39e7",
    "onergy_js_ctx": {
        "assid": "f8387e95-c604-454b-820e-e01c8dbedfcf",
        "fedid": "7abc1574-527e-4737-8f81-e19d578ffe79",
        "fdtid": "b3cc6335-f322-4863-930d-1a530059a0c8",
        "usrid": "31805071-d12a-43a0-9651-9f67f9ea39e7",
        "insertDt": "2023-05-22T13:51:23.458Z",
        "updateDt": "2023-05-22T23:23:55.857Z",
        "cur_userid": "31805071-d12a-43a0-9651-9f67f9ea39e7",
        "email": "dev@biogen.com.br",
        "user_name": "dev@biogen.com.br",
        "onergy_rolid": "",
        "praid": "98170e6b-a9a2-488c-83ea-1c36c119b03e",
        "pcvid": "70d26cce-3afd-43b6-aa99-9978d99540cc",
        "prcid": "5d88f35c-a996-3b8a-a62e-5f89acf00f44",
        "timezone": null,
        "timezone_value": "-03:00",
        "pubNubHook": null
    },
    "initRelac": false,
    "chaeveNfe": "35221103746938000143550030029036091072414765",
    "docReprocessado": true,
    "CFD__habilitar_aprovacao_dinamica": "Não",
    "CFD__habilitar_aprovacao_dinamica_desc": "Não",
    "CFD__habilitar_retencao_impostos": " ",
    "CFD__permitir_informar_pedido_manualmente": "Não",
    "CFD__permitir_informar_pedido_manualmente_desc": "Não",
    "CFD__selecionar_retencao_integracao": " ",
    "basis_emp_IBX__cnpj_origem_lista_id": "2f27c5c4-50bc-44c0-a657-10eb7b5716c8",
    "boolGetConfigValid": true,
    "habilitar_dados_complementares_sem_pedido": "Não",
    "habilitar_manifestacao_desacordo": " ",
    "habilitar_relacionamento_pedido": "Sim",
    "habilitar_relacionamento_pedido_desc": "Sim",
    "nota_cancelada": "Não",
    "nota_cancelada_desc": "Não",
    "pedido_padrao_onergy": "Não",
    "permitir_liberacao_documento_sem_pedido": "Sim",
    "permitir_liberacao_documento_sem_pedido_desc": "Sim",
    "tipo_de_relacionamento_nfse": "ignorar",
    "manifestacao_destinatario_eletronica": " ",
    "doc_original": "4651a6c1-7ec4-4ba9-b2a5-271626063038",
    "cnpj_emitente": "03746938000143",
    "razao_social_emitente": "BRS SP SUPRIMENTOS CORPORATIVOS S/A",
    "cnpj_destinatario": "07986222000174",
    "razao_social_destinatario": "BIOGEN BRASIL PRODUTOS FARMACEUTICOSLTDA",
    "tipo_documento": "NFE",
    "tipo_documento_desc": "NF-e",
    "cnpj_origem": "03746938000143",
    "razao_social_origem": "BRS SP SUPRIMENTOS CORPORATIVOS S/A",
    "cnpj_destino": "07986222000174",
    "razao_social_destino": "BIOGEN BRASIL PRODUTOS FARMACEUTICOSLTDA",
    "n_documento": "2903609",
    "data_emissaoDate": "2022-11-05T03:00:00Z",
    "data_emissao": "2022-11-05 00:00:00",
    "valor": "1516.39",
    "chave": "35221103746938000143550030029036091072414765",
    "origem_po": "",
    "origem_po_desc": "",
    "status": "Liberado para Integração",
    "status_desc": "Liberado para Integração",
    "serie_nf": "3",
    "CFD_LDOC_documento__tipo_documento": "",
    "CPM_condicao_pagamento": " ",
    "CPM_id": "",
    "CPM_numero_parcelas": "",
    "IBX__manifesto_lote": " ",
    "IBX__obs_manifestacao_lote": " ",
    "IBX__reprocessar_validacao_comercial": " ",
    "OLE_DESCRIPTION": " ",
    "OLE_LOCATION_CODE": " ",
    "OLE_ORGANIZATION_CODE": " ",
    "OLE_id": " ",
    "PedidoPadraoRelacionado": " ",
    "autorizar_liberacao_com_erros": " ",
    "basis_emp_cnpj__IBX__cnpj_destino_lista": "",
    "basis_emp_cnpj__IBX__cnpj_origem_lista": "",
    "btnEscriturar": " ",
    "codigo_produto_validado": "sim",
    "data_alteracao": "2023-05-22 10:53:13",
    "data_alteracaoDate": "2023-05-22T13:53:13Z",
    "det_sugest_escrit": " ",
    "doc_complementar": "",
    "documento_sem_pedido": "",
    "finalid_codigo__ped_finalid_codigo": " ",
    "finalid_descricao": " ",
    "finalid_ped_finalid_codigo_id": " ",
    "guuidUpdate": "3f549d03-0ad2-43e7-9bfd-1821e8acd413",
    "habilitar_aprovacao_dinamica": "",
    "habilitar_item_local_entrega": "",
    "histEventManifest": " ",
    "historicoValidacaoComercial": null,
    "historico_motivo_liberacao": "",
    "integracao": "",
    "itensInboxNfe": " ",
    "itensNfe": " ",
    "justificativa_manifestacao": " ",
    "motivo_da_liberacao": "",
    "n_item_pedido_cache": "",
    "ordemCompraRelacionada": " ",
    "pedidoCompraRelacionado": " ",
    "requisicao_compra": "",
    "usuario_alteracao": "dev@biogen.com.br",
    "validacaoComercial": null,
    "validacaoFiscal": null,
    "valor_parcela": 0,
    "checkOldManifest": true,
    "hashOld": "fca27a040a614d2a2494cdab69a9cd61",
    "id_relation_pedido": "77de5259-e3be-499a-946f-4fd833398105",
    "pedidos_relacionados_validados": [
        "4bfa3d41-2c60-479b-80d8-910bc76355a8"
    ],
    "updateStatus": false,
    "dicValConvert": [
        {
            "nome_valid": "Moeda",
            "valConvertion": false,
            "valConvertion_orig": false,
            "keyConver": "BRLBRL"
        }
    ],
    "validComercialCheck": "sucesso",
    "validFiscalCheck": "sucesso",
    "IBX__combinacao_nop": "unica",
    "IBX__combinacao_nop_desc": "Única",
    "NOP_descricao_especie": null,
    "NOP_descricao_nop": null,
    "NOP_especie": null,
    "NOP_id": null,
    "NOP_nop": null,
    "cancelar_processo": [],
    "cfopscfop_id": null,
    "cfopscodigo__cfop": null,
    "cfopsdescricao": null,
    "dadosComplementares": " ",
    "pedidos_relacionados_validComerc": "",
    "status_integracao": "aguardando_integracao",
    "status_integracao_desc": "Aguardando Integração",
    "respostaIntegracao": [
        {
            "STATUS_INT": "E",
            "FASE": "RI",
            "MESSAGE": "ERRO NO RETORNO DA INTEGRAÇÃO 404 page not found\n undefined"
        }
    ],
    "message": "SUCCESS",
    "dtDocFinalizado": "2023-05-22 20:03:24",
    "dtDocFinalizadoDate": "2023-05-22T23:03:24Z",
    "customIntegracao": {
        "condRetornoIntegracao": true,
        "retornoMsg": "SUCCESS",
        "waitingWebHookRetornoIntegracao": false
    },
    "waitingWebHookRetornoIntegracao": false
};

init(JSON.stringify(jsonInput));
