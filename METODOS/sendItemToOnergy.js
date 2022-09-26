// Criar um registro no onergy

let cadUsr = '32008998-ac8b-4cda-a98e-1a6efb61c08e';
let ctxRegUsr = {
    nome: 'Teste Teste',
    email_do_usuario: 'Teste@teste.com',
    cpf: 'Teste',
    idade: '2022-1-1',
};
let idRegSaveUsr = await sendItemToOnergy(cadUsr, data.usrid, data.assid, ctxRegUsr);

async function sendItemToOnergy(templateid, usrid, assid, data, fedid) {
    let onergySaveData = {
        fdtid: templateid,
        assid: assid,
        usrid: usrid,
        data: JSON.stringify(data),
    };
    if (fedid != undefined && fedid != '') {
        onergySaveData.id = fedid;
    }
    return await onergy_save(onergySaveData);
}
