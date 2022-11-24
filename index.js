import fs from 'fs'
import path from 'path'

const main = () => {
    const ruta = process.argv.slice(2)[0]

    if (!fs.existsSync(ruta)) {
        console.log('No existe la ruta especificada.')
        process.exit(1)
    }

    if (!fs.existsSync(path.join(ruta, 'Groups'))) {
        console.log('Falta la carpeta de grupos.')
        process.exit(1)
    }

    if (!fs.existsSync(path.join(ruta, 'Users'))) {
        console.log('Falta la carpeta de usuarios.')
        process.exit(1)
    }
}

main()