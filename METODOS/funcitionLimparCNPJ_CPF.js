function get_clean_cnpj_cpf(valor) {
    if (valor == null) {
        return '';
    }
    aux_temp_1 = valor.replace(/\./g, '');
    aux_temp_2 = aux_temp_1.replace(/-/g, '');
    aux_temp_3 = aux_temp_2.replace(/\//g, '');
    return aux_temp_3;
}
function get_format_cnpj(valor) {
    let cnpjFormatEmail = valor.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    return cnpjFormatEmail;
}
