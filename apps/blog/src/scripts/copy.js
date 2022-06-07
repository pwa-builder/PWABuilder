// Adapted from https://codepen.io/wilbo/pen/xRVLOj by Wilbert Schepenaar.
// @ts-check
import ClipboardJS from "clipboard"

const handleCodeCopying = () => {
  const preTags = document.querySelectorAll("pre")
  const isPrismClass = (preTag) =>
    preTag.className.substring(0, 8) === "language"
  const copy = `<div class="copy" id="code"><ion-icon name="copy-outline"></ion-icon></div>`
  if (preTags !== null) {
    for (let i = 0; i < preTags.length; i++) {
      if (!isPrismClass(preTags[i])) continue
      preTags[
        i
      ].innerHTML = `${copy} <code class="${preTags[i].className}">${preTags[i].innerHTML}</code>`
    }
  }

  if (navigator.clipboard) {
    preTags.forEach((tag) => {
      tag.addEventListener("click", () => {
        navigator.clipboard.writeText(tag.innerText).then(() => {
          tag.children.namedItem("code").textContent = "copied"
          setTimeout(() => {
            tag.children.namedItem(
              "code"
            ).innerHTML = `<ion-icon name="copy-outline"></ion-icon>`
          }, 2000)
        })
      })
    })
  } else {
    const clipboard = new ClipboardJS(".copy", {
      target: (trigger) => trigger.nextElementSibling,
    })
    clipboard.on("success", (event) => {
      console.log(event)
      event.trigger.textContent = "copied!"
      setTimeout(() => {
        event.clearSelection()
        event.trigger.innerHTML = `<ion-icon name="copy-outline"></ion-icon>`
      }, 2000)
    })
  }
}

const handleShareButton = () => {
  if (navigator.clipboard) {
    const shareButtons = document.querySelectorAll(".share")
    shareButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        navigator.share({
          url: location.href
        });
        // navigator.clipboard.writeText(location.href).then(() => {
        //   btn.textContent = "copied"
        //   setTimeout(() => {
        //     btn.textContent = "share"
        //   }, 2000)
        // })
      })
    })
  } else {
    const clipboard = new ClipboardJS(".share", {
      target: (trigger) => trigger,
      text: () => location.href,
    })
    clipboard.on("success", (event) => {
      event.trigger.textContent = "copied!"
      setTimeout(() => {
        event.clearSelection()
        event.trigger.textContent = "share"
      }, 2000)
    })
  }
}

export { handleCodeCopying, handleShareButton }
