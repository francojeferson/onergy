const idAsignarActividadporLotes = '8a46f1a6-e2ae-48a2-9480-352493d9cb17';

// eslint-disable-next-line no-undef
let onergyCtx = mtdOnergy.JsEvtGetCurrentCtx();

let mainMethod = async () => {
    await aplicarDataLote();
    await aplicarNumeroLote();
};

let aplicarDataLote = async () => {
    // eslint-disable-next-line no-undef
    await mtdOnergy.JsEvtGetParentRefID();
    // eslint-disable-next-line no-undef
    let dataLote = mtdOnergy.JsEvtGetItemValue('data_lote');
    if (dataLote == undefined || dataLote == '') {
        let date = new Date();
        let dt_obj = {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            day: date.getDate(),
        };
        // eslint-disable-next-line no-undef
        mtdOnergy.JsEvtSetItemValue('data_lote', dt_obj);
    }
};

let aplicarNumeroLote = async () => {
    // eslint-disable-next-line no-undef
    await mtdOnergy.JsEvtGetParentRefID();
    // eslint-disable-next-line no-undef
    mtdOnergy.JsEvtSetItemValue('CDE__status_lote', 'Procesado');

    // eslint-disable-next-line no-undef
    let getNumeroLote = await mtdOnergy.JsEvtGetFeedData({
        fdtID: idAsignarActividadporLotes,
    });
    if (getNumeroLote.length == undefined || getNumeroLote.length == 0) {
        // eslint-disable-next-line no-undef
        mtdOnergy.JsEvtSetItemValue('CDE__numero_lote', 'LOT0001');
    } else {
        for (let item in getNumeroLote) {
            if (onergyCtx.fedid != getNumeroLote[item].id) {
                // eslint-disable-next-line no-undef
                let numeroLote = mtdOnergy.JsEvtGetItemValue('CDE__numero_lote');
                let objNumeroLote = await getNumeroLote.filter((item) => item.urlJsonContext.CDE__numero_lote == numeroLote);
                if (numeroLote.length > 0) {
                    if (objNumeroLote.urlJsonContext.CDE__numero_lote == numeroLote) {
                        return;
                    } else {
                        // eslint-disable-next-line no-undef
                        mtdOnergy.JsEvtSetItemValue('CDE__numero_lote', 'LOT000' + (getNumeroLote.length + 1));
                    }
                } else {
                    // eslint-disable-next-line no-undef
                    mtdOnergy.JsEvtSetItemValue('CDE__numero_lote', 'LOT000' + (getNumeroLote.length + 1));
                }
            }
        }
    }
};

mainMethod();
