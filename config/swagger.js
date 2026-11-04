const path = require('path');
const dailypath = require('../routes/daily/swagger');
const fishindopath = require('../routes/fishinfo/swagger');
const chatbotpath = require('../routes/chatbot/swagger');
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition:{
        openapi:'3.0.3',
        info:{
            title:'fishTankServer',
            version: '1.0.0',
            description:'fishtank 서버api'
        },
        servers:[
            {
                url:'http://localhost:3000',
                description:'로컬 서버'
            },
        ],
        paths:{
            ...dailypath,
            ...fishindopath,
            ...chatbotpath
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        }
    },
    apis:[
        path.join(__dirname,'../routes/**/*.js')
    ],
}

module.exports = swaggerJsdoc(options);