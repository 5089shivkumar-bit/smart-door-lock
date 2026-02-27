const cp = require('child_process');

const server = cp.spawn('node', ['server.js'], { cwd: 'd:/SMART DOOR LOCK/backend' });
server.stdout.on('data', d => console.log('SERVER:', d.toString().trim()));
server.stderr.on('data', d => console.error('SERVER ERR:', d.toString().trim()));

setTimeout(() => {
    console.log("Running tester...");
    const tester = cp.spawn('node', ['test_500.js'], { cwd: 'd:/SMART DOOR LOCK/backend' });
    tester.stdout.on('data', d => console.log('TEST:', d.toString().trim()));
    tester.stderr.on('data', d => console.error('TEST ERR:', d.toString().trim()));
    tester.on('close', () => {
        setTimeout(() => {
            console.log("Killing server...");
            server.kill();
        }, 1000);
    });
}, 5000);
