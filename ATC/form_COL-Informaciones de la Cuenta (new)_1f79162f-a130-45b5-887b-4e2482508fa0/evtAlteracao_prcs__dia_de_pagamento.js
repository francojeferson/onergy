let mainMethod = async () => {
    await limparDocsiaStatus();

    let resultFrequenciaPagto = await validarFrequenciaPagto();
    let resultDiaPagto = await validarDiaPagto();

    if (resultFrequenciaPagto && resultDiaPagto) {
        mtdOnergy.JsEvtSetItemValue('prcs__ocultar_campo', 'nao');
    } else {
        mtdOnergy.JsEvtSetItemValue('prcs__ocultar_campo', 'sim');
    }
};

// Limpa campos Docsia Status
let limparDocsiaStatus = async () => {
    mtdOnergy.JsEvtSetItemValue('status_docsia', '');
    mtdOnergy.JsEvtSetItemValue('status_docsia_Desc', '');
    mtdOnergy.JsEvtSetItemValue('status_docsia_msg', '');
};

let validarFrequenciaPagto = async () => {
    let frequenciaID = '2d4edce3-7131-413a-98e5-35d328daef7f';
    let frequenciaPagto = mtdOnergy.JsEvtGetItemValue('frequencia_de_pagamento');
    let frequenciaPagtoCache = mtdOnergy.JsEvtGetItemValue('prcs__frequencia_pagamento_cache');

    if (frequenciaPagto != frequenciaPagtoCache) {
        mtdOnergy.JsEvtSetItemValue('prcs__frequencia_pagamento_cache', frequenciaPagto);

        if (frequenciaPagto) {
            let objFrequencia = await mtdOnergy.JsEvtGetFeedData({
                fdtID: frequenciaID,
                filter: gerarFiltro('_id', frequenciaPagto),
            });

            if (objFrequencia && objFrequencia.length > 0) {
                mtdOnergy.JsEvtSetItemValue('frequencia_de_pagamento', objFrequencia[0].urlJsonContext.frequencia_de_pagamento);
            }
        }
    }
};

let validarDiaPagto = async () => {
    let diaPago = mtdOnergy.JsEvtGetItemValue('prcs__dia_de_pagamento');

    if (diaPago < 1 || diaPago > 31) {
        return false;
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
