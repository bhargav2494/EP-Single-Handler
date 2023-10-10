// const getNextSerialNumber = async () => {
//     const params = {
//       TableName: process.env.SERIAL_NUMBER_TABLE_NAME,
//       Key: {
//         id: { S: 'employeeCounter' },
//       },
//       UpdateExpression: 'SET #counter = if_not_exists(#counter, :initValue) + :incrValue',
//       ExpressionAttributeNames: {
//         '#counter': 'counter',
//       },
//       ExpressionAttributeValues: {
//         ':initValue': { N: '0' }, // Initialize the counter if it doesn't exist (change this as needed)
//         ':incrValue': { N: '1' }, // Increment the counter by 1
//       },
//       ReturnValues: 'UPDATED_NEW',
//     };
  
//     const { Attributes } = await client.send(new UpdateItemCommand(params));
//     return Attributes.counter.N;
//   };

//   module.exports = {
//     getNextSerialNumber,
//   };