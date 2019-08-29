const { spawnChrome } = require("chrome-debugging-client");
const { expect } = require('chai');

async function navigate(page, url) {
  const loadEvent = page.until('Page.loadEventFired');
  await page.send('Page.navigate', { url });
  await loadEvent;

  return page;
}

async function run(url, callback) {
  const chrome = spawnChrome({ headless: true });

  try {
    const browser = chrome.connection;

    browser.on("error", err => {
      // underlying connection error or error dispatching events.
      console.error(`connection error ${err.stack}`);
    });

    const { targetId } = await browser.send("Target.createTarget", {
      url: 'about:blank'
    });
    await browser.send('Target.activateTarget', { targetId });
    const page = await browser.attachToTarget(targetId);
    await page.send('Page.enable', undefined);

    await navigate(page, url);
    await callback(page);

    await browser.send('Target.closeTarget', { targetId });
    // graceful browser shutdown
    await chrome.close();
  } finally {
    await chrome.dispose();
  }
}

async function timeout(time, callback) {
  return new Promise((resolve, reject) => {
    const cookie = setTimeout(() => {
      reject(new Error(`Timeout of '${time}ms' Exceeded`));
    }, time);

    callback(
      (value) => {
        clearTimeout(cookie);
        resolve(value);
      },
      (reason) => {
        clearTimeout(cookie);
        reject(reason);
      }
    );
  });
}

it('wait for navigation (no timeout)', async function() {
  this.timeout(10000);
  await run(`file://${ __dirname }/index.html`, async page => {
    await timeout(4000, resolve => {
      page.on('Page.frameNavigated', frame => {
        resolve();
      });
    });
  });
});

it('wait for navigation (expect timeout)', async function() {
  this.timeout(10000);
  try {
  await run(`file://${ __dirname }/index.html?timeout=500`, async page => {
    await timeout(100, resolve => {
      page.on('Page.frameNavigated', frame => {
        resolve();
      });
    });
  });
    expect(true, 'expected this test to timeout').to.eql(false);
  } catch(e) {
    expect(e.message).to.match(/Timeout of '\d+ms' Exceeded/);
  }
});
