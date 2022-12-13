import { check_paths, get_user_info, get_groups_info, create_html } from './utils.js'

const main = () => {
    // Get the path to the Google Chat folder
    const google_chat_path = process.argv.slice(2)[0]

    // Check if the path is valid and store the paths to the groups and users folders
    const [groups_path, users_path] = check_paths(google_chat_path)

    // Get user and group info
    const user_info = get_user_info(users_path)
    const groups_info = get_groups_info(groups_path, user_info)

    // Create HTML files for each group
    const html_files = []
    for (let group_info of groups_info) {
        html_files.push(create_html(group_info))
    }

    // Print the paths to the HTML files
    console.log(html_files)
}

main()