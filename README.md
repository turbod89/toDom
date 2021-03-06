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
            [i => ['li',
                ['p',[
                    toDom('This is a text '),
                    ['a',{'href':'#'},'and this is a link']
                ]]
            ], 10]
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
- An array where *first element* is *not a string or a function*. In such case, `toDom` will return an array with `toDom` function applied to all its elements.
- An array where first element is a *string*. In such case:
    - First element will be the tag name of the DOM element.
    - For the rest of them:
        - If element is an `Array`, `HTMLElement` or a `Text`, then `toDom` will be applied and result will append.
        - If `typeof` element is `object` and none of above, then its enumerable properties will be append as tag attributes.
        - If `typeof` element is `function` which name starts with `$` symbol, it will be append as `EventListener`, where the event name will be the function name.
        - If `typeof` element is `function` which name does not start with `$` symbol, it will be called with the DOM element as argument.
        - In any other case, `toDom` will be applied and result will append.
- An array where first element is a *function*. In such case:
    - If a second argument is provided and it is a *number*, say `n`, the function will be called with `n` with a counter as an argument. Each time, `toDom` will be called with the return value.
- Any other case: structure will be returned without any modification.

### Atomic examples
Basic element:
```javascript
toDom(['p',{'class': 'highlight', 'id':'p1'},'Paragraph'])
```
will return a DOM object equivalent to
```html
<p class="highlight" id="p1">Paragraph</p>
```
Array of elements:
```javascript
toDom([['p','paragraph 1'],['p','paragraph 2']])
```
will return an array with DOM objects equivalent to
```html
<p>paragraph 1</p>
<p>paragraph 2</p>
```
This example can be recreated and extended with a loop, as follows:
```javascript
toDom([i => ['p','paragraph '+(i+1),{'style': 'color: rgb(0,0,'+25*i+')'}], 10])
```
will return an array with DOM objects equivalent to
```html
<p style="color: rgb(0,0,0)">paragraph 1</p>
<p style="color: rgb(0,0,25)">paragraph 2</p>
<p style="color: rgb(0,0,50)">paragraph 3</p>
<p style="color: rgb(0,0,75)">paragraph 4</p>
<p style="color: rgb(0,0,100)">paragraph 5</p>
<p style="color: rgb(0,0,125)">paragraph 6</p>
<p style="color: rgb(0,0,150)">paragraph 7</p>
<p style="color: rgb(0,0,175)">paragraph 8</p>
<p style="color: rgb(0,0,200)">paragraph 9</p>
<p style="color: rgb(0,0,225)">paragraph 10</p>
```

### Nested examples
```javascript
toDom(['p',[toDom('Click button to destroy this paragraph'),['button','Destroy',function $click() { this.parentNode.parentNode.removeChild(this.parentNode)}]]])
```

### Options
- `t` or `times`: function will be called the specified amount of times.
- `at` or `appendTo`: result of the function will be append to result.

### Example
```javascript
toDom(['li',['p','List item']],{t:10,at: toDom(['ul'],{at:'body'})})
```

```javascript
toDom([i => [['h2','List number '+ (i+1)],['ul',[j => ['li','ABCDEFGH'[i]+'. Element '+j],1,7]]],5],{at: 'body'})
```
Imagine we have some data like:
```javascript
const users = [
    {id: 1, name: 'John', age:19},
    {id: 2, name: 'George', age: 21},
    {id: 3, name: 'Mathiew', age: 34},
    {id: 4, name: 'Carl', age: 65},
    {id: 5, name: 'Lisa', age: 33},
    {id: 6, name: 'Abel', age: 37},
];

const columns = [
    {title: 'Id', key: 'id'},
    {title: 'Firstname', key: 'name'},
    {title: 'Age', key: 'age'},
];
```

Then:
```javascript

toDom(['table',
    ['thead',
        ['tr',
            [column => ['th',column.title,{'style':'background-color: black; color: white;'}], columns],
        ],
    ],
    ['tbody',
        [(user,i) => ['tr',
            [ column => ['td', user[column.key]], columns],
            {'style': (i%2 == 0) ? 'background-color: white; color: black;' : 'background-color: grey; color: black;'}
        ],
        users ]
    ],
],
{at:'body'})
```

Of course, we can easily sophisticate it. As example:

```javascript

const deleteUserById = (users,id) => {
    const index = users.findIndex( user => user.id === id)
    if (index >= 0) {
        users.splice(index,1)
    }
};

const Display = function (users,columns) {

    const display = this;
    
    display.table = null;

    display.generateTbody = function () {
        return toDom(['tbody',
                [(user,i) => [
                    ['tr',
                        [ column => ['td', user[column.key]], columns],
                        ['td',
                            ['button','Delete', function $click(event) { deleteUserById(users,user.id); display.regenerateTable()}]
                        ],
                        {'style': (i%2==0) ? 'background-color: white; color: black;' : 'background-color: grey; color: black;'}
                    ],
                ],
                users ]
            ]
        );
    }

    display.generateTable = function () {
        display.table = toDom(['table',
            ['thead',
                ['tr',
                    [column => ['th',column.title], columns],
                    ['th','Actions'],
                    {'style':'background-color: black; color: white;'}
                ],
            ],
            display.generateTbody()
        ])


        return display.table
        
    }

    display.regenerateTable = function () {
        const parent = display.table.parentNode
        parent.removeChild(display.table)
        display.generateTable()
        display.appendTo(parent)

    }

    display.appendTo = function (at) {
        return toDom(display.table,{at})
    }

};

const display = new Display(users,columns)
display.generateTable()
display.appendTo('body')


```
