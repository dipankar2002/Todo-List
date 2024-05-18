const express = require('express');
const bodyParser = require('body-parser')
const fs = require('fs');
const cors = require('cors');

const app = express();
const port = 3000;
app.use(bodyParser.json());
app.use(cors());

// user routes used functions
function userReadFile() {
    let List = fs.readFileSync('userData.json', 'utf8');
    const readData = JSON.parse(List);
    return readData;
}
function userIdCheck(obj) {
    const list = userReadFile();
    let flag = false;
    if(list.length >= 1) {
        for(let i = 0; i < list.length; i++) {
            if(list[i].id === obj.id) {
                flag = true;
                break;
            }
        }
        return flag;
    }
    return flag;
}
function userCheckId(id,pass) {
    let flag = false;
    const list = userReadFile();
    for(let i = 0; i < list.length; i++) {
        if(list[i].id === id && list[i].pass === pass) {
            flag = true;
            break;
        }
    }
    // console.log(flag);
    return flag;
}
function userCheckIdWT(token) {
    let flag = false;
    const list = userReadFile();
    for(let i = 0; i < list.length; i++) {
        if(list[i].token === token) {
            flag = true;
            break;
        }
    }
    return flag;
}
function userCheckIndexWT(id,pass) {
    let index = null;
    const list = userReadFile();
    for(let i = 0; i < list.length; i++) {
        if(list[i].id === id && list[i].pass === pass) {
            index = i;
            break;
        }
    }
    // console.log(index);
    return index;
}
function addTodoInTheUserList(obj,token) {
    const list = userReadFile();
    let index = null;
    for(let i = 0; i < list.length; i++) {
        if(list[i].token === token) {
            index = i;
            break;
        }
    }
    list[index].todo.push(obj);
    let newDATA = JSON.stringify(list);
    fs.writeFile('userData.json', newDATA, (err) => {
        if (err) throw err;
        console.log("todo data stored successfully");
    })
}
function userIndex(list,token) {
    let index = null;
    for(let i = 0; i < list.length; i++) {
        if(list[i].token === token) {
            index = i;
            break;
        }
    }
    return index;
}
function updateTodoList(i,k,obj) {
    let list = userReadFile();
    console.log(i + " is index 1 & " + k + " is index 2");
    list[i].todo[k] = obj;
    console.log(list);
    return list;
}
function findTheIndexOfTodoID(obj) {
    let list = userReadFile();
    let index1 = null;
    let index2 = null;
    for(let i = 0; i < list.length; i++) {
        index1 = i;
        for(let k = 0; k < list[i].todo.length; k++) {
            if(list[i].todo[k].todoID === obj.todoID) {
                index2 = k;
                return updateTodoList(index1, index2, obj);
            }
        }
    }
    console.log(index1 + " is index 1 & " + index2 + " is index 2");
    return list;
}
function deleteTodoList(i,k) {
    let list = userReadFile();
    // console.log("i index : " + i + " K index: " + k);
    if (k > -1) {
        // only splice array when item is found
        list[i].todo.splice(k, 1); // 2nd parameter means remove one item only
    }
    return list;
}
function findTheIndexToDeleteTodoList(id) {
    let list = userReadFile();
    let index1 = null;
    let index2 = null;
    for(let i = 0; i < list.length; i++) {
        index1 = i;
        for(let k = 0; k < list[i].todo.length; k++) {
            if(list[i].todo[k].todoID === id) {
                index2 = k;
                // console.log("i index : " + i + " K index: " + k);
                let newlist = deleteTodoList(index1,index2);
                return newlist;
            }
        }
    }
    return list;
}
function findTokenFromTodoID(id) {
    const list = userReadFile();
    let index1 = null;
    let token = null;
    for(let i = 0; i < list.length; i++) {
        for(let k = 0; k < list[i].todo.length; k++) {
            if(list[i].todo[k].todoID === id) {
                token = list[i].token;
                break;
            }
        }
    }
    return token;
}

function randomChar() {
    const char = [
        'a', 'b','c',
        'd', 'e', 'f',
        'g', 'h', 'i',
        'j', 'k', 'l',
        'm', 'n', 'o',
        'p', 'q', 'r',
        's','t', 'u',
        'v', 'w', 'x',
        'y', 'z'
    ];

    return char[Math.floor(Math.random() * char.length)];
}
function randomNum() {
    return Math.floor(Math.random() * 10);
}
function tokenGenerate() {
    const tokenn = randomChar() + randomNum() + randomChar() + randomNum() + randomChar() + randomNum();
    return tokenn;
}

const userAuth = (req,res,next) => {
    const id = "@" + req.body.id;
    const pass = req.body.pass;
    
    const authRes = userCheckId(id,pass);
    if(authRes) {
        next();
    } else {
        const route = "http://localhost:3000/authFailed"
        res.status(401).json({id: route,message: "user login fail!!"});
    }
}
const userAuthWT = (req,res,next) => {
    const token = req.body.token;

    const authRes = userCheckIdWT(token);
    if(authRes) {
        next();
    } else {
        res.status(401).json({id: token,message: "user login fail!!"});
    }
}

// user routes for TODO list
app.delete('/user/todo-delete', userAuthWT, (req,res) => {
    const todoID = req.body.id;
    const token = req.body.token;
    const newList = findTheIndexToDeleteTodoList(todoID);
    // console.log(todoID);
    let newDATA = JSON.stringify(newList);
    fs.writeFile('userData.json', newDATA, (err) => {
        if (err) throw err;
        console.log('JSON data delete successfully');
    })
    const route = "http://localhost:3000/todo-list/" + token;
    res.send( {id: route,message: "todo delete Successful"});
})
app.put('/user/todo-update', userAuthWT, (req,res) => {
    // const todoID = "#" + req.query.todoID;
    const todoID = req.body.id;
    const title = req.body.title;
    const des = req.body.des;
    const status = req.body.status;
    const token = req.body.token;
    console.log(todoID + " is the user id");
    console.log(title + " is the user title");
    console.log(des + " is the user des");
    console.log(status + " is the user status");
    console.log(token + " is the user token");
    const objNew = {
        todoID: todoID,
        title: title,
        des: des,
        status: status
    }
    console.log(objNew);
    const newList = findTheIndexOfTodoID(objNew);
    let newDATA = JSON.stringify(newList);
    console.log(newDATA);
    fs.writeFile('userData.json', newDATA, (err) => {
        if (err) throw err;
        console.log('JSON data update successfully');
    })
    // const token = findTokenFromTodoID(todoID);
    // console.log(token + " is the user acc token");
    const route = "http://localhost:3000/todo-list/" + token;
    res.send( {id: route,message: "todo Update Successful"});
})
app.post('/user/todo-list', userAuthWT, (req,res) => {
    const token = req.body.token;
    const list = userReadFile();
    const index = userIndex(list,token);
    res.json(list[index]);
})
app.post('/user/todo-create', userAuthWT, (req,res) => {
    const title = req.body.title;
    const des = req.body.des;
    const status = req.body.status;
    const token = req.body.token;
    
    const obj = {
        // todoID: Math.floor(Math.random()*10000),
        todoID: Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000,
        title: title,
        des: des,
        status: status
    }
    addTodoInTheUserList(obj,token);
    const route = "http://localhost:3000/todo-list/" + token;
    res.status(200).json({id: route,message: title + "Todo added to Todo-List"});
})
app.post('/user/see-token', userAuth, (req,res) => {
    // res.status(200).sendFile(__dirname + "/homepage.html");
    const id = "@" + req.body.id;
    const pass = req.body.pass;
    // const tokenNew = tokenGenerate();
    // console.log(tokenNew);

    const index = userCheckIndexWT(id,pass);
    let list = userReadFile();
    // list[index].token = tokenNew;
    let newDATA = JSON.stringify(list);
    fs.writeFile('userData.json', newDATA, (err) => {
        if (err) throw err;
        console.log('JSON data stored successfully');
    })

    res.status(200).json({id: id,message: "user new Token is " + list[index].token});
})
app.post('/user/login', userAuth, (req,res) => {
    // res.status(200).sendFile(__dirname + "/homepage.html");
    const id = "@" + req.body.id;
    const pass = req.body.pass;
    const tokenNew = tokenGenerate();
    console.log(tokenNew);

    const index = userCheckIndexWT(id,pass);
    let list = userReadFile();
    list[index].token = tokenNew;
    let newDATA = JSON.stringify(list);
    fs.writeFile('userData.json', newDATA, (err) => {
        if (err) throw err;
        console.log('JSON data stored successfully');
    })
    const route = "http://localhost:3000/todo-list/" + list[index].token;
    res.status(200).json({id: route,message: "user Login Successful with new Token"});
})
app.post('/user/signup', (req,res) => {
    const id = req.body.id;
    const name = req.body.name;
    const pass = req.body.pass;

    const token = tokenGenerate();
    
    const obj = {
        id: "@" + id.toLowerCase(),
        name: name,
        pass: pass,
        token: token,
        todo: [],
    }
    const checkUser = userIdCheck(obj);
    if(checkUser) {
        res.status(401).json({id: obj.id,message: "user already Exists!! login pls"});
    } else {
        const list = userReadFile();
        list.push(obj);
        let newDATA = JSON.stringify(list);
        fs.writeFile('userData.json', newDATA, (err) => {
            if (err) throw err;
            console.log('JSON data stored successfully');
        })
        res.status(200).json({id: obj.id,message: "user signup Successful"});
    }
})

app.get('/todo-update/:token/:id', (req,res) => {
    res.sendFile(__dirname + "/updatepage.html");
})
app.get('/todo-list/:id', (req,res) => {
    res.sendFile(__dirname + "/homepage.html");
})
app.get('/todo-create/:id', (req,res) => {
    res.sendFile(__dirname + "/todoCreate.html");
})
app.get('/see-token', (req,res) => {
    res.sendFile(__dirname + "/seeToken.html");
})
app.get('/login', (req,res) => {
    res.sendFile(__dirname + "/login.html");
})
app.get('/signup', (req,res) => {
    res.sendFile(__dirname + "/signup.html");
})
app.get('/authFailed', (req,res) => {
    res.sendFile(__dirname + "/authFailed.html");
})

app.listen(port, () => {
    console.log(`Server start`);
})