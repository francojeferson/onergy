const idClientes = '0694dd6e-299a-4b46-b8fd-5e08da24f72d';

// eslint-disable-next-line no-undef
let onergyCtx = mtdOnergy.JsEvtGetCurrentCtx();

let mainMethod = async () => {
    if (!(await validarNit())) {
        return;
    }

    if (!(await validarNomeCliente())) {
        return;
    }

    if (!(await validarCodigoCliente())) {
        return;
    }

    let resultNaoApagarNit = await naoApagarNit();

    if (resultNaoApagarNit) {
        // eslint-disable-next-line no-undef
        mtdOnergy.JsEvtSetItemValue('COLC_pode_apagar', 'sim');
    } else {
        // eslint-disable-next-line no-undef
        mtdOnergy.JsEvtSetItemValue('COLC_pode_apagar', 'nao');
    }

    // eslint-disable-next-line no-undef
    mtdOnergy.JsEvtSubmitForm();
};

let validarNit = async () => {
    // eslint-disable-next-line no-undef
    let nit = mtdOnergy.JsEvtGetItemValue('COLC_nit_cliente');
    // eslint-disable-next-line no-undef
    let objNit = await mtdOnergy.JsEvtGetFeedData({
        fdtID: idClientes,
        filter: gerarFiltro('COLC_nit_cliente', nit),
    });

    if (objNit.length > 0 && nit == objNit[0].urlJsonContext.COLC_nit_cliente) {
        if (onergyCtx.fedid != objNit[0].id) {
            // eslint-disable-next-line no-undef
            mtdOnergy.JsEvtShowMessage('error', 'NIT Cliente ya informado');
            // eslint-disable-next-line no-undef
            mtdOnergy.JsEvtShowHideLoading(false);
            return false;
        }
    }
    return true;
};

let validarNomeCliente = async () => {
    // eslint-disable-next-line no-undef
    let nome = mtdOnergy.JsEvtGetItemValue('COLC_nome_cliente');
    // eslint-disable-next-line no-undef
    let objNome = await mtdOnergy.JsEvtGetFeedData({
        fdtID: idClientes,
        filter: gerarFiltro('COLC_nome_cliente', nome),
    });

    if (objNome.length > 0 && nome == objNome[0].urlJsonContext.COLC_nome_cliente) {
        if (onergyCtx.fedid != objNome[0].id) {
            // eslint-disable-next-line no-undef
            mtdOnergy.JsEvtShowMessage('error', 'Nombre Cliente ya informado');
            // eslint-disable-next-line no-undef
            mtdOnergy.JsEvtShowHideLoading(false);
            return false;
        }
    }
    return true;
};

let validarCodigoCliente = async () => {
    // eslint-disable-next-line no-undef
    let cod = mtdOnergy.JsEvtGetItemValue('COLC_codigo_cliente');
    // eslint-disable-next-line no-undef
    let objcod = await mtdOnergy.JsEvtGetFeedData({
        fdtID: idClientes,
        filter: gerarFiltro('COLC_codigo_cliente', cod),
    });

    if (objcod.length > 0 && cod == objcod[0].urlJsonContext.COLC_codigo_cliente) {
        if (onergyCtx.fedid != objcod[0].id) {
            // eslint-disable-next-line no-undef
            mtdOnergy.JsEvtShowMessage('error', 'Código del Cliente ya informado');
            // eslint-disable-next-line no-undef
            mtdOnergy.JsEvtShowHideLoading(false);
            return false;
        }
    }
    return true;
};

let naoApagarNit = async () => {
    // eslint-disable-next-line no-undef
    let nit = mtdOnergy.JsEvtGetItemValue('COLC_nit_cliente');
    // eslint-disable-next-line no-undef
    let objNit = await mtdOnergy.JsEvtGetFeedData({
        fdtID: idClientes,
        filter: gerarFiltro('COLC_nit_cliente', nit),
    });

    if (objNit && objNit.length > 0) {
        let objRegNit = await objNit.filter((item) => item.urlJsonContext.COLCCOLC_nit_cliente == nit);

        if (objRegNit && objRegNit.length > 0) {
            // eslint-disable-next-line no-undef
            mtdOnergy.JsEvtShowHideLoading(false);
            return false;
        }
    }
    return true;
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
