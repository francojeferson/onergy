let onergyCtx = mtdOnergy.JsEvtGetCurrentCtx();

let mainMethod = async () => {
    await aplicarNumeroLote();
};

let aplicarNumeroLote = async () => {
    await mtdOnergy.JsEvtGetParentRefID();
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
