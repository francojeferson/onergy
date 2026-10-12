// convertendo a data de hoje para o formato do Onergy YYYY-MM-DD
let dataHoje = new Date();
let dataHojeFormat = dataHoje.getFullYear() + '-' + dataHoje.getMonth(+1) + '-' + dataHoje.getDate();
//let arrayIn = dataHojeFormat.split('-');
let dtFormat = arrayIn[0] + '-' + arrayIn[1].padStart(2, '0') + '-' + arrayIn[2].padStart(2, '0');

// converter data recebida para o Onergy
let data = '2022-10-01';
let arrayIn = dataHojeFormat.split('-');

let dtX = {
    year: parseInt(arrayIn[0]),
    month: parseInt(arrayIn[1]),
    day: parseInt(arrayIn[2]),
};
// metodo para imputar valore no campo do onergy
mtdOnergy.JsEvtSetItemValue('dt_st', dtX);

// Somar ou subtrair dias em uma data ********************************************** *

let diasDeAlteracao = 5;

let strDate = get_usr_tmz_dt_now({
    assid: data.onergy_js_ctx.assid,
    usrid: data.onergy_js_ctx.usrid,
});

let nDate = new Date(strDate);

let finalStrDate = new Date(nDate.setDate(nDate.getDate() - diasDeAlteracao));

let dtFormatt = finalStrDate.toISOString().split('T')[0] + ' 23:59:00';

function difference(date1, date2) {
    const date1utc = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const date2utc = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());
    day = 1000 * 60 * 60 * 24;
    return (date2utc - date1utc) / day;
}

const date1 = new Date('2020-12-10'),
    date2 = new Date('2021-10-31'),
    time_difference = difference(date1, date2);
console.log(time_difference);
