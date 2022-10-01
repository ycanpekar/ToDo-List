const inquirer = require('inquirer');
const low = require('lowdb');

const FileSync = require('lowdb/adapters/FileSync');

const ToDoDataAdapter = new FileSync('./databases/ToDo.json');
const tddb = low(ToDoDataAdapter);

const prompt = inquirer.createPromptModule();

function createTDID() {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    for (var i=0;i<3;i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
   };
   return result;
};

prompt([{
    name: 'process',
    message: 'Welcome back sir! How can i help you?',
    type: 'list',
    choices: ["Show me the ToDo List", "Add a New item to the ToDo List", "Remove an item from the ToDo List", "Create a new ToDo category", "Delete a ToDo Category"],
    loop: true
}]).then(async(answer) => {
    if (answer.process == 'Show me the ToDo List') {
        const cats = [];
        tddb.get('category').value().forEach(async(data) => cats.push(data.catname));
        cats.push('No category');

        prompt([{
            name: 'cat',
            message: 'Select a To-Do List category..',
            type: 'list',
            choices: cats
        }]).then(async(a) => {
            var category = 'nocategory';
            if (a.cat !== 'No category') category = 'custom';

            const todos = [];
            if (category == 'nocategory') {
                tddb.read();
                tddb.get('ToDo').value().forEach(async(data) => {
                    if (data.category == 'nocategory') {
                        todos.push(data.todo);
                    };
                });
            };

            tddb.read();
            tddb.get('ToDo').value().forEach(async(data) => {
                if (data.category == a.cat) {
                    todos.push(data.todo);
                };
            });
            
            if (todos.length == 0) return console.log('No item added to the ToDo List was found.');

            return console.log(todos.join('\n'));
        });
    } else if (answer.process == 'Add a New item to the ToDo List') {
        var cats = [];
        tddb.read();
        tddb.get('category').value().forEach(async(data) => cats.push(data.catname));
        cats.push('No category');

        prompt([{
            name: 'selectcat',
            message: 'Please select a ToDo category',
            type: 'list',
            choices: cats
        }]).then(async(a) => {
            var category = a.selectcat;
            if (a.selectcat == 'No category') { category == 'nocategory' };

            prompt([{
                name: 'newitem',
                message: 'Type the item to be added to the ToDo List.',
                type: 'input',
            }]).then(async(answer) => {
                tddb.read();
                var toDoList = [];
                tddb.get('ToDo').value().forEach(async(data) => toDoList.push(data.todo))
                tddb.get('ToDo').push({ date: Date.now(), todo: '・'+answer.newitem, id: createTDID(), category: category }).write();
    
                console.log('The new item has been successfully added to the ToDo List. New ToDo List;')
    
                toDoList = [];
    
                tddb.read();
                tddb.get('ToDo').value().forEach(async(data) => {
                    if (data.category == category) toDoList.push(data.todo);
                });
                toDoList.forEach(async(data) => console.log(data));
            });
        });
    } else if (answer.process == 'Remove an item from the ToDo List') {
        tddb.read();
        var toDoList = [];
        tddb.get('ToDo').value().forEach(async(data) => toDoList.push(data.todo));
        if (toDoList.length == 0) {
            return console.log('No item added to the ToDo List was found.');
        } else {
            prompt([{
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
    } else if (answer.process == 'Create a new ToDo category') {
        prompt([{
            name: 'cat',
            message: 'Write a category name',
            type: 'input'
        }]).then(async(a) => {
            if (a.cat == '') return console.log('Please write a valid category name');

            var cats = [];
            tddb.read();
            tddb.get('category').value().forEach(async(data) => cats.push(data));

            if (cats.includes(a.cat)) return console.log('Already created such a category');

            tddb.read();
            tddb.get('category').push({ date: Date.now(), catname: a.cat }).write();

            cats = [];
            tddb.read();
            tddb.get('category').value().forEach(async(data) => cats.push(data.catname));

            return console.log('\nCategory succesfully created, new category list;\n'+cats.join('\n'));
        });
    } else if (answer.process == 'Delete a ToDo Category') {
        var cats = [];
        tddb.read();
        tddb.get('category').value().forEach(async(data) => cats.push(data.catname));

        prompt([{
            name: 'delcat',
            message: 'Type the name of the category to be deleted',
            type: 'list',
            choices: cats
        }]).then(async(a) => {
            var todos = [];
            tddb.read();
            tddb.get('ToDo').value().forEach(async(data) => todos.push(data.category));

            if (todos.includes(a.delcat)) return console.log('You cant remove the category before you remove the todo..')

            cats = [];
            tddb.read();
            tddb.get('category').remove({ catname: `${a.delcat}` }).write();
            tddb.get('category').value().forEach(async(data) => cats.push(data.catname));

            if (cats.length == 0) return console.log('\nCategory succesfully deleted!');
            return console.log('\nCategory succesfully deleted, new category list;\n'+cats.join('\n'));
        });
    };
});
