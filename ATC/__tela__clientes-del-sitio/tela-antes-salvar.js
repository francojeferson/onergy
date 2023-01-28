const idClientesdelSitio = 'a727ac73-7e04-46a3-adb1-1fb06cdfbb34';

// eslint-disable-next-line no-undef
let onergyCtx = mtdOnergy.JsEvtGetCurrentCtx();

let mainMethod = async () => {
    if (!(await validarCodigoSitioCliente())) {
        return;
    }

    // eslint-disable-next-line no-undef
    mtdOnergy.JsEvtSubmitForm();
};

let validarCodigoSitioCliente = async () => {
    // eslint-disable-next-line no-undef
    let cliente = mtdOnergy.JsEvtGetItemValue('clsit__codigo_do_sitio_do_cliente');
    // eslint-disable-next-line no-undef
    let objCliente = await mtdOnergy.JsEvtGetFeedData({
        fdtID: idClientesdelSitio,
        filter: gerarFiltro('clsit__codigo_do_sitio_do_cliente', cliente),
    });

    if (objCliente.length > 0 && cliente == objCliente[0].urlJsonContext.clsit__codigo_do_sitio_do_cliente) {
        if (onergyCtx.fedid != objCliente[0].id) {
            // eslint-disable-next-line no-undef
            mtdOnergy.JsEvtShowMessage('error', 'Codigo del Sitio de Cliente ya informado');
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
