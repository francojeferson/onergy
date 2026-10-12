// eslint-disable-next-line no-unused-vars
const idInformacionesdelaCuenta = '1f79162f-a130-45b5-887b-4e2482508fa0';

let mainMethod = async () => {
    await limparDocsiaStatus();
    await validarContaPai();
};

// Limpa campos Docsia Status
let limparDocsiaStatus = async () => {
    // eslint-disable-next-line no-undef
    mtdOnergy.JsEvtSetItemValue('status_docsia', '');
    // eslint-disable-next-line no-undef
    mtdOnergy.JsEvtSetItemValue('status_docsia_Desc', '');
    // eslint-disable-next-line no-undef
    mtdOnergy.JsEvtSetItemValue('status_docsia_msg', '');
};

// Valida o tipo de conta e seta o valor do campo prcs__conta_pai
let validarContaPai = async () => {
    // eslint-disable-next-line no-undef
    let contaInternaNIC = mtdOnergy.JsEvtGetItemValue('conta_interna_nic');
    // eslint-disable-next-line no-undef
    let contaPai = mtdOnergy.JsEvtGetItemValue('prcs__conta_pai');
    // eslint-disable-next-line no-undef
    let tipoContaValue = mtdOnergy.JsEvtGetItemValue('TCTC_tipo_de_conta__TC_tipo_de_conta_valor');

    if (tipoContaValue || contaPai) {
        // Verifica se Tipo de Cuenta é I (Individual) e se for, prcs__conta_pai deve receber NO
        if (tipoContaValue == 'I') {
            // eslint-disable-next-line no-undef
            mtdOnergy.JsEvtSetItemValue('prcs__conta_pai', 'NO');
        }

        // Verifica se Tipo de Cuenta é PH (Padre Hibrida) ou P (Padre) ou HH (Hija Hibrida) e se for, seta Cuenta Interna NIC em campo prcs__conta_pai
        else if (tipoContaValue == 'PH' || tipoContaValue == 'P' || tipoContaValue == 'HH') {
            // eslint-disable-next-line no-undef
            mtdOnergy.JsEvtSetItemValue('prcs__conta_pai', contaInternaNIC);
        }

        // Verifica se Tipo de Cuenta é H (Hija) e se for, Cuenta Interna NIC deve ser diferente de prcs__conta_pai
        else if (tipoContaValue == 'H') {
            // Verifica se Cuenta Interna NIC é diferente de prcs__conta_pai, se for, exibe mensagem de erro e retorna false
            if (contaPai.length > 0 && contaPai == contaInternaNIC) {
                // eslint-disable-next-line no-undef
                mtdOnergy.JsEvtShowMessage('error', 'Cuenta Padre no puede ser igual a Cuenta Interna NIC para Tipo de Cuenta Hija');
                // eslint-disable-next-line no-undef
                mtdOnergy.JsEvtSetItemValue('prcs__conta_pai', '');
                // eslint-disable-next-line no-undef
                mtdOnergy.JsEvtShowHideLoading(false);
                return false;
            }
            if (!contaPai) {
                // eslint-disable-next-line no-undef
                mtdOnergy.JsEvtSetItemValue('prcs__conta_pai', '');
            }
        }
        return true;
    }
};

mainMethod();
