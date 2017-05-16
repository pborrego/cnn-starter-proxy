#!/usr/bin/env node

const path = require('path');
const spawn = require('child_process').spawn;
const inquirer = require('inquirer');
const chalk = require('chalk');

const log = console;

const types = [
    {
        label: 'Web Application',
        value: 'cnn-starter-app'
    }
    // ,
    // @TODO: add support for override, this will trigger a secondary prompt
    // {
    //     label: 'Other',
    //     value: 'other'
    // },
    // {
    //     label: 'API',
    //     value: 'cnn-starter-api'
    // }
]

const prompts = [
    {
        type: 'list',
        name: 'type',
        message: 'What type of project is this?',
        default: types[0].label,
        choices: types.map(type => type.label)
    }
];

/**
 * Display ascii artwork and intro text.
 *
 * @return {undefined}
 */
function displayIntroASCII() {
    const r = chalk.red;
    const g = chalk.gray;

    log.info(
`
${g(`╔═════════════════════════════════════════╗`)}
${g('║')}${r(`             ___ _ __  _ __              `)}${g('║')}
${g('║')}${r(`            / __| '_ \\| '_ \\             `)}${g('║')}
${g('║')}${r(`           | (__| | | | | | |            `)}${g('║')}
${g('║')}${r(`            \\___|_| |_|_| |_|            `)}${g('║')}
${g(`╠═════════════════════════════════════════╣`)}
${g(`║               - STARTER -               ║`)}
${g(`╚═════════════════════════════════════════╝`)}
`
    );
}

function run(root, type, callback) {
    const packagePath = path.resolve(process.cwd(), 'node_modules', type, 'src', 'index.js');
    const init = require(packagePath).create;
    init(root, type);
}

function fetchPackage(root, type, override, callback) {
    const uri = override || `git+ssh://git@github.com/cnnlabs/${type}.git`;

    let command = 'npm';
    let args = ['i', '-D', '-E', uri];

    log.info(chalk.gray(`Installing latest version of ${chalk.bold(type)} using ${chalk.bold(command)}`));

    const child = spawn(command, args, { stdio: 'inherit' });

    child.on('close', (code) => {
        if (code !== 0) {
            log.error(chalk.red(`${code} ${command} ${args.join(' ')} failed.`));
            process.exit(1);
        }
        callback();
    });
}

function install(root, type, override) {
    const step2 = run.bind(null, root, type);
    const step1 = fetchPackage.bind(null, root, type, override, step2);
    step1()
}

function handleInput(root) {
    return (choice) => {
        const type = types.filter(type => choice.type === type.label)[0] || {};
        install(root, type.value);
    }
}

function initalize(root) {
    displayIntroASCII();
    const action = handleInput(root);
    inquirer.prompt(prompts).then(action);
}

module.exports = initalize;
