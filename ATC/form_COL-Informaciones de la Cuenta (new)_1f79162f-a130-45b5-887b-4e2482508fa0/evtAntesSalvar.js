let mainMethod = async () => {
    await condSomenteLeitura();
    await limiteDiaPago();

    // Envia o submit do formulário
    mtdOnergy.JsEvtSubmitForm();
};

// Bloqueia a edição de campos que não podem ser editados pelo usuário
let condSomenteLeitura = async () => {
    let registroSalvo = mtdOnergy.JsEvtGetItemValue('registro_salvo_');

    // Se registro_salvo_ for igual a nao ou null, seta registro_salvo_ para sim e cfgCondicionais altera para somente leitura os campos que não podem ser editados pelo usuário
    if (!registroSalvo || registroSalvo == 'nao') {
        mtdOnergy.JsEvtSetItemValue('registro_salvo_', 'sim');
    }
};

// Valida o limite de dia de pagamento
let limiteDiaPago = async () => {
    let diaPago = mtdOnergy.JsEvtGetItemValue('prcs__dia_de_pagamento');

    // Verifica se o dia de pagamento é maior que 31 e menor que 1 e se for, envia uma mensagem de erro e cancela o submit
    if (diaPago < 1 || diaPago > 31) {
        mtdOnergy.JsEvtShowMessage('error', 'Día de Pago inválido');
        mtdOnergy.JsEvtShowHideLoading(false);
        return false;
    }
    return true;
};

mainMethod();
