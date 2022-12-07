function init() {
    var json = JSON.parse(context.GetContext());
    var datatosend = undefined;
    var assid = 'f8387e95-c604-454b-820e-e01c8dbedfcf'; //DEV TEMPLATES
    var usrid = '31805071-d12a-43a0-9651-9f67f9ea39e7'; //DEV TEMPLATES
    var fdtid = '968cf322-ea7b-4c59-96f9-f278fe8b5bfc'; //PROC RESP X CNPJ
    if (json.init === 'NFSE') {
        log.write(JSON.stringify(json.nfse_tela));
        if (json.nfse_tela.aliquota == undefined) json.nfse_tela.aliquota = 0;
        let origemNota = json.nfse_tela.origemNota;
        if (origemNota === 'RPARJ') {
            origemNota = 'RPA';
        } else if (origemNota !== 'Web Service' && origemNota !== 'DocsIA') {
            origemNota = 'Web Service';
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
            dtEmissaoNf: taxfyjs.ConvertDatetimeToString(json.nfse_tela.dtEmit),
            dtEntrada: taxfyjs.ConvertDatetimeToString(json.nfse_tela.dtInc),
            tipo: 'NFSE',
            conteudo: json.nfse_tela.discriminacao,
            urlxml: json.nfse_tela.urlXml,
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
            //Campos novos
            txOrigemNota: origemNota,
            txValorBaseCalculo: json.nfse_tela.valorBaseCalculo,
            txValorLiquidoNfse: json.nfse_tela.valorLiquidoNfse,
            txVlIrrf: json.nfse_tela.vlIRRF,
            txVlCsll: json.nfse_tela.valorCsll,
            txVlCofins: json.nfse_tela.valorCofins,
            txVlPis: json.nfse_tela.valorPis,
            txValorIss: json.nfse_tela.valorISS,
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
        };
        //   public string Onergy(string apikey, string id, string assid, string usrid, string fdtid, string json, string ukfield = "")
        id = integrations.Onergy(
            json.nfse_tela.subId,
            'NFSE',
            'apik',
            json.nfse_tela.idp,
            assid,
            usrid,
            fdtid, //template fdtid
            JSON.stringify(datatosend),
            'chaveNfe'
        );
        return id;
    } else if (json.init === 'NFE') {
        log.write(JSON.stringify(json.telanfe));
        datatosend = {
            chaveNfe: json.telanfe.chaveNfe,
            cnpj: json.telanfe.cnpjEmit,
            razaoSocial: json.telanfe.nomeEmit,
            numeroNf: json.telanfe.numeroNfe,
            dest_cnpj: json.telanfe.cnpjDest,
            razao_social_tomador: json.telanfe.nomeDest,
            valorNFe: json.telanfe.value,
            urlpdf:
                'https://gateway.taxfy.com.br/v1/api/nfe/danfe?subscription-key=4220c09ea0dd470cb3c130dbbf0863d2&cusid=' +
                json.telanfe.cusId +
                '&id=' +
                json.telanfe.id +
                '&subid=' +
                json.telanfe.subId,
            dtEmissaoNf: json.telanfe.dtEmit,
            dtEntrada: json.telanfe.dtInc,
            tipo: 'NFE',
            conteudo: json.nfe,
            urlxml: json.telanfe.urlXml,
        };
        id = integrations.Onergy(json.telanfe.subId, 'NFE', 'apik', json.id, assid, usrid, fdtid, JSON.stringify(datatosend), 'chaveNfe');
        return id;
    } else if (json.init === 'CTE') {
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
            urlpdf:
                'https://gateway.taxfy.com.br/v1/api/cte/dacte?subscription-key=4220c09ea0dd470cb3c130dbbf0863d2&cusid=' +
                json.telacte.CusId +
                '&id=' +
                json.telacte.Id +
                '&subid=' +
                json.telacte.SubId,
            dtEmissaoNf: json.telacte.DtEmit,
            dtEntrada: json.telacte.Dtinc,
            tipo: 'CTE',
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
            //urldanfe: 'https://gateway.taxfy.com.br/v1/api/nfe/danfe?subscription-key=4220c09ea0dd470cb3c130dbbf0863d2&cusid=' + json.telacte.CusId + '&id=' + nfeId + '&subid=' + json.telacte.SubId,
            urldacte:
                'https://gateway.taxfy.com.br/v1/api/cte/dacte?subscription-key=4220c09ea0dd470cb3c130dbbf0863d2&cusid=' +
                json.telacte.CusId +
                '&id=' +
                json.telacte.Id +
                '&subid=' +
                json.telacte.SubId,
        };
        id = integrations.Onergy(json.telacte.SubId, 'CTE', 'apik', json.id, assid, usrid, fdtid, JSON.stringify(datatosend), 'chaveNfe');
        return id;
    } else if (json.init === 'FATURA') {
        datatosend = {
            conteudo: json.content,
            tipo: 'FATURA',
            request_id: json.content.request_id,
            idp: json.idp,
        }; //string
        id = integrations.Onergy(
            json.subid,
            'FATURA',
            'apik',
            json.idp,
            assid,
            usrid,
            '02d8e3b6-3f9e-41c5-b839-156cef567a1c', //UPLOAD DE DOCUMENTOS (DOCSIA)
            JSON.stringify(datatosend),
            'request_id'
        );
        return id;
    }
    //FIM init
}
//
//     else if (json.init === "NFE-PROD-ALIQ") {
//         log.write(JSON.stringify(json.telanfe));
//         datatosend = {
//             cnpj: json.produto.cnpj_emissor,
//             razaoSocial: json.produto.razao_social_emissor,
//             codigo_produto_emissor: json.produto.codigo_produto_emissor,
//             codigo_produto_destinatario: json.produto.codigo_produto_destinatario,
//             nome_produto_emissor: json.produto.nome_produto_emissor,
//             nome_produto_destinatario: json.produto.nome_produto_destinatario,
//             ean_emissor: json.produto.ean_emissor,
//             ean_destinatario: json.produto.ean_destinatario,
//             ncm: json.produto.ncm,
//             ncm_destinatario: json.produto.ncm_destinatario,
//             cst_icms: json.produto.detalhes.CST_ICMS,
//             cst_pis: json.produto.detalhes.CST_PIS,
//             cst_ipi: json.produto.detalhes.CST_IPI,
//             cst_cofins: json.produto.detalhes.CST_COFINS,
//             aliq_icms: json.produto.detalhes.ALIQ_ICMS,
//             aliq_pis: json.produto.detalhes.ALIQ_PIS,
//             aliq_ipi: json.produto.detalhes.ALIQ_IPI,
//             aliq_cofins: json.produto.detalhes.ALIQ_COFINS,
//             uf_origem: json.produto.detalhes.UF_ORIGEM,
//             uf_destino: json.produto.detalhes.UF_DESTINO,
//             cfop_emissor: json.produto.detalhes.cfop_emissor,
//             cfop_destinatario: json.produto.detalhes.cfop_destinatario,
//             dtalt: json.produto.detalhes.dtAte,
//             tipo: "NFE-PROD"
//         };
//         id = integrations.Onergy("apik", json.id,
//   "7bc8ee17-f738-4085-958f-9fc27a737cc7",
//             "9eb545b7-ef0e-4c79-b1a9-e706dfd63d1b",
//             "a6c22184-c4bd-4af4-8467-d637220ed81a",
//             JSON.stringify(datatosend), "");
//         return id;
//     }
//     else if (json.init === "NFSE-CODSERVICO-ALIQ") {
//         log.write(JSON.stringify(json.telanfe));
//         datatosend = {
//             cnpj: json.fornecedor.cnpj,
//             razaoSocial: json.fornecedor.razao_social,
//             aliqISS: json.aliq.aliqISS,
//             codservico: json.aliq.CodServico,
//             dtalt: json.aliq.dtReg,
//             tipo: "NFSE-CODSERVICO"
//         };
//         id = integrations.Onergy("apik", json.id,
//        "7bc8ee17-f738-4085-958f-9fc27a737cc7",
//             "9eb545b7-ef0e-4c79-b1a9-e706dfd63d1b",
//             "a6c22184-c4bd-4af4-8467-d637220ed81a",
//             JSON.stringify(datatosend), "");
//         return id;
//     }
