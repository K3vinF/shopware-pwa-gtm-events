# shopware-pwa-datalayer
Nuxt plugin for Shopware PWA that logs ecommerce events to the dataLayer according to the Google Analytics 4 schema.

## Installation
Add Google Tag Manager to your Shopware PWA instance. For example via the [@nuxtjs/gtm module](https://www.npmjs.com/package/@nuxtjs/gtm)
Instructions [here](https://shopware-pwa-docs.vuestorefront.io/landing/cookbook/#_7-how-to-install-and-register-a-nuxt-plugin).

Download or clone the shopware-pwa-gtm-events plugin.
Place the plugin in a suitable directory. For example in your custom theme, or in `src/plugins`
There Shopware PWA will automaticly detect and enable it.


## Supported events

For now the following events are implemented:

- Product detail view;
- Product list view;
- Add to cart;
- Remove from cart;
- View cart;
- Start checkout;
- Purchase event (partially);
