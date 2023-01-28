// eslint-disable-next-line no-unused-vars
const idSites = '68f8c3b8-1b4e-40ce-95e8-b72131756087';
const idSitios = 'e43b9fe0-6752-446d-8495-0b4fdd7a70b4';

// eslint-disable-next-line no-undef
let onergyCtx = mtdOnergy.JsEvtGetCurrentCtx();

let mainMethod = async () => {
    await validarAssetNumber();
};

// Valida se o asset_number já foi informado
let validarAssetNumber = async () => {
    // eslint-disable-next-line no-undef
    let cms = mtdOnergy.JsEvtGetItemValue('asset_number');
    // eslint-disable-next-line no-undef
    let objCms = await mtdOnergy.JsEvtGetFeedData({
        fdtID: idSitios,
        filter: gerarFiltro('asset_number', cms),
    });

    // Se o asset_number já foi informado, exibe uma mensagem de erro
    if (objCms.length > 0 && cms == objCms[0].urlJsonContext.asset_number) {
        if (onergyCtx.fedid != objCms[0].id) {
            // eslint-disable-next-line no-undef
            mtdOnergy.JsEvtShowMessage('error', 'Asset Number ya informado');
            // eslint-disable-next-line no-undef
            mtdOnergy.JsEvtShowHideLoading(false);
            return false;
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
