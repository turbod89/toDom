const toDom = function (structure, options = {}) {

    //
    //  parse options
    //

    if (typeof options === 'object') {

        const cloneNode = el => {
            if (Array.isArray(el)) {
                return el.map(e => cloneNode(e))
            } else if ( el instanceof NodeList) {
                const resp = []

                for (let i = 0; i < el.length ; i++) {
                    resp.push(cloneNode(el[i]))
                }

                return resp
            } else {
                return el.cloneNode(true)
            }
        }

        for (let flag in options) {
            const option = options[flag];

            if (flag.toLowerCase() === 'appendto' || flag.toLowerCase() === 'at') {

                const appendToParent = (parent,resp) => {
                    if (Array.isArray(resp) || resp instanceof HTMLCollection || resp instanceof NodeList) {
                        for (let i = 0; i < parent.length ; i++) {
                            appendToParent(parent,resp[i])
                        }
                    } else if (Array.isArray(parent) || parent instanceof HTMLCollection || parent instanceof NodeList) {
                        for (let i = 0; i < parent.length ; i++) {
                            appendToParent(parent[i],resp)
                        }
                    } else {
                        parent.appendChild(resp)
                    }
                }
                
                let resp = []
                let parents = []

                if (typeof option === 'string') {
                    parents = document.querySelectorAll(option);
                    const newOptions = Object.assign({},options);
                    delete newOptions[flag]
                    const r = toDom(structure,newOptions)
                    for (let i= 0; i < parents.length; i++) {
                        resp.push(i == 0 ? r : cloneNode(r))
                    }
                } else if (typeof option === 'object' && (option instanceof HTMLElement)) {
                    parents = [option]
                    const newOptions = Object.assign({},options);
                    delete newOptions[flag]
                    resp = [toDom(structure,newOptions)]

                } else if (Array.isArray(option)) {
                    parents = option
                    const newOptions = Object.assign({},options);
                    delete newOptions[flag]
                    const r = toDom(structure,newOptions)
                    for (let i= 0; i < parents.length; i++) {
                        resp.push(i == 0 ? r : cloneNode(r))
                    }
                }
                console.log('at')
                appendToParent(parents,resp)

                return resp;
                
            } else if (flag.toLowerCase() === 'times' || flag.toLowerCase() === 't') {

                const newOptions = Object.assign({},options);
                delete newOptions[flag]
                const resp = [];
                const r = toDom(structure,newOptions);
                for (let i= 0; i < option; i++) {
                    resp.push(i == 0 ? r : cloneNode(r))
                }
                console.log('t')
                return resp;
            }
        }
    }

    //
    //  parse structure
    //

    if (Array.isArray(structure) && structure.length > 0 && typeof structure[0] === 'string') {

        // 0 => (string) tag name
        // foreach i >= 1
        //      if (object) and (not array) and (not HTMLElement) and (not Text) attributes
        //      else if (function) event listener
        //      else contained structure

        const domElement = document.createElement(structure[0])

        for (let i = 1 ; i < structure.length ; i++) {

            if (!Array.isArray(structure[i]) && typeof structure[i] === 'object' && !(structure[i] instanceof HTMLElement) && !(structure[i] instanceof Text)) {

                for (let attrName in structure[i]) {
                    domElement.setAttribute(attrName, structure[i][attrName])
                }

            } else if (typeof structure[i] === 'function') {
                
                domElement.addEventListener(structure[i].name, structure[i])

            } else {

                const resp = toDom(structure[i],options)

                if (Array.isArray(resp)) {
                    resp.forEach( el => domElement.appendChild(el))
                } else {
                    domElement.appendChild(resp)
                }
            }
        }

        return domElement



    } else if (Array.isArray(structure)) {

        return structure.map(substructure => toDom(substructure,options))

    } else if (typeof structure === 'object') {

    } else if (typeof structure === 'string' || typeof structure === 'number') {

        return document.createTextNode(''+structure)
    }

    return structure
}


window.toDom = toDom;