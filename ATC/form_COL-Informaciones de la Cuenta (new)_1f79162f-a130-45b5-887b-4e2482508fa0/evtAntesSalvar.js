let onergyCtx = mtdOnergy.JsEvtGetCurrentCtx();

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

// Valida se o asset_number já foi informado
let validarNicEProvedorETipoConta = async () => {
    let informacoesContaID = '1e6d6595-083f-4bb8-b82c-e9054e9dc8f3';
    let nic = mtdOnergy.JsEvtGetItemValue('conta_interna_nic');
    let provedor = mtdOnergy.JsEvtGetItemValue('nome_provedor');
    let tipoConta = mtdOnergy.JsEvtGetItemValue('prcs__tipo_de_conta');
    let strFiltro = JSON.stringify([
        {
            FielName: 'conta_interna_nic',
            Value1: nic,
            Conditional: 'or',
        },
        {
            FielName: 'nome_provedor',
            Value1: provedor,
            Conditional: 'or',
        },
        {
            FielName: 'prcs__tipo_de_conta',
            Value1: tipoConta,
            Conditional: 'or',
        },
    ]);
    let obj = await mtdOnergy.JsEvtGetFeedData({
        fdtID: informacoesContaID,
        filter: strFiltro,
    });

    // Se a junção dos campos já foi registrado, exibe uma mensagem de erro
    if (
        obj.length > 0 &&
        nic == obj[0].urlJsonContext.conta_interna_nic &&
        provedor == obj[0].urlJsonContext.nome_provedor &&
        tipoConta == obj[0].urlJsonContext.prcs__tipo_de_conta
    ) {
        // Se o Tipo de Conta for igual a I, H ou HH, exibe uma mensagem de erro
        if (tipoConta == 'I' || tipoConta == 'H' || tipoConta == 'HH') {
            if (onergyCtx.fedid != obj[0].id) {
                mtdOnergy.JsEvtShowMessage('error', 'Cuenta Interna (NIC) y Proveedor ya informado para este tipo de cuenta');
                mtdOnergy.JsEvtShowHideLoading(false);
                return false;
            }
        }
    }
    return true;
};

mainMethod();
