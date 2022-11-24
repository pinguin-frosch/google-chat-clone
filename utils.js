import fs from 'fs'
import path from 'path'

const check_users_path = (users_path) => {
    if (!fs.existsSync(users_path)) {
        console.log('The Users folder is missing')
        process.exit(1)
    }
}

const check_groups_path = (groups_path) => {
    if (!fs.existsSync(groups_path)) {
        console.log('The Groups folder is missing')
        process.exit(1)
    }
}

export const check_paths = (google_chat_path) => {
    if (!fs.existsSync(google_chat_path)) {
        console.log('That folder does not exist')
        process.exit(1)
    }

    const groups_path = path.join(google_chat_path, 'Groups')
    check_groups_path(groups_path)

    const users_path = path.join(google_chat_path, 'Users')
    check_users_path(users_path)

    return [groups_path, users_path]
}

export const get_user_info = (users_path) => {
    check_users_path(users_path)

    let intermediate_path = fs.readdirSync(users_path)
    if (intermediate_path.length === 1) {
        const user_info_path = path.join(users_path, intermediate_path[0], 'user_info.json')
        if (!fs.existsSync(user_info_path)) {
            console.log(`The user info is missing in ${user_info_path}`)
            process.exit(1)
        }

        try {
            return JSON.parse(fs.readFileSync(user_info_path))
        } catch (error) {
            console.error('Could not read user info')
            process.exit(1)
        }

    } else {
        console.error('There should only be one folder inside Users')
        process.exit(1)
    }
}