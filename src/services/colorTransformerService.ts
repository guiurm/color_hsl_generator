import convert from 'color-convert';

function isHexColor(hex: string) {
    const hexColorRegex = /^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
    return hexColorRegex.test(hex);
}

const genPalette = (hex: string, step = 50) => {
    const [h, s, l] = convert.hex.hsl(hex);

    const lPorcentaje = parseInt((l / 10).toString()) * 100;
    const index= 1000-lPorcentaje

    const colors = {
        hex: {} as {hex:string,textLuminance:"light" | "dark"},
        rgb: {} as { r: number; g: number; b: number,textLuminance:"light" | "dark" },
        hsl: {} as { h: number; s: number; l: number,textLuminance:"light" | "dark" }
    };

    for (let index = step; index < 1000; index = index + step) {
        if (index === 1000 - lPorcentaje) {
            const [h2, s2, l2] = convert.hex.hsl(hex);
            const [r2, g2, b2] = convert.hex.rgb(hex);
            
            const textLuminance= getTextColorByLuminance(h2,s2,l2)
            
            colors.hex[index] = {hex,textLuminance};
            colors.hsl[index] = { h: h2, s: s2, l: l2,textLuminance };
            colors.rgb[index] = { r: r2, g: g2, b: b2,textLuminance };
        } else {
            const hex = '#' + convert.hsl.hex([h, s, 100 - index / 10]);
            const [h2, s2, l2] = convert.hex.hsl(hex);
            const [r2, g2, b2] = convert.hex.rgb(hex);

            const textLuminance= getTextColorByLuminance(h2,s2,l2)

            colors.hex[index]= {hex,textLuminance}
            colors.hsl[index] = { h: h2, s: s2, l: l2,textLuminance };
            colors.rgb[index] = { r: r2, g: g2, b: b2,textLuminance };
        }
    }

    return {
        colors,
        mainColor: { hex, index,rgb:colors.rgb[index],hsl:colors.hsl[index]}
    };
};

/**
     * Determina si el texto debe ser claro u oscuro según la luminancia relativa del fondo HSL.
     * Usa la fórmula de luminancia relativa (W3C) para decidir el color del texto.
     * @param {number} h - Matiz (0-360)
     * @param {number} s - Saturación (0-100)
     * @param {number} l - Luminosidad (0-100)
     * @returns {'light' | 'dark'}
     */
    const getTextColorByLuminance = (h: number, s: number, l: number): 'light' | 'dark' => {
        // Convertir HSL a RGB (0-1)
        s /= 100;
        l /= 100;

        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
        const m = l - c / 2;
        let r = 0, g = 0, b = 0;

        if (h >= 0 && h < 60) [r, g, b] = [c, x, 0];
        else if (h >= 60 && h < 120) [r, g, b] = [x, c, 0];
        else if (h >= 120 && h < 180) [r, g, b] = [0, c, x];
        else if (h >= 180 && h < 240) [r, g, b] = [0, x, c];
        else if (h >= 240 && h < 300) [r, g, b] = [x, 0, c];
        else if (h >= 300 && h < 360) [r, g, b] = [c, 0, x];

        r += m;
        g += m;
        b += m;

        // Luminancia relativa (W3C)
        const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

        // Umbral recomendado: 0.5
        return luminance > 0.5 ? 'dark' : 'light';
    };

export { isHexColor, genPalette };
