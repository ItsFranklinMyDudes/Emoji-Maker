export interface MakerOptions {
    /** Canvas width in pixels (default: 128) */
    width?: number;
    /** Canvas height in pixels (default: 128) */
    height?: number;
    /** Output image format (default: 'png') */
    format?: 'png' | 'jpeg';
}

export interface EmojiParts {
    /** Base face ID (0-61) */
    bases: number;
    /** Eyes ID (0-63) */
    eyes: number;
    /** Eyebrows ID (0-22) */
    brows: number;
    /** Mouth ID (0-70) */
    mouths: number;
    /** Extras/accessories ID (0-45) */
    extras: number;
}

export interface EmojiConfig {
    /** Canvas width in pixels */
    width: number;
    /** Canvas height in pixels */
    height: number;
    /** Output image format */
    format: 'png' | 'jpeg';
}

export interface EmojiResult {
    /** Generated emoji image data */
    image: {
        /** Image buffer */
        buffer: Buffer;
        /** Data URL string */
        url: string;
    };
    /** Parts used to create the emoji */
    parts: EmojiParts;
    /** Configuration used */
    config: EmojiConfig;
}

export interface RandomizeOptions {
    /** Whether to include random extras (default: true) */
    includeExtras?: boolean;
}

export interface ComponentIDs {
    /** Array of available base IDs */
    bases: string[];
    /** Array of available eyes IDs */
    eyes: string[];
    /** Array of available brows IDs */
    brows: string[];
    /** Array of available mouths IDs */
    mouths: string[];
    /** Array of available extras IDs */
    extras: string[];
}

export interface ComponentCounts {
    /** Number of available bases */
    bases: number;
    /** Number of available eyes */
    eyes: number;
    /** Number of available brows */
    brows: number;
    /** Number of available mouths */
    mouths: number;
    /** Number of available extras */
    extras: number;
}

export interface DisplayOptions {
    /** Size of each emoji preview in pixels (default: 100) */
    itemSize?: number;
    /** Number of items per row (default: 10) */
    itemsPerRow?: number;
    /** Background color (default: '#2C2F33') */
    backgroundColor?: string;
    /** Text color (default: '#ffffff') */
    textColor?: string;
}

export interface CategoryImage {
    /** Image buffer */
    buffer: Buffer;
    /** Data URL string */
    url: string;
    /** Number of components in this category */
    count: number;
}

export interface CategoryImages {
    /** Base faces preview image */
    bases: CategoryImage;
    /** Eyes preview image */
    eyes: CategoryImage;
    /** Eyebrows preview image */
    brows: CategoryImage;
    /** Mouths preview image */
    mouths: CategoryImage;
    /** Extras preview image */
    extras: CategoryImage;
}

export declare class ValidationError extends Error {
    constructor(message: string);
}

/**
 * A class for creating customizable emojis by combining different facial features and accessories.
 * Features include bases, eyes, brows, mouths, and extras.
 */
export declare class Maker {
    /** Current emoji parts configuration */
    parts: EmojiParts;
    /** Canvas and output configuration */
    config: EmojiConfig;

    /**
     * Creates a new Maker instance.
     * @param options Configuration options for the emoji maker
     */
    constructor(options?: MakerOptions);

    /**
     * Sets the base emoji face.
     * @param number The base ID (1-61)
     * @returns Returns this instance for method chaining
     */
    addBase(number: number): Maker;

    /**
     * Sets the eyes for the emoji.
     * @param number The eyes ID (1-63)
     * @returns Returns this instance for method chaining
     */
    addEyes(number: number): Maker;

    /**
     * Sets the eyebrows for the emoji.
     * @param number The brows ID (1-22)
     * @returns Returns this instance for method chaining
     */
    addBrows(number: number): Maker;

    /**
     * Sets the mouth for the emoji.
     * @param number The mouth ID (1-70)
     * @returns Returns this instance for method chaining
     */
    addMouths(number: number): Maker;

    /**
     * Sets extra accessories for the emoji.
     * @param number The extras ID (1-45)
     * @returns Returns this instance for method chaining
     */
    addExtras(number: number): Maker;

    /**
     * Generates a random emoji with random parts.
     * @param options Options for random generation
     * @returns Returns this instance for method chaining
     */
    randomize(options?: RandomizeOptions): Maker;

    /**
     * Builds and returns the final emoji image.
     * @returns Promise resolving to an object containing the image buffer, data URL, and parts used
     * @throws {ValidationError} If no base is provided
     */
    build(): Promise<EmojiResult>;
}

/**
 * A class for listing and displaying available emoji components.
 * Provides functionality to view all available parts for emoji creation.
 */
export declare class List {
    /** Base path to the emojis directory */
    basePath: string;

    /**
     * Creates a new List instance.
     * @param basePath The base path to the emojis directory
     */
    constructor(basePath?: string);

    /**
     * Gets the IDs of all available components for each category.
     * @returns Promise resolving to an object with arrays of available IDs for each category
     * @throws {Error} If the emojis directory structure is invalid
     */
    componentIDs(): Promise<ComponentIDs>;

    /**
     * Generates preview images showing all available components for each category.
     * Each component is displayed with its ID number for easy reference.
     * @param options Configuration options for the display
     * @returns Promise resolving to an object with image data for each category
     */
    displayImage(options?: DisplayOptions): Promise<CategoryImages>;

    /**
     * Gets the count of available components for each category.
     * @returns Promise resolving to an object with the count of items in each category
     */
    getCounts(): Promise<ComponentCounts>;

    /**
     * Validates if a specific component ID exists in a category.
     * @param category The category to check
     * @param id The component ID to validate
     * @returns Promise resolving to true if the component exists, false otherwise
     */
    validateComponent(category: 'bases' | 'eyes' | 'brows' | 'mouths' | 'extras', id: number): Promise<boolean>;
}