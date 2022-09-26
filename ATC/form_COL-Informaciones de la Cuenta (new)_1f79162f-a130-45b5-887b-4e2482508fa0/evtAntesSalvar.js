let onergyCtx = mtdOnergy.JsEvtGetCurrentCtx();

let mainMethod = async () => {
    // Se NIC e Provedor e TipoConta retornar false, não salva o registro
    if (!(await validarNicEProvedorETipoConta())) {
        return;
    }

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

// Valida se o NIC e Provedor já foi informado para o tipo de conta
let validarNicEProvedorETipoConta = async () => {
    let informacoesContaID = '1e6d6595-083f-4bb8-b82c-e9054e9dc8f3';
    let nic = mtdOnergy.JsEvtGetItemValue('conta_interna_nic');
    let provedor = mtdOnergy.JsEvtGetItemValue('prvd_id');
    let tipoConta = mtdOnergy.JsEvtGetItemValue('TCTC_tipo_de_conta__TC_tipo_de_conta_valor');
    if (nic && provedor && tipoConta) {
        let objInformacoesConta = await mtdOnergy.JsEvtGetFeedData({
            fdtID: informacoesContaID,
            filter: gerarFiltro('conta_interna_nic', nic),
        });

        if (objInformacoesConta && objInformacoesConta.length > 0) {
            let objInformacoesContaFiltrado = await mtdOnergy.JsEvtGetFeedData({
                fdtID: informacoesContaID,
                filter: gerarFiltro('prvd_id', provedor),
            });

            if (objInformacoesContaFiltrado && objInformacoesContaFiltrado.length > 0) {
                let objInformacoesContaFiltradoTipoConta = await mtdOnergy.JsEvtGetFeedData({
                    fdtID: informacoesContaID,
                    filter: gerarFiltro('TCTC_tipo_de_conta__TC_tipo_de_conta_valor', tipoConta),
                });

                if (objInformacoesContaFiltradoTipoConta && objInformacoesContaFiltradoTipoConta.length > 0) {
                    if (tipoConta == 'I' || tipoConta == 'H' || tipoConta == 'HH') {
                        mtdOnergy.JsEvtShowMessage('error', 'Cuenta Interna (NIC) y Proveedor ya informado para este tipo de cuenta');
                        mtdOnergy.JsEvtShowHideLoading(false);
                        return false;
                    }
                }
            }
        }
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
