import { JSZip } from "jszip";
import { saveAs } from 'file-saver'

interface IconMetaData {
    sizes: String           // width x height
    src: String             // url
    type: String            // image type
    generated?: boolean     // indicates if the file was generated
}

async function createZip(icons: Array<IconMetaData>) {
    const zip = new JSZip();

    let index = 0;
    let length = icons.length
    for (; index < length; index++) {
        const metadata = icons[index]
        const filename = fileName(metadata);

        zip.file(filename, metadata.src, { base64: true });
    }

    zip
        .generateAsync({type: 'blob'})
        .then(function (content) {
            saveAs(content, "pwa_icons.zip")
        })
}

function fileName(metadata: IconMetaData): String {
    return "icon-" + metadata.sizes + ".png"
}