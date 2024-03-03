// This is where the app starts

// Load external libraries
const express = require("express"); // api
const low = require("lowdb"); // database
const { nanoid } = require('nanoid'); // unique ids

// Setup a new database
const db = low(".data/db.json", { // Here, db is database object.
  storage: require("lowdb/lib/storages/file-async")
});



//START----------DEFINING DATABASE

db.defaults({ pizzas: [], orders: []}).write();  
//in this section we are defining the database. we are storing 2 kinds of objects in our database.
//pizzas is object
//orders is object
//but now, both of them is empty

const pizzalar=[  //const(constant) is a keyword that defines a variable. pizzalar is the name of the variable. 
      {id: 1,
       name: "sosisli pizza",
       price: 12.99
      },
      {id: 2,
       name: "ananaslı pizza",
       price: 15.99
      },
      {id: 3,
       name: "karışık pizza",
       price: 10.99
      },
      {id: 4,
       name: "vegan pizza",
       price: 9.99
      },
      {id: 5,
       name: "acılı pizza",
       price: 4.99
      }
      ];
//we defined variables for pizzas

db.set('pizzas', pizzalar).write(); 
//set is a function. Here, we use it to set the data.
//pizzalar variable'ına reference vererek pizzas object'inin içini data ile setlemiş olduk.
//json formatındaki db'mizin içinde şimdi ne var görebilmek için şu komutu kullan : terminal >> cat .data/db.json

//END----------DEFINING DATABASE




// Setup API
const app = express();
app.use(express.json());



// Status endpoint
app.get("/status", function(request, response) {
  response.send("Hellolardan bir demet status OK");
});




//START----------GETTING DATA FROM DATABASE

/*
menüde ne olduğunu insanlara göstermemiz lazım...
json fromatındaki db'de veya kodun içinde neyimiz var neyimiz yok şu aşamada kimse bilmiyor sonuçta.
bunun için bir endpoint tanımlayacağız. 
bu endpoint sayesinde db'mizdeki variable'ları yani elimizdeki pizzaların listesini insanlara göstereceğiz.
*/

// pizzas endpoint
app.get("/pizzas", function(request, response) {
  const data = db.get('pizzas').value(); 
  //data is the name of the variable.
  //db'den info çekmeye çalışıyor o yüzden db yazdık.
  //get is a function. 
  //value is a function. information'ı bize göstermesini sağlıyor.
  response.send(data); 
  // data ismindeki variable'mız bir string olmadığı için bu sefer çift tırnak kullanmıyoruz.
});
//artık postman'e gidip GET https://flaxen-fabulous-trout.glitch.me/pizzas yapınca verileri görebiliyoruz.
//bu endpoint sayesinde db'den bilgiyi okutup API aracılığıyla ulaşılabilir kıldık.

//END----------GETTING DATA FROM DATABASE





//START----------SAVE TO DATABASE

/*
şuana kadar elimizde insanların sipariş verebileceği tüm pizzaların listesini içeren menümüz olmuş oldu.
şimdi artık müşterilerden sipariş almamızı sağlayan bir endpoint ihtiyacımız oluştu.
*/

// place order endpoint
app.post("/placeorder", function(request, response) {
  //get yerine post kullandık bu sefer. bu endpoint bir siparişi manuel eklemeye yarar.
    const order = {
       id: nanoid(), //unique bir id yaratmak için nanoid isimli function'ı kullandık. en başta library olarak yüklemiştik bunu.
       pizzaId: 2,
       customer: "Amy"
      };
  db.get('orders').push(order).write();
  //get: we are trying to get the orders to work with the orders object.
  //push: we dont want to get them to retrieve them, we want to add additional information, so we use push.
  //push(order): order'ı eklemek(push etmek) istediğimiz için push fonksiyonunun içinde order'a referans verdik.
  response.send("Order received");
});
//json formatındaki db'mizin içinde artık bu order'ın da olduğunu görebilmek için komutu kullan : terminal >> cat .data/db.json

//END----------SAVE TO DATABASE




// Assignment: get order endpoint
app.get("/orders", function(request, response) {
  const data2 = db.get('orders').value(); 
  response.send(data2); 
}); // bu endpoint orderların listesini gösterir.






//START----------HOW TO READ DATA FROM INCOMING REQUEST

// Assignment: take order endpoint. bu endpoint order detaylarını dışarıdan almaya yarar. 
/*sadece pizzaId ve customer bilgilerini dışarıdan alacağız. id: nanoid zaten unique bir şekilde create ettiriyoruz.
postman'de >> post request >> body >> raw >> dropdown:JSON
{"pizzaId": 1,"customer": "{{$randomFirstName}}"}
api'yi javascript yazıyoruz ama postman dili json, o yüzden variable'lara çift tırnak ekledik.
*/
app.post("/orders", function(request, response) {
  //get yerine post kullandık bu sefer. bu endpoint bir siparişi otomatik eklemeye yarar.
  //user'dan alacaklarımızı tanımlamak için function'daki request variable'ını kullanacağız.
  
  const customer = request.body.customer;    
  if (!customer || customer.length < 2) {
    response.status(400);
    response.send("customer name is invalid"); 
      };
  
  const pizzaId = request.body.pizzaId;  
  if (db.get('pizzas').filter({id:pizzaId}).value().length !==1 ) {
    response.status(400);
    response.send("pizzaId is invalid (look at the get pizzas endpoint and check the pizza id list)"); 
      };
  
  const order = {
       id: nanoid(), 
       pizzaId: request.body.pizzaId, 
      // request objectinin içindeki body property'yi alıyoruz, ve bu body de pizzaId'yi içerecek diyoruz.
      // artık request'in body'sinden pizzaid bilgisini dışarıdan alabilmiş olacağız.
       customer: request.body.customer
      // artık request'in body'sinden customer bilgisini dışarıdan alabilmiş olacağız.
      };
  //bu endpoint'i post olacak şekilde bir kez çalıştır, sonra artık order listesine bir kayıt daha eklendiğini gör.
  //listeye bakmak için /orders endpoint'ini get olarak çalıştırabilirsin.

  db.get('orders').push(order).write();
  //get: we are trying to get the orders to work with the orders object.
  //push: we dont want to get them to retrieve them, we want to add additional information, so we use push.
  //push(order): order'ı eklemek(push etmek) istediğimiz için push fonksiyonunun içinde order'a referans verdik.
  response.send("Order received");
});

//END----------HOW TO READ DATA FROM INCOMING REQUEST




//START----------DELETING DATA (specific order) FROM DATABASE
//Bazı order'ları teslim ettiğimizi ve artık o order'ı db'den silmemiz gerektiğini varsayalım.
// Delete order endpoint
app.delete("/orders/:orderID", function(request, response) {
  const orderID = request.params.orderID; 
  db.get('orders').remove({id: orderID}).write();
  response.send("Order deleted: " + orderID); 
});
//END----------DELETING DATA FROM DATABASE






// Listed for incomming requests
const listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});

