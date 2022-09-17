let mainMethod = () => {
    //! Campo usado para bloquear edição de outros campos
    let registroSalvo = mtdOnergy.JsEvtGetItemValue('registro_salvo');
    if (!registroSalvo || registroSalvo == 'nao') {
        mtdOnergy.JsEvtSetItemValue('registro_salvo', 'sim');
    }
    //!

    mtdOnergy.JsEvtSubmitForm();
};

mainMethod();
