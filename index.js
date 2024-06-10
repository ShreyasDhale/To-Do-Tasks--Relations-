require('./db/connection')
const express = require("express");
const userRouter = require('./routers/users.routers')
const taskRouter = require('./routers/tasks.routers')
const app = express()
app.use(express.json())
app.use(userRouter)
app.use(taskRouter)
const port = process.env.port || 3000

app.listen(port)
console.log("Server is running at "+port)

// const Tasks = require('./db/models/tasks')
// const Users = require('./db/models/user')
// const myFunc = async () => {
//     const task = await Tasks.findById('666733f62c7a11dd19235515');
//     await task.populate('owner');
//     console.log(task);
  
//     const user = await Users.findById('6667275cbaa22b9ab7336f20').populate('tasks').exec();
//     console.log(user);
// }

// myFunc()