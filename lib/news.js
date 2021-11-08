const HTMLParser = require('node-html-parser');
const prompts = require('prompts');
const needle = require('needle');
const open = require('open');

exports.opennetNews = function() {
  let url = 'https://www.opennet.ru';
  let interval;

  let p = new Promise((res, rej) => {
    let news = [];
    needle.get( url, function(error, response) {
      if (!error && response.statusCode == 200) {
        console.log('Searching for last news..')
        let dataHtml = response.body;
        let dataTexts = [];
        let dataLinks = [];
        dataHtml = HTMLParser.parse(dataHtml).querySelectorAll('td.tnews a');
        for (let link of dataHtml) {
          let titleLink = link.text;
          dataTexts.push(titleLink);
          link = link.getAttribute('href');
          dataLinks.push(link);
        }
        for (let i = 0; i < dataLinks.length; i++) {
          let ob = Object.create({});
          ob.title = dataTexts[i];
          ob.value = url + dataLinks[i];
          news.push(ob);
        }
      }
      res(news);
    });
  });

  p.then((news) => {
    (async function viewList() {
      let response = await prompts({
        type: 'select',
        name: 'value',
        message: 'Pick a news',
        choices: news
      }, {onCancel:cleanup, onSubmit:cleanup});
      open(response.value);
      viewList();
    })();
  });

  function cleanup() {
    clearInterval(interval);
  }
}