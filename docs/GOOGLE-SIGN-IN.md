# Google sign-in production setup

The storefront uses Supabase Auth, not Vercel account access. Google credentials stay in Supabase and must never be committed or exposed in frontend JavaScript.

1. In Google Cloud, create an OAuth client of type **Web application**.
2. Set the authorized JavaScript origin to `https://cyberpopstudio.com`.
3. Set the authorized redirect URI to `https://wdtbanucnxnwbruwcgmv.supabase.co/auth/v1/callback`.
4. Configure Google branding as CyberPop Studio, with homepage `https://cyberpopstudio.com`, privacy policy `https://cyberpopstudio.com/privacy`, terms `https://cyberpopstudio.com/terms`, and authorized domain `cyberpopstudio.com`. Request only `openid`, email, and profile scopes.
5. Set the audience to External and publish for customer sign-in. A testing audience only permits configured test users.
6. In Supabase Authentication → Sign In / Providers → Google, enter the OAuth Client ID and Client Secret and enable the provider. Keep nonce checks enabled.
7. In Supabase Authentication → URL Configuration, set Site URL to `https://cyberpopstudio.com` and allow `https://cyberpopstudio.com/account` and `https://cyberpopstudio.com/account?**` for preserved collection request return paths. Verify any other existing email/admin redirect entries before changing them.
8. Open `/account` in a private browser. Continue with Google, complete username/country onboarding, and verify the account returns to the chosen `/access?package=…` request. This creates a customer account; it does not grant Vercel or studio admin access.
9. Verify order ID creation, attach a Payoneer link from the admin panel, and confirm collection access only after verified payment. Test the entitled Cults code visibility with separate eligible customer accounts.

The frontend discovers the provider state from Supabase. It enables Google automatically once configured; no redeployment is required. During setup it displays an honest unavailable state while email sign-in remains available. Network errors do not permanently hide the Google button.

Reference: https://supabase.com/docs/guides/auth/social-login/auth-google
