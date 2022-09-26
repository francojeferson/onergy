async function init(json) {
    let data = JSON.parse(json);
    let queueName = 'bruno-queue-exec';
    let mainDirEnvio = 'C:\\Users\\MatheusSantos\\Desktop\\ios_chamada\\enviado\\';
    let mainDirRetorno = 'C:\\Users\\MatheusSantos\\Desktop\\ios_chamada\\retorno\\';
    if (!data.CreatedFile) {
        onergy.log('OIS Criando arquivo');
        /*
         Matheus, pra você rodar o ois_fs.CreateFile, você deve enviar uma url e não o conteúdo do arquivo ok. 
         Então neste caso, primeiro vamos chamar um método para criar e salvar o arquivo no azure, 
         Aí depois sim, podemos chamar o método do ois_fs. Mas toma cuidado, este método acima é apenas para ser usado no seu teste.
         
        */
        //O arquivo só será enviado ao azure se ele ainda não tiver sido enviado antes.
        if (!data.url_file) {
            // Este método cria o arquivo no azure, dentro deste método sim, você pode passar o conteúdo
            let tmpFileDir = fileutils.CreateFile(data.teste, '.txt');
            data.url_file = fileutils.UploadFile(tmpFileDir);
        }
        //Agora que eu já tenho uma URL, já posso chamar o ois_fs e salvar o arquivo na máquina do cliente.
        //Primeiro param: Nome da fila de execução;
        //Segundo param: Url do arquivo que deve ser salvo na maquina do usuário;
        //Terceiro param: Diretório que o arquivo será salvo;
        ois_fs.CreateFile(queueName, data.url_file, mainDirRetorno);
        //Este campo apenas marca que o dado já foi enviado ao OIS.
        data.CreatedFile = true;
        data.ReadFile = false;
        data.erro_msg = '';
    }
    // // else if(data.FSC && !data.ReadFile){
    //     onergy.log("OIS lendo arquivo");
    //     /*
    //     Se o dado cair nesta condição, quer dizer que o OIS já processou a criação do arquivo.
    //     Então vamos validar se deu cero ou não a criação do arquivo.
    //     Se estiver ok, vamos chamar a leitura, se deu erro vamos mostrar a mensagem de erro em um campo.
    //     */
    //     //Este primeiro if, valida se deu erro
    //     if(data.FSC.err){
    //         let strErr = data.FSC.err;
    //        data.erro_msg = strErr;
    //        data.CreatedFile = false; //Zeramos o status pra poder reenviar o arquivo;
    //     }
    //     else{
    //         let fileName = fileutils.GetFileNameFromUrl(data.url_file.split("?")[0]);
    //         let fileDir = mainDirEnvio+fileName;
    //         //Primeiro Param: nome da queue de execução do protheus;
    //         //Segundo param:  nome do diretório que o arquivo está salvo;
    //         ois_fs.ReadFile(queueName, fileDir);
    //         data.HasFileContent = false;
    //         data.erro_msg = "";
    //         data.oisFileContent = "";
    //     }
    //     data.ReadFile = true;
    // }
    // else if(data.FSR && !data.HasFileContent){
    //     onergy.log("Validando dados do arquivo Lido");
    //     /*
    //     Se o dado cair nesta condição, quer dizer que o OIS já processou a criação do arquivo.
    //     Então vamos validar se deu cero ou não a criação do arquivo.
    //     Se estiver ok, vamos chamar a leitura, se deu erro vamos mostrar a mensagem de erro em um campo.
    //     */
    //     //Este primeiro if, valida se deu erro
    //     if(data.FSR.err){
    //         let strErr = data.FSR.err;
    //        let tmpResp = JSON.parse(strErr);
    //        data.erro_msg = utils.GetTextFromBase64(tmpResp.message);
    //        data.ReadFile = false; //Zeramos o status pra poder ler  o arquivo novamente;
    //     }
    //     else{
    //         let strContent = data.FSR.result;
    //         let tmpResp = JSON.parse(strContent);
    //         let finalContent ="";
    //         //Verifica se o arquivo foi lido com sucesso.
    //         if(tmpResp.status){
    //             // valida se foi possível recuperar algum dado do arquivo;
    //             if(tmpResp.b64Content){
    //                 finalContent = utils.GetTextFromBase64(tmpResp.b64Content);
    //             }
    //         }
    //         else{
    //             //Se tiver dado erro na leitura do arquivo, retorna a mensagem de erro;
    //             data.erro_msg = utils.GetTextFromBase64(tmpResp.message);
    //             data.ReadFile = false;
    //         }
    //         data.oisFileContent = finalContent;
    //     }
    //     data.HasFileContent = true;
    // }
    return SetObjectResponse(true, data, false);
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
