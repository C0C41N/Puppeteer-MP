import { createCipheriv, createDecipheriv } from 'crypto';

const hex1 = '0533f43c96bd0080c6303d0996d747dd';
const hex2 = '6c4a0092f9a87c0ee82ec6f9441c0d0034361f61ef85f00e5ad154b464c27203';
const initKey = Buffer.from(hex1, 'hex');
const secretKey = Buffer.from(hex2, 'hex');

const algorithm = 'aes-256-cbc';

export const encrypt = (text: string) => {
	const cipher = createCipheriv(algorithm, secretKey, initKey);
	return cipher.update(text, 'utf-8', 'hex') + cipher.final('hex');
};

export const decrypt = (text: string) => {
	const decipher = createDecipheriv(algorithm, secretKey, initKey);
	return decipher.update(text, 'hex', 'utf-8') + decipher.final('utf8');
};

export const getCREDS = () => {
	const data = process.env.TSHARP_CRED;
	if (!data) throw Error('ENV | TSHARP_CRED not valid');
	const [username, password] = decrypt(process.env.TSHARP_CRED).split('|');
	return { username, password };
};
