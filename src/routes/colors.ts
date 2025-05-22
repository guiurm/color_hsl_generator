import { Express } from 'express';
import { genPalette, isHexColor } from '../services/colorTransformerService';
import convert from 'color-convert';

const registerRoute = (app: Express) => {
    app.get('/gen-palette/:param', (req, res) => {
        const hexString = `#${req.params.param}`;
        const step = req.query.step ? parseInt(req.query.step as string, 10) : 100;

        if (!isHexColor(hexString)) {
            throw new Error('Invalid hex color');
        }

        const [h, s, l] = convert.hex.hsl(hexString);

        //const hexPalette = genPalette(hexString, step);
        // const rgbPalette = genRGBPalette(hexPalette);

        const hslResponse = {
            parsed: { hue: h, saturation: s, lightness: l },
            colorPalette: genPalette(hexString, step)
        };
        res.json(hslResponse);
    });
};

export { registerRoute };
