const http = require('http');

const url = 'http://localhost:8081/index.bundle?platform=web&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.routerRoot=app&unstable_transformProfile=hermes-stable';

const fs = require('fs');

http.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        const result = {
            status: res.statusCode,
            headers: res.headers,
            body: data
        };
        fs.writeFileSync('metro_error.json', JSON.stringify(result, null, 2));
        console.log('Saved to metro_error.json');
    });
}).on('error', (err) => {
    console.error('ERROR:', err.message);
});
