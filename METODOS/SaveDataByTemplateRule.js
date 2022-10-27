// let x = {
//     jsondata: 'string',
//     usrid: 'string',
//     assid: 'string',
//     id: 'string',
//     fdtid: 'string',
//     ref_fdtid: 'string',
//     ref_field: 'string',
//     keepFdtID: true,
//     blockDuplicate: true,
//     checkUserDuplicate: true,
//     checkTemplateDuplicate: true,
//     ukField: 'string',
//     executeAction: true,
//     fdtCheckTemplates: ['string'],
//     addCfgViewGroup: ['string'],
//     removeCfgViewGroup: ['string'],
//     addCfgViewUsr: ['string'],
//     removeCfgViewUsr: ['string'],
//     addCfgViewRole: ['string'],
//     removeCfgViewRole: ['string'],
//     SessionProcessID: 'string',
//     ProcessExecutionID: 'string',
//     geo: {
//         cep: 'string',
//         location: 'string',
//     },
//     dataFilter: 'string',
//     hookSession: 'string',
//     hookResultWhenComeInFdtid: 'string',
//     approv: {
//         dtAccept: '2022-10-26T23:30:55.673Z',
//         rejection: 'string',
//         accepted: true,
//     },
// };

/**ENV_NODE**
 * node:test (find and replace)
 * /*async*/ /**
 * /*await*/ /**
 */
const { date } = require('assert-plus');
const { formatDate } = require('tough-cookie');
const { log } = require('console');
const { memory } = require('console');
const { resolve } = require('path');
const { type } = require('os');
const axios = require('axios');
const fs = require('fs');
const jsuser = require('../../onergy/onergy-utils');
const onergy = require('../../onergy/onergy-client');
const utils = require('../../onergy/onergy-utils');
/*async*/ function ajax(args) {
    return /*await*/ onergy.ajax(args);
}
/*async*/ function ajaxPost(args) {
    return /*await*/ onergy.ajaxPost(args);
}
/*async*/ function hashMd5(args) {
    return /*await*/ onergy.hashMd5(args);
}
/*async*/ function increment(args) {
    return /*await*/ onergy.increment(args);
}
/*async*/ function onergy_countdocs(args) {
    return /*await*/ onergy.onergy_countdocs(args);
}
/*async*/ function onergy_get(args) {
    let r = /*await*/ onergy.onergy_get(args);
    return JSON.stringify(r);
}
/*async*/ function onergy_save(args) {
    return /*await*/ onergy.onergy_save(args);
}
/*async*/ function ReadExcelToJson(args) {
    return /*await*/ onergy.ReadExcelToJson(args);
}
/*async*/ function ReadTextPdf(args) {
    return /*await*/ onergy.ReadTextPdf(args);
}
/*async*/ function sendmail(args) {
    return /*await*/ onergy.sendmail(args);
}
/*async*/ function onergy_sendto(args) {
    let r = /*await*/ onergy.onergy_sendto(args);
    return JSON.stringify(r);
}
/*async*/ function onergy_updatemany(data) {
    return data;
}
function failureCallback(error) {
    console.log('It failed with ' + error);
}
function get_usr_tmz_dt_now(data) {
    return data;
}
function replaceAll(content, needle, replacement) {
    return content.split(needle).join(replacement);
}
function successCallback(result) {
    console.log('It succeeded with ' + result);
}
/**CLI_SCRIPT**
 */
/*async*/ function teste() {
    let x = /*await*/ onergy.onergy_save(json);
    debugger;
}
/**STD_METHODS**
 */
let json = {
    data: "{'schedule':1}",
    usrid: '1ec86197-d331-483a-b325-62cc26433ea5',
    assid: '67c0b77d-abae-4c48-ba4b-6c8faf27e14a',
    fdtid: '51f0ba7e-35cc-4167-8e4e-da9f52972822',
};

teste();
