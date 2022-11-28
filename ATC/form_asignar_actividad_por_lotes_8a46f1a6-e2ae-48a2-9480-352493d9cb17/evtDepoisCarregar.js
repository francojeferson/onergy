let onergyCtx = mtdOnergy.JsEvtGetCurrentCtx();

let mainMethod = async () => {
    await aplicarNumeroLote();
};

let aplicarNumeroLote = async () => {
    await mtdOnergy.JsEvtGetParentRefID();
    mtdOnergy.JsEvtSetItemValue('CDE__status_lote', 'Procesado');
    // let hoje = new Date();
    // let hojeFormat = hoje.getFullYear() + '-' + (hoje.getMonth() + 1) + '-' + hoje.getDate();
    // mtdOnergy.JsEvtSetItemValue('CDE__data_lote', hojeFormat);

    let idAsignarActividadporLotes = '8a46f1a6-e2ae-48a2-9480-352493d9cb17';
    let getNumeroLote = await mtdOnergy.JsEvtGetFeedData({
        fdtID: idAsignarActividadporLotes,
    });
    if (getNumeroLote.length == undefined || getNumeroLote.length == 0) {
        mtdOnergy.JsEvtSetItemValue('CDE__numero_lote', 'LOT0001');
    } else {
        for (let item in getNumeroLote) {
            if (onergyCtx.fedid != getNumeroLote[item].id) {
                let numeroLote = mtdOnergy.JsEvtGetItemValue('CDE__numero_lote');
                let objNumeroLote = await getNumeroLote.filter((item) => item.urlJsonContext.CDE__numero_lote == numeroLote);
                if (numeroLote.length > 0) {
                    if (objNumeroLote.urlJsonContext.CDE__numero_lote == numeroLote) {
                        return;
                    } else {
                        mtdOnergy.JsEvtSetItemValue('CDE__numero_lote', 'LOT000' + (getNumeroLote.length + 1));
                    }
                } else {
                    mtdOnergy.JsEvtSetItemValue('CDE__numero_lote', 'LOT000' + (getNumeroLote.length + 1));
                }
            }
        }
    }
};

mainMethod();
