function init(json) {
    let data = JSON.parse(json);

    let fdtdIdPost = data.CDPE_id_card;

    let arrayPost = [];

    let strArrExcel = ReadExcelToJson({
        url: data.upload_planilha[0].UrlAzure,
    });
    let dataExcel = JSON.parse(strArrExcel);

    if (dataExcel != null) {
        let nomePlanilha = data.upload_planilha[0].Name;
        let idPlanilha = data.id_upload_planilha;

        let ctxExcel = dataExcel['DADOS_CARGA_EXCEL'];

        if (ctxExcel.length > 0) {
            let arrayObj = ctxExcel[0];

            let fielName = Object.keys(arrayObj);

            for (let x in ctxExcel) {
                let objLine = {
                    nomePlanilhaCarga: nomePlanilha,
                    id_upload_planilha: idPlanilha,
                };

                for (let n in fielName) {
                    let name = fielName[n];
                    let val = ctxExcel[x];
                    objLine[name] = val[name];
                }

                arrayPost.push(objLine);
            }
        } else {
            let postInfo = {
                UrlJsonContext: {
                    status_planilha: 'Erro',
                    status_planilha_desc: 'erro',
                    mensagem_erro: 'Não foi encontrado nenhuma aba com o nome "DADOS_CARGA_EXCEL".',
                },
            };
            onergy_updatemany({
                fdtid: '8b7dc946-2993-44e9-932a-947b77eb44cf',
                assid: data.onergy_js_ctx.assid,
                usrid: data.onergy_js_ctx.usrid,
                data: JSON.stringify(postInfo),
                filter: JSON.stringify([{ FielName: '_id', Type: 'string', FixedType: 'string', Value1: data.id_upload_planilha }]),
                isMultiUpdate: false,
            });

            return true;
        }

        let qtdReg = 0;
        if (arrayPost.length > 0) {
            // validar se existe configuração de duplicidade
            let configDupli = dataExcel['config_duplicidade'];

            qtdReg = arrayPost.length;

            /*
            for (var recIndex in arrayPost) {
                var dta = arrayPost[recIndex];
                let onergySaveData = {
                    fdtid: fdtdIdPost,
                    assid: data.onergy_js_ctx.assid,
                    usrid: data.onergy_js_ctx.usrid,
                    data: JSON.stringify(dta)
                }

                let x = await onergy_save(onergySaveData);
                let y = 0;
            }
            */
            onergy.InsertManyOnergy(arrayPost, fdtdIdPost, data.onergy_js_ctx.usrid);
        }

        let postInfo = {
            UrlJsonContext: {
                status_planilha: 'concluido',
                status_planilha_desc: 'Concluído',
                quantidadeRegistros: qtdReg,
                fdtIdSaveRegistros: fdtdIdPost,
            },
        };
        onergy_updatemany({
            fdtid: '8b7dc946-2993-44e9-932a-947b77eb44cf',
            assid: data.onergy_js_ctx.assid,
            usrid: data.onergy_js_ctx.usrid,
            data: JSON.stringify(postInfo),
            filter: JSON.stringify([{ FielName: '_id', Type: 'string', FixedType: 'string', Value1: data.id_upload_planilha }]),
            isMultiUpdate: false,
        });
    }

    return true;
}

function initBefore(json) {
    //return true;
}
function initDelete(json) {
    //return true;
}
function SetObjectResponse(cond, json, WaitingWebHook) {
    if (WaitingWebHook === undefined) WaitingWebHook = false;

    var obj = {
        cond: cond,
        json: JSON.stringify(json),
        WaitingWebHook: WaitingWebHook,
    };
    return obj;
}

function getOnergyItem(fdtid, assid, usrid, filtro) {
    let keepSearching = true;
    let skip = 0;
    take = 500;
    let result = [];
    while (keepSearching) {
        let strPageResp = onergy_get({
            fdtid: fdtid,
            assid: assid,
            usrid: usrid,
            filter: filtro,
            skip: skip,
            take: take,
        });
        skip += take;
        let pageResp = JSON.parse(strPageResp);
        if (pageResp != null && pageResp.length > 0) {
            keepSearching = pageResp.length == take;
            result = result.concat(pageResp);
        } else {
            keepSearching = false;
        }
    }
    return JSON.stringify(result);
}
