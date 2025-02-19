# What is QRPrint
QRPrint is an extremely basic chrome extension which extracts a QR-code from a visible portion of a web-page and prints it.

# How to install
- Download the repo (if lazy, just unzip https://github.com/grchld/qrprint/archive/refs/heads/main.zip)
- Open your favourite chrome-like browser and go to **chrome://extensions/** (or open "Extensions"/"Manage Extensions" from the browser menu).
- Make sure **Developer mode** at the top right corner of the page is on.
- Click **Load unpacked** button at the top left and point it to `dist` folder of the repo.

# How it works (if you bother to know)
It takes a screenshot of a page and tires to detects the corner markers.

It doesn't actully parse QR-codes, it only measures average brightness the QR-code pixels (modules) and if the result it clear enough (no half bright half dark pixels) it prints the pixels.

It only works for QR-codes in upright position. There's (almost) no rotation or distortion correction.

If there is more than one QR-code visible on the page, the extention just highlights them, but doesn't print.

If a QR-code is too small (less than 4 pixels per module) it won't be recognized. In that case just zoom in the page.

Yet, it works just fine for me to print various tickets and Amazon return codes on my thermal printer which is why I made it :)

# How to build (just in case you've forgotten)
- Get [`npm`](https://docs.npmjs.com/cli/v11/configuring-npm/install) installed on your favourite OS distribution. If you don't know what npm is, we have a problem and you might want to come back later.
- Run `npm install` in the repo's root to magically download all the standard stuff needed.
- Run `npm run build` to, you know, build it :)
