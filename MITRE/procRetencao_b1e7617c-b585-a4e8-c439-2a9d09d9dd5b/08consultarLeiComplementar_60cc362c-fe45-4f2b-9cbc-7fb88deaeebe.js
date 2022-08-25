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

const fdtCadGeral_ImpostosLeiComplementar = '7826bdf4-b58e-4155-9398-84b825cc5e4c';
async function getLeiComplementar(data, codLeiComplementar) {
    let itemLei;
    let filtLei = [{ FielName: 'lc_cod', Type: 'string', FixedType: 'string', Value1: codLeiComplementar }];
    let getLei = await getOnergyItem(
        fdtCadGeral_ImpostosLeiComplementar,
        data.onergy_js_ctx.assid ? data.onergy_js_ctx.assid : data.assid,
        data.onergy_js_ctx.usrid ? data.onergy_js_ctx.usrid : data.usrid,
        JSON.stringify(filtLei)
    );
    let objLei = getLei.length > 0 ? JSON.parse(getLei) : getLei;
    if (objLei !== null && objLei.length > 0) {
        objLei[0].UrlJsonContext.fedid = objLei[0].ID;
        itemLei = objLei[0].UrlJsonContext;
    }
    return itemLei;
}

const fdtCadGeral_ImpostosMunicipais = '2877d774-53cc-49c9-b433-3d6504142552';
async function getLeiComplementarPorMunicipio(data, codService, codLeiComplementar, Municipio) {
    let itemLei;
    let arrFiltLei = [{ FielName: 'MLOCmunicipio_ibge', Type: 'string', FixedType: 'string', Value1: parseInt(Municipio).toString() }];
    if (codService) {
        arrFiltLei.push({ FielName: 'mun_isscod', Type: 'string', FixedType: 'string', Value1: codService });
    }
    if (codLeiComplementar !== undefined) {
        arrFiltLei.push({ FielName: 'MIMPlc_cod', Type: 'string', FixedType: 'string', Value1: codLeiComplementar });
    }
    let getLei = await getOnergyItem(
        fdtCadGeral_ImpostosMunicipais,
        data.onergy_js_ctx.assid ? data.onergy_js_ctx.assid : data.assid,
        data.onergy_js_ctx.usrid ? data.onergy_js_ctx.usrid : data.usrid,
        JSON.stringify(arrFiltLei)
    );
    let objLei = typeof getLei === 'object' ? getLei : JSON.parse(getLei);
    if (objLei !== null && objLei.length > 0) {
        itemLei = objLei[0].UrlJsonContext;
    }
    return itemLei;
}

const fdtConsDet_Nfse = '9253cd1f-f178-4129-a0e0-a7585d7f51c5';
const fdtMonitDoc_Nfse = '254907b2-d9fe-4c4c-bc5e-6c4aec3d5bed';
const fdtCompartliharDoctosParaValidacaoDeDuplicados = '8a7b4e11-0afb-4d61-9baf-a10f01cc1606';
async function init(json) {
    let data2;
    let itemLeiBiTrib;
    const data = JSON.parse(json);
    // onergy.log('JFS: initProcRetencao_ConsultarLeiComplementar');

    //* verifica e normaliza codServico
    //* se nao houver codServico, armazena 0
    if (data.codServico === undefined || data.codServico === null) {
        data.codServico = '0';
    }
    let numCodServico = parseInt(data.codServico);
    let normCodServico = numCodServico.toString().replace('.', '').replace('-', '');

    //* CadastroGeral_ImpostosMunicipais
    //* busca itemLei por munPrestador e normCodServico
    let itemLei = await getLeiComplementarPorMunicipio(data, normCodServico, undefined, parseInt(data.munPrestador).toString());
    // onergy.log('JFS: getLeiComplementarPorMunicipio: fdtCadGeral_ImpostosMunicipais: itemLei: ' + JSON.stringify(itemLei));

    //* CadastroGeral_ImpostosMunicipais
    //* se nao houver itemLei, busca itemLei por codService original
    if (!itemLei) {
        itemLei = await getLeiComplementarPorMunicipio(data, data.codServico.toString(), undefined, parseInt(data.munPrestador).toString());
        // onergy.log('JFS: getLeiComplementarPorMunicipio: fdtCadGeral_ImpostosMunicipais: itemLei: ' + JSON.stringify(itemLei));
    }

    //* CadastroGeral_ImpostosMunicipais
    //* se houver cpom false, busca itemLeiBiTrib por codLeiComplementar
    if (data.cpom !== undefined && data.cpom === false && itemLei !== undefined) {
        itemLeiBiTrib = await getLeiComplementarPorMunicipio(data, undefined, itemLei.MIMPlc_cod, parseInt(data.munTomador).toString());
        // onergy.log('JFS: getLeiComplementarPorMunicipio: fdtCadGeral_ImpostosMunicipais: itemLeiBiTrib: ' + JSON.stringify(itemLeiBiTrib));
    }

    //* CadastroGeral_ImpostosLeiComplementar
    //* se nao houver itemLei, busca itemLei por codLeiComplementar
    if (!itemLei) {
        itemLei = await getLeiComplementar(data, data.codServico);
        // onergy.log('JFS: getLeiComplementar: fdtCadGeral_ImpostosLeiComplementar: itemLei: ' + JSON.stringify(itemLei));
    }

    //* se houver grpidResp, armazena em arrGrpId
    let arrGrpId = [];
    if (data.grpidResp !== null && data.grpidResp !== '') {
        arrGrpId.push(data.grpidResp);
    }

    //* ConsultaDetalhada_Nfse
    //* busca objNfse por idfk
    let filtConsDet_Nfse = JSON.stringify([{ FielName: 'fedid', Type: 'string', FixedType: 'string', Value1: data.idfk }]);
    let getConsDet_Nfse = await getOnergyItem(
        fdtConsDet_Nfse,
        data.onergy_js_ctx.assid ? data.onergy_js_ctx.assid : data.assid,
        data.onergy_js_ctx.usrid ? data.onergy_js_ctx.usrid : data.usrid,
        filtConsDet_Nfse
    );
    let objNfse = typeof getConsDet_Nfse !== 'object' ? JSON.parse(getConsDet_Nfse) : getConsDet_Nfse;
    // onergy.log('JFS: getOnergyItem: fdtConsDet_Nfse: objNfse: ' + JSON.stringify(objNfse[0].UrlJsonContext));

    let arrAnexos = data.anexos;
    //* se houver objNfse, segue
    if (objNfse !== null && objNfse.length > 0) {
        //* se houver anexos em objNfse, segue
        if (objNfse[0].UrlJsonContext.anexos !== undefined) {
            //* se houver nulo em anexos, armazena array em anexos
            if (objNfse[0].UrlJsonContext.anexos === null) objNfse[0].UrlJsonContext.anexos = [];
        } else {
            //* se nao houver anexos em objNfse, armazena array em anexos
            objNfse[0].UrlJsonContext.anexos = [];
        }

        //* para cada item de arrAnexos, armazena em anexos de objNfse
        for (let file in arrAnexos) objNfse[0].UrlJsonContext.anexos.push(arrAnexos[file]);
        // onergy.log('JFS: fdtConsDet_Nfse: objNfse: anexos: ' + JSON.stringify(objNfse[0].UrlJsonContext.anexos));
    }

    //* se houver itemLei, segue
    if (itemLei) {
        //* armazena fed itemLei
        //* armazena codServico de itemLei (ou codLeiComplementar)
        //* armazena issDesc de itemLei (ou descLeiComplementar)
        let MIMPcodServico_id = itemLei.fedid;

        //TODO qual é a prioridade:
        //TODO mun_cod_normalizado ou lc_cod?
        let MIMPmun_isscod__codServico = (itemLei.mun_cod_normalizado ? itemLei.mun_cod_normalizado : '') || (itemLei.lc_cod ? itemLei.lc_cod : '');

        //TODO qual é a prioridade:
        //TODO mun_issdesc ou lc_desc?
        let MIMPmun_issdesc = (itemLei.mun_issdesc ? itemLei.mun_issdesc : '') || (itemLei.lc_desc ? itemLei.lc_desc : '');

        //* cria objeto para onergy_updatemany
        let postInfoInbox = {
            UrlJsonContext: {
                MIMPcodServico_id: MIMPcodServico_id,
                MIMPmun_isscod__codServico: MIMPmun_isscod__codServico,
                MIMPmun_issdesc: MIMPmun_issdesc,
            },
        };

        //* fdtCompartliharDoctosParaValidacaoDeDuplicados
        //* isMultiUpdate: true - atualiza todos os registros
        //* contendo doc_original: MonitDoc + ConsDet
        // onergy.log('JFS: onergy_updatemany: fdtMonitDoc_Nfse: postInfoInbox: ' + JSON.stringify(postInfoInbox.UrlJsonContext));
        await onergy_updatemany({
            fdtid: fdtCompartliharDoctosParaValidacaoDeDuplicados,
            assid: data.onergy_js_ctx.assid ? data.onergy_js_ctx.assid : data.assid,
            usrid: data.onergy_js_ctx.usrid ? data.onergy_js_ctx.usrid : data.usrid,
            data: JSON.stringify(postInfoInbox),
            filter: JSON.stringify([{ FielName: 'doc_original', Type: 'string', FixedType: 'string', Value1: data.doc_original }]),
            isMultiUpdate: true,
        });

        let vl_cofins = 0;
        let vl_pis = 0;
        let vl_csll = 0;
        let vl_irrf = 0;
        let vl_inss = 0;
        let vl_iss = 0;
        let vl_iss_bi = 0;
        let aliq_iss_bi = 0;
        let tot_impostos = 0;

        //TODO qual é a prioridade:
        //TODO MIMPlc_alcofins ou lc_alcofins?
        itemLei.MIMPlc_alcofins = (itemLei.MIMPlc_alcofins ? itemLei.MIMPlc_alcofins : 0) || (itemLei.lc_alcofins ? itemLei.lc_alcofins : 0);

        //* se houver aliquota cofins, calcula valor cofins
        if (itemLei.MIMPlc_alcofins !== 0 && itemLei.MIMPlc_alcofins !== undefined)
            vl_cofins = parseFloat((data.valor * itemLei.MIMPlc_alcofins) / 100).toFixed(2);

        //TODO qual é a prioridade:
        //TODO MIMPlc_alpis ou lc_alpis?
        itemLei.MIMPlc_alpis = (itemLei.MIMPlc_alpis ? itemLei.MIMPlc_alpis : 0) || (itemLei.lc_alpis ? itemLei.lc_alpis : 0);

        //* se houver aliquota pis, calcula valor pis
        if (itemLei.MIMPlc_alpis !== 0 && itemLei.MIMPlc_alpis !== undefined) vl_pis = parseFloat((data.valor * itemLei.MIMPlc_alpis) / 100).toFixed(2);

        //TODO qual é a prioridade:
        //TODO MIMPlc_alcsll ou lc_alcsll?
        itemLei.MIMPlc_alcsll = (itemLei.MIMPlc_alcsll ? itemLei.MIMPlc_alcsll : 0) || (itemLei.lc_alcsll ? itemLei.lc_alcsll : 0);

        //* se houver aliquota csll, calcula valor csll
        if (itemLei.MIMPlc_alcsll !== 0 && itemLei.MIMPlc_alcsll !== undefined) vl_csll = parseFloat((data.valor * itemLei.MIMPlc_alcsll) / 100).toFixed(2);

        //TODO qual é a prioridade:
        //TODO MIMPlc_alirrf ou lc_alirrf?
        itemLei.MIMPlc_alirrf = (itemLei.MIMPlc_alirrf ? itemLei.MIMPlc_alirrf : 0) || (itemLei.lc_alirrf ? itemLei.lc_alirrf : 0);

        //* se houver aliquota irrf, calcula valor irrf
        if (itemLei.MIMPlc_alirrf !== 0 && itemLei.MIMPlc_alirrf !== undefined) vl_irrf = parseFloat((data.valor * itemLei.MIMPlc_alirrf) / 100).toFixed(2);

        //TODO qual é a prioridade:
        //TODO MIMPlc_alinss ou lc_alinss?
        itemLei.MIMPlc_alinss = (itemLei.MIMPlc_alinss ? itemLei.MIMPlc_alinss : 0) || (itemLei.lc_alinss ? itemLei.lc_alinss : 0);

        //* se houver aliquota inss, calcula valor inss
        if (itemLei.MIMPlc_alinss !== 0 && itemLei.MIMPlc_alinss !== undefined) vl_inss = parseFloat((data.valor * itemLei.MIMPlc_alinss) / 100).toFixed(2);

        //TODO qual é a prioridade:
        //TODO MIMPlei_complementar_aliquota_iss
        //TODO ou lei_complementar_aliquota_iss?
        itemLei.MIMPlei_complementar_aliquota_iss =
            (itemLei.MIMPlei_complementar_aliquota_iss ? itemLei.MIMPlei_complementar_aliquota_iss : 0) ||
            (itemLei.lei_complementar_aliquota_iss ? itemLei.lei_complementar_aliquota_iss : 0);

        //* se houver retencao iss, segue
        if (itemLei.MIMPretem_iss === 1) {
            //* se houver aliquota iss, calcula valor iss
            if (itemLei.MIMPlei_complementar_aliquota_iss !== 0 && itemLei.MIMPlei_complementar_aliquota_iss !== undefined)
                vl_iss = parseFloat((data.valor * itemLei.MIMPlei_complementar_aliquota_iss) / 100).toFixed(2);
        } else {
            //* se nao houver retencao iss, retorna aliquota iss 0
            itemLei.MIMPlei_complementar_aliquota_iss = 0;
        }

        //* se houver bitributacao iss, calcula valor iss bi
        if (itemLeiBiTrib) {
            aliq_iss_bi = itemLeiBiTrib.mun_aliss;
            vl_iss_bi = parseFloat((data.valor * itemLeiBiTrib.mun_aliss) / 100).toFixed(2);
        }

        //* calcula total impostos e total liquido
        tot_impostos = +vl_iss_bi + +vl_iss + +vl_inss + +vl_irrf + +vl_csll + +vl_pis + +vl_cofins;
        tot_liq = data.valor - tot_impostos;
        let tot_liq2 = +tot_liq.toFixed(2);

        //TODO rever logica existeRetencao
        let existeRetencao = true;
        //* se simples com retencao for 1, isSimplesComRetencao true
        let isSimplesComRetencao = itemLei.MIMPsimples_nacional_com_retencao_ !== undefined && itemLei.MIMPsimples_nacional_com_retencao_.toString() === '1';
        //* se houver simples nacional, existeRetencao true
        if (isSimplesComRetencao && data.simples_nacional) {
            existeRetencao = true;
        } else if (data.simples_nacional && !isSimplesComRetencao) {
            //* se isSimplesComRetencao false, existeRetencao false
            existeRetencao = false;
        } else {
            //* se nao houver simples nacional, existeRetencao true
            existeRetencao = true;
        }

        //* se existeRetencao false, armazena valores 0
        if (!existeRetencao) {
            vl_pis = 0;
            vl_csll = 0;
            vl_irrf = 0;
            vl_iss = 0;
            vl_iss_bi = 0;
            vl_cofins = 0;
            tot_impostos = 0;
            tot_liq = data.valor;
        }

        //* cria objeto para onergy_updatemany
        data2 = {
            cofins: +itemLei.MIMPlc_alcofins,
            pis: +itemLei.MIMPlc_alpis,
            csll: +itemLei.MIMPlc_alcsll,
            irrf: +itemLei.MIMPlc_alirrf,
            inss: +itemLei.MIMPlc_alinss,
            valor_cofins: +vl_cofins,
            valor_pis: +vl_pis,
            valor_csll: +vl_csll,
            valor_irrf: +vl_irrf,
            valor_inss: +vl_inss,
            valor_iss: +vl_iss,
            valor_iss_bi: +vl_iss_bi,
            iss: +itemLei.MIMPlei_complementar_aliquota_iss,
            iss_bi: +aliq_iss_bi,
            codLeiComplementar: itemLei.MIMPlc_cod || itemLei.lc_cod,
            descLeiComplementar: itemLei.MIMPlc_desc || itemLei.lc_desc,
            codServico: parseInt(data.codServico),
            descServico: itemLei.mun_issdesc,
            issRetido: data.ISSRetido,
            valor: +data.valor,
            chaveNfe: data.chaveNfe,
            numeroNf: data.numeroNf,
            ID_ONE_REF: data.idfk,
            cnpj: data.cnpj,
            razaoSocial: data.razaoSocial,
            cepom: data.cepom,
            simples_nacional: data.simples_nacional,
            anexo: data.anexos,
            MIMPcodServico_id: MIMPcodServico_id, //* codigo de servico
            MIMPmun_isscod__codServico: MIMPmun_isscod__codServico,
            MIMPmun_issdesc: MIMPmun_issdesc,
        };
        let jsonCtx = {
            UrlJsonContext: {
                cofins: data2.cofins,
                pispasep: data2.pis,
                csll: data2.csll,
                irrf: data2.irrf,
                inss: data2.inss,
                iss: data2.iss,
                iss_bitrib: data2.iss_bi,
                simples_nacional: data2.simples_nacional === true ? 'Optante' : 'Não Optante',
                sndata: data.sn,
                valor_cofins: data2.valor_cofins,
                valor_pispasep: data2.valor_pis,
                valor_csll: data2.valor_csll,
                valor_irrf: data2.valor_irrf,
                valor_inss: data2.valor_inss,
                valor_iss: data2.valor_iss,
                valor_iss_bitrib: data2.valor_iss_bi,
                tot_impostos: tot_impostos,
                tot_liq: tot_liq2,
                iss_devido: data.iss_devido,
                codigo_da_lei_complementar: data2.codLeiComplementar + '-' + data2.descLeiComplementar,
                anexos: arrAnexos,
                cadastro_no_cpom: data.cadastro_no_cpom,
                MIMPcodServico_id: MIMPcodServico_id, //* codigo de servico
                MIMPmun_isscod__codServico: MIMPmun_isscod__codServico,
                MIMPmun_issdesc: MIMPmun_issdesc,
            },
        };

        //* fdtCompartliharDoctosParaValidacaoDeDuplicados
        //* isMultiUpdate: true - atualiza todos os registros
        //* contendo doc_original: MonitDoc + ConsDet
        // onergy.log('JFS: onergy_updatemany: fdtCompartliharDoctosParaValidacaoDeDuplicados: jsonCtx: ' + JSON.stringify(jsonCtx.UrlJsonContext));
        await onergy_updatemany({
            fdtid: fdtCompartliharDoctosParaValidacaoDeDuplicados,
            assid: data.onergy_js_ctx.assid ? data.onergy_js_ctx.assid : data.assid,
            usrid: data.onergy_js_ctx.usrid ? data.onergy_js_ctx.usrid : data.usrid,
            data: JSON.stringify(jsonCtx),
            filter: JSON.stringify([{ FielName: 'doc_original', Type: 'string', FixedType: 'string', Value1: data.doc_original }]),
            isMultiUpdate: true,
        });
    } else {
        //* se nao houver itemLei, cria objeto para onergy_updatemany
        let jsonCtx = {
            erro_sim: true,
            anexos: arrAnexos,
            cadastro_no_cpom: data.cadastro_no_cpom,
            sndata: data.sn,
            iss_devido: data.iss_devido,
            simples_nacional: data.simples_nacional === true ? 'Optante' : 'Não Optante',
            codigo_da_lei_complementar: 'Código do Município não cadastrado, verifique a base de Impostos Municipais',
        };
        let postInfo = {
            UrlJsonContext: jsonCtx,
        };

        //* fdtCompartliharDoctosParaValidacaoDeDuplicados
        //* isMultiUpdate: true - atualiza todos os registros
        //* contendo doc_original: MonitDoc + ConsDet
        // onergy.log('JFS: onergy_updatemany: fdtCompartliharDoctosParaValidacaoDeDuplicados: postInfo: ' + JSON.stringify(postInfo.UrlJsonContext));
        await onergy_updatemany({
            fdtid: fdtCompartliharDoctosParaValidacaoDeDuplicados,
            assid: data.onergy_js_ctx.assid ? data.onergy_js_ctx.assid : data.assid,
            usrid: data.onergy_js_ctx.usrid ? data.onergy_js_ctx.usrid : data.usrid,
            data: JSON.stringify(postInfo),
            filter: JSON.stringify([{ FielName: 'doc_original', Type: 'string', FixedType: 'string', Value1: data.doc_original }]),
            isMultiUpdate: true,
        });
    }
    // onergy.log('JFS: endinitProcRetencao_ConsultarLeiComplementar');
    // return true;
    return SetObjectResponse(true, data, false);
}

function initBefore(json) {
    return true;
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
    doc_original: '9b99963f-3e5f-4a20-86fc-67d4e43acb63',
    idfk: '09d6b71e-4755-4116-98d4-2d3f96d92158',
    cnpj: '06990590000123',
    razaoSocial: 'GOOGLE BRASIL INTERNET LTDA.',
    valor: 610.33,
    valorNFe: 610.33,
    numeroNf: '18580268',
    chaveNfe: '07882930000165_20220803_18580268__06990590000123',
    codServico: '06298',
    munTomador: 3550308,
    munPrestador: 3550308,
    codIBGEMunicipioNota: 3550308,
    ISSRetido: false,
    prestadorCEP: 4538133,
    grpidResp: '',
    oneTemplateTitle: 'Consultar Lei Complementar',
    ass_id: 'a278fa91-cf28-4e29-8410-f2bf89a02d93',
    assid: 'a278fa91-cf28-4e29-8410-f2bf89a02d93',
    email: 'adm@mitre.com.br',
    fdtid: '60cc362c-fe45-4f2b-9cbc-7fb88deaeebe',
    fedid: '6ae7a8f8-4f92-4ac8-81e5-a89b45cf3af5',
    onergy_rolid: '',
    timezone: null,
    usrid: 'a08e0ca2-0ee3-4909-81f8-1e73c5ee9901',
    onergy_js_ctx: {
        assid: 'a278fa91-cf28-4e29-8410-f2bf89a02d93',
        fedid: '6ae7a8f8-4f92-4ac8-81e5-a89b45cf3af5',
        fdtid: '60cc362c-fe45-4f2b-9cbc-7fb88deaeebe',
        usrid: 'a08e0ca2-0ee3-4909-81f8-1e73c5ee9901',
        insertDt: '2022-08-24T12:53:49.16Z',
        updateDt: '2022-08-24T12:54:01.368Z',
        cur_userid: 'a08e0ca2-0ee3-4909-81f8-1e73c5ee9901',
        email: 'adm@mitre.com.br',
        user_name: 'ADM Mitre',
        onergy_rolid: '',
        praid: '01acf923-8ef8-4188-9f8f-4dde9de726e6',
        pcvid: '2ee9a653-fbd9-42fd-b237-81049f7dddf6',
        prcid: 'b1e7617c-b585-a4e8-c439-2a9d09d9dd5b',
        timezone: null,
        timezone_value: '-03:00',
        pubNubHook: null,
    },
    anexos: [
        {
            Name: 'Simples.html',
            UrlAzure:
                'https://api.onergy.com.br//api/storage/a278fa91-cf28-4e29-8410-f2bf89a02d93/3ac84f42-0200-49f0-9acb-89576859c1fc?ofname=133b6105036f43c9822b3f60befc8f0f_0_8LU.html',
            Url: 'https://api.onergy.com.br//api/storage/a278fa91-cf28-4e29-8410-f2bf89a02d93/3ac84f42-0200-49f0-9acb-89576859c1fc?ofname=133b6105036f43c9822b3f60befc8f0f_0_8LU.html',
        },
    ],
    simples_nacional: false,
    cadastro_no_cpom: 'Cadastrado no CEPOM',
};

init(JSON.stringify(json));
