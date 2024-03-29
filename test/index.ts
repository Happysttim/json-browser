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
console.log(jsonString);

const browser = JSONBrowser.parse(jsonString);
console.log(browser.json);
console.log(browser.next('userInfo').index(0).get<User>("user"));