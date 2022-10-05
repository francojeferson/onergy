let onergyCtx = mtdOnergy.JsEvtGetCurrentCtx();

let mainMethod = async () => {
    if (!(await validarCodigoSitioCliente())) {
        return;
    }

    mtdOnergy.JsEvtSubmitForm();
};

let validarCodigoSitioCliente = async () => {
    let clienteSitioID = 'a727ac73-7e04-46a3-adb1-1fb06cdfbb34';
    let cliente = mtdOnergy.JsEvtGetItemValue('clsit__codigo_do_sitio_do_cliente');
    let objCliente = await mtdOnergy.JsEvtGetFeedData({
        fdtID: clienteSitioID,
        filter: gerarFiltro('clsit__codigo_do_sitio_do_cliente', cliente),
    });

    if (objCliente.length > 0 && cliente == objCliente[0].urlJsonContext.clsit__codigo_do_sitio_do_cliente) {
        if (onergyCtx.fedid != objCliente[0].id) {
            mtdOnergy.JsEvtShowMessage('error', 'Codigo del Sitio de Cliente ya informado');
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
