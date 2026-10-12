/* eslint-disable no-undef */
// helloWorld.js

// 1. First write a test that fails
it('should return hello world', () => {
    expect(helloWorld()).toBe('hello world');
});

// 2. Then write the code to make the test pass
function helloWorld() {
    return 'hello world';
}
