// eslint-disable-next-line no-unused-vars
const idInformacionesdelaCuenta = '1f79162f-a130-45b5-887b-4e2482508fa0';

let mainMethod = async () => {
    await aplicarTipoConta();
};

// Aplica o tipo de conta e seta o valor do campo asset_number
let aplicarTipoConta = async () => {
    // eslint-disable-next-line no-undef
    let tipoContaValue = mtdOnergy.JsEvtGetItemValue('TCprcs__tipo_de_conta_id');

    // Se não houver valor no campo tipo de conta, busca asset_number e seta no campo asset_number_IDC
    if (!tipoContaValue) {
        // eslint-disable-next-line no-undef
        let assetNumber = mtdOnergy.JsEvtGetItemValue('asset_number');
        // eslint-disable-next-line no-undef
        mtdOnergy.JsEvtSetItemValue('asset_number_IDC', assetNumber);
    }
};

mainMethod();
