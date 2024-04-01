**<em>※ 이 모듈은 아직 테스트 중입니다!</em>**
# JSON Browser

JSON 문자열을 파싱해주는 모듈입니다.

- #### 다운로드
```shell
npm install json-browser
```
- #### JSONBrowser의 함수들
1. ##### JSONBrowser.parse(jsonString: string): JSONBrowser
    jsonString 을 JSON 으로 파싱하고 JSONBrowser 객체를 반환합니다.
2. ##### safeString(key: string): string
    JSON 객체 안 key의 대한 값이 undefined면 공백을 반환합니다.
3. ##### safeNumberString(key: string): number | string
    JSON 객체 안 key의 대한 값이 MAX_SAFE_INTEGER, MIN_SAFE_INTEGER을 초과하면 String으로 반환합니다.
4. ##### safeBoolean(key: string): boolean
    JSON 객체 안 key의 대한 값이 undefined면 false를 반환합니다.
5. ##### safeArray<T = any>(key: string): T[]
    JSON 객체 안 key의 대한 값이 undefined면 empty한 array를 반환합니다.
6. ##### index(i: number): JSONBrowser
    현재 JSONBrowser 객체가 JSON 객체 속 배열을 포커싱하고 있으면 
    특정 인덱스로 이동합니다.
7. ##### nextScope(key: string): JSONBrowser
    현재 JSONBrowser 객체가 오프젝트를 포커싱하고 있으면 다음 스코프로 이동합니다.
8. ##### get<T = any>(key: string): T
    JSON 객체 안 key의 대한 값을 타입 T로 형변환하여 반환합니다.
8. ##### ynToBoolean(key: string): boolean
    JSON 객체 안 key의 대한 값이 yes,y,n,no 라면 true 또는 false로 반환합니다.
9. ##### values(key: string): JSONBrowser[]
    JSON 객체 안 key의 대한 배열들의 각 요소를 JSONBrowser에 담아 배열로 반환합니다.
- #### 사용방법(예시)
```typescript
import JSONBrowser from 'json-browser';

interface User {
    id: string
    name: string
    age: number
    gender: string
}

interface UserInfo {
    user: User
    level: number
    isOnline: boolean
}

interface Game {
    userInfo: UserInfo[],
}

const game: Game = {
    userInfo: [
        {
            user: {
                id: 'user1',
                name: 'Kim User',
                age: 10,
                gender: 'female',
            },
            level: 99,
            isOnline: false
        },
        {
            user: {
                id: 'user2',
                name: 'Pak User',
                age: 20,
                gender: 'male',
            },
            level: 20,
            isOnline: true
        },
        {
            user: {
                id: 'user3',
                name: 'Chai User',
                age: 30,
                gender: 'female',
            },
            level: 10,
            isOnline: true
        }
    ]
};

const jsonString = JSON.stringify(game);
const browser = JSONBrowser.parse(jsonString);

const level = browser.nextScope('userInfo').index(0).safeNumberString('level');
console.log(level);
// Output: 99
const isOnline = browser.nextScope('userInfo').index(1).safeBoolean('isOnline');
console.log(isOnline);
// Output: true

const user3 = browser.nextScope('userInfo').index(2).get<User>('user');
console.log(user3.json);
// Output: 
// { 
//  id: "user3",
//  name: "Chai User",
//  age: 30,
//  gender: "female"
// }
```