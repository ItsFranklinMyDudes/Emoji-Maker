# Emoji-Maker

emoji-maker creates new emojis using base images

### Install emoji-maker with npm
```bash
  npm install emoji-maker@latest
```

### Usage/Examples

```javascript
const Make = require('emoji-maker')

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