import convert from 'color-convert';

function isHexColor(hex: string) {
    const hexColorRegex = /^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
    return hexColorRegex.test(hex);
}

const genPalette = (hex: string, step = 50) => {
    const [h, s, l] = convert.hex.hsl(hex);

    const lPorcentaje = parseInt((l / 10).toString()) * 100;
    const colors = {
        hex: {} as Record<string, string>,
        rgb: {} as { r: number; g: number; b: number },
        hsl: {} as { h: number; s: number; l: number }
    };

    for (let index = step; index < 1000; index = index + step) {
        if (index === 1000 - lPorcentaje) {
            colors.hex[index] = hex;
            const [h2, s2, l2] = convert.hex.hsl(colors.hex[index]);
            colors.hsl[index] = { h: h2, s: s2, l: l2 };
            const [r2, g2, b2] = convert.hex.rgb(colors.hex[index]);
            colors.rgb[index] = { r: r2, g: g2, b: b2 };
        } else {
            colors.hex[index] = '#' + convert.hsl.hex([h, s, 100 - index / 10]);
            const [h2, s2, l2] = convert.hex.hsl(colors.hex[index]);
            colors.hsl[index] = { h: h2, s: s2, l: l2 };
            const [r2, g2, b2] = convert.hex.rgb(colors.hex[index]);
            colors.rgb[index] = { r: r2, g: g2, b: b2 };
        }
    }

    return {
        colors,
        mainColor: { hex, index: Object.keys(colors.hex).find(key => colors.hex[key] === hex) as string }
    };
};

/*const genRGBPalette = (palette:ReturnType<typeof genPalette>) => {
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
};*/

export { isHexColor, genPalette };
