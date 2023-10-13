const {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  DeleteItemCommand,
  ScanCommand,
  UpdateItemCommand,
} = require('@aws-sdk/client-dynamodb');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');

const client = new DynamoDBClient();

const SERIAL_NUMBER_TABLE_NAME = process.env.SERIAL_NUMBER_TABLE_NAME;

// Route the request to particular function

const handleRequest = async (event) => {
  const { httpMethod, path } = event;
  const response = { statusCode: 400 }; // Default response for invalid requests

  try {
    if (httpMethod === 'GET' && path === '/employees') {
      return getAllEmployees();
    } else if (httpMethod === 'GET') {
      return getEmployee(event);
    } else if (httpMethod === 'POST') {
      return createEmployee(event);
    } else if (httpMethod === 'PUT') {
      return updateEmployee(event);
    } else if (httpMethod === 'DELETE') {
      return deleteEmployee(event);
    } else {
      response.body = JSON.stringify({ message: 'Invalid HTTP method or path' });
    }

    response.statusCode = 200; // Set success status code for valid requests
  } catch (e) {
    console.error(e);
    response.statusCode = 500; // Internal server error for exceptions
    response.body = JSON.stringify({ message: `Error: ${e.message}` });
  }

  return response;
};


// Create Employee Method using async
const createEmployee = async (event) => {
  const response = { statusCode: 200 };
  try {
    const body = JSON.parse(event.body);

    const knownAttributes = [
      'firstName',
      'middleName',
      'lastName',
      'dob',
      'adhaarSSN',
      'gender',
      'maritialStatus',
      'passportPhoto',
      'address',
      'phone',
      'personalEmail',
      'emergencyContactPersonName',
      'emergencyContactPersonPhone'
    ];
    // Replace with actual attribute names

    const unknownAttributes = Object.keys(body).filter(
      (key) => !knownAttributes.includes(key)
    );

    if (unknownAttributes.length > 0) {
      // Unknown attributes are present, return an error response
      response.statusCode = 400; // You can choose an appropriate status code
      response.body = JSON.stringify({
        message: 'Unknown attributes in the request.',
        unknownAttributes,
      });
      return response;
    }

    // Validate the input data
    if (!body || !body.firstName || !body.middleName || !body.lastName || !body.dob || !body.adhaarSSN || !body.gender || !body.maritialStatus || !body.passportPhoto || !body.address || !body.phone || !body.personalEmail || !body.emergencyContactPersonName || !body.emergencyContactPersonPhone) {
      // Check if required fields are present
      response.statusCode = 200;
      throw new Error('Missing required fields');
    }

    // Define validation functions
    const validateStringLength = (value, minLength, maxLength, fieldName) => {
      if (typeof value !== 'string' || value.length < minLength || value.length > maxLength) {
        throw new Error(`Invalid ${fieldName} length. It should be between ${minLength} and ${maxLength} characters.`);
      }
    };

    const validateFutureDate = (dateString, fieldName) => {
      const currentDate = new Date().toISOString().split('T')[0]; // Get current date in 'YYYY-MM-DD' format
      if (dateString > currentDate) {
        throw new Error(`Invalid ${fieldName}. It should not be a future date .`);
      }
    };


    const validateEmailFormat = (email, fieldName) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error(`Invalid ${fieldName} format.`);
      }
    };

    // Define validation rules for each field
    const validationRules = [
      { field: 'firstName', minLength: 3, maxLength: 12 },
      { field: 'middleName', minLength: 3, maxLength: 12 },
      { field: 'lastName', minLength: 3, maxLength: 12 },
      { field: 'dob', validate: (value) => validateFutureDate(value, 'dob') },
      { field: 'adhaarSSN', minLength: 3, maxLength: 12 },
      {
        field: 'gender',
        validate: (value) => {
          if (!['male', 'female', 'other'].includes(value.toLowerCase())) {
            throw new Error(`Invalid gender value.`);
          }
        },
      },
      { field: 'maritalStatus', minLength: 3, maxLength: 12 },
      { field: 'passportPhoto', minLength: 3, maxLength: 255 }, // Assuming a URL or file path
      { field: 'address', minLength: 3, maxLength: 255 },
      { field: 'phone', minLength: 10, maxLength: 12 },
      { field: 'personalEmail', validate: (value) => validateEmailFormat(value, 'personalEmail') },
      { field: 'emergencyContactPersonName', minLength: 3, maxLength: 255 },
      { field: 'emergencyContactPersonPhone', minLength: 10, maxLength: 12 },
    ];

    // Perform field validations
    for (const rule of validationRules) {
      const fieldValue = body[rule.field];
      if (fieldValue) {
        if (rule.validate) {
          rule.validate(fieldValue);
        } else {
          validateStringLength(fieldValue, rule.minLength, rule.maxLength, rule.field);
        }
      }
    }

    
    // Insert the record with unique empId & Error hadling exception
    const empId = await getNextSerialNumber();
    body.empId = empId.toString();
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Item: marshall(body || {}),
      ConditionExpression: 'attribute_not_exists(personalEmail)', // Check for unique email
      IndexName: 'personalEmail-index',
    };
    const createResult = await client.send(new PutItemCommand(params));
    response.body = JSON.stringify({
      message: 'Successfully created employee.',
      // createResult,
      empId,
    });
  } catch (e) {
    if (e.name === 'ConditionalCheckFailedException') {
      // An employee with the same email already exists
      response.statusCode = 400;
      response.body = JSON.stringify({
        message: 'An employee with the same email already exists.',
      });
    } else {
      // Handle other errors
      response.statusCode = 500;
      response.body = JSON.stringify({
        message: 'Failed to create employee.',
        errorMsg: e.message,
        errorStack: e.stack,
      });
    }
  }
  return response;
};


// Update Employee-Details using async

const updateEmployee = async (event) => {
  const response = { statusCode: 200 };
  try {
    const body = JSON.parse(event.body);
    const empId = event.pathParameters ? event.pathParameters.empId : null;

    if (!empId) {
      throw new Error('empId not present');
    }

    const objKeys = Object.keys(body);

    const updateParams = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ empId }),
      UpdateExpression: `SET ${objKeys
        .map((_, index) => `#key${index} = :value${index}`)
        .join(', ')}`,
      ExpressionAttributeNames: objKeys.reduce(
        (acc, key, index) => ({
          ...acc,
          [`#key${index}`]: key,
        }),
        {}
      ),
      ExpressionAttributeValues: marshall(
        objKeys.reduce(
          (acc, key, index) => ({
            ...acc,
            [`:value${index}`]: body[key],
          }),
          {}
        )
      ),
      ConditionExpression: 'attribute_exists(empId)', // Check if empId exists
    };

    try {
      const updateResult = await client.send(new UpdateItemCommand(updateParams));
      response.body = JSON.stringify({
        message: `Successfully updated employee ${empId}.`,
        updateResult,
      });
    } catch (error) {
      if (error.name === 'ConditionalCheckFailedException') {
        response.statusCode = 404; // Employee Id not found
        response.body = JSON.stringify({
          message: `Employee with empId ${empId} not found`,
        });
      } else {
        throw error; // Re-throw other errors
      }
    }
  } catch (e) {
    console.error(e);
    response.statusCode = 400;
    response.body = JSON.stringify({
      message: 'Failed to update employee.',
      errorMsg: e.message,
      errorStack: e.stack,
    });
  }
  return response;
};



// getEmployee by empID

const getEmployee = async (event) => {
  const response = { statusCode: 200 };
  try {
    const empId = event.pathParameters ? event.pathParameters.empId : null;

    if (!empId) {
      throw new Error('empId parameter is missing');
    }

    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ empId }),
    };

    const { Item } = await client.send(new GetItemCommand(params));

    if (Item) {
      const employeeData = unmarshall(Item);
      response.body = JSON.stringify({
        message: 'Successfully retrieved employee.',
        data: employeeData,
      });
    } else {
      response.statusCode = 404; // Employee not found
      response.body = JSON.stringify({
        message: `Employee with empId ${empId} not found`,
      });
    }
  } catch (e) {
    console.error(e);
    response.statusCode = 500; // Internal server error
    response.body = JSON.stringify({
      message: `Failed to get employee: ${e.message}`,
    });
  }
  return response;
};

// Delete Employee by empID

const deleteEmployee = async (event) => {
  const response = { statusCode: 200 };
  try {
    const empId = event.pathParameters ? event.pathParameters.empId : null;

    if (!empId) {
      throw new Error('empId parameter is missing');
    }

    const deleteParams = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ empId }), // Assuming you're using marshall here
      ConditionExpression: 'attribute_exists(empId)',
    };

    try {
      const deleteResult = await client.send(new DeleteItemCommand(deleteParams));
      response.body = JSON.stringify({
        message: `Successfully deleted employee have ${empId}.`,
        deleteResult,
      });
    } catch (error) {
      if (error.name === 'ConditionalCheckFailedException') {
        response.statusCode = 404;
        response.body = JSON.stringify({
          message: `Employee with empId ${empId} not found`,
        });
      } else {
        throw error; // Re-throw other errors
      }
    }
  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: 'Failed to delete employee.',
      errorMsg: e.message,
      errorStack: e.stack,
    });
  }
  return response;
};



// Get AllEmployees List

const getAllEmployees = async () => {
  const response = { statusCode: 200 };
  try {
    const { Items } = await client.send(
      new ScanCommand({ TableName: process.env.DYNAMODB_TABLE_NAME })
    );

    const employees = Items.map((item) => unmarshall(item));

    // Sort the employees array by empId
    employees.sort((a, b) => {
      return parseInt(a.empId) - parseInt(b.empId);
    });

    // Modify the data to include empId
    const sortedEmployees = employees.map((employee) => ({
      empId: employee.empId,
      ...employee,
    }));

    response.body = JSON.stringify({
      message: 'Successfully retrieved all employees sorted by empId.',
      data: sortedEmployees,
    });
  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: 'Failed to retrieve employees.',
      errorMsg: e.message,
      errorStack: e.stack,
    });
  }
  return response;
};


// Generate sequential unique empID while creating Employee

const getNextSerialNumber = async () => {
  const params = {
    TableName: process.env.SERIAL_NUMBER_TABLE_NAME,
    Key: {
      id: { S: 'employeeCounter' },
    },
    UpdateExpression: 'SET #counter = if_not_exists(#counter, :initValue) + :incrValue',
    ExpressionAttributeNames: {
      '#counter': 'counter',
    },
    ExpressionAttributeValues: {
      ':initValue': { N: '1000' }, // Initialize the counter if it doesn't exist (change this as needed)
      ':incrValue': { N: '1' }, // Increment the counter by 1
    },
    ReturnValues: 'UPDATED_NEW',
  };

  const { Attributes } = await client.send(new UpdateItemCommand(params));
  return Attributes.counter.N;
};


module.exports = {
  handleRequest,
};