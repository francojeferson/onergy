// atualiza a pagina com os novos dados (só funciona no onergy)

let postInfo = {
    UrlJsonContext: {
        total_banco_de_horas: formatHoraExtra,
    },
};

onergy_updatemany({
    fdtid: fdtidDoCard,
    assid: data.assid,
    usrid: data.usrid,
    data: JSON.stringify(postInfo),
    id: idDoCard[0].ID,
});
