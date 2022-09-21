let mainMethod = async () => {
    await aplicarTipoConta();
};

// Aplica o tipo de conta e seta o valor do campo asset_number
let aplicarTipoConta = async () => {
    let tipoContaValue = mtdOnergy.JsEvtGetItemValue('TCprcs__tipo_de_conta_id');

    // Se não houver valor no campo tipo de conta, busca asset_number e seta no campo asset_number_IDC
    if (!tipoContaValue) {
        let assetNumber = mtdOnergy.JsEvtGetItemValue('asset_number');
        mtdOnergy.JsEvtSetItemValue('asset_number_IDC', assetNumber);
    }
};

mainMethod();
