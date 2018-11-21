const { Chromeless } = require('chromeless')
const fs = require('fs');

const now = +Date.now();

async function run(joinUrl, chromeless) {
  const waitToJoin = 100; //Math.floor(Math.random() * 5 * 100);
  
  let data = {};

  await chromeless.clearStorage('*', 'all');
  await chromeless.wait(waitToJoin);
  await chromeless.goto(joinUrl);
  await chromeless.wait('#app');
  data.onLoad = await chromeless
    .evaluate(() => {
      const Auth = require('/imports/ui/services/auth').default;
      const Users = require('/imports/api/users').default;
      return {
        modalExists: !!$('button[aria-label="Microphone"]'),
        loggedIn: Auth.loggedIn,
        // credentials: Auth.credentials,
        // user: Users.findOne({ userId: Auth.userID }),
        usersCount: Users.find({ connectionStatus: 'online' }).count(),
        connection: Meteor.status(),
      };
    });
  await chromeless.wait(15 * 1000);
  data.after = await chromeless
    .evaluate(() => {
      const Auth = require('/imports/ui/services/auth').default;
      const Users = require('/imports/api/users').default;
      return {
        modalExists: !!$('button[aria-label="Microphone"]'),
        loggedIn: Auth.loggedIn,
        credentials: Auth.credentials,
        user: Users.findOne({ userId: Auth.userID }),
        usersCount: Users.find({ connectionStatus: 'online' }).count(),
        connection: Meteor.status(),
      };
    });
  await chromeless.wait(30 * 1000).end();

  return data;
}

async function proccess(length) {
  const promises = Array.from({ length }, (_, i) => {
    const url = 'https://s150.meetbbb.com/bigbluebutton/api/join?fullName=User+9350639&joinViaHtml5=true&meetingID=random-3006831&password=mp&redirect=true&checksum=7ad266b47e79bf9dd9287f0da34a9f6f90455f28';
    const chromeless = new Chromeless({ remote: false, cdp: { port: 9000 + i } });
    return run(url, chromeless).catch(e => Promise.resolve(e))
  });

  Promise.all(promises).then(logs => {
    fs.writeFile('log.json', JSON.stringify(logs), 'utf8', (error) => {
      if(error) console.error(error);
    });

    fs.writeFile('errorlog.json', JSON.stringify(logs.filter(a => 
      typeof a === 'string' || !('after' in a) || ('after' in a && !a.after.modalExists)
    )), 'utf8', (error) => {
      if(error) console.error(error);
    });
  });
}

try {
  proccess(300);
} catch (e) {
  console.error(e);
}

process.on('uncaughtException', function(err) {
  console.error(err.toString());
});