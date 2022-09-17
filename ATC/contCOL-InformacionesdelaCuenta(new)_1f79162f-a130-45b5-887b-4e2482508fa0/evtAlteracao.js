let onergyCtx = mtdOnergy.JsEvtGetCurrentCtx();

let mainMethod = async () => {
    debugger;
    let tipoContaID = '84ca5970-7a49-4192-a2c8-030031503a1a';
    let cms = mtdOnergy.JsEvtGetItemValue('TC_tipo_de_conta_valor');
    let objCms = await mtdOnergy.JsEvtGetFeedData({
        fdtID: tipoContaID,
        filter: gerarFiltro('TC_tipo_de_conta_valor', cms),
    });
    if (objCms.length > 0 && cms == objCms[0].urlJsonContext.TC_tipo_de_conta_valor) {
        if (onergyCtx.fedid != objCms[0].id) {
            mtdOnergy.JsEvtShowMessage('error', 'Asset Number ya informado');
            mtdOnergy.JsEvtShowHideLoading(false);
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
