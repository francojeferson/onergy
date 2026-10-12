// eslint-disable-next-line no-unused-vars
const idSites = '68f8c3b8-1b4e-40ce-95e8-b72131756087';
const idSitios = 'e43b9fe0-6752-446d-8495-0b4fdd7a70b4';
const idClientesdelSitio = '30da777d-952c-4a5a-9c18-128b69e55893';
const idInformacionesdelaCuenta = '1e6d6595-083f-4bb8-b82c-e9054e9dc8f3';
const idInformacionesTecnicas = '5ea06f19-d11a-4d61-b4ff-c74610e933cd';

// eslint-disable-next-line no-undef
let onergyCtx = mtdOnergy.JsEvtGetCurrentCtx();
// eslint-disable-next-line no-undef
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
        // eslint-disable-next-line no-undef
        mtdOnergy.JsEvtSetItemValue('pode_apagar', 'nao');
    } else {
        // eslint-disable-next-line no-undef
        mtdOnergy.JsEvtSetItemValue('pode_apagar', 'sim');
    }

    // Envia o submit do formulário
    // eslint-disable-next-line no-undef
    mtdOnergy.JsEvtSubmitForm();
};

// Bloqueia a edição de campos que não podem ser editados pelo usuário
let blockFieldEdition = async () => {
    // eslint-disable-next-line no-undef
    let registroSalvo = mtdOnergy.JsEvtGetItemValue('registro_salvo');

    // Verifica se o registro não foi salvo e se não foi, bloqueia a edição
    // dos campos através do registro_salvo_
    if (!registroSalvo || registroSalvo == 'nao') {
        // eslint-disable-next-line no-undef
        mtdOnergy.JsEvtSetItemValue('registro_salvo', 'sim');
    }
};

// Valida se o asset_number já foi informado
let validarAssetNumber = async () => {
    // eslint-disable-next-line no-undef
    let cms = mtdOnergy.JsEvtGetItemValue('asset_number');
    // eslint-disable-next-line no-undef
    let objCms = await mtdOnergy.JsEvtGetFeedData({
        fdtID: idSitios,
        filter: gerarFiltro('asset_number', cms),
    });

    // Se o asset_number já foi informado, exibe uma mensagem de erro
    if (objCms.length > 0 && cms == objCms[0].urlJsonContext.asset_number) {
        if (onergyCtx.fedid != objCms[0].id) {
            // eslint-disable-next-line no-undef
            mtdOnergy.JsEvtShowMessage('error', 'Asset Number ya informado');
            // eslint-disable-next-line no-undef
            mtdOnergy.JsEvtShowHideLoading(false);
            return false;
        }
    }
    return true;
};

// Valida se o site_name já foi informado
let validarSiteName = async () => {
    // eslint-disable-next-line no-undef
    let cms = mtdOnergy.JsEvtGetItemValue('site_name');
    // eslint-disable-next-line no-undef
    let objCms = await mtdOnergy.JsEvtGetFeedData({
        fdtID: idSitios,
        filter: gerarFiltro('site_name', cms),
    });

    // Se o site_name já foi informado, exibe uma mensagem de erro
    if (objCms.length > 0 && cms == objCms[0].urlJsonContext.site_name) {
        if (onergyCtx.fedid != objCms[0].id) {
            // eslint-disable-next-line no-undef
            mtdOnergy.JsEvtShowMessage('error', 'Nombre del Sitio ya informado');
            // eslint-disable-next-line no-undef
            mtdOnergy.JsEvtShowHideLoading(false);
            return false;
        }
    }
    return true;
};

// Atualiza os registros do subgrid Clientes del Sitio
let atualizarClientesSitio = async () => {
    // eslint-disable-next-line no-undef
    let clientes = await mtdOnergy.JsEvtGetFeedData({
        fdtID: idClientesdelSitio,
        filter: gerarFiltro('ID_ONE_REF', onergyCtx.fedid),
    });

    // Se houver registros no subgrid, atualiza os registros
    if (clientes.length > 0) {
        let postInfo = {
            // eslint-disable-next-line no-undef
            tppf_tipo_portifolio: mtdOnergy.JsEvtGetItemValue('tppf_tipo_portifolio'),
            // eslint-disable-next-line no-undef
            asset_number: mtdOnergy.JsEvtGetItemValue('asset_number'),
            // eslint-disable-next-line no-undef
            profit_cost_center: mtdOnergy.JsEvtGetItemValue('profit_cost_center'),
            // eslint-disable-next-line no-undef
            site_name: mtdOnergy.JsEvtGetItemValue('site_name'),
            // eslint-disable-next-line no-undef
            emp_atc_site: mtdOnergy.JsEvtGetItemValue('emp_atc_site'),
            // eslint-disable-next-line no-undef
            loca_cida_municipio: mtdOnergy.JsEvtGetItemValue('loca_cida_municipio'),
            // eslint-disable-next-line no-undef
            loca_cida_loca_uf_uf: mtdOnergy.JsEvtGetItemValue('loca_cida_loca_uf_uf'),
            // eslint-disable-next-line no-undef
            regio_regional: mtdOnergy.JsEvtGetItemValue('regio_regional'),
        };

        // Para cada registro, atualiza os campos
        for (let CLIENTE of clientes) {
            let postData = {
                jsondata: JSON.stringify(postInfo),
                usrid: onergyCtx.usrid,
                assid: onergyCtx.assid,
                fdtid: idClientesdelSitio,
                id: CLIENTE.id,
            };
            // eslint-disable-next-line no-undef
            await mtdOnergy.JsEvtAjaxCallData(urlPost, postData, 'post', false);
        }
        return true;
    }
    return false;
};

// Atualiza os registros do subgrid Informaciones de la Cuenta
let atualizaInformacoesConta = async () => {
    // eslint-disable-next-line no-undef
    let contas = await mtdOnergy.JsEvtGetFeedData({
        fdtID: idInformacionesdelaCuenta,
        filter: gerarFiltro('ID_ONE_REF', onergyCtx.fedid),
    });

    // Se houver registros no subgrid, atualiza os registros
    if (contas.length > 0) {
        let postInfo = {
            // eslint-disable-next-line no-undef
            asset_number: mtdOnergy.JsEvtGetItemValue('asset_number'),
            // eslint-disable-next-line no-undef
            site_name: mtdOnergy.JsEvtGetItemValue('site_name'),
            // eslint-disable-next-line no-undef
            emp_atc_site: mtdOnergy.JsEvtGetItemValue('emp_atc_site'),
        };

        // Para cada registro, atualiza os campos
        for (let CONTA of contas) {
            let postData = {
                jsondata: JSON.stringify(postInfo),
                usrid: onergyCtx.usrid,
                assid: onergyCtx.assid,
                fdtid: idInformacionesdelaCuenta,
                id: CONTA.id,
            };
            // eslint-disable-next-line no-undef
            await mtdOnergy.JsEvtAjaxCallData(urlPost, postData, 'post', false);
        }
        return true;
    }
    return false;
};

// Atualiza os registros do subgrid Informaciones Tecnicas
let atualizarInformacoesTecnicas = async () => {
    // eslint-disable-next-line no-undef
    let informacoesTecnicas = await mtdOnergy.JsEvtGetFeedData({
        fdtID: idInformacionesTecnicas,
        filter: gerarFiltro('ID_ONE_REF', onergyCtx.fedid),
    });

    // Se houver registros no subgrid, atualiza os registros
    if (informacoesTecnicas.length > 0) {
        let postInfo = {
            // eslint-disable-next-line no-undef
            asset_number: mtdOnergy.JsEvtGetItemValue('asset_number'),
            // eslint-disable-next-line no-undef
            site_name: mtdOnergy.JsEvtGetItemValue('site_name'),
            // eslint-disable-next-line no-undef
            logradouro: mtdOnergy.JsEvtGetItemValue('logradouro'),
            // eslint-disable-next-line no-undef
            loca_cida_municipio: mtdOnergy.JsEvtGetItemValue('loca_cida_municipio'),
            // eslint-disable-next-line no-undef
            loca_cida_loca_uf_uf: mtdOnergy.JsEvtGetItemValue('loca_cida_loca_uf_uf'),
            // eslint-disable-next-line no-undef
            sta_site_status: mtdOnergy.JsEvtGetItemValue('sta_site_status'),
            // eslint-disable-next-line no-undef
            emp_atc_site: mtdOnergy.JsEvtGetItemValue('emp_atc_site'),
        };

        // Para cada registro, atualiza os campos
        for (let INFORMACAO of informacoesTecnicas) {
            let postData = {
                jsondata: JSON.stringify(postInfo),
                usrid: onergyCtx.usrid,
                assid: onergyCtx.assid,
                fdtid: idInformacionesTecnicas,
                id: INFORMACAO.id,
            };
            // eslint-disable-next-line no-undef
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
