let mainMethod = async () => {
    await validarContaInternaNIC();
};

// Valida Cuenta Interna NIC
let validarContaInternaNIC = async () => {
    let contaInternaNIC = mtdOnergy.JsEvtGetItemValue('conta_interna_nic');

    // Verifica se Cuenta Interna NIC foi informado e se foi, busca Tipo de Cuenta
    if (contaInternaNIC) {
        await validarContaPai();
    }
};

// Valida o tipo de conta e seta o valor do campo prcs__conta_pai
let validarContaPai = async () => {
    let tipoContaValue = mtdOnergy.JsEvtGetItemValue('TCTC_tipo_de_conta__TC_tipo_de_conta_valor');

    // Verifica se Tipo de Cuenta foi informado e se foi, valida Cuenta Interna NIC
    if (tipoContaValue) {
        // Verifica se Tipo de Cuenta é I (Individual) e se for, prcs__conta_pai deve receber NO
        if (tipoContaValue == 'I') {
            mtdOnergy.JsEvtSetItemValue('prcs__conta_pai', 'NO');
            return true;
        }

        // Verifica se Tipo de Cuenta é P (Padre) ou HH (Hija Hibrida) e se for, seta Cuenta Interna NIC em campo prcs__conta_pai
        else if (tipoContaValue == 'P' || tipoContaValue == 'HH') {
            mtdOnergy.JsEvtSetItemValue('prcs__conta_pai', contaInternaNIC);
            return true;
        }

        // Verifica se Tipo de Cuenta é H (Hija) e se for, Cuenta Interna NIC deve ser diferente de prcs__conta_pai
        else if (tipoContaValue == 'H') {
            let contaPai = mtdOnergy.JsEvtGetItemValue('prcs__conta_pai');

            // Verifica se Cuenta Interna NIC é diferente de prcs__conta_pai, se for, exibe mensagem de erro e retorna false
            if (contaPai == contaInternaNIC) {
                mtdOnergy.JsEvtShowMessage('error', 'Cuenta Interna NIC no puede ser igual a Cuenta Padre');
                mtdOnergy.JsEvtShowHideLoading(false);
                return false;
            }
        }
    }
};

mainMethod();
