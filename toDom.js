const toDom = function (structure, options = {}) {

    //
    //  parse options
    //

    if (typeof options === 'object') {

        const cloneNode = el => {
            if (Array.isArray(el)) {
                return el.map(e => cloneNode(e))
            } else if ( el instanceof window.NodeList) {
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
                    if (Array.isArray(resp) || resp instanceof window.HTMLCollection || resp instanceof window.NodeList) {
                        for (let i = 0; i < resp.length ; i++) {
                            appendToParent(parent,resp[i])
                        }
                    } else if (Array.isArray(parent) || parent instanceof window.HTMLCollection || parent instanceof window.NodeList) {
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
                } else if (typeof option === 'object' && (option instanceof window.HTMLElement)) {
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
                appendToParent(parents,resp)

                return resp;
                
            } else if (flag.toLowerCase() === 'times' || flag.toLowerCase() === 't') {
                /*
                const newOptions = Object.assign({},options);
                delete newOptions[flag]
                const resp = [];
                const r = toDom(structure,newOptions);
                for (let i= 0; i < option; i++) {
                    resp.push(i == 0 ? r : cloneNode(r))
                }
                return resp;
                */
            }
        }
    }

    //
    //  parse structure
    //

    if (Array.isArray(structure) && structure.length > 0 && typeof structure[0] === 'string') {

        // 0 => (string) tag name
        // foreach i >= 1
        //      if (object) and (not array) and (not window.HTMLElement) and (not Text) attributes
        //      else if (function) event listener
        //      else contained structure

        const domElement = document.createElement(structure[0])

        for (let i = 1 ; i < structure.length ; i++) {

            if (!Array.isArray(structure[i]) && typeof structure[i] === 'object' && !(structure[i] instanceof window.HTMLElement) && !(structure[i] instanceof window.Text)) {

                for (let attrName in structure[i]) {
                    domElement.setAttribute(attrName, structure[i][attrName])
                }

            } else if (typeof structure[i] === 'function' && structure[i].name.length > 1 && structure[i].name[0] === '$') {
                
                domElement.addEventListener(structure[i].name.substr(1), structure[i])

            } else if (typeof structure[i] === 'function' ) {
                
                structure[i](domElement)

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

    } else if (Array.isArray(structure) && structure.length > 0 && typeof structure[0] === 'function') {

        if (structure.length === 1) {
            return toDom(structure[0](),options)
        } else if (structure.length >= 2 && typeof structure[1] === 'number') {
            
            let to = structure[1];
            let from = 0;
            let step = 1;

            if ( structure.length >= 3 && typeof structure[2] === 'number') {
                to = structure[2]
                from = structure[1]
                if ( structure.length >= 4 && typeof structure[3] === 'number') {
                    step = structure[3]
                }
            }

            const resp = [];

            for (let i = from; i < to; i+= step) {
                const subResp = toDom(structure[0](i),options)

                if (Array.isArray(subResp)) {
                    subResp.forEach( subsubResp => resp.push(subsubResp))
                } else {
                    resp.push(subResp)
                }
            }

            return resp

        } else if (structure.length === 2 && Array.isArray(structure[1]) ) {

            const resp = []

            structure[1].forEach( (e,i,a) => {
                const subResp = toDom(structure[0](e,i,a),options)
                
                if (Array.isArray(subResp)) {
                    subResp.forEach( subsubResp => resp.push(subsubResp))
                } else {
                    resp.push(subResp)
                }
            })

            return resp

        } else if (structure.length === 2 && typeof structure[1] === 'object') {

            const resp = [];

            for (let key in structure[1]) {
                const subResp = toDom(structure[0](structure[1][key],key,structure[1]),options)


                if (Array.isArray(subResp)) {
                    subResp.forEach( subsubResp => resp.push(subsubResp))
                } else {
                    resp.push(subResp)
                }
            }
        
            return resp

        } else {
            return toDom(structure[0](),options)
        }

    } else if (Array.isArray(structure)) {

        const resp = []

        structure.forEach(substructure => {

            const subResp = toDom(substructure,options)

            if (Array.isArray(subResp)) {
                subResp.forEach( subsubResp => resp.push(subsubResp))
            } else {
                resp.push(subResp)
            }
        })


        return resp

    } else if (typeof structure === 'object') {

    } else if (typeof structure === 'string' || typeof structure === 'number') {

        return document.createTextNode(''+structure)

    }

    return structure
}



if (typeof define === 'function' && define.amd) {
    define('toDom', function () {
        return toDom;
    });
} else if (typeof module !== 'undefined' && module.exports) {
    module.exports = toDom;
} else {
    window.toDom = toDom;
}
