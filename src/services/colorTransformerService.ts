import Color, { ColorInstance } from 'color';

function isHexColor(hex: string) {
    const hexColorRegex = /^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
    return hexColorRegex.test(hex);
}

const genPalette = (hex: string, step = 50) => {
    const baseColor = Color(hex);
    const { h, s, l } = baseColor.hsl().object();

    const lPorcentaje = parseInt((l / 10).toString()) * 100;
    const mainIndex = 1000 - lPorcentaje;

    const colors = {
        hex: {} as Record<number, { hex: string; textLuminance: 'light' | 'dark' }>,
        rgb: {} as Record<number, { r: number; g: number; b: number; textLuminance: 'light' | 'dark' }>,
        hsl: {} as Record<number, { h: number; s: number; l: number; textLuminance: 'light' | 'dark' }>
    };

    for (let idx = step; idx < 1000; idx += step) {
        let color: ColorInstance;

        if (idx === mainIndex) {
            color = baseColor;
        } else {
            // Variar la luminosidad manteniendo h y s
            color = Color({ h, s, l: 100 - idx / 10 }).hsl();
        }

        const hslObj = color.hsl().object();
        const rgbObj = color.rgb().object();
        const hexStr = color.hex().toLowerCase();
        const textLuminance = getTextColorByLuminance(color);

        colors.hex[idx] = { hex: hexStr, textLuminance };
        colors.hsl[idx] = { 
            h: Math.round(hslObj.h), 
            s: Math.round(hslObj.s), 
            l: Math.round(hslObj.l), 
            textLuminance 
        };
        colors.rgb[idx] = { 
            r: Math.round(rgbObj.r), 
            g: Math.round(rgbObj.g), 
            b: Math.round(rgbObj.b), 
            textLuminance 
        };
    }

    return {
        colors,
        mainColor: {
            hex: {value:colors.hex[mainIndex].hex, textLuminance: colors.hex[mainIndex].textLuminance},
            index: mainIndex,
            rgb: colors.rgb[mainIndex],
            hsl: colors.hsl[mainIndex],
        }
    };
};


const getTextColorByLuminance = (colorInstance:ColorInstance): 'light' | 'dark' => {
    // return ({a:colorInstance.luminosity(),b:colorInstance.luminosity() > 0.5 ? 'dark' : 'light'} ) as unknown as 'light' | 'dark';
    // W3C recommends a threshold of 0.179 for relative luminance
    return colorInstance.luminosity() > 0.179 ? 'dark' : 'light';
};

export { isHexColor, genPalette };
