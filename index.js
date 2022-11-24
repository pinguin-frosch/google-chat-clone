import fs from 'fs'
import path from 'path'

const main = () => {
    const ruta = process.argv.slice(2)[0]
    if (!fs.existsSync(ruta)) {
        console.log('No existe la ruta especificada.')
        process.exit(1)
    }

    const ruta_chats = path.join(ruta, 'Groups')
    if (!fs.existsSync(ruta_chats)) {
        console.log('Falta la carpeta de grupos.')
        process.exit(1)
    }

    const ruta_usuario = path.join(ruta, 'Users')
    if (!fs.existsSync(ruta_usuario)) {
        console.log('Falta la carpeta de usuarios.')
        process.exit(1)
    }

    let datos_usuario
    let ruta_intermedia = fs.readdirSync(ruta_usuario)
    if (ruta_intermedia.length) {
        const configuracion_usuario = path.join(ruta_usuario, ruta_intermedia[0], 'user_info.json')
        if (!fs.existsSync(configuracion_usuario)) {
            console.log(`No existe la información del usuario en ${configuracion_usuario}`)
        }
        datos_usuario = JSON.parse(fs.readFileSync(configuracion_usuario))
    }

    for (let chat of fs.readdirSync(ruta_chats)) {
        const ruta_chat = path.join(ruta_chats, chat)
        const ruta_mensajes_chat = path.join(ruta_chat, 'messages.json')
        if (fs.existsSync(ruta_mensajes_chat)) {
            const ruta_informacion_chat = path.join(ruta_chat, 'group_info.json')
            const data = JSON.parse(fs.readFileSync(ruta_informacion_chat))
            const nombre_usuario = datos_usuario['user']['name']
            const correo_usuario = datos_usuario['user']['email']
            for (let usuario of data['members']) {
                if (usuario['name'] !== nombre_usuario && usuario['email'] !== correo_usuario) {
                    console.log(usuario['name'])
                }
            }
        }
    }
}

main()