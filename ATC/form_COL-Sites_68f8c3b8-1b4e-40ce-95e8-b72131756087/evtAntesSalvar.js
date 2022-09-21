let onergyCtx = mtdOnergy.JsEvtGetCurrentCtx();
let urlPost = `${mtdOnergy.GetBaseOnergyUrl()}Analytics/SaveDataByTemplateRule`;

let mainMethod = async () => {
    // Se asset_number ou site_name retornar false, não salva o registro
    if (!(await validarAssetNumber())) {
        return;
    }
    if (!(await validarSiteName())) {
        return;
    }

    await blockFieldEdition();

    let resultClienteSitio = await atualizarClientesSitio();
    let resultInformacoesConta = await atualizaInformacoesConta();
    let resultInformacoesTecnicas = await atualizarInformacoesTecnicas();

    // Se houver registro em qualquer dos subgrids, pode_apagar impede que o 
    // registro seja apagado, caso contrário, permite apagar
    if (resultClienteSitio || resultInformacoesConta || resultInformacoesTecnicas) {
        mtdOnergy.JsEvtSetItemValue('pode_apagar', 'nao');
    } else {
        mtdOnergy.JsEvtSetItemValue('pode_apagar', 'sim');
    }

    // Envia o submit do formulário
    mtdOnergy.JsEvtSubmitForm();
};

// Bloqueia a edição de campos que não podem ser editados pelo usuário
let blockFieldEdition = async () => {
    let registroSalvo = mtdOnergy.JsEvtGetItemValue('registro_salvo');

    // Verifica se o registro não foi salvo e se não foi, bloqueia a edição 
    // dos campos através do registro_salvo_
    if (!registroSalvo || registroSalvo == 'nao') {
        mtdOnergy.JsEvtSetItemValue('registro_salvo', 'sim');
    }
};

// Valida se o asset_number já foi informado
let validarAssetNumber = async () => {
    let sitiosID = 'e43b9fe0-6752-446d-8495-0b4fdd7a70b4';
    let cms = mtdOnergy.JsEvtGetItemValue('asset_number');
    let objCms = await mtdOnergy.JsEvtGetFeedData({
        fdtID: sitiosID,
        filter: gerarFiltro('asset_number', cms),
    });

    // Se o asset_number já foi informado, exibe uma mensagem de erro
    if (objCms.length > 0 && cms == objCms[0].urlJsonContext.asset_number) {
        if (onergyCtx.fedid != objCms[0].id) {
            mtdOnergy.JsEvtShowMessage('error', 'Asset Number ya informado');
            mtdOnergy.JsEvtShowHideLoading(false);
            return false;
        }
    }
    return true;
};

// Valida se o site_name já foi informado
let validarSiteName = async () => {
    let sitiosID = 'e43b9fe0-6752-446d-8495-0b4fdd7a70b4';
    let cms = mtdOnergy.JsEvtGetItemValue('site_name');
    let objCms = await mtdOnergy.JsEvtGetFeedData({
        fdtID: sitiosID,
        filter: gerarFiltro('site_name', cms),
    });

    // Se o site_name já foi informado, exibe uma mensagem de erro
    if (objCms.length > 0 && cms == objCms[0].urlJsonContext.site_name) {
        if (onergyCtx.fedid != objCms[0].id) {
            mtdOnergy.JsEvtShowMessage('error', 'Nombre del Sitio ya informado');
            mtdOnergy.JsEvtShowHideLoading(false);
            return false;
        }
    }
    return true;
};

// Atualiza os registros do subgrid Clientes del Sitio
let atualizarClientesSitio = async () => {
    let clientesSitioID = '30da777d-952c-4a5a-9c18-128b69e55893';
    let clientes = await mtdOnergy.JsEvtGetFeedData({
        fdtID: clientesSitioID,
        filter: gerarFiltro('ID_ONE_REF', onergyCtx.fedid),
    });

    // Se houver registros no subgrid, atualiza os registros
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

        // Para cada registro, atualiza os campos
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
        return true;
    }
    return false;
};

// Atualiza os registros do subgrid Informaciones de la Cuenta
let atualizaInformacoesConta = async () => {
    let informacoesContaID = '1e6d6595-083f-4bb8-b82c-e9054e9dc8f3';
    let contas = await mtdOnergy.JsEvtGetFeedData({
        fdtID: informacoesContaID,
        filter: gerarFiltro('ID_ONE_REF', onergyCtx.fedid),
    });

    // Se houver registros no subgrid, atualiza os registros
    if (contas.length > 0) {
        let postInfo = {
            asset_number: mtdOnergy.JsEvtGetItemValue('asset_number'),
            site_name: mtdOnergy.JsEvtGetItemValue('site_name'),
            emp_atc_site: mtdOnergy.JsEvtGetItemValue('emp_atc_site'),
        };

        // Para cada registro, atualiza os campos
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
        return true;
    }
    return false;
};

// Atualiza os registros do subgrid Informaciones Tecnicas
let atualizarInformacoesTecnicas = async () => {
    let informacoesTecnicasID = '5ea06f19-d11a-4d61-b4ff-c74610e933cd';
    let informacoesTecnicas = await mtdOnergy.JsEvtGetFeedData({
        fdtID: informacoesTecnicasID,
        filter: gerarFiltro('ID_ONE_REF', onergyCtx.fedid),
    });

    // Se houver registros no subgrid, atualiza os registros
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

        // Para cada registro, atualiza os campos
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
        return true;
    }
    return false;
};

// Cria um filtro para o campo informado e retorna o filtro
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
