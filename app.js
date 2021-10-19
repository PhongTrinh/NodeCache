const express = require('express');
const axios = require("axios");
//For node-cache
const NodeCache = require("node-cache");

const app = express();
//Remains in the cache will have a lifetime of fifteen seconds
const cache = new NodeCache({stdTTL: 15});


//Middleware
const verifyCache = (req, res, next) => {
    try {
        const {id} = req.params;
        if (cache.has(id)) {
            return res.status(200).json(cache.get(id));
        }
        return next();
    } catch (err) {
        throw new Error(err);
    }
};


//Create a simple API
app.get("/", (req, res) => {
    return res.json({message: "Hello world Cached!"})
});

//Create the route to fetch a whole to the external API:
app.get("/todos/:id", verifyCache, async(req, res) => {
    try {
        const {id} = req.params;
        const {data} = await axios.get(`https://jsonplaceholder.typicode.com/todos/${id}`);
        //Using internal cached
        cache.set(id, data);
        return res.status(200).json(data);
    } catch({response}) {
        return res.sendStatus(response.status);
    }
});

const start = (port) => {
    try {
        app.listen(port);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

start(3000);