let onergyCtx = mtdOnergy.JsEvtGetCurrentCtx();

let mainMethod = async () => {
    await validarTipoConta();
    await validarDiaPago();
};

let validarDiaPago = async () => {
    let diaPago = mtdOnergy.JsEvtGetItemValue('prcs__dia_de_pagamento');
    // se diaPago for diferente de entre 1 e 31, mostrar mensagem de erro
    if (diaPago < 1 || diaPago > 31) {
        mtdOnergy.JsEvtShowMessage('error', 'Día de Pago inválido');
        mtdOnergy.JsEvtShowHideLoading(false);
        return false;
    }
    return true;
};

let validarTipoConta = async () => {
    let tipoConta = mtdOnergy.JsEvtGetItemValue('TCprcs__tipo_de_conta_id');
    let tipoContaCache = mtdOnergy.JsEvtGetItemValue('prcs__tipo_de_conta_cache');
    if (tipoConta != tipoContaCache) {
        let tipoContaValue = mtdOnergy.JsEvtGetItemValue('TCTC_tipo_de_conta__TC_tipo_de_conta_valor');
        mtdOnergy.JsEvtSetItemValue('prcs__tipo_de_conta_cache', tipoConta);

        if (tipoContaValue == 'P') {
            let assetNumber = mtdOnergy.JsEvtGetItemValue('asset_number');
            mtdOnergy.JsEvtSetItemValue('asset_number_cache', assetNumber);
            mtdOnergy.JsEvtSetItemValue('asset_number', '');
        } else {
            let assetNumberCache = mtdOnergy.JsEvtGetItemValue('asset_number_cache');
            if (assetNumberCache) {
                mtdOnergy.JsEvtSetItemValue('asset_number', assetNumberCache);
            }
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
