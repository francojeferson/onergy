// eslint-disable-next-line no-unused-vars
const idInformacionesdelaCuenta = '1f79162f-a130-45b5-887b-4e2482508fa0';
const idInformacionCuenta = '21672360-869c-4c29-8cf8-2bafa8530923';

let mainMethod = async () => {
    await validarAssetNumber();
    await validarContaPai();
    await validarTipoContaHH();
};

//*determinar valor de asset_number
let validarAssetNumber = async () => {
    // eslint-disable-next-line no-undef
    let tipoConta = mtdOnergy.JsEvtGetItemValue('TCprcs__tipo_de_conta_id');
    // eslint-disable-next-line no-undef
    let tipoContaCache = mtdOnergy.JsEvtGetItemValue('prcs__tipo_de_conta_cache');

    //*se tipo_cuenta for alterado, atualiza cache
    if (tipoConta != tipoContaCache) {
        // eslint-disable-next-line no-undef
        let tipoContaValue = mtdOnergy.JsEvtGetItemValue('TCTC_tipo_de_conta__TC_tipo_de_conta_valor');
        // eslint-disable-next-line no-undef
        mtdOnergy.JsEvtSetItemValue('prcs__tipo_de_conta_cache', tipoConta, null, null, true);

        //*se tipo_cuenta for P (Padre) ou PH (Padre Hibrida), limpar asset_number, caso contrário, determinar valor de cache em asset_number
        if (tipoContaValue == 'P' || tipoContaValue == 'PH') {
            // eslint-disable-next-line no-undef
            mtdOnergy.JsEvtSetItemValue('asset_number_IDC', '');
        } else {
            // eslint-disable-next-line no-undef
            let assetNumber = mtdOnergy.JsEvtGetItemValue('asset_number');
            // eslint-disable-next-line no-undef
            mtdOnergy.JsEvtSetItemValue('asset_number_IDC', assetNumber);
        }
    }
};

//*determinar valor de prcs__conta_pai
let validarContaPai = async () => {
    // eslint-disable-next-line no-undef
    let contaInternaNIC = mtdOnergy.JsEvtGetItemValue('conta_interna_nic');
    // eslint-disable-next-line no-undef
    let contaPai = mtdOnergy.JsEvtGetItemValue('prcs__conta_pai');
    // eslint-disable-next-line no-undef
    let tipoContaValue = mtdOnergy.JsEvtGetItemValue('TCTC_tipo_de_conta__TC_tipo_de_conta_valor');

    if (tipoContaValue || contaPai) {
        //*se tipo_cuenta for I (Individual), prcs__conta_pai deve receber NO
        if (tipoContaValue == 'I') {
            // eslint-disable-next-line no-undef
            mtdOnergy.JsEvtSetItemValue('prcs__conta_pai', 'NO');
        }

        //*se tipo_cuenta for PH (Padre Hibrida) ou P (Padre) ou HH (Hija Hibrida), prcs__conta_pai deve receber cuenta_interna_nic
        else if (tipoContaValue == 'PH' || tipoContaValue == 'P' || tipoContaValue == 'HH') {
            // eslint-disable-next-line no-undef
            mtdOnergy.JsEvtSetItemValue('prcs__conta_pai', contaInternaNIC);
        }

        //*se tipo_cuenta for H (Hija), cuenta_interna_nic deve ser diferente de prcs__conta_pai
        else if (tipoContaValue == 'H') {
            //*se cuenta_interna_nic for diferente de prcs__conta_pai, exibe mensagem de erro e retorna false
            if (contaPai.length > 0 && contaPai == contaInternaNIC) {
                // eslint-disable-next-line no-undef
                mtdOnergy.JsEvtShowMessage('error', 'Cuenta Padre no puede ser igual a Cuenta Interna NIC para Tipo de Cuenta Hija');
                // eslint-disable-next-line no-undef
                mtdOnergy.JsEvtSetItemValue('prcs__conta_pai', '');
                // eslint-disable-next-line no-undef
                mtdOnergy.JsEvtShowHideLoading(false);
                return false;
            }
            if (contaPai.length == 0) {
                // eslint-disable-next-line no-undef
                mtdOnergy.JsEvtSetItemValue('prcs__conta_pai', '');
            }
        }
        return true;
    }
};

//*determinar tipo_cuenta HH (Hija Hibrida) duplicado
let validarTipoContaHH = async () => {
    // eslint-disable-next-line no-undef
    let contaInternaNIC = mtdOnergy.JsEvtGetItemValue('conta_interna_nic');
    // eslint-disable-next-line no-undef
    let tipoContaValue = mtdOnergy.JsEvtGetItemValue('TCTC_tipo_de_conta__TC_tipo_de_conta_valor');

    //*se tipo_cuenta for HH (Hija Hibrida), verificar se já existe conta com o mesmo valor de conta_interna_nic
    if (tipoContaValue == 'HH') {
        // eslint-disable-next-line no-undef
        let objInformacionCuenta = await mtdOnergy.JsEvtGetFeedData({
            fdtID: idInformacionCuenta,
            filter: gerarFiltro('_id', contaInternaNIC),
        });

        //*se já existir conta com o mesmo valor de conta_interna_nic e mesmo tipo_cuenta HH, exibe mensagem de erro e retorna false
        if (objInformacionCuenta && objInformacionCuenta.length > 0) {
            let objInformacionCuentaFiltrado = objInformacionCuenta.filter((item) => {
                return item.TCTC_tipo_de_conta__TC_tipo_de_conta_valor == 'HH';
            });

            if (objInformacionCuentaFiltrado && objInformacionCuentaFiltrado.length > 0) {
                // eslint-disable-next-line no-undef
                mtdOnergy.JsEvtShowMessage('error', 'Ya existe una Cuenta con el mismo valor de Cuenta Interna NIC y Tipo de Cuenta Hija Hibrida');
                // eslint-disable-next-line no-undef
                mtdOnergy.JsEvtSetItemValue('conta_interna_nic', '');
                // eslint-disable-next-line no-undef
                mtdOnergy.JsEvtShowHideLoading(false);
                return false;
            }
        }
    }
    return true;
};

//*gerar filtro com tipo texto ou número
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
