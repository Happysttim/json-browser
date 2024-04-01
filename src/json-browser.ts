type JSONValueLikes = JSONObject | unknown[] | number | string | boolean;

type JSONObject<T = unknown> = {
    [P in keyof T]?: T[P]
}

class JSONBrowser {
    
    private pos = 0;
    private length = 0;
    private jsonString!: string;
    private depth = 0;
    private schemaKeys: string[] = [];

    get json(): JSONObject {
        return this.jsonBody;
    }

    safeString(key: string): string {
        if(this.checkObject()) {
            const json = this.jsonBody as Record<string, string>;
            return json[key] ?? '';
        }

        return '';
    }

    // MAX_SAFE_NUM 또는 MIN_SAFE_NUM 범위를 벗어나면 string으로 반환
    safeNumberString(key: string): number | string {
        if(this.checkObject()) {
            const json = this.jsonBody as Record<string, string | number>;
            if(!isNaN(json[key] as number)) {
                const numbering = this.string2Number(json[key] as string);
                return numbering > Number.MAX_SAFE_INTEGER || numbering < Number.MIN_SAFE_INTEGER ? json[key] as string : numbering;
            }
        }

        return 0;
    }

    // MAX_SAFE_NUM 또는 MIN_SAFE_NUM 범위를 벗어나면 0을 반환
    safeNumber(key: string): number {
        if(this.checkObject()) {
            const json = this.jsonBody as Record<string, number>;
            if(!isNaN(json[key])) {
                return json[key] > Number.MAX_SAFE_INTEGER || json[key] < Number.MIN_SAFE_INTEGER ? 0 : json[key];
            }
        }

        return 0;
    }

    safeBoolean(key: string): boolean {
        if(this.checkObject()) {
            const json = this.jsonBody as Record<string, boolean>;
            return json[key] ?? false;
        } 
        return false;
    }

    safeArray<T = any>(key: string): T[] {
        if(this.checkObject()) {
            const json = this.jsonBody as Record<string, T[]>;
            return json[key] ?? [];
        }
        return [];
    }

    values(key: string): JSONBrowser[] {
        if(this.checkObject()) {
            const json = this.jsonBody as Record<string, JSONValueLikes[]>;
            return json[key].map<JSONBrowser>(valueLike => {
                return new JSONBrowser(valueLike);
            });
        }

        return [];
    }

    index(i: number): JSONBrowser {
        if(this.checkObject()) {
            const json = this.jsonBody as JSONValueLikes[];
            return new JSONBrowser(json[i] ?? []);
        }

        return new JSONBrowser([]);
    }

    nextScope(key: string): JSONBrowser {
        if(this.checkObject()) {
            const json = this.jsonBody as Record<string, JSONObject>;
            return new JSONBrowser(json[key] ?? {});
        }

        return new JSONBrowser({});
    }

    get<T = any>(key: string): T {
        if(this.checkObject()) {
            const json = this.jsonBody as Record<string, T>;
            return json[key] ?? {} as T;
        }

        return {} as T;
    }

    ynToBoolean(key: string): boolean {
        if(this.checkObject()) {
            const json = this.jsonBody as Record<string ,string>;
            const yn = (json[key] ?? '').trim().toLocaleLowerCase();
            if(yn == 'y' || yn == 'yes') {
                return true;
            } else if(yn == 'n' || yn == 'no') {
                return false;
            }
        }

        return false;
    }

    static parse(json: string): JSONBrowser {
        const browser = new JSONBrowser({});
        browser.length = json.length;
        browser.jsonString = json;
        browser.jsonBody = browser.readValue(browser.jsonBody) as JSONObject;

        return new JSONBrowser(browser.jsonBody);
    }

    private checkObject(): boolean {
        return typeof this.jsonBody === 'object';
    }

    private string2Number(num: string): number {
        if(/[\.]/.test(num)) {
            return parseFloat(num);
        } else {
            return parseInt(num);
        }
    }

    // Object 읽어옴
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
                const json = jsonStack as Record<string ,JSONObject>;
                json[key] = {};
                const value = this.readValue(json[key]);
                this.schemaKeys.push(`${this.depth}$${key}`);
                (resultStack as Record<string, JSONValueLikes>)[key] = value;
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
                return this.readArray();
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
                throw new Error('Invalid JSON grammar.');
            }
        }

        return jsonStack;
    }

    private readArray(): JSONValueLikes[] {
        this.passingWhitespace();
        const resultArray: JSONValueLikes[] = [];
        while(this.pos < this.length) {
            const readChar = this.jsonString.charAt(this.pos++);
            
            if(/[\-0-9]/.test(readChar)) {
                resultArray.push(this.readNumberOrString());
            } else if(/[tTfF]/.test(readChar)) {
                resultArray.push(this.readTrueOfFalse());
            } else if(readChar == '{') {
                resultArray.push(this.readObject({}));
            } else if(readChar == '[') {
                resultArray.push(this.readArray());
            } else if(readChar == '"') {
                resultArray.push(this.readString());
            }

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

    private constructor(private jsonBody: JSONObject) {

    }

}

export default JSONBrowser;