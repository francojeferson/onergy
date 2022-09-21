let mainMethod = () => {
    let contextData = mtdOnergy.JsEvtGetCurrentCtx();
    mtdOnergy.JsEvtSetItemValue('onergyteam_equipe', contextData.userContext.perfil[0].perfilName);
    mtdOnergy.JsEvtSetItemValue('onergyteam_id', contextData.userContext.perfil[0].grpId);
};
mainMethod();
