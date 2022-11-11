let mainMethod = async () => {
    await validarAssetNumber();
    await validarContaPai();
    await validarTipoContaHH();
};

//*determinar valor de asset_number
let validarAssetNumber = async () => {
    let tipoConta = mtdOnergy.JsEvtGetItemValue('TCprcs__tipo_de_conta_id');
    let tipoContaCache = mtdOnergy.JsEvtGetItemValue('prcs__tipo_de_conta_cache');

    //*se tipo_cuenta for alterado, atualiza cache
    if (tipoConta != tipoContaCache) {
        let tipoContaValue = mtdOnergy.JsEvtGetItemValue('TCTC_tipo_de_conta__TC_tipo_de_conta_valor');
        mtdOnergy.JsEvtSetItemValue('prcs__tipo_de_conta_cache', tipoConta, null, null, true);

        //*se tipo_cuenta for P (Padre) ou PH (Padre Hibrida), limpar asset_number, caso contrário, determinar valor de cache em asset_number
        if (tipoContaValue == 'P' || tipoContaValue == 'PH') {
            mtdOnergy.JsEvtSetItemValue('asset_number_IDC', '');
        } else {
            let assetNumber = mtdOnergy.JsEvtGetItemValue('asset_number');
            mtdOnergy.JsEvtSetItemValue('asset_number_IDC', assetNumber);
        }
    }
};

//*determinar valor de prcs__conta_pai
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
            if (contaPai.length == 0) {
                mtdOnergy.JsEvtSetItemValue('prcs__conta_pai', '');
            }
        }
        return true;
    }
};

//*determinar tipo_cuenta HH (Hija Hibrida) duplicado
let validarTipoContaHH = async () => {
    let informacionCuentaID = '21672360-869c-4c29-8cf8-2bafa8530923';
    let contaInternaNIC = mtdOnergy.JsEvtGetItemValue('conta_interna_nic');
    let tipoContaValue = mtdOnergy.JsEvtGetItemValue('TCTC_tipo_de_conta__TC_tipo_de_conta_valor');

    //*se tipo_cuenta for HH (Hija Hibrida), verificar se já existe conta com o mesmo valor de conta_interna_nic
    if (tipoContaValue == 'HH') {
        let objInformacionCuenta = await mtdOnergy.JsEvtGetFeedData({
            fdtID: informacionCuentaID,
            filter: gerarFiltro('_id', contaInternaNIC),
        });

        //*se já existir conta com o mesmo valor de conta_interna_nic e mesmo tipo_cuenta HH, exibe mensagem de erro e retorna false
        if (objInformacionCuenta && objInformacionCuenta.length > 0) {
            let objInformacionCuentaFiltrado = objInformacionCuenta.filter((item) => {
                return item.TCTC_tipo_de_conta__TC_tipo_de_conta_valor == 'HH';
            });

            if (objInformacionCuentaFiltrado && objInformacionCuentaFiltrado.length > 0) {
                mtdOnergy.JsEvtShowMessage('error', 'Ya existe una Cuenta con el mismo valor de Cuenta Interna NIC y Tipo de Cuenta Hija Hibrida');
                mtdOnergy.JsEvtSetItemValue('conta_interna_nic', '');
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
