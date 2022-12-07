// JavaScript source code
//Envio de Email
function init() {
    var json = JSON.parse(context.GetContext());

    if (json.init === 'mail') {
        //var cb = "https://gateway.taxfy.com.br/cb/hook/nfse/" + json.subid + "/1/docsia?subscription-key=7a6d55a072cf409982d762fa0a6f08c1";
        var cb = 'https://fntaxfyweb.azurewebsites.net/api/hook/nfse/' + json.subid + '/1/docsia';

        log.write(JSON.stringify(json.nfse_tela));
        var jsonmail = JSON.parse(json.mail);
        jsonmail.url_retorno = cb;
        id = integrations.DocsIAMailInput(
            JSON.stringify(jsonmail),
            json.subid,
            'NFSE',
            context.GetConfigData(json.subid, 'docsia_client_id'),
            context.GetConfigData(json.subid, 'docsia_client_secret')
        );
        return id;
    }
}
