import { check_paths, get_user_info, get_groups_info } from './utils.js'

const main = () => {
    const google_chat_path = process.argv.slice(2)[0]
    const [groups_path, users_path] = check_paths(google_chat_path)

    const user_info = get_user_info(users_path)
    const groups = get_groups_info(groups_path, user_info)
}

main()