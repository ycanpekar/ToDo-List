import inquirer from 'inquirer';
import low from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync.js';

const ToDoDataAdapter = new FileSync('database.json');
const db = low(ToDoDataAdapter);
const prompt = inquirer.createPromptModule();

function generateId() {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    for (let i=0;i<8;i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
   }
   return result;
}

while (true) {
    console.clear();
    await prompt([{
        name: 'thing',
        message: 'Welcome back sir! How may i help you?',
        type: 'list',
        choices: [
            {
                name: "Show me the todo list",
                short: 'List',
                value: 1
            },
            {
                name: "Add a New item to the todo list",
                short: 'Add',
                value: 2
            },
            {
                name: "Remove an item from the todo list",
                short: 'Remove',
                value: 3
            },
            {
                name: "Create a new category",
                short: 'Create',
                value: 4
            },
            {
                name: "Delete a category",
                short: 'Delete',
                value: 5
            },
            {
                name: 'Exit',
                value: 6
            }
        ]
    }]).then(({ thing }) => {
        db.read();
        let categories = Array.from(db.get('categories').value().map(a => a.name));
        categories.push({ name: 'No category', value: 'nocategory' });

        switch (thing) {
            case 1: // show the list
                prompt([{
                    name: 'category',
                    message: 'Select a Todo category..',
                    type: 'list',
                    choices: categories
                }]).then(({ category }) => {
                    const todos = db.get('todo').value().filter(a => a.category === category).map(a => a.todo);
                    if (todos.length === 0) return console.log('No item added to the ToDo List was found.');

                    return console.log(todos.join('\n'));
                });
                break;
            case 2: // add new item
                prompt([{
                    name: 'category',
                    message: 'Please select a ToDo category',
                    type: 'list',
                    choices: categories
                }]).then(({ category }) => {
                    prompt([{
                        name: 'todo',
                        message: 'Type the item to be added to the ToDo List.',
                        type: 'input',
                    }]).then(async({ todo }) => {
                        await db.get('todo').push({ date: Date.now(), todo: `・${todo}`, id: generateId(), category: category }).write();
                        console.log('Success! New Todo list;')

                        db.read();
                        const todos = db.get('todo').value().filter(a => a.category === category).map(a => a.todo);
                        console.log(todos.join('\n'));
                    });
                });
                break;
            case 3: // remove item
                const todos = db.get('todo').value().map(a => { return { name: a.todo, value: a.id } });
                if (todos.length === 0) return console.log('no item found');

                prompt({
                    name: 'id',
                    message: 'Select the item to delete',
                    type: 'list',
                    choices: todos
                }).then(async ({ id }) => {
                    await db.get('todo').remove({ id }).write();
                    console.log('item deleted successfully.');
                });
                break;
            case 4: // create category
                prompt([{
                    name: 'category',
                    message: 'Write a category name',
                    type: 'input'
                }]).then(async ({ category }) => {
                    if (category === '') return console.log('Please write a valid category name');

                    let categories = Array.from(db.get('categories').value());
                    if (categories.includes(category)) return console.log(`there is already a category named ${category}`);

                    await db.get('categories').push({ date: Date.now(), id: generateId(), name: category }).write();
                    db.read();
                    categories = db.get('categories').value().map(a => a.name);

                    return console.log('\nCategory successfully created, new category list;\n'+categories.join('\n'));
                });
                break;
            case 5: // delete category
                categories = db.get('categories').value().map(a => { return { name: a.name, value: { name: a.name, id: a.id } } });

                prompt([{
                    name: 'category',
                    message: 'select the category to be deleted',
                    type: 'list',
                    choices: categories
                }]).then(async ({ category }) => {
                    const todoCategories = db.get('todo').value().map(a => a.category);
                    if (!todoCategories.includes(category.name)) {
                        db.get('categories').remove({ id: category.id }).write();
                        return console.log('Category deleted successfully.');
                    }

                    prompt({
                        name: 'confirm',
                        message: 'This category contains some todos. Sure you want to delete it?',
                        type: 'confirm'
                    }).then(async({ confirm }) => {
                        if (!confirm) return console.log(`check the todo list for ${category.name}`);
                        db.get('categories').remove({ id: category.id }).write();
                        return console.log('Category deleted successfully.');
                    });
                });
                break;
            case 6:
                console.log('Bye!');
                process.exit(0);
                break;
        }
    });
    await new Promise(resolve => setTimeout(resolve, 3000));
}