// const chai = require('chai');
// const { expect } = chai;
// // const { createEmployee } = require('./api'); // Replace with the correct path to your module
// const { updateEmployee } = require('./api'); // Replace with the correct path to your module
// const { marshall } = require('@aws-sdk/util-dynamodb');

// // describe('createEmployee', () => {
// //   it('should create an employee with valid input', async () => {
// //     const event = {
// //       body: JSON.stringify({
// //         firstName: 'John',
// //         lastName: 'raja',
// //         dob: '2022-04-17',
// //         adhaarSSN: '827364520459',
// //         gender: 'male',
// //         maritalStatus: 'married',
// //         passportPhoto: 'uploaded',
// //         address: '123 Main St',
// //         phone: '1234567890',
// //         personalEmail: 'john@example.com',
// //         emergencyContactPersonName: 'Bhargav',
// //         emergencyContactPersonPhone: '9876543210',
// //       }),
// //     };

// //     const response = await createEmployee(event);
// //     const responseBody = JSON.parse(response.body);

// //     // Assuming that your code returns a 200 status code for success
// //     expect(response.statusCode).to.equal(200);
// //     expect(responseBody.message).to.equal('Successfully created employee');
// //     // Add more assertions as needed
// //   });

// //   it('should handle missing required fields', async () => {
// //     const event = {
// //       body: JSON.stringify({
// //         // Missing required fields
// //       }),
// //     };

// //     const response = await createEmployee(event);

// //     expect(response.statusCode).to.equal(400);
// //     // Add assertions for the error response
// //   });

// //   it('should handle invalid input', async () => {
// //     const event = {
// //       body: JSON.stringify({
// //         firstName: 'John',
// //         lastName: 'Doe',
// //         dob: 'future-date', // Invalid date format
// //         // Add more invalid data here
// //       }),
// //     };

// //     const response = await createEmployee(event);

// //     expect(response.statusCode).to.equal(400);
// //     // Add assertions for the error response
// //   });

// //   // Add more test cases for different scenarios

// // });
// describe('updateEmployee', () => {
//   it('should update an employee with valid input', async () => {
//     const empId = '123'; // Replace with an existing employee ID
//     const event = {
//       pathParameters: { empId },
//       body: JSON.stringify({
//         firstName: 'UpdatedFirstName',
//         lastName: 'UpdatedLastName',
//         // Include other fields to update
//       }),
//     };

//     const response = await updateEmployee(event);
//     const responseBody = JSON.parse(response.body);

//     expect(response.statusCode).to.equal(200);
//     expect(responseBody.message).to.equal('Successfully updated employee');
//     // Add more assertions as needed
//   });

//   it('should handle invalid empId', async () => {
//     const empId = ''; // Invalid empId
//     const event = {
//       pathParameters: { empId },
//       body: JSON.stringify({
//         firstName: 'UpdatedFirstName',
//         lastName: 'UpdatedLastName',
//         // Include other fields to update
//       }),
//     };

//     const response = await updateEmployee(event);

//     expect(response.statusCode).to.equal(400);
//     // Add assertions for the error response
//   });

//   it('should handle invalid input', async () => {
//     const empId = '123'; // Replace with an existing employee ID
//     const event = {
//       pathParameters: { empId },
//       body: JSON.stringify({
//         // Invalid data
//       }),
//     };

//     const response = await updateEmployee(event);

//     expect(response.statusCode).to.equal(400);
//     // Add assertions for the error response
//   });
// });


// const { expect } = require('chai');
// const { createEmployee, updateEmployee } = require('./api');
// const {
//   DynamoDBClient,
// } = require('@aws-sdk/client-dynamodb');
// const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');
// // Mock DynamoDBClient to avoid making actual AWS calls
// const mockClient = {
//   send: () => ({}),
// };
// // Mock employee data for createEmployee
// const createEmployeeData = {
//     firstName : "Ashraf",
//     middleName: "raja",
//     lastName : "snajiv",
//     dob : "2022-04-17",
//     adhaarSSN : "827364520459",
//     gender : "male",
//     maritialStatus : "married",
//     passportPhoto: "uploaded",
//     address : "Hyniva, Hennur",
//     phone : "9564859456",
//     personalEmail : "snajiv@gmail..com",
//     emergencyContactPersonName: "Bhargav",
//     emergencyContactPersonPhone: "954758245"
//   };
// // Mock employee data for updateEmployee
// const updateEmployeeData = {
//   firstName : "Bhargav",
//   middleName: "raja",
//   lastName : "snajiv",
//   dob : "2022-04-17",
//   adhaarSSN : "827364520459",
//   gender : "male",
// };
// // Successfully create an employee
// // Successfully create an employee
// describe('createEmployee unit tests', () => {
//     let originalDynamoDBClient;
//     before(() => {
//       originalDynamoDBClient = DynamoDBClient;
//       DynamoDBClient.prototype.send = () => mockClient.send();
//     });
//     after(() => {
//       DynamoDBClient.prototype.send = originalDynamoDBClient.prototype.send;
//     });
//     it('successfully create an employee', async () => {
//       // Mock event object with employee data
//       let event = {
//         body: JSON.stringify(createEmployeeData),
//       };
//       const response = await createEmployee(event);
//       expect(response.statusCode).to.equal(200);
//       const responseBody = JSON.parse(response.body);
//       expect(responseBody.message).to.equal('Successfully created employee.'); // Correct the message if necessary
//     });
//     it('fails to create an employee with missing data', async () => {
//       // Mock event object with missing data
//       let event = {
//         body: JSON.stringify({}), // Missing required data
//       };
//       const response = await createEmployee(event);
//       expect(response.statusCode).to.equal(400); // Expecting an error response
//       expect(responseBody.message).to.equal('Missing required fields');
//     });
//     it('fails to create an employee with invalid data', async () => {
//       // Mock event object with invalid data
//       let event = {
//         body: JSON.stringify({
//           // Invalid data that should fail validation
//           firstName : "Bh", // Too short
//         }),
//       };
//       const response = await createEmployee(event);
//       expect(response.statusCode).to.equal(400); // Expecting an error response
//     });
//   });
  // Successfully update an employee
  // describe('updateEmployee unit tests', () => {
  //   let originalDynamoDBClient;
  //   before(() => {
  //     originalDynamoDBClient = DynamoDBClient;
  //     DynamoDBClient.prototype.send = () => mockClient.send();
  //   });
  //   after(() => {
  //     DynamoDBClient.prototype.send = originalDynamoDBClient.prototype.send;
  //   });
  //   it('successfully update an employee', async () => {
  //     // Mock event object with the employee ID and updated data
  //     let event = {
  //       pathParameters: {
  //         empId: '13', // Assuming this empId exists
  //       },
  //       body: JSON.stringify(updateEmployeeData),
  //     };
  //     const response = await updateEmployee(event);
  //     expect(response.statusCode).to.equal(200);
  //     const responseBody = JSON.parse(response.body);
  //     expect(responseBody.message).to.equal('Successfully updated employee.'); // Correct the message if necessary
  //   });
  //   it('fails to update an employee with invalid data', async () => {
  //     // Mock event object with invalid data
  //     let event = {
  //       pathParameters: {
  //         empId: '13', // Assuming this postId exists
  //       },
  //       body: JSON.stringify({
  //         // Invalid data that should fail validation
  //         firstName : "Bh", // Too short
  //       }),
  //     };
  //     const response = await updateEmployee(event);
  //     expect(response.statusCode).to.equal(400); // Expecting an error response
  //   });
  // });


// const chai = require('chai');
// const chaiHttp = require('chai-http');
// const { createEmployee } = require('./api'); // Import your Lambda function
// const should = chai.should();

// chai.use(chaiHttp);

// describe('createEmployee', () => {
//   it('should create a new employee with valid data', (done) => {
//     const event = {
//       body: JSON.stringify({
//         firstName: 'John',
//         middleName: 'Doe',
//         lastName: 'Smith',
//         dob: '1990-01-15',
//         adhaarSSN: '1234567890',
//         gender: 'male',
//         maritalStatus: 'single',
//         passportPhoto: 'fdjkdhkghdjdf',
//         address: '123 Main St, City',
//         phone: '1234567890',
//         personalEmail: 'john@example.com',
//         emergencyContactPersonName: 'Jane Doe',
//         emergencyContactPersonPhone: '9876543210',
//       }),
//     };

//     createEmployee(event).then((response) => {
//       response.statusCode.should.equal(200); // Check if the status code is as expected
//       const responseBody = JSON.parse(response.body);
//       responseBody.should.have.property('message', 'Successfully created employee.');
//       responseBody.should.have.property('empId'); // Assuming empId is generated and returned
//       // Add more assertions based on the expected behavior
//       done();
//     }).catch(done); // Handle any errors
//   });

//   it('should return a 400 error when required fields are missing', (done) => {
//     const event = {
//       body: JSON.stringify({
//         // Missing required fields
//       }),
//     };

//     createEmployee(event).then((response) => {
//       response.statusCode.should.equal(400); // Check if the status code is as expected
//       const responseBody = JSON.parse(response.body);
//       responseBody.should.have.property('message', 'Failed to create employee.');
//       responseBody.should.have.property('errorMsg'); // Assuming an error message is returned
//       // Add more assertions based on the expected behavior
//       done();
//     }).catch(done); // Handle any errors
//   });

//   // Add more test cases for different scenarios, such as invalid email format, etc.
// });


// const mocha = require("mocha");
// const { expect } = require("chai");
// const proxyquire = require("proxyquire");
// const sinon = require("sinon");
// const MOCK_Employee_data = require("./mock.json");
// const createEmployee = require('./api.js')
// mocha.describe("createEmployee", () => {
//   const fetchStub = sinon.stub();
//   fetchStub.resolves(MOCK_Employee_data);
//   const createEmployee = proxyquire(
//      "./api.js",
//      {
//       "node-fetch": fetchStub
//      }
//     );
//   it("should create employee", async () => {
//     await createEmployee();
//     expect(fetchStub).to.have.been.calledOnceWithExactly(
//       //  " https://gppwmk5fni.execute-api.ap-south-1.amazonaws.com/dev/employee"
//       {
//         "firstName" : "Prasad",
//         "middleName": "raja",
//         "lastName" : "snajiv",
//         "dob" : "2022-04-17",
//         "adhaarSSN" : "827364520459",
//         "gender" : "mal",
//         "maritialStatus" : "married",
//         "passportPhoto": "uploaded",
//         "address" : "Hyniva, Hennur",
//         "phone" : "9564859456",
//         "personalEmail" : "snajiv@gmail..com",
//         "emergencyContactPersonName": "Bhargav",
//         "emergencyContactPersonPhone": "954758245"
//     }
//       );
//   });
// });

// const assert = require('chai').assert;
// const expect = require('chai').expect;
// const lambdaTester = require('lambda-tester');
// const mockRequire = require('mock-require');
// const createEmployee = require('../api')
// // const index = require("../index");
// describe("Lambda Tests", function(){
//     describe("Successful Invocation", function(){
//         it("Successful Invocation with results", function(done) {
//             const mockData = {
//                     firstName : "Ashraf",
//                     middleName: "raja",
//                     lastName: "snajiv",
//                     dob : "2022-04-17",
//                     adhaarSSN : "827364",
//                     gender : "male",
//                     maritialStatus : "married",
//                     passportPhoto: "uploaded",
//                     address: "Hyniva, Hennur",
//                     phone : "9564859456",
//                     personalEmail : "snajiv@gmail..com",
//                     emergencyContactPersonName: "Bhargav",
//                     emergencyContactPersonPhone: "954758245"
//             };
//             lambdaTester(createEmployee).event(mockData)
//             .expectResult((result) => {
//                 expect(result.status).to.exist;
//                 expect(result.code).to.exist;
//                 expect(result.data).to.exist;
//                 assert.equal(result.status, "success");
//                 assert.equal(result.code, 200);
//                 assert.equal(result.data, "Employee Created sucessfully!");
//             }).then(() => done())
//         });
//     });
//     describe("Failed Invocation", function(){
//         it("Unsuccessful invocation", function(done) {
//             const mockData = {
//                 "firstName" : "Ashraf1",
//                 "middleName": "raja1",
//                 "lastName" : "snajiv1",
//                 "dob" : "2022-04-16",
//                 "adhaarSSN" : "8273645",
//                 "gender" : "female",
//                 "maritialStatus" : "unmarried",
//                 "passportPhoto": "upload",
//                 "address" : "Hyniva, Henn",
//                 "phone" : "95648594564",
//                 "personalEmail" : "snajiv1@gmail..com",
//                 "emergencyContactPersonName": "Bhargav2",
//                 "emergencyContactPersonPhone": "95475824511"
//             };
//             lambdaTester(createEmployee).event(mockData)
//             .expectError((result) => {
//                 expect(result.status).to.exist;
//                 expect(result.code).to.exist;
//                 expect(result.data).to.exist;
//                 assert.equal(result.status, "failure");
//                 assert.equal(result.code, 400);
//                 assert.equal(result.data, "Missing searchId in the request");
//             }).then(() => done()).catch( (err) => console.log(err))
//         });
//     });
// })

// const { expect } = require('chai');
// const { createEmployee } = require('../api'); // Replace 'your-module-name' with the actual path to your module


// describe('createEmployee', () => {
//     it('should create an employee successfully with valid input', async () => {
//       const event = {
//         body: JSON.stringify({
//           firstName: 'John',
//           middleName: 'Doe',
//           lastName: 'Smith',
//           dob: '1990-01-01',
//           adhaarSSN: '1234567890',
//           gender: 'male',
//           maritialStatus: 'single',
//           passportPhoto: 'abdsvfhdsgfv',
//           address: '123 Main St, City',
//           phone: '1234567890',
//           personalEmail: 'john@example.com',
//           emergencyContactPersonName: 'Jane Doe',
//           emergencyContactPersonPhone: '9876543210',
//         }),
//       };
  
//       const response = await createEmployee(event);
  
//       expect(response.statusCode).to.equal(200);
//       const responseBody = JSON.parse(response.body);
//       expect(responseBody.message).to.equal('Successfully created employee.');
//       expect(responseBody.empId).to.be.a('string');
//     });
  
//     it('should return a 400 error with invalid input', async () => {
//       const event = {
//         body: JSON.stringify({
//           // Missing required fields intentionally
//         }),
//       };
  
//       const response = await createEmployee(event);
  
//       expect(response.statusCode).to.equal(400);
//       const responseBody = JSON.parse(response.body);
//       expect(responseBody.message).to.equal('Failed to create employee.');
//       expect(responseBody.errorMsg).to.include('Missing required fields');
//     });
  
//     // Add more test cases for validation, error handling, etc.
//   });
  

// Import necessary modules and your Lambda function
const { expect } = require('chai');
const { getEmployee } = require('../api'); // Update the path

// Mock AWS DynamoDB client
const mockDynamoDBClient = {
  send: (command) => {
    // Simulate a successful response when empId is found
    if (command.name === 'GetItemCommand') {
      return {
        Item: {
          empId: '123',
          firstName: 'John',
          lastName: 'Doe',
        },
      };
    }
    return {};
  },
};

// Mock event object with path parameters
const mockEvent = {
  pathParameters: {
    empId: '123',
  },
};

describe('getEmployee Lambda Function', () => {
  it('should retrieve an employee with a valid empId', async () => {
    const response = await getEmployee(mockEvent, {}, mockDynamoDBClient);

    expect(response.statusCode).to.equal(200);
    const body = JSON.parse(response.body);
    expect(body.message).to.equal('Successfully retrieved employee.');
    expect(body.data.empId).to.equal('123');
    // Add more assertions as needed
  });

  it('should handle a missing empId parameter', async () => {
    const response = await getEmployee({}, {}, mockDynamoDBClient);

    expect(response.statusCode).to.equal(500); // Status code for internal server error
    const body = JSON.parse(response.body);
    expect(body.message).to.equal('Failed to get employee: empId parameter is missing');
    // Add more assertions as needed
  });

  it('should handle an employee not found', async () => {
    // Modify the mockDynamoDBClient to return an empty response
    const modifiedMockDynamoDBClient = {
      send: (command) => ({}),
    };

    const response = await getEmployee(mockEvent, {}, modifiedMockDynamoDBClient);

    expect(response.statusCode).to.equal(404); // Status code for not found
    const body = JSON.parse(response.body);
    expect(body.message).to.equal('Employee with empId 123 not found');
    // Add more assertions as needed
  });

  // Add more test cases to cover other scenarios
});

