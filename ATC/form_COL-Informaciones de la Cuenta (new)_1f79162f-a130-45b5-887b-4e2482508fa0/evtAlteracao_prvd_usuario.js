let mainMethod = async () => {
    await limparDocsiaStatus();
};

// Limpa campos Docsia Status
let limparDocsiaStatus = async () => {
    mtdOnergy.JsEvtSetItemValue('status_docsia', '');
    mtdOnergy.JsEvtSetItemValue('status_docsia_Desc', '');
    mtdOnergy.JsEvtSetItemValue('status_docsia_msg', '');
};

mainMethod();
