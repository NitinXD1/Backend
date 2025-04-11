import mongoose from 'mongoose'

const todoSchema = new mongoose.Schema({
  content : {
    type : String,
    required : true,
  },
  complete : {
    type : boolean,
    default : false
  },
  createdBy : {
    type : mongoose.Schema.Types.ObjectId,
    ref : 'User'
  },
  subTodos : [
    {
      type : mongoose.Schema.Types.ObjectId,
      ref : 'subTodo'
    }
  ] //Array of SubTODOS

},{
  timestamps : true
})

export const Todo = mongoose.model("Todo",todoSchema)