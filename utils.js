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
    text = text.replace(/&/g, '&amp;')
    text = text.replace(/</g, '&lt;')
    text = text.replace(/>/g, '&gt;')
    text = text.replace(/"/g, '&quot;')
    text = text.replace(/'/g, '&#039;')
    text = text.replace(/\n/g, '<br />')
    return text
}

export const create_html_file = (group_info) => {
    let html_path = path.join(group_info['path'], 'messages.html')
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

        const attached_files = message['attached_files']
        if (attached_files) {
            const file = attached_files[0]['export_name']
            let chat_message_file = process_attached_file(file, group_info)
            chat_messages += chat_message_file
        }
    }

    chat_messages += '</div>'

    let number = 0
    while (fs.existsSync(html_path)) {
        // Get the name without the extension and the (number)
        const html_name = html_path.split('.').slice(0, -1).join('.')
        // Check if the name has a number at the end
        const match = html_name.match(/\((\d+)\)$/)
        // Update that number
        if (match) {
            number = parseInt(match[1])
            html_path = html_name.replace(/\((\d+)\)$/, `(${++number})`) + '.html'
        } else {
            html_path = `${html_name} (${++number}).html`
        }
    }

    fs.writeFileSync(html_path, create_html(group_info['name'], chat_messages))

    return {
        'name': group_info['name'],
        'path': html_path
    }
}

let current_user = undefined
const process_attached_file = (file, group_info) => {
    const extension = file.split('.').pop()
    let name = file.split('.').slice(0, -1).join('.')

    if (current_user !== group_info['email']) {
        current_user = group_info['email']
        images = {}
    }

    name = update_image_name(name)

    const file_path = path.join(group_info['path'], name + '.' + extension)

    if (is_image(file)) {
        return `<div class="col-12"><img style="max-width: 40%; height:auto;" class="img-thumbnail" src="${file_path}"></div>`
    }

    if (is_video(file)) {
        return `<div class="col-12"><video style="max-width: 40%; height:auto;" class="img-thumbnail" src="${file_path}" controls></video></div>`
    }

    if (is_audio(file)) {
        return `<div class="col-12"><audio controls><source src="${file_path}">Your browser does not support the audio element.</audio></div>`
    }

    return `<div class="col-12"><a href="${file_path}">${file}</a></div>`
}

let images = {}
const update_image_name = (image) => {
    if (images[image] === undefined) {
        images[image] = 1
    } else {
        images[image] += 1
    }

    if (images[image] > 1) {
        return `${image}(${images[image] - 1})`
    } else {
        return image
    }
}

const is_image = (file) => {
    const images = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg', 'webp']
    if (images.includes(file.split('.').pop())) {
        return true
    }
    return false
}

const is_video = (file) => {
    const videos = ['mp4', 'webm', 'ogg']
    if (videos.includes(file.split('.').pop())) {
        return true
    }
    return false
}

const is_audio = (file) => {
    const audios = ['mp3', 'wav', 'ogg', 'flac']
    if (audios.includes(file.split('.').pop())) {
        return true
    }
    return false
}

const html = fs.readFileSync('group.html', { encoding: 'utf-8' })

const create_html = (title, body) => {
    return html.replace(/{{ title }}/, title).replace(/{{ body }}/, body)
}
