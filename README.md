# toDom
## What is it?
Do you know when need to append a whole DOM structure from javascript?
This script apends to `window` a function called `toDom` which pretends to make this task easy.

## How it works?
We'll show you with an example.
Code like this:
```javascript
const rowEl = document.createElement('div')
rowEl.classList.add('row')

const colEl = document.createElement('div')
colEl.classList.add('col12')

const ul = document.createElement('ul')

for (let i = 0; i < 10; i++) {
    const li = document.createElement('li')
    const p = document.createElement('p')
    p.appendChild(document.createTextNode('This is a text '))
    const a = document.createElement('a')
    a.setAttribute('href','#')
    a.appendChild(document.createTextNode('and this is a link'))
    p.appendChild(a)
    li.appendChild(p)
    ul.appendChild(li)
}

colEl.appendChild(ul)
rowEl.appendChild(colEl)
document.getQuerySelector('.container').appendChild(rowEl)
```

can be replaced by
```javascript
toDom(['div',{'class':'row'},
    ['div',{'class':'col12'},
        ['ul',
            toDom(['li',
                ['p',[
                    toDom('This is a text '),
                    ['a',{'href':'#'},'and this is a link']
                ]]
            ], {t:10})
        ]
    ]
],{at: '.container'})
```

## Anatomy
Funtion `toDom` expects one or two parameters and looks like
```javascript
toDom(structure, options = {})
```
and returns a DOM element or an array of DOM elements.

### Structure
Structure could be:
- A string or a number. In such case `toDom` will return an Text element.
- An array where *first element* is *not a string*. In such case, `toDom` will return an array with `toDom` function applied to all its elements.
- An array where first element is a *string*. In such case:
    - First element will be the tag name of the DOM element.
    - For the rest of them:
        - If element is an `Array`, `HTMLElement` or a `Text`, then `toDom` will be applied and result will append.
        - If `typeof` element is `object` and none of above, then its enumerable properties will be append as tag attributes.
        - If `typeof` element is `function`, it will be appned as `EventListener`, where the event name will be the function name.
        - In any other case, `toDom` will be applied and result will append.
- Any other case: structure will be returned without any modification.

### Example
```javascript
    toDom(['p',[toDom('Click button to destroy this paragraph'),['button','Destroy',function click() { this.parentNode.parentNode.removeChild(this.parentNode)}]]])
```

### Options
- `t` or `times`: function will be called the specified amount of times.
- `at` or `appendTo`: result of the function will be append to result.

### Example
```javascript
    toDom(['li',['p','List item']],{t:10,at: toDom(['ul'],{at:'body'})})
```