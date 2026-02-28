import { bootstrapApplication } from '@angular/platform-browser';
import { PublicClientApplication } from '@azure/msal-browser';
import { MSAL_INSTANCE } from '@azure/msal-angular';
import { appConfig, msalConfig } from './app/app.config';
import { App } from './app/app';

async function bootstrap() {
  const pca = new PublicClientApplication(msalConfig);

  await pca.initialize();

  const redirectResult = await pca.handleRedirectPromise();

  if (redirectResult?.account) {
    pca.setActiveAccount(redirectResult.account);
  } else {
    const accounts = pca.getAllAccounts();
    if (accounts.length > 0 && !pca.getActiveAccount()) {
      pca.setActiveAccount(accounts[0]);
    }
  }

  bootstrapApplication(App, {
    ...appConfig,
    providers: [
      ...appConfig.providers,
      { provide: MSAL_INSTANCE, useValue: pca },
    ],
  }).catch((err) => console.error(err));
}

bootstrap();
