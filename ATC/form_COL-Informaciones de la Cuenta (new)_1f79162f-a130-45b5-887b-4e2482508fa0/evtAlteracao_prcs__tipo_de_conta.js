let mainMethod = async () => {
    await validarTipoConta();
};

// Valida o tipo de conta e seta o valor do campo asset_number
let validarTipoConta = async () => {
    let tipoConta = mtdOnergy.JsEvtGetItemValue('TCprcs__tipo_de_conta_id');
    let tipoContaCache = mtdOnergy.JsEvtGetItemValue('prcs__tipo_de_conta_cache');

    // Verifica se o tipo de conta foi alterado e se foi, atualiza o cache
    if (tipoConta != tipoContaCache) {
        let tipoContaValue = mtdOnergy.JsEvtGetItemValue('TCTC_tipo_de_conta__TC_tipo_de_conta_valor');
        mtdOnergy.JsEvtSetItemValue('prcs__tipo_de_conta_cache', tipoConta, null, null, true);

        // Verifica se o tipo de conta é P (Padre) e se for, limpa o campo asset_number, caso contrário, seta o valor do campo asset_number_cache no campo asset_number
        if (tipoContaValue == 'P') {
            mtdOnergy.JsEvtSetItemValue('asset_number_IDC', '');
        } else {
            let assetNumber = mtdOnergy.JsEvtGetItemValue('asset_number');
            mtdOnergy.JsEvtSetItemValue('asset_number_IDC', assetNumber);
        }
    }
};

mainMethod();
