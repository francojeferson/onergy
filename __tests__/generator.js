function* count(n) {
    while (true) {
        yield n++;
    }
}

const iterator = count(5);
console.log(iterator.next().value);
console.log(iterator.next().value);
console.log(iterator.next().value);
