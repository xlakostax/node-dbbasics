'use strict';

const http = require('http'); // not necessary to write it
const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;
const host = process.env.HOST || 'localhost';
const server = http.createServer(app);
const CustomerDataStorage = require('./dataStorage.js');
const dataStorage = new CustomerDataStorage();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'pageviews'));
app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'menu.html'))
);
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

/*-----------------------------*/
/*    Get all the customers    */
/*-----------------------------*/

app.get('/getallcustomers', (req, res) => dataStorage.getAll()
  .then(result => res.render('allcustomers', {
    result
  }))
  .catch(err => console.log(err.message))
);

/*-----------------------------*/
/*     Get a customer by id    */
/*-----------------------------*/

app.get('/getcustomer', (req, res) =>
  res.render('getcustomer', {
    title: 'Get a customer',
    header: 'Get a customer',
    action: '/getcustomer'
  })
);

app.post('/getcustomer',(req, res) => {
  if(!req.body) res.SendErrorPage('Not found');
  const customerId = req.body.customerId;
  dataStorage.get(customerId)
    .then(customer => res.render('customerPage', {result: customer}))
    .catch(error => sendErrorPage(res, error.message))
});

/*-----------------------------*/
/*    Add a customer to db     */
/*-----------------------------*/

app.get('/addcustomer', (req, res)=>{
  res.render('form', {
    header:'Add a customer',
    title:'Add a customer',
    action:'/addcustomer',
    customerId: {
      value: '',
      readonly: ''
    },
    firstname: {
      value: '',
      readonly: ''
    },
    lastname: {
      value: '',
      readonly: ''
    },
    customerclass: {
      value: '',
      readonly: ''
    },
     favoritIceCream: {
      value: '',
      readonly: ''
    }
  });
});

app.post('/addcustomer', (req,res)=>{
  if(!req.body) sendErrorPage(req, 'Not found');
  dataStorage.add(req.body)
       .then(message => sendStatusPage(res, message))
       .catch(error => sendErrorPage(res, error.message));
});

/*-----------------------------*/
/*   Update a customer by db   */
/*-----------------------------*/

app.get('/updateform', (req, res)=>{
  res.render('form', {
    header: 'Update a customer',
    action: '/updatecustomer',
    customerId: {
      value: '',
      readonly: ''
    },
    firstname: {
      value: '',
      readonly: 'readonly'
    },
    lastname: {
      value: '',
      readonly: 'readonly'
    },
    customerclass: {
      value: '',
      readonly: 'readonly'
    },
    favoritIceCream: {
      value: '',
      readonly: 'readonly'
    }
  });
});

app.post('/updatecustomer', async (req, res) => {
  const customerId = req.body.customerId;
  try {
    const customer = await dataStorage.get(customerId);
    res.render('form', {
      header: 'Update a customer',
      action: '/update',
      customerId: {
        value: customer.customerId,
        readonly: 'readonly'
      },
      firstname: {
        value: customer.firstname,
        readonly: ''
      },
      lastname: {
        value: customer.lastname,
        readonly: ''
      },
      customerclass: {
        value: customer.customerclass,
        readonly: ''
      },
      favoritIceCream: {
        value: customer.favoritIceCream,
        readonly: ''
      }
    });
  }
  catch(err) {
    sendErrorPage(res, err.message)
  }
 });

 app.post('/update', (req, res) =>{
    if(!req.body) sendErrorPage(res, 'Not found');
    dataStorage.update(req.body)
      .then(message => sendStatusPage(res, message))
      .catch(error => sendErrorPage(res, error.message));
});

/*-----------------------------*/
/*  Delete a customer from db  */
/*-----------------------------*/

app.get('/deletecustomer', (req, res)=>{
  res.render('deletecustomer', {
    header:'Delete a customer',
    title:'Delete a customer',
    action:'/delete'
  });
});

app.post('/delete', (req,res)=>{
  if(!req.body) sendErrorPage(res, 'Not found');
  dataStorage.delete(req.body.customerId)
    .then(message => sendStatusPage(res, message))
    .catch(error => sendErrorPage(res, error.message));
});

server.listen(port, host, () =>
  console.log(`Server ${host} is server at port ${port}.`)
);

function sendErrorPage(res, message) {
  res.render('statusPage', {title: 'Error', header: 'Error', message: message});
}

function sendStatusPage(res, message) {
  res.render('StatusPage', {title:'Status', header:'Status', message: message})
}
