# eCommerce Backend Server

Welcome to the eCommerce Backend Server! This Node.js application serves as dynamic eCommerce platform. It features robust functionalities for managing products, orders, and user interactions.

## 🚀 Features

- **Product Management:** Create, read, update, and delete products.
- **Dynamic Queries:** Search for products based on size, category, price, and featured status.
- **Order Processing:** Handle shopping cart orders, check stock availability, and manage order statuses.
- **Image Storage:** Seamlessly store and manage product images using AWS S3.
- **Payment Integration:** Secure and efficient payment processing with Razorpay.
- **Secure & Scalable:** Built with MongoDB for a scalable database solution.

<br>

## 🛠️ Technologies Used

- **Node.js:** JavaScript runtime for building server-side applications.
- **Express.js:** Web application framework for Node.js.
- **MongoDB:** NoSQL database for storing product and user data.
- **AWS S3:** Cloud storage service for handling product images.
- **Razorpay:** Payment gateway integration for processing transactions.

<br>

## Postman collection
[Download Collection](https://api.postman.com/collections/36907399-8ef269c3-d42b-4721-9a60-191e4ceae8d3?access_key=PMAT-01J37VK3DANX9731PR78EA37WB)

<br>


## 📦 Installation

<br>

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/babluroy/node.js-eCommerce-Backend

2. **Create .env file and paste your DATABASE URL, SECRET, AWS CREDENTIALS & RAZORPAY CREDENTIALS:**
```bash

DATABASE=mongodb://localhost:27017/ecommerce
SECRET=YOUT_SECRET

# AWS
AWS_ACCESS_KEY=YOUR_AWS_ACCESS_KEY
AWS_SECRET_KEY=YOUR_AWS_SECRET_KEY
AWS_REGION=YOUR_AWS_REGION

# RAZORPAY
RAZORPAY_KEY_ID=YOUR_RAZORPAY_KEY_ID
RAZORPAY_SECRET=YOUR_RAZORPAY_SECRET


