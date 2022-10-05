let onergyCtx = mtdOnergy.JsEvtGetCurrentCtx();

let mainMethod = async () => {
    if (!(await validarPort())) {
        return;
    }

    mtdOnergy.JsEvtSubmitForm();
};

let validarPort = async () => {
    let portID = 'b36cf260-c691-4d36-9339-137041e6fb63';
    let port = mtdOnergy.JsEvtGetItemValue('PCS_portafolio_cliente');
    let objPort = await mtdOnergy.JsEvtGetFeedData({
        fdtID: portID,
        filter: gerarFiltro('PCS_portafolio_cliente', port),
    });

    if (objPort.length > 0 && port == objPort[0].urlJsonContext.PCS_portafolio_cliente) {
        if (onergyCtx.fedid != objPort[0].id) {
            mtdOnergy.JsEvtShowMessage('error', 'Portafolio Cliente ya informado');
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
