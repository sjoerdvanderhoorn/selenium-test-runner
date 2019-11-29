@auto off

rem Install file assocations for .side
assoc .side=sideFile
ftype sideFile="C:\Program Files\nodejs\node.exe" "C:\Prive\selenium-test-runner\index.js" "%%1"

rem Install npm dependencies
npm install

pause