//requestHandler is a fxn like bottom
const asyncHandler = (requestHandler) =>{
    return (req,res,next) => {
        Promise.resolve(
            requestHandler(req,res,next)
        ).catch((err) => next(err))
    }
}

export {asyncHandler}

//here asyncHandler is a higher order function : higher order function are those that can accept
//parameter as function and also return them

//why this works like this this is nothing but this
//const asyncHandler = (fn) => {() => {}}

// const asyncHandler = (fn) => async(req,res,next) => {
//     try{
//         await fn(req,res,next)
//     }
//     catch(error){
//         res.status(error.code || 404).json({
//             success : false,
//             message : error.message
//         })
//     }
// }