# Lifter
_Lifter_ is a collection of ExtendScript low-level methods to work with Photoshop documents, layers, history states, filters and selections using ActionManager code. ActionManager code is more difficult to master than classic DOM, but can yield much higher performances and gives access to functionality that is otherwise unavailable from ExtendScript.

The library also includes polyfills for some of the most recent ECMAScript methods such as `forEach`, `bind`, etc. and an unit test library heavily based on [QUnit](http://qunitjs.com/).

## Caveats
_Lifter_ is based on a growing collection of methods that I put together while developing Photoshop scripts. As such, it does not aim to cover all the things that can be done using ActionManager nor with Photoshop DOM methods.

If you find the library useful, but can not find a specific method you need, or if you find a bug, please feel free to contribute to the source code.

## Basic Usage
Lifter assumes that all the actions are executed on the currently active item (being it a document, a layer, etc.) and provides, when possible, an expressive syntax based on methods concatenation:

```js
Lifter.layers.add('Layer 1').duplicate().masks.addLayerMask();
```

The example above creates a new layer named _Layer 1_, duplicates it and adds a layer mask to the duplicate. Much like you would expect as you would have done the same actions manually in Photoshop, the mask of the duplicated layer will be the item selected at the end of the operation.

The library is divided in self-contained modules that implement operations for various items such as documents, layers, history, filters and selections.

## Advanced Usage
A more advanded example using the `forEach` method to loop over the layer collection:

```js

var layers = [], nested = 0, type;
    
Lifter.layers.forEach(function (itemIndex, layerId)
{
    type = Lifter.layers.prop(layerId, 'type');

    // Parsed backwards (DOM style)
    switch (type)
    {
        case LayerType.SETSTART:
            if (nested === 1)
                layers[layers.length - 1].name = Lifter.layers.prop(layerId, 'name');

            nested--;
            break;

        case LayerType.CONTENT:
            if (nested === 0)
                layers.push({ id: layerId, name: '' });
            break;

        case LayerType.SETEND:
            if (nested === 0)
                layers.push({ id: layerId, name: '' });

            nested++;
            break;
    }
});
```
The code above will navigate all the layer stack returning the ids and names of all the root layers and layer sets. Based on my tests, even if more complicated than the equivalent DOM code, the code above is 16x faster on a document with ~600 layers.

## Documentation
No real documentation is available, but the source code is heavily commented and easy to read.

## Build
This project uses [Grunt](http://gruntjs.com/) for building/minifying. By default it builds standalone packages for each single module and a full version of the libray with all the modules included. Custom builds are supported, see `Gruntfile.js`.

## License
Copyright &copy; 2014 Francesco Camarlinghi

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at: http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.