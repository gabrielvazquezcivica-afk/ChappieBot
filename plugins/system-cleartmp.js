import fs from 'fs'

const TMP_DIR = './tmp'

export function before() {

  setInterval(() => {

    if (!fs.existsSync(TMP_DIR)) return

    const files = fs.readdirSync(TMP_DIR)

    for (const file of files) {
      fs.unlinkSync(`${TMP_DIR}/${file}`)
    }

  }, 600000) // cada 10 minutos

}
