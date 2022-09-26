async function DeletarRegistro(data, ursid, fedid) {
    const Ocp_Apim_Subscription_Key = '1ae92442465648cf8607540e41376936'; //Excluir registro, feedView, ocp-apim-subscription-key

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
