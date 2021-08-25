const inquirer = require('inquirer');
const consoleTable = require('console.table')
// Import and require mysql2
const mysql = require('mysql2');

const db = mysql.createConnection(
    {
        host: 'localhost',
        // MySQL username,
        user: 'root',
        // MySQL password
        password: '1234',
        database: ''
    },
);

console.log('---------------------------\nEMPLOYEE MANAGER\n---------------------------')

const mainPrompt = () => {
    return inquirer.prompt([
        {
            type: 'list',
            name: 'main',
            message: 'What would you like to do?',
            choices: ['View All Employees', 'Add Employee', 'Update Employee Role', 'View All Roles', 'Add Role', 'View All Departments', 'Add Department']
        }
    ])
}