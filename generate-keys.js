const { generateKeyPairSync } = require('crypto')

const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
})

const oneLine = (k) => k.replace(/\n/g, '\\n')
console.log('JWT_PRIVATE_KEY="' + oneLine(privateKey) + '"')
console.log('JWT_KEY="' + oneLine(publicKey) + '"')