import "../assets/css/tailwind.css"
import { handleCodeCopying, handleShareButton } from "./copy.js"

if (DEV_MODE) console.log("Dev mode is currently enabled.")

handleCodeCopying()
handleShareButton()
