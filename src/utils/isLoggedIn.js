import * as storage from './storage'

const isLoggedIn = accessToken => storage.get('accessToken') || accessToken

export default isLoggedIn
