require("dotenv").config();
const express = require("express");
const cors = require("cors")
const swaggerUi = require("swagger-ui-express"); 
 const authRoutes = require("./src/routes/authRoutes")
 const transactionRoutes = require("./src/routes/transactionRoutes")
 const walletRoutes = require("./src/routes/walletRoutes")
const connectDb = require("./src/config/db")

let swaggerDocument={};
try {
    swaggerDocument= require('./swagger-output.json');

} catch (error) {
    console.error('Error loading swager docs',error);
    
}

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
connectDb();

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/",(req,res)=>{
    res.send("PhonePay");
})

app.use("/api/auth" , authRoutes)
app.use("/api/transaction" , transactionRoutes)
app.use('/api/wallet', walletRoutes);

const port= process.env.PORT

app.listen(port,()=>{
    console.log(`Server is Runnning at ${port}`);
    console.log(`Swagger Docs available at htttp://localhost:{port}/api-docs`);
    
    
})