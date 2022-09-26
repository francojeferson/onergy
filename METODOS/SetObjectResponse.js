// FUnção para movimentar o registro entre cards do processo

function avançarCard(json) {
    var data = JSON.parse(json);

    //return true;
    // (Avança pro sim ou não, dados do registro, fina na tela?)
    return SetObjectResponse(true, data, false);
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

/* -------------------------------------------------- */

// Mandar o registro para um outro processo
function enviarParaOutroProcesso(json) {
    var data = JSON.parse(json);

    //return true;
    // (Avança pro sim ou não, dados do registro, fina na tela?, ID do processo)
    return SetObjectResponse(true, data, false, respXCNPJProcessoId);
}

function SetObjectResponse(cond, json, WaitingWebHook, goToProcess) {
    if (WaitingWebHook === undefined) WaitingWebHook = false;

    var obj = {
        cond: cond,
        json: JSON.stringify(json),
        WaitingWebHook: WaitingWebHook,
    };

    if (goToProcess) {
        obj['onergy_prc_id'] = goToProcess;
        obj['onergy_new_prc_id_fdtid'] = '968cf322-ea7b-4c59-96f9-f278fe8b5bfc'; // id do processo que sera enviado
    }

    return obj;
}

// Criar grupos

function init(json) {
    var data = JSON.parse(json);

    let groupName = data.cpfcnpj_agente;
    let parentTeamName = 'Administradores';
    let parentTeamID = '';

    let arrGroupID = [];
    let removeGroup = [];

    let rhGroupID = '182f5505-5c09-46b9-8496-6f775bcc4994';
    let geralGroupID = '309dc70c-5d9a-4e90-ac57-fb01dc23fc60';

    // Se o agente for de RH, passar o Grupo de visualização do RH, se não, passar o grupo de visualização geral.
    if (data.cnpj_rh == 'Sim') {
        arrGroupID.push(rhGroupID);
        removeGroup.push(geralGroupID);
    } else {
        arrGroupID.push(geralGroupID);
        removeGroup.push(rhGroupID);
    }

    // Criar grupos de visualizações para obra
    data.onergyObraAreaGroupID = CreateGRP(data.ass_id, 'OBRA_' + groupName, data.onergyObraAreaGroupID, parentTeamID, parentTeamName);

    // filtro dos perfis de obras que podem visualizar
    data.lastUsrSelID_obraID = atualizarUsrGroup(data.onergyObraAreaGroupID, data.lastUsrSelID_obraID, data.COLadministradores_obra_id);

    arrGroupID.push(data.onergyObraAreaGroupID);

    return SetObjectResponse(true, data, false, arrGroupID, removeGroup);
}

function atualizarUsrGroup(grpID, removUsrLst, addUsrLst) {
    if (removUsrLst != null && removUsrLst != undefined && removUsrLst.length > 0 && removUsrLst.toString().trim() != '') {
        let removeUsrList = [];
        for (let i = 0; i < removUsrLst.length; i++) {
            if (addUsrLst.indexOf(removUsrLst[i]) < 0) {
                removeUsrList.push(removUsrLst[i]);
            }
        }
        if (removeUsrList.length > 0) {
            jsuser.RemoveUserFromGroup(removeUsrList, [grpID]);
        }
    }

    if (addUsrLst != null && addUsrLst.length > 0 && addUsrLst.toString().trim() != '') {
        let arrOnergyUser = [];
        for (let i = 0; i < addUsrLst.length; i++) {
            let usrItem = {
                ID: addUsrLst[i],
                lstGroup: [
                    {
                        grpID: grpID,
                        isGroupOwner: false,
                    },
                ],
            };
            arrOnergyUser.push(usrItem);
        }
        if (arrOnergyUser.length > 0) {
            jsuser.AddUserToGroup(JSON.stringify(arrOnergyUser));
        }
        /* let strFiltro = JSON.stringify([
           { FielName: "OnergyCadUsrID", Type: "string", FixedType: "string", Value1: JSON.stringify(data.usuario_id) }
       ]);
       
       let strColab = getOnergyItem(colabInterFdtId, data.onergy_js_ctx.assid, data.onergy_js_ctx.usrid, strFiltro);
       let colabObj = JSON.parse(strColab);
       for(let i = 0; i<colabObj.length; i++){
           let cadUser = colabObj[i].UrlJsonContext;
           CreateOnergyUsuarioID(data.assid, cadUser.OnergyCadUsrID, cadUser.FUNonergyFuncaoRoleID, cadUser.email_colaborador, cadUser.nome_colaborador, data.onergyAreaGroupID);
           resetUserRelation({'assid':data.assid,'usrid':cadUser.OnergyCadUsrID});
       }*/
    }

    return addUsrLst;
}

function CreateGRP(assid, grp_name, grp_id, parent_grp_id, parent_grp_name) {
    let newgrp = { assid: assid, grp_name: grp_name };
    if (grp_id) {
        newgrp['grp_id'] = grp_id;
    }
    if (parent_grp_id) {
        newgrp['parent_grp_id'] = parent_grp_id;
        newgrp['clearParentRef'] = true;
    } else if (parent_grp_name) {
        newgrp['parent_grp_name'] = parent_grp_name;
        newgrp['clearParentRef'] = true;
    }
    return createGroup(newgrp);
}

function SetObjectResponse(cond, json, WaitingWebHook, groupID, removeGroupID) {
    if (WaitingWebHook === undefined) WaitingWebHook = false;

    var obj = {
        cond: cond,
        json: JSON.stringify(json),
        WaitingWebHook: WaitingWebHook,
    };

    if (groupID && groupID.length > 0) {
        obj['GrpID'] = groupID;
    }

    if (removeGroupID && removeGroupID.length > 0) {
        obj['lstDelGrpID'] = removeGroupID;
    }

    return obj;
}
