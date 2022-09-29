let onergyCtx = mtdOnergy.JsEvtGetCurrentCtx();

let mainMethod = async () => {
    // Se NIC retornar false, não salva o registro
    if (!(await validarNic())) {
        return;
    }

    // Se Nome do Provedor + Conta Pai + Tipo de Conta retornar false, não salva o registro
    if (!(await validarNomeProvedorContaPaiTipoConta())) {
        return;
    }

    await condSomenteLeitura();
    await limiteDiaPago();

    // Envia o submit do formulário
    mtdOnergy.JsEvtSubmitForm();
};

// Bloqueia a edição de campos que não podem ser editados pelo usuário
let condSomenteLeitura = async () => {
    let registroSalvo = mtdOnergy.JsEvtGetItemValue("registro_salvo_");

    // Se registro_salvo_ for igual a nao ou null, seta registro_salvo_ para sim e cfgCondicionais altera para somente leitura os campos que não podem ser editados pelo usuário
    if (!registroSalvo || registroSalvo == "nao") {
        mtdOnergy.JsEvtSetItemValue("registro_salvo_", "sim");
    }
};

// Valida o limite de dia de pagamento
let limiteDiaPago = async () => {
    let diaPago = mtdOnergy.JsEvtGetItemValue("prcs__dia_de_pagamento");

    // Verifica se o dia de pagamento é maior que 31 e menor que 1 e se for, envia uma mensagem de erro e cancela o submit
    if (diaPago < 1 || diaPago > 31) {
        mtdOnergy.JsEvtShowMessage("error", "Día de Pago inválido");
        mtdOnergy.JsEvtShowHideLoading(false);
        return false;
    }
    return true;
};

// Valida se Cuenta Interna (NIC) já foi informada
let validarNic = async () => {
    let informacoesContaID = "1e6d6595-083f-4bb8-b82c-e9054e9dc8f3";
    let nic = mtdOnergy.JsEvtGetItemValue("conta_interna_nic");
    let objNic = await mtdOnergy.JsEvtGetFeedData({
        fdtID: informacoesContaID,
        filter: gerarFiltro("conta_interna_nic", nic),
    });

    // Se o conta_interna_nic já foi informado, exibe uma mensagem de erro
    if (objNic.length > 0 && nic == objNic[0].urlJsonContext.conta_interna_nic) {
        if (onergyCtx.fedid != objNic[0].id) {
            mtdOnergy.JsEvtShowMessage("error", "Cuenta Interna (NIC) ya informada");
            mtdOnergy.JsEvtShowHideLoading(false);
            return false;
        }
    }
    return true;
};

// Valida o nome do provedor + conta pai + tipo de conta
let validarNomeProvedorContaPaiTipoConta = async () => {
    let informacoesContaID = "1e6d6595-083f-4bb8-b82c-e9054e9dc8f3";
    let nomeProvedor = mtdOnergy.JsEvtGetItemValue("prvd_id");
    let contaPai = mtdOnergy.JsEvtGetItemValue("prcs__conta_pai");
    let tipoContaValue = mtdOnergy.JsEvtGetItemValue("TCTC_tipo_de_conta__TC_tipo_de_conta_valor");

    let objNomeProvedor = await mtdOnergy.JsEvtGetFeedData({
        fdtID: informacoesContaID,
        filter: gerarFiltro("prvd_id", nomeProvedor),
    });

    if (objNomeProvedor && objNomeProvedor.length > 0) {
        let objContaPai = await mtdOnergy.JsEvtGetFeedData({
            fdtID: informacoesContaID,
            filter: gerarFiltro("prcs__conta_pai", contaPai),
        });

        if (objContaPai && objContaPai.length > 0) {
            let objTipoConta = await mtdOnergy.JsEvtGetFeedData({
                fdtID: informacoesContaID,
                filter: gerarFiltro("TCTC_tipo_de_conta__TC_tipo_de_conta_valor", tipoContaValue),
            });

            if (objTipoConta && objTipoConta.length > 0) {
                if (onergyCtx.fedid != objNomeProvedor[0].id && onergyCtx.fedid != objContaPai[0].id && onergyCtx.fedid != objTipoConta[0].id) {
                    mtdOnergy.JsEvtShowMessage("error", "Nombre del Proveedor + Cuenta Padre + Tipo de Cuenta ya informado");
                    mtdOnergy.JsEvtShowHideLoading(false);
                    return false;
                }
            }
        }
        return true;
    }
};

// Cria um filtro para o campo informado e retorna o filtro
const gerarFiltro = (fielNameP, valueP) => {
    return JSON.stringify([
        {
            FielName: fielNameP,
            Type: `${typeof valueP == "number" ? "Numeric" : "string"}`,
            FixedType: `${typeof valueP == "number" ? "Numeric" : "string"}`,
            Value1: valueP,
        },
    ]);
};

mainMethod();
