let mainMethod = async () => {
    // debugger;
    let cms = mtdOnergy.JsEvtGetItemValue('asset_number');
    let objCms = await mtdOnergy.JsEvtGetFeedData({
        fdtID: 'e43b9fe0-6752-446d-8495-0b4fdd7a70b4',
        filter: JSON.stringify([{ FielName: 'asset_number', Type: 'string', FixedType: 'string', Value1: cms }]),
    });
    if (objCms.length > 0 && cms == objCms[0].urlJsonContext.asset_number) {
        mtdOnergy.JsEvtShowMessage('error', 'Asset Number ya informado');
        mtdOnergy.JsEvtShowHideLoading(false);
    }
};

mainMethod();
