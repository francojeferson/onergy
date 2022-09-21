let onergyCtx = mtdOnergy.JsEvtGetCurrentCtx();

let mainMethod = async () => {
    await blockFieldEdition();
    await limiteDiaPago();

    // Envia o submit do formulário
    mtdOnergy.JsEvtSubmitForm();
};

// Bloqueia a edição de campos que não podem ser editados pelo usuário
let blockFieldEdition = async () => {
    let registroSalvo = mtdOnergy.JsEvtGetItemValue('registro_salvo_');

    // Verifica se o registro não foi salvo e se não foi, bloqueia a edição 
    // dos campos através do registro_salvo_
    if (!registroSalvo || registroSalvo == 'nao') {
        mtdOnergy.JsEvtSetItemValue('registro_salvo_', 'sim');
    }
};

// Valida o limite de dia de pagamento
let limiteDiaPago = async () => {
    let diaPago = mtdOnergy.JsEvtGetItemValue('prcs__dia_de_pagamento');

    // Verifica se o dia de pagamento é maior que 31 e menor que 1 e se for, 
    // envia uma mensagem de erro e cancela o submit
    if (diaPago < 1 || diaPago > 31) {
        mtdOnergy.JsEvtShowMessage('error', 'Día de Pago inválido');
        mtdOnergy.JsEvtShowHideLoading(false);
        return false;
    }
    return true;
};

// Cria um filtro para o campo informado e retorna o filtro
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
