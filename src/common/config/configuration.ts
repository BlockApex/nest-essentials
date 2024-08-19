export default () => ({
    port: parseInt(process.env.PORT, 10) || 4000,
    salt: parseInt(process.env.SALT, 10),
    baseURL: 'https://airdrop.mento.org',
    projectName: 'Mento',
    database: {
        uri: process.env.MONGODB_URI
        //   host: process.env.DATABASE_HOST,
        //   port: parseInt(process.env.DATABASE_PORT, 10) || 5432
    },
    email: {
        host: process.env.EMAIL_HOST,
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
    },
    jwt: {
        secret: process.env.JWT_SECRET
    }
});