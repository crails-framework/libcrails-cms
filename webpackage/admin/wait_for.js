function waitForFunction(resolve, condition, interval) {
  try {
    const value = condition();
    if (value) {
      resolve(value);
      return ;
    }
  } catch (err) {
  }
  setTimeout(waitForFunction.bind(this, resolve, condition), interval);
}

export default function waitFor(condition, interval = 250) {
  return new Promise(function(resolve) {
    waitForFunction(resolve, condition, interval);
  });
}
