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
        mtdOnergy.JsEvtSetItemValue('COLC_pode_apagar', 'sim');
    } else {
        mtdOnergy.JsEvtSetItemValue('COLC_pode_apagar', 'nao');
    }

    mtdOnergy.JsEvtSubmitForm();
};

let validarNit = async () => {
    let clientesID = '0694dd6e-299a-4b46-b8fd-5e08da24f72d';
    let nit = mtdOnergy.JsEvtGetItemValue('COLC_nit_cliente');
    let objNit = await mtdOnergy.JsEvtGetFeedData({
        fdtID: clientesID,
        filter: gerarFiltro('COLC_nit_cliente', nit),
    });

    if (objNit.length > 0 && nit == objNit[0].urlJsonContext.COLC_nit_cliente) {
        if (onergyCtx.fedid != objNit[0].id) {
            mtdOnergy.JsEvtShowMessage('error', 'NIT Cliente ya informado');
            mtdOnergy.JsEvtShowHideLoading(false);
            return false;
        }
    }
    return true;
};

let validarNomeCliente = async () => {
    let clientesID = '0694dd6e-299a-4b46-b8fd-5e08da24f72d';
    let nome = mtdOnergy.JsEvtGetItemValue('COLC_nome_cliente');
    let objNome = await mtdOnergy.JsEvtGetFeedData({
        fdtID: clientesID,
        filter: gerarFiltro('COLC_nome_cliente', nome),
    });

    if (objNome.length > 0 && nome == objNome[0].urlJsonContext.COLC_nome_cliente) {
        if (onergyCtx.fedid != objNome[0].id) {
            mtdOnergy.JsEvtShowMessage('error', 'Nombre Cliente ya informado');
            mtdOnergy.JsEvtShowHideLoading(false);
            return false;
        }
    }
    return true;
};

let validarCodigoCliente = async () => {
    let clientesID = '0694dd6e-299a-4b46-b8fd-5e08da24f72d';
    let cod = mtdOnergy.JsEvtGetItemValue('COLC_codigo_cliente');
    let objcod = await mtdOnergy.JsEvtGetFeedData({
        fdtID: clientesID,
        filter: gerarFiltro('COLC_codigo_cliente', cod),
    });

    if (objcod.length > 0 && cod == objcod[0].urlJsonContext.COLC_codigo_cliente) {
        if (onergyCtx.fedid != objcod[0].id) {
            mtdOnergy.JsEvtShowMessage('error', 'Código del Cliente ya informado');
            mtdOnergy.JsEvtShowHideLoading(false);
            return false;
        }
    }
    return true;
};

let naoApagarNit = async () => {
    let clientesID = '0694dd6e-299a-4b46-b8fd-5e08da24f72d';
    let nit = mtdOnergy.JsEvtGetItemValue('COLC_nit_cliente');
    let objNit = await mtdOnergy.JsEvtGetFeedData({
        fdtID: clientesID,
        filter: gerarFiltro('COLC_nit_cliente', nit),
    });

    if (objNit && objNit.length > 0) {
        let objRegNit = await objNit.filter((item) => item.urlJsonContext.COLCCOLC_nit_cliente == nit);

        if (objRegNit && objRegNit.length > 0) {
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
