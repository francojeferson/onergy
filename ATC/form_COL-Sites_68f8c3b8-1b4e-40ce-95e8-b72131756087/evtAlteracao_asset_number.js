let onergyCtx = mtdOnergy.JsEvtGetCurrentCtx();

let mainMethod = async () => {
    await validarAssetNumber();
};

// Valida se o asset_number já foi informado
let validarAssetNumber = async () => {
    let sitiosID = 'e43b9fe0-6752-446d-8495-0b4fdd7a70b4';
    let cms = mtdOnergy.JsEvtGetItemValue('asset_number');
    let objCms = await mtdOnergy.JsEvtGetFeedData({
        fdtID: sitiosID,
        filter: gerarFiltro('asset_number', cms),
    });

    // Se o asset_number já foi informado, exibe uma mensagem de erro
    if (objCms.length > 0 && cms == objCms[0].urlJsonContext.asset_number) {
        if (onergyCtx.fedid != objCms[0].id) {
            mtdOnergy.JsEvtShowMessage('error', 'Asset Number ya informado');
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
