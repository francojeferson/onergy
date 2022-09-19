let onergyCtx = mtdOnergy.JsEvtGetCurrentCtx();

let mainMethod = async () => {
    debugger;
    let cms = mtdOnergy.JsEvtGetItemValue('asset_number');
    mtdOnergy.JsEvtSetItemValue('asset_number_cache', cms);
    let tipoConta = mtdOnergy.JsEvtGetItemValue('TCTC_tipo_de_conta__TC_tipo_de_conta_valor');
    if (tipoConta == 'P') {
        mtdOnergy.JsEvtSetItemValue('asset_number', '');
    } else {
        let cms_cache = mtdOnergy.JsEvtGetItemValue('asset_number_cache');
        mtdOnergy.JsEvtSetItemValue('asset_number', cms_cache);
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
