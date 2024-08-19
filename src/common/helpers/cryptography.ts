var CryptoJS = require('crypto-js');

// Encrypt
export const encryptData = (data_: string, secret_: string) => {
    var ciphertext = CryptoJS.AES.encrypt(data_, secret_).toString();
    return ciphertext;
};

// Decrypt
export const decryptData = (encryptedData_: string, secret_: string) => {
    var bytes = CryptoJS.AES.decrypt(encryptedData_, secret_);
    var originalText = bytes.toString(CryptoJS.enc.Utf8);
    console.log(originalText); // 'my message'
    return originalText;
};