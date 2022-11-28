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
            return JSON.parse(fs.readFileSync(user_info_path))['user']
        } catch (error) {
            console.error('Could not read user info')
            process.exit(1)
        }

    } else {
        console.error('There should only be one folder inside Users')
        process.exit(1)
    }
}

const get_group_info = (group_path, user_info) => {
    const group_info_path = path.join(group_path, 'group_info.json')
    if (fs.existsSync(group_info_path)) {
        let data = JSON.parse(fs.readFileSync(group_info_path))['members']
        data = data.filter(x => {
            if (x['name'] !== user_info['name'] && x['email'] !== user_info['email']) {
                return true
            }
        })

        data[0]['path'] = group_path
        return data[0]
    }
}

export const get_groups_info = (groups_path, user_info) => {
    const groups = []
    for (let group of fs.readdirSync(groups_path)) {
        const current_group_path = path.join(groups_path, group)

        if (fs.existsSync(path.join(current_group_path, 'messages.json'))) {
            const group_info = get_group_info(current_group_path, user_info)
            if (group_info !== undefined) {
                groups.push(group_info)
            }
        }
    }

    return groups
}

const replace_bad_characters = (text) => {
    return text.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\u003c/g, '&lt;').replace(/\u003e/g, '&gt;').replace(/\n/g, '<br>')
}

export const create_html_file = (group_info) => {
    const html_path = path.join(group_info['path'], 'messages.html')
    const saved_messages = JSON.parse(fs.readFileSync(path.join(group_info['path'], 'messages.json'), { encoding: 'utf-8' }))['messages']
    let chat_messages = '<div class="row">'

    let last_name = undefined
    let last_day = undefined

    for (let message of saved_messages) {
        const name = message['creator']['name']
        const date = message['created_date']
        const parts = date.split(',')
        const day = parts[1]
        const time = parts[2]

        if (day !== last_day) {
            let chat_message_day = `<div class="col-12"><h3 class="text-center my-4">${day}</h3></div>`
            chat_messages += chat_message_day
            last_day = day
        }

        if (name !== last_name) {
            chat_messages += '<div class="col-12"></div>'
            let chat_message_title = `<div class="col-12 mt-3"><b>${name}</b> <span class="small">${time}</span></div>`
            chat_messages += chat_message_title
            last_name = name
        }

        let text = message['text']
        if (text) {
            text = replace_bad_characters(text)
            let chat_message_message = `<div class="col-12 text-break">${text}</div>`
            chat_messages += chat_message_message
        }
    }

    chat_messages += '</div>'
    fs.writeFileSync(html_path, create_html(group_info['name'], chat_messages))
}

const html = fs.readFileSync('group.html', { encoding: 'utf-8' })

const create_html = (title, body) => {
    return html.replace(/{{ title }}/, title).replace(/{{ body }}/, body)
}
