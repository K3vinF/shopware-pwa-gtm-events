const defaultCurrency = "EUR";

const pushToDataLayer = (event) => {
  if (process.client) {
    if (!window['dataLayer']) {
      initDataLayer();
    }
    window['dataLayer'].push( {ecommerce: null} );  // Clear the previous ecommerce object.
    window['dataLayer'].push( event )
  }
}

const initDataLayer = () => {
  if (process.client) {
    window['dataLayer'] = window['dataLayer'] || [];
  }
}

// Product View event
// https://developers.google.com/analytics/devguides/collection/ga4/ecommerce?client_type=gtm#view_item
export const logProductView = ( product, currency ) => {
  pushToDataLayer({
    event: "view_item",
      ecommerce: {
        items: [
          convertProductToGTM(product, currency)
        ]
    }
  })
}

// View cart event
// https://developers.google.com/analytics/devguides/collection/ga4/ecommerce?client_type=gtm#view_cart
export const logCartView = ( cart, currency ) => {
  const items = cart.lineItems.map( lineItem => {
    return convertLineItemToGTM( lineItem, currency );
  });

  pushToDataLayer({
    event: "view_cart",
    ecommerce: {
      currency: currency || defaultCurrency,
      value: cart.price?.totalPrice || 0,
      items: items
    }
  })
}

// Begin checkout event
// https://developers.google.com/analytics/devguides/collection/ga4/ecommerce?client_type=gtm#begin_checkout
export const logBeginCheckout = ( cart, currency ) => {
  const items = cart.lineItems.map( lineItem => {
    return convertLineItemToGTM( lineItem, currency );
  });

  pushToDataLayer({
    event: "begin_checkout",
    ecommerce: {
      items: items
    }
  })
}

// View item list event
// https://developers.google.com/analytics/devguides/collection/ga4/ecommerce?client_type=gtm#view_item_list
export const logProductListView = ( products, listName, currency ) => {
  const items = products.map( product => {
    let item = convertProductToGTM(product, currency);
    if (listName) {
      item['item_list_name'] = listName;
    }
    return item;
  });

  pushToDataLayer({
    event: "view_item_list",
    ecommerce: {
      items: items
    }
  })
}

// Add to cart event (new product)
// https://developers.google.com/analytics/devguides/collection/ga4/ecommerce?client_type=gtm#add_to_cart
export const logAddToCart = ( product, currency, quantity? ) => {
  pushToDataLayer({
    event: "add_to_cart",
    ecommerce: {
      items: [
        convertProductToGTM(product, currency, quantity)
      ]
    }
  })
}

// Add to cart event (update quantity)
// https://developers.google.com/analytics/devguides/collection/ga4/ecommerce?client_type=gtm#add_to_cart
export const logUpQuantityInCart = ( lineItem, currency, quantity? ) => {
  const item = convertLineItemToGTM(lineItem, currency, quantity)
  item['item_list_id'] = 'cart';
  item['item_list_name'] = 'Shopping cart';

  pushToDataLayer({
    event: "add_to_cart",
    ecommerce: {
      items: [
        item
      ]
    }
  })
}

// Remove from cart event
// https://developers.google.com/analytics/devguides/collection/ga4/ecommerce?client_type=gtm#remove_from_cart
export const logRemoveFromCart = ( lineItem, currency, quantity? ) => {
  pushToDataLayer({
    event: "remove_from_cart",
    ecommerce: {
      items: [
        convertLineItemToGTM(lineItem, currency, quantity)
      ]
    }
  })
}

// Purchase event
// https://developers.google.com/analytics/devguides/collection/ga4/ecommerce?client_type=gtm#purchase
// @todo: gather and convert data
export const logPurchase = ( event ) => {
  console.log('purchase', event);
  pushToDataLayer({
    event: "purchase",
    ecommerce: {
      // transaction_id: "T_12345",
      // affiliation: "Google Merchandise Store",
      // value: 36.32,
      // tax: 4.90,
      // shipping: 5.99,
      // currency: "USD",
      // coupon: "SUMMER_SALE",
      items: []
    }
  })
}

// Helper function. Convert Shopware product data structure to GTM product:
function convertProductToGTM(product, currency, quantity?) {
  let item = {
    item_id: product.id,
    item_name:  product.name,
    // affiliation: "Google Merchandise Store",
    // coupon: "SUMMER_FUN",
    // discount: 2.22,
    // index: 0,
    item_brand: product.manufacturer?.name || "",
    // item_list_id: "related_products",
    // item_list_name: "Related Products",
    // item_variant: "green",
    // location_id: "L_12345",
    price: product.calculatedPrice.unitPrice,
    currency: currency || defaultCurrency,
    quantity: quantity || product.calculatedPrice.quantity || 1
  }

  if (product.categories) {
    product.categories.forEach(function (value, i) {
      item['item_category' + (i > 0 ? i : '' )] = value.name;
    });
  }
  if (currency) {
    item['currency'] = currency;
  }
  return item;
}

// Helper function. Convert Shopware cart line-item data structure to GTM product:
function convertLineItemToGTM(lineItem, currency, quantity?) {
  let item = {
    item_id: lineItem.id,
    item_name:  lineItem.label,
    // affiliation: "Google Merchandise Store",
    // coupon: "SUMMER_FUN",
    // discount: 2.22,
    // index: 0,
    item_brand: lineItem.manufacturer?.name || "",
    // item_list_id: "related_products",
    // item_list_name: "Related Products",
    // item_variant: "green",
    // location_id: "L_12345",
    price: lineItem.price.unitPrice,
    currency: currency || defaultCurrency,
    quantity: quantity || lineItem.quantity || 1
  }

  if (lineItem.categories) {
    lineItem.categories.forEach(function (value, i) {
      item['item_category' + (i > 0 ? i : '' )] = value.name;
    });
  }
  if (currency) {
    item['currency'] = currency;
  }
  return item;
}
