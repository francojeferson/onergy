let onergyCtx = mtdOnergy.JsEvtGetCurrentCtx();

let mainMethod = async () => {
    if (!(await validarNic())) {
        return;
    }

    if (!(await limiteDiaPago())) {
        return;
    }

    await condSomenteLeitura();

    let resultNaoApagarContaPai = await naoApagarContaPai();

    if (resultNaoApagarContaPai) {
        mtdOnergy.JsEvtSetItemValue('idc_pode_apagar', 'sim');
        mtdOnergy.JsEvtSetItemValue('pode_apagar', 'sim');
    } else {
        mtdOnergy.JsEvtSetItemValue('idc_pode_apagar', 'nao');
        mtdOnergy.JsEvtSetItemValue('pode_apagar', 'nao');
    }

    mtdOnergy.JsEvtSubmitForm();
};

let condSomenteLeitura = async () => {
    let registroSalvo = mtdOnergy.JsEvtGetItemValue('registro_salvo_');

    if (!registroSalvo || registroSalvo == 'nao') {
        mtdOnergy.JsEvtSetItemValue('registro_salvo_', 'sim');
    }
};

let limiteDiaPago = async () => {
    let diaPago = mtdOnergy.JsEvtGetItemValue('prcs__dia_de_pagamento');

    if (diaPago < 1 || diaPago > 31) {
        mtdOnergy.JsEvtShowMessage('error', 'Día de Pago inválido');
        mtdOnergy.JsEvtShowHideLoading(false);
        return false;
    }
    return true;
};

let validarNic = async () => {
    let informacoesContaID = '1e6d6595-083f-4bb8-b82c-e9054e9dc8f3';
    let nic = mtdOnergy.JsEvtGetItemValue('conta_interna_nic');
    let objNic = await mtdOnergy.JsEvtGetFeedData({
        fdtID: informacoesContaID,
        filter: gerarFiltro('conta_interna_nic', nic),
    });

    if (objNic.length > 0 && nic == objNic[0].urlJsonContext.conta_interna_nic) {
        if (onergyCtx.fedid != objNic[0].id) {
            mtdOnergy.JsEvtShowMessage('error', 'Cuenta Interna (NIC) ya informada');
            mtdOnergy.JsEvtShowHideLoading(false);
            return false;
        }
    }
    return true;
};

let naoApagarContaPai = async () => {
    let informacoesContaID = '1e6d6595-083f-4bb8-b82c-e9054e9dc8f3';
    let nomeProvedor = mtdOnergy.JsEvtGetItemValue('prvd_id');
    let contaPai = mtdOnergy.JsEvtGetItemValue('prcs__conta_pai');
    let nic = mtdOnergy.JsEvtGetItemValue('conta_interna_nic');
    let tipoContaValue = mtdOnergy.JsEvtGetItemValue('TCTC_tipo_de_conta__TC_tipo_de_conta_valor');
    let objIDC = await mtdOnergy.JsEvtGetFeedData({
        fdtID: informacoesContaID,
    });

    if (tipoContaValue == 'P' || tipoContaValue == 'PH' || tipoContaValue == 'HH') {
        let objNomeProvedor = await mtdOnergy.JsEvtGetFeedData({
            fdtID: informacoesContaID,
            filter: gerarFiltro('prvd_id', nomeProvedor),
        });

        if (objNomeProvedor && objNomeProvedor.length > 0) {
            let objContaPai = await mtdOnergy.JsEvtGetFeedData({
                fdtID: informacoesContaID,
                filter: gerarFiltro('prcs__conta_pai', contaPai),
            });

            if (objContaPai && objContaPai.length > 0) {
                if (objIDC && objIDC.length > 0) {
                    let objRegistroPai = await objIDC.filter((item) => item.urlJsonContext.conta_interna_nic == contaPai);

                    if (objRegistroPai && objRegistroPai.length > 0) {
                        mtdOnergy.JsEvtShowHideLoading(false);
                        return false;
                    }
                }
            }
        }
    }
    return true;
};

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
