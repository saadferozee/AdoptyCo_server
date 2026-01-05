require('dotenv').config()
const express = require('express')
const cors = require('cors')
const port = process.env.PORT || 3568

const app = express()
app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://adoption-web-by-saadferozee.web.app"
    ],
    credentials: true
}));
app.use(express.json())

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster-pet-adoption-we.9wpgqt6.mongodb.net/?appName=Cluster-pet-adoption-web`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


app.listen(port, () => {
    console.log(`Server is running from ${port}`);
})

async function run() {
    try {

        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        // here is my code
        app.get('/', (req, res) => {
            res.send('hello from my database.')
        })

        const database0 = client.db('users')
        const users = database0.collection('user-list')

        app.post('/add-user', async (req, res) => {
            const user = req.body
            // Add timestamp for user registration
            user.createdAt = new Date().toISOString()
            user.registrationDate = new Date().toISOString()
            user.updatedAt = new Date().toISOString()
            // Set default role if not provided
            if (!user.role) {
                user.role = 'user'
            }
            const result = await users.insertOne(user)
            res.send(result)
        })
        app.get('/users', async (req, res) => {
            const result = await users.find().toArray()
            res.send(result)
        })
        app.get('/users/user/:email', async (req, res) => {
            const { email } = req.params
            const query = { email: email }
            const result = await users.findOne(query)
            if (!result) {
                return res.send(false);
            }
            res.send(result.email === email || false)
        })
        app.get('/users/info', async (req, res) => {
            const { email } = req.query
            const query = { email: email }
            const result = await users.findOne(query)
            if (!result) {
                return res.send(false);
            }
            res.send({ role: result.role })
        })

        // Update user role
        app.put('/users/role/:id', async (req, res) => {
            try {
                const { id } = req.params
                const { role } = req.body
                const query = { _id: new ObjectId(id) }
                const updateDoc = {
                    $set: {
                        role: role,
                        updatedAt: new Date().toISOString()
                    }
                }
                const result = await users.updateOne(query, updateDoc)
                res.send(result)
            } catch (error) {
                console.error('Error updating user role:', error)
                res.status(500).send({ error: 'Failed to update user role' })
            }
        })

        // Delete user
        app.delete('/users/:id', async (req, res) => {
            try {
                const { id } = req.params
                const query = { _id: new ObjectId(id) }
                const result = await users.deleteOne(query)
                res.send(result)
            } catch (error) {
                console.error('Error deleting user:', error)
                res.status(500).send({ error: 'Failed to delete user' })
            }
        })

        const database = client.db('listings')
        const listings = database.collection('pet-listings')

        app.post('/listings', async (req, res) => {
            const data = req.body;
            const result = await listings.insertOne(data)
            res.send(result)
        })
        app.get('/listings', async (req, res) => {
            const result = await listings.find().toArray()
            res.send(result)
        })
        app.get('/listings/recentListings', async (req, res) => {
            const result = await listings.find().sort({ _id: -1 }).limit(6).toArray()
            res.send(result)
        })
        app.get('/listings/product/:id', async (req, res) => {
            const { id } = req.params
            const query = { _id: new ObjectId(id) }
            const result = await listings.findOne(query)
            res.send(result)
        })
        app.get('/listings/myListings/:email', async (req, res) => {
            const { email } = req.params
            const query = { email: email }
            const result = await listings.find(query).toArray()
            res.send(result)
        })
        app.get('/listings/category/:category', async (req, res) => {
            const { category } = req.params
            const query = { category: category }
            const result = await listings.find(query).toArray()
            res.send(result)
        })
        app.put('/listings/update/:id', async (req, res) => {
            const data = req.body
            const { id } = req.params
            const query = { _id: new ObjectId(id) }
            const updatedProductDetails = {
                $set: data
            }
            const result = await listings.updateOne(query, updatedProductDetails)
            res.send(result)
        })
        app.delete('/listings/delete/:id', async (req, res) => {
            const { id } = req.params
            const query = { _id: new ObjectId(id) }
            const result = await listings.deleteOne(query)
            res.send(result)
        })

        const database2 = client.db('orders')
        const orders = database2.collection('product-orders')

        app.post('/orders', async (req, res) => {
            const data = req.body;
            const result = await orders.insertOne(data)
            res.send(result)
        })
        app.get('/orders', async (req, res) => {
            const result = await orders.find().toArray()
            res.send(result)
        })
        app.get('/orders/:email', async (req, res) => {
            const { email } = req.params
            const query = { buyerEmail: email }
            const result = await orders.find(query).toArray()
            res.send(result)
        })

        // Update order status
        app.put('/orders/status/:id', async (req, res) => {
            try {
                const { id } = req.params
                const { status } = req.body
                
                console.log('Updating order status:', { id, status })
                
                // Validate ObjectId
                if (!ObjectId.isValid(id)) {
                    return res.status(400).send({ error: 'Invalid order ID format' })
                }
                
                const query = { _id: new ObjectId(id) }
                const updateDoc = {
                    $set: {
                        status: status,
                        updatedAt: new Date().toISOString()
                    }
                }
                
                const result = await orders.updateOne(query, updateDoc)
                
                if (result.matchedCount === 0) {
                    return res.status(404).send({ error: 'Order not found' })
                }
                
                console.log('Order status updated successfully:', result)
                res.send(result)
            } catch (error) {
                console.error('Error updating order status:', error)
                res.status(500).send({ error: 'Failed to update order status' })
            }
        })

        // Delete order
        app.delete('/orders/:id', async (req, res) => {
            try {
                const { id } = req.params
                const query = { _id: new ObjectId(id) }
                const result = await orders.deleteOne(query)
                res.send(result)
            } catch (error) {
                console.error('Error deleting order:', error)
                res.status(500).send({ error: 'Failed to delete order' })
            }
        })

        // my code end here

        // Analytics endpoints
        app.get('/analytics/dashboard-stats', async (req, res) => {
            try {
                const now = new Date();
                const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

                // Get all data
                const [allUsers, allListings, allOrders] = await Promise.all([
                    users.find().toArray(),
                    listings.find().toArray(),
                    orders.find().toArray()
                ]);

                // Calculate stats
                const totalUsers = allUsers.length;
                const totalListings = allListings.length;
                const totalOrders = allOrders.length;

                const newUsersThisMonth = allUsers.filter(user => 
                    new Date(user.createdAt || user.registrationDate) >= thisMonth
                ).length;

                const newListingsThisWeek = allListings.filter(listing => 
                    new Date(listing.date) >= thisWeek
                ).length;

                const ordersToday = allOrders.filter(order => 
                    new Date(order.date) >= today
                ).length;

                const revenueThisMonth = allOrders
                    .filter(order => new Date(order.date) >= thisMonth)
                    .reduce((sum, order) => sum + (order.price || 0), 0);

                res.send({
                    totalUsers,
                    totalListings,
                    totalOrders,
                    newUsersThisMonth,
                    newListingsThisWeek,
                    ordersToday,
                    revenueThisMonth
                });
            } catch (error) {
                console.error('Analytics error:', error);
                res.status(500).send({ error: 'Failed to fetch analytics data' });
            }
        });

        app.get('/analytics/user-growth', async (req, res) => {
            try {
                const { days = 30 } = req.query;
                const daysCount = parseInt(days);
                
                const dateRange = Array.from({ length: daysCount }, (_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() - (daysCount - 1 - i));
                    return date.toISOString().split('T')[0];
                });

                const allUsers = await users.find().toArray();
                
                const growthData = dateRange.map(date => {
                    const count = allUsers.filter(user => {
                        const userDate = new Date(user.createdAt || user.registrationDate);
                        return userDate.toISOString().split('T')[0] === date;
                    }).length;
                    return { date, count };
                });

                res.send(growthData);
            } catch (error) {
                console.error('User growth analytics error:', error);
                res.status(500).send({ error: 'Failed to fetch user growth data' });
            }
        });

        app.get('/analytics/listings', async (req, res) => {
            try {
                const allListings = await listings.find().toArray();
                
                // Category distribution
                const categoryCount = allListings.reduce((acc, listing) => {
                    acc[listing.category] = (acc[listing.category] || 0) + 1;
                    return acc;
                }, {});

                // Recent listings trend (last 30 days)
                const last30Days = Array.from({ length: 30 }, (_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() - (29 - i));
                    return date.toISOString().split('T')[0];
                });

                const listingTrend = last30Days.map(date => {
                    const count = allListings.filter(listing => {
                        const listingDate = new Date(listing.date);
                        return listingDate.toISOString().split('T')[0] === date;
                    }).length;
                    return { date, count };
                });

                res.send({
                    categoryDistribution: categoryCount,
                    listingTrend
                });
            } catch (error) {
                console.error('Listing analytics error:', error);
                res.status(500).send({ error: 'Failed to fetch listing analytics' });
            }
        });

        app.get('/analytics/orders', async (req, res) => {
            try {
                const allOrders = await orders.find().toArray();
                
                // Order trends (last 30 days)
                const last30Days = Array.from({ length: 30 }, (_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() - (29 - i));
                    return date.toISOString().split('T')[0];
                });

                const orderTrend = last30Days.map(date => {
                    const dayOrders = allOrders.filter(order => {
                        const orderDate = new Date(order.date);
                        return orderDate.toISOString().split('T')[0] === date;
                    });
                    
                    const count = dayOrders.length;
                    const revenue = dayOrders.reduce((sum, order) => sum + (order.price || 0), 0);
                    
                    return { date, count, revenue };
                });

                // Top products by orders
                const productCount = allOrders.reduce((acc, order) => {
                    acc[order.productName] = (acc[order.productName] || 0) + 1;
                    return acc;
                }, {});

                const topProducts = Object.entries(productCount)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 10)
                    .map(([name, count]) => ({ name, count }));

                res.send({
                    orderTrend,
                    topProducts
                });
            } catch (error) {
                console.error('Order analytics error:', error);
                res.status(500).send({ error: 'Failed to fetch order analytics' });
            }
        });

        // my code end here

        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);
