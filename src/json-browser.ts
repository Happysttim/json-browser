import Long from 'long';

type PrimitiveValue = string | number;
type JsonMapper<T = any> = {
    [P in keyof T]?: T[P]
}

const Tokenizor = {
    OPEN_ARRAY: '[',
    CLOSE_ARRAY: ']',
    OPEN_OBJECT: '{',
    CLOSE_OBJECT: '}',
    SEPARATOR: ',',
    SINGLE_QUOTE: '\'',
    DOUBLE_QUOTE: '\"'
} as const;

class JSONBrowser {
    
    private pos = 0;
    private length = 0;

    static parse(json: string): JSONBrowser {
        const browser = new JSONBrowser();
        json = json.trimStart();
        browser.length = json.length;

        return browser;
    }

    private readNumberOrLong(): number | Long {
        return 0;
    }

    private readString(): string {
        return '';
    }

    private passingWhitespace() {

    }

    private constructor() {

    }

}

export default JSONBrowser;