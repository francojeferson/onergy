function somarTempos() {
    let tempo1 = '05:00:15';
    let tempo2 = '06:15:00';

    let array1 = tempo1.split(':');
    let tempo_seg1 = parseInt(array1[0]) * 3600 + parseInt(array1[1]) * 60 + parseInt(array1[2]);
    let array2 = tempo2.split(':');
    let tempo_seg2 = parseInt(array2[0]) * 3600 + parseInt(array2[1]) * 60 + parseInt(array2[2]);

    let tempofinal = parseInt(tempo_seg1) + parseInt(tempo_seg2);
    let hours = Math.floor(tempofinal / (60 * 60));
    let divisorMinutos = tempofinal % (60 * 60);
    let minutes = Math.floor(divisorMinutos / 60);
    let divisorSeconds = divisorMinutos % 60;
    let seconds = Math.ceil(divisorSeconds);
    let contador = '';

    if (hours < 10) {
        contador = '0' + hours + ':';
    } else {
        contador = hours + ':';
    }

    if (minutes < 10) {
        contador += '0' + minutes + ':';
    } else {
        contador += minutes + ':';
    }

    if (seconds < 10) {
        contador += '0' + seconds;
    } else {
        contador += seconds;
    }
    return contador;
}

somarTempos();
