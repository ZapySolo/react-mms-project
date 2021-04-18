// var dynamo = require('dynamodb');
// dynamo.AWS.config.update({accessKeyId: 'AKIAS4VFCTK6HVLI3CG5', secretAccessKey: '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', region: "us-east-2"});
// const Joi = require('joi');
// process.env.AWS_ACCESS_KEY_ID = "AKIAS4VFCTK6HVLI3CG5";
// process.env.AWS_SECRET_ACCESS_KEY = "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";
import _ from 'lodash';
const AWS = require('aws-sdk');
AWS.config.update({
    accessKeyId: 'AKIAS4VFCTK6HVLI3CG5',
    secretAccessKey: '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',
    region: 'us-east-2',
});

class Repository {
    constructor() {
        this.db = new AWS.DynamoDB.DocumentClient();

        /**
         * 
         * @param {String} tableName 
         * @param {Object} filter 
         * @returns 
         */

        this.findMany = (tableName, filter) => {
            return new Promise((resolve, reject) => {
                this.db.scan({TableName:tableName}, (err, data) => {
                    if (err) {
                        reject({
                            success: false,
                            message: err
                        });
                    } else {
                        console.log('scan result', data.Items);
                        resolve(_.filter(data.Items, {...filter}));
                    }
                });
            });
        }

        /**
         * 
         * @param {String} tableName 
         * @returns 
         */

        this.scan = (tableName) => {
            return new Promise((resolve, reject) => {
                this.db.scan({TableName:tableName}, (err, data) => {
                    if (err) {
                        reject({
                            success: false,
                            message: err
                        });
                    } else {
                        resolve(data.Items);
                    }
                });
            });
        }

        /**
         * 
         * @param {String} tableName 
         * @param {Object} item 
         * @returns {Promise}
         */

        this.insert = (tableName, item) => {
            return new Promise((resolve, reject) => {
                this.db.put({
                    TableName: tableName,
                    Item: item
                }, (err, data) => {
                    if (err) {
                        reject({
                            success: false,
                            message: err
                        });
                    } else {
                        const { Items } = data;
                        resolve(Items);
                    }
                })
            });
        }

        /**
         * 
         * @param {String} tableName 
         * @param {Array} items 
         * @returns 
         */

        this.insertMany = (tableName, items) => {
            return new Promise((resolve, reject) => {
                let error = [];
                for(let item of items){
                    this.db.put({
                        TableName: tableName,
                        Item: item
                    }, (err, data) => {
                        if (err) {
                            error.push(err);
                        }
                    })
                }
                if(error.length === 0){
                    resolve({
                        success: true,
                        error: false
                    });
                } else {
                    reject({
                        success: false,
                        message: error
                    });
                }
            });
        }

        /**
         * 
         * @param {String} tableName 
         * @param {String} _id 
         * @returns 
         */
        this.findByID = async (tableName, _id) => {
            const params = {
                TableName: tableName,
                Key: {
                    "_id": _id
                }
            };
            var result = await this.db.get(params).promise();
            return new Promise((resolve, reject) => {
                if(result.Item){
                    resolve(result.Item);
                } else {
                    reject({
                        success: false,
                        message: 'Cannot get document with id:'+_id
                    });
                }
            });
        }
        /**
         * 
         * @param {String | Object} tableName 
         * @param {Object | Null} item 
         * @returns 
         */
        this.update = async (tableName, item = false) => {
            if(item && item._id){
                var result = await this.db.get({
                    TableName: tableName,
                    Key: {
                        "_id": item._id
                    }
                }).promise();
                return new Promise((resolve, reject) => {
                    if(result){
                        let updateData = {...item};
                        let UpdateExpression = 'set';
                        let ExpressionAttributeNames = {}//"#name": "name"
                        let ExpressionAttributeValues = {}//":name": "zapy"
                        delete updateData["_id"];
                        Object.keys(updateData).map((key, index) => {
                            ExpressionAttributeNames[`#${key}`] = key;
                            ExpressionAttributeValues[`:${key}`] = updateData[key];
                            if(index === 0){
                                UpdateExpression += ` #${key} = :${key}`
                            } else {
                                UpdateExpression += `, #${key} = :${key}`
                            }
                            return index;
                        });
                        console.log({updateData, UpdateExpression, ExpressionAttributeNames, ExpressionAttributeValues});
                        this.db.update({
                            TableName: tableName,
                            Key: {
                                _id: item._id
                            },
                            UpdateExpression,
                            ExpressionAttributeNames,
                            ExpressionAttributeValues
                        })
                        .promise()
                        .then(data => resolve(data))
                        .catch(err =>  reject(err));
                    }
                });
            } else {
                return new Promise((resolve, reject) => {
                    this.db.update(tableName).promise()
                    .then(data => resolve(data))
                    .catch(err => resolve(err));
                });
            }
        }

        this.updateMany = async (tableName, items = []) => {
            let result = [];
            for(let item of items){
                let res = await this.update(tableName, item);
                result.push(res);
            }
            return result;
        }

        /**
         * 
         * @param {String} tableName 
         * @param {String} id 
         * @returns 
         */
        this.delete = async (tableName, id) => {
            return new Promise((resolve, reject) => {
                this.db.get({
                    TableName: tableName,
                    Key: {
                        "_id": id
                    }
                }).promise()
                    .then(data => {
                        this.db.update({
                            TableName: tableName,
                            Key: {
                                _id: id
                            },
                            UpdateExpression: "set #isDeleted = :isDeleted",
                            ExpressionAttributeNames:{
                                "#isDeleted": "isDeleted"
                            },
                            ExpressionAttributeValues: {
                                ":isDeleted": true
                            }
                        })
                        .promise()
                        .then(data => resolve(data))
                        .catch(err =>  reject(err));
                    })
                    .catch(err => {
                        reject('Error occured while retriving data',err);
                    })
            });
            
        }

        // this.close = () => {
        //     return new Promise((resolve, reject) => {

        //     });
        // }

    }
}

export default Repository;