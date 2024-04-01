import JSONBrowser from '../src/json-browser';

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
        },
        {
            user: {
                id: 'user4',
                name: 'Bug User',
                age: 0,
                gender: 'female',
            },
            level: 172839217319278123123,
            isOnline: true
        }
    ]
};

const jsonString = JSON.stringify(game);
console.log(jsonString);

const browser = JSONBrowser.parse(jsonString);
console.log(JSON.parse(jsonString));
console.log(browser.json);
console.log(browser.nextScope('userInfo').index(0).get<User>("user"));
console.log(browser.nextScope('userInfo').index(3).safeNumberString('level'))

const user3 = browser.nextScope('userInfo').index(2).get<User>('user');
console.log(user3);

const arrayJsonString = '{"objects": [{"id": "user1", "password":"1234"},{"id": "user2", "password":"abcd"},{"id": "user3", "password":"5678"},{"id": "user4", "password":"efgh"},{"id": "user5", "password":"9100"}]}'; 
const arrayJsonBrowser = JSONBrowser.parse(arrayJsonString);

arrayJsonBrowser.values('objects').forEach(browser => {
    console.log(`id = ${browser.safeString('id')}`);
    console.log(`password = ${browser.safeString('password')}`);
});