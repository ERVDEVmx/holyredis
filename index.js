var express = require("express");
var app = express();

//TODO: create a redis client
var redis = require("redis");
var client = redis.createClient();

// serve static files from public directory
app.use(express.static("public"));

// TODO: initialize values for: header, left, right, article and footer using the redis client
client.mset("header", 0, "left", 0, "article", 0, "right", 0, "footer", 0);
client.mget(
  ["header", "left", "article", "right", "footer"],
  function (err, value) {
    console.log(value);
  }
);

// Get values for holy grail layout
const mgetAsync = (keys) => {
  return new Promise((resolve, reject) => {
    client.mget(keys, (err, values) => {
      if (err) reject(err);
      else resolve(values);
    });
  });
};

async function data() {
  try {
    const values = await mgetAsync(["header", "left", "article", "right", "footer"]);

    return {
      header: Number(values[0]),
      left: Number(values[1]),
      article: Number(values[2]),
      right: Number(values[3]),
      footer: Number(values[4]),
    };
  } catch (err) {
    console.error(err);
    return null; 
  }
}

// get key data
app.get("/data", function (req, res) {
  data().then((data) => {
    console.log(data);
    res.send(data);
  });
});

// plus
app.get("/update/:key/:value", function (req, res) {
  const key = req.params.key;
  let value = Number(req.params.value);
   //TODO: use the redis client to update the value associated with the given key
  client.get(key, function (err, reply) {
    // new value
    value = Number(reply) + value;
    client.set(key, value);

    // return data to client
    data().then((data) => {
      console.log(data);
      res.send(data);
    });
  });
});


app.listen(3000, () => {
  console.log("Running on 3000");
});

process.on("exit", function () {
  client.quit();
});
