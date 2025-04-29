import mongoose , {Schema} from 'mongoose'

const subscriptionSchema = new Schema(
    {
        subscriber : {
            type : Schema.Types.ObjectId, //one who is subscribing it
            ref : "User"
        },
        channel : {
            type : Schema.Types.ObjectId, //whos being subscribed
            ref : "User"
        }
    }
    ,
    {
        timestamps : true
    }
)

export const subscription = mongoose.model("Subscription",subscriptionSchema)