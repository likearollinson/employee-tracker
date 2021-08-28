const inquirer = require('inquirer');
const consoleTable = require('console.table')
// Import and require mysql2
const mysql = require('mysql2');

const db = mysql.createConnection(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: 'localhost',
    },
);

console.log('---------------------------\nEMPLOYEE MANAGER\n---------------------------')

const mainPrompt = () => {
    return inquirer.prompt([
        {
            type: 'list',
            name: 'main',
            message: 'What would you like to do?',
            choices: ['View All Employees', 'Add Employee', 'Update Employee Role', 'View All Roles', 'Add Role', 'View All Departments', 'Add Department', 'Exit']
        }
    ])
        .then(value => {
            switch (value.main) {
                case 'View All Employees':
                    viewAllEmployees();
                    break;
                case 'Add Employee':
                    addEmployee();
                    break;
                case 'Update Employee Role':
                    updateEmployeeRole();
                    break;
                case 'View All Roles':
                    viewAllRoles();
                    break;
                case 'Add Role':
                    addRole();
                    break;
                case 'View All Departments':
                    viewAllDepartments();
                    break;
                case 'Add Department':
                    addDepartment();
                    break;
                case 'Exit':
                    dbConnection.end();
                    console.log('Thank you! Goodbye!')
            }
        });
}