const readline = require('readline');
const fs = require('fs');

const { exec, spawn } = require('child_process');
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});


var sidefile = process.argv[2];
//sidefile = "C:\\Prive\\selenium-test-runner\\examples\\bbb.side";

/* Load settings */
var settings = require('./settings.json');


function menu()
{
	console.clear();
	// Color reference: https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color
	console.log();
	console.log(`------------------------------------`);
	console.log(`       Selenium Test Runner`);
	console.log(`------------------------------------`);
	console.log();
	console.log(`  Test:`);
	console.log(`  - \x1b[32m${sidefile}\x1b[0m`);
	console.log();
	console.log(`  Base-URL:`);
	console.log(`  - \x1b[32m${settings.baseurl}\x1b[0m`);
	console.log();
	console.log(`------------------------------------`);
	console.log(`[U] - Change Base-URL`);
	console.log(`------------------------------------`);
	console.log(`[B] - Run in Console with Browser`);
	console.log(`[C] - Run in Console`);
	console.log(`[D] - Run in Console with Debug info`);
	console.log(`[I] - Open in IDE`);
	console.log(`------------------------------------`);
	console.log(`[Q] - Quit`);
	console.log(`------------------------------------`);
	console.log();
	console.log(`Make your selection: `);
	process.stdin.on('keypress', menuListener);

}

function menuListener(s, key)
{
	process.stdin.removeListener('keypress', menuListener);
	console.log();
	console.log();
	if ((key.name == "q") || (key.ctrl && key.name === 'c'))
	{
		process.exit();
	}
	else if (key.name == "u")
	{
		setBaseUrl();
	}
	else if (key.name == "b")
	{
		runConsole({browser: true, debug: false});
	}
	else if (key.name == "c")
	{
		runConsole({browser: false, debug: false});
	}
	else if (key.name == "d")
	{
		runConsole({browser: true, debug: true});
	}
	else if (key.name == "i")
	{
		openIDE()
	}
	else
	{
		menu();
	}
}

function setBaseUrl()
{
	rl.question('New Base-URL:\n', function (answer)
	{
		settings.baseurl = answer;
		fs.writeFile(".\\settings.json", JSON.stringify(settings), function(){});
		menu();
	});
}

function runConsole(config)
{
	console.log(`Test started at ${currentTime()}`);
	console.log();
	
	var output = "";
	var results = "";
	var options = {};
	var params = [
		'.\\node_modules\\selenium-side-runner\\dist\\index.js',
		sidefile,
		'--base-url',
		settings.baseurl,
		'--output-directory=' + 'C:\\Prive\\Temp',
		'--output-format=junit'
	];
	if (!config.browser)
	{
		// Hide Chrome
		params.push('-c');
		params.push('browserName=chrome goog:chromeOptions.args=[disable-infobars, headless] timeouts.implicit=5000');
	}
	if (!config.debug)
	{
		// Hide F12 panel output
		options.windowsHide = true;
	}
	var child = spawn('node', params, options);
	
	child.stderr.on('data', (data) => {
		// Results
		results = `${results}\n${data}`;
	});
	child.stdout.on('data', (data) => {
		// Other output
		output = `${output}\n${data}`;
	});

	child.on('close', function (code, signal)
	{
		console.log(`Test completed at ${currentTime()}`);
		console.log();
		
		if (code == 0)
		{
			console.log(`\x1b[32m------------------------------------\x1b[0m`);
			console.log(`\x1b[32m           TEST PASSED              \x1b[0m`);
			console.log(`\x1b[32m------------------------------------\x1b[0m`);
		}
		else
		{
			console.log(`\x1b[31m------------------------------------\x1b[0m`);
			console.log(`\x1b[31m             RESULTS                \x1b[0m`);
			console.log(`\x1b[31m------------------------------------\x1b[0m`);
			console.log();
			console.log(results);
			console.log();
			console.log(`\x1b[31m------------------------------------\x1b[0m`);
			console.log(`\x1b[31m           TEST FAILED              \x1b[0m`);
			console.log(`\x1b[31m------------------------------------\x1b[0m`);
		}
		
		console.log();
		console.log(`  - \x1b[32m${sidefile}\x1b[0m`);
		console.log(`  - \x1b[32m${settings.baseurl}\x1b[0m`);
		console.log();
		console.log(`------------------------------------`);
		console.log(`[I] - Open in IDE`);
		//console.log(`[U] - Update Assertion`);
		console.log(`[M] - Menu`);
		console.log(`------------------------------------`);
		console.log(`[Q] - Quit`);
		console.log(`------------------------------------`);
		console.log();
		console.log(`Make your selection: `);
		process.stdin.on('keypress', runConsoleListener);
	});
}

function runConsoleListener(s, key)
{
	process.stdin.removeListener('keypress', runConsoleListener);
	console.log();
	console.log();
	if ((key.name == "q") || (key.ctrl && key.name === 'c'))
	{
		process.exit();
	}
	else if (key.name == "m")
	{
		menu();
	}
	/*
	else if (key.name == "u")
	{
		updateTest();
	}
	*/
	else if (key.name == "i")
	{
		openIDE()
	}
	else
	{
		process.exit();
	}
}


function openIDE()
{
	console.log("Open in IDE");
}



// Show menu
menu();



function currentTime()
{
	return new Date().toTimeString().split(" ")[0];
}