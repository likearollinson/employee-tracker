const inquirer = require('inquirer');
const consoleTable = require('console.table')
// Import and require mysql2
const mysql = require('mysql2');

const dbConnectionProperties =
{
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '1234',
    database: 'employee_db'
}

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
const dbConnection = mysql.createConnection(dbConnectionProperties);

dbConnection.connect(err => {
    if (err) {
        throw err;
    }
    console.log('Connection to Database Successful!');
    mainPrompt();
})

function viewAllEmployees() {
    dbConnection.query("SELECT employees.id, employees.first_name, employees.last_name, roles.title, departments.name AS departments, roles.salary, CONCAT(e.first_name, ' ' ,e.last_name) AS manager FROM employees INNER JOIN roles ON roles.id = employees.role_id INNER JOIN departments ON departments.id = roles.department_id LEFT JOIN employees e ON employees.manager_id = e.id;",
        (err, results) => {
            if (err) {
                throw err;
            }
            console.table(results);
            mainPrompt();
        }
    );
}





