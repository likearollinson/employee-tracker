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

function addEmployee() {
    let managerArr = [];
    let roleArr = [];

    dbConnection.query('SELECT first_name, last_name FROM employees WHERE manager_id IS NULL',
        (err, results) => {
            if (err) throw err;
            results.map(manager =>
                managerArr.push(`${manager.first_name} ${manager.last_name}`));
            return managerArr;
        }
    );

    dbConnection.query('SELECT * FROM roles', (err, results) => {
        if (err) throw err;
        results.map(roles => roleArr.push(`${roles.title}`));
        return roleArr;
    });
    inquirer
        .prompt([
            {
                type: 'input',
                message: "What is the employee's first name?",
                name: 'first_name',
            },
            {
                type: 'input',
                message: "What is the employee's last name?",
                name: 'last_name',
            },
            {
                type: 'rawlist',
                message: "What is the employee's role?",
                name: 'role',
                choices: roleArr,
            },
            {
                type: 'rawlist',
                message: "Who is the employee's manager?",
                name: 'manager',
                choices: managerArr,
            },
        ])
        .then(results => {
            //variables set for role and manager id so tables can be connected in same function
            const role_id = roleArr.indexOf(results.role) + 1;
            const manager_id = managerArr.indexOf(results.manager) + 1;

            //variable for new employees
            const newEmployee = {
                first_name: results.first_name,
                last_name: results.last_name,
                manager_id: manager_id,
                role_id: role_id,
            };

            //insert new employee into database
            dbConnection.query('INSERT INTO employees SET ?', newEmployee, err => {
                if (err) throw err;
                mainPrompt();
            });
        });
}



