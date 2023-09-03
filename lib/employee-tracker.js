// Global variables
const inquirer = require("inquirer");
const db = require("../db/connection");

const initialPrompt = () => {
    inquirer.prompt([{
        type: "list",
        name: "options",
        message: "What would you like to do?",
        choices: [
            "View all departments",
            "View all roles",
            "View all employees",
            "Add a department",
            "Add a role",
            "Add an employee",
            "Update an employee role",
            "Quit"
        ]
    }])
    .then(answers => {
        switch (answers.options) {
            case "View all departments":
                viewDepartments();
                break;
            case "View all roles":
                
                break;
            case "View all employees":
                
                break;
            case "Add a department":
                
                break;
            case "Add a role":
                
                break;
            case "Add an employee":
                
                break;
            case "Update an employee role":
                
                break;
            case "Quit":
                process.exit();
        }
    })
};

// View all departments
const viewDepartments = () => {
    db.query(`SELECT * FROM department`, (err, results) => {
        if(err){
            console.error(err);
            return;
        }

        console.table(results);
        initialPrompt();
    })
};


module.exports = initialPrompt;