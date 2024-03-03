"flaxen-fabulous-trout" is an Simple API application with the following endpoints.

1. GET status check of the application
2. GET menu (lists the following parameters: pizza id, price and name of the pizza)
3. GET orders (lists the following parameters: order id, pizza id and name of the customer)
4. POST orders with fixed values (adds order to the order list with fixed values)
5. POST order auto placing (adds order to the order list with auto-generation/incoming request)
6. DELETE order by directly writing orderID into the http call.
7. DELETE order by inserting specific orderID into values of path variable.

Also it has 2 validations for customer name and pizza id.
