const { ipcRenderer } = require('electron');
const path = require('path');
const osu = require('node-os-utils');
const cpu = osu.cpu;
const mem = osu.mem;
const os = osu.os;

let overload;
let alertFrequency;
ipcRenderer.on('settings:get', (e, data) => {
  overload = +data.cpuOverload;
  alertFrequency = +data.alertFrequency;
});
setInterval(() => {
  cpu.usage().then((info) => {
    document.getElementById('cpu-usage').innerText = info + '%';
    document.getElementById('cpu-progress').style.width = info + '%';
    if (info >= overload) {
      document.getElementById('cpu-progress').style.background = 'red';
    } else {
      document.getElementById('cpu-progress').style.background = '#30c88b';
    }
    if (info >= overload && runNotify(alertFrequency)) {
      notifyUser({
        title: 'CPU overloaded',
        body: `CPU is over ${overload}%`,
        icon: path.join(__dirname, 'img', 'bg.jpg'),
      });
      localStorage.setItem('lastNotify', +new Date());
    }
  });
  cpu.free().then((info) => {
    document.getElementById('cpu-free').innerText = info + '%';
  });
  document.getElementById('sys-uptime').innerText = secondsTodhms(os.uptime());
}, 2000);

document.getElementById('cpu-model').innerText = cpu.model();
document.getElementById('comp-name').innerText = os.hostname();
document.getElementById('os').innerText = `${os.type()} ${os.arch()}`;
mem.info().then((info) => {
  document.getElementById('mem-total').innerText = info.totalMemMb;
});
function secondsTodhms(seconds) {
  seconds = +seconds;
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${d}d ${h}h ${m}m ${s}s`;
}

function notifyUser(options) {
  new Notification(options.title, options);
}
function runNotify() {
  const val = localStorage.getItem('lastNotify');
  if (val === null) {
    localStorage.setItem('lastNotify', +new Date());
    return true;
  }
  const lastNotify = +new Date(parseInt(val));
  const now = new Date();
  const diffTime = Math.abs(now - lastNotify);
  const minPassed = Math.ceil(diffTime / (1000 * 60));
  if (minPassed > alertFrequency) {
    return true;
  } else {
    return false;
  }
}
