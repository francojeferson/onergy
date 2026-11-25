const axios = require('axios');

async function DeletarRegistro(data, ursid, fedid) {
    const Ocp_Apim_Subscription_Key = process.env.ONERGY_SUBSCRIPTION_KEY; //Excluir registro, feedView, ocp-apim-subscription-key

    await axios({
        url: `https://gateway.onergy.com.br/homol/api/Feed/FeedView?usr_id=${ursid}&fedid=[%22${fedid}%22]`,
        method: 'POST',
        data: '',
        headers: { 'Ocp-Apim-Subscription-Key': Ocp_Apim_Subscription_Key },
        contentType: 'application/json',
    }).then(
        (response) => {
            strRespToken = response.data;
        },
        (error) => {
            strRespToken = '';
        }
    );
}
