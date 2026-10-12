// eslint-disable-next-line no-unused-vars
const idInformacionesdelaCuenta = '1f79162f-a130-45b5-887b-4e2482508fa0';
const idFrequencia = '2d4edce3-7131-413a-98e5-35d328daef7f';

let mainMethod = async () => {
    await limparDocsiaStatus();

    let resultFrequenciaPagto = await validarFrequenciaPagto();
    let resultDiaPagto = await validarDiaPagto();

    if (resultFrequenciaPagto && resultDiaPagto) {
        // eslint-disable-next-line no-undef
        mtdOnergy.JsEvtSetItemValue('prcs__ocultar_campo', 'nao');
    } else {
        // eslint-disable-next-line no-undef
        mtdOnergy.JsEvtSetItemValue('prcs__ocultar_campo', 'sim');
    }
};

// Limpa campos Docsia Status
let limparDocsiaStatus = async () => {
    // eslint-disable-next-line no-undef
    mtdOnergy.JsEvtSetItemValue('status_docsia', '');
    // eslint-disable-next-line no-undef
    mtdOnergy.JsEvtSetItemValue('status_docsia_Desc', '');
    // eslint-disable-next-line no-undef
    mtdOnergy.JsEvtSetItemValue('status_docsia_msg', '');
};

let validarFrequenciaPagto = async () => {
    // eslint-disable-next-line no-undef
    let frequenciaPagto = mtdOnergy.JsEvtGetItemValue('frequencia_de_pagamento');
    // eslint-disable-next-line no-undef
    let frequenciaPagtoCache = mtdOnergy.JsEvtGetItemValue('prcs__frequencia_pagamento_cache');

    if (frequenciaPagto != frequenciaPagtoCache) {
        // eslint-disable-next-line no-undef
        mtdOnergy.JsEvtSetItemValue('prcs__frequencia_pagamento_cache', frequenciaPagto);

        if (frequenciaPagto) {
            // eslint-disable-next-line no-undef
            let objFrequencia = await mtdOnergy.JsEvtGetFeedData({
                fdtID: idFrequencia,
                filter: gerarFiltro('_id', frequenciaPagto),
            });

            if (objFrequencia && objFrequencia.length > 0) {
                // eslint-disable-next-line no-undef
                mtdOnergy.JsEvtSetItemValue('frequencia_de_pagamento', objFrequencia[0].urlJsonContext.frequencia_de_pagamento);
            }
        }
    }
};

let validarDiaPagto = async () => {
    // eslint-disable-next-line no-undef
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
