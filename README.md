# Emoji-Maker

emoji-maker creates new emojis using base images

### Install emoji-maker with npm
```bash
npm install emoji-maker@latest
```

### Usage/Examples
How to use Make Class
```javascript
const { Maker } = require('emoji-maker')

const emoji = await new Maker()
    .addExtras(8) //maximum of different bases, 45
    .addBrows(6) //maximum of different Brows, 22
    .addEyes(4) //maximum of different bases, 63
    .addMouths(20) //maximum of different bases, 70
    .addBase(1) //maximum of different bases, 61
    .build() //build the image using the selected bases
console.log(emoji);

/*
Output:
{
    image: {
        buffer: <buffer bytes>
        url: 'data:image/png;base64'
    },
    parts: { 
        bases: 1, 
        eyes: 4, 
        brows: 6, 
        mouths: 20, 
        extras: 8 
    }
}
*/
```
this is the emoji of that combo
<br>
<img src="https://imgur.com/5cxaco1.png">

How to use List Class
```js
const { List } = require('emoji-maker')
const categoryImages = await new List().displayImage()
console.log(categoryImages); 
/*
Output:
{
    bases: {
        buffer: <buffer bytes>
        url: 'data:image/png;base64'
    },
    eyes: {
        buffer: <buffer bytes>
        url: 'data:image/png;base64'
    },
    brows: {
        buffer: <buffer bytes>
        url: 'data:image/png;base64'
    },
    mouths: {
        buffer: <buffer bytes>
        url: 'data:image/png;base64'
    },
    extras: {
        buffer: <buffer bytes>
        url: 'data:image/png;base64'
    }
}
*/

console.log(categoryImages.mouths);
/*
Output:
mouths: {
    buffer: <buffer bytes>
    url: 'data:image/png;base64'
}
*/
```
this is what the mouths image looks like
<br>
<img src="https://imgur.com/oTvBJWe.png">