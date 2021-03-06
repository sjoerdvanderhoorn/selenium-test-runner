@echo off

rem Create settings file
if not exist settings.json copy settings.sample.json settings.json

rem Open Chrome and let the user install the Selenium IDE extension
echo.
echo You will need to install the Selenium IDE extension 
echo in the browser window that opens. Wait until the 
echo extension is installed and then close the browser window.
echo.

pause

"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" https://chrome.google.com/webstore/detail/selenium-ide/mooikfkahbdckldjjndioackbalphokd --new-window --user-data-dir=%~dp0\userdata --remote-debugging-port=9229

rem Install file assocations for .side
assoc .side=sideFile
ftype sideFile="C:\Program Files\nodejs\node.exe" "%~dp0\index.js" "%%1"

rem Add chromedriver to path
setx path "%path%;%appdata%\npm\node_modules\chromedriver\lib\chromedriver"

rem Install npm dependencies
npm install

echo.
echo Installation complete.
echo.

pause