export const environment = {
  production: false,
  azureAd: {
        clientId: '2a6ba697-6ca0-4d18-b177-6ebc6f718bed',
        tenantId: '3acdf2c2-163b-4bf4-a06c-abbdc2725441',
        redirectUri: 'http://localhost:4200/auth',
        authority: 'https://login.microsoftonline.com/common',
        scopes: ['user.read']
    }
};