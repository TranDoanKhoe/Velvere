import mongoose from 'mongoose';
import dotenv from 'dotenv';
// import Product from './src/models/Product.model'; // đường dẫn đến model của bạn
// import User from './src/models/User.model'; // đường dẫn đến model của bạn
import Cart from './src/models/Cart.model';
dotenv.config();

mongoose
    // .connect(process.env.MONGO_URI!)
    // .then(async () => {
    //     console.log('✅ Connected to MongoDB');
    //     const products = await Product.find(); // test dữ liệu
    //     console.log('📦 Dữ liệu sản phẩm:', products);
    //     mongoose.disconnect();
    // })
    // .catch((err) => {
    //     console.error('❌ MongoDB connection error:', err);
    // });
    .connect(process.env.MONGO_URI!)
    .then(async () => {
        console.log('✅ Connected to MongoDB');
      const cart = await Cart.find(); // test dữ liệu người dùng
        console.log('👤 Dữ liệu người dùng:', cart);
        mongoose.disconnect();
    })
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err);
    });
