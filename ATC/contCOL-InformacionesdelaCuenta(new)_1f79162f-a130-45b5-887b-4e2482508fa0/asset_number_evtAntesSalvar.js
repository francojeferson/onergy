let mainMethod = () => {
    let registroSalvo = mtdOnergy.JsEvtGetItemValue('registro_salvo');
    if (!registroSalvo || registroSalvo == 'nao') {
        mtdOnergy.JsEvtSetItemValue('registro_salvo', 'sim');
    }

    mtdOnergy.JsEvtSubmitForm();
};

mainMethod();
