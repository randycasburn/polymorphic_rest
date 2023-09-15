# A Polymorphic Node RESTful API  
One Controller class - One DAO class for any enumerated dataType!  
Technically it is [Parametric Polymorphism](https://www.techopedia.com/definition/21247/parametric-polymorphism)

## CRUD operations on an Oracle database.

### Both Controller and DAO are polymorphic
#### What does that mean?
    A single (generic) controller can be used for numberous endpoints 
    A single (generic) DAO can be used to CRUD associated shapes (models) in the DB
There are Things and Wings in the database.
The endpoint URLs are:
- http://localhost:3000/things
- http://localhost:300/wings

Yet there is only one Controller class and one set of routes.  
There is also only one DAO class to handle BOTH shapes (things & wings)

#### How does it work?

_Enumerated Shapes (DataTypes/Models/Entities)_  
There is an Enum (like) structure found in [DataTypesEnum](./src/models/DataTypesEnum.js) that enumerates the available shapes that might be requested as a resource (URL). In the case of this simple app, those are Thing, Wings & number (because the id is passed as path param).

_Controller_  
There is a Controller method that validates the dataType of the request. The first thing it does is discover what shape was requested. It then invokes the DAO while passing the dataType.

_DAO_  
The DAO class also grabs the dataType from the Enum. Through some gymnastics with the Object, the fields are gathered from the DataType and the values are gathered from the request object (if necessary). It is then just a matter of dynamically constructing parameterized query statements to use with the DB.

Along the way, the appropriate error checks are in place to ensure the entire workflow stays sane.

An example use case could be an app that supports endpoints for:  
 - Bikes
 - DVDs
 - Laptops
 - Refrigerators
 - Aligators <---if you've read this far I'm proud of you 😂

#### Running the project

1. Edit .env - change the Oracle details (odb...)
2. Load the [schema](./data/schema.sql) into the DB
3. Load the [data](./data/data.sql) into the DB 
   3. Alternatively, use the [mockTestData](./data/mockTestData.json)
   4. You'll have to re-wicker the code
4. Install & Start
    - $ npm install
    - $ npm test
    - $ npm start
5. Call the requests/URLs found in the [requests](./requests.http) file 

