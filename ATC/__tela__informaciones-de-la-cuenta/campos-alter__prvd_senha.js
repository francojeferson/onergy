// eslint-disable-next-line no-unused-vars
const idInformacionesdelaCuenta = '1f79162f-a130-45b5-887b-4e2482508fa0';

let mainMethod = async () => {
    await limparDocsiaStatus();
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

mainMethod();
