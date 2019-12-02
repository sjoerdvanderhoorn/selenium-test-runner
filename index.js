const readline = require('readline');
const fs = require('fs');

const { exec, spawn } = require('child_process');
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});


var sidefile = process.argv[2];

/* Load settings */
var settings = require(__dirname + "\\settings.json");


function menu()
{
	console.clear();
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
		fs.writeFile(__dirname + "\\settings.json", JSON.stringify(settings), function(){});
		menu();
	});
}

function runConsole(config)
{
	console.log(`Test started at ${new Date().toTimeString().split(" ")[0]}`);
	console.log();
	
	// Configure selenium-side-runner
	var output = "";
	var results = "";
	var options = {};
	var params = [
		__dirname + "\\node_modules\\selenium-side-runner\\dist\\index.js",
		sidefile,
		"--base-url",
		settings.baseurl
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
	// Create and set working directory
	var tempWorkingDirectory = __dirname + "\\temp\\" + Math.random();
	fs.mkdirSync(tempWorkingDirectory, { recursive: true });
	options.cwd = tempWorkingDirectory;
	
	// Start selenium-side-runner
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
		console.log(`Test completed at ${new Date().toTimeString().split(" ")[0]}`);
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


async function openIDE()
{
	// Open browser
	await spawn('C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe', 
	[
		`--app=chrome-extension://mooikfkahbdckldjjndioackbalphokd/index.html`,
		`--new-window`,
		`--user-data-dir=${__dirname}\\userdata`,
		`--remote-debugging-port=9229`
	]);
	const CDP = require('chrome-remote-interface');
	let chrome;
	try {
		// Connect to browser
		chrome = await CDP({port:9229});
		const {Browser, Network, Page, Runtime, DOM} = chrome;
		// Setup window
		Browser.setWindowBounds({windowId: 1, bounds:{left: 10, top: 10, width: 800, height: 800}});
		// Wait until page is loaded
		await Page.enable();
		await Page.loadEventFired();
		// Open file
		var domDocument = await DOM.getDocument();
		var filefield = await DOM.querySelector({ selector: "span.file-input input[type=file]", nodeId: domDocument.root.nodeId});
		await DOM.setFileInputFiles({files:[sidefile], nodeId:filefield.nodeId});
		// Remove overlay
		await Runtime.evaluate({ expression: `document.querySelector(".modal-overlay").style.display = "none";` });
		// Set window title
		await Runtime.evaluate({ expression: `document.title="Selenium IDE - ${sidefile.replace(/\\/g,"\\\\")}";` });
	}
	catch (err)
	{
		console.error(err);
	}
	finally
	{
		if (chrome)
		{
			await chrome.close();
		}
	}
	menu();
}



// Show menu
menu();
