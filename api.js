const {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  DeleteItemCommand,
  ScanCommand,
  UpdateItemCommand,
  QueryCommand,
} = require('@aws-sdk/client-dynamodb');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');

const client = new DynamoDBClient();

const SERIAL_NUMBER_TABLE_NAME = process.env.SERIAL_NUMBER_TABLE_NAME;

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

// Function to check if an employee with the same email already exists
const checkExistingEmployeeByEmail = async (email) => {
  const params = {
    TableName: process.env.DYNAMODB_TABLE_NAME,
    IndexName: 'EmailIndex', // Assuming you have an index on the 'personalEmail' attribute
    KeyConditionExpression: 'personalEmail = :email',
    ExpressionAttributeValues: {
      ':email': email,
    },
  };

  const queryResult = await client.send(new QueryCommand(params));

  if (queryResult.Items && queryResult.Items.length > 0) {
    // An employee with the same email already exists
    return queryResult.Items[0];
  }

  return null;
};


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

    // Check if an employee with the same email already exists
    const existingEmployee = await checkExistingEmployeeByEmail(body.personalEmail);
    if (existingEmployee) {
      response.statusCode = 400;
      response.body = JSON.stringify({
        message: 'An employee with the same email already exists.',
      });
      return response;
    }

    const empId = await getNextSerialNumber();
    body.empId = empId.toString();
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Item: marshall(body || {}),
    };
    const createResult = await client.send(new PutItemCommand(params));
    response.body = JSON.stringify({
      message: 'Successfully created employee.',
      createResult,
      empId,
    });
  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: 'Failed to create employee.',
      errorMsg: e.message,
      errorStack: e.stack,
    });
  }
  return response;
};

const updateEmployee = async (event) => {
  const response = { statusCode: 200 };
  try {
    const body = JSON.parse(event.body);
    const empId = event.pathParameters ? event.pathParameters.empId : null;

    if (!empId) {
      throw new Error('empId parameter is missing');
    }

    // Check if the empId exists in the database
    const getItemParams = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ empId }),
    };

    const { Item } = await client.send(new GetItemCommand(getItemParams));

    if (!Item) {
      response.statusCode = 404; // Employee Id not found
      response.body = JSON.stringify({
        message: `Employee with empId ${empId} not found`,
      });
      return response;
    }

    const objKeys = Object.keys(body);

    const params = {
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
    };
    const updateResult = await client.send(new UpdateItemCommand(params));
    response.body = JSON.stringify({
      message: 'Successfully updated employee.',
      updateResult,
    });
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

const deleteEmployee = async (event) => {
  const response = { statusCode: 200 };
  try {
    const empId = event.pathParameters ? event.pathParameters.empId : null;

    if (!empId) {
      throw new Error('empId parameter is missing');
    }

    const getItemParams = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ empId }), // Assuming you're using marshall here
    };

    // Check if the record exists
    const { Item } = await client.send(new GetItemCommand(getItemParams));

    if (!Item) {
      // If the record doesn't exist, return an error
      response.statusCode = 404;
      response.body = JSON.stringify({
        message: `Employee with empId ${empId} not found`,
      });
      return response;
    }

    // If the record exists, proceed with deletion
    const deleteParams = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ empId }), // Assuming you're using marshall here
    };

    const deleteResult = await client.send(new DeleteItemCommand(deleteParams));
    response.body = JSON.stringify({
      message: 'Successfully deleted employee.',
      deleteResult,
    });
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

const getAllEmployees = async () => {
  const response = { statusCode: 200 };
  try {
    const { Items } = await client.send(
      new ScanCommand({ TableName: process.env.DYNAMODB_TABLE_NAME })
    );
    const employees = Items.map((item) => {
      const employee = unmarshall(item);
      return {
        empId: employee.empId, // Include the empId in the response
        ...employee, // Include other employee data
      };
    });
    response.body = JSON.stringify({
      message: 'Successfully retrieved all employees.',
      data: employees,
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

const handleRequest = async (event) => {
  const { httpMethod } = event;
  const response = { statusCode: 400 }; // Default response for invalid requests

  try {
    if (httpMethod === 'GET') {
      return getEmployee(event);
    } else if (httpMethod === 'POST') {
      return createEmployee(event);
    } else if (httpMethod === 'PUT') {
      return updateEmployee(event);
    } else if (httpMethod === 'DELETE') {
      return deleteEmployee(event);
    } else if (httpMethod === 'GET' && event.path === '/employees') {
      return getAllEmployees();
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

module.exports = {
  handleRequest,
};