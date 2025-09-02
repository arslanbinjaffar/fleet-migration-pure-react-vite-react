import React from 'react';

// Supplier Components
import {
  SupplierList,
  AddSupplier,
  EditSupplier,
  SupplierLedger,
  AddPayment,
} from './suppliers/components';

// Spare Parts Components
import {
  SparePartsList,
  SparePartsCreate,
} from './spare-parts/components';

// Route definitions for inventory module
export const inventoryRoutes = [
  // Supplier Routes
  {
    url: "supplier",
    component: <SupplierList />,
    module: "Inventory",
    name: "Supplier",
    access: ["admin", "employee"],
    action: ["create", "read", "update", "delete"],
  },
  {
    url: "supplier/create",
    component: <AddSupplier />,
    module: "Inventory",
    name: "Supplier",
    access: ["admin"],
    action: ["create"],
  },
  {
    url: "supplier/edit/:supplierId",
    component: <EditSupplier />,
    module: "Inventory",
    name: "Supplier",
    access: ["admin"],
    action: ["update"],
  },
  {
    url: "supplier/view/:supplierId",
    component: <EditSupplier viewMode={true} />,
    module: "Inventory",
    name: "Supplier",
    access: ["admin", "employee"],
    action: ["read"],
  },
  {
    url: "supplier/ledger/:supplierId",
    component: <SupplierLedger />,
    module: "Inventory",
    name: "Supplier",
    access: ["admin", "employee"],
    action: ["read"],
  },
  {
    url: "add-payment/supplier/create",
    component: <AddPayment />,
    module: "Inventory",
    name: "Supplier",
    access: ["admin"],
    action: ["create"],
  },

  // Spare Parts Routes (replacing Product routes)
  {
    url: "spare-parts",
    component: <SparePartsList />,
    module: "Inventory",
    name: "SpareParts",
    access: ["admin", "employee"],
    action: ["create", "read", "update", "delete"],
  },
  {
    url: "spare-parts/create",
    component: <SparePartsCreate />,
    module: "Inventory",
    name: "SpareParts",
    access: ["admin"],
    action: ["create"],
  },
  // Note: Additional spare parts routes can be added here
  // {
  //   url: "spare-parts/edit/:sparePartId",
  //   component: <SparePartsEdit />,
  //   module: "Inventory",
  //   name: "SpareParts",
  //   access: ["admin"],
  //   action: ["update"],
  // },
  // {
  //   url: "spare-parts/view/:sparePartId",
  //   component: <SparePartsEdit viewMode={true} />,
  //   module: "Inventory",
  //   name: "SpareParts",
  //   access: ["admin", "employee"],
  //   action: ["read"],
  // },

  // Purchase Order Routes (placeholders - components to be implemented)
  // {
  //   url: "purchase-order",
  //   component: <PurchaseOrder />,
  //   module: "PurchaseOrder",
  //   name: "PurchaseOrder",
  //   access: ["admin"],
  //   action: ["create", "read", "update", "delete"],
  // },
  // {
  //   url: "purchase-order/create",
  //   component: <CreatePurchase />,
  //   module: "PurchaseOrder",
  //   name: "PurchaseOrder",
  //   access: ["admin"],
  //   action: ["create"],
  // },
  // {
  //   url: "purchase-order/edit/:purchase_orderId",
  //   component: <EditPurchase />,
  //   module: "PurchaseOrder",
  //   name: "PurchaseOrder",
  //   access: ["admin"],
  //   action: ["update"],
  // },
  // {
  //   url: "purchase-order/view/:purchase_orderId",
  //   component: <EditPurchase viewMode={true} />,
  //   module: "PurchaseOrder",
  //   name: "PurchaseOrder",
  //   access: ["admin"],
  //   action: ["read"],
  // },

  // Purchases Routes (placeholders - components to be implemented)
  // {
  //   url: "purchases",
  //   component: <PurchasesList />,
  //   module: "PurchaseOrder",
  //   name: "Purchases",
  //   access: ["admin"],
  //   action: ["create", "read", "update", "delete"],
  // },
  // {
  //   url: "purchases/view/:purchasesId",
  //   component: <PurchaseView />,
  //   module: "PurchaseOrder",
  //   name: "Purchases",
  //   access: ["admin"],
  //   action: ["read"],
  // },

  // Receive Shipping Routes (placeholders - components to be implemented)
  // {
  //   url: "receive-shipping",
  //   component: <ReceiveShipping />,
  //   module: "PurchaseOrder",
  //   name: "ReceiveShipping",
  //   access: ["admin"],
  //   action: ["create", "read", "update", "delete"],
  // },

  // Stock List Routes (placeholders - components to be implemented)
  // {
  //   url: "stock-list",
  //   component: <StockList />,
  //   module: "Inventory",
  //   name: "StockList",
  //   access: ["admin", "employee"],
  //   action: ["create", "read", "update", "delete"],
  // },
];

// Export individual route groups for easier management
export const supplierRoutes = inventoryRoutes.filter(route => 
  route.url.startsWith('supplier') || route.url.includes('supplier')
);

export const sparePartsRoutes = inventoryRoutes.filter(route => 
  route.url.startsWith('spare-parts')
);

// Note: Additional route groups can be exported here when implemented:
// export const purchaseOrderRoutes = inventoryRoutes.filter(route => 
//   route.url.startsWith('purchase-order')
// );
// export const purchasesRoutes = inventoryRoutes.filter(route => 
//   route.url.startsWith('purchases')
// );
// export const receiveShippingRoutes = inventoryRoutes.filter(route => 
//   route.url.startsWith('receive-shipping')
// );
// export const stockListRoutes = inventoryRoutes.filter(route => 
//   route.url.startsWith('stock-list')
// );