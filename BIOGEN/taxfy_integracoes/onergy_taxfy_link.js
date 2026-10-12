function init() {
    var json = JSON.parse(context.GetContext());
    var datatosend = undefined;
    var id = '';

    //var onergy_assid = "42cf16d7-68c2-467c-ac9c-48c17014d8c5";      //TEMPLATES
    //var onergy_usrid = "f05a8881-5e22-46a7-93b2-f097f69f2cfb";      //TEMPLATES
    var onergy_assid = 'f8387e95-c604-454b-820e-e01c8dbedfcf'; //OXITENO HOMOL
    var onergy_usrid = '31805071-d12a-43a0-9651-9f67f9ea39e7'; //OXITENO HOMOL

    if (json.init === 'TAXFY_LINK') {
        let fdtid = '89c6134b-e39b-48c8-bd79-95777e2a0555';

        datatosend = {
            cus_id: json.itemvalid.cus_id,
            sub_id: json.itemvalid.sub_id,
            chave: json.itemvalid.chave,
            item: json.itemvalid.item,
            chaveItem: json.itemvalid.chaveItem,

            DocumentNumber: json.itemvalid.DocumentNumber,
            DocumentSeries: json.itemvalid.DocumentSeries,
            DocumentStatus: json.itemvalid.DocumentStatus,
            CompetenceDate: json.itemvalid.CompetenceDate,
            DtInit: json.itemvalid.DtInit,
            DtFim: json.itemvalid.DtFim,
            dthEmi: json.itemvalid.dthEmi,
            CNPJ: json.itemvalid.CNPJ,
            NomeCnpj: json.itemvalid.NomeCnpj,
            Status: json.itemvalid.Status,
            StatusDesc: json.itemvalid.StatusDesc,
            UrlXml: json.itemvalid.UrlXml,
            ValorItem: json.itemvalid.ValorItem,
            TotalNf: json.itemvalid.TotalNf,
            CanEditDoc: json.itemvalid.CanEditDoc,
            ContribuinteIpi: json.itemvalid.ContribuinteIpi,
            OperaEntidadesGovernamentais: json.itemvalid.OperaEntidadesGovernamentais,
            VendeInsumos: json.itemvalid.VendeInsumos,
            VendeParaLojaFranca: json.itemvalid.VendeParaLojaFranca,

            capaNf: json.itemvalid.capaNf,
            itemNf: json.itemvalid.itemNf,
            Rules: json.itemvalid.Rules,
        };

        id = integrations.Onergy(
            json.itemvalid.sub_id,
            'TAXFY_LINK',
            'apik',
            json.id,
            onergy_assid,
            onergy_usrid,
            fdtid,
            JSON.stringify(datatosend),
            'chaveItem'
        );

        // //TEMPLATES
        // id = integrations.Onergy(json.itemvalid.sub_id, 'TAXFY_LINK',
        //         'apik', json.id,
        //         "42cf16d7-68c2-467c-ac9c-48c17014d8c5", //ASSID
        //         "f05a8881-5e22-46a7-93b2-f097f69f2cfb", //USRID
        //         fdtid,
        //         JSON.stringify(datatosend),"chaveItem");

        return id;
    }
}
