// For Database Connection
import mongoose from "mongoose";

const connectDB = async () => {
    try{
        mongoose.connection.on("connected", async ()=>{
            console.log("Database Connected");
        });

        await mongoose.connect(process.env.MONGO_DB_URI!);


    }catch(error : any){
        console.error(error);
        process.exit(1);

    }
}

export default connectDB;

