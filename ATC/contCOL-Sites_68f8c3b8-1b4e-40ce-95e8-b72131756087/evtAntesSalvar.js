var onergyCtx = mtdOnergy.JsEvtGetCurrentCtx();
var urlPost = `${mtdOnergy.GetBaseOnergyUrl()}Analytics/SaveDataByTemplateRule`;

let mainMethod = async () => {
    await atualizarClientesSitio();
    await atualizaInformacoesConta();
    await atualizarInformacoesTecnicas();

    debugger;
    let cms = mtdOnergy.JsEvtGetItemValue('asset_number');
    let objCms = await mtdOnergy.JsEvtGetFeedData({
        fdtID: 'e43b9fe0-6752-446d-8495-0b4fdd7a70b4',
        filter: gerarFiltro('asset_number', cms),
    });
    if (objCms.length > 0 && cms == objCms[0].urlJsonContext.asset_number) {
        if (onergyCtx.fedid != objCms[0].id) {
            mtdOnergy.JsEvtShowMessage('error', 'Asset Number ya informado');
            mtdOnergy.JsEvtShowHideLoading(false);
            return;
        }
    }
    mtdOnergy.JsEvtSubmitForm();
};

let atualizarClientesSitio = async () => {
    let clientesSitioID = '30da777d-952c-4a5a-9c18-128b69e55893';
    let clientes = await mtdOnergy.JsEvtGetFeedData({
        fdtID: clientesSitioID,
        filter: gerarFiltro('ID_ONE_REF', onergyCtx.fedid),
    });
    if (clientes.length > 0) {
        let postInfo = {
            tppf_tipo_portifolio: mtdOnergy.JsEvtGetItemValue('tppf_tipo_portifolio'),
            asset_number: mtdOnergy.JsEvtGetItemValue('asset_number'),
            profit_cost_center: mtdOnergy.JsEvtGetItemValue('profit_cost_center'),
            site_name: mtdOnergy.JsEvtGetItemValue('site_name'),
            emp_atc_site: mtdOnergy.JsEvtGetItemValue('emp_atc_site'),
            loca_cida_municipio: mtdOnergy.JsEvtGetItemValue('loca_cida_municipio'),
            loca_cida_loca_uf_uf: mtdOnergy.JsEvtGetItemValue('loca_cida_loca_uf_uf'),
            regio_regional: mtdOnergy.JsEvtGetItemValue('regio_regional'),
        };
        for (let CLIENTE of clientes) {
            let postData = {
                jsondata: JSON.stringify(postInfo),
                usrid: onergyCtx.usrid,
                assid: onergyCtx.assid,
                fdtid: clientesSitioID,
                id: CLIENTE.id,
            };
            await mtdOnergy.JsEvtAjaxCallData(urlPost, postData, 'post', false);
        }
    }
};

let atualizaInformacoesConta = async () => {
    let informacoesContaID = '1e6d6595-083f-4bb8-b82c-e9054e9dc8f3';
    let contas = await mtdOnergy.JsEvtGetFeedData({
        fdtID: informacoesContaID,
        filter: gerarFiltro('ID_ONE_REF', onergyCtx.fedid),
    });
    if (contas.length > 0) {
        let postInfo = {
            asset_number: mtdOnergy.JsEvtGetItemValue('asset_number'),
            site_name: mtdOnergy.JsEvtGetItemValue('site_name'),
            emp_atc_site: mtdOnergy.JsEvtGetItemValue('emp_atc_site'),
        };

        for (let CONTA of contas) {
            let postData = {
                jsondata: JSON.stringify(postInfo),
                usrid: onergyCtx.usrid,
                assid: onergyCtx.assid,
                fdtid: informacoesContaID,
                id: CONTA.id,
            };
            await mtdOnergy.JsEvtAjaxCallData(urlPost, postData, 'post', false);
        }
    }
};

let atualizarInformacoesTecnicas = async () => {
    let informacoesTecnicasID = '5ea06f19-d11a-4d61-b4ff-c74610e933cd';
    let informacoesTecnicas = await mtdOnergy.JsEvtGetFeedData({
        fdtID: informacoesTecnicasID,
        filter: gerarFiltro('ID_ONE_REF', onergyCtx.fedid),
    });
    if (informacoesTecnicas.length > 0) {
        let postInfo = {
            asset_number: mtdOnergy.JsEvtGetItemValue('asset_number'),
            site_name: mtdOnergy.JsEvtGetItemValue('site_name'),
            logradouro: mtdOnergy.JsEvtGetItemValue('logradouro'),
            loca_cida_municipio: mtdOnergy.JsEvtGetItemValue('loca_cida_municipio'),
            loca_cida_loca_uf_uf: mtdOnergy.JsEvtGetItemValue('loca_cida_loca_uf_uf'),
            sta_site_status: mtdOnergy.JsEvtGetItemValue('sta_site_status'),
            emp_atc_site: mtdOnergy.JsEvtGetItemValue('emp_atc_site'),
        };
        for (let INFORMACAO of informacoesTecnicas) {
            let postData = {
                jsondata: JSON.stringify(postInfo),
                usrid: onergyCtx.usrid,
                assid: onergyCtx.assid,
                fdtid: informacoesTecnicasID,
                id: INFORMACAO.id,
            };
            await mtdOnergy.JsEvtAjaxCallData(urlPost, postData, 'post', false);
        }
    }
};

const gerarFiltro = (fielNameP, valueP) => {
    return JSON.stringify([
        {
            FielName: fielNameP,
            Type: `${typeof valueP == 'number' ? 'Numeric' : 'string'}`,
            FixedType: `${typeof valueP == 'number' ? 'Numeric' : 'string'}`,
            Value1: valueP,
        },
    ]);
};

mainMethod();
