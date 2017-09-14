// © H4 Engineering, Inc., All Rights Reserved
// Unauthorized copying of this file, via any medium is strictly prohibited
// Proprietary and confidential

export function get(key) {
  try {
    return JSON.parse(localStorage.getItem(key))
  } catch (e) {
    return null
  }
}

export function set(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function remove(key) {
  localStorage.removeItem(key)
}
