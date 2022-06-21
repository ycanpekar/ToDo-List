const inquirer = require('inquirer')
const low = require('lowdb')

const FileSync = require('lowdb/adapters/FileSync')

const ToDoDataAdapter = new FileSync('./databases/ToDo.json')
const tddb = low(ToDoDataAdapter)

inquirer.prompt([
    {
        name: 'process',
        message: 'Welcome back sir! How can i help you?',
        type: 'list',
        choices: ["Show me the ToDo List", "Add a New item to the ToDo List", "Remove an item from the ToDo List"],
        loop: true
    }
]).then(async(answer) => {
    if (answer.process == 'Show me the ToDo List') {
        tddb.read();
        const toDoList = [];
        tddb.get('ToDo').value().forEach(async(data) => toDoList.push(data.todo))

        if (toDoList.length == 0) {
            console.log('No item added to the ToDo List was found.');
        } else {
            toDoList.forEach(async(data) => console.log(data));
        }
    } else if (answer.process == 'Add a New item to the ToDo List') {
        inquirer.prompt([{
            name: 'newitem',
            message: 'Type the item to be added to the ToDo List.',
            type: 'input',
        }]).then(async(answer) => {
            tddb.read();
            var toDoList = [];
            tddb.get('ToDo').value().forEach(async(data) => toDoList.push(data.todo))
            tddb.get('ToDo').push({ date: Date.now(), todo: '・'+answer.newitem, id: toDoList.length+1 }).write();

            console.log('The new item has been successfully added to the ToDo List. New ToDo List;')

            toDoList = [];

            tddb.read();
            tddb.get('ToDo').value().forEach(async(data) => toDoList.push(data.todo))
            toDoList.forEach(async(data) => console.log(data));
        })
    } else if (answer.process == 'Remove an item from the ToDo List') {
        tddb.read();
        var toDoList = [];
        tddb.get('ToDo').value().forEach(async(data) => toDoList.push(data.todo));
        if (toDoList.length == 0) {
            return console.log('No item added to the ToDo List was found.');
        } else {
            inquirer.prompt([{
                name: 'delete',
                message: 'Select the item to be deleted.',
                type: 'list',
                choices: toDoList
            }]).then(async(answer) => {
                tddb.read();
                const todo = tddb.get('ToDo').find({ todo: answer.delete }).value();
                await tddb.get('ToDo').remove({ id: todo.id }).write();

                console.log('The item has been successfully deleted.');
            });
        }
    };
});
