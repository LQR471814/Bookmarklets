interface KeyCombo {
    key: string
    shiftKey: boolean
    ctrlKey: boolean
    altKey: boolean
    metaKey: boolean
}

interface Position {
    x: number
    y: number
}

// * Shamelessly copied from Stack Overflow like a true JS Developer ;)
function findDeepest(elem: Element) {
    var result = {
        maxDepth: 0,
        deepestElem: elem
    }

    const descend = (elem: Element, depth: number, result: { maxDepth: number, deepestElem: Element }) => {
        switch (elem.nodeType) {
            case 1: // ELEMENT_NODE
                result.maxDepth = depth;
                result.deepestElem = elem;
                if (elem.childNodes.length) {
                    descend(elem.childNodes[0] as Element, depth + 1, result);
                }
                break;
            case 3: // TEXT_NODE
            case 4: // CDATA_SECTION_NODE
            case 5: // ENTITY_REFERENCE_NODE
            case 8: // COMMENT_NODE
                // handle these cases as needed
                break;
        }
    }

    descend(elem, 0, result);
    return result
}

function main() {
    let activationContext = {
        keycombo: {
            key: "a",
            shiftKey: true,
            ctrlKey: false,
            altKey: true,
            metaKey: false
        }
    }

    const activationHandler = (e: KeyboardEvent) => {
        if (checkCombo(e, activationContext.keycombo)) {
            console.log("Active triggered!")
            const onSelectPosition = function selectMacroPosition(e: MouseEvent) {
                makeMacro({
                    x: e.clientX,
                    y: e.clientY
                }, {
                    key: "q",
                    shiftKey: true,
                    ctrlKey: false,
                    altKey: true,
                    metaKey: false
                })
                console.log("Set macro!", e.clientX, e.clientY)
                document.removeEventListener("click", selectMacroPosition)
                return false
            }
            document.addEventListener("click", onSelectPosition)
        }
    }

    document.addEventListener("keydown", activationHandler)
}

function makeMacro(pos: Position, keycombo: KeyCombo) {
    let macroMarker = document.createElement("div")

    let context = {
        keycombo: keycombo,
        coords: pos
    }

    const onMacroTriggered = (e: KeyboardEvent) => {
        if (checkCombo(e, context.keycombo) && context.coords.x && context.coords.y) {
            console.log("Macro triggered!")
            let evtObj = new MouseEvent('click', {
                'view': window,
                'bubbles': true,
                'cancelable': true,
                'screenX': context.coords.x,
                'screenY': context.coords.y
            })

            let element = document.elementFromPoint(context.coords.x, context.coords.y)
            if (!element) return
            element = findDeepest(element).deepestElem
            console.log(element)

            element.dispatchEvent(evtObj)
        }
    }

    document.addEventListener("keydown", onMacroTriggered)
}

function checkCombo(e: KeyboardEvent, keycombo: KeyCombo) {
    let keyMatch
    if (e.key && keycombo.key) {
        keyMatch = (e.key.toLowerCase() === keycombo.key.toLowerCase())
    } else {
        return false
    }

    if (e.shiftKey === keycombo.shiftKey &&
        e.ctrlKey === keycombo.ctrlKey &&
        e.altKey === keycombo.altKey &&
        e.metaKey === keycombo.metaKey &&
        keyMatch
    ) {
        return true
    }
    return false
}
main()