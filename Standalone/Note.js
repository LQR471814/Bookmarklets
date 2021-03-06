function makeDrag(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0
    elmnt.onmousedown = dragMouseDown
    elmnt.oncontextmenu = (e) => { return false }

    function dragMouseDown(e) {
        if (e.button === 2 || e.altKey === true) {
            e = e || window.event
            e.preventDefault()
            pos3 = e.clientX
            pos4 = e.clientY
            document.onmouseup = closeDragElement
            document.onmousemove = elementDrag
        }
    }

    function elementDrag(e) {
        e = e || window.event
        e.preventDefault()
        pos1 = pos3 - e.clientX
        pos2 = pos4 - e.clientY
        pos3 = e.clientX
        pos4 = e.clientY
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px"
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px"
    }

    function closeDragElement() {
        document.onmouseup = null
        document.onmousemove = null
    }
}

function spawnNote() {
    var noteDiv = document.createElement("div")
    noteDiv.style.zIndex = "999"

    var note = document.createElement("textarea")
    var closeButton = document.createElement("button")
    var downloadButton = document.createElement("a")
    var openButton = document.createElement("input")

    var localStorage = window.localStorage

    note.id = "NotepadTextArea"
    note.rows = 20
    note.cols = 60
    note.placeholder = "Protip: You can move the note with right click or alt + left click"

    if (localStorage.getItem("NotepadTextValue") !== undefined) {
        note.value = localStorage.getItem("NotepadTextValue")
    }

    noteDiv.style.position = "fixed"
    noteDiv.style.top = "10%"
    noteDiv.style.left = "10%"

    closeButton.style.position = "absolute"
    closeButton.style.top = "100%"
    closeButton.style.left = "100%"
    closeButton.innerText = "x"
    closeButton.onclick = (e) => {
        noteDiv.remove()
        var d = new Date()
        localStorage.setItem("NotepadTextValue", note.value)
    }

    openButton.type = "file"
    openButton.style.position = "absolute"
    openButton.style.top = "0%"
    openButton.style.left = "101%"
    openButton.onchange = (e) => {e.target.files[0].text().then((t) => note.value = t)}

    downloadButton.style.position = "absolute"
    downloadButton.style.top = "100%"
    downloadButton.style.left = "0%"
    downloadButton.style.appearance = "button"
    downloadButton.style.textDecoration = "none"
    downloadButton.style.color = "initial"
    downloadButton.onclick = (e) => { downloadButton.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(note.value) }
    downloadButton.download = 'text.txt'
    downloadButton.innerText = "Download"

    noteDiv.appendChild(note)
    noteDiv.appendChild(closeButton)
    noteDiv.appendChild(downloadButton)
    noteDiv.appendChild(openButton)
    makeDrag(noteDiv)

    document.body.appendChild(noteDiv)
}

spawnNote()