let mainMethod = async () => {
    await validarTipoConta();
    await validarContaPai();
};

//*validar tipo_cuenta e determinar valor de asset_number
let validarTipoConta = async () => {
    let tipoConta = mtdOnergy.JsEvtGetItemValue('TCprcs__tipo_de_conta_id');
    let tipoContaCache = mtdOnergy.JsEvtGetItemValue('prcs__tipo_de_conta_cache');

    //*se tipo_cuenta for alterado, atualiza cache
    if (tipoConta != tipoContaCache) {
        let tipoContaValue = mtdOnergy.JsEvtGetItemValue('TCTC_tipo_de_conta__TC_tipo_de_conta_valor');
        mtdOnergy.JsEvtSetItemValue('prcs__tipo_de_conta_cache', tipoConta, null, null, true);

        //*se tipo_cuenta for P (Padre) ou PH (Padre Hibrida) ou HH (Hija Hibrida), limpar asset_number, caso contrário, determinar valor de cache em asset_number
        if (tipoContaValue == 'P' || tipoContaValue == 'PH' || tipoContaValue == 'HH') {
            mtdOnergy.JsEvtSetItemValue('asset_number_IDC', '');
        } else {
            let assetNumber = mtdOnergy.JsEvtGetItemValue('asset_number');
            mtdOnergy.JsEvtSetItemValue('asset_number_IDC', assetNumber);
        }
    }
};

//*validar tipo_cuenta e determinar valor de prcs__conta_pai
let validarContaPai = async () => {
    let contaInternaNIC = mtdOnergy.JsEvtGetItemValue('conta_interna_nic');
    let contaPai = mtdOnergy.JsEvtGetItemValue('prcs__conta_pai');
    let tipoContaValue = mtdOnergy.JsEvtGetItemValue('TCTC_tipo_de_conta__TC_tipo_de_conta_valor');

    if (tipoContaValue || contaPai) {
        //*se tipo_cuenta for I (Individual), prcs__conta_pai deve receber NO
        if (tipoContaValue == 'I') {
            mtdOnergy.JsEvtSetItemValue('prcs__conta_pai', 'NO');
        }

        //*se tipo_cuenta for PH (Padre Hibrida) ou P (Padre) ou HH (Hija Hibrida), prcs__conta_pai deve receber cuenta_interna_nic
        else if (tipoContaValue == 'PH' || tipoContaValue == 'P' || tipoContaValue == 'HH') {
            mtdOnergy.JsEvtSetItemValue('prcs__conta_pai', contaInternaNIC);
        }

        //*se tipo_cuenta for H (Hija), cuenta_interna_nic deve ser diferente de prcs__conta_pai
        else if (tipoContaValue == 'H') {
            //*se cuenta_interna_nic for diferente de prcs__conta_pai, exibe mensagem de erro e retorna false
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
