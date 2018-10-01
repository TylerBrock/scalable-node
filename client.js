const http = require('http');

// Run up to limit tasks in parallel, resolves when all tasks complete
async function parallelLimit(taskFns, limit) {
  const results = [];
  const tasks = new Set();

  for (const taskFn of taskFns) {
    const task = taskFn().then((result) => {
      results.push(result);
      tasks.delete(task);
      return result;
    }, (err) => {
      console.error('Error', err);
    });
    tasks.add(task);

    if (tasks.size === limit) {
      await Promise.race(tasks);
    }
  }

  await Promise.all(tasks);

  return results;
}

function requestGenerator() {
  const requestPromise = () => {
    return new Promise((resolve, reject) => {
      http.get({
        hostname: 'localhost',
        port: 8000,
        path: '/',
      }, (res) => {
        resolve(res);
      }, (err) => {
        reject(err);
      });
    });
  };
  return requestPromise;
}

function mapResults(results) {
  return results.reduce((mapped, result) => {
    const statusCode = result.statusCode;
    if (statusCode in mapped) {
      mapped[statusCode] += 1
    } else {
      mapped[statusCode] = 1
    }
    return mapped;
  }, {});
}

let counter = 0;
(async () => {
  const requests = [];
  for (i=0; i<100000; i++) {
    /*
    requests.push(() => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          console.log('done', counter);
          resolve(counter++);
        }, 1000);
      });
    });
    */
    requests.push(requestGenerator())
  }

  const results = await parallelLimit(requests, 1000);
  console.log('done', mapResults(results));
})();
