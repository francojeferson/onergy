const onergy = require('../../onergy/onergy-client');

async function onergy_get(args) {
    let r = await onergy.onergy_get(args);
    return JSON.stringify(r);
}

let fdtidDoCardDeBusca = '';

let strFiltro = JSON.stringify([{ FielName: 'campo_de_busca', Type: 'string', FixedType: 'string', Value1: valor_do_filtro }]);

let cadastroLOG = await getOnergyItem(fdtidDoCardDeBusca, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, strFiltro);

async function getOnergyItem(fdtid, assid, usrid, filtro) {
    let keepSearching = true;
    let skip = 0;
    take = 500;
    let result = [];
    while (keepSearching) {
        let strPageResp = await onergy_get({
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
    return result;
}
