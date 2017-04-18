var fs = require('fs');
var BINPATH = '../nightwatch/bin/';

/**
 * selenium-download does exactly what it's name suggests;
 * downloads (or updates) the version of Selenium (& chromedriver)
 * on your localhost where it will be used by Nightwatch.
 /the following code checks for the existence of `selenium.jar` before trying to run our tests.
 */

DownloadSeleniumAndChromeDriver();
configureTestsCommandInPackageDotJSON();
copyDefaultNightwatchConfigurationIntoProjectsRoot();
gitIgnoreInformativeFoldersIfPossible();
createFolder('../../tests');
createFolder('../../tests/end2end');
createFolder('../../tests/end2end/test-cases');
createFolder('../../tests/end2end/page-objects');
createFolder('../../tests/end2end/util');
copyExampleTestFilesIntoProjectsRoot();


function DownloadSeleniumAndChromeDriver() {
  fs.stat(BINPATH + 'selenium.jar', function (err, stat) { // got it?
    if (err || !stat || stat.size < 1) {
      require('selenium-download').ensure(BINPATH, function(error) {
        if (error) throw new Error(error); // no point continuing so exit!
        console.log('✔ Selenium & Chromedriver downloaded to:', BINPATH);
      });
    }
  });
}


function configureTestsCommandInPackageDotJSON() {
  var packageJSON = JSON.parse(fs.readFileSync('../../package.json', 'utf8'));
  var BROWSER_OR_HEADLESS_TEST_COMMAND = 'xvfb-maybe ./node_modules/.bin/nightwatch';
  var HEADLESS_TEST_COMMAND = 'xvfb-run ./node_modules/.bin/nightwatch';

  if(packageJSON.scripts) {
    packageJSON.scripts['test-nightwatch'] = BROWSER_OR_HEADLESS_TEST_COMMAND;
    packageJSON.scripts['test-nightwatch-headless'] = HEADLESS_TEST_COMMAND;
  } else {
    packageJSON.scripts = {};
    packageJSON.scripts.test = BROWSER_OR_HEADLESS_TEST_COMMAND;
    packageJSON.scripts['test-headless'] = HEADLESS_TEST_COMMAND;
  }

  fs.writeFile('../../package.json', JSON.stringify(packageJSON), 'utf8');
}

function copyDefaultNightwatchConfigurationIntoProjectsRoot() {
  fs.createReadStream('./generated-files/nightwatch-configuration.js').pipe(fs.createWriteStream('../../nightwatch.conf.js'));
}

function gitIgnoreInformativeFoldersIfPossible() {
  if (fs.existsSync('../../.gitignore')) {
    fs.appendFileSync('../../.gitignore', '\nreports\nscreenshots\nselenium-debug.log');
  }
}

function createFolder(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
}

function copyExampleTestFilesIntoProjectsRoot() {
  fs.createReadStream('./generated-files/constants.js').pipe(fs.createWriteStream('../../tests/end2end/util/constants.js'));
  fs.createReadStream('./generated-files/nightwatch.js').pipe(fs.createWriteStream('../../tests/end2end/test-cases/nightwatch.js'));
  fs.createReadStream('./generated-files/nightwatch.po.js').pipe(fs.createWriteStream('../../tests/end2end/page-objects/nightwatch.po.js'));
}