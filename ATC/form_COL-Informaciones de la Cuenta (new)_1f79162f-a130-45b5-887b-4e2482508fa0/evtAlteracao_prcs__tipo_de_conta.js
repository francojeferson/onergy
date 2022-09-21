let mainMethod = async () => {
    await validarTipoConta();
    await validarContaPai();
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

// Valida o tipo de conta e seta o valor do campo prcs__conta_pai
let validarContaPai = async () => {
    let tipoContaValue = mtdOnergy.JsEvtGetItemValue('TCTC_tipo_de_conta__TC_tipo_de_conta_valor');
    let contaInternaNIC = mtdOnergy.JsEvtGetItemValue('conta_interna_nic');

    if (tipoContaValue) {
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
            let contaPai = mtdOnergy.JsEvtGetItemValue('prcs__conta_pai');

            // Verifica se Cuenta Interna NIC é diferente de prcs__conta_pai, se for, exibe mensagem de erro e retorna false
            if (contaPai == contaInternaNIC) {
                mtdOnergy.JsEvtShowMessage('error', 'Cuenta Padre no puede ser igual a Cuenta Interna NIC para Tipo de Cuenta Hija');
                mtdOnergy.JsEvtSetItemValue('prcs__conta_pai', '');
                mtdOnergy.JsEvtShowHideLoading(false);
                return false;
            }
        }
        return true;
    }
};

mainMethod();
