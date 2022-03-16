import {
  useIntercept,
  useCms,
  useUIState,
  useCart,
  useListing,
  useCurrency,
  INTERCEPTOR_KEYS,
  extendScopeContext
} from "@shopware-pwa/composables";
import { debounce } from "@shopware-pwa/helpers";
import { watch } from "@vue/composition-api";
import {
  logAddToCart, logBeginCheckout, logCartView, logProductListView,
  logProductView, logPurchase,
  logRemoveFromCart, logUpQuantityInCart
} from "./datalayer-utils";

import { effectScope } from "vue-demi";

export default async ( { app, route } ) => {

  // https://github.com/vuestorefront/shopware-pwa/discussions/1667#discussioncomment-1586983
  const scope = effectScope();
  extendScopeContext(scope, app);

  // @ts-ignore process not found
  if ( process.client ) {
    await scope.run(async () => {

      const { on, broadcast } = useIntercept();
      const currency = useCurrency();
      let prevCart: any = undefined;
      const { cart } = useCart();
      const { page } = useCms();
      const { isOpen: sidebarCartOpen } = useUIState({
        stateName: "CART_SIDEBAR_STATE",
      })
      const { getCurrentListing } = useListing({listingType: 'categoryListing'});

      // Setup watchers:

      watch(page, async (page) => {
        if (page?.product) {
          broadcast('viewProductDetail', page.product);
        }
      })

      watch(sidebarCartOpen, (sidebarCartOpen) => {
        if (sidebarCartOpen) {
          broadcast('viewCart', cart.value);
        }
      })

      watch(getCurrentListing, async (getCurrentListing) =>{
        if (page.value.category) {
          broadcast('viewProductList', {items: getCurrentListing.elements, listName: page.value.category.name});
        }
      })

      watch(route, (route) => {
        if (route.routeName == 'checkout') {
          broadcast('beginCheckout', cart.value);
        }
      })

      // Debounce cart watch. We don't want to trigger changes while the user
      // is still typing, for example when update the quantity.
      const cartWatcher = debounce ( (cart) => {
        if (prevCart)
          prevCart.lineItems.forEach(function (lineItem, i) {
            // const newLineItems = filter(cart.lineItems, {'id': lineItem.id });
            const newLineItems = cart.lineItems.filter( (item: any) => {
                return item['id'] == lineItem.id
              })

            if (newLineItems.length && lineItem.quantity !== newLineItems[0].quantity) {
              const difference = newLineItems[0].quantity - lineItem.quantity;
              broadcast('lineItemQuantityChange', { lineItem, quantity: difference });
            }
            if (!newLineItems.length) {
              broadcast('removeFromCart', lineItem);
            }
          })
        // Save old cart for next comparison.
        prevCart = cart;
      }, 500)

      // Watch cart and broadcast relevant change events:
      watch (cart, cartWatcher)

      // Setup event listeners:

      on({
        broadcastKey: INTERCEPTOR_KEYS.ADD_TO_CART,
        name: "addToCartListener",
        handler: ({ product }) => {
          logAddToCart(product, currency);
          }
      });

      on({
        broadcastKey: 'viewCart',
        name: "viewCartListener",
        handler: ( cart ) => {
          logCartView(cart, currency.currency.value.isoCode);
        }
      });

      on({
        broadcastKey: 'viewProductList',
        name: "viewProductListListener",
        handler: ( e ) => {
          logProductListView(e.items, e.listName, currency.currency.value.isoCode);
        }
      });

      on({
        broadcastKey: 'viewProductDetail',
        name: "viewProductDetailListener",
        handler: ( product ) => {
          logProductView(product, currency.currency.value.isoCode);
        }
      });

      on({
        broadcastKey: 'beginCheckout',
        name: "beginCheckoutListener",
        handler: ( cart ) => {
          logBeginCheckout(cart, currency.currency.value.isoCode);
        }
      });

      on({
        broadcastKey: 'removeFromCart',
        name: "removeFromCartListener",
        handler: ( product ) => {
          logRemoveFromCart(product, currency);
        }
      });

      on({
        broadcastKey: INTERCEPTOR_KEYS['ORDER_PLACE'],
        name: "orderPlaceListener",
        handler: ({ items }) => {
          logPurchase(items);
        }
      });

      on({
        broadcastKey: 'lineItemQuantityChange',
        name: "lineItemListener",
        handler: (e) => {
          const difference = e.quantity;
          const lineItem = e.lineItem;
          if (difference < 0) {
            logRemoveFromCart(lineItem, currency.currency.value.isoCode, -difference);
          }
          else {
            logUpQuantityInCart(lineItem, currency.currency.value.isoCode, difference)
          }
        }
      });

    })
  }
}
