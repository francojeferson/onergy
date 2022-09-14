let mainMethod = async () => {
    await atualizarClientesSitio();

    // debugger;
    /*
    let cms = mtdOnergy.JsEvtGetItemValue("asset_number");
    let objCms = await mtdOnergy.JsEvtGetFeedData({
        fdtID: "e43b9fe0-6752-446d-8495-0b4fdd7a70b4",
        filter: JSON.stringify([
            { FielName: "asset_number", Type: "string", FixedType: "string", Value1: cms }
        ])
    });
    if (objCms.length > 0 && cms == objCms[0].urlJsonContext.asset_number) {
        mtdOnergy.JsEvtShowMessage('error', "Asset Number ya informado");
        mtdOnergy.JsEvtShowHideLoading(false);
    } else {
        mtdOnergy.JsEvtSubmitForm();
    }
    */
    mtdOnergy.JsEvtSubmitForm();
};

let atualizarClientesSitio = async () => {
    debugger;
    let clientesSitioID = '30da777d-952c-4a5a-9c18-128b69e55893';
    let onergyCtx = mtdOnergy.JsEvtGetCurrentCtx();
    let urlPost = `${mtdOnergy.GetBaseOnergyUrl()}Analytics/SaveDataByTemplateRule`;

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
