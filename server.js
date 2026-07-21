const Razorpay = require("razorpay");
const multer = require("multer");
const express = require("express");
const razorpay = new Razorpay({
    key_id: "rzp_live_TG9enuqhqowGSM",
    key_secret: "rSnYfshWDjC81Zu3kUe9acVN"
});
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
// =========================
// Image Upload
// =========================

const storage = multer.diskStorage({

    destination: function(req, file, cb) {

        cb(null, "public/images");

    },

    filename: function(req, file, cb) {

        const ext = path.extname(file.originalname);

        cb(null, Date.now() + ext);

    }

});

const readAdmin = () => {
    const filePath = path.join(__dirname, "data", "admin.json");
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
};

const writeAdmin = (data) => {
    const filePath = path.join(__dirname, "data", "admin.json");
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
};

const upload = multer({
    storage
});


const readDiary = (fileName) => {
    try {
        const filePath = path.join(__dirname, 'data', fileName);
        console.log("Reading:", filePath);
        const data = fs.readFileSync(filePath, 'utf8').trim();

        if (!data) {
            return [];
        }

        return JSON.parse(data);
    } catch (err) {
        console.error(`Error reading ${fileName}:`, err.message);
        return [];
    }
};

const writeDiary = (fileName, data) => fs.writeFileSync(path.join(__dirname, 'data', fileName), JSON.stringify(data, null, 2), 'utf8');


app.get('/api/products', (req, res) => res.json(readDiary('products.json')));

app.post("/api/create-order", async (req, res) => {

    try {

        const options = {

            amount: req.body.amount * 100, // paise

            currency: "INR",

            receipt: "rcpt_" + Date.now()

        };

        const order = await razorpay.orders.create(options);

        res.json(order);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: "Unable to create Razorpay order"
        });

    }

});
app.post('/api/orders', (req, res) => {

    const orders = readDiary('orders.json');

    const newOrder = {

        orderId: 'ORD' + Date.now(),

        customerName: req.body.name,

        phone: req.body.phone,

        address: req.body.address,

        items: req.body.items,

        totalAmount: req.body.totalAmount,

        date: new Date().toLocaleDateString(),

        status: "Pending"

    };

    orders.push(newOrder);

    writeDiary('orders.json', orders);

    console.log("Total Orders:", orders.length);
    console.log("Saving Order:", newOrder);


    res.json({

        message: 'ऑर्डर यशस्वीरीत्या नोंदवली गेली!',

        orderId: newOrder.orderId

    });

});


/*
res.json({
    message: "ऑर्डर यशस्वीरीत्या नोंदवली गेली!",
    orderId: newOrder.orderId
});
    orders.push(newOrder);
    writeDiary('orders.json', orders);
    res.json({ message: 'ऑर्डर यशस्वीरीत्या नोंदवली गेली!', orderId: newOrder.orderId });


/*
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'tirumala123') {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: 'चुकीचा युझरनेम किंवा पासवर्ड!' });
    }
}); */

app.post("/api/admin/login", (req, res) => {

    const admin = readAdmin();

    if (
        req.body.username === admin.username &&
        req.body.password === admin.password
    ) {

        res.json({ success: true });

    } else {

        res.status(401).json({
            success: false,
            message: "चुकीचा युझरनेम किंवा पासवर्ड!"
        });

    }

});

app.post("/api/admin/change-password", (req, res) => {

    const admin = readAdmin();

    if (req.body.currentPassword !== admin.password) {

        return res.json({
            success: false,
            message: "Current Password चुकीचा आहे."
        });

    }

    admin.password = req.body.newPassword;

    writeAdmin(admin);

    res.json({
        success: true,
        message: "Password Successfully Changed!"
    });

});

app.post("/api/admin/products", upload.single("image"), (req, res) => {

    const products = readDiary("products.json");

    const newProduct = {

        id: Date.now(),

        name: req.body.name,

        category: req.body.category,

        weight: req.body.weight,

        price: Number(req.body.price),

        type: req.body.type,

        desc: req.body.desc,

image: req.file
    ? "images/" + req.file.filename
    : ""
    };

    products.push(newProduct);

    writeDiary("products.json", products);

    res.json({

        success: true,

        message: "Product Added Successfully"

    });

});
app.delete('/api/admin/products/:id', (req, res) => {
    let products = readDiary('products.json');
    products = products.filter(p => p.id !== Number(req.params.id));
    writeDiary('products.json', products);
    res.json({ success: true, message: 'पदार्थ डिलीट केला गेला!' });
});

app.post('/api/feedbacks', (req, res) => {
    const feedbacks = readDiary('feedbacks.json');
    feedbacks.push({ id: Date.now(), customerName: req.body.name, rating: req.body.rating, comment: req.body.comment, date: new Date().toLocaleDateString() });
    writeDiary('feedbacks.json', feedbacks);
    res.json({ success: true, message: 'तुमचा मौल्यवान फीडबॅक मिळाला, धन्यवाद!' });
});
// Dashboard Statistics
app.get("/api/admin/dashboard", (req, res) => {

    const products = readDiary("products.json");
    const orders = readDiary("orders.json");
    const feedbacks = readDiary("feedbacks.json");

    const revenue = orders.reduce(
        (sum, order) => sum + Number(order.totalAmount || 0),
        0
    );

    res.json({
        totalProducts: products.length,
        totalOrders: orders.length,
        totalRevenue: revenue,
        totalFeedbacks: feedbacks.length
    });

});
app.post("/api/admin/products/update", upload.single("image"), (req, res) => {

    let products = readDiary("products.json");

    const index = products.findIndex(p => p.id == req.body.id);

    if (index === -1) {
        return res.status(404).json({
            success: false,
            message: "Product not found"
        });
    }

    products[index].name = req.body.name;
    products[index].category = req.body.category;
    products[index].weight = req.body.weight;
    products[index].price = Number(req.body.price);
    products[index].type = req.body.type;
    products[index].desc = req.body.desc;

    // नवीन image निवडली असेल तरच update कर
    if (req.file) {
        products[index].image = "images/" + req.file.filename;
    }

    writeDiary("products.json", products);

    res.json({
        success: true,
        message: "✅ Product Updated Successfully"
    });

});

// ==========================
// Get All Orders
// ==========================

app.get("/api/admin/orders", (req, res) => {

    const orders = readDiary("orders.json");

    res.json(orders);

});


app.get("/api/feedbacks", (req,res)=>{

    const feedbacks = readDiary("feedbacks.json");

    res.json(feedbacks);

});

// ==========================
// Complete Order
// ==========================

app.post("/api/admin/orders/complete", (req, res) => {

    let orders = readDiary("orders.json");

    const index = orders.findIndex(o => o.orderId == req.body.orderId);

    if (index === -1) {

        return res.json({
            success: false,
            message: "Order Not Found"
        });

    }

    orders[index].status = "Completed";

    writeDiary("orders.json", orders);

    res.json({
        success: true,
        message: "Order Completed"
    });

});

// ==========================
// Delete Order
// ==========================

app.delete("/api/admin/orders/:id", (req, res) => {

    let orders = readDiary("orders.json");

    orders = orders.filter(o => o.orderId != req.params.id);

    writeDiary("orders.json", orders);

    res.json({
        success: true,
        message: "Order Deleted"
    });

});
app.listen(PORT, () => {
    console.log(`✅ तिरुमला मार्केटिंग सर्व्हर यशस्वीरित्या सुरू झाला.
🌐 पत्ता: http://localhost:${PORT}`);
});