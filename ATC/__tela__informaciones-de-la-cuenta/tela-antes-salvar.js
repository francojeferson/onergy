// eslint-disable-next-line no-unused-vars
const idInformacionesdelaCuenta = '1f79162f-a130-45b5-887b-4e2482508fa0';
const idInformacoesConta = '1e6d6595-083f-4bb8-b82c-e9054e9dc8f3';

// eslint-disable-next-line no-undef
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
        // eslint-disable-next-line no-undef
        mtdOnergy.JsEvtSetItemValue('idc_pode_apagar', 'sim');
        // eslint-disable-next-line no-undef
        mtdOnergy.JsEvtSetItemValue('pode_apagar', 'sim');
    } else {
        // eslint-disable-next-line no-undef
        mtdOnergy.JsEvtSetItemValue('idc_pode_apagar', 'nao');
        // eslint-disable-next-line no-undef
        mtdOnergy.JsEvtSetItemValue('pode_apagar', 'nao');
    }

    // eslint-disable-next-line no-undef
    mtdOnergy.JsEvtSubmitForm();
};

let condSomenteLeitura = async () => {
    // eslint-disable-next-line no-undef
    let registroSalvo = mtdOnergy.JsEvtGetItemValue('registro_salvo_');

    if (!registroSalvo || registroSalvo == 'nao') {
        // eslint-disable-next-line no-undef
        mtdOnergy.JsEvtSetItemValue('registro_salvo_', 'sim');
    }
};

let limiteDiaPago = async () => {
    // eslint-disable-next-line no-undef
    let diaPago = mtdOnergy.JsEvtGetItemValue('prcs__dia_de_pagamento');

    if (diaPago < 1 || diaPago > 31) {
        // eslint-disable-next-line no-undef
        mtdOnergy.JsEvtShowMessage('error', 'Día de Pago inválido');
        // eslint-disable-next-line no-undef
        mtdOnergy.JsEvtShowHideLoading(false);
        return false;
    }
    return true;
};

let validarNic = async () => {
    // eslint-disable-next-line no-undef
    let tipoContaValue = mtdOnergy.JsEvtGetItemValue('TCTC_tipo_de_conta__TC_tipo_de_conta_valor');
    // eslint-disable-next-line no-undef
    let nic = mtdOnergy.JsEvtGetItemValue('conta_interna_nic');
    // eslint-disable-next-line no-undef, no-unused-vars
    let asset_number = mtdOnergy.JsEvtGetItemValue('asset_number');
    // eslint-disable-next-line no-undef
    let objNic = await mtdOnergy.JsEvtGetFeedData({
        fdtID: idInformacoesConta,
        filter: gerarFiltro('conta_interna_nic', nic),
    });

    for (let item in objNic) {
        if (tipoContaValue == 'P' || tipoContaValue == 'H' || tipoContaValue == 'I') {
            if (objNic.length > 0 && nic == objNic[item].urlJsonContext.conta_interna_nic) {
                if (onergyCtx.fedid != objNic[item].id) {
                    // eslint-disable-next-line no-undef
                    mtdOnergy.JsEvtShowMessage('error', 'Cuenta Interna (NIC) ya informada');
                    // eslint-disable-next-line no-undef
                    mtdOnergy.JsEvtShowHideLoading(false);
                    return false;
                }
            }
        } else if (tipoContaValue == 'PH') {
            // tipoContaValue == 'PH' no puede repitir el NIC de otro PH
            // tipoContaValue == 'PH' puede repitir el NIC de otra HH
            if (
                objNic.length > 0 &&
                nic == objNic[item].urlJsonContext.conta_interna_nic &&
                objNic[item].urlJsonContext.TCTC_tipo_de_conta__TC_tipo_de_conta_valor == 'PH'
            ) {
                if (onergyCtx.fedid != objNic[item].id) {
                    // eslint-disable-next-line no-undef
                    mtdOnergy.JsEvtShowMessage('error', 'Cuenta Interna (NIC) ya informada para otro PH');
                    // eslint-disable-next-line no-undef
                    mtdOnergy.JsEvtShowHideLoading(false);
                    return false;
                }
            }
        } else if (tipoContaValue == 'HH') {
            // tipoContaValue == 'HH' no puede repitir el NIC de otra HH
            // tipoContaValue == 'HH' puede repitir el NIC de otro PH
            if (
                objNic.length > 0 &&
                nic == objNic[item].urlJsonContext.conta_interna_nic &&
                objNic[item].urlJsonContext.TCTC_tipo_de_conta__TC_tipo_de_conta_valor == 'HH'
            ) {
                if (onergyCtx.fedid != objNic[item].id) {
                    // eslint-disable-next-line no-undef
                    mtdOnergy.JsEvtShowMessage('error', 'Cuenta Interna (NIC) ya informada para otra HH');
                    // eslint-disable-next-line no-undef
                    mtdOnergy.JsEvtShowHideLoading(false);
                    return false;
                }
            }
        }
    }

    return true;
};

let naoApagarContaPai = async () => {
    // eslint-disable-next-line no-undef
    let nomeProvedor = mtdOnergy.JsEvtGetItemValue('prvd_id');
    // eslint-disable-next-line no-undef
    let contaPai = mtdOnergy.JsEvtGetItemValue('prcs__conta_pai');
    // eslint-disable-next-line no-undef, no-unused-vars
    let nic = mtdOnergy.JsEvtGetItemValue('conta_interna_nic');
    // eslint-disable-next-line no-undef
    let tipoContaValue = mtdOnergy.JsEvtGetItemValue('TCTC_tipo_de_conta__TC_tipo_de_conta_valor');
    // eslint-disable-next-line no-undef
    let objIDC = await mtdOnergy.JsEvtGetFeedData({
        fdtID: idInformacoesConta,
    });

    if (tipoContaValue == 'P' || tipoContaValue == 'PH' || tipoContaValue == 'HH') {
        // eslint-disable-next-line no-undef
        let objNomeProvedor = await mtdOnergy.JsEvtGetFeedData({
            fdtID: idInformacoesConta,
            filter: gerarFiltro('prvd_id', nomeProvedor),
        });

        if (objNomeProvedor && objNomeProvedor.length > 0) {
            // eslint-disable-next-line no-undef
            let objContaPai = await mtdOnergy.JsEvtGetFeedData({
                fdtID: idInformacoesConta,
                filter: gerarFiltro('prcs__conta_pai', contaPai),
            });

            if (objContaPai && objContaPai.length > 0) {
                if (objIDC && objIDC.length > 0) {
                    let objRegistroPai = await objIDC.filter((item) => item.urlJsonContext.conta_interna_nic == contaPai);

                    if (objRegistroPai && objRegistroPai.length > 0) {
                        // eslint-disable-next-line no-undef
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
