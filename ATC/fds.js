/******************** ENV_NODE ********************
 ******************** NAO_MEXA ********************
 */
const { date } = require('assert-plus');
const { formatDate } = require('tough-cookie');
const { log } = require('console');
const { memory } = require('console');
const { resolve } = require('path');
const { type } = require('os');
const axios = require('axios');
const fs = require('fs');
const jsuser = require('../onergy/onergy-utils');
const onergy = require('../onergy/onergy-client');
const utils = require('../onergy/onergy-utils');
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
async function onergy_updatemany(args) {
    args.executeAction = false;
    return await onergy.onergy_save(args);
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
/******************** NODE_SCRIPT ********************
******************** NODE_SCRIPT ********************
*/
async function init(json) {
    let data = JSON.parse(json);

    let inf_conta = await getOnergyItem("1e6d6595-083f-4bb8-b82c-e9054e9dc8f3", data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, null);
    let result = [];
    for (let conta of inf_conta) {
        let contasEncontradas = inf_conta.filter((VALUE) => VALUE.UrlJsonContext.conta_interna_nic == conta.UrlJsonContext.conta_interna_nic);
        if (contasEncontradas.length > 1) {
            result.push(`${conta.UrlJsonContext.conta_interna_nic} - ${conta.UrlJsonContext.asset_number}`);
        }
    }

    debugger;
}

function initBefore(json) {
    //return true;
}

function initDelete(json) {
    //return true;
}

function SetObjectResponse(cond, json, WaitingWebHook) {
    if (WaitingWebHook === undefined) {
        WaitingWebHook = false;
    }
    var obj = {
        'cond': cond,
        'WaitingWebHook': WaitingWebHook,
    };
    if (json && Object.keys(json).length > 0) {
        obj.json = JSON.stringify(json);
    }
    return obj;
}

async function getOnergyItem(fdtid, assid, usrid, filtro) {
    let keepSearching = true;
    let skip = 0;
    take = 500;
    let result = [];
    while (keepSearching) {
        let strPageResp = await onergy_get({
            fdtid: fdtid,
            assid: assid,
            usrid: usrid,
            filter: filtro,
            skip: skip,
            take: take
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

const zerarHora = (data) => {
    if (!data) {
        return '';
    }
    let imputData = new Date(data);
    imputData.setHours(00);
    imputData.setMinutes(00);
    imputData.setSeconds(00);
    imputData.setMilliseconds(00);
    return imputData;
};

var jsonInput = {
    "from_lote": "Sim",
    "from_lote_desc": "Sim",
    "status_doc": "Documento Reconocido",
    "dtUploadDate": "2023-02-16T15:22:37Z",
    "dtUpload": "2023-02-16 12:22:37",
    "NFe_informar_data_de_vencimento": "sim",
    "data_de_vencimento_uploadDate": "2023-02-10T03:00:00Z",
    "data_de_vencimento_upload": "2023-02-10 00:00:00",
    "from_lote_id": "b9325622-f0e3-b242-1afa-05ecf39a1697",
    "anexo_nf": [
        {
            "Url": "https://onebackupservices.blob.core.windows.net/88443605-74d6-4ea4-b426-a6c3e26aa615/CT PADRE 4 (1).pdfec65e082-cea3-4372-b6e6-91c64b3080ff.pdf?sv=2018-03-28&sr=b&sig=PVD9EhzhLT4avGy3p2k6TNFo2M8M0OjcwUl5XmxEp6I%3D&se=2023-09-04T15%3A20%3A01Z&sp=r",
            "UrlAzure": "https://onebackupservices.blob.core.windows.net/88443605-74d6-4ea4-b426-a6c3e26aa615/CT PADRE 4 (1).pdfec65e082-cea3-4372-b6e6-91c64b3080ff.pdf?sv=2018-03-28&sr=b&sig=PVD9EhzhLT4avGy3p2k6TNFo2M8M0OjcwUl5XmxEp6I%3D&se=2023-09-04T15%3A20%3A01Z&sp=r",
            "Name": "CT PADRE 4 (1).pdf"
        }
    ],
    "porcess_log": false,
    "responsavel_upload": "prod@atc.com.br",
    "status_doc_desc": "Documento Reconocido",
    "reqiddocsia": "us-east-1_k7iBbPRnU/63ae0c9a62a2cd77feb41d67/4feaf98bd97fc5351404520bcc2bfbdf.pdf",
    "docsia": {
        "request_id": "us-east-1_k7iBbPRnU/63ae0c9a62a2cd77feb41d67/4feaf98bd97fc5351404520bcc2bfbdf.pdf",
        "response": {
            "prediction_class": "financeiro-contas-energia-colombia",
            "prediction_prob": 0.9884832070916048,
            "extractions": {
                "id": "us-east-1_k7iBbPRnU/63ae0c9a62a2cd77feb41d67/4feaf98bd97fc5351404520bcc2bfbdf.pdf",
                "client_id": "63ae0c9a62a2cd77feb41d67",
                "filename": "CT PADRE 4 (1).pdfec65e082-cea3-4372-b6e6-91c64b3080ff.pdf",
                "filesize": 317920,
                "cognito_id": "",
                "tipo_arquivo": "pdf",
                "url_file": "https://s3-sa-east-1.amazonaws.com/docsia-input/us-east-1_k7iBbPRnU/63ae0c9a62a2cd77feb41d67/4feaf98bd97fc5351404520bcc2bfbdf.pdf",
                "url_image": "https://s3-sa-east-1.amazonaws.com/docsia-images-jpegs/us-east-1_k7iBbPRnU/63ae0c9a62a2cd77feb41d67/4feaf98bd97fc5351404520bcc2bfbdf.jpg",
                "url_text": "https://s3-sa-east-1.amazonaws.com/docsia-text-txts/us-east-1_k7iBbPRnU/63ae0c9a62a2cd77feb41d67/4feaf98bd97fc5351404520bcc2bfbdf.txt",
                "url_thumb": "https://s3-sa-east-1.amazonaws.com/docsia-images-jpegs/us-east-1_k7iBbPRnU/63ae0c9a62a2cd77feb41d67/4feaf98bd97fc5351404520bcc2bfbdf.jpg",
                "category": "0//Financeiro|1//Contas|2//Energia|3//Colombia",
                "class": "financeiro-contas-energia-colombia",
                "confidence_class": 0.9884832070916048,
                "ocr_original_text": "IMPORTANTE:En cumplimiento de la resolución CREG 038 de 2014,la cual modifico el Código de Medida,se establecieron obligaciones,actividades y responsabilidades asignadas a ENEL COLOMBIA S.A. E.S.P. y sus usuarios.ACTIVIDAD ECONOMICA 3514 Comercialización de Energia Electrica Tarifa 11,04 por mil.merito ejecutivo de conformidad con el Articulo 130 de la Ley 142. 1994 Somos agentes retenedores de IVA e ICA Somos grandes contribuyentes segun resolución No 012220 de 26 de diciembre de 2022.El prestador del servicio de comercialización y distribución de energia electrica y de productos y servicios de valor agregado es Enel Colombia S.A. E.S.P. NIT.860.063.875-8.Entidad vigilada por la Superintendencia de Servicios Publicos Domiciliarios.presta GRUPO:1 CIRCUITO:MU23-12585TR1-NIVEL DE TENSION:1 PROPIEDAD:Empresa COD.FACTURACION:LC Esta factura de cobro enel ENEL COLOMBIA S.A. E.S.P. NIT:860.063.875-8 Calle 93 No. 13-45 Piso 1 www.enel.com.co CUENTA RESUMEN AMERICAN TOWER ATC KR 11 A NO 93-35 PI 2 BOGOTA SOACHA SOACHA kWh CLIENTE 20 18 RESUMEN EJECUTIVO Factura de Servicios Públicos No. 712027627-1 Periodo facturado Fecha expedición Próxima fecha de lectura Total a Pagar Cuenta padre No. ONAPPPPTIL-COMPORTAMIENTO CONSUMO DE ENERGÍA 0 0000000000000000000000000000 Diurna Nocturna Diurna Nocturna Diurna Nocturna Diurna Nocturna Diurna Nocturna Diurna Nocturna Diurna Nocturna AGO SEP OCT NOV DIC ENE FEB ENERGÍA Este mes tu CONSUMO presenta una variación.Te invitamos a consultar los motivos que pueden generar la variación en nuestra página web www.enel.com.co 03 ENE/2023 A 01 FEB/2023 03/febrero/2023 01 MAR/2023 $ 387,595,320 CONCEPTOS FACTURADOS Promedio activa de los últimos 6 meses Concepto CONSUMO ACTIVA SENCILLA CONSUMO DE ENERGIA 742.7324 ( Valor kWh ) x0 ( Consumo en kWh ) h SUBTOTAL VALOR CONSUMO ....... CONSUMOS TRASPASADOS DE HIJOS A PADRES CARGO DEBITO CLIENTE PADRE AJUSTE A LA DECENA ( CREDITO ) CONTRIB.TRASPASADAS HIJOS A PADRES SUBSIDIOS TRASPASADOS HIJOS A PADRES SUBTOTAL VALOR OTROS.1 ¿ Quieres tu factura virtual ? Escanea el codigo Total Energía $ 387,595,320 Lectura actual 0 216 2 Portafolio Enel X $ 0 Lectura anterior 0 Diferencia 0 earth pact PAPEL ECOLÓGICO REPARTO ESPECIAL KR 11 A NO 93-35 PI 2 100 % sweet cane paper Factor 0 DATOS TÉCNICOS Ruta:2000 9 56 926 0496 EGSO050611 Tipo de Servicio:Comercial Estrato:Medidor No .: Nivel de Tensión:Circuito:Propiedad:Anomalía:Lectura:$ Total a Pagar$387,595,320 CHICO NORTE II SECTOR CHAPINERO BOGOTÁ,D.C. BOGOTÁ,D.C. CONTÁCTANOS Enel Colombia @EnelClientesCO SERVICIO AL CLIENTE 601 580 1000 DENUNCIAS 601 5 894 894 denuncias@enel.com Cita este número para pagos y consultas 1 MU23 Empresa Energía Consumida 0 0 Promedio reactiva de los últimos 6 meses Energía Facturada 0 Real Número de Cliente Pago oportuno 3969536-5 servicioalcliente.empresarial@enel.com COMPONENTES TARIFARIOS/Componentes del costo:Vigencia:ENE/2023 G:282.18 T:51.97 D:244.90 CV:62.67 PR:58.08 R:19.75 CF:0.00/$ 719.56 Costo kWh Mes Número de cuenta www.enel.com.co Transformador:Activo:Carga ( kW ):Grupo:Red:Nivel de Referencia:Nivel de Tensión Ref:App Enel Clientes Colombia EMERGENCIAS 115 Suspensión por no pago 1 TOTAL ENERGÍA:DEFENSOR DEL CLIENTE defensor@enel.com 0 Precio Unitario 742.7324 44 12585TR1 Uso 1 1 Aerea Nivel II Nivel II USO SEGURO DE LA ENERGÍA Al comprar equipos considera el criterio de eficiencia energética,esencialmente en sistemas de iluminación.Tarifa aplicada Opción Tarifaria 742.73 Costo kWh Mes VALOR$0 $ 0 $ 0 $ 0 $ 323,365,005 $ 1,381,226 $ -2 $ 63,067,497 $ -218,406 $ 387,595,320 $ 387,595,320 09 FEB/2023 09 FEB/2023 3969536-5 Superservicios Somos autorretenedores según Resolución No. 0547 del 25 de Enero de 2002. IVA régimen Común CUMPLIMIENTO RESOLUCIÓN CREG 015 DE 1999.Vigilado OPERADOR DE RED:ENEL COLOMBIA SA E.S.P. 44 ",
                "is_review": false,
                "tenant_id": "63ae0c9a62a2cd77feb41d67",
                "id_cliente_origem": "",
                "id_request_cliente_origem": "",
                "suscriptor": "CUENTA RESUMEN AMERICAN TOWER ATC",
                "numero_cuenta_padre": null,
                "fecha_vencimiento": "2023-02-09T03:00:00Z",
                "total_factura": 387595320,
                "numero_cuenta": "39695365",
                "numero_factura": "7120276271",
                "codigo_barras": null,
                "fecha_expedicion": "2023-02-03T03:00:00Z",
                "id_prestador_servicio_publico": "8600638758",
                "valor_energia": 0,
                "alumbrado_publico": null,
                "aseo_acueduto": null,
                "tarifa": 742.7324,
                "consumo_kwh": 0,
                "numero_medidor": null,
                "intereses_mora": 0,
                "contribuicion": null,
                "fecha_inicial_cobro": "2023-01-03T03:00:00Z",
                "fecha_final_cobro": "2023-02-01T03:00:00Z",
                "tipo_lectura_energia": "Real",
                "ajustamiento": -2,
                "vigilancia": null,
                "iva": null,
                "reliquidaciones": null,
                "total_cuenta_hija": null,
                "compensaciones_energia": null,
                "financiacion": null,
                "tarifa_conexion": null,
                "otros_energia": null
            },
            "status": "Finalizado"
        },
        "internal_error": 0,
        "msg_internal_error": ""
    },
    "objParametrosDocsIA": {
        "classificador": "Factura Energia",
        "campo_nr": "39695365",
        "campo_codigo_verificacao": "",
        "campo_data_emissao": "2023-02-03T03:00:00Z",
        "campo_pedido": "",
        "campo_mes_referente": "",
        "campo_codigo_servico": "",
        "campo_descricao_cod_servico": "",
        "campo_origem_nota": "Real",
        "campo_rps_n": "7120276271",
        "campo_rps_serie": "",
        "campo_municipio_prestacao_servico": "",
        "campo__numero_inscricao_obra": "",
        "campo_outros_texto": "",
        "campo_discriminacao_servico": "",
        "campo_data_vencimento": "2023-02-09T03:00:00Z",
        "campo_data_inicio_pagamento": "2023-01-03T03:00:00Z",
        "campo_data_fim_pagamento": "2023-02-01T03:00:00Z",
        "campo_codigo_barras": "",
        "campo_protocolo": "",
        "campo_carteira": "",
        "campo_ag_conta": "",
        "campo_banco": "",
        "campo_numero_apolice": "",
        "campo_numero_instalacao": null,
        "campo_numero_cliente": "",
        "campo_rgi": "",
        "campo_cond_pagamento": "",
        "campo_razao_social_prestador": null,
        "campo_cnpj_prestador": "8600638758",
        "campo_prestador_inscricao_municipal": "",
        "campo_prestador_inscricao_estadual": "",
        "campo_prestador_tipo_logradouro": "",
        "campo_prestador_logradouro": "",
        "campo_prestador_numero_endereco": "",
        "campo_prestador_complemento_endereco": "",
        "campo_prestador_bairro": "",
        "campo_prestador_cep": "",
        "campo_prestador_cidade": "",
        "campo_prestador_uf": "",
        "campo_prestador_telefone": "",
        "campo_prestador_email": "",
        "campo_razao_social_tomador": "CUENTA RESUMEN AMERICAN TOWER ATC",
        "campo_cnpj_tomador": "",
        "campo_tomador_inscricao_municipal": "",
        "campo_tomador_inscricao_estadual": "",
        "campo_tomador_tipo_logradouro": "",
        "campo_tomador_logradouro": "",
        "campo_tomador_numero_endereco": "",
        "campo_tomador_complemento_endereco": "",
        "campo_tomador_bairro": "",
        "campo_tomador_cep": "",
        "campo_tomador_cidade": "",
        "campo_tomador_uf": "",
        "campo_tomador_email": "",
        "campo_tomador_telefone": "",
        "campo_pcc": "",
        "campo_irrf": "",
        "campo_iss": 0,
        "campo_iss_retido": "",
        "campo_valor_iss": null,
        "campo_inss": "",
        "campo_pis": "",
        "campo_cofins": null,
        "campo_csll": null,
        "campo_iss_bitributacao": null,
        "campo_icms": null,
        "campo_aliquota": null,
        "campo_valor_aprox_dos_tributosfonte": null,
        "campo_valor_total_impostos": null,
        "campo_taxa_de_iluminacao": null,
        "campo_agua_e_esgoto": null,
        "campo_tarifa": -2,
        "campo_moeda": "",
        "campo_base_calculo": "",
        "campo_credito": null,
        "campo_valor": 0,
        "campo_valor_total_recebido": 387595320,
        "campo_consumo_kwh": 0,
        "campo_valor_kwh": 742.7324
    },
    "CDE__registro_salvo": "sim",
    "agua_e_esgoto": 0,
    "assinante": null,
    "classificador": "Factura Energia",
    "compensacao_de_energia": 0,
    "consumo_kwh": 0,
    "conta_interna_nic": "39695365",
    "data_emissaoDate": "2023-02-03T03:00:00Z",
    "data_emissao": "2023-02-03 00:00:00",
    "data_fim_pagamentoDate": "2023-02-01T03:00:00Z",
    "data_fim_pagamento": "2023-02-01 00:00:00",
    "data_inicio_pagamentoDate": "2023-01-03T03:00:00Z",
    "data_inicio_pagamento": "2023-01-03 00:00:00",
    "data_vencimentoDate": "2023-02-10T03:00:00Z",
    "data_vencimento": "2023-02-10 00:00:00",
    "energia_de_contribuicao": 0,
    "fatura": [
        {
            "Url": "https://onebackupservices.blob.core.windows.net/88443605-74d6-4ea4-b426-a6c3e26aa615/CT PADRE 4 (1).pdfec65e082-cea3-4372-b6e6-91c64b3080ff.pdf?sv=2018-03-28&sr=b&sig=PVD9EhzhLT4avGy3p2k6TNFo2M8M0OjcwUl5XmxEp6I%3D&se=2023-09-04T15%3A20%3A01Z&sp=r",
            "UrlAzure": "https://onebackupservices.blob.core.windows.net/88443605-74d6-4ea4-b426-a6c3e26aa615/CT PADRE 4 (1).pdfec65e082-cea3-4372-b6e6-91c64b3080ff.pdf?sv=2018-03-28&sr=b&sig=PVD9EhzhLT4avGy3p2k6TNFo2M8M0OjcwUl5XmxEp6I%3D&se=2023-09-04T15%3A20%3A01Z&sp=r",
            "Name": "CT PADRE 4 (1).pdf"
        }
    ],
    "financiamentos": 0,
    "imposto_de_vigilancia": 0,
    "juros_de_mora": 0,
    "nit_provedor": "860063875",
    "nome_do_anexo": "CT PADRE 4 (1).pdf",
    "numero_da_nota_fiscal": "7120276271",
    "reajuste": -2,
    "reliquidacoes": 0,
    "taxa_de_iluminacao": 0,
    "tipo_de_fonte": "prod@atc.com.br",
    "tipo_de_leitura": "Real",
    "valor_energia": 0,
    "valor_kwh": 742.7324,
    "valor_total_informado": 387595320,
    "status_do_processo_filha": "PROCESANDO",
    "historico_processos": [
        "71e21e4f-d08e-44fb-b7c3-da38db809886"
    ],
    "CDE__acuerdo_resolucion_alumbrado_publico": "",
    "CDE__codigo_ancora": "MED0574",
    "CDE__codigo_do_sitio_do_cliente": "MED0574",
    "CDE__mes_processo": "febrero 2023",
    "LSTCDE__estrato_id": "d1fb1c10-93a1-4c66-b35a-92f0a792964c",
    "LSTLST_estrato__CDE__estrato": 0,
    "NVTCDE__nivel_de_tensao_id": "8544b9e8-be73-4009-9b06-f87bbad633cc",
    "NVTNVT_nivel__CDE__nivel_de_tensao": "NIVEL I",
    "PCSCDE__portfolio_cliente_id": "600837e1-43de-4483-92f8-222a07bbd53d",
    "PCSPCS_portafolio_cliente__CDE__portfolio_cliente": "OCCASIO",
    "asset_number": "",
    "beneficiario": "ENEL COLOMBIA S.A. E.S.P",
    "classificacao_passthru": "",
    "conta_pai": "39695365",
    "ctgr_CDE__categoria_id": "9d5592d9-2294-4f7f-886b-38ddb5916354",
    "ctgr_categorias__CDE__categoria": "COMERCIAL",
    "data_ultima_captura": null,
    "forma_de_pagamento": "",
    "frequencia_de_pagamento": "MENSUAL",
    "media_de_energia": 0,
    "media_iluminacao": 0,
    "media_valor_total": 0,
    "nit_beneficiario": "860063875",
    "nome_do_provedor": "ENEL",
    "nome_do_site": "ÉXITO LAURELES II",
    "portifolio_atc": "TIGO OCCASIO",
    "profit_cost_center": "195732-RT1",
    "regio_CDE__regiao_atc_id": "a77e4094-8f27-4e55-8979-5aadd30c16a7",
    "regio_regional__CDE__regiao_atc": "NOROCCIDENTE",
    "servicos": "",
    "tipo_cobr_CDE__tipo_de_cobranca_id": null,
    "tipo_cobr_tipos_cobrancas__CDE__tipo_de_cobranca": null,
    "tipo_de_conta": "P",
    "enviado_para_processo_pai": "sim",
    "onergy_js_ctx_ORIGINAL": {
        "assid": "88443605-74d6-4ea4-b426-a6c3e26aa615",
        "fedid": "82ba0dc7-2b93-4ebd-88fd-0fded1d0db47",
        "fdtid": "822245f3-b0de-4f74-830b-90c8c8efee15",
        "usrid": "40ddc5fc-2ef7-4b78-bcc4-5e2048d22331",
        "insertDt": "2023-02-16T15:22:38.004Z",
        "updateDt": "2023-02-16T15:24:04.647Z",
        "cur_userid": "40ddc5fc-2ef7-4b78-bcc4-5e2048d22331",
        "email": "prod@atc.com.br",
        "user_name": "prod@atc.com.br",
        "onergy_rolid": "",
        "praid": "ba5a75c8-711b-4502-ac12-12e0b7981cd6",
        "pcvid": "809c10ad-9110-4c24-ac73-ee0816fc8bcf",
        "prcid": "47746698-21d8-1384-eb51-ddbda4718b3d",
        "timezone": null,
        "timezone_value": "-03:00",
        "pubNubHook": null
    },
    "oneTemplateTitle": "Bloco 1",
    "fluxo": {
        "bloco_01": true,
        "bloco_02": true,
        "bloco_03": true
    },
    "onergyLog": {
        "log_bloco_01": true,
        "log_bloco_02": false,
        "log_bloco_03": false
    },
    "ass_id": "88443605-74d6-4ea4-b426-a6c3e26aa615",
    "assid": "88443605-74d6-4ea4-b426-a6c3e26aa615",
    "email": "prod@atc.com.br",
    "fdtid": "0a7b81bd-fb75-43e5-a199-20188bd229b3",
    "fedid": "022a597a-cbdc-4bc4-a776-352e544ea132",
    "onergy_rolid": "",
    "timezone": null,
    "usrid": "40ddc5fc-2ef7-4b78-bcc4-5e2048d22331",
    "onergy_js_ctx": {
        "assid": "88443605-74d6-4ea4-b426-a6c3e26aa615",
        "fedid": "022a597a-cbdc-4bc4-a776-352e544ea132",
        "fdtid": "0a7b81bd-fb75-43e5-a199-20188bd229b3",
        "usrid": "40ddc5fc-2ef7-4b78-bcc4-5e2048d22331",
        "insertDt": "2023-02-16T15:24:05.35Z",
        "updateDt": "2023-02-16T15:24:06.303Z",
        "cur_userid": "40ddc5fc-2ef7-4b78-bcc4-5e2048d22331",
        "email": "prod@atc.com.br",
        "user_name": "prod@atc.com.br",
        "onergy_rolid": "",
        "praid": "2870758d-2b48-4fb0-9883-d60009020e5c",
        "pcvid": "9edb4aea-6dbd-4867-8d7d-2edd67b76aa6",
        "prcid": "2b70dcac-717a-1905-a6bb-0d9125a632fd",
        "timezone": null,
        "timezone_value": "-03:00",
        "pubNubHook": null
    }
};

init(JSON.stringify(jsonInput));
