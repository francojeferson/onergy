let mainMethod = async () => {
    await validarContaPai();
};

// Valida o tipo de conta e seta o valor do campo prcs__conta_pai
let validarContaPai = async () => {
    let contaInternaNIC = mtdOnergy.JsEvtGetItemValue('conta_interna_nic');
    let contaPai = mtdOnergy.JsEvtGetItemValue('prcs__conta_pai');
    let tipoContaValue = mtdOnergy.JsEvtGetItemValue('TCTC_tipo_de_conta__TC_tipo_de_conta_valor');

    if (tipoContaValue || contaPai) {
        // Verifica se Tipo de Cuenta é I (Individual) e se for, prcs__conta_pai deve receber NO
        if (tipoContaValue == 'I') {
            mtdOnergy.JsEvtSetItemValue('prcs__conta_pai', 'NO');
        }

        // Verifica se Tipo de Cuenta é P (Padre) ou HH (Hija Hibrida) e se for, seta Cuenta Interna NIC em campo prcs__conta_pai
        else if (tipoContaValue == 'P' || tipoContaValue == 'HH') {
            mtdOnergy.JsEvtSetItemValue('prcs__conta_pai', contaInternaNIC);
        }

        // Verifica se Tipo de Cuenta é H (Hija) e se for, Cuenta Interna NIC deve ser diferente de prcs__conta_pai
        else if (tipoContaValue == 'H') {
            // Verifica se Cuenta Interna NIC é diferente de prcs__conta_pai, se for, exibe mensagem de erro e retorna false
            if (contaPai.length > 0 && contaPai == contaInternaNIC) {
                mtdOnergy.JsEvtShowMessage('error', 'Cuenta Padre no puede ser igual a Cuenta Interna NIC para Tipo de Cuenta Hija');
                mtdOnergy.JsEvtSetItemValue('prcs__conta_pai', '');
                mtdOnergy.JsEvtShowHideLoading(false);
                return false;
            }
            if (!contaPai) {
                mtdOnergy.JsEvtSetItemValue('prcs__conta_pai', '');
            }
        }
        return true;
    }
};

mainMethod();
