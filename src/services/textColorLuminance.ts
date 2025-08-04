/**
 * Professional color contrast utilities for determining optimal text colors
 * Based on WCAG 2.1 guidelines and perceptual luminance calculations
 */

// =============================================================================
// Types and Constants
// =============================================================================

interface RGB {
    readonly r: number;
    readonly g: number;
    readonly b: number;
}

interface ContrastAnalysis {
    readonly textColor: string;
    readonly contrastRatio: number;
    readonly isAccessible: boolean;
    readonly wcagLevel: WCAGLevel;
}

type WCAGLevel = 'AAA' | 'AA' | 'FAIL';
export type TextColor = '#ffffff' | '#000000';

const WCAG_THRESHOLDS = {
    AA: 4.5,
    AAA: 7.0
} as const;

const LUMINANCE_COEFFICIENTS = {
    RED: 0.2126,
    GREEN: 0.7152,
    BLUE: 0.0722
} as const;

const GAMMA_THRESHOLD = 0.03928;
const GAMMA_FACTOR = 12.92;
const GAMMA_OFFSET = 0.055;
const GAMMA_DIVISOR = 1.055;
const GAMMA_EXPONENT = 2.4;

const LUMINANCE_THRESHOLD = 0.5;
const LUMINANCE_OFFSET = 0.05;

// =============================================================================
// Core Utility Functions
// =============================================================================

/**
 * Converts a hexadecimal color string to RGB values
 * Supports both 3 and 6 character hex codes with or without hash prefix
 */
function parseHexColor(hex: string): RGB | null {
    const cleanHex = hex.replace('#', '');

    // Handle 3-character hex codes
    if (cleanHex.length === 3) {
        const expandedHex = cleanHex
            .split('')
            .map(char => char + char)
            .join('');
        return parseFullHexColor(expandedHex);
    }

    // Handle 6-character hex codes
    if (cleanHex.length === 6) {
        return parseFullHexColor(cleanHex);
    }

    return null;
}

/**
 * Parses a 6-character hex color string to RGB
 */
function parseFullHexColor(hex: string): RGB | null {
    const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    return result
        ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16)
          }
        : null;
}

/**
 * Applies gamma correction to a color channel value
 * Converts sRGB values to linear RGB for luminance calculation
 */
function applyGammaCorrection(channelValue: number): number {
    const normalizedValue = channelValue / 255;

    return normalizedValue <= GAMMA_THRESHOLD
        ? normalizedValue / GAMMA_FACTOR
        : Math.pow((normalizedValue + GAMMA_OFFSET) / GAMMA_DIVISOR, GAMMA_EXPONENT);
}

/**
 * Calculates the relative luminance of a color according to WCAG 2.1
 * Returns a value between 0 (darkest) and 1 (lightest)
 */
function calculateRelativeLuminance(rgb: RGB): number {
    const { r, g, b } = rgb;

    const linearR = applyGammaCorrection(r);
    const linearG = applyGammaCorrection(g);
    const linearB = applyGammaCorrection(b);

    return (
        LUMINANCE_COEFFICIENTS.RED * linearR +
        LUMINANCE_COEFFICIENTS.GREEN * linearG +
        LUMINANCE_COEFFICIENTS.BLUE * linearB
    );
}

/**
 * Calculates the contrast ratio between two luminance values
 * Returns a value between 1:1 (no contrast) and 21:1 (maximum contrast)
 */
function calculateContrastRatio(luminance1: number, luminance2: number): number {
    const lighter = Math.max(luminance1, luminance2);
    const darker = Math.min(luminance1, luminance2);

    return (lighter + LUMINANCE_OFFSET) / (darker + LUMINANCE_OFFSET);
}

/**
 * Determines WCAG compliance level based on contrast ratio
 */
function getWCAGLevel(contrastRatio: number): WCAGLevel {
    if (contrastRatio >= WCAG_THRESHOLDS.AAA) return 'AAA';
    if (contrastRatio >= WCAG_THRESHOLDS.AA) return 'AA';
    return 'FAIL';
}

// =============================================================================
// Public API Functions
// =============================================================================

/**
 * Determines optimal text color using WCAG contrast calculations
 * Returns the color (black or white) that provides the highest contrast ratio
 *
 * @param backgroundColor - Hex color string (with or without #)
 * @returns '#ffffff' or '#000000'
 * @throws Error if hex color is invalid
 */
export function getOptimalTextColorWCAG(backgroundColor: string): TextColor {
    const rgb = parseHexColor(backgroundColor);
    if (!rgb) {
        throw new Error(`Invalid hex color: ${backgroundColor}`);
    }

    const backgroundLuminance = calculateRelativeLuminance(rgb);
    const whiteLuminance = 1;
    const blackLuminance = 0;

    const contrastWithWhite = calculateContrastRatio(backgroundLuminance, whiteLuminance);
    const contrastWithBlack = calculateContrastRatio(backgroundLuminance, blackLuminance);

    return contrastWithWhite > contrastWithBlack ? '#ffffff' : '#000000';
}

/**
 * Determines optimal text color using luminance threshold method
 * Faster and more visually intuitive than WCAG method
 *
 * @param backgroundColor - Hex color string (with or without #)
 * @returns '#ffffff' for dark backgrounds, '#000000' for light backgrounds
 * @throws Error if hex color is invalid
 */
export function getOptimalTextColor(backgroundColor: string): TextColor {
    const rgb = parseHexColor(backgroundColor);
    if (!rgb) {
        throw new Error(`Invalid hex color: ${backgroundColor}`);
    }

    const luminance = calculateRelativeLuminance(rgb);
    return luminance < LUMINANCE_THRESHOLD ? '#ffffff' : '#000000';
}

/**
 * Provides comprehensive contrast analysis for a background color
 * Includes contrast ratios, accessibility compliance, and optimal text color
 *
 * @param backgroundColor - Hex color string (with or without #)
 * @returns Detailed contrast analysis object
 * @throws Error if hex color is invalid
 */
export function analyzeColorContrast(backgroundColor: string): ContrastAnalysis {
    const rgb = parseHexColor(backgroundColor);
    if (!rgb) {
        throw new Error(`Invalid hex color: ${backgroundColor}`);
    }

    const backgroundLuminance = calculateRelativeLuminance(rgb);
    const whiteLuminance = 1;
    const blackLuminance = 0;

    const contrastWithWhite = calculateContrastRatio(backgroundLuminance, whiteLuminance);
    const contrastWithBlack = calculateContrastRatio(backgroundLuminance, blackLuminance);

    const optimalContrast = Math.max(contrastWithWhite, contrastWithBlack);
    const textColor: TextColor = contrastWithWhite > contrastWithBlack ? '#ffffff' : '#000000';

    return {
        textColor,
        contrastRatio: Math.round(optimalContrast * 100) / 100,
        isAccessible: optimalContrast >= WCAG_THRESHOLDS.AA,
        wcagLevel: getWCAGLevel(optimalContrast)
    };
}

/**
 * Validates if a color combination meets WCAG accessibility standards
 *
 * @param backgroundColor - Background hex color
 * @param textColor - Text hex color
 * @param level - WCAG level to test against ('AA' or 'AAA')
 * @returns true if combination meets the specified WCAG level
 */
export function isAccessibleColorCombination(
    backgroundColor: string,
    textColor: string,
    level: 'AA' | 'AAA' = 'AA'
): boolean {
    const bgRgb = parseHexColor(backgroundColor);
    const textRgb = parseHexColor(textColor);

    if (!bgRgb || !textRgb) {
        throw new Error('Invalid hex color provided');
    }

    const bgLuminance = calculateRelativeLuminance(bgRgb);
    const textLuminance = calculateRelativeLuminance(textRgb);
    const contrastRatio = calculateContrastRatio(bgLuminance, textLuminance);

    return contrastRatio >= WCAG_THRESHOLDS[level];
}
