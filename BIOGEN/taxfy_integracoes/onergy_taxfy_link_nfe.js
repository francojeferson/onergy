function init() {
    var json = JSON.parse(context.GetContext());

    if (json.init === 'POST_TAXFY_LINK') {
        var cb =
            'https://gateway.taxfy.com.br/v1/api/taxanalitics/' +
            json.nfetela.chaveNfe +
            '/' +
            json.config.CUS_ID +
            '/' +
            json.config.SUB_ID +
            '?subscription-key=7a6d55a072cf409982d762fa0a6f08c1';

        var datatosend = {
            ContribuinteIpi: json.config.ContribuinteIpi,
            OperaEntidadesGovernamentais: json.config.OperaEntidadesGovernamentais,
            OperationType: json.nfetela.TipoNota == 'Entrada' ? '30431B30-A83A-4ABB-93DF-F6D621AE38C9' : 'BD6AF85D-085A-47EE-983A-22743EA30033',
            VendeParaLojaFranca: json.config.VendeParaLojaFranca,
            VendeInsumos: json.config.VendeInsumos,
            TipoTributacao: taxfyjs.ConvertStringToGuid(json.config.TipoTributacao),
            TipoSegmentoEstabelecimento: taxfyjs.ConvertStringToGuid(json.config.TipoSegmentoEstabelecimento),
            TipoRegimeEspecial: taxfyjs.ConvertStringToGuid(json.config.TipoRegimeEspecial),
            TipoEstabelecimento: taxfyjs.ConvertStringToGuid(json.config.TipoEstabelecimento),
            SubscriptionId: json.nfetela.subId,
            DocVersion: json.config.DocVersion,
            GlobalRules: json.config.GlobalRules,
            SubscriptionRules: json.config.SubscriptionRules,
            fileUrl: json.nfetela.urlXml,
            CallbackUrl: cb,
        };

        var content = taxfyjs.JsonSerialize(datatosend);

        var id = integrations.TaxfyLink(content, json.nfetela.subId, 'NFE');

        return id;
    }
}
