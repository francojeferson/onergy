// eslint-disable-next-line no-unused-vars
const idInformacionesdelaCuenta = '1f79162f-a130-45b5-887b-4e2482508fa0';
const idProvedor = '4783ca0b-357d-42ab-a5c8-3328ee315f86';

let mainMethod = async () => {
    await validarNomeProvedor();
};

// Valida o nome do provedor
let validarNomeProvedor = async () => {
    // eslint-disable-next-line no-undef
    let nomeProvedor = mtdOnergy.JsEvtGetItemValue('prvd_id');
    // eslint-disable-next-line no-undef
    let nomeProvedorCache = mtdOnergy.JsEvtGetItemValue('nome_provedor_id_cache');

    // Verifica se o nome do provedor foi alterado e se foi, atualiza o cache
    if (nomeProvedor != nomeProvedorCache) {
        // eslint-disable-next-line no-undef
        mtdOnergy.JsEvtSetItemValue('nome_provedor_id_cache', nomeProvedor);

        // Verifica se o nome do provedor foi informado e se foi, busca o provedor no grid provedores
        if (nomeProvedor) {
            // eslint-disable-next-line no-undef
            let objProvedor = await mtdOnergy.JsEvtGetFeedData({
                fdtID: idProvedor,
                filter: gerarFiltro('_id', nomeProvedor),
            });

            // Verifica se o provedor foi encontrado, se sim, atualiza o dia de pagamento com o valor encontrado no provedor
            if (objProvedor && objProvedor.length > 0) {
                // eslint-disable-next-line no-undef
                mtdOnergy.JsEvtSetItemValue('prcs__dia_de_pagamento', objProvedor[0].urlJsonContext.dia_de_vencimento);
            }
        }
    }
};

// Cria um filtro para o campo informado e retorna o filtro
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
