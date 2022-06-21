const readline = require('readline')
const low = require('lowdb')

const rl = readline.createInterface(process.stdin, process.stdout);
const FileSync = require('lowdb/adapters/FileSync');

const ToDoDataAdapter = new FileSync('./databases/ToDo.json')
const tddb = low(ToDoDataAdapter)

rl.question('Welcome back sir! How can i help you?\n\nShow me the ToDo List: 1\nAdd a New item to the ToDo List: 2\nRemove an item from the ToDo List: 3\n\n', async(hcihy) => {
    if (Number(hcihy) == 1) {
        tddb.read();
        const toDoList = [];
        tddb.get('ToDo').value().forEach(async(data) => toDoList.push(data.todo))

        if (toDoList.length == 0) {
            console.log('No item added to the ToDo List was found.');
            rl.close();
        } else {
            toDoList.forEach(async(data) => console.log(data));
        }
        rl.close();
    } else if (Number(hcihy) == 2) {
        rl.question('Type the item to be added to the ToDo List.\n', async(newItem) => {
            tddb.read();
            var toDoList = [];
            tddb.get('ToDo').value().forEach(async(data) => toDoList.push(data.todo))
            tddb.get('ToDo').push({ date: Date.now(), todo: '・'+newItem, id: toDoList.length+1 }).write();

            console.log('The new item has been successfully added to the ToDo List. New ToDo List;')

            toDoList = [];

            tddb.read();
            tddb.get('ToDo').value().forEach(async(data) => toDoList.push(data.todo))
            toDoList.forEach(async(data) => console.log(data));
            rl.close()
        });
    } else if (Number(hcihy) == 3) {
        tddb.read();
        tddb.get('ToDo').value().forEach(async(data) => console.log(`${data.todo}: ${data.id}`))
        rl.question(`\nPlease enter the ID of the item to be deleted.\n`, async(id) => {
            tddb.read();
            const toDoList = [];
            tddb.get('ToDo').value().forEach(async(data) => toDoList.push({ todo: data.todo, id: data.id }));

            const ids = [];
            toDoList.forEach(async(data) => ids.push(data.id));

            if (!ids.includes(Number(id))) {
                console.log('No such ToDo List item was found.')
                rl.close()
            };

            tddb.read();
            await tddb.get('ToDo').remove({ id: Number(id) }).write();

            console.log(`Item with ID ${id} has been successfully removed.`)
            rl.close();
        })
    } else rl.close();
});