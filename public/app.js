
(function($) {
  function fetch_v2ex(start, end, table_id) {
    console.log(start,end,table_id);
    let q = new AV.Query('v2ex');
    q.greaterThanOrEqualTo('created', start);
    q.lessThan('created', end);
    q.descending('replies');
    q.find().then(function(results) {
      let table = $(`#${table_id}`);
      let posts = results;
      console.log(posts);
      if (posts.length < 1) {
        alert(`V2EX ${current_day} 数据没有采集`);
      } else {
        for (let p of posts) {
          // console.log(p);
          p = p.attributes;
          table.append(`<tr><td>${p['replies']}</td><td><a href='${p.url}'>${p['title']}</a></td></tr`);
        }
      }

    }, function(error) {
      alert(JSON.stringify(error));
    });
  }

  function fetch_hackernews(start, end, table_id) {
    console.log(start,end,table_id);
    let q = new AV.Query('hackernews');
    q.greaterThanOrEqualTo('time', start);
    q.lessThan('time', end);
    q.limit(25);
    q.descending('score');
    q.find().then(function(results) {
      let table = $(`#${table_id}`);
      let posts = results;
      console.log(posts);
      if (posts.length < 1) {
        alert(`HackerNews ${current_day} 数据没有采集`);
      } else {
        for (let p of posts) {
          console.log(p);
          p = p.attributes;
          table.append(`<tr><td><a href="https://news.ycombinator.com/item?id=${p['id']}">${p['score']}</a></td><td><a href='${p.url}'>${p['title']}</a></td></tr`);
        }
      }

    }, function(error) {
      alert(JSON.stringify(error));
    });
  }

  const theme_key = 'hot-post-theme';
  let current_theme = localStorage.getItem(theme_key);

  function conf_dark_mode($) {
    // https://github.com/darkreader/darkreader
    if (current_theme == "dark") {
      DarkReader.enable({
        brightness: 100,
        contrast: 90,
        sepia: 10
      });
    } else if (current_theme == "light") {
    } else {
      DarkReader.auto({
        brightness: 100,
        contrast: 90,
        sepia: 10
      });
    }

    $("#btn-toggle").click(()=>{
      let next_theme = '';
      if(!!current_theme) {
        next_theme = current_theme === 'light' ? 'dark': 'light';
      } else {
        DarkReader.auto(false);
        next_theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? 'light': 'dark'
      }
      if (next_theme == 'dark') {
        DarkReader.enable({
          brightness: 100,
          contrast: 90,
          sepia: 10
        });
      } else {
        DarkReader.disable();
      }
      current_theme = next_theme;
      console.log(next_theme);
      localStorage.setItem(theme_key, next_theme);
    });
  }

  var APP_ID = 'vUbVDkqX7D3l5nlGrMB2YNga-gzGzoHsz';
  var APP_KEY = 'hSeyI7bPX7rENUHyCzNDuyK8';

  var current_day = moment().add(-1, 'd').format('YYYYMMDD');
  var m = /day=(\d+)/.exec(window.location.search);
  if(m) {
    current_day = m[1];
  }
  AV.init({
    appId: APP_ID,
    appKey: APP_KEY,
  });

  today = moment(current_day);
  yesterday = moment(current_day).add(-1, 'd');
  tommorrow = moment(current_day).add(1, 'd');
  let yesterday_str =  yesterday.format('YYYYMMDD');
  let tommorrow_str =  tommorrow.format('YYYYMMDD');


  const KEY_LEFT = 37;
  const KEY_UP = 38;
  const KEY_RIGHT = 39;
  const KEY_DOWN = 40;
  const KEY_J = 106;
  const KEY_K = 107;
  window.onload = () => {
    conf_dark_mode(jQuery);
    let current_day_e = document.getElementById("current_day");
    current_day_e.innerHTML = current_day;
    current_day_e.onclick = function(e) {
      let which_day = prompt("Which day to go?", yesterday_str);
      window.location = `${path}?day=${which_day}`;
    }

    fetch_v2ex(yesterday.unix(), today.unix(), 'v2ex_table');
    fetch_hackernews(yesterday.unix(), today.unix(), 'hackernews_table');

    let path = window.location.pathname;
    $("#prev").attr('href', `${path}?day=${yesterday_str}`);
    $("#next").attr('href', `${path}?day=${tommorrow_str}`);

    document.addEventListener("keypress", (e) => {
	  switch (e.keyCode) {
	  case KEY_LEFT:
	  case KEY_J:
        window.location = `${path}?day=${yesterday_str}`;
	    break;
	  case KEY_RIGHT:
	  case KEY_K:
        window.location = `${path}?day=${tommorrow_str}`;
	    break;
      default:
        console.log(e);
	  }
    }, false);
  }
})(jQuery)
