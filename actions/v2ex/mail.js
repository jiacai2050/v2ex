require('../../init-lc');
const ejs = require('ejs');
const fs = require('fs');
const { Query } = require('leancloud-storage');
const moment = require('moment');
const { Console } = require('console');
const { POST_TABLE_NAME, ONLINE_TABLE_NAME } = require('./common')

const file_opts = {'encoding': 'utf8'};
const git_sha = process.env.GIT_SHA || 'master';

const myArgs = process.argv.slice(2);
const output = myArgs[0] || 'result.html';
const file_console = new Console(fs.createWriteStream(output, file_opts));

async function fetch_post() {
  let today = moment().startOf('day');
  let yesterday = moment().add(-1, 'd').startOf('day');
  // console.log(today.toString(), yesterday.toString());
  let q = new Query(POST_TABLE_NAME);
  q.limit(1000);
  q.greaterThanOrEqualTo('created', yesterday.unix());
  q.lessThan('created', today.unix());
  q.descending('replies');

  let results = await q.find();
  let posts = [];
  for(let post of results) {
    let o = {
      id: post.get('id'),
      node: post.get('node')['title'],
      node_url: post.get('node')['url'],
      node_image: post.get('node')['avatar_mini'],
      description: post.get('content_rendered'),
      url: post.get('url'),
      replies: post.get('replies'),
      created: moment(post.get('created') * 1000).format('YYYY-MM-DD hh:mm:ss'),
      title: post.get('title'),
      author: post.get('member')['username'],
      author_url: post.get('member')['url'],
      author_image: post.get('member')['avatar_mini'],
    }
    posts.push(o);
  }
  let tmpl = fs.readFileSync(`${__dirname}/../../public/tmpl.ejs`, file_opts);
  let body = ejs.render(tmpl, {posts: posts, git_sha: git_sha}, {});
  file_console.log(body);
}

if (require.main === module) {
  fetch_post();
}