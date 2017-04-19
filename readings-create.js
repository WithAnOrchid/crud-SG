'use strict';

const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
//const uuid = require('uuid');

module.exports = (event, callback) => {
  const data = JSON.parse(event.body);

  //data.id = uuid.v1();
  //var timeInMs = Date.now();
  data.published_at = Date.now();
  data.processed_at = Date.now();

  // Special case for TH module
  if(data.temperature_reading != undefined &&
     data.temperature_reading != null)
  {
    // Split the single JSON to 2 JSONs
    var data1 = {
      sensor_id: 'TEMPERATURE-' + data.sensor_id,
      device_id: data.device_id,
      device_type: data.device_type,
      sensor_type: 'temperature',
      sensor_reading: data.temperature_reading,
      published_at: data.published_at
    };
    var data2 = {
      sensor_id: 'HUMIDITY-' + data.sensor_id,
      device_id: data.device_id,
      device_type: data.device_type,
      sensor_type: 'humidity',
      sensor_reading: data.humidity_reading,
      published_at: data.published_at
    };
    
    var params1 = {
      TableName: 'readings',
      Item: data1
    };
    var params2 = {
      TableName: 'readings',
      Item: data2
    };
    
    dynamoDb.put(params1, function(err, data) {
      if (err) console.log("Unable to update item. Error: ", JSON.stringify(err, null, 2));
      else console.log("Updated item succeeded: ", JSON.stringify(data, null, 2));
            //next() // modify for err handling
          });
    return dynamoDb.put(params2, (error, data) => {
      if (error) {
        callback(error);
      }
      callback(error, params2.Item);
    });
    
    

  } // end of if
  else
  {
    const params = {
      TableName: 'readings',
      Item: data
    };

    return dynamoDb.put(params, (error, data) => {
      if (error) {
        callback(error);
      }
      callback(error, params.Item);
    });

}// end of else
};
