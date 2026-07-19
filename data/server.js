const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

const readDiary = (fileName) => {
    try {
        const filePath = path.join(__dirname, 'data', fileName);
        const data = fs.readFileSync(filePath, 'utf8').trim();

        if (!data) {
            return [];
        }

        return JSON.parse(data);
    } catch (err) {
        console.error(`Error reading ${fileName}:`, err.message);
        return [];
    }
};const writeDiary = (fileName, data) => fs.writeFileSync(path.join(__dirname, 'data', fileName), JSON.stringify(data, null, 2), 'utf8');

app.get('/api/products', (req, res) => res.json(readDiary('products.json')));

app.post('/api/orders', (req, res) => {
    const orders = readDiary('orders.json');
    const newOrder = {
        orderId: 'ORD' + Date.now(),
        customerName: req.body.name,
        phone: req.body.phone,
        address: req.body.address,
        items: req.body.items,
        totalAmount: req.body.totalAmount,
        date: new Date().toLocaleDateString()
    };
    orders.push(newOrder);
    writeDiary('orders.json', orders);
    res.json({ message: 'ऑर्डर यशस्वीरीत्या नोंदवली गेली!', orderId: newOrder.orderId });
});

app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'tirumala123') {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: 'चुकीचा युझरनेम किंवा पासवर्ड!' });
    }
});

app.post('/api/admin/products', (req, res) => {
    const products = readDiary('products.json');
    const newSnack = { id: Date.now(), name: req.body.name, category: req.body.category, weight: req.body.weight, price: Number(req.body.price), type: req.body.type };
    products.push(newSnack);
    writeDiary('products.json', products);
    res.json({ success: true, message: 'पदार्थ यशस्वीरीत्या जोडला गेला!' });
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
app.listen(PORT, () => {
    console.log(`✅ तिरुमला मार्केटिंग सर्व्हर यशस्वीरित्या सुरू झाला.
🌐 पत्ता: http://localhost:${PORT}`);
});