// Excluir um registro no onergy com filtro

let postInfoDelet = {
    UrlJsonContext: {
        id_user_resp_delet: data.usrid,
    },
    BlockCount: 1,
};

let excluirFilter = JSON.stringify([{ FielName: 'id_upload_planilha', Type: 'string', FixedType: 'string', Value1: data.onergy_js_ctx.fedid }]);

onergy_updatemany({
    fdtid: minhasAtividadesFdtid,
    assid: data.onergy_js_ctx.assid,
    usrid: data.onergy_js_ctx.usrid,
    data: JSON.stringify(postInfoDelet),
    filter: JSON.stringify([
        { FielName: 'cnpjs_empresa_id', Type: 'string', FixedType: 'string', Value1: data.fedid },
        { FielName: 'dt_inicio_atividade', Type: 'date', FixedType: 'date', Value1: data.dt_inicio_periodicidade, Value2: data.dt_termino_periodicidade },
    ]),
    isMultiUpdate: true,
});
