const constants = {
    USER_TYPES: {
        ADMIN: 1,
        USER: 0
    },
    S3_BUCKETS: {
        CATEGORIES : 'ecom-store-categories',
        PRODUCTS: 'ecom-store-products',
    },
    PEOPLE_TYPES: {
        MALE: 1,
        FEMALE: 2,
        KIDS: 3
    },
    PAYMENT_TYPES: {
        COD: 'COD',
        ONLINE: 'ONLINE',
    },
    ORDER_STATUS: {
        CANCELLED: "Cancelled", 
        DELIVERED: "Delivered", 
        SHIPPED: "Shipped", 
        PROCESSING: "Processing", 
        RECEIVED: "Received"
    }
}

module.exports = {
    constants
};