// eslint-disable-next-line no-unused-vars
const idSites = '68f8c3b8-1b4e-40ce-95e8-b72131756087';

let mainMethod = () => {
    // eslint-disable-next-line no-undef
    let contextData = mtdOnergy.JsEvtGetCurrentCtx();
    // eslint-disable-next-line no-undef
    mtdOnergy.JsEvtSetItemValue('onergyteam_equipe', contextData.userContext.perfil[0].perfilName);
    // eslint-disable-next-line no-undef
    mtdOnergy.JsEvtSetItemValue('onergyteam_id', contextData.userContext.perfil[0].grpId);
};
mainMethod();
