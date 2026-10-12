// eslint-disable-next-line no-unused-vars
const idInformacionesTecnicasdelSitio = 'ea17bb39-b74a-4980-bbfb-da7344ccafdc';

let mainMethod = () => {
    // eslint-disable-next-line no-undef
    let onergyCtx = mtdOnergy.JsEvtGetCurrentCtx();
    // eslint-disable-next-line no-undef
    mtdOnergy.JsEvtSetItemValue('id_sitio', onergyCtx.ID_ONE_REF);
};

mainMethod();
