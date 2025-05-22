/**
 * MIT License
 *
 * © 2023 [guiurm](https://github.com/guiurm)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import convert from "color-convert";
import dotenv from "dotenv";
import express from "express";
import winston from "winston";

dotenv.config();

function isHexColor(hex) {
    const hexColorRegex = /^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
    return hexColorRegex.test(hex);
}

/**
 * Generates a color palette based on a given hex color and step value.
 *
 * @param {string} hex - The base hex color from which to generate the palette.
 * @param {number} [step=50] - The step increment for generating the palette colors.
 * @returns {Object} An object containing the generated colors and the main color details.
 *   - colors: An object where keys represent the step index and values are the corresponding hex colors.
 *   - mainColor: An object with the properties:
 *     - hex: The original hex color.
 *     - index: The index in the palette where the original hex color appears.
 */
const genPalette = (hex, step = 50) => {
    const [h, s, l] = convert.hex.hsl(hex);

    const lPorcentaje = parseInt((l / 10).toString()) * 100;
    const colors = {
        hex: {},
        rgb: {},
        hsl: {},
    };

    for (let index = step; index < 1000; index = index + step) {
        if (index === 1000 - lPorcentaje) {
            colors.hex[index] = hex;
            const [h2, s2, l2] = convert.hex.hsl(colors.hex[index]);
            colors.hsl[index] = { h: h2, s: s2, l: l2 };
            const [r2, g2, b2] = convert.hex.rgb(colors.hex[index]);
            colors.rgb[index] = { r: r2, g: g2, b: b2 };
        } else {
            colors.hex[index] = "#" + convert.hsl.hex([h, s, 100 - index / 10]);
            const [h2, s2, l2] = convert.hex.hsl(colors.hex[index]);
            colors.hsl[index] = { h: h2, s: s2, l: l2 };
            const [r2, g2, b2] = convert.hex.rgb(colors.hex[index]);
            colors.rgb[index] = { r: r2, g: g2, b: b2 };
        }
    }

    return { colors, mainColor: { hex, index: Object.keys(colors.hex).find((key) => colors.hex[key] === hex) } };
};

const genRGBPalette = (palette) => {
    const [r1, g1, b1] = convert.hex.rgb(palette.mainColor.hex);
    const rgbPalette = {
        colors: {},
        mainColor: {
            rgb: { r: r1, g: g1, b: b1 },
            index: palette.mainColor.index,
        },
    };

    Object.entries(palette.colors).forEach(([key, hex]) => {
        const [r, g, b] = convert.hex.rgb(hex);
        rgbPalette.colors[key] = { r, g, b };
    });

    return rgbPalette;
};

const app = express();
const port = process.env.PORT || 3000;

const logger = winston.createLogger({
    level: "info",
    format: winston.format.json(),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: "error.log", level: "error" }),
        new winston.transports.File({ filename: "combined.log" }),
    ],
});

app.use(express.json());

app.get("/hsl/:param", (req, res) => {
    const hexString = `#${req.params.param}`;
    const step = req.query.step ? parseInt(req.query.step, 10) : 100;

    if (!isHexColor(hexString)) {
        throw new Error("Invalid hex color");
    }

    const [h, s, l] = convert.hex.hsl(hexString);

    const hexPalette = genPalette(hexString, step);
    const rgbPalette = genRGBPalette(hexPalette);

    const hslResponse = {
        parsed: { hue: h, saturation: s, lightness: l },
        colorPalette: genPalette(hexString, step),
    };
    res.json(hslResponse);
});

app.use((err, req, res, next) => {
    logger.error(`${err.stack}`);
    res.status(500).json({ error: "Something went wrong!" });
});

app.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
});
