// pin documentation: https://pinout.xyz/

// const BUTTON_PINS = [0, 2, 3, 4, 5];
const BUTTON_PINS = [5, 0, 4, 3, 2];

const buttonState = [false, false, false, false, false];

let waitingPromise = null;
let onButtonPressCallback = null;
let stateUpdateCallback = () => {};

const registerStateUpdate = (callback) => {
  stateUpdateCallback = callback;
};

const getButtonState = () => buttonState;

const handleButtonPressDown = (id) => {
  buttonState[id] = true;
  stateUpdateCallback();

  if (waitingPromise) {
    waitingPromise(id);
    waitingPromise = null;
  }

  if (onButtonPressCallback) {
    onButtonPressCallback(id);
  }
};

const handleButtonPressUp = (id) => {
  buttonState[id] = false;
  stateUpdateCallback();
}

const waitForButtonPress = () => {
  return new Promise((resolve) => {
    waitingPromise = resolve;
  });
};

const onButtonPress = (callback) => {
  onButtonPressCallback = callback;
};

const mockButtonPress = (id) => {
  handleButtonPressDown(id);
  setTimeout(() => handleButtonPressUp(id), 2000);
};

try {
  const onoff = require("onoff");
  initGpio(onoff.Gpio);
} catch (err) {
  console.error("No GPIO available:", err);
}

function initGpio(Gpio) {
  const buttons = BUTTON_PINS.map(
    (pin) =>
      new Gpio(pin, "in", "both", {
        debounceTimeout: 10,
        activeLow: true,
      })
  );

  buttons.forEach((button, i) => {
    button.watch((err, value) => {
      if (err) {
        console.error("GPIO error", err);
        return;
      }

      if (value) {
        handleButtonPressDown(i);
      } else {
        handleButtonPressUp(i);
      }
    });
  });

  process.on("SIGINT", () => {
    console.log("deregistering buttons");
    buttons.forEach((button) => button.unexport());
    process.exit();
  });
}

module.exports.buttonCount = 5;
module.exports.waitForButtonPress = waitForButtonPress;
module.exports.onButtonPress = onButtonPress;
module.exports.mockButtonPress = mockButtonPress;
module.exports.registerStateUpdate = registerStateUpdate;
module.exports.getButtonState = getButtonState;
