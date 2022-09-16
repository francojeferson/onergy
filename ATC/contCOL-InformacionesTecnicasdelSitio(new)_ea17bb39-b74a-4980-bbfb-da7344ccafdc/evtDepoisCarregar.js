let mainMethod = () => {
    let onergyCtx = mtdOnergy.JsEvtGetCurrentCtx();
    mtdOnergy.JsEvtSetItemValue('id_sitio', onergyCtx.ID_ONE_REF);
};

mainMethod();
