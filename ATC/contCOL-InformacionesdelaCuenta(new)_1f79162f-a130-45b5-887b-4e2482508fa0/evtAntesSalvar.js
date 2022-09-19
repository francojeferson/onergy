let onergyCtx = mtdOnergy.JsEvtGetCurrentCtx();

let mainMethod = async () => {
    await blockFieldEdition();
    await validarDiaPago();

    mtdOnergy.JsEvtSubmitForm();
};

let blockFieldEdition = async () => {
    // bloqueia a edição de outros campos
    let registroSalvo = mtdOnergy.JsEvtGetItemValue('registro_salvo');
    if (!registroSalvo || registroSalvo == 'nao') {
        mtdOnergy.JsEvtSetItemValue('registro_salvo', 'sim');
    }
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

const gerarFiltro = (fielNameP, valueP) => {
    // retorna um filtro para ser usado em uma consulta
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
