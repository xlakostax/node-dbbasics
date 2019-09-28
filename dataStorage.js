'use strict';

const Database = require('./database.js');
const fatalError = err => new Error(`Error: ${err.message}`); // should never be seen by users

const getAllCustomers = 'select customerId, firstname, lastname, customerclass, favoritIceCream from customer';
const getCustomer = 'select customerId, firstname, lastname, customerclass, favoritIceCream from customer ' + 'where customerId=?';

const addCustomer = 'INSERT INTO customer (customerId, firstname, lastname, customerclass, favoritIceCream) ' + 'values(?,?,?,?,?)';
const customerValues = customer => [+customer.customerId, customer.firstname, customer.lastname, customer.customerclass, customer.favoritIceCream];

const updateCustomer = 'UPDATE customer SET firstname=?, lastname=?, customerclass=?, favoritIceCream=? WHERE customerId=?';
const customerValuesUpdate = customer => [customer.firstname, customer.lastname, customer.customerclass, customer.favoritIceCream, +customer.customerId];

const deleteCustomer = 'DELETE FROM customer WHERE customerId=?';

module.exports = class CustomerDataStorage {
  constructor() {
    this.customerDb = new Database({
      'host': 'localhost',
      'port': 3306,
      'user': 'muhammad',
      'password': 'bTAzGCyY',
      'database': 'customerdb'
    })
  }

  getAll() {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await this.customerDb.doQuery(getAllCustomers);
        resolve(result.queryResult);
      } catch (err) {
        reject(fatalError(err));
      }
    })
  }

  get(customerId) {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await this.customerDb.doQuery(getCustomer, [+customerId]);
        if (result.queryResult.length === 0) {
          reject(new Error('Customer isn\'t found'))
        } else {
          resolve(result.queryResult[0]);
        }
      } catch (err) {
        reject(new Error(`Error: ${err.message}`))
      }
    })
  }

  add(customer){
    return new Promise(async(resolve, reject)=>{
      try {
        const result = await this.customerDb.doQuery(addCustomer, customerValues(customer));
        if(result.queryResult.rowsAffected === 0) {
          reject(new Error(`No customer was added`));
        } else {
          resolve(`Customer with ID ${customer.customerId} was added`);
        }
      }
      catch(err) {
        reject(new Error(`Error: ${err.message}`));
      }
    })
  }

  update(customer){
    return new Promise(async(resolve, reject)=>{
      try {
        const result = await this.customerDb.doQuery(updateCustomer, customerValuesUpdate(customer));
        if(result.queryResult.rowsAffected === 0) {
          resolve(`No data was updated!`);
        } else {
          resolve(`Customer with ID ${customer.customerId} was updated!`);
        }
      }
      catch(err) {
        reject(new Error(`Error: ${err.message}`));
      }
    })
  }

  delete(customerId){
    return new Promise(async (resolve, reject)=>{
      try {
        const result = await this.customerDb.doQuery(deleteCustomer, [+customerId]);
        if(result.queryResult.rowsAffected === 0) {
          resolve('No customer with given ID. Nothing to delete');
        } else {
          resolve(`Customer with ID ${customerId} was deleted`);
        }
      }
      catch(err) {
        reject(new Error(`Error: ${err.message}`));
      }
    })
  }
}; // End of the class
