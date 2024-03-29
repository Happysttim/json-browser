type JSONValueLikes = JSONObject | any[] | number | string | boolean;

type JSONObject<T = any> = {
    [P in keyof T]?: T[P]
}

class JSONBrowser {
    
    private pos = 0;
    private length = 0;
    private jsonString!: string;
    private depth = 0;
    private jsonBody: JSONObject = {};
    private schemaKeys: string[] = [];

    get json(): JSONObject {
        return this.jsonBody;
    }

    static parse(json: string): JSONBrowser {
        const browser = new JSONBrowser();
        browser.jsonString = json.trimStart();
        browser.length = json.length;

        browser.jsonBody = browser.readValue(browser.jsonBody) as JSONObject;

        return browser;
    }

    private readObject(jsonStack: JSONObject): JSONObject {
        ++this.depth;
        const resultStack = jsonStack;
        this.passingWhitespace();

        while(this.pos < this.length) {
            const readChar = this.jsonString.charAt(this.pos++);
            switch(readChar) {
                case '}':
                    --this.depth;
                    return resultStack;
                case '\"':
                    const key = this.readString();
                    if(this.jsonString.charAt(this.pos++) != ':') {
                        throw new Error('Invalid JSON grammar.');
                    }
                    this.passingWhitespace();
                    jsonStack[key] = {};
                    console.log('pos: ' + this.pos);
                    const value = this.readValue(jsonStack[key]);
                    this.schemaKeys.push(`${this.depth}$${key}`);
                    resultStack[key] = value;
                    console.log('pos: ' + this.pos);
                    break;
            }
        }
        throw new Error('Invalid JSON grammar.');
    }

    // json string을 하나씩 읽어서 
    private readValue(jsonStack: JSONObject): JSONValueLikes {
        this.passingWhitespace();
        while(this.pos < this.length) {
            switch(this.jsonString.charAt(this.pos++)) {
                case '\{':
                    return this.readObject(jsonStack);
                case '\[':
                    return this.readArray(jsonStack);
                case '\"':
                    return this.readString();
                case 't':
                case 'T':
                case 'f':
                case 'F':
                    return this.readTrueOfFalse();
                case '-':
                case '0':
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    return this.readNumberOrString();
                default:
                    throw Error('Invalid JSON grammar.');
            }
        }

        return jsonStack;
    }

    private readArray(jsonStack: JSONObject): any[] {
        this.passingWhitespace();
        const resultArray: any[] = [];
        while(this.pos < this.length) {
            const readChar = this.jsonString.charAt(this.pos++);

            console.log(readChar + ' input in ' + resultArray + ' resultArray size is ' + resultArray.length);
            
            if(/[\-0-9]/.test(readChar)) {
                resultArray.push(this.readNumberOrString());
            } else if(/[tTfF]/.test(readChar)) {
                resultArray.push(this.readTrueOfFalse());
            } else if(readChar == '{') {
                resultArray.push(this.readObject([]));
            } else if(readChar == '[') {
                resultArray.push(this.readArray([]));
            } else if(readChar == '"') {
                resultArray.push(this.readString());
            }

            const nowChar = this.jsonString.charAt(this.pos);
            console.log(`nowChar: ${nowChar}`);

            if(readChar == ']') {
                return resultArray;
            }
        }
        
        throw new Error('Invalid JSON grammar.');
    }

    // Number, Safe Number Max 넘어가면 string 반환
    private readNumberOrString(): number | string {
        let numberString = this.jsonString.charAt(this.pos - 1);
        let isFloat = false;
        while(this.pos < this.length) {
            const readChar = this.jsonString.charAt(this.pos);
            console.log(`readChar: ${readChar}`);
            this.passingWhitespace();
            const regex = /[\d\.]/;
            if(regex.test(readChar)) {
                numberString += readChar;
                if(readChar == '.') {
                    isFloat = true;
                }
                this.pos++;
            } else {
                const numbering = isFloat ? parseFloat(numberString) : parseInt(numberString);

                if(numbering > Number.MAX_SAFE_INTEGER || numbering < Number.MIN_SAFE_INTEGER) {
                    return numberString;
                }

                return numbering;
            }
        }
        throw new Error('Invalid JSON grammar.');
    }

    // 문자열 읽어옴
    private readString(): string {
        this.passingWhitespace();
        let result = '';

        while(this.pos < this.length) {
            const readChar = this.jsonString.charAt(this.pos++);
            const nextChar = this.jsonString.charAt(this.pos);
            if(readChar == '\"') {
                return result;
            } else if(readChar == '\\' && /[tTnNbB\'\"\\]/.test(nextChar)) {
                result += `\\${nextChar}`;
                this.pos++;
            } else {
                result += readChar;
            }
        }
        
        throw new Error('Invalid JSON string value.');
    }

    // boolean 읽어옴
    private readTrueOfFalse(): boolean {
        this.passingWhitespace();
        if((this.jsonString[this.pos - 1] + 
            this.jsonString[this.pos] + 
            this.jsonString[this.pos + 1] + 
            this.jsonString[this.pos + 2])
            .toLowerCase() == 'true') {
            this.pos += 2;
            return true;
        }
        if((this.jsonString[this.pos - 1] + 
            this.jsonString[this.pos] + 
            this.jsonString[this.pos + 1] + 
            this.jsonString[this.pos + 2] + 
            this.jsonString[this.pos + 3])
            .toLowerCase() == 'false') {
            this.pos += 3;
            return false;
        }

        throw new Error('Invalid JSON string value.');
    }

    // 키 또는 값 앞에 공백이 있을 경우 pos 올라감
    private passingWhitespace() {
        while(this.pos < this.length) {
            switch(this.jsonString.charAt(this.pos)) {
                case ' ':
                case '\t':
                case '\b':
                case '\n':
                    ++this.pos;
                    break;
                default: return;
            }
        }
    }

    private constructor() {

    }

}

export default JSONBrowser;