const swaggerAutogen = require('swagger-autogen')()

const doc = {
    info:{
        title: "user Api",
        description: "User Api for account and post creation"
    },
    host: "localhost:4020",
    schemes: ['https','http']
}
const outputFile = './swagger.json'
const endpointsFiles = ['./routes/index.js']
swaggerAutogen(outputFile,endpointsFiles, doc);