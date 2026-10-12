//Onergy - Gestão de Documentos: rev.31/05/2023
function init() {
    var json = JSON.parse(context.GetContext());
    var datatosend = undefined;

    //ALTERAR POR AMBIENTE
    var assid = "f8387e95-c604-454b-820e-e01c8dbedfcf"; // Exemplo: assid = "544be861-f217-4d4e-9daa-8a22094948f6"
    var usrid = "31805071-d12a-43a0-9651-9f67f9ea39e7"; // Exemplo: usrid = "0a9a1a73-b9bc-4489-bb94-790b3173f382"
    var subscriptionKey = "a17aed784f454e84b04723adab9484cf"; // Exemplo: Ocp-Apim-Subscription-Key = "175ec1230b7145f4a1f5289fff5086a9" fornecido pelo TAXFY LINK

    //NFE, NFSE e CTE Envia:
    const fdtPROCxRESP = "968cf322-ea7b-4c59-96f9-f278fe8b5bfc"; // PROC RESP X CNPJ

    //FATURAS (AGUA, ENERGIA, TELECOM, ...) Envia:
    const fdtUploadDocumentos = "02d8e3b6-3f9e-41c5-b839-156cef567a1c"; // UPLOAD DE DOCUMENTOS (DOCSIA)
    if (json.init === "NFSE") {
        log.write(JSON.stringify(json.nfse_tela));
        if (json.nfse_tela.aliquota == undefined)
            json.nfse_tela.aliquota = 0;

        let origemNota = json.nfse_tela.origemNota;
        if (origemNota === "RPARJ") {
            origemNota = "RPA";
        }

        else if (origemNota !== "Web Service" && origemNota !== "DocsIA") {
            origemNota = "Web Service";
        }

        datatosend = {
            chaveNfe: json.nfse_tela.chaveAutoGerada,
            cnpj: json.nfse_tela.cnpjpfPrest,
            razaoSocial: json.nfse_tela.razaoSocialPrest,
            numeroNf: json.nfse_tela.nrNFse,
            dest_cnpj: json.nfse_tela.cnpjCpfTomad,
            razao_social_tomador: json.nfse_tela.nomeTomad,
            valorNFe: json.nfse_tela.valorServico,
            urlpdf: json.nfse_tela.urlPfd,
            urlPdfOriginal: json.nfse_tela.urlPdfOriginal,
            dtEmissaoNf: taxfyjs.ConvertDatetimeToString(json.nfse_tela.dtEmit),
            dtEntrada: taxfyjs.ConvertDatetimeToString(json.nfse_tela.dtInc),
            tipo: "NFSE",
            conteudo: json.nfse_tela.discriminacao,
            urlxml: json.nfse_tela.urlXml,
            urlXmlTaxfy: json.nfse_tela.urlXmlTaxfy,
            codServico: json.nfse_tela.codService,
            codigo_servico_desc: json.nfse_tela.descService,
            munPrestador: json.nfse_tela.prestEndCodMunicipio,
            munTomador: json.nfse_tela.tomadEndCodMunicipio,
            codIBGEMunicipioNota: json.nfse_tela.codIBGEMunicipioNota,
            municipioPrestacao: json.nfse_tela.municipioPrestacao,
            nomeMunicipioPrestacao: json.nfse_tela.nomeMunicipioPrestacao,
            ISSRetido: json.nfse_tela.ISSRetido,
            prestadorCEP: json.nfse_tela.prestadorCEP,
            po: json.nfse_tela.nrPedido,
            dtCancelamento: json.nfse_tela.dtCancelamento,
            descricao_de_servico: json.nfse_tela.descService,

            //Campos novos
            txOrigemNota: origemNota,
            txValorBaseCalculo: json.nfse_tela.valorBaseCalculo,
            txValorLiquidoNfse: json.nfse_tela.valorLiquidoNfse,
            txVlIrrf: json.nfse_tela.vlIRRF,
            txVlCsll: json.nfse_tela.valorCsll,
            txVlCofins: json.nfse_tela.valorCofins,
            txVlPis: json.nfse_tela.valorPis,
            txValorIss: json.nfse_tela.valorISS,
            txValorISSRetido: json.nfse_tela.valorISSRetido,
            txVlInss: json.nfse_tela.vlINSS,
            txVlDeducoes: json.nfse_tela.valorDeducoes,
            txISSAliq: json.nfse_tela.aliquota,
            txValorTotalRecebido: json.nfse_tela.valorTotalRecebido,
            txSerieNFse: json.nfse_tela.serieNFse,
            txRpsNumero: json.nfse_tela.rpsNumero,
            txRpsSerie: json.nfse_tela.rpsSerie,
            txPrestEndereco: json.nfse_tela.prestEndereco,
            txPrestEndTipoLogradouro: json.nfse_tela.prestEndTipoLogradouro,
            txPrestEndNumero: json.nfse_tela.prestEndNumero,
            txPrestEndComplemento: json.nfse_tela.prestEndComplemento,
            txPrestEndBairro: json.nfse_tela.prestEndBairro,
            txPrestEndUf: json.nfse_tela.prestEndUf,
            txPrestEndCodMunicipio: json.nfse_tela.prestEndCodMunicipio,
            txPrestEndNomeMunicipio: json.nfse_tela.prestEndNomeMunicipio,
            txPrestEndCep: json.nfse_tela.prestEndCep,
            txPrestEndTelefone: json.nfse_tela.prestEndTelefone,
            txPrestEndEmail: json.nfse_tela.prestEndEmail,
            txTomadEndereco: json.nfse_tela.tomadEndereco,
            txTomadEndTipoLogradouro: json.nfse_tela.tomadEndTipoLogradouro,
            txTomadEndNumero: json.nfse_tela.tomadEndNumero,
            txTomadEndBairro: json.nfse_tela.tomadEndBairro,
            txTomadEndCodMunicipio: json.nfse_tela.tomadEndCodMunicipio,
            txTomadEndNomeMunicipio: json.nfse_tela.tomadEndNomeMunicipio,
            txPrestEndInscEstadual: json.nfse_tela.prestEndInscEstadual,
            txPrestEndInscMunicipal: json.nfse_tela.prestEndInscMunicipal,
            txTomadEndUf: json.nfse_tela.tomadEndUf,
            txTomadEndCep: json.nfse_tela.tomadEndCep,
            txTomadEndPaisObra: json.nfse_tela.tomadEndPaisObra,
            txTomadEndTelefone: json.nfse_tela.tomadEndTelefone,
            txTomadEndEmail: json.nfse_tela.tomadEndEmail,
            txTomadEndInscEstadual: json.nfse_tela.tomadEndInscEstadual,
            txTomadEndInscMunicipal: json.nfse_tela.tomadEndInscMunicipal,

            txCodigoVerificacao: json.nfse_tela.CodigoVerificacao,
            txTomadEndComplemento: json.nfse_tela.tomadEndComplemento,
            txNrNfseSubst: json.nfse_tela.nrNfseSubst,
            txOutrasInformacoes: json.nfse_tela.outrasInformacoes,

            txIdlegado: json.nfse_tela.idlegado,
            request_id: json.nfse_tela.docsIaRequestId,

            idp: json.nfse_tela.idp

        };

        let idPost = "";

        if (json.nfse_tela.idOnergy) {
            idPost = json.nfse_tela.idOnergy;
        }

        idPost = idPost.replace('\"', '').replace('\"', '');

        let bool_doc_cancelado = datatosend.dtCancelamento != null;
        if (bool_doc_cancelado) {
            idPost = null;
        }

        //   public string Onergy(string apikey, string id, string assid, string usrid, string fdtid, string json, string ukfield = "")
        id = integrations.Onergy(json.nfse_tela.subId, "NFSE",
            "apik", idPost,
            assid,
            usrid,
            fdtPROCxRESP,//template fdtid
            JSON.stringify(datatosend), "chaveNfe");
        return id;
    }

    else if (json.init === "NFE") {
        log.write(JSON.stringify(json.telanfe));
        datatosend = {
            chaveNfe: json.telanfe.chaveNfe,
            cnpj: json.telanfe.cnpjEmit,
            razaoSocial: json.telanfe.nomeEmit,
            numeroNf: json.telanfe.numeroNfe,
            dest_cnpj: json.telanfe.cnpjDest,
            razao_social_tomador: json.telanfe.nomeDest,
            valorNFe: json.telanfe.value,
            urlpdf: "https://gateway.taxfy.com.br/v1/api/nfe/danfe?subscription-key=" + subscriptionKey + "&cusid=" + json.telanfe.cusId + "&id=" + json.telanfe.id + "&subid=" + json.telanfe.subId,
            dtEmissaoNf: json.telanfe.dtEmit,
            dtEntrada: json.telanfe.dtInc,
            tipo: "NFE",
            conteudo: json.nfe,
            urlxml: json.telanfe.urlXml,
            idp: json.telanfe.idp,
            cancelada: json.telanfe.cancelada,
            dtCancelada: json.telanfe.cancelada
        };

        // pegar id de resposta do onergy referente a ultima integração
        // json.telanfe.idOne

        let idPost = "";

        if (json.telanfe.idOne) {
            json.telanfe.idOne;
        }

        idPost = idPost.replace('\"', '').replace('\"', '');

        let bool_doc_cancelado = datatosend.dtCancelada != null;
        if (bool_doc_cancelado) {
            idPost = null;
        }

        id = integrations.Onergy(json.telanfe.subId, "NFE",
            "apik", idPost,
            assid,
            usrid,
            fdtPROCxRESP,
            JSON.stringify(datatosend), "chaveNfe");

        return id;
    }

    else if (json.init === "CTE") {

        log.write(JSON.stringify(json.telacte));

        var cte = taxfyjs.GetCteProc(json.telacte.SubId, json.telacte.Chavecte);
        var cteObj = JSON.parse(cte);
        var cnpjExped = '';
        var razSocialExped = '';
        if (cteObj != null) {
            if (cteObj.CTe.InfCte.Exped != null) {
                cnpjExped = cteObj.CTe.InfCte.Exped.CNPJ;
                razSocialExped = cteObj.CTe.InfCte.Exped.XNome;
            }
        }
        var nfeId = '';
        datatosend = {
            chaveNfe: json.telacte.Chavecte,
            cnpj: json.telacte.CnpjEmit,
            razaoSocial: json.telacte.NomeEmit,
            numeroNf: json.telacte.Nrdocumento,
            dest_cnpj: json.telacte.CnpjDest,
            valorNFe: json.telacte.Value,
            urlpdf: "https://gateway.taxfy.com.br/v1/api/cte/dacte?subscription-key=" + subscriptionKey + "&cusid=" + json.telacte.CusId + "&id=" + json.telacte.Id + "&subid=" + json.telacte.SubId,
            dtEmissaoNf: json.telacte.DtEmit,
            dtEntrada: json.telacte.Dtinc,
            tipo: "CTE",
            conteudo: json.cte,
            urlxml: json.telacte.Urlxml,
            CnpjEmit: json.telacte.CnpjEmit,
            Razao_socialEmit: json.telacte.NomeEmit,
            CnpjReceb: json.telacte.CNPJReceb == null ? '' : json.telacte.CNPJReceb,
            Razao_socialReceb: json.telacte.NomeReceb == null ? '' : json.telacte.NomeReceb,
            CnpjDest: json.telacte.CnpjDest == null ? '' : json.telacte.CnpjDest,
            Razao_socialDest: json.telacte.NomeDest == null ? '' : json.telacte.NomeDest,
            CnpjRemet: json.telacte.CNPJRemet == null ? '' : json.telacte.CNPJRemet,
            Razao_socialRemet: json.telacte.NomeRemet == null ? '' : json.telacte.NomeRemet,
            CnpjExped: cnpjExped,
            Razao_socialExped: razSocialExped,
            CnpjTomad: json.telacte.CNPJTomad == null ? '' : json.telacte.CNPJTomad,
            Razao_socialTomad: json.telacte.NomeTomad == null ? '' : json.telacte.NomeTomad,
            ndoc: json.telacte.Nrdocumento,
            cfop: json.telacte.CFOP,
            valorCte: json.telacte.Value,
            dtEntrada: json.telacte.DtEmit,
            idTaxOne: json.telacte.Id.toString(),
            chavecte: json.telacte.Chavecte,
            chavesnfe: json.telacte.Nfes,
            content: cteObj,
            cancelada: json.telacte.cancelada != null,
            dtcanc: json.telacte.cancelada != null ? json.telacte.cancelada.dthCancelamento.toString() : '',
            urlXml: json.telacte.Urlxml,
            urldacte: "https://gateway.taxfy.com.br/v1/api/cte/dacte?subscription-key=" + subscriptionKey + "&cusid=" + json.telacte.CusId + "&id=" + json.telacte.Id + "&subid=" + json.telacte.SubId,
            idp: json.telacte.idp
        };

        // pegar id de resposta do onergy referente a ultima integração
        // json.telacfe.idOnergy

        let idPost = "";

        if (json.telacte.idOnergy) {
            idPost = json.telacte.idOnergy;
        }

        idPost = idPost.replace('\"', '').replace('\"', '');

        let bool_doc_cancelado = datatosend.cancelada;
        if (bool_doc_cancelado) {
            idPost = null;
        }

        id = integrations.Onergy(json.telacte.SubId, "CTE",
            "apik", idPost,
            assid,
            usrid,
            fdtPROCxRESP,
            JSON.stringify(datatosend), "chaveNfe");

        return id;
    }

    else if (json.init === "FATURA") {

        datatosend = {
            conteudo: json.content,
            tipo: "FATURA",
            request_id: json.content.request_id,
            idp: json.idp
        }; // string

        id = integrations.Onergy(json.subid, "FATURA",
            "apik", json.id,
            assid,
            usrid,
            fdtUploadDocumentos, // UPLOAD DE DOCUMENTOS (DOCSIA)
            JSON.stringify(datatosend), "request_id");
        return id;
    }

}
